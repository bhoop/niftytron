<script setup lang="ts">
import type { Layer } from "./state";
import { useDataStore } from './state';
import { PlusIcon } from '@heroicons/vue/outline';
import { TagIcon, BanIcon, HashtagIcon, SwitchVerticalIcon } from '@heroicons/vue/solid';
import useAppNavigation from "./app-navigation";
import { computed, ref } from "vue";
import SidebarField from "./SidebarField.vue";
import SidebarIcon from "./SidebarIcon.vue";
import CountLabel from "./CountLabel.vue";
import Button from "./Button.vue";

const props = defineProps<{ layer: Layer }>();

const data = useDataStore();
const nav = useAppNavigation();
const piecesInDisplayOrder = computed(() => {
	let arr = [...props.layer.pieces];
	arr.sort( (a,b) => a.name.localeCompare(b.name));
	return arr;
});

function updateRequired( isRequired: boolean ) {
	props.layer.required = isRequired;
	if ( isRequired ) {
		props.layer.limit = false;
		props.layer.tags = [];
	}
}

function tryToDelete() {
	if ( confirm('Remove this layer and all of its pieces?' ) ) {
		data.layers = data.layers.filter( l => l.id !== props.layer.id );
		nav.goto();
	}
}

</script>
<template>
<div class="text-sm flex flex-col gap-2">
	<SidebarField label="Name" type="text" v-model="layer.name"/>
	<SidebarField label="Require in all images" type="checkbox" :model-value="layer.required" @update:model-value="updateRequired"/>
	<SidebarField label="Exclude from uniqueness" type="checkbox" v-model="layer.excludeFromKey"/>
	<SidebarField v-if="!layer.required" label="Appearance limit" type="limit" v-model="layer.limit" placeholder="unlimited"/>
	<SidebarField v-if="!layer.required" label="Tags" type="tags" v-model="layer.tags"/>
	<SidebarField label="Blocked tags" type="tags" v-model="layer.blockedTags"/>

	<div class="px-2 font-semibold">Pieces</div>
	<div>
		<div
			v-for="piece in piecesInDisplayOrder"
			:key="piece.id"
			class="group flex items-center p-2 cursor-pointer hover:text-orange-600 border-t border-neutral-400/50 bg-neutral-300 text-sm"
			@click="nav.goto( layer, piece )"
			>
			<div class="mr-auto">{{ piece.name }}</div>
			<CountLabel :id="piece.id" class="mr-0.5"/>
			<SidebarIcon title="This piece uses a custom render layer" :active="!!piece.renderLayer">
				<SwitchVerticalIcon class="w-4 h-4"/>
			</SidebarIcon>
			<SidebarIcon title="This piece has tags" :active="piece.tags.length > 0">
				<TagIcon class="w-4 h-4"/>
			</SidebarIcon>
			<SidebarIcon title="This piece has blocked tags" :active="piece.blockedTags.length > 0">
				<BanIcon class="w-4 h-4"/>
			</SidebarIcon>
			<SidebarIcon :title="`This piece will only appear in ${piece.limit!} image${piece.limit===1?'':'s'}`" :active="piece.limit !== false">
				<HashtagIcon class="w-4 h-4"/>
			</SidebarIcon>
		</div>
	</div>
	<div class="flex">
		<label class="mx-auto flex gap-2 items-center relative p-1 rounded-lg bg-orange-500 text-orange-900 cursor-pointer">
			<input type="file" class="absolute hidden" multiple accept="image/pdf" @change="event => data.upload( ( event.target as HTMLInputElement).files, layer )"/>
			<PlusIcon class="h-4 w-4"/>
			add images
		</label>
	</div>
	<Button
		color="red"
		class="mx-auto mt-3 mb-1"
		@click="tryToDelete"
		>delete layer</Button>

	<div class="mx-auto text-xs text-neutral-500/30 font-mono">{{ layer.id }}</div>
</div>
</template>
