import type { Layer, Piece, Image } from "../state";
import uid from "../uid";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref, watch, watchEffect } from "vue";

const numFormatter = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1,
});

export const useDataStore = defineStore('data', () => {
	const layers = ref<Layer[]>([]);
	const uploading = ref<false|{progress:number, message:string}>(false);

	const combinationCount = computed( () => {
		let count =
			layers.value.length === 0
				? 0
				: layers.value.reduce(
						(sum, layer) =>
							layer.pieces.length > 0
								? sum * layer.pieces.length
								: sum,
						1
					);
		return count;
	} );

	const combinationCountAbbr = computed( () => numFormatter.format( combinationCount.value ).toLowerCase() );

	function generateKeyFromLayers() {
		let lArr = [...layers.value];
		lArr.sort( (a,b) => a.id.localeCompare( b.id ) );
		return lArr.map( layer => {
			return [
				layer.required ? 1 : 0,
				layer.limit || 'x',
				layer.tags.join('|'),
				layer.blockedTags.join('|'),
				layer.pieces.map( piece => {
					return [
						piece.limit || 'x',
						piece.tags.join('|'),
						piece.blockedTags.join('|'),
					].join(':');
				}).join(':'),
			].join(":");
		} ).join( '/' );
	}
	const key = ref(generateKeyFromLayers());
	const keyTimer = ref(0);
	watch(layers, () => {
		console.log('layers change!');
		clearTimeout(keyTimer.value);
		keyTimer.value = setTimeout( ()=> {
			key.value = generateKeyFromLayers();
		}, 1000 );
	});

	const upload = async ( input: File[]|FileList|null, forceLayer?: Layer, forcePiece?: Piece ) => {
		let files: File[] = [];
		if ( input === null ) return;
		else if ( input instanceof FileList ) files = Array.from( input );
		else files = input;

		let i = 0;
		uploading.value = { progress: 0.05, message: 'preparing to start...' };
		for (const file of files) {
			uploading.value.message = file.name;
			let sources: { src: string; preview: string } = await new Promise(
				(resolve) => {
					let reader = new FileReader();
					reader.onload = (fileEvent) => {
						let src = fileEvent.target!.result as string;
						// resize the image to small stuff
						let img = document.createElement("img");
						img.onload = () => {
							let canvas = document.createElement("canvas");
							canvas.width = 240;
							canvas.height = 240;
							canvas.getContext("2d")?.drawImage(img, 0, 0, 240, 240);
							const preview = canvas.toDataURL(file.type);
							resolve({ src, preview });
						};
						img.src = src;
					};
					reader.readAsDataURL(file);
				}
			);
			let [layerName, pieceName] = file.name
				.replace(/\.png$/, "")
				.split(/_+\s*/, 2);
			layerName = layerName[0].toUpperCase() + layerName.substring(1);
			pieceName = pieceName[0].toUpperCase() + pieceName.substring(1);
			// add a new layer or update an existing layer
			let layer: Layer | undefined = forceLayer;
			if ( ! layer ) {
				// we aren't forcing a layer, so check to see if there's an existing one with the same name
				layer = layers.value.find( l => l.name.toLowerCase() === layerName.toLowerCase() );
				// if we didn't find an existing matching one, create one
				if ( ! layer ) {
					layer = { id: uid(), limit: false, required: false, name: layerName, pieces: [], tags: [], blockedTags: [] };
					layers.value.push( layer );
				}
			}
			// add a new piece or update an existing piece
			let piece: Piece | undefined = forcePiece;
			if ( ! piece ) {
				// we aren't forcing a piece, so check to see if there's an existing one with the same name
				piece = layer.pieces.find( p => p.name.toLowerCase() === pieceName.toLowerCase() );
				// if we didn't find an existing piece, create a new one
				if ( ! piece ) {
					layer.pieces.push( { id: uid(), limit: false, name: pieceName, tags: [], blockedTags: [], ...sources } );
				}
			}
			// update progress
			uploading.value.progress = ++i / files.length;
		}
		uploading.value = false;
	}

	return { key, layers, uploading, combinationCount, combinationCountAbbr, upload };
} );

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDataStore, import.meta.hot));
}
