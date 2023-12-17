export const useRawInput = false;

const enum Direction {
	Right,
	Down,
	Left,
	Up,
}

interface Node {
	heatLoss: number;
	row: number;
	col: number;
	direction: Direction;
	forwardCount: number;
}

const adjacentNodes = [
	[0, 1],
	[1, 0],
	[0, -1],
	[-1, 0],
] as const;

function parseInput(lines: string[]) {
	return lines.map((line) => line.split('').map(Number));
}

function getHash(row: number, col: number, direction: Direction, forwardCount: number) {
	return `${row}.${col}.${direction}.${forwardCount}`;
}

function processNodes(map: number[][], minForward = 1, maxForward = 3) {
	const visited = new Set<string>();
	const toVisit: Node[] = [{ heatLoss: 0, row: 0, col: 0, direction: Direction.Right, forwardCount: 0 }];
	const heatLosses = new Map<string, number>();

	while (toVisit.length) {
		const { heatLoss, row, col, direction, forwardCount } = toVisit.shift()!;
		if (row === map.length - 1 && col === map[0]!.length - 1 && forwardCount >= minForward) return heatLoss;
		const hash = getHash(row, col, direction, forwardCount);
		if (visited.has(hash)) continue;
		for (const [dir, coords] of adjacentNodes.entries()) {
			// Can't turn around
			if ((direction + 2) % 4 === dir) continue;
			// Can't go farther than maxForward in the current direction
			if (direction === dir && forwardCount === maxForward) continue;
			// Can't go less than min forward in current direction
			if (direction !== dir && forwardCount < minForward) continue;

			const nextRow = row + coords[0];
			const nextCol = col + coords[1];
			const nextNode = map[nextRow]?.[nextCol];
			if (nextNode === undefined) continue;

			const nextForward = dir === direction ? forwardCount + 1 : 1;
			const nextNodeHash = getHash(nextRow, nextCol, dir, nextForward);
			if (visited.has(nextNodeHash)) continue;
			const nextNodePotentialLoss = heatLoss + nextNode;

			const existing = heatLosses.get(nextNodeHash);
			if (!existing || existing > nextNodePotentialLoss) {
				heatLosses.set(nextNodeHash, nextNodePotentialLoss);
			} else {
				continue;
			}

			const insertPosition = toVisit.findLastIndex((node) => node.heatLoss < nextNodePotentialLoss);

			toVisit.splice(insertPosition + 1, 0, {
				row: nextRow,
				col: nextCol,
				direction: dir,
				forwardCount: nextForward,
				heatLoss: nextNodePotentialLoss,
			});
		}
		visited.add(hash);
	}
	return -1;
}

export async function part1(lines: string[]) {
	const map = parseInput(lines);

	return processNodes(map);
}

export async function part2(lines: string[]) {
	const map = parseInput(lines);
	return processNodes(map, 4, 10);
}
