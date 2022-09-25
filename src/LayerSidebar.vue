<script setup lang="ts">
import type { Layer } from "./state";
import { useDataStore } from './state';
import { ArrowLeftIcon } from "@heroicons/vue/24/solid";
import { TagIcon, NoSymbolIcon, HashtagIcon, ArrowsUpDownIcon } from '@heroicons/vue/24/solid';
import useAppNavigation from "./app-navigation";
import { computed, ref } from "vue";
import SidebarField from "./SidebarField.vue";
import SidebarIcon from "./SidebarIcon.vue";
import CountLabel from "./CountLabel.vue";
import Button from "./Button.vue";
import SidebarHeading from "./SidebarHeading.vue";
import SidebarBox from "./SidebarBox.vue";

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
<SidebarBox>
	<div class="relative">
		<SidebarHeading>
			<button title="Return to collection details" @click="nav.goto()"><ArrowLeftIcon class="w-5 h-5 ml-1 mr-2 text-orange-500 hover:text-orange-700 active:text-orange-400"/></button>
			Attribute Details
		</SidebarHeading>
		<div class="flex flex-col gap-y-2 pr-4 py-3 pl-1">
			<SidebarField label="Name" type="text" v-model="layer.name"/>
			<SidebarField label="Require in all images" type="checkbox" :model-value="layer.required" @update:model-value="updateRequired"/>
			<SidebarField label="Exclude from uniqueness" type="checkbox" v-model="layer.excludeFromKey"/>
			<SidebarField :disabled="layer.required" label="Appearance limit" type="limit" v-model="layer.limit" placeholder="∞"/>
			<SidebarField :disabled="layer.required" label="Tags" type="tags" v-model="layer.tags"/>
			<SidebarField label="Blocked tags" type="tags" v-model="layer.blockedTags"/>
		</div>
	</div>
	<SidebarHeading>
		Traits
	</SidebarHeading>
	<div>
		<div
			v-for="piece in piecesInDisplayOrder"
			:key="piece.id"
			class="group flex items-center p-2 text-sm select-none"
			@click="nav.goto( layer, piece )"
			>
			<div class="mr-auto cursor-pointer text-orange-500" title="View trait details">{{ piece.name }}</div>
			<CountLabel :id="piece.id" class="mr-0.5"/>
			<SidebarIcon title="This piece uses a custom render layer" :active="!!piece.renderLayer">
				<ArrowsUpDownIcon class="w-4 h-4"/>
			</SidebarIcon>
			<SidebarIcon title="This piece has tags" :active="piece.tags.length > 0">
				<TagIcon class="w-4 h-4"/>
			</SidebarIcon>
			<SidebarIcon title="This piece has blocked tags" :active="piece.blockedTags.length > 0">
				<NoSymbolIcon class="w-4 h-4"/>
			</SidebarIcon>
			<SidebarIcon :title="`This piece will only appear in ${piece.limit!} image${piece.limit===1?'':'s'}`" :active="piece.limit !== false">
				<HashtagIcon class="w-4 h-4"/>
			</SidebarIcon>
		</div>
	</div>
	<Button
		color="red"
		class="mx-auto mt-3 mb-1"
		@click="tryToDelete"
		>delete attribute</Button>

	<div class="mx-auto text-xs text-neutral-500/30 font-mono">{{ layer.id }}</div>
</SidebarBox>
</template>
