<script setup lang="ts">
import useAppNavigation from './app-navigation';
import { useDataStore, type Layer } from './state';
import { SlickList, SlickItem } from 'vue-slicksort';
import { computed, nextTick, ref } from 'vue';
import { PlusIcon, BookmarkIcon, PhotographIcon, CollectionIcon } from '@heroicons/vue/outline';
import PieceSidebar from './PieceSidebar.vue';
import LayerSidebar from './LayerSidebar.vue';

let { activeLayer, activePiece, goto } = useAppNavigation();
let data = useDataStore();
let addingLayer = ref<string|null>(null);
let addInput = ref<HTMLInputElement|null>(null);

async function startAddingLayer() {
	addingLayer.value = '';
	await nextTick();
	addInput.value!.focus();
}

function finishAddingLayer() {
	console.log('addlayer', addingLayer.value);
	if ( addingLayer.value !== '' ) {
		data.layers.unshift( { name: addingLayer.value!, pieces: [] } );
		goto( data.layers[0]);
	}
	addingLayer.value = null;
}

function reverse<T>( arr: T[] ): T[] {
	let arr2 = [ ...arr ];
	arr2.reverse();
	return arr2;
}

const layersInDisplayOrder = computed( () => reverse( data.layers ) );

function sortLayers( newSortOrder: Layer[] ) {
	data.layers = reverse( newSortOrder );
}

async function getFilesFromPossibleDirectory( item: DataTransferItem ) {
	let entry: FileSystemFileHandle|FileSystemDirectoryHandle = await item.getAsFileSystemHandle();
	if ( entry.kind === 'file' ) return [ await entry.getAsFile() ];
	console.log('entry', entry);
	return [];
}

function getFileFromEntry( entry: FileSystemFileEntry ): Promise<File> {
	return new Promise( ( resolve, reject ) => entry.file( resolve, reject ) );
}

async function dropCollectionFiles( items?: DataTransferItemList ) {
	draggingOntoCollection.value = false;
	if (!items) return;
	let filePromises: Promise<File>[] = [];
	for ( let item of items ) {
		if ( !item.webkitGetAsEntry ) return alert('File uploads not supported.');
		const entry = item.webkitGetAsEntry();
		console.log( entry, typeof entry );
		if ( entry === null ) continue;
		else if ( entry instanceof FileSystemFileEntry ) {
			filePromises.push( getFileFromEntry( entry ) );
		} else if ( entry instanceof FileSystemDirectoryEntry ) {
			let reader = entry.createReader();
			await new Promise<void>( resolve => {
				reader.readEntries( results => {
					for ( let childEntry of results ) {
						console.log( childEntry );
						if ( childEntry instanceof FileSystemFileEntry ) {
							filePromises.push( getFileFromEntry( childEntry ) );
						}
					}
					resolve();
				} );
			} );
		}
	}
	console.log(filePromises);
	const files = await Promise.all( filePromises );
	console.log( 'read files!', files );
}

let draggingOntoCollection = ref(false);
</script>
<template>
<template v-if="!activeLayer">
	<div class="flex gap-2">
		<div class="mr-auto">Layers</div>
		<div class="p-1 rounded-lg bg-orange-500 text-orange-900" title="Add layer" @click="startAddingLayer">
			<PlusIcon class="h-4 w-4"/>
		</div>
	</div>
	<div
		class="flex-1" :class="[draggingOntoCollection && 'outline outline-lime-500']"
		@dragover.prevent
		@dragend.prevent
		@dragenter="draggingOntoCollection = true"
		@dragleave="draggingOntoCollection = false"
		@drop.prevent="event => dropCollectionFiles( ( event as DragEvent ).dataTransfer?.items )"
		>
		<input v-if="addingLayer !== null" ref="addInput" v-model="addingLayer" type="text" class="w-full rounded bg-neutral-200 border border-neutral-400 px-3 py-1" placeholder="New layer" autofocus @keyup.enter="finishAddingLayer()" @keyup.esc="finishAddingLayer()" @change="finishAddingLayer()"/>
		<SlickList axis="y" :list="layersInDisplayOrder" @update:list="sortLayers" :pressDelay="150" :distance="10">
			<SlickItem v-for="(layer,i) in layersInDisplayOrder" :key="layer.name" :index="i">
				<div
					class="group flex items-center py-2 cursor-pointer hover:text-orange-600"
					@click="goto( layer )"
					>
					<CollectionIcon class="ml-2 mr-2 w-5 h-5 text-neutral-500/50 group-hover:text-orange-500"/>
					{{ layer.name }}
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
