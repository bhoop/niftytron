<script setup lang="ts">
import type { Layer } from "./state";
import { BookmarkIcon, PhotographIcon } from '@heroicons/vue/outline';
import useAppNavigation from "./app-navigation";
import { computed } from "vue";
const props = defineProps<{ layer: Layer }>();

const nav = useAppNavigation();
const piecesInDisplayOrder = computed(() => {
	let arr = [...props.layer.pieces];
	arr.sort( (a,b) => a.name.localeCompare(b.name));
	return arr;
});

</script>
<template>
	<div class="relative">
		<div class="rounded bg-neutral-200 border border-neutral-400 p-px flex items-center" title="Layer name">
			<BookmarkIcon class="h-6 w-6 text-neutral-400 mx-1"/>
			<input type="text" placeholder="Layer name" class="w-full py-1 px-2 rounded" v-model.lazy="layer.name"/>
		</div>
		<hr class="mt-3 mb-2">
		<div>Pieces</div>
		<div
			v-for="piece in piecesInDisplayOrder"
			class="group flex items-center py-2 cursor-pointer hover:text-orange-600"
			@click="nav.goto( layer, piece )"
			>
			<PhotographIcon class="ml-2 mr-2 w-5 h-5 text-neutral-500/50 group-hover:text-orange-500"/>
			{{ piece.name }}
		</div>
	</div>
</template>
