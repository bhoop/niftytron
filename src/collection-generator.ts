
import { computed, ref, watch, watchEffect } from 'vue';
import type { Layer, Piece, Image } from './state';

export default function useCollectionGenerator( layers: Layer[], size: number ) {
	const imageset = ref< Map<string, Image> >( new Map() );
	const numGenerated = ref<number>(-1);
	const done = ref<boolean>(false);
	const working = ref<boolean>(false);

	function generateMore() {
		// generate up to 100 images
		// add them to the imageset
		console.log( 'generate more images!' );
	}

	watch( numGenerated, () => {
		if ( numGenerated.value < size ) generateMore();
	} );

	const generate = () => {
		imageset.value = new Map();
		numGenerated.value = 0;
		done.value = false;
		working.value = true;
	};

	const images = computed( () => {
		let arr = [...imageset.value.values()];
		if ( arr.length < size ) arr.concat( new Array( size - arr.length ).fill( null ) );
	} );

	const stop = () => {
		done.value = true;
	}
	return { generate, images, stop, done, working: !done };
}
