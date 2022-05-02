import type { Layer, Piece, Image, Favorite } from "../state";
import { acceptHMRUpdate, defineStore } from "pinia";
import { useDataStore } from "./data";
import { computed, ref, unref, watch, watchEffect } from "vue";

export const useCollectionStore = defineStore("collection", () => {
	const size = ref( 1000 );
	const data = useDataStore();
	const regenerationId = ref(0);
	const finishedRegenerationId = ref(0);
	const favorites = ref<Favorite[]>([]);
	const imageset = ref<Map<string, Image>>(new Map() );
	const regenState = ref<{ layer: Layer }[]>([]);
	const actualSize = computed( () => Math.min( size.value, data.combinationCount ) );
	const dataKey = ref('');
	const generating = ref<false | { progress: number; message: string }>(false);
	const downloading = ref({ running: false, destination: '', done:0, total:0 });

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
		generating.value = { progress: 0.05, message: "preparing to start..." };
		// generate IDs
		const maxId = size.value;
		const ids: number[] = [];
		for (let i = 1; i <= maxId; i++) {
			ids.splice(Math.floor( Math.random() * ids.length ), 0, i);
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
			generating.value.progress = imageset.value.size / maxId;
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
						// check to see if this layer should be used
						const probability = Number( rs.layer.probability );
						// if probability is out, skip this layer.
						if ( probability < 100 && 100 * Math.random() > probability ) continue;
						let piece =
							rs.layer.pieces[
								Math.floor(Math.random() * rs.layer.pieces.length)
							];
						attributes.set(rs.layer, piece);
					}
					const image = makeImage( ids.pop()!, attributes, false );
					imageset.value.set( image.key, image );
					if ( generating.value ) generating.value.progress = imageset.value.size / maxId;
				}
				setTimeout(resolve, 0);
			});
		}
		finishedRegenerationId.value = currentRegenerationId;
		generating.value = false;
		if (regenerationId.value === currentRegenerationId) {
			console.log("done!");
		} else {
			console.log("aborted regeneration!");
		}
	}

	// when the collection size changes, regenerate the collection
	watch(size, (newSize, oldSize) => {
		let actualNewSize = newSize ?? data.combinationCount;
		if (oldSize === null || newSize === null || actualNewSize > oldSize) {
			// if `newSize` is larger than our current size, regenerate!
			regenerate();
		}
	});

	// when the data sources change, regenerate the collection
	watchEffect( () => {
		if ( dataKey.value !== data.key ) {
			console.log('regenerating because data key changed', dataKey.value, '=>', data.key );
			dataKey.value = data.key;
			regenerate();
		}
	} );


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

	function getImageFavorite( attributes: Image["attributes"] ) {
		const obj: Record<string, string> = {};
		for (const [layer, piece] of attributes) {
			if (piece) obj[layer.name] = piece.name;
		}
		return obj;
	}

	function toggleImageFavorite( image: Image ) {
		if ( image.favorite ) {
			favorites.value = favorites.value.filter( fav => image.favorite !== fav );
			image.favorite = false;
		} else {
			const obj = getImageFavorite( image.attributes );
			favorites.value.push( obj )
			image.favorite = obj;
		}
	}

	function updateFavorite(image: Image, layer: Layer, piece: Piece | null) {
		// remove the old key
		imageset.value.delete(image.key);
		favorites.value = favorites.value.filter( fav => image.favorite !== fav );
		// add the new image
		const map: Image["attributes"] = new Map(image.attributes);
		if (piece === null) map.delete(layer);
		else map.set(layer, piece);
		const favoriteObject = getImageFavorite( map );
		const newImage = makeImage(image.id, map, favoriteObject);
		imageset.value.set( newImage.key, newImage );
		favorites.value.push( favoriteObject );
	}

	async function download() {
		const imgdataCache = new Map();
		const imgdata = async (layer: Layer, piece: Piece) => {
			const key = `${layer.name}//${piece.name}`;
			if ( ! imgdataCache.has( key ) ) {
				const image = new Image();
				await new Promise( resolve => {
					image.onload = () => resolve( image );
					image.src = piece.src;
				} );
				imgdataCache.set(key, image);
			}
			return imgdataCache.get( key );
		};

		try {
			const dirHandle = await ( window as any ).showDirectoryPicker({
				writeable: true,
			});
			console.log("gotDirHandle", dirHandle);
			downloading.value = { running: true, destination: dirHandle.name, done:0, total: unref( size ) };
			let index = 0;
			let chunkSize = 10;
			let canvas = document.createElement('canvas');
			canvas.width = 1000;
			canvas.height = 1000;
			let context = canvas.getContext('2d')!;
			while ( downloading.value.running === true && downloading.value.done < size.value ) {
				// generate images in chunks so we don't lock up the main thread
				for ( let i = 0; i < chunkSize; i++ ) {
					const image = images.value[index + i];
					// clear the canvas
					context.clearRect(0, 0, canvas.width, canvas.height);
					// stack layers onto the canvas
					for ( const layer of data.layers ) {
						const piece = image.attributes.get( layer );
						if ( ! piece ) continue;
						const img = await imgdata( layer, piece );
						context.drawImage( img, 0, 0, 1000, 1000 );
					}
					// write the image to a file
					const filename = image.id + '.png';
					const fileHandle = await dirHandle.getFileHandle( filename, { create: true } );
					const writable = await fileHandle.createWritable({keepExistingData:false});
					const canvasBlob = await new Promise( resolve => canvas.toBlob( resolve, 'image/png', 1 ) );
					await writable.write( canvasBlob );
					await writable.close();

					downloading.value.done++;
				}
				index += chunkSize;
			}
			downloading.value.running = false;
		} catch( err: any ) {
			alert( 'An error occured (see console)');
			console.error( err );
		}
	}

	function stopDownload() {
		downloading.value.running = false;
	}

	return { images, size, isGenerating, generating, regenerate, changeSize, getImageKey, toggleImageFavorite, updateFavorite, download, downloading, stopDownload };
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useCollectionStore, import.meta.hot));
}
