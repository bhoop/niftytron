export { useCollectionStore } from "./stores/collection";
export { useDataStore } from "./stores/data";

export interface Layer {
	id: string;
	name: string;
	pieces: Piece[];
	limit: false|number;
	required: boolean;
	tags: string[];
	blockedTags: string[];
}

export interface Piece {
	id: string;
	name: string;
	limit: false|number;
	tags: string[];
	blockedTags: string[];
	src: string;
	preview: string;
}

export interface Attribute {
	layer: Layer;
	piece: Piece;
}

export interface FavoriteBag {
	[uid: string]: string[];
}

export type Favorite = string[];

export interface Image {
	number: number;
	attributes: Map<Layer, Piece | null>;
	key: number;
	favorite: string | false;
}

export interface State {
	layers: Layer[];
	size: number | null;
	collection: Image[];
}
