<script setup lang="ts">
	import { QuestionMarkCircleIcon } from '@heroicons/vue/20/solid';

	let props = defineProps<{help:string}>();

	function showHelp() {
		alert( props.help );
	}
</script>
<template>
	<div class="w-6 h-4 px-1" :title="props.help" @click="showHelp()">
		<QuestionMarkCircleIcon/>
	</div>
</template>