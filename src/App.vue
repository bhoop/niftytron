<script setup lang="ts">
import { ref, reactive, onBeforeMount, onMounted } from "vue";
import {
	useDataStore,
	useCollectionStore,
	type Piece,
	type Layer,
	type Image,
} from "./state";
// import { ExclamationIcon } from "@heroicons/vue/outline";
import { computed } from "@vue/reactivity";
import ImageModal from "./ImageModal.vue";
import Collection from "./Collection.vue";
import UploadProgress from "./UploadProgress.vue";
import useAppNavigation from "./app-navigation";
import DownloadProgress from "./DownloadProgress.vue";
import CollectionSidebar from "./CollectionSidebar.vue";
import SidebarHeading from "./SidebarHeading.vue";
import LayerSidebar from "./LayerSidebar.vue";
import PieceSidebar from "./PieceSidebar.vue";
import { getMany, set, clear } from "idb-keyval";
import demoState from "./assets/demo.json";
import createUniqueId from "./uid";
import Breadcrumbs from "./Breadcrumbs.vue";
import Button from "./Button.vue";

// import { RefreshIcon } from '@heroicons/vue/solid';

let data = useDataStore();
let collection = useCollectionStore();
const nav = reactive(useAppNavigation());
const initialized = ref(false);

let currentImageId = ref<string | null>(null);
let search = ref<string>("");
let sizeInput = ref("");

let statejson = computed(() => {
	return JSON.stringify(
		data.layers.map((l) => ({
			limit: l.limit,
			required: l.required,
			name: l.name,
			tags: l.tags ?? [],
			blockedTags: l.blockedTags ?? [],
			pieces: l.pieces.map((p) => ({
				limit: p.limit,
				name: p.name,
				tags: p.tags ?? [],
				blockedTags: p.blockedTags ?? [],
				src: `${l.name.toLowerCase()}_${p.name.toLowerCase()}.png`,
			})),
		})),
		null,
		"\t"
	);
});

let currentImage = computed(() =>
	currentImageId.value === null
		? null
		: collection.images.find((img) => img?.id === currentImageId.value)
);

let visibleImages = computed(() => {
	let output = collection.images;
	if (nav.activeLayer) {
		output = output.filter(
			(img) => img && img.attributes.has(nav.activeLayer!)
		);
		if (nav.activePiece) {
			output = output.filter(
				(img) =>
					img && img.attributes.get(nav.activeLayer!)! === nav.activePiece
			);
		}
	}
	// if ( search.value !== '' ) {
	// 	let test = search.value.toLowerCase().split(/\W+/);
	// 	output = output.filter( img => img && test.every( term => img.search.includes( term ) ) );
	// }
	return output;
});

let allimages = new Array(987).fill(null).map((...a) => a[1]);

function persistLayers() {
	// let cacheLayers = JSON.parse(JSON.stringify(data.layers));
	// for( const layer of cacheLayers ) {
	// 	for( const piece of layer.pieces ) {
	// 		if ( piece.renderLayer ) piece.renderLayer = piece.renderLayer.id;
	// 	}
	// }
	// set('layers', cacheLayers);
}

function persistCollection() {
	// const cache = collection.getStateForStorage();
	// set( 'collection', cache );
}

onBeforeMount(async () => {
	data.layers = demoState.map((l) => ({
		...l,
		limit: Number(l.limit) || false,
		id: createUniqueId(),
		excludeFromKey: false,
		pieces: l.pieces.map((p) => ({
			...p,
			id: createUniqueId(),
			limit: Number(l.limit) || false,
			excludeFromKey: false,
			src: new URL(`./assets/images/${p.src}`, import.meta.url).href,
		})),
	}));

	initialized.value = true;
	collection.regenerate();
});

function reset() {
	clear();
	window.location.reload();
}

let stateVisible = ref(false);
function showstate() {
	stateVisible.value = !stateVisible.value;
}
</script>

<template>
	<div class="fixed top-0 left-0 w-full h-12 bg-neutral-300 grid items-center grid-cols-[1fr_auto_1fr] gap-x-10 px-2 z-10">
		<Breadcrumbs class="text-sm" :root="collection.name" :layers="data.layers" :layer="nav.activeLayer" :piece="nav.activePiece" @nav="(l,p) => nav.goto(l,p)"/>
		<div class="text-sm font-semibold tracking-widest">NFT ART MACHINE</div>
		<div class="ml-auto mr-1 flex gap-3">
			<Button icon="refresh">Regenerate</Button>
		</div>
	</div>
	<div
		class="fixed top-12 left-0 bottom-0 w-80 grid grid-cols-1 overflow-y-auto overflow-x-hidden"
	>
		<Transition :name="`sidebar-${nav.direction}`">
			<CollectionSidebar
				v-if="nav.focus === 'collection'"
				class="col-start-1 row-start-1"
				/>
			<LayerSidebar
				v-else-if="nav.focus === 'layer'"
				:layer="nav.activeLayer"
 				class="col-start-1 row-start-1"
 			/>
			<PieceSidebar
				v-else-if="nav.focus === 'piece'"
				:layer="nav.activeLayer!"
				:piece="nav.activePiece"
				class="col-start-1 row-start-1"
			/>
		</Transition>
	</div>

	<Collection :images="allimages"/>

</template>