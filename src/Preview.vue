<script setup lang="ts">import { computed, unref } from 'vue';
import { type Image, type Attribute, useDataStore, type Layer, type Piece, useCollectionStore } from './state';

const props = defineProps<{ image: Image, focusLayer?: Layer|null }>();
const data  = useDataStore();
const collection = useCollectionStore();

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
		<div v-if="!image" class="">LOADING</div>
		<div v-else-if="!image.attributes.size" class="w-full h-full bg-red-500/50 relative">{{ collection.isGenerating ? 'PENDING' : 'EMPTY' }}<div class="absolute left-0 bottom-0 h-px w-full bg-blue-500"></div></div>
		<template v-else-if="image">
			<img
				v-for="{ layer, piece } in layers"
				:src="piece.preview"
				class="absolute left-0 top-0 w-full transition-opacity duration-500 cursor-pointer"
				:class="[focusLayer && focusLayer !== layer && 'opacity-30']"/>
		</template>
	</div>
</template>
