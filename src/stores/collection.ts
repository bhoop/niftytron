import type { Layer, Piece, Image } from "../state";
import { acceptHMRUpdate, defineStore } from "pinia";
import { useDataStore } from "./data";
import { computed, ref, watch } from "vue";

export const useCollectionStore = defineStore("collection", () => {
	const size = ref<number | null>(null);
	const data = useDataStore();
	const regenerationId = ref(0);
	const imageset = ref<Map<number, Image>>(new Map());
	const targetSize = ref(0);
	const regenState = ref<{ layer: Layer }[]>([]);

	const images = computed(() => {
		let arr = [...imageset.value.values()].slice(0, targetSize.value);
		return arr.length < targetSize.value
			? arr.concat(new Array(targetSize.value - arr.length).fill(null))
			: arr;
	});

	const regenerate = async () => {
		regenerationId.value++;
		targetSize.value = size.value ?? data.combinationCount;
		console.log("start regeneration #", regenerationId.value);
		// generate IDs
		const ids: number[] = [];
		const maxId = size.value ?? data.combinationCount;
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

	// when the max number of combinations change (usually because pieces have been added),
	// regenerate the collection.
	watch(
		data,
		({ combinationCount: newCount }, { combinationCount: oldCount }) => {
			if (newCount !== images.value.length) {
			console.log("REGENERATE!");
				regenerate();
			} else {
				console.log(newCount, '===', oldCount);
			}
		}
	);

	function changeSize(newSize: number | string | null) {
		if (newSize === "" || newSize === null) {
			size.value = null;
		} else {
			let num = Number(newSize);
			if (!Number.isInteger(num) || num < 1) {
				let v = size.value;
				size.value = 1;
				size.value = v;
			} else if (num > data.combinationCount) {
				size.value = data.combinationCount;
			} else {
				size.value = num;
			}
		}
	}

	return { images, size, regenerate, changeSize };
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useCollectionStore, import.meta.hot));
}
