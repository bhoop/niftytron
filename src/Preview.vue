<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import {
	type Image,
	type Attribute,
	useDataStore,
	type Layer,
	type Piece,
	useCollectionStore,
} from "./state";
import watermarkImg from "./assets/watermark.png";

const props = defineProps<{ image: Image; focusLayer?: Layer | null }>();
const data = useDataStore();
const collection = useCollectionStore();

const layers = computed(() => {
	const renderLayers: Map<Layer, { piece: Piece; layer: Layer }[]> = new Map();
	for (const [layer, piece] of props.image.attributes) {
		if (!piece || !piece.renderLayer) continue;
		if (!renderLayers.has(piece.renderLayer))
			renderLayers.set(piece.renderLayer, [{ piece, layer }]);
		else {
			renderLayers.get(piece.renderLayer)!.push({ piece, layer });
		}
	}
	const arr: Attribute[] = [];
	for (const layer of data.layers) {
		if (
			props.image.attributes.has(layer) &&
			!props.image.attributes.get(layer)!.renderLayer
		) {
			arr.push({ layer, piece: props.image.attributes.get(layer)! });
		}
		if (renderLayers.has(layer)) {
			for (const attr of renderLayers.get(layer)!) {
				arr.push(attr);
			}
		}
	}
	return arr;
});

</script>
<template>
	<div class="relative bg-cover bg-center w-full aspect-square">
		<div v-if="!image" class="">LOADING</div>
		<template v-else>
			<img
				v-for="{ layer, piece } in layers"
				:src="piece.src"
				class="absolute left-0 top-0 w-full transition-opacity duration-500 cursor-pointer"
				:class="[focusLayer && focusLayer !== layer && 'opacity-30']"
			/>
			<img :src="watermarkImg" class="absolute left-0 top-0 w-full" />
		</template>
	</div>
</template>