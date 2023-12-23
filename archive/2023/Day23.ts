export const useRawInput = false;

enum TileType {
	Path,
	Forest,
	Slope,
}

enum Direction {
	North,
	East,
	South,
	West,
}

const directions = {
	North: [-1, 0],
	East: [0, 1],
	South: [1, 0],
	West: [0, -1],
} as const;

const directionValues = Object.values(directions);

interface Tile {
	compressedDirections: ({ addedDepth: number; nextCol: number; nextRow: number } | null)[];
	slopeDirection: Direction | null;
	type: TileType;
}

function parseInput(lines: string[]) {
	const map: Tile[][] = [];

	for (const line of lines) {
		const tiles: Tile[] = [];
		for (const char of line) {
			let tileType: TileType;
			let slopeDirection: Tile['slopeDirection'] = null;
			switch (char) {
				case '.':
					tileType = TileType.Path;
					break;
				case '^':
					tileType = TileType.Slope;
					slopeDirection = Direction.North;
					break;
				case '>':
					tileType = TileType.Slope;
					slopeDirection = Direction.East;
					break;
				case 'v':
					tileType = TileType.Slope;
					slopeDirection = Direction.South;
					break;
				case '<':
					tileType = TileType.Slope;
					slopeDirection = Direction.West;
					break;
				default:
					tileType = TileType.Forest;
			}

			tiles.push({ type: tileType, slopeDirection, compressedDirections: [] });
		}

		map.push(tiles);
	}

	return map;
}

function getHash(row: number, col: number) {
	return `${row},${col}`;
}

function longestPathDfs(map: Tile[][], row: number, col: number, visited: Set<string>): number {
	const currentHash = getHash(row, col);
	if (visited.has(currentHash)) return Number.NEGATIVE_INFINITY;
	const current = map[row]![col]!;

	if (row === map.length - 1) return 0;

	const newVisited = new Set(visited);
	newVisited.add(currentHash);

	const possibles: number[] = [];

	for (const next of current.compressedDirections) {
		if (!next) continue;
		possibles.push(longestPathDfs(map, next.nextRow, next.nextCol, newVisited) + next.addedDepth);
	}

	return Math.max(...possibles);
}

function compressMap(map: Tile[][], startRow: number, startCol: number, bidirectionalSlopes = false) {
	const toVisit = [
		{
			row: startRow,
			col: startCol,
		},
	];

	while (toVisit.length) {
		const { row, col } = toVisit.shift()!;
		const current = map[row]![col]!;

		for (const [directionIndex, direction] of directionValues.entries()) {
			if (current.compressedDirections[directionIndex] !== undefined) continue;
			const startingNext = map[row + direction[0]]?.[col + direction[1]];
			if (!startingNext || startingNext.type === TileType.Forest) continue;
			let addedDepth = 0;
			let validAdjacents: { col: number; direction: Direction; row: number; tile: Tile }[] = [
				{ tile: startingNext, direction: directionIndex, row: row + direction[0], col: col + direction[1] },
			];
			let directional: -1 | 0 | 1 = 0;
			while (validAdjacents.length === 1) {
				addedDepth++;
				const next = validAdjacents[0]!;
				if (!bidirectionalSlopes && next.tile.type === TileType.Slope) {
					const thisDirectional = validAdjacents[0]!.direction === next.tile.slopeDirection ? 1 : -1;
					if (directional === 0) {
						directional = thisDirectional;
					} else if (directional !== thisDirectional) {
						break;
					}
				}

				validAdjacents = directionValues
					.map(([rowAdd, colAdd], index) => ({
						tile: map[next.row + rowAdd]?.[next.col + colAdd],
						direction: index,
						row: next.row + rowAdd,
						col: next.col + colAdd,
					}))
					.filter(
						(possible) =>
							possible.tile &&
							possible.tile.type !== TileType.Forest &&
							possible.direction !== (next.direction + 2) % 4,
					) as typeof validAdjacents;

				// End of compression
				if (validAdjacents.length !== 1) {
					if (next.row !== map.length - 1 && validAdjacents.length === 0) {
						current.compressedDirections[directionIndex] = null;
						break;
					}

					current.compressedDirections[directionIndex] =
						directional === -1
							? null
							: {
									addedDepth,
									nextCol: next.col,
									nextRow: next.row,
							  };
					next.tile.compressedDirections[(next.direction + 2) % 4] =
						directional === 1 ? null : { addedDepth, nextRow: row, nextCol: col };
					toVisit.push({ col: next.col, row: next.row });
					break;
				}
			}
		}
	}
}

export async function part1(lines: string[]) {
	const map = parseInput(lines);
	const startCol = map[0]!.findIndex((tile) => tile.type === TileType.Path);
	compressMap(map, 0, startCol);
	return longestPathDfs(map, 0, startCol, new Set());
}

export async function part2(lines: string[]) {
	const map = parseInput(lines);
	const startCol = map[0]!.findIndex((tile) => tile.type === TileType.Path);
	compressMap(map, 0, startCol, true);
	return longestPathDfs(map, 0, startCol, new Set());
}
