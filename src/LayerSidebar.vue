<script setup lang="ts">
import type { Layer } from "./state";
import { BookmarkIcon, PhotographIcon, AdjustmentsIcon } from '@heroicons/vue/outline';
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
	<div class="relative overflow-y-auto flex flex-col gap-3 pr-3">
		<div class="rounded bg-neutral-200 border border-neutral-400 p-px flex items-center" title="Layer name">
			<BookmarkIcon class="h-6 w-6 text-neutral-400 mx-1"/>
			<input type="text" placeholder="Layer name" class="w-full py-1 px-2 rounded" v-model="layer.name"/>
		</div>

		<div class="rounded bg-neutral-200 border border-neutral-400 p-px flex items-center" title="Layer name">
			<AdjustmentsIcon class="h-6 w-6 text-neutral-400 mx-1"/>
			<input type="text" placeholder="Layer name" class="w-full py-1 px-2 rounded" v-model.lazy="layer.probability"/>
		</div>

		<hr>
		<div>Pieces</div>
		<div>
			<div
				v-for="piece in piecesInDisplayOrder"
				class="group flex items-center py-2 cursor-pointer hover:text-orange-600"
				@click="nav.goto( layer, piece )"
				>
				<PhotographIcon class="ml-2 mr-2 w-5 h-5 text-neutral-500/50 group-hover:text-orange-500"/>
				{{ piece.name }}
			</div>
		</div>
	</div>
</template>
