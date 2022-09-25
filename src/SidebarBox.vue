<template>
	<div class="px-2 flex flex-col">
		
		<div class="h-3 border-b bg-neutral-100 sticky top-0 z-20 flex-none"></div>
		<div class="bg-white border-x flex-grow flex-shrink"><slot/></div>
		<div class="h-3 border-t bg-neutral-100 sticky bottom-0 flex-none"></div>
	</div>
</template>