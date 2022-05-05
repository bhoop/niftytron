import { isRef, ref, unref, watchEffect } from "vue";
import type { Ref } from "vue";
import type { Favorite, FavoriteBag, Image, Layer, Piece } from "../state";
import hash from "../hash";
import uid from "../uid";

type ImageMap = Map< number, Image >;
interface Status {
	running: boolean;
	progress: number;
	message: string;
}

type Limit = number | false;

export interface WorkerData {
	layers: WorkerLayer[],
	size: number,
	favorites: FavoriteBag,
}
export interface WorkerLayer {
	id: string;
	tags?: string[];
	blockedTags?: string[];
	required?: true;
	excludeFromKey?: true;
	limit?: number;
	pieces: WorkerPiece[];
};
export interface WorkerPiece {
	id: string;
	tags?: string[];
	blockedTags?: string[];
	limit?: number;
};
export interface WorkerImage {
	number: number;
	key: number;
	attributes: string[];
	favorite: string | false;
}
export type WorkerMessage = { type: 'update', images: WorkerImage[] };

export function useCollectionGenerator() {

	const genId = ref(0);
	const images = ref<ImageMap>( new Map() );
	const status = ref<Status>( { running: false, progress: 0, message: '' } );
	const worker = ref<Worker>();

	async function generateCollection( args: { layers: Layer[], favorites: FavoriteBag, size: number } ) {
		if ( worker.value ) {
			worker.value.terminate();
		}
		status.value.running = true;
		status.value.progress = 0;
		if ( args.size === 0 ) return;
		// reset state
		images.value = new Map();
		// create a map of Piece IDs
		const pieceMap: Record<string, {layer:Layer, piece:Piece}> = {};
		const workerData: WorkerData = {
			layers: [],
			size: args.size,
			favorites: args.favorites,
		};
		// format layers data
		for ( const layer of args.layers ) {
			const wlayer: WorkerLayer = { id: layer.id, pieces: [] };
			if (layer.required) wlayer.required = true;
			if (layer.excludeFromKey) wlayer.excludeFromKey = true;
			if ( layer.tags.length > 0 ) wlayer.tags = layer.tags;
			if ( layer.blockedTags.length > 0 ) wlayer.blockedTags = layer.blockedTags;
			if ( layer.limit !== false ) wlayer.limit = layer.limit;
			for ( const piece of layer.pieces ) {
				const wpiece: WorkerPiece = { id: piece.id };
				if ( piece.tags.length > 0 ) wpiece.tags = piece.tags;
				if ( piece.blockedTags.length > 0 ) wpiece.blockedTags = piece.blockedTags;
				if ( piece.limit !== false ) wpiece.limit = piece.limit;
				pieceMap[ piece.id ] = { layer, piece };
				wlayer.pieces.push( wpiece );
			}
			workerData.layers.push( wlayer );
		}
		// instantiate the worker
		worker.value = new Worker(
			new URL("../workers/collection-generator.ts", import.meta.url),
			{
				type: "module",
			}
		);
		worker.value.onmessage = (ev: MessageEvent<WorkerMessage>) => {
			if ( ev.data.type === 'update' ) {
				console.log('receive', ev.data.images.length, 'images');
				const newImages: Map<number, Image> = new Map();
				for (const newImage of ev.data.images) {
					const attributes = newImage.attributes.reduce((map, pieceId) => {
						const { layer, piece } = pieceMap[pieceId]!;
						map.set(layer, piece);
						return map;
					}, new Map());
					const image: Image = {
						id: uid(),
						...newImage,
						attributes,
					};
					if ( newImages.has( image.key ) ) {
						console.warn('IMAGE ALREADY EXISTS!', newImages.get(image.key), image);
					}
					newImages.set(image.key, image);
				}
				console.log('converted', newImages.size, 'images');
				// merge newImages into images
				images.value = new Map([...images.value, ...newImages]);
				console.log('wrote', images.value.size, 'images');
				status.value.progress = images.value.size / args.size;
				if (images.value.size === args.size) {
					status.value.running = false;
					console.log("generation finished.");
					worker.value!.terminate();
				}
			}
		};
		// start the worker
		worker.value.postMessage( JSON.stringify(workerData) );
	}

	// when layers or favorites change, regenerate stuff
	// watchEffect( () => {
	// 	generateCollection( layersSource, favoriteSource, size );
	// } );

	return { status, images, regenerate: generateCollection };
}
