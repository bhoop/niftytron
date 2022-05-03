<script setup lang="ts">
import { TagIcon } from '@heroicons/vue/outline';
const prop = defineProps<{modelValue: string}>();
const emit = defineEmits<{(e:'update:modelValue', value:string): void}>();
</script>
<template>
<div class="relative rounded bg-neutral-200 border border-neutral-400 flex" title="Tags">
	<TagIcon class="h-6 w-6 mx-1 text-neutral-400 mt-[calc(0.25rem+1px)]"/>
	<div class="text-transparent flex-1 my-px py-1 pr-2 pl-2 bg-white whitespace-pre-wrap rounded min-h-[32px]">{{ modelValue }}</div>
	<textarea
		placeholder="tags"
		class="resize-none py-1 pl-10 pr-2 rounded bg-transparent absolute left-0 top-0 w-full h-full overflow-hidden"
		:value="modelValue"
		@input="ev => $emit('update:modelValue', (ev.target as HTMLInputElement).value)"
		/>
</div>
</template>
