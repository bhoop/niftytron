<script setup lang="ts">
import useAppNavigation from './app-navigation';
import { useCollectionStore, useDataStore, type Layer, type Piece } from './state';
import { SlickList, SlickItem } from 'vue-slicksort';
import { computed, ref } from 'vue';
import { TagIcon, CheckCircleIcon, NoSymbolIcon, HashtagIcon, PlusIcon,  } from '@heroicons/vue/24/solid';
import { Bars2Icon } from '@heroicons/vue/20/solid';
import SidebarIcon from './SidebarIcon.vue';
import SidebarField from './SidebarField.vue';
import CountLabel from './CountLabel.vue';
import Button from './Button.vue';
import SidebarHeading from './SidebarHeading.vue';
import SidebarDetail from './SidebarDetail.vue';
import SidebarBox from './SidebarBox.vue';
import CreatorField from './CreatorField.vue';
import FieldHelpIcon from './FieldHelpIcon.vue';

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

</script>
<template>
	<SidebarBox>
		<div class="relative">
			<SidebarHeading class="sticky top-0 bg-white rounded-t">
				Collection Settings
			</SidebarHeading>
			<div class="flex flex-col gap-y-2 pr-4 py-3 pl-1">
				<SidebarField label="Number of images" type="number" min="1" step="1" v-model.lazy="collection.size" class="no-arrows" help="Number of exported NFTs in your collection."/>
				<SidebarField label="Collection name" type="text" v-model="collection.name" help="The name of your collection or sub-collection eg. 'YoSkulls' or 'YoSkulls Season 1'. Will be displayed as the title of your collection."/>
				<SidebarField label="Collection family" type="text" v-model="collection.family" help="The name of the family this collection belongs to in case you're making multiple variations on a theme eg 'YoSkulls. Must be unique across your whole project and never a general term like 'cars', 'art', or similar."/>
				<SidebarField label="Symbol" type="text" v-model="collection.symbol" help="The ticker or symbol which represents your collection on the blockchain eg. 'YOSKULLS'. Twelve character limit." maxlength="12"/>
				<SidebarField label="External URL" type="text" v-model="collection.externalUrl" help="External URL is normally the link to your website."/>
				<SidebarField label="Description" type="textarea" v-model="collection.description" help="The general description for your collection that each NFT will display. 128 character limit." maxlength="128"/>
				<SidebarField label="Royalties" type="percent" v-model="collection.sellerFeeBasisPoints" help="The percentage of royalties collected from each secondary sale." step="0.01" min="0" max="100"/>
				<SidebarField label="Base NFT name" type="text" v-model="collection.prefix" help="The base name of your NFT eg. 'YoSkull #' which will name your NFTs 'YoSkull #1', 'YoSkull #2', etc."/>
				<div class="flex items-center text-sm font-semibold">
					<FieldHelpIcon help="Royalties percentage awarded to the creators from secondary sales."/>
					Secondary Royalty Split
				</div>
				<CreatorField v-model="collection.creators"/>
			</div>
		</div>

		<SidebarHeading class="sticky top-0 bg-white">Attributes</SidebarHeading>
		<SlickList axis="y" :list="layersInDisplayOrder" @update:list="sortLayers" :pressDelay="150" :distance="10">
			<SlickItem v-for="(layer,i) in layersInDisplayOrder" :key="layer.id" :index="i">
				<div
					class="group flex items-center p-2 text-sm select-none"
					@click="goto( layer )"
					>
					<div>
						<Bars2Icon class="w-3 h-3 mr-2 cursor-grab active:cursor-grabbing"/>
					</div>
					<div class="mr-auto cursor-pointer text-orange-500" title="View attribute details">{{ layer.name }} ({{ layer.pieces.length }})</div>
					<CountLabel :id="layer.id"/>
					<SidebarIcon title="This layer is required in all images" :active="layer.required">
						<CheckCircleIcon class="w-4 h-4"/>
					</SidebarIcon>
					<SidebarIcon title="This layer has tags" :active="layer.tags.length > 0">
						<TagIcon class="w-4 h-4"/>
					</SidebarIcon>
					<SidebarIcon title="This layer has blocked tags" :active="layer.blockedTags.length > 0">
						<NoSymbolIcon class="w-4 h-4"/>
					</SidebarIcon>
					<SidebarIcon :title="`This layer will only appear in ${layer.limit!} image${layer.limit===1?'':'s'}`" :active="layer.limit !== false">
						<HashtagIcon class="w-4 h-4"/>
					</SidebarIcon>
				</div>
			</SlickItem>
		</SlickList>
	</SidebarBox>
</template>