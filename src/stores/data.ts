import type { Layer, Piece, Image } from "../state";
import { acceptHMRUpdate, defineStore } from "pinia";

interface DataStoreState {
	layers: Layer[];
}

export const useDataStore = defineStore("data", {
	state: () => ({ layers: [] }),
	getters: {
		combinationCount(state: DataStoreState) {
			let count = state.layers.length === 0
				? 0
				: state.layers.reduce(
				(sum, layer) =>
					layer.pieces.length > 0 ? sum * layer.pieces.length : sum,
				1
			);
			console.log( 'combinationCount=', count );
			return count;
		},
	},
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDataStore, import.meta.hot));
}
