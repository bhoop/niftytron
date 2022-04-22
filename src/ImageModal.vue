<script setup lang="ts">
import { XIcon } from '@heroicons/vue/outline';
import { computed, ref } from 'vue';
import useAppNavigation from './app-navigation';
import Preview from "./Preview.vue";
import type { Image, Layer, Piece } from './state';
import { useDataStore } from './state';

const data = useDataStore();
const focusLayer = ref<Layer|null>(null);
const nav = useAppNavigation();

const props = defineProps<{ image:Image }>();
defineEmits<{
	(e: 'close'): void,
	(e: 'open-attr', layer: Layer, piece: Piece): void,
}>();

const attributes = computed( () => {
	let attrs = data.layers.map( layer => {
		let piece = props.image.attributes.get( layer );
		return piece ? { layer, piece } : null;
	}).filter( a => a !== null );
	attrs.reverse();
	return attrs;
} );

</script>
<template>
	<div class="p-5 pr-10 pt-0">
		<div class="pt-4 pb-5 text-lg">Image #{{ image.id }}</div>
		<div class="relative flex gap-5">
			<div class="w-60 flex checkered bg-white border rounded border-neutral-400">
				<Preview :image="image" :focus-layer="focusLayer"/>
			</div>
			<div class="flex-1 flex flex-col gap-3 items-start">
				<a
					v-for="attr in attributes"
					class="cursor-pointer rounded bg-neutral-200 border border-neutral-400 flex items-center"
					@mouseenter="focusLayer = attr!.layer"
					@mouseleave="focusLayer = null"
					@click="nav.goto( attr!.layer, attr!.piece )"
					>
					<div class="w-20 pl-2 text-sm font-semibold">{{ attr!.layer.name }}</div>
					<div class="w-36 flex-1 text-sm py-0.5 px-2 rounded bg-white">{{ attr!.piece.name }}</div>
				</a>
			</div>
		</div>
		<div class="absolute right-0 top-0 p-2 text-neutral-400 hover:text-neutral-600 cursor-pointer transition-colors" @click="$emit('close')">
			<XIcon class="w-6 h-6"></XIcon>
		</div>
	</div>
</template>
