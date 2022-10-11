import hash from '../hash';
import type { WorkerData, WorkerLayer, WorkerPiece, WorkerImage } from '../stores/generation';

interface Source {
	layer: WorkerLayer;
	remaining: number;
	count: number;
	pieces: SourcePiece[];
}

interface SourcePiece {
	piece: WorkerPiece;
	remaining: number;
	count: number;
}

onmessage = async function(e) {
	const { layers, favorites: favBag, size }: WorkerData = JSON.parse(e.data);

	// initialize state
	let done: WorkerImage[] = [];
	const existing: Record<number, any> = {};
	const favorites = [...Object.entries(favBag)];

	// generate IDs
	const idlist = generateIdList(size);

	// make some lookups to make things easier
	const layerLookup: { [key: string]: WorkerLayer } = {};
	const pieceLookup: {
		[key: string]: { layer: WorkerLayer; piece: WorkerPiece };
	} = {};
	let sources: Source[] = [];
	let layerLimits: Map<string, number> = new Map();
	let limited: Array<{ layer: WorkerLayer; piece: WorkerPiece }> = [];
	for (const l of layers) {
		layerLookup[l.id] = l;
		let source: Source = {
			layer: l,
			count: 0,
			remaining: l.limit ?? Infinity,
			pieces: [],
		};
		if (l.limit) layerLimits.set(l.id, l.limit);
		for (const p of l.pieces) {
			pieceLookup[p.id] = { layer: l, piece: p };
			source.pieces.push({
				piece: p,
				count: 0,
				remaining: p.limit ?? Infinity,
			});
			// every piece should show up at least once
			limited.push({ layer: l, piece: p });
		}
		sources.push(source);
	}
	shuffle(limited);

	let failureCount = 0;
	let tryCount = 0;

	while (idlist.length > 0) {
		tryCount++;
		const attributes: Map<WorkerLayer, WorkerPiece> = new Map();
		let valid: boolean = false;
		let favorite: string | false = false;
		// if there are favorite images, process them first
		// favorite images ignore all tag blocks and/or limits
		if (favorites.length !== 0) {
			valid = true;
			const [favId, favAttributes]: [string, string[]] = favorites.shift()!;
			favorite = favId;
			for (const pieceId of favAttributes) {
				if (!pieceLookup[pieceId]) {
					continue;
				}
				const { layer, piece } = pieceLookup[pieceId];
				attributes.set(layer, piece);
			}
		} else {
			// if there are any limited-number pieces that haven't reached their limit,
			// start with one of them first.
			if (limited.length > 0) {
				const r = limited.shift()!;
				attributes.set(r.layer, r.piece);
				// move this limited item to the end of the list
				limited.push(r);
			}

			// create a list of blocked tags and used tags
			const blocks: Set<string> = new Set();
			const usedTags: Set<string> = new Set();
			for (const [layer, piece] of attributes) {
				if (layer.tags) {
					for (const t of layer.tags) usedTags.add(t);
				}
				if (layer.blockedTags) {
					for (const t of layer.blockedTags) blocks.add(t);
				}
				if (piece.blockedTags) {
					for (const t of piece.blockedTags) blocks.add(t);
				}
				if (piece.tags) {
					for (const t of piece.tags) usedTags.add(t);
				}
			}

			// fill in the rest of the attributes with random pieces
			shuffle(sources);
			try {
				for (const source of sources) {
					// don't pick a piece if it's already set
					if (attributes.has(source.layer)) continue;
					if (
						includesBlockedTags(source.layer.tags, blocks) ||
						includesBlockedTags(usedTags, source.layer.blockedTags)
					) {
						// if this layer is required, abort generating this image
						if (source.layer.required) {
							throw false;
						}
						// otherwise just skip it and move to the next layer
						else continue;
					}
					// shuffle the pieces
					shuffle(source.pieces);
					// go through the pieces and find one that works
					for (const piece of source.pieces) {
						if (
							includesBlockedTags(piece.piece.tags, blocks) ||
							includesBlockedTags(usedTags, piece.piece.blockedTags)
						)
							continue;
						attributes.set(source.layer, piece.piece);
						if (source.layer.blockedTags)
							for (const t of source.layer.blockedTags) blocks.add(t);
						if (piece.piece.blockedTags)
							for (const t of piece.piece.blockedTags) blocks.add(t);
						if (source.layer.tags)
							for (const t of source.layer.tags) usedTags.add(t);
						if (piece.piece.tags)
							for (const t of piece.piece.tags) usedTags.add(t);
					}
					// if no piece fit and this is a required layer, stop creating this image and start over
					if (source.layer.required && !attributes.has(source.layer)) {
						throw false;
					}
				}
				// we successfully generated an image
				valid = true;
			} catch (err) {
				valid = false;
			}
		}

		// If we created a valid image, make sure it's unique in the set
		let key: number = 0;
		if (valid) {
			// generate a unique hash based on the attributes in the image
			const keys = [...attributes.entries()]
				.filter(([layer]) => !layer.excludeFromKey)
				.map(([layer, piece]) => piece.id);
			keys.sort();
			key = hash(keys.join(""));
			// if this image was already generated or it is invalid (includes traits/layers with blocked tags), start over
			if (key in existing) {
				valid = false;
			}
		}

		if (!valid) {
			failureCount++;
			// if we've failed lots of times in a row to generate a valid image, stop
			if (failureCount >= size) break;
		} else {
			failureCount = 0;
			// update counts of limited-rate pieces
			for (const [layer, piece] of attributes) {
				// if this layer has a limit, update it
				if (layerLimits.has(layer.id)) {
					let newLimit = layerLimits.get(layer.id)! - 1;
					layerLimits.set(layer.id, newLimit);
					if (newLimit === 0) {
						// remove all sources that use this layer
						sources = sources.filter((s) => s.layer.id !== layer.id);
						// remove all limited pieces that are in this layer
						limited = limited.filter((l) => l.layer.id !== layer.id);
					}
				} else {
					const source = sources.find((l) => l.layer === layer);
					if (!source) continue;
					source.count++;
					source.remaining--;
					const psource = source.pieces.find((p) => p.piece === piece);
					if (!psource) continue;
					psource.count++;
					psource.remaining--;

					// if this is an unlimited piece, remove it from the "limited" list because it's been used once
					if (!psource.piece.limit) {
						limited = limited.filter((x) => x.piece !== piece);
					}
					// if this is a limited piece and it has reached its limit, remove it from the "limited" list and the source
					else if (psource.remaining <= 0) {
						limited = limited.filter((x) => x.piece !== piece);
						source.pieces = source.pieces.filter(
							(p) => p.piece !== piece
						);
					}
					// if this layer has no more pieces or its piece limit has been reached, remove it from the sources
					if (source.pieces.length === 0 || source.remaining <= 0) {
						sources = sources.filter((s) => s.layer !== layer);
					}
				}
			}

			// if we get here then we've discovered a valid image!
			// generate the preview
			let attributeIds: string[] = [];
			for( let v of attributes.values() ) {
				attributeIds.push( v.id );
			}
			const image: WorkerImage = {
				number: idlist.shift()!,
				key,
				favorite,
				attributes: attributeIds
			};
			existing[image.key] = true;
			done.push(image);

			// if we have 1000 images in the queue, push it
			if (done.length >= 1000) {
				this.postMessage({ type: "update", images: done });
				done = [];
			}
		}
	}
	// push the rest of the images
	if (done.length > 0) {
		this.postMessage({ type: "update", images: done });
	}
	this.postMessage({ type: "finish" });
}

function generateIdList(limit: number) {
	const idlist: number[] = new Array(limit);
	// fill list with IDs
	for (let i = 0; i < limit; i++) idlist[i] = i + 1;
	shuffle(idlist);
	return idlist;
}

function shuffle(arr: any[]): void {
	for (let i = arr.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		let temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
}

function includesBlockedTags(tags: string[]|Set<string>|undefined, blocks: Set<string>|string[]|undefined) {
	// if there are no tags or no blocks, then there's no check needed
	if (tags === undefined || blocks === undefined) {
		return false;
	}
	const test = [...tags];
	const check = new Set(blocks);

	return test && test.some((t) => check.has(t));
}

export {};