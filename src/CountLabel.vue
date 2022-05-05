<script setup lang="ts">
import { computed } from 'vue';
import { useCollectionStore } from './state';

const props = defineProps<{id:string}>();

const collection = useCollectionStore();

const count = computed( () => collection.counts[ props.id ] ?? 0 );

const rate = computed( () => collection.size > 0 ? count.value / collection.size : null );

</script>
<template>
<div
	v-if="rate !== null"
	class="w-9 text-center py-0.5 text-xs group-hover:bg-orange-400/20 font-bold opacity-50"
	style="font-size:10px"
	:title="`This appears in ${count} image${count===1?'':'s'} in the collection`"
	>{{ ( rate * 100 ).toLocaleString( 'en-US', { maximumFractionDigits: 3 } ) }}%</div>
</template>