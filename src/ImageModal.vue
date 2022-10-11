<script setup lang="ts">
import { XMarkIcon, StarIcon } from '@heroicons/vue/24/outline';
import { ChevronDownIcon } from '@heroicons/vue/24/solid';
import { computed, ref, unref } from 'vue';
import useAppNavigation from './app-navigation';
import Preview from "./Preview.vue";
import { type Image, type Layer, type Piece } from './state';
import { useDataStore, useGenerationStore, useCollectionStore } from './state';

const collection = useCollectionStore();
const data = useDataStore();
const generation = useGenerationStore();
const focusLayer = ref<Layer|null>(null);
const nav = useAppNavigation();

const props = defineProps<{ image:Image }>();
defineEmits<{
	(e: 'close'): void,
	(e: 'open-attr', layer: Layer, piece: Piece): void,
}>();

const layersInDisplayOrder = computed( () => {
	const arr = [...data.layers];
	arr.reverse();
	return arr;
} );

function changeImagePiece( layer: Layer, pieceName: string ) {
	const piece = pieceName === '' ? null : layer.pieces.find(p => p.name === pieceName) ?? null;
	generation.updateFavorite( props.image, layer, piece );
}

</script>
<template>
	<div class="p-5 pr-10 pt-0">
		<div class="pt-4 pb-5 flex items-center">
			<div class="text-lg">{{ collection.prefix }}{{ image.number }}</div>
			<StarIcon class="w-6 h-6 ml-2 cursor-pointer"
				:class="[image.favorite ? 'fill-orange-500 stroke-0' : 'text-orange-500']"
				@click="generation.toggleImageFavorite( image )"
				/>
		</div>
		<div class="relative flex gap-5">
			<div class="w-60 self-start flex checkered bg-white border rounded border-neutral-400">
				<Preview :image="image" :focus-layer="focusLayer"/>
			</div>
			<div class="flex-1 flex flex-col gap-3 items-start">
				<a
					v-for="layer in layersInDisplayOrder"
					class="cursor-pointer rounded bg-neutral-200 border border-neutral-400 flex items-center"
					@mouseenter="focusLayer = layer"
					@mouseleave="focusLayer = null"
					@click="nav.goto( layer, image.attributes.get(layer) )"
					>
					<div class="w-32 pl-2 text-sm font-semibold" title="Click to view attribute details">{{ layer.name }}</div>
					<div class="w-52 flex-1 text-sm py-0.5 px-2 rounded bg-white flex items-center relative">
						<span v-if="! image.attributes.has(layer)" class="text-neutral-400">None</span>
						<template v-else>{{ image.attributes.get(layer)!.name }}</template>
						<template v-if="image.favorite">
							<ChevronDownIcon class="w-5 h-5 ml-auto relative left-1 text-orange-500"/>
							<select @click.stop="" :value="image.attributes.get(layer)?.name ?? ''" @change="event => changeImagePiece(layer, unref((event.target as HTMLSelectElement).value))" class="absolute left-0 top-0 w-full h-full opacity-0">
								<option value="">None</option>
								<option v-for="piece in layer.pieces" :value="piece.name">{{ piece.name }}</option>
							</select>
						</template>
					</div>
				</a>
			</div>
		</div>
		<div class="absolute right-0 top-0 p-2 text-neutral-400 hover:text-neutral-600 cursor-pointer transition-colors" @click="$emit('close')">
			<XMarkIcon class="w-6 h-6"/>
		</div>
	</div>
</template>
