<script setup lang="ts">
	import { computed } from 'vue';
	import { XMarkIcon } from '@heroicons/vue/20/solid';

type Item = { address: string, share: number, new?: boolean };

let props = defineProps<{
		modelValue: { address: string, share: number }[],
	}>();
	let emit = defineEmits<{
		(e:'update:modelValue', value: {address:string, share:number}[]): void,
	}>();

	let items = computed<Item[]>( () => {
		return [
			...props.modelValue,
			{ address: '', share: 0, new: true }
		];
	});

	function updateAddress(index: number, address: string) {
		const newValue = [...props.modelValue];
		if ( index === props.modelValue.length ) {
			let share = props.modelValue.reduce( (remainder, item) => remainder - item.share, 100);
			newValue.push( { address, share } )
		} else {
			newValue[ index ].address = address;
		}
		emit('update:modelValue', newValue);
	}

	function updateShare( index: number, share: string ) {
		const newValue = [...props.modelValue];
		newValue[index].share = Number(share);
		emit('update:modelValue', newValue);
	}

	function removeItem( itemToRemove: Item ) {
		emit('update:modelValue', props.modelValue.filter( item => item !== itemToRemove ));
	}
</script>
<template>
	<div class="flex ml-6 h-6 relative focus-within:ring focus-within:ring-orange-100 rounded-sm border border-dotted border-neutral-400/40 focus-within:border-orange-400 focus-within:border-solid" v-for="(item, index) in items">
		<button v-if="!item.new" class="peer w-6 h-6 -ml-6 self-center text-orange-400 hover:text-orange-600" title="Remove wallet" @click="removeItem(item)">
			<XMarkIcon class="w-5 h-5"/>
		</button>
		<input
			type="text"
			:value="item.address"
			@input="e => updateAddress( index, (e.target as HTMLInputElement).value )"
			name="wallet-address"
			:placeholder="item.new ? 'add wallet address' : ''"
			class="flex-1 pl-2 text-xs text-orange-500 font-semibold outline-none pr-1 border-r border-dotted border-neutral-400/20 selection:bg-orange-300/50 placeholder-orange-500/50 min-w-0 peer-hover:line-through"
			:class="[item.new ? '' : 'border-r-0']"
			/>
		<template v-if="!item.new">
			<input
				type="number"
				:value="item.share"
				@input="e => updateShare(index, (e.target as HTMLInputElement).value)"
				class="flex-none w-16 text-xs text-orange-500 font-semibold text-right outline-none arrows-percent pr-1 selection:bg-orange-300/50 placeholder-orange-500/50 focus:placeholder-orange-500/0 peer-hover:line-through"
				step="1"
				min="0"
				max="100"
				/>
			<div class="absolute top-0.5 right-6 text-xs font-semibold pointer-events-none mt-px text-orange-500/60">%</div>
		</template>
	</div>
</template>
