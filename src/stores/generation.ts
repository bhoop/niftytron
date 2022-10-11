import type { Layer, Piece, Image, Favorite, FavoriteBag } from "../state";
import { acceptHMRUpdate, defineStore } from "pinia";
import { useDataStore } from "./data";
import { computed, ref, unref, watch, watchEffect } from "vue";
import uid from "../uid";
import { createKey } from "../keygen";

type ImageMap = Map<number, Image>;
interface Status {
	running: boolean;
	progress: number;
	message: string;
}

type Limit = number | false;

export interface WorkerData {
	layers: WorkerLayer[];
	size: number;
	favorites: FavoriteBag;
}
export interface WorkerLayer {
	id: string;
	tags?: string[];
	blockedTags?: string[];
	required?: true;
	excludeFromKey?: true;
	limit?: number;
	pieces: WorkerPiece[];
}
export interface WorkerPiece {
	id: string;
	tags?: string[];
	blockedTags?: string[];
	limit?: number;
}
export interface WorkerImage {
	number: number;
	key: number;
	attributes: string[];
	favorite: string | false;
}
export type WorkerMessage =
	| { type: "update"; images: WorkerImage[] }
	| { type: "finish" };

export const useGenerationStore = defineStore("generation", () => {
	let state = ref<{size:number, layers:Layer[]}>({
		size: 100,
		layers: []
	});
	let favorites = ref<FavoriteBag>({});
	let images = ref<Image[]>([]);
	let isGenerating = ref(false);
	let progress = ref(0);
	const status = ref<Status>({ running: false, progress: 0, message: "" });
	const worker = ref<Worker>();

	let key = computed(() => createKey(state.value.size, state.value.layers));
	function generate( size: number, layers: Layer[] ) {
		state.value = { size, layers };
		images.value = Array( size ).fill( null );
		isGenerating.value = true;
		progress.value = 0;
		// regenerate
		if (worker.value) {
			worker.value.terminate();
		}
		if (size === 0) {
			isGenerating.value = false;
			return;
		}
		// create a map of Piece IDs
		const pieceMap: Record<string, { layer: Layer; piece: Piece }> = {};
		const workerData: WorkerData = {
			layers: [],
			size,
			favorites: favorites.value,
		};
		// format layers data
		for (const layer of layers) {
			const wlayer: WorkerLayer = { id: layer.id, pieces: [] };
			if (layer.required) wlayer.required = true;
			if (layer.excludeFromKey) wlayer.excludeFromKey = true;
			if (layer.tags.length > 0) wlayer.tags = layer.tags;
			if (layer.blockedTags.length > 0)
				wlayer.blockedTags = layer.blockedTags;
			if (layer.limit !== false) wlayer.limit = layer.limit;
			for (const piece of layer.pieces) {
				const wpiece: WorkerPiece = { id: piece.id };
				if (piece.tags.length > 0) wpiece.tags = piece.tags;
				if (piece.blockedTags.length > 0)
					wpiece.blockedTags = piece.blockedTags;
				if (piece.limit !== false) wpiece.limit = piece.limit;
				pieceMap[piece.id] = { layer, piece };
				wlayer.pieces.push(wpiece);
			}
			workerData.layers.push(wlayer);
		}
		// instantiate the worker
		worker.value = new Worker(
			new URL("../workers/collection-generator.ts", import.meta.url),
			{
				type: "module",
			}
		);
		worker.value.onmessage = (ev: MessageEvent<WorkerMessage>) => {
			switch (ev.data.type) {
				case "update":
					const newImages: Map<number, Image> = new Map();
					for (const newImage of ev.data.images) {
						const attributes = newImage.attributes.reduce(
							(map, pieceId) => {
								const { layer, piece } = pieceMap[pieceId]!;
								map.set(layer, piece);
								return map;
							},
							new Map()
						);
						const image: Image = {
							id: uid(),
							...newImage,
							attributes,
						};
						if (newImages.has(image.key)) {
							console.warn(
								"IMAGE ALREADY EXISTS!",
								newImages.get(image.key),
								image
							);
						}
						newImages.set(image.key, image);
					}
					// merge newImages into images
					images.value = [
						...images.value.slice(0, progress.value ),
						...newImages.values(),
						...images.value.slice( progress.value + newImages.size ),
					];
					progress.value += newImages.size;
					break;

				case "finish":
					status.value.running = false;
					worker.value!.terminate();
			}
		};
		// start the worker
		worker.value.postMessage(JSON.stringify(workerData));

	}

	const counts = computed(() => {
		console.log('compute gen.counts');
		const map: Record<string, number> = {};
		const incr = (id: string) => {
			if (!map[id]) map[id] = 1;
			else map[id]++;
		};
		for (const image of images.value) {
			for (const [layer, piece] of image.attributes) {
				incr(layer.id);
				if (piece) incr(piece.id);
			}
		}
		return map;
	});
	console.log('WHY ARE YOU WNY', counts.value);

	function getImageFavorite(attributes: Image["attributes"]) {
		const arr: string[] = [];
		for (const [layer, piece] of attributes) {
			if (piece) arr.push(piece.id);
		}
		return arr;
	}

	function toggleImageFavorite(image: Image) {
		if (image.favorite) {
			delete favorites.value[image.favorite];
			image.favorite = false;
		} else {
			const key = uid();
			const obj = getImageFavorite(image.attributes);
			favorites.value[key] = obj;
			image.favorite = key;
		}
	}

	function updateFavorite(image: Image, layer: Layer, piece: Piece | null) {
		if(!(image.favorite as string in favorites.value)) return;
		// update
		if (piece === null) {
			image.attributes.delete(layer);
		} else {
			image.attributes.set(layer, piece);
		}
		favorites.value[image.favorite as string] = getImageFavorite(
			image.attributes
		);
	}

	const size = computed( () => state.value.size );
	return {
		size,
		key,
		images,
		isGenerating,
		generate,
		toggleImageFavorite,
		updateFavorite,
		counts
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useGenerationStore, import.meta.hot));
}
