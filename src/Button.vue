<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{color?: 'default'|'red'|'green'}>();
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
		><slot/></button>
</template>