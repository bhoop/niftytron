<script setup lang="ts">
	import { computed, ref } from 'vue';
	import type { Attribute, Layer } from './state';
	import Preview from './Preview.vue';

	const props = defineProps<{ layers: Layer[] }>();
	const collectionSize = ref( 900 );

	const max = computed(() => {
		if ( props.layers.length === 0 ) return 0;
		var count = props.layers[0].pieces.length;
		for(var i = 1; i < props.layers.length; i++) {
			count *= props.layers[i].pieces.length;
		}
		return count;
	});

	const collection = computed(() => {
		let collection: Map<string, Attribute[]> = new Map();
		while ( collection.size < collectionSize.value ) {
			let item = generateNextAttribute( [...props.layers] );
			let key = item.map( attr => `${attr.layer}:${attr.value}` ).join( '/' );
			collection.set( key, item );
		}
		return Array.from(collection.values());
	});

	let stats: Map<string, number> = new Map();
	for( let attrs of collection.value ) {
		for ( let attr of attrs ) {
			const key = attr.layer + '_' + attr.value;
			stats.set( key, 1 + ( stats.get( key ) ?? 0 ) );
		}
	}
	const pctStats: { [key:string]: string } = {};
	for ( let [key,count] of stats.entries() ) {
		pctStats[key] = ( count / collection.value.length * 100 ).toFixed( 2 ) + '%';
	}

	const testvalue = ref( 1 );

	function generateNextAttribute( layers: Layer[] ): Attribute[] {
		if ( layers.length === 0 ) return [];
		// pull the next layer off of the stack
		let layer = layers.shift()!;
		// pick a random element from the layer
		const value = layer.pieces[ Math.floor( Math.random() * layer.pieces.length ) ];
		return [ { layer: layer.name, value: value.name, src: value.src }, ...generateNextAttribute( layers ) ];
	}
</script>
<template>
<div class="">
	<div class="grid grid-cols-[repeat(auto-fill,15rem)]">
		<div v-for="attributes of collection" class="h-60 border-2 rounded-sm">
			<Preview :attributes="attributes"/>
		</div>
	</div>
	<div class="whitespace-pre font-mono">{{ pctStats }}</div>
</div>
</template>