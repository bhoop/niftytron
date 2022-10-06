<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { QuestionMarkCircleIcon, ChevronDownIcon } from '@heroicons/vue/20/solid';
import FieldHelpIcon from './FieldHelpIcon.vue';

const props = defineProps<{
	label:string,
	type:'text'|'textarea'|'number'|'checkbox'|'tags'|'limit'|'select'|'percent',
	modelValue:any,
	selectValue?:string|null,
	help?: string,
	disabled?: string|false,
	suffix?: string,
}>();
const emit = defineEmits<{(e:'update:modelValue', value:any): void}>();

const inputType = computed( () => {
	if ( ! props.type ) return 'text';
	switch( props.type ) {
		case 'limit':
		case 'percent': return 'number';
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

const boxEl = ref<HTMLLabelElement>();
const labelEl = ref<HTMLDivElement>();
const shadowEl = ref<HTMLDivElement>();
const resizeObserver = ref<ResizeObserver>( new ResizeObserver( checkLabelOverlap ) );
const labelIsCollapsed = ref<boolean>(false);
function checkLabelOverlap() {
	const labelEdge = labelEl.value!.getBoundingClientRect().right;
	const shadowEdge = shadowEl.value!.getBoundingClientRect().left;
	labelIsCollapsed.value = shadowEdge < labelEdge;
}

onMounted( () => {
	resizeObserver.value.observe( shadowEl.value! );
	checkLabelOverlap();
} );
onBeforeUnmount( () => {
	resizeObserver.value.unobserve( shadowEl.value! );
} );

function showHelp() {
	alert( props.help );
}

</script>
<template>
	<label class="flex items-center relative" ref="boxEl" :title="props.help">
		<FieldHelpIcon class="flex-0" :class="(!props.help || props.help==='') && 'invisible'" :help="props.help || ''"/>
		<div v-if="type === 'checkbox'" class="h-6 w-full border border-dotted border-neutral-400/40 rounded-sm flex justify-end pr-2">
			<input
				type="checkbox"
				v-bind="$attrs"
				:checked="modelValue"
				@change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
				class="ml-auto my-1 accent-orange-500 text-orange-300 min-w-0 flex-1"
				/>
		</div>
		<template v-else-if="type === 'select'" class="h-6 w-full border border-dotted border-neutral-400/40 rounded-sm flex justify-end">
			<select
				class="peer bg-transparent appearance-none h-6 w-full border border-dotted rounded-sm pr-2 outline-none text-xs"
				:title="props.help"
				v-bind="$attrs"
				:class="[
					props.disabled
						? 'border-neutral-200/50'
						: 'border-neutral-400/40 focus:border-orange-400 focus:border-solid focus:ring focus:ring-orange-100'
				]"
				:value="modelValue"
				@change="onInput(($event.target as HTMLSelectElement).value)"
				>
				<slot/>
			</select>
			<div class="absolute left-7 right-1 h-5 font-semibold flex items-center justify-end pointer-events-none bg-white text-xs">
				<div
					:class="[
						props.disabled
							? 'text-neutral-500/50'
							: (
								modelValue
								? 'text-orange-500'
								: 'text-orange-500/50'
							)
							// : 'border-neutral-400/40 focus:border-orange-400 focus:border-solid focus:ring focus:ring-orange-100 selection:bg-orange-300/50 placeholder-orange-500/50 focus:placeholder-orange-500/0'
					]"
					>{{ selectValue }}</div>
				<ChevronDownIcon class="w-4 h-4 ml-0.5 text-orange-500"/>
			</div>
		</template>
		<input
			v-else
			:type="inputType"
			:title="props.help"
			v-bind="$attrs"
			:value="inputValue"
			@input="onInput(($event.target as HTMLInputElement).value)"
			:readonly="!!props.disabled"
			autocomplete="off"
			class="peer pr-2 h-6 w-full text-xs bg-transparent text-orange-500 font-semibold text-right outline-none rounded-sm border border-dotted"
			:class="[
				props.suffix && 'pr-5',
				type === 'percent' && 'arrows-percent pr-1',
				type === 'limit' && 'no-arrows',
				props.disabled
					? 'text-neutral-500/50 placeholder-neutral-500/50 cursor-default border-neutral-200/50'
					: 'border-neutral-400/40 focus:border-orange-400 focus:border-solid focus:ring focus:ring-orange-100 selection:bg-orange-300/50 placeholder-orange-500/50 focus:placeholder-orange-500/0'
			]"
			/>
		<div
			v-if="type === 'percent'"
			class="absolute right-6 text-xs font-semibold pointer-events-none mt-px"
			:class="[
				props.disabled
					? 'text-neutral-500/50 cursor-default'
					: 'text-orange-500/60'
			]"
		>%</div>
		<!-- label -->
		<div
			class="pl-2 h-6 flex items-center absolute left-6 top-0 bottom-0 pointer-events-none text-xs font-semibold transition-all "
			:class="[
				labelIsCollapsed ? 'text-[9px] -translate-y-0.5 translate-x-0.5 px-1 h-1.5 bg-white' : '',
				props.disabled
					? 'text-neutral-500/50'
					: 'text-neutral-600 peer-focus:font-normal'
			]"
			>{{ label }}</div>
		<div
			ref="labelEl"
			class="pl-1 pr-2 absolute left-6 top-0 bottom-0 pointer-events-none text-xs font-semibold invisible"
			>{{ label }}</div>
		<!-- width calculator -->
		<div ref="shadowEl" class="h-6 absolute right-0 top-0 pr-2 text-xs font-semibold text-right border pointer-events-none whitespace-pre invisible">{{ inputValue }}</div>
	</label>
</template>