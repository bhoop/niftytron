<script setup lang="ts">
import {
	computed,
	onBeforeUnmount,
	onMounted,
	reactive,
	ref,
	unref,
	watchEffect,
} from "vue";
import type { Image } from "./state";
import Preview from "./Preview.vue";
import PreviewCanvas from "./PreviewCanvas.vue";
import Grid from "vue-virtual-scroll-grid";

const props = defineProps<{ images: Image[] }>();
const emit = defineEmits<{ (e: 'select-image', image:Image): void }>();

function throttle( fn, timer = 300 ) {
	if ( ! fn._busy ) {
		fn._busy = true;
		setTimeout( () => {
			fn._busy = false;
			fn();
		}, timer );
	}
}

let probe = ref<HTMLDivElement>();
let box = ref<HTMLDivElement>();
let grid = ref( { rows: 0, cols: 0 } );
function updateRenderboxDimensions() {
	if ( probe.value && box.value ) {
		let cols = Math.floor( box.value.offsetWidth / probe.value.offsetWidth );
		console.log('calc rows', props.images.length, cols);
		grid.value = {
			cols,
			rows: Math.ceil( props.images.length / cols ),
		};
	}
}
let resizeObserver = new ResizeObserver( () => { 
	throttle( updateRenderboxDimensions );
} );

onMounted( () => {
	updateRenderboxDimensions();
	resizeObserver.observe( box.value! );
});

onBeforeUnmount(() => {
	resizeObserver.unobserve( box.value! );
});

let visibleImages = computed(()=>{
	return props.images;
});

function makePageProvider( images: Image[] ) {
	return ( num: number, len: number ) => Promise.resolve( images.slice( num * len, ( num+1)*len ) );
}
let gridPageProvider = computed( () => makePageProvider( props.images ) );

</script>
<template>
	<div class="w-60 absolute pointer-events-none" ref="probe"/>
	<div ref="box" class="overflow-visible absolute top-12 left-80 right-0 bottom-0 grid p-1.5" style="grid-template-columns: repeat(auto-fill, 15rem)">
		<Grid
			:length="props.images.length"
			:pageSize="100"
			:pageProvider="gridPageProvider"
			class="grid p-1.5 justify-items-center justify-around"
			:style="`grid-template-columns: repeat(${grid.cols}, 15rem)`"
			>
			<template v-slot:probe><div class="w-60 h-60" ref="probe"/></template>
			<template v-slot:placeholder="{style}"><div class="w-60 h-60 bg-red-200" :style="style">WAIT</div></template>
			<template v-slot:default="{item, style, index}">
				<div
					class="w-60 h-60 p-1.5 relative grid grid-cols-1 grid-rows-1 items-stretch justify-items-stretch hover:p-0.5 transition-all cursor-pointer"
					:style="style"
					@click="emit('select-image', item)"
					>
					<Preview :image="item" class="col-start-1 row-start-1"/>
				</div>
			</template>
		</Grid>
	</div>
	<!-- <div class="bg-blue-400/50 mt-12 w-12" :style="`height:${state.scrollHeight}px`"/>
	<div ref="renderBox" class="bg-green-500/50 fixed left-80 top-12 right-3 bottom-0 grid overflow-hidden" :style="`grid-template-columns:repeat(${renderBoxDims.cols}, 1fr); grid-auto-rows: minmax(min-content, max-content)`">
		<div v-for="img in state.images" class="bg-yellow-200 aspect-square">{{ img }}</div>
	</div> -->
</template>
<!--
<template>
	<div class="p-5 relative">
		<div
			class="w-full absolute top-0 left-0 h-full pointer-events-none"
			ref="widthRuler"
		/>
		<div :style="[`min-height:calc(15rem*${container.rows})`]">
			<div
				id="window"
				class="grid grid-cols-[repeat(auto-fill,15rem)]"
				:style="`position:relative; top:${offset * cellSize}px`"
			>
				<div v-for="image of displaySlice" :key="image.key" class="h-60 flex">
					<div class="m-px self-stretch flex-1 border border-neutral-500/30 bg-neutral-100/50" :class="[image && image.favorite !== false && 'bg-radial from-orange-400 to-orange-100']">
						<Preview :image="image" @click="onClickImage(image)" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
-->