import type { Layer, Piece, Image } from "../state";
import { acceptHMRUpdate, defineStore } from "pinia";
import { useDataStore } from "./data";
import { computed, ref, watch } from "vue";

export const useCollectionStore = defineStore("collection", () => {
	const size = ref( 1000 );
	const data = useDataStore();
	const regenerationId = ref(0);
	const finishedRegenerationId = ref(0);
	const imageset = ref<Map<number, Image>>(new Map() );
	const regenState = ref<{ layer: Layer }[]>([]);
	const actualSize = computed( () => Math.min( size.value, data.combinationCount ) );

	const images = computed(() => {
		let arr = [...imageset.value.values()].slice(0, actualSize.value );
		return arr.length < actualSize.value
			? arr.concat(new Array(actualSize.value - arr.length).fill(null))
			: arr;
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
		imageset.value = new Map();
		regenState.value = data.layers
			.map((layer) => ({ layer }))
			.filter((r) => r.layer.pieces.length > 0);

		// start generating images
		let currentRegenerationId = regenerationId.value;
		while (
			regenerationId.value === currentRegenerationId &&
			imageset.value.size < maxId
		) {
			await new Promise((resolve) => {
				// generate 100 images
				let blockers: Set<string> = new Set();
				for (let i = 0; i < 100; i++) {
					let search: string[] = [];
					// add an attribute for each layer
					let attributes: Map<Layer, Piece> = new Map();
					for (let rs of regenState.value) {
						let piece =
							rs.layer.pieces[
								Math.floor(Math.random() * rs.layer.pieces.length)
							];
						attributes.set(rs.layer, piece);
						search.push(`${rs.layer.name} ${piece.name}`);
					}
					let id = ids.pop()!;
					imageset.value.set(id, {
						id,
						attributes,
						search: search.join(" "),
					});
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
		console.log("heywhy", newSize, num);
		if ( num > 0 ) {
			console.warn('changesize!');
			size.value = num;
		}
	}

	return { images, size, isGenerating, regenerate, changeSize };
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useCollectionStore, import.meta.hot));
}
