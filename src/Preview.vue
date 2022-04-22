<script setup lang="ts">import { computed, unref } from 'vue';
import { type Image, type Attribute, useDataStore, type Layer } from './state';

const props = defineProps<{ image: Image, focusLayer?: Layer|null }>();
const data  = useDataStore();

const layers = computed( () => {
	return data.layers
		.map( layer => props.image.attributes.has( layer ) ? { layer, piece: props.image.attributes.get( layer ) } : null )
		.filter( check => check !== null );
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
