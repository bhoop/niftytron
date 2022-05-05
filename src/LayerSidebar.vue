<script setup lang="ts">
import type { Layer } from "./state";
import { PlusIcon } from '@heroicons/vue/outline';
import { TagIcon, HashtagIcon } from '@heroicons/vue/solid';
import useAppNavigation from "./app-navigation";
import { computed, ref } from "vue";
import TagField from "./TagField.vue";
import SidebarField from "./SidebarField.vue";
import SidebarIcon from "./SidebarIcon.vue";
const props = defineProps<{ layer: Layer }>();

const nav = useAppNavigation();
const piecesInDisplayOrder = computed(() => {
	let arr = [...props.layer.pieces];
	arr.sort( (a,b) => a.name.localeCompare(b.name));
	return arr;
});

</script>
<template>
<div class="text-sm flex flex-col gap-2">
	<SidebarField label="Name" type="text" v-model="layer.name"/>
	<SidebarField label="Require in all images" type="checkbox" v-model="layer.required"/>
	<SidebarField label="Tags" type="tags" v-model="layer.tags"/>
	<SidebarField label="Blocked tags" type="tags" v-model="layer.blockedTags"/>
	<SidebarField label="Appearance limit" type="limit" v-model="layer.limit" placeholder="unlimited"/>

	<div class="px-2 font-semibold">Pieces</div>
	<div>
		<div
			v-for="piece in piecesInDisplayOrder"
			:key="piece.id"
			class="group flex items-center p-2 cursor-pointer hover:text-orange-600 border-t border-neutral-400/50 bg-neutral-300 text-sm"
			@click="nav.goto( layer, piece )"
			>
			<!-- <div class="w-8 text-center py-0.5 text-xs bg-neutral-400/50 rounded-full group-hover:bg-orange-400/20" :title="`This layer has ${layer.pieces.length} piece${layer.pieces.length===1?'':'s'}`">{{ layer.pieces.length }}</div> -->
			<div class="ml-2 mr-auto">{{ piece.name }}</div>
			<SidebarIcon title="This piece has tags" :active="piece.tags.length > 0 || piece.blockedTags.length > 0">
				<TagIcon class="w-4 h-4"/>
			</SidebarIcon>
			<SidebarIcon :title="`This piece will only appear in ${piece.limit!} image${piece.limit===1?'':'s'}`" :active="piece.limit !== false">
				<HashtagIcon class="w-4 h-4"/>
			</SidebarIcon>
		</div>
	</div>
	<div class="flex">
		<label class="mx-auto flex gap-2 items-center relative p-1 rounded-lg bg-orange-500 text-orange-900 cursor-pointer">
			<input type="file" class="absolute hidden" multiple accept="image/pdf" @change="event => onSelectImages( ( event.target as HTMLInputElement).files )"/>
			<PlusIcon class="h-4 w-4"/>
			add images
		</label>
	</div>

	<div class="mx-auto text-xs text-neutral-500/30 font-mono">{{ layer.id }}</div>
</div>
</template>
