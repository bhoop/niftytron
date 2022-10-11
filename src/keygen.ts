import { unref } from 'vue';
import type { Layer } from "./state";

export function createKey(size: number, layers: Layer[] ) {
	let lArr = [...unref(layers)];
	lArr.sort((a, b) => a.id.localeCompare(b.id));
	return size + '/' + lArr
		.map((layer) => {
			return [
				layer.required ? 1 : 0,
				layer.limit || "x",
				layer.tags.join("|"),
				layer.blockedTags.join("|"),
				layer.pieces
					.map((piece) => {
						return [
							piece.limit || "x",
							piece.tags.join("|"),
							piece.blockedTags.join("|"),
						].join(":");
					})
					.join(":"),
			].join(":");
		})
		.join("/");
}
