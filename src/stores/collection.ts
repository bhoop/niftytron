import type { Layer, Piece, Image, Favorite, FavoriteBag } from "../state";
import { acceptHMRUpdate, defineStore } from "pinia";
import { useDataStore } from "./data";
import { computed, ref, unref, watch, watchEffect } from "vue";
import { useCollectionGenerator } from "./useCollectionGenerator";
import uid from "../uid";
import throttle from "../throttle";

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
	watch( collectionKey, regenerate );

	const images = computed(() => {
		console.log('compute images', generator.images.value.size);
		let arr = [...generator.images.value.values()].slice(0, size.value );
		if ( arr.length < size.value ) arr = arr.concat( new Array( size.value - arr.length ).fill( null ) );
		arr.sort( ( a, b ) => {
			if ( a === null && b !== null ) return 1;
			if ( a !== null && b === null ) return -1;
			if ( a === null && b === null ) return 0;
			if ( a.favorite !== b.favorite ) return a.favorite ? -1 : 1;
			return 0;
		} );
		return arr;
	});

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
		// // remove the old key
		// imageset.value.delete(image.key);
		// favorites.value = favorites.value.filter( fav => image.favorite !== fav );
		// // add the new image
		// const map: Image["attributes"] = new Map(image.attributes);
		// if (piece === null) map.delete(layer);
		// else map.set(layer, piece);
		// const favoriteObject = getImageFavorite( map );
		// const newImage = makeImage(image.id, map, favoriteObject);
		// imageset.value.set( newImage.key, newImage );
		// favorites.value.push( favoriteObject );
	}

	async function download() {
		const imgdataCache = new Map();
		const imgdata = async (layer: Layer, piece: Piece) => {
			const key = `${layer.name}//${piece.name}`;
			if (!imgdataCache.has(key)) {
				const image = new Image();
				await new Promise((resolve) => {
					image.onload = () => resolve(image);
					image.src = piece.src;
				});
				imgdataCache.set(key, image);
			}
			return imgdataCache.get(key);
		};

		try {
			const dirHandle = await (window as any).showDirectoryPicker({
				writeable: true,
			});
			console.log("gotDirHandle", dirHandle);
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
				for (let i = 0; i < chunkSize; i++) {
					const image = images.value[index + i];
					// clear the canvas
					context.clearRect(0, 0, canvas.width, canvas.height);
					// stack layers onto the canvas
					for (const layer of data.layers) {
						const piece = image.attributes.get(layer);
						if (!piece) continue;
						const img = await imgdata(layer, piece);
						context.drawImage(img, 0, 0, 1000, 1000);
					}
					// write the image to a file
					const filename = image.number + ".png";
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

	return {
		images,
		size,
		isGenerating: generator.status.value.running,
		generating: generator.status,
		regenerate,
		changeSize,
		toggleImageFavorite,
		updateFavorite,
		download,
		downloading,
		stopDownload,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useCollectionStore, import.meta.hot));
}
