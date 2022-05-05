<script setup lang="ts">
defineProps<{ active: boolean }>();
</script>
<template>
	<div class="self-stretch px-0.5 flex items-center" :class="[active ? 'text-neutral-600 group-hover:text-orange-600/50' : 'pointer-events-none text-neutral-400/30']">
		<slot/>
	</div>
</template>
