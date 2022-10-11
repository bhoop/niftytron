<script setup lang="ts">
import { computed, unref } from 'vue';
import { useGenerationStore } from './state';

const props = defineProps<{id:string}>();

const gen = useGenerationStore();

const count = computed( () => {
	try {
		return gen.counts[props.id] ?? 0;
	} catch ( err ) {}
	return 0;
} );

const rate = computed( () => {
	return gen.size > 0 ? count.value / gen.size : null;
} );

</script>
<template>
<div
	v-if="rate !== null"
	class="py-0.5 px-1 text-xs text-right group-hover:bg-orange-400/20 font-bold opacity-50"
	style="font-size:10px"
	:title="`This appears in ${count.toLocaleString()} image${count===1?'':'s'} in the collection`"
	>{{ ( rate * 100 ).toLocaleString( 'en-US', { maximumFractionDigits: 2 } ) }}%</div>
</template>