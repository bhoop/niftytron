import { ref } from 'vue';
import type { Layer, Piece } from './state';

let activeLayer = ref<Layer | null>(null);
let activePiece = ref<Piece | null>(null);

export default function useAppNavigation() {

	function goto(layer: Layer|null = null, piece: Piece|null = null) {
		if ( layer === null ) {
			activeLayer.value = activePiece.value = null;
		} else {
			activeLayer.value = layer;
		}
		activePiece.value = piece ?? null;
	}

	return { activeLayer, activePiece, goto };
}
