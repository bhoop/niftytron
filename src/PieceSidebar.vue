<script setup lang="ts">
import { BanIcon, BookmarkIcon, PhotographIcon, SparklesIcon } from "@heroicons/vue/outline";
import { computed, ref } from "vue";
import type { Piece } from "./state";
import { useDataStore } from "./state";
import TagField from "./TagField.vue";

let props = defineProps<{ piece: Piece }>();
let data = useDataStore();
let fileInput = ref<HTMLInputElement>();

const bgimage = computed( () => props.piece.src
	? `background-image:url('${props.piece.src}')`
	: ""
);
</script>
<template>
	<div class="flex-1 relative overflow-y-auto">
		<div
			class="rounded bg-neutral-200 border border-neutral-400 p-px flex items-center"
			title="Piece name"
		>
			<BookmarkIcon class="h-6 w-6 text-neutral-400 mx-1" />
			<input
				type="text"
				placeholder="Piece name"
				class="w-full py-1 px-2 rounded"
				v-model.lazy="piece.name"
			/>
		</div>

		<div class="mt-3 h-8 relative rounded bg-neutral-200 border border-neutral-400 p-px flex items-center mb-3" title="Rarity">
			<SparklesIcon class="absolute left-1.5 top-[0.25rem-1px] h-5 w-5 text-neutral-400"/>
			<div class="bg-white rounded absolute top-0 left-8 right-0 h-full flex items-center justify-end text-neutral-400/80 text-xs pointer-events-none pl-1 pr-2">
				<span class="ml-2">({{ data.combinationCountAbbr }} max)</span>
			</div>
			<input type="number" min="1" step="1"
				v-model="piece.rarity"
				placeholder="auto"
				class=" relative bg-transparent w-full py-1 pl-10 pr-2 rounded no-arrows"
				/>
		</div>

		<TagField v-model="piece.tags" class="mt-3"/>

		<div class="mt-3 h-8 relative rounded bg-neutral-200 border border-neutral-400 p-px flex items-center mb-3" title="Blocked tags">
			<BanIcon class="absolute left-1.5 top-[0.25rem-1px] h-5 w-5 text-neutral-400"/>
			<div class="bg-white rounded absolute top-0 left-8 right-0 h-full flex items-center justify-end text-neutral-400/80 text-xs pointer-events-none pl-1 pr-2">
				<span class="ml-2">({{ data.combinationCountAbbr }} max)</span>
			</div>
			<input type="number" min="1" step="1"
				v-model="piece.rarity"
				placeholder="auto"
				class=" relative bg-transparent w-full py-1 pl-10 pr-2 rounded no-arrows"
				/>
		</div>

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
	</div>
</template>
