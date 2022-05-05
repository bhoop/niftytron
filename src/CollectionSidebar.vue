<script setup lang="ts">
import useAppNavigation from './app-navigation';
import { useCollectionStore, useDataStore, type Layer, type Piece } from './state';
import { SlickList, SlickItem } from 'vue-slicksort';
import { computed, ref } from 'vue';
import { PlusIcon, CollectionIcon } from '@heroicons/vue/outline';
import { TagIcon, CheckCircleIcon, ChartPieIcon, HashtagIcon, ExclamationCircleIcon } from '@heroicons/vue/solid';
import SidebarIcon from './SidebarIcon.vue';

const collection = useCollectionStore();

let { goto } = useAppNavigation();
let data = useDataStore();

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
	<div class="text-sm">
		<div class="flex items-center pl-1 pr-2 relative">
			<div class="absolute left-2 right-1 pointer-events-none flex items-center">
				<div class="py-1 font-semibold">Number of images</div>
				<div class="h-0 flex-1 border-t border-neutral-400/40 border-dotted relative top-2 mx-2"/>
			</div>
			<input v-model="collection.size" type="number" class="w-full text-xs p-1 no-arrows bg-transparent text-orange-600 font-semibold text-right"/>
		</div>


		<div class="py-1 px-2 font-semibold">Layers</div>
		<SlickList axis="y" :list="layersInDisplayOrder" @update:list="sortLayers" :pressDelay="150" :distance="10">
			<SlickItem v-for="(layer,i) in layersInDisplayOrder" :key="layer.id" :index="i">
				<div
					class="group flex items-center p-2 cursor-pointer hover:text-orange-600 border-t border-neutral-400/50 bg-neutral-300 text-sm"
					@click="goto( layer )"
					>
					<div class="w-8 text-center py-0.5 text-xs bg-neutral-400/50 rounded-full group-hover:bg-orange-400/20" :title="`This layer has ${layer.pieces.length} piece${layer.pieces.length===1?'':'s'}`">{{ layer.pieces.length }}</div>
					<div class="ml-2 mr-auto">{{ layer.name }}</div>
					<SidebarIcon title="This layer is required in all images" :active="layer.required">
						<CheckCircleIcon class="w-4 h-4"/>
					</SidebarIcon>
					<SidebarIcon title="This layer has tags" :active="layer.tags.length > 0 || layer.blockedTags.length > 0">
						<TagIcon class="w-4 h-4"/>
					</SidebarIcon>
					<SidebarIcon :title="`This layer will only appear in ${layer.limit!} image${layer.limit===1?'':'s'}`" :active="layer.limit !== false">
						<HashtagIcon class="w-4 h-4"/>
					</SidebarIcon>
				</div>
			</SlickItem>
		</SlickList>
		<div class="flex">
			<label class="mx-auto flex gap-2 items-center relative p-1 rounded-lg bg-orange-500 text-orange-900 cursor-pointer">
				<input type="file" class="absolute hidden" multiple accept="image/pdf" @change="event => onSelectImages( ( event.target as HTMLInputElement).files )"/>
				<PlusIcon class="h-4 w-4"/>
				add images
			</label>
		</div>
	</div>
</template>