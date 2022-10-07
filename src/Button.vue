<script setup lang="ts">
import { computed } from 'vue';
import { Cog6ToothIcon, ArrowPathIcon } from '@heroicons/vue/24/solid';

const props = defineProps<{
	color?: 'default'|'red'|'green',
	icon?: 'edit'|'refresh',
}>();
const colors = computed( () => {
	switch( props.color ) {
		case 'red':
			return 'text-red-100 bg-red-500 border-red-600 hover:bg-red-400 hover:border-red-500/50';
		default:
			return 'bg-orange-400 border-orange-500 hover:bg-orange-300 hover:border-orange-400/50';
	}
} );
</script>
<template>
	<button
		type="button"
		class="rounded text-xs px-1.5 py-0.5 flex items-center text-black/80 border drop-shadow active:drop-shadow-sm active:-translate-x-px active:translate-y-px transition-all select-none"
		:class="[colors]"
		>
		<div v-if="props.icon" class="mr-1 w-3 h-3">
			<Cog6ToothIcon v-if="props.icon === 'edit'"/>
			<ArrowPathIcon v-else-if="props.icon === 'refresh'"/>
		</div>
		<slot/>
	</button>
</template>