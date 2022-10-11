import type { Layer, Piece, Image, Favorite, FavoriteBag } from "../state";
import { acceptHMRUpdate, defineStore } from "pinia";
import { useDataStore } from "./data";
import { computed, ref, unref, watch, watchEffect } from "vue";
import uid from "../uid";
import { createKey } from "../keygen";
import { useGenerationStore } from './generation';

export const useCollectionStore = defineStore("collection", () => {
	const size = ref(1000);
	const data = useDataStore();
	const favorites = ref<FavoriteBag>({});
	const downloading = ref({
		running: false,
		destination: "",
		done: 0,
		total: 0,
	});
	const prefix = ref('Skull #');
	const name = ref('Yo Skulls');
	const family = ref('');
	const symbol = ref('');
	const description = ref('');
	const externalUrl = ref('');
	const sellerFeeBasisPoints = ref(0);
	const creators = ref<{address:string, share:number}[]>([]);

	const collectionKey = computed( () => {
		return `${size.value}:${data.key}`;
	});

	function changeSize(newSize: number) {
		const num = Number(newSize);
		if (num > 0) {
			size.value = num;
		}
	}

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
		// update
		if ( piece === null ) {
			image.attributes.delete( layer );
		} else {
			image.attributes.set( layer, piece );
		}
		favorites.value[ image.favorite as string ] = getImageFavorite( image.attributes );
	}

	let key = computed( () => createKey( size.value, data.layers ) );
	return {
		prefix,
		symbol,
		name,
		family,
		description,
		externalUrl,
		sellerFeeBasisPoints,
		creators,
		size,
		changeSize,
		toggleImageFavorite,
		updateFavorite,
		key,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useCollectionStore, import.meta.hot));
}
