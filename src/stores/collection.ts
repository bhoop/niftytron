import type { Layer, Piece, Image, Favorite, FavoriteBag } from "../state";
import { acceptHMRUpdate, defineStore } from "pinia";
import { useDataStore } from "./data";
import { computed, ref, unref, watch, watchEffect } from "vue";
import { useCollectionGenerator } from "./useCollectionGenerator";
import uid from "../uid";

export const useCollectionStore = defineStore("collection", () => {
	const size = ref(1000);
	const data = useDataStore();
	const favorites = ref<FavoriteBag>({});
	const downloading = ref({
		running: false,
		destination: "",
		done: 0,
		total: 0,
	});
	const prefix = ref('Skull #');
	const name = ref('');
	const family = ref('');
	const symbol = ref('');
	const description = ref('');
	const sellerFeeBasisPoints = ref(0);
	const creators = ref<{address:string, share:number}[]>([]);

	const generator = useCollectionGenerator();
	const collectionKey = computed( () => {
		return `${size.value}:${data.key}`;
	});
	function regenerate() {
		generator.regenerate({
			layers: data.layers,
			size: Math.min( data.combinationCount, size.value),
			favorites: favorites.value,
		});
	}

	const images = computed(() => {
		let arr = [...generator.images.value.values()].slice(
			0,
			Math.min(size.value, data.combinationCount)
		);
		arr.sort( ( a, b ) => {
			if ( a === null && b !== null ) return 1;
			if ( a !== null && b === null ) return -1;
			if ( a === null && b === null ) return 0;
			if ( a.favorite !== b.favorite ) return a.favorite ? -1 : 1;
			return 0;
		} );
		return arr;
	});

	const counts = computed( () => {
		const map: Record<string, number> = {};
		const incr = ( id: string ) => {
			if ( ! map[id] ) map[id] = 1;
			else map[id]++;
		}
		for ( const image of generator.images.value.values() ) {
			for ( const [ layer, piece ] of image.attributes ) {
				incr( layer.id );
				if ( piece ) incr( piece.id );				
			}
		}
		return map;
	} );

	function changeSize(newSize: number) {
		const num = Number(newSize);
		if (num > 0) {
			size.value = num;
		}
	}

	function getImageFavorite(attributes: Image["attributes"]) {
		const arr: string[] = [];
		for (const [layer, piece] of attributes) {
			if (piece) arr.push(piece.id);
		}
		return arr;
	}

	function toggleImageFavorite(image: Image) {
		if (image.favorite) {
			delete favorites.value[image.favorite];
			image.favorite = false;
		} else {
			const key = uid();
			const obj = getImageFavorite(image.attributes);
			favorites.value[key] = obj;
			image.favorite = key;
		}
	}

	function updateFavorite(image: Image, layer: Layer, piece: Piece | null) {
		// update
		if ( piece === null ) {
			image.attributes.delete( layer );
		} else {
			image.attributes.set( layer, piece );
		}
		favorites.value[ image.favorite as string ] = getImageFavorite( image.attributes );
	}

	async function download() {
		const imgdataCache = new Map();
		const imgdata = async (layer: Layer, piece: Piece) => {
			if (!imgdataCache.has(piece.id)) {
				const image = new Image();
				await new Promise((resolve) => {
					image.onload = () => resolve(image);
					image.src = piece.src;
				});
				imgdataCache.set(piece.id, image);
			}
			return imgdataCache.get(piece.id);
		};

		try {
			const dirHandle = await (window as any).showDirectoryPicker({
				writeable: true,
			});
			downloading.value = {
				running: true,
				destination: dirHandle.name,
				done: 0,
				total: unref(size),
			};
			let index = 0;
			let chunkSize = 10;
			let canvas = document.createElement("canvas");
			canvas.width = 1000;
			canvas.height = 1000;
			let context = canvas.getContext("2d")!;
			while (
				downloading.value.running === true &&
				downloading.value.done < size.value
			) {
				// generate images in chunks so we don't lock up the main thread
				for (let i = 0, z = images.value.length; i < chunkSize && (index+i) < z; i++) {
					const image = images.value[index + i];
					// clear the canvas
					context.clearRect(0, 0, canvas.width, canvas.height);
					// stack layers onto the canvas
					const customRenderLayer: Map<Layer, [Layer,Piece][]> = new Map();
					for (const [layer,piece] of image.attributes) {
						if (!piece || !piece.renderLayer) continue;
						if (!customRenderLayer.has(piece.renderLayer))
							customRenderLayer.set(piece.renderLayer, [[layer,piece]]);
						else customRenderLayer.get(piece.renderLayer)!.push([layer,piece]);
					}
					for (const layer of data.layers) {
						if (image.attributes.has(layer) && !image.attributes.get(layer)!.renderLayer) {
							context.drawImage(
								await imgdata(layer, image.attributes.get(layer)!),
								0, 0, 1000, 1000
							);
						}
						if (customRenderLayer.has(layer)) {
							for (const [layer2,piece] of customRenderLayer.get(layer)!) {
								context.drawImage(
									await imgdata(layer2, piece),
									0, 0, 1000, 1000
								);
							}
						}
					}
					// write the image to a file
					const filename = (image.number - 1) + ".png";
					const fileHandle = await dirHandle.getFileHandle(filename, {
						create: true,
					});
					const writable = await fileHandle.createWritable({
						keepExistingData: false,
					});
					const canvasBlob = await new Promise((resolve) =>
						canvas.toBlob(resolve, "image/png", 1)
					);
					await writable.write(canvasBlob);
					await writable.close();

					// write the metadata to a file
					const metadata = {
						name: prefix.value + image.number,
						symbol: symbol.value,
						image: filename,
						properties: {
							files: [{ uri: filename, type: "image/png" }],
							category: "image",
							creators: creators.value.map( c => ({ ...c, share: Number(c.share) }) ),
						},
						description: description.value,
						seller_fee_basis_points: Number(sellerFeeBasisPoints.value) || 0,
						attributes: [...image.attributes].map( ([layer,piece]) => ({ trait_type: layer.name, value: piece!.name }) ),
						collection: {
							name: name.value,
							family: family.value,
						},
					};
					const mFilename = (image.number - 1)+".json";
					const mHandle = await dirHandle.getFileHandle( mFilename, { create: true } );
					const mWritable = await mHandle.createWritable({ keepExistingData: false });
					await mWritable.write( JSON.stringify( metadata, null, '\t' ) );
					await mWritable.close();

					downloading.value.done++;
				}
				index += chunkSize;
			}
			downloading.value.running = false;
		} catch (err: any) {
			if (err instanceof DOMException && err.name === "AbortError") {
				// user canceled directory selection
			} else {
				alert("An error occured (see console)");
				console.error(err);
			}
		}
	}

	function stopDownload() {
		downloading.value.running = false;
	}

	function getStateForStorage() {
		return JSON.parse(JSON.stringify({
			prefix: prefix.value,
			symbol: symbol.value,
			name: name.value,
			family: family.value,
			description: description.value,
			sellerFeeBasisPoints: sellerFeeBasisPoints.value,
			creators: creators.value,
			size: size.value,
			favorites: favorites.value,
			images: generator.getImagesForCache(),
		}));
	}

	function setStateFromStorage(cache: any, layers: Layer[]) {
		prefix.value = cache.prefix;
		symbol.value = cache.symbol;
		name.value = cache.name;
		family.value = cache.family;
		description.value = cache.description;
		sellerFeeBasisPoints.value = cache.sellerFeeBasisPoints;
		creators.value = cache.creators;
		favorites.value = cache.favorites;
		size.value = cache.size;
		// images
		generator.restoreImagesFromCache(cache.images, layers);
	}

	return {
		prefix,
		symbol,
		name,
		family,
		description,
		sellerFeeBasisPoints,
		creators,
		images,
		size,
		counts,
		isGenerating: generator.status.value.running,
		generating: generator.status,
		regenerate,
		changeSize,
		toggleImageFavorite,
		updateFavorite,
		download,
		downloading,
		stopDownload,
		getStateForStorage,
		setStateFromStorage,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useCollectionStore, import.meta.hot));
}
