<script setup lang="ts">
import { BanIcon, BookmarkIcon, PhotographIcon, SparklesIcon } from "@heroicons/vue/outline";
import { computed, ref } from "vue";
import type { Piece } from "./state";
import { useDataStore } from "./state";
import TagField from "./TagField.vue";
import SidebarField from "./SidebarField.vue";

let props = defineProps<{ piece: Piece }>();
let data = useDataStore();
let fileInput = ref<HTMLInputElement>();

const bgimage = computed( () => props.piece.src
	? `background-image:url('${props.piece.src}')`
	: ""
);
</script>
<template>
<div class="text-sm flex flex-col gap-2">
	<SidebarField label="Name" type="text" v-model="piece.name"/>
	<SidebarField label="Tags" type="tags" v-model="piece.tags"/>
	<SidebarField label="Blocked tags" type="tags" v-model="piece.blockedTags"/>
	<SidebarField label="Appearance limit" type="limit" v-model="piece.limit" placeholder="unlimited"/>

	<label
		class="mt-3 rounded bg-neutral-200 border border-neutral-400 p-px flex items-top"
	>
		<PhotographIcon class="mt-1 h-6 w-6 text-neutral-400 mx-1" />
		<div class="vue-grid w-full checkered">
			<div
				class="aspect-square w-full bg-cover"
				:style="[bgimage]"
			>
			</div>
		</div>
		<!-- <input type="file" ref="fileInput" class="hidden"/> -->
	</label>

	<div class="mx-auto text-xs text-neutral-500/30 font-mono">{{ piece.id }}</div>
</div>
</template>
