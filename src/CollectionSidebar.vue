<script setup lang="ts">
import useAppNavigation from './app-navigation';
import { useCollectionStore, useDataStore, type Layer, type Piece } from './state';
import { SlickList, SlickItem } from 'vue-slicksort';
import { computed, ref } from 'vue';
import { TagIcon, CheckCircleIcon, BanIcon, HashtagIcon, PlusIcon, TrashIcon } from '@heroicons/vue/solid';
import SidebarIcon from './SidebarIcon.vue';
import SidebarField from './SidebarField.vue';
import CountLabel from './CountLabel.vue';
import Button from './Button.vue';

const collection = useCollectionStore();

let { goto } = useAppNavigation();
let data = useDataStore();

function reverse<T>( arr: T[] ): T[] {
	let arr2 = [ ...arr ];
	arr2.reverse();
	return arr2;
}

const layersInDisplayOrder = computed( () => reverse( data.layers ) );

function sortLayers( newSortOrder: Layer[] ) {
	data.layers = reverse( newSortOrder );
}

const creatorsValue = computed( () => {
	let sum = 0;
	return collection.creators.map( (c, i) => {
		if ( i < collection.creators.length - 1 ) {
			sum += c.share;
			return {...c, readonly:false};
		}
		return {...c, share: 100 - sum, readonly: true};
	});
} );

function addCreator() {
	if ( collection.creators.every( c => c.address !== '' ) ) {
		collection.creators.push({address:'', share:collection.creators.reduce((p,v)=>p + v.share, 0)});
	}
}

function updateCreatorAddress(index:number, wallet:string) {
	if(wallet.trim() === '') {
		collection.creators.splice(index, 1);
	} else {
		collection.creators[index].address = wallet.trim();
	}
}
function updateCreatorShare(index:number, share:number) {
	collection.creators[index].share = share;
	collection.creators[collection.creators.length-1].share = collection.creators.slice(0,  collection.creators.length-1).reduce((p,v) => p + v.share, 0);
}

</script>
<template>
	<div class="text-sm">
		<SidebarField label="Number of images" type="number" min="1" step="1" v-model.lazy="collection.size"/>
		<SidebarField label="Title" type="text" v-model="collection.name"/>
		<SidebarField label="Family" type="text" v-model="collection.family"/>
		<SidebarField label="Symbol" type="text" v-model="collection.symbol"/>
		<SidebarField label="External URL" type="text" v-model="collection.externalUrl"/>
		<SidebarField label="Description" type="text" v-model="collection.description"/>
		<SidebarField label="Seller Fee Basis Points" type="number" step="1" v-model="collection.sellerFeeBasisPoints" class="no-arrows"/>
		<SidebarField label="Image Title Prefix" type="text" v-model="collection.prefix"/>
		<div class="py-1 px-2 font-semibold flex items-end">
			Creators
			<div class="ml-auto text-xs font-light mr-4">Share</div>
		</div>
		<div class="pl-2 pr-3">
			<div v-for="(creator, index) in creatorsValue" class="border-b border-neutral-400/40 border-dotted relative flex">
				<input
					:value="creator.address"
					@change="ev => updateCreatorAddress(index, (ev.target as HTMLInputElement).value)"
					type="text"
					placeholder="wallet address"
					class="p-1 border-none bg-transparent flex-1 text-xs text-orange-600 font-semibold"
					/>
				<input
					:value="creator.share"
					@input="ev => updateCreatorShare(index, Number((ev.target as HTMLInputElement).value))"
					:readonly="creator.readonly"
					type="number"
					min="0" max="100" step="1"
					placeholder="100"
					class="no-arrows p-1 border-none bg-transparent w-10 text-right text-xs text-orange-600 font-semibold pr-3 invalid:border-red-500 invalid:border invalid:ring invalid:ring-red-500/75 rounded read-only:text-neutral-400 read-only:pointer-events-none"
					/>
				<div class="text-xs font-semibold mt-1 -ml-3 relative left-px text-neutral-400 pointer-events-none">%</div>
			</div>
			<Button class="mt-1" @click="addCreator()">
				<PlusIcon class="w-4 h-4 mr-1 -ml-1"/>
				add creator
			</Button>
		</div>


		<div class="py-1 px-2 mt-1 font-semibold">Layers</div>
		<SlickList axis="y" :list="layersInDisplayOrder" @update:list="sortLayers" :pressDelay="150" :distance="10">
			<SlickItem v-for="(layer,i) in layersInDisplayOrder" :key="layer.id" :index="i">
				<div
					class="group flex items-center p-2 cursor-pointer hover:text-orange-600 border-t border-neutral-400/50 bg-neutral-300 text-sm select-none"
					@click="goto( layer )"
					>
					<div class="mr-auto">{{ layer.name }} ({{ layer.pieces.length }})</div>
					<CountLabel :id="layer.id"/>
					<SidebarIcon title="This layer is required in all images" :active="layer.required">
						<CheckCircleIcon class="w-4 h-4"/>
					</SidebarIcon>
					<SidebarIcon title="This layer has tags" :active="layer.tags.length > 0">
						<TagIcon class="w-4 h-4"/>
					</SidebarIcon>
					<SidebarIcon title="This layer has blocked tags" :active="layer.blockedTags.length > 0">
						<BanIcon class="w-4 h-4"/>
					</SidebarIcon>
					<SidebarIcon :title="`This layer will only appear in ${layer.limit!} image${layer.limit===1?'':'s'}`" :active="layer.limit !== false">
						<HashtagIcon class="w-4 h-4"/>
					</SidebarIcon>
				</div>
			</SlickItem>
		</SlickList>
		<div class="flex">
			<label class="mx-auto flex gap-2 items-center relative p-1 rounded-lg bg-orange-500 text-orange-900 cursor-pointer">
				<input type="file" class="absolute hidden" multiple accept="image/pdf" @change="event => data.upload( ( event.target as HTMLInputElement).files )"/>
				<PlusIcon class="h-4 w-4"/>
				add images
			</label>
		</div>
	</div>
</template>