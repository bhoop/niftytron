<script setup lang="ts">

const props = defineProps<{
	label: string,
	center?: boolean
}>();

</script>
<template>
	<div :class="[props.center && 'text-center']">
		<div class="text-[11px] text-neutral-400 leading-none border-b border-neutral-100 pb-1">{{ props.label }}</div>
		<div class="text-lg font-light -mt-px"><slot/></div>
	</div>
</template>