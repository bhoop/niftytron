<script setup lang="ts">
import { PhotoIcon, ArrowLeftIcon } from "@heroicons/vue/24/outline";
import { computed, ref } from "vue";
import type { Piece, Layer } from "./state";
import { useDataStore } from "./state";
import SidebarField from "./SidebarField.vue";
import useAppNavigation from "./app-navigation";
import Button from "./Button.vue";
import SidebarHeading from "./SidebarHeading.vue";
import SidebarBox from "./SidebarBox.vue";

let props = defineProps<{ layer: Layer, piece: Piece }>();
let data = useDataStore();
const nav = useAppNavigation();

const bgimage = computed( () => props.piece.src
	? `background-image:url('${props.piece.src}')`
	: ""
);

function updateRenderLayer( newLayerId: string ) {
	if ( newLayerId === props.layer.id ) {
		delete props.piece.renderLayer;
	} else {
		props.piece.renderLayer = data.layers.find( l => l.id === newLayerId );
		if ( ! props.piece.renderLayer ) delete props.piece.renderLayer;
	}
}

const reverseLayers = computed( () => {
	let reverse = [...data.layers ];
	reverse.reverse();
	return reverse;
} );

function tryToDelete() {
	if ( confirm('Remove this piece?' ) ) {
		props.layer.pieces = props.layer.pieces.filter( p => p.id !== props.piece.id );
		nav.goto(props.layer);
	}
}

</script>
<template>
<SidebarBox>
	<SidebarHeading>
		<button title="Return to attribute details" @click="nav.goto(props.layer)"><ArrowLeftIcon class="w-5 h-5 ml-1 mr-2 text-orange-500 hover:text-orange-700 active:text-orange-400"/></button>
		Trait Details
	</SidebarHeading>
	<div class="flex flex-col gap-y-2 pr-4 py-3 pl-1">
		<SidebarField label="Name" type="text" v-model="piece.name"/>
		<SidebarField label="Render layer" type="select" :select-value="piece.renderLayer?.name ?? `Default`" :model-value="piece.renderLayer?.id ?? ''" @update:model-value="updateRenderLayer" :placeholder="layer.name">
			<option v-for="rlayer in reverseLayers" :value="rlayer.id === layer.id ? '' : rlayer.id" class="text-right text-xs pl-3" :class="[rlayer === layer ? 'font-bold' : '']">{{ ( rlayer === layer ? '➡️' : '') + rlayer.name }}</option>
		</SidebarField>
		<SidebarField label="Tags" type="tags" v-model="piece.tags"/>
		<SidebarField label="Blocked tags" type="tags" v-model="piece.blockedTags"/>
		<SidebarField label="Appearance limit" type="limit" v-model="piece.limit" placeholder="∞"/>
	</div>

	<div class="vue-grid checkered rounded bg-neutral-200 border border-neutral-400 mx-3">
		<div
			class="aspect-square w-full bg-cover"
			:style="bgimage"
		>
		</div>
	</div>

	<Button
		color="red"
		class="mx-auto mt-3 mb-1"
		@click="tryToDelete"
		>delete trait</Button>

	<div class="mx-auto text-xs text-neutral-500/30 font-mono">{{ piece.id }}</div>
</SidebarBox>
</template>
