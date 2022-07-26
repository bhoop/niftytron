<script setup lang="ts">
import { ref, reactive, onBeforeMount } from 'vue';
import { useDataStore, useCollectionStore, type Piece, type Layer, type Image } from './state';
import { ExclamationIcon } from '@heroicons/vue/outline';
import { computed } from '@vue/reactivity';
import ImageModal from './ImageModal.vue';
import Collection from './Collection.vue';
import UploadProgress from './UploadProgress.vue';
import useAppNavigation from './app-navigation';
import DownloadProgress from './DownloadProgress.vue';
import CollectionSidebar from './CollectionSidebar.vue';
import SidebarHeading from './SidebarHeading.vue';
import LayerSidebar from './LayerSidebar.vue';
import PieceSidebar from './PieceSidebar.vue';
import { getMany, set, clear } from 'idb-keyval';

// import { RefreshIcon } from '@heroicons/vue/solid';

let data = useDataStore();
let collection = useCollectionStore();
const nav = reactive( useAppNavigation() );
const initialized = ref(false);

let currentImageId = ref<string|null>(null);
let search = ref<string>('');
let sizeInput = ref('');

let currentImage = computed(() => currentImageId.value === null ? null : collection.images.find( img => img?.id === currentImageId.value ));

let visibleImages = computed(() => {
	let output = collection.images;
	if ( nav.activeLayer ) {
		output = output.filter( img => img && img.attributes.has( nav.activeLayer! ) );
		if ( nav.activePiece ) {
			output = output.filter( img => img && img.attributes.get( nav.activeLayer! )! === nav.activePiece );
		}
	}
	// if ( search.value !== '' ) {
	// 	let test = search.value.toLowerCase().split(/\W+/);
	// 	output = output.filter( img => img && test.every( term => img.search.includes( term ) ) );
	// }
	return output;
});

function persistLayers() {
	let cacheLayers = JSON.parse(JSON.stringify(data.layers));
	for( const layer of cacheLayers ) {
		for( const piece of layer.pieces ) {
			if ( piece.renderLayer ) piece.renderLayer = piece.renderLayer.id;
		}
	}
	set('layers', cacheLayers);
}

function persistCollection() {
	const cache = collection.getStateForStorage();
	set( 'collection', cache );
}

onBeforeMount( async () => {
	const [ storedLayers, storedCollection ] = await getMany(['layers','collection']);

	// rehydrate layers
	if ( storedLayers ) {
		for( const layer of storedLayers ) {
			for( const piece of layer.pieces ) {
				if ( piece.renderLayer ) {
					const pointer = storedLayers.find( (l:Layer) => l.id === piece.renderLayer );
					if (pointer) piece.renderLayer = pointer;
					else delete piece.renderLayer;
				}
			}
		}
		data.layers = storedLayers;
	}

	// rehydrate collection
	if ( storedCollection ) {
		collection.setStateFromStorage( storedCollection, storedLayers );
	}

	let dataTimer = 0;
	data.$subscribe( () => {
		clearTimeout( dataTimer );
		dataTimer = setTimeout( persistLayers, 500 );
	} );
	let collectionTimer = 0;
	collection.$subscribe( () => {
		clearTimeout( collectionTimer );
		collectionTimer = setTimeout( persistCollection, 500 );
	} );
	initialized.value = true;

	// todo: load cached state from storage
	// todo: initialize data store
	// todo: initialize collection store
	// todo: when the data store key changes,
	//       or the collection store key changes, 
	//       persist the state to storage
} );

function reset() {
	clear();
	window.location.reload();
}

</script>

<template>
<div v-if="!initialized" class="flex w-screen h-screen items-center justify-center">
	<div class="animate-spin inline-block w-8 h-8 border-4 rounded-full border-neutral-300 border-t-neutral-100" role="status"/>
</div>
<template v-else>
	<div class="fixed top-0 left-0 h-screen w-80 pb-3 bg-neutral-300 border-r border-neutral-500/10 drop-shadow flex flex-col overflow-y-auto">
		<SidebarHeading :open="nav.focus === 'collection'" class="sticky top-0" @select="nav.goto()">Collection</SidebarHeading>
		<CollectionSidebar v-if="nav.focus === 'collection'"/>
		<template v-if="nav.activeLayer">
			<SidebarHeading :open="nav.focus === 'layer'" class="sticky top-10" @select="nav.goto( nav.activeLayer )">Layer: {{ nav.activeLayer.name }}</SidebarHeading>
			<LayerSidebar v-if="nav.focus === 'layer'" :layer="nav.activeLayer"/>
		</template>
		<template v-if="nav.activePiece">
			<SidebarHeading :open="nav.focus === 'piece'" class="sticky top-10">Piece: {{ nav.activePiece.name }}</SidebarHeading>
			<PieceSidebar v-if="nav.focus === 'piece'" :layer="nav.activeLayer!" :piece="nav.activePiece"/>
		</template>
		<!-- <CollectionSidebar v-if="nav.focus.value === 'collection'"/>
		<a v-else>Collection</a> -->
	</div>
	<div class="min-h-screen bg-neutral-200 ml-80">
		<div class="p-3 z-10 w-full sticky top-0 backdrop-blur-lg bg-neutral-200/80 flex items-center border-b border-neutral-300 transition-all">
			<!-- Spacer -->
			<div class="flex-1">
				<div v-if="collection.generating.running" class="text-orange-500 animate-pulse">Generating collection... {{ Math.floor(collection.generating.progress * 100 ) }}%</div>
				<div v-if="!collection.generating.running && collection.images.length < collection.size" class="text-red-500 font-semibold flex items-center">
					<ExclamationIcon class="w-6 h-6 mr-2"/>
					Only able to create {{ collection.images.length.toLocaleString() }} of {{ collection.size.toLocaleString() }} images
				</div>
			</div>
			<!-- search box -->
			<!-- <div class="h-8 relative rounded bg-neutral-200 border border-neutral-400 flex items-center flex-0 w-72" title="Size of collection">
				<SearchIcon class="absolute left-1.5 top-[0.25rem-1px] h-5 w-5 text-neutral-400"/>
				<div class="bg-white rounded absolute top-0 left-8 right-0 h-full pointer-events-none"/>
				<input type="search" placeholder="search" class="relative bg-transparent w-full py-1 px-2 pl-10 rounded"/>
			</div> -->
			<!-- Action buttons -->
			<div class="flex-1 flex justify-end">
				<button class="text-sm bg-green-600/80 rounded mr-3" @click="collection.download()">download</button>
				<button class="text-sm bg-orange-500/80 rounded" @click="collection.regenerate()">regenerate</button>
			</div>
		</div>
		<!-- <div v-if="data.layers.length === 0" class="h-screen flex items-center justify-center">
			<label class="bg-orange-500 text-orange-200 rounded-lg px-4 py-1 text-xl font-light">
				Add Images
				<input type="file" class="hidden" multiple accept="image/pdf" @change="event => onSelectImages( ( event.target as HTMLInputElement).files )"/>
			</label>
		</div> -->
		<div>
			<Collection :images="visibleImages" @select-image="image => currentImageId = image.id"/>
		</div>
	</div>
	<button class="fixed bottom-4 right-4" @click="reset()">reset</button>
</template>
<div class="z-40 fixed top-0 left-0 w-screen h-screen pointer-events-none flex items-center justify-center">
	<ImageModal v-if="currentImage" :image="currentImage" class="pointer-events-auto bg-white/80 backdrop-blur-xl shadow-2xl rounded border border-neutral-300" @close="currentImageId = null"/>
</div>
<Transition name="modal">
	<UploadProgress :upload="data.uploading" v-if="data.uploading"/>
	<DownloadProgress v-else-if="collection.downloading.running" :done="collection.downloading.done" :total="collection.size" :destination="collection.downloading.destination" @cancel="collection.stopDownload"/>
</Transition>
</template>
