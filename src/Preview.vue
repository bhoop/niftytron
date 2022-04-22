<script setup lang="ts">import { computed, unref } from 'vue';
import { type Image, type Attribute, useDataStore, type Layer, type Piece } from './state';

const props = defineProps<{ image: Image, focusLayer?: Layer|null }>();
const data  = useDataStore();

const layers = computed( () => {
	const arr: Attribute[] = [];
	for( const layer of data.layers ) {
		const piece = props.image.attributes.get( layer );
		if ( piece ) arr.push( { layer, piece } );
	}
	return arr;
} );

// const styleBgImage = computed( () => {
// 	return unref(layers).map( attr => `url('${attr.piece.src}')` ).join(',');
// } );

</script>
<template>
	<div class="relative bg-cover bg-center w-full aspect-square">
		<template v-if="!image">LOADING</template>
		<template v-else-if="image">
			<img
				v-for="{ layer, piece } in layers"
				:src="piece.src"
				class="absolute left-0 top-0 w-full transition-opacity duration-500 cursor-pointer"
				:class="[focusLayer && focusLayer !== layer && 'opacity-30']"/>
		</template>
	</div>
</template>
