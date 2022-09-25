import { computed, ref } from 'vue';
import type { Layer, Piece } from './state';

let activeLayer = ref<Layer | null>(null);
let activePiece = ref<Piece | null>(null);
let direction = ref<'forward'|'backward'|'none'>('none');

const focus = computed( () => {
	if ( activePiece.value !== null ) return 'piece';
	if ( activeLayer.value !== null ) return 'layer';
	return 'collection';
} );

export default function useAppNavigation() {

	function goto(layer: Layer|null = null, piece: Piece|null = null) {
		// decide which direction we're navigating
		direction.value = ( layer !== null && activeLayer.value === null || piece !== null && activePiece.value === null )
			? 'forward'
			: 'backward';

		if ( layer === null ) {
			activeLayer.value = activePiece.value = null;
		} else {
			activeLayer.value = layer;
		}
		activePiece.value = piece ?? null;
	}

	return { focus, activeLayer, activePiece, goto, direction };
}
