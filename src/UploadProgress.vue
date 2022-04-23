<script setup lang="ts">import { onBeforeUnmount, onMounted } from 'vue';

defineProps<{upload: { progress: number, message: string }}>();
onMounted( () => {
	document.body.style.overflow='hidden';
});
onBeforeUnmount( () => {
	document.body.style.overflow='';
} );
</script>
<template>
<div class="fixed z-40 top-0 left-0 h-screen w-screen backdrop-blur bg-neutral-100/75 pointer-events-auto flex flex-col items-center justify-center">
	<div class="flex w-1/3 px-2 py-2"><div class="mr-auto">Uploading</div>{{ upload.message }}</div>
	<div class="relative w-1/3 h-2 border border-neutral-600 rounded-full">
		<div class="absolute left-0 top-0 w-full h-full bg-orange-200/80 rounded-full"/>
		<div class="relative h-full rounded-full bg-orange-500 transition-all" :style="`width:${upload.progress*100}%`">
			<div class="absolute -inset-1 animate-pulse bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg blur opacity-25"></div>
		</div>
	</div>
</div>
</template>
