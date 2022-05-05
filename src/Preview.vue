<script setup lang="ts">import { computed, unref } from 'vue';
import { type Image, type Attribute, useDataStore, type Layer, type Piece, useCollectionStore } from './state';

const props = defineProps<{ image: Image, focusLayer?: Layer|null }>();
const data  = useDataStore();
const collection = useCollectionStore();

const layers = computed( () => {
	const renderLayers: Map<Layer, {piece:Piece, layer:Layer}[]> = new Map();
	for ( const [ layer, piece ] of props.image.attributes ) {
		if ( ! piece || ! piece.renderLayer ) continue;
		if ( ! renderLayers.has( piece.renderLayer ) ) renderLayers.set( piece.renderLayer, [ { piece, layer } ] );
		else renderLayers.get( piece.renderLayer )!.push( { piece, layer } );
	}
	const arr: Attribute[] = [];
	for( const layer of data.layers ) {
		if( props.image.attributes.has( layer ) ) {
			arr.push( { layer, piece: props.image.attributes.get( layer )! } );
		}
		if ( renderLayers.has( layer ) ) {
			for ( const attr of renderLayers.get( layer )! ) {
				arr.push( attr );
			}
		}
	}
	return arr;
} );

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
