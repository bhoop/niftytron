<script setup lang="ts">
import useAppNavigation from './app-navigation';
import { useCollectionStore, useDataStore, type Layer, type Piece } from './state';
import { SlickList, SlickItem } from 'vue-slicksort';
import { computed, nextTick, ref } from 'vue';
import { PlusIcon, CollectionIcon } from '@heroicons/vue/outline';
import PieceSidebar from './PieceSidebar.vue';
import LayerSidebar from './LayerSidebar.vue';

let { activeLayer, activePiece, goto } = useAppNavigation();
let data = useDataStore();
let collection = useCollectionStore();
let addingLayer = ref<string|null>(null);
let addInput = ref<HTMLInputElement|null>(null);

function reverse<T>( arr: T[] ): T[] {
	let arr2 = [ ...arr ];
	arr2.reverse();
	return arr2;
}

const layersInDisplayOrder = computed( () => reverse( data.layers ) );

function sortLayers( newSortOrder: Layer[] ) {
	data.layers = reverse( newSortOrder );
}

async function onSelectImages( files: FileList | null ) {
	if ( ! files ) return;
	await data.upload( Array.from( files ) );
}

</script>
<template>
<template v-if="!activeLayer">
	<div class="flex gap-2">
		<div class="mr-auto">Layers</div>
		<label class="p-1 rounded-lg bg-orange-500 text-orange-900 cursor-pointer">
			<input type="file" class="absolute hidden" multiple accept="image/pdf" @change="event => onSelectImages( ( event.target as HTMLInputElement).files )"/>
			<PlusIcon class="h-4 w-4"/>
		</label>
	</div>
	<div class="flex-1">
		<SlickList axis="y" :list="layersInDisplayOrder" @update:list="sortLayers" :pressDelay="150" :distance="10">
			<SlickItem v-for="(layer,i) in layersInDisplayOrder" :key="layer.name" :index="i">
				<div
					class="group flex items-center py-2 cursor-pointer hover:text-orange-600"
					@click="goto( layer )"
					>
					<CollectionIcon class="ml-2 mr-2 w-5 h-5 text-neutral-500/50 group-hover:text-orange-500"/>
					<div class="">{{ layer.name }}</div>
					<div class="ml-auto text-sm opacity-50 font-semibold">{{ layer.probability }}%</div>
				</div>
			</SlickItem>
		</SlickList>
	</div>
</template>
<template v-else-if="!activePiece">
	<div class="flex gap-2">
		<a href="#" class="text-orange-600 font-semibold" @click="goto()">Layers</a>
		>
		{{ activeLayer!.name }}
	</div>
	<LayerSidebar :layer="activeLayer" class="flex-1"/>
</template>
<template v-else>
	<div class="flex gap-2">
		<a href="#" class="text-orange-600 font-semibold" @click="goto()">Layers</a>
		>
		<a href="#" class="text-orange-600 font-semibold" @click="goto(activeLayer)">{{ activeLayer.name }}</a>
		>
		{{ activePiece!.name }}
	</div>
	<PieceSidebar :piece="activePiece" class="flex-1 relative"/>
</template>
</template>
