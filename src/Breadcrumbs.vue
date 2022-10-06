<script setup lang="ts">
import { Layer, Piece } from './state';
import { HomeIcon, ChevronRightIcon } from '@heroicons/vue/20/solid';

const props = defineProps<{
	root: string,
	layers: Layer[],
	layer?: Layer | null,
	piece?: Piece | null
}>();

const emit = defineEmits<{ (e: 'nav', layer?: Layer, piece?: Piece): void }>();

</script>
<template>
	<div class="flex items-center font-semibold">
		<div v-if="!props.layer" class="flex items-center ml-1">
			<HomeIcon class="w-4 h-4 mr-1"/>
			{{ props.root }}
		</div>
		<button
			v-else
			class="flex items-center -ml-1 py-2 font-semibold text-orange-500 hover:text-orange-700 active:text-orange-400 mr-2"
			@click="emit('nav')"
			title="View collection details"
			>
			<HomeIcon class="w-4 h-4 ml-2 mr-1 transition-all"/>
			{{ props.root }}
		</button>
		
		<template v-if="props.layer">
			<ChevronRightIcon class="w-4 h-4"/>
			<div v-if="!props.piece" class="px-2">{{ props.layer.name }}</div>
			<button v-else title="View attribute details" class=" py-1 px-2 font-semibold text-orange-500 hover:text-orange-700 active:text-orange-400" @click="emit('nav', props.layer)">{{ props.layer.name }}</button>
		</template>

		<template v-if="props.piece">
			<ChevronRightIcon class="w-4 h-4 mr-1"/>
			{{ piece.name }}
		</template>
	</div>
</template>
