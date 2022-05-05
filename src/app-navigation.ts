import { computed, ref } from 'vue';
import type { Layer, Piece } from './state';

let activeLayer = ref<Layer | null>(null);
let activePiece = ref<Piece | null>(null);

const focus = computed( () => {
	if ( activePiece.value !== null ) return 'piece';
	if ( activeLayer.value !== null ) return 'layer';
	return 'collection';
} );

export default function useAppNavigation() {

	function goto(layer: Layer|null = null, piece: Piece|null = null) {
		if ( layer === null ) {
			activeLayer.value = activePiece.value = null;
		} else {
			activeLayer.value = layer;
		}
		activePiece.value = piece ?? null;
	}

	return { focus, activeLayer, activePiece, goto };
}
