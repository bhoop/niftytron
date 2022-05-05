<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { SelectorIcon } from "@heroicons/vue/solid";

const props = defineProps<{label:string, type:'text'|'number'|'checkbox'|'tags'|'limit'|'select', modelValue:any, selectValue?:string|null}>();
const emit = defineEmits<{(e:'update:modelValue', value:any): void}>();

const inputType = computed( () => {
	if ( ! props.type ) return 'text';
	switch( props.type ) {
		case 'limit': return 'number';
		case 'tags': return 'text';
		default: return props.type;
	}
} );

const inputValue = computed( () => {
	if( props.type === 'tags' ) return props.modelValue.join( ' ' );
	if ( props.type === 'limit' && props.modelValue === false ) return '';
	return props.modelValue;
} );

let timer = 0;
function onInput(newValue: any) {
	if ( props.type === 'tags' ) {
		clearTimeout(timer);
		timer = setTimeout( () => {
			let str = newValue.replace(/^[\s,]+/, '').replace(/[\s,]+$/, '');
			emit('update:modelValue', str === '' ? [] : str.split(/[\s,]+/));
		}, 500);
	}
	else if ( props.type === 'limit' && newValue === '' ) {
		emit( 'update:modelValue', false );
	}
	else if ( props.type === 'number' ) {
		emit( 'update:modelValue', Number( newValue ) );
	}
	else {
		emit( 'update:modelValue', newValue );
	}
}

</script>
<template>
	<label class="flex items-center pl-1 pr-2 relative">
		<div class="absolute left-2 right-1 pointer-events-none flex items-center">
			<div class="py-1 font-semibold">{{ label }}</div>
			<div class="h-0 flex-1 border-t border-neutral-400/40 border-dotted relative top-2 mx-2"/>
			<div v-if="type === 'select'" class="absolute right-2 text-xs font-semibold flex items-center">
				<div :class="[modelValue ? 'text-orange-600' : 'text-neutral-400']">{{ selectValue }}</div>
				<SelectorIcon class="w-3 h-3 ml-0.5"/>
			</div>
		</div>
		<input
			v-if="type === 'checkbox'"
			type="checkbox"
			v-bind="$attrs"
			:checked="modelValue"
			@change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
			class="ml-auto my-1"
			/>
		<select v-else-if="type === 'select'" class="mr-3 w-full opacity-0" :value="modelValue" @change="onInput(($event.target as HTMLSelectElement).value)">
			<slot/>
		</select>
		<input
			v-else
			:type="inputType"
			v-bind="$attrs"
			:value="inputValue"
			@input="onInput(($event.target as HTMLInputElement).value)"
			class="w-full text-xs p-1 no-arrows bg-transparent text-orange-600 font-semibold text-right"
			/>
	</label>
</template>