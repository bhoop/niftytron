<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useDataStore, useCollectionStore, type Piece, type Layer, type Image } from './state';
import { SearchIcon, HashtagIcon, RefreshIcon, XIcon } from '@heroicons/vue/outline';
import Preview from './Preview.vue';
import { computed } from '@vue/reactivity';
import AppNavigation from './AppNavigation.vue';
import ImageModal from './ImageModal.vue';
import AppHeader from './AppHeader.vue';
import Collection from './Collection.vue';
import UploadProgress from './UploadProgress.vue';
import useAppNavigation from './app-navigation';

// import { RefreshIcon } from '@heroicons/vue/solid';

let data = useDataStore();
let collection = useCollectionStore();
const nav = useAppNavigation();

let currentImage = ref<Image|null>();
let search = ref<string>('');
let sizeInput = ref('');

let visibleImages = computed(() => {
	let output = collection.images;
	if ( nav.activeLayer.value ) {
		output = output.filter( img => img && img.attributes.has( nav.activeLayer.value! ) );
		if ( nav.activePiece.value ) {
			output = output.filter( img => img && img.attributes.get( nav.activeLayer.value! )! === nav.activePiece.value );
		}
	}
	if ( search.value !== '' ) {
		let test = search.value.toLowerCase().split(/\W+/);
		output = output.filter( img => img && test.every( term => img.search.includes( term ) ) );
	}
	return output;
});

</script>

<template>
<div class="min-h-screen bg-neutral-200">
	<div class="p-3 pl-72 z-10 w-full sticky top-0 backdrop-blur-lg bg-neutral-200/80 flex items-center border-b border-neutral-300 transition-all">
		<!-- Spacer -->
		<div class="flex-1">
		</div>
		<!-- search box -->
		<div class="h-8 relative rounded bg-neutral-200 border border-neutral-400 flex items-center flex-0 w-72" title="Size of collection">
			<SearchIcon class="absolute left-1.5 top-[0.25rem-1px] h-5 w-5 text-neutral-400"/>
			<div class="bg-white rounded absolute top-0 left-8 right-0 h-full pointer-events-none"/>
			<input type="search" placeholder="search" class="relative bg-transparent w-full py-1 px-2 pl-10 rounded"/>
		</div>
		<!-- Action buttons -->
		<div class="flex-1 flex justify-end">
			<button class="text-sm bg-orange-500/80 rounded" @click="collection.regenerate()">regenerate</button>
		</div>
	</div>
	<div class="w-72 flex flex-col gap-3 p-3 fixed left-0 top-0 h-screen z-10">
		<!-- Collection Size Input -->
		<div class="h-8 relative rounded bg-neutral-200 border border-neutral-400 p-px flex items-center mb-3" title="Size of collection">
			<HashtagIcon class="absolute left-1.5 top-[0.25rem-1px] h-5 w-5 text-neutral-400"/>
			<div class="bg-white rounded absolute top-0 left-8 right-0 h-full flex items-center justify-end text-neutral-400/80 text-xs pointer-events-none pl-1 pr-2">
				<span class="invisible">{{ sizeInput === '' ? data.combinationCount.toString() : sizeInput }}</span>
				<span class="ml-2">({{ data.combinationCountAbbr }} max)</span>
			</div>
			<input type="number" min="1" :max="data.combinationCount"
				:value="collection.size"
				@change="event => collection.changeSize(Number((event.target as HTMLInputElement).value))"
				class=" relative bg-transparent w-full py-1 pl-10 pr-2 rounded no-arrows"
				/>
		</div>

		<AppNavigation/>
	</div>
	<!-- <div v-if="data.layers.length === 0" class="h-screen flex items-center justify-center">
		<label class="bg-orange-500 text-orange-200 rounded-lg px-4 py-1 text-xl font-light">
			Add Images
			<input type="file" class="hidden" multiple accept="image/pdf" @change="event => onSelectImages( ( event.target as HTMLInputElement).files )"/>
		</label>
	</div> -->
	<div class="pl-72">
		<Collection :images="visibleImages" @select-image="image => currentImage = image"/>
	</div>
</div>
<div class="z-40 fixed top-0 left-0 w-screen h-screen pointer-events-none flex items-center justify-center">
	<ImageModal v-if="currentImage" :image="currentImage" class="pointer-events-auto bg-white/80 backdrop-blur-xl shadow-2xl rounded border border-neutral-300" @close="currentImage = null"/>
</div>
<Transition name="modal">
	<UploadProgress :upload="data.uploading" v-if="data.uploading"/>
</Transition>
</template>
