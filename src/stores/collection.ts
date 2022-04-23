import type { Layer, Piece, Image, Favorite } from "../state";
import { acceptHMRUpdate, defineStore } from "pinia";
import { useDataStore } from "./data";
import { computed, ref, watch } from "vue";

export const useCollectionStore = defineStore("collection", () => {
	const size = ref( 1000 );
	const data = useDataStore();
	const regenerationId = ref(0);
	const finishedRegenerationId = ref(0);
	const favorites = ref<Favorite[]>([]);
	const imageset = ref<Map<string, Image>>(new Map() );
	const regenState = ref<{ layer: Layer }[]>([]);
	const actualSize = computed( () => Math.min( size.value, data.combinationCount ) );

	const images = computed(() => {
		let arr = [...imageset.value.values()].slice(0, actualSize.value );
		if ( arr.length < actualSize.value ) arr = arr.concat( new Array( actualSize.value - arr.length ).fill( null ) );
		arr.sort( ( a, b ) => {
			if ( a === null && b !== null ) return 1;
			if ( a !== null && b === null ) return -1;
			if ( a === null && b === null ) return 0;
			if ( a.favorite !== b.favorite ) return a.favorite ? -1 : 1;
			return 0;
		} );
		return arr;
	});

	const isGenerating = computed( () => regenerationId.value !== finishedRegenerationId.value );

	const regenerate = async () => {
		regenerationId.value++;
		console.log("start regeneration #", regenerationId.value);
		// generate IDs
		const ids: number[] = [];
		const maxId = size.value;
		for (let i = 1; i <= maxId; i++) {
			ids.push(i);
		}
		// reset state
		const currentRegenerationId = regenerationId.value;
		imageset.value = new Map();
		regenState.value = data.layers
			.map((layer) => ({ layer }))
			.filter((r) => r.layer.pieces.length > 0);

		// first add all of the favorites
		const layerLookup: { [key:string]: Layer } = {};
		const pieceLookup: { [key:string]: Piece } = {};
		for ( const l of data.layers ) {
			layerLookup[ l.name ] = l;
			for ( const p of l.pieces ) pieceLookup[ `${l.name}:${p.name}`] = p;
		}
		for ( const fav of favorites.value ) {
			const map: Image["attributes"] = new Map();
			for ( const layerName in fav ) {
				const layer = layerLookup[ layerName ];
				const piece = pieceLookup[ layerName+':'+fav[layerName] ];
				if ( layer && piece ) {
					map.set( layer, piece );
				}
			}
			const image = makeImage( ids.pop()!, map, fav );
			imageset.value.set( image.key, image );
		}
		// start randomly generating images
		while (
			regenerationId.value === currentRegenerationId &&
			imageset.value.size < maxId
		) {
			await new Promise((resolve) => {
				// generate 100 images at a time so we don't lock up the browser
				let blockers: Set<string> = new Set();
				for (let i = 0; i < 100; i++) {
					// add an attribute for each layer
					let attributes: Map<Layer, Piece> = new Map();
					for (let rs of regenState.value) {
						let piece =
							rs.layer.pieces[
								Math.floor(Math.random() * rs.layer.pieces.length)
							];
						attributes.set(rs.layer, piece);
					}
					const image = makeImage( ids.pop()!, attributes, false );
					imageset.value.set( image.key, image );
				}
				setTimeout(resolve, 0);
			});
		}
		finishedRegenerationId.value = currentRegenerationId;
		if (regenerationId.value === currentRegenerationId) {
			console.log("done!");
		} else {
			console.log("aborted regeneration!");
		}
	}

	regenerate();

	// when the collection size changes, regenerate the collection
	watch(size, (newSize, oldSize) => {
		let actualNewSize = newSize ?? data.combinationCount;
		if (oldSize === null || newSize === null || actualNewSize > oldSize) {
			// if `newSize` is larger than our current size, regenerate!
			regenerate();
		}
	});

	function changeSize(newSize: number ) {
		const num = Number( newSize );
		if ( num > 0 ) {
			size.value = num;
		}
	}

	function getImageKey( attributes: Image["attributes"] ) {
		let arr: string[] = [];
		for ( const [ layer, piece ] of attributes ) {
			if ( piece?.name ) arr.push( layer.name+':'+piece.name );
		}
		arr.sort( (a,b) => a.localeCompare(b) );
		return arr.join('/');
	}

	function makeImage( id: number, attributes: Image["attributes"], favorite: Favorite|false ): Image {
		const key = getImageKey( attributes );
		const search: string[] = [];
		for ( const [ layer, piece ] of attributes ) {
			search.push( `layer:${layer.name}` );
			if ( piece ) search.push( `piece:${piece.name}` );
		}

		return {
			id,
			key,
			attributes,
			search: search.join(' '),
			favorite,
		};
	}

	function toggleImageFavorite( image: Image ) {
		if ( image.favorite ) {
			favorites.value = favorites.value.filter( fav => image.favorite !== fav );
			image.favorite = false;
		} else {
			const obj: Record<string, string> = {};
			for ( const [ layer, piece ] of image.attributes ) {
				if ( piece ) obj[ layer.name ] = piece.name;
			}

			favorites.value.push( obj )
			image.favorite = obj;
		}
	}

	return { images, size, isGenerating, regenerate, changeSize, getImageKey, toggleImageFavorite };
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useCollectionStore, import.meta.hot));
}
