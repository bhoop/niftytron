<script setup lang="ts">
import { BookmarkIcon, PhotographIcon } from "@heroicons/vue/outline";
import { computed, ref } from "vue";
import type { Piece } from "./state";
import { useDataStore } from "./state";

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
		<!-- <label
			class="mt-3 rounded bg-neutral-200 border border-neutral-400 p-px flex items-top cursor-pointer"
			title="Click to replace image"
		> -->
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
