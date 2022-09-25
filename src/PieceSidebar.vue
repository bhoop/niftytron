<script setup lang="ts">
import { PhotoIcon } from "@heroicons/vue/24/outline";
import { computed, ref } from "vue";
import type { Piece, Layer } from "./state";
import { useDataStore } from "./state";
import SidebarField from "./SidebarField.vue";
import useAppNavigation from "./app-navigation";
import Button from "./Button.vue";
import SidebarHeading from "./SidebarHeading.vue";

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
<div class="text-sm flex flex-col gap-2">
	<SidebarHeading>Trait Details</SidebarHeading>
	<SidebarField label="Name" type="text" v-model="piece.name"/>
	<SidebarField label="Render layer" type="select" :select-value="piece.renderLayer?.name ?? `Default`" :model-value="piece.renderLayer?.id ?? ''" @update:model-value="updateRenderLayer" :placeholder="layer.name">
		<option v-for="rlayer in reverseLayers" :value="rlayer.id === layer.id ? '' : rlayer.id" class="text-right text-xs pl-3" :class="[rlayer === layer ? 'font-bold' : '']">{{ ( rlayer === layer ? '➡️' : '') + rlayer.name }}</option>
	</SidebarField>
	<SidebarField label="Tags" type="tags" v-model="piece.tags"/>
	<SidebarField label="Blocked tags" type="tags" v-model="piece.blockedTags"/>
	<SidebarField label="Appearance limit" type="limit" v-model="piece.limit" placeholder="unlimited"/>

	<label
		class="mt-3 rounded bg-neutral-200 border border-neutral-400 p-px flex items-top"
	>
		<PhotoIcon class="mt-1 h-6 w-6 text-neutral-400 mx-1" />
		<div class="vue-grid w-full checkered">
			<div
				class="aspect-square w-full bg-cover"
				:style="[bgimage]"
			>
			</div>
		</div>
		<!-- <input type="file" ref="fileInput" class="hidden"/> -->
	</label>

	<Button
		color="red"
		class="mx-auto mt-3 mb-1"
		@click="tryToDelete"
		>delete trait</Button>

	<div class="mx-auto text-xs text-neutral-500/30 font-mono">{{ piece.id }}</div>
</div>
</template>
