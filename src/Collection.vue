<script setup lang="ts">
import {
	computed,
	onBeforeUnmount,
	onMounted,
	reactive,
	ref,
	unref,
} from "vue";
import type { Image } from "./state";
import Preview from "./Preview.vue";

const props = defineProps<{ images: Image[] }>();
const emit = defineEmits<{ (e: 'select-image', image:Image): void }>();

const cellSize = 240;
const widthRuler = ref();
const state = reactive({ scroll: 0, top: 0, width: 0 });
const tmpScroll = ref({scroll:0, top:0});

const container = computed(() => {
	// how many images can we fit in a row?
	const cols = Math.floor(state.width / cellSize);
	// how many rows will it take to hold all the images?
	const rows = Math.ceil(props.images.length / cols);
	return { rows, cols };
});

const offset = computed(() => {
	if (widthRuler.value) {
		// if ( widthRuler.value.getBoundingClientRect().top * -1 < cellSize ) return 0;
		const ydiff = state.scroll + widthRuler.value.getBoundingClientRect().top;
		const above = Math.floor((state.scroll - ydiff) / cellSize) - 10;
		return Math.max(0, above);
	} else {
		return 0;
	}
});

const displaySlice = computed(() => {
	const start = offset.value * container.value.cols;
	return props.images.slice(start, start + container.value.cols * 30 );
});

const scrollListener = () => {
	tmpScroll.value = { scroll: window.scrollY, top: widthRuler.value.getBoundingClientRect().top };
	requestAnimationFrame( () => {
		state.scroll = tmpScroll.value.scroll;
		state.top = tmpScroll.value.top;
	} );
};
const resizeListener = ([entry]: ResizeObserverEntry[]) => {
	state.width = entry.contentRect.width;
};

const resizeObserver = new ResizeObserver(resizeListener);

onMounted(() => {
	// listen to scroll events
	state.scroll = window.scrollY;
	window.addEventListener("scroll", scrollListener);
	// listen for resizes
	resizeObserver.observe(widthRuler.value);
});

onBeforeUnmount(() => {
	window.removeEventListener("scroll", scrollListener);
	resizeObserver.unobserve(widthRuler.value);
});

function onClickImage( image: Image ) {
	if ( image && image.attributes.size > 0 ) {
		emit( 'select-image', image );
	}
}
</script>
<template>
	<div class="p-5 relative">
		<div
			class="w-full absolute top-0 left-0 h-screen pointer-events-none"
			ref="widthRuler"
		/>
		<div :style="[`min-height:calc(15rem*${container.rows})`]">
			<div
				id="window"
				class="grid grid-cols-[repeat(auto-fill,15rem)]"
				:style="`position:relative; top:${offset * cellSize}px`"
			>
				<div v-for="image of displaySlice" class="h-60 flex">
					<div class="m-px self-stretch flex-1 border border-neutral-500/30 bg-neutral-100/50" :class="[image && image.favorite !== false && 'bg-radial from-orange-400 to-orange-100']">
						<Preview :image="image" @click="onClickImage(image)" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
