export { useCollectionStore } from "./stores/collection";
export { useDataStore } from "./stores/data";

export interface Layer {
	name: string;
	pieces: Piece[];
	probability: string;
	tags: string;
}

export interface Piece {
	name: string;
	rarity?: number;
	tags: string;
	src: string;
	preview: string;
}

export interface Attribute {
	layer: Layer;
	piece: Piece;
}

export type Favorite = Record<string, string>;

export interface Image {
	id: number;
	attributes: Map<Layer, Piece | null>;
	key: string;
	search: string;
	favorite: Favorite | false;
}

export interface State {
	layers: Layer[];
	size: number | null;
	collection: Image[];
}
