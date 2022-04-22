<script setup lang="ts">
import { ref } from 'vue';
import { useDataStore, useCollectionStore, type Piece, type Layer, type Image } from './state';
import { SearchIcon, HashtagIcon, RefreshIcon, XIcon } from '@heroicons/vue/outline';
import Preview from './Preview.vue';
import { computed } from '@vue/reactivity';
import AppNavigation from './AppNavigation.vue';
import ImageModal from './ImageModal.vue';

// import { RefreshIcon } from '@heroicons/vue/solid';

let data = useDataStore();
let collection = useCollectionStore();

let currentImage = ref<Image|null>(collection.images[0]);
let search = ref<string>('');

let visibleImages = computed(() => {
	let test = search.value.toLowerCase().split(/\W+/);
	return search.value === ''
		? collection.images
		: collection.images.filter( img => test.every( term => img.search.includes( term ) ) );
});

async function onSelectImages( files: FileList | null ) {
	if ( ! files ) return;
	const layerData: { [layername:string]: Piece[] } = {};
	for ( const file of Array.from( files ) ) {
		let src: string = await new Promise( resolve => {
			let reader = new FileReader();
			reader.onloadend = () => resolve( reader.result as string );
			reader.readAsDataURL( file )
		} );
		let [ layerName, pieceName ] = file.name.replace(/\.png$/, '').split('_', 2);
		if ( ! layerData[ layerName ] ) layerData[layerName] = [];
		layerData[ layerName ].push( { name: pieceName, src })
	}
	let layers: Layer[] = [];
	for ( const name in layerData ) {
		layers.push( { name, pieces: layerData[name] });
	}
	data.layers = layers;
}

</script>

<template>
<div class="min-h-screen bg-neutral-200">
	<!-- <div class="sticky top-0 z-40 w-full backdrop-blur-md flex-none border-b border-slate-900/10 bg-white/70 p-4">
		niftytron2000
	</div> -->

	<div class="min-h-screen pl-72">
		<div class="w-72 flex flex-col gap-3 p-3 fixed left-0 top-0 h-screen bg-neutral-300">
			<div class="uppercase flex gap-2">
				<div class="mr-auto">Collection</div>
				<div class="p-1 rounded-lg bg-orange-500 text-orange-900" title="Regenerate collection" @click="collection.regenerate">
					<RefreshIcon class="h-4 w-4"/>
				</div>
			</div>
			<div class="rounded bg-neutral-200 border border-neutral-400 p-px flex items-center" title="Search for specific elements in images">
				<SearchIcon class="h-6 w-6 text-neutral-400 mx-1"/>
				<input type="search" :disabled="data.combinationCount===0" placeholder="search" class="w-full py-1 px-2 rounded" v-model.lazy="search"/>
			</div>
			<div class="rounded bg-neutral-200 border border-neutral-400 p-px flex items-center" title="Size of collection">
				<HashtagIcon class="h-6 w-6 text-neutral-400 mx-1"/>
				<input type="number" min="1" :max="data.combinationCount" :value="collection.size" @change="event => collection.changeSize((event.target as HTMLInputElement).value)" :disabled="data.combinationCount===0" :placeholder="data.combinationCount.toString()" class="w-full py-1 px-2 rounded"/>
			</div>

			<AppNavigation/>
		</div>
		<div v-if="data.layers.length === 0" class="h-screen flex items-center justify-center">
			<label class="bg-orange-500 text-orange-200 rounded-lg px-4 py-1 text-xl font-light">
				Add Images
				<input type="file" class="hidden" multiple accept="image/pdf" @change="event => onSelectImages( ( event.target as HTMLInputElement).files )"/>
			</label>
		</div>
		<div v-else class="grid grid-cols-[repeat(auto-fill,15rem)] p-5">
			<div v-for="image of visibleImages" class="h-60 rounded-sm">
				<Preview :image="image" @click="currentImage = image"/>
			</div>
		</div>
	</div>
</div>
<div class="z-40 fixed top-0 left-0 w-screen h-screen pointer-events-none flex items-center justify-center">
	<ImageModal v-if="currentImage" :image="currentImage" class="pointer-events-auto bg-white/80 backdrop-blur-xl shadow-2xl rounded border border-neutral-300" @close="currentImage = null"/>
</div>
</template>
