<script setup lang="ts">
import useAppNavigation from './app-navigation';

defineProps<{ open: boolean }>();
defineEmits<{ (e:'select'): void }>();

const nav = useAppNavigation();

</script>
<template>
<div v-if="open" class="z-10 flex-none h-10 px-2 bg-gradient-to-b from-neutral-400 via-neutral-300 to-neutral-300/5 flex items-center justify-center font-semibold"><slot/></div>
<div v-else class="z-10 flex-none h-10 px-2 flex items-center justify-center bg-gradient-to-t from-orange-300 via-orange-200 to-neutral-300 font-semibold border-b border-orange-500 text-orange-900">
	<a @click="$emit('select')" class="cursor-pointer p-2"><slot/></a>
</div>
</template>