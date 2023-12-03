import { readFileSync } from 'fs';

const input = readFileSync('inputs/elfPositions.txt').toString();
const lines = input.split('\n');

const map = lines.map((line) => line.split('') as ('#' | '.')[]);

interface Coordinate {
	x: number;
	y: number;
}

const proposedMovePositions = new Map<string, { to: Coordinate; from: Coordinate; skip: boolean }>();

const enum Direction {
	North,
	South,
	West,
	East,
}

const directionOrder = [Direction.North, Direction.South, Direction.West, Direction.East];

function hasAdjacent(row: typeof map[number], rowI: number, colI: number): boolean {
	if (row[colI - 1] === '#' || row[colI + 1] === '#') return true;
	const aboveRow = map[rowI - 1];
	if (aboveRow && (aboveRow[colI - 1] === '#' || aboveRow[colI] === '#' || aboveRow[colI + 1] === '#')) return true;
	const belowRow = map[rowI + 1];
	if (belowRow && (belowRow[colI - 1] === '#' || belowRow[colI] === '#' || belowRow[colI + 1] === '#')) return true;
	return false;
}

function getMoveDirection(row: number, col: number, direction: Direction): Coordinate | false {
	switch (direction) {
		case Direction.North: {
			const aboveRow = map[row - 1];
			if (!aboveRow) return { x: col, y: row - 1 };
			if (aboveRow[col - 1] === '#' || aboveRow[col] === '#' || aboveRow[col + 1] === '#') return false;
			return { x: col, y: row - 1 };
		}
		case Direction.South: {
			const belowRow = map[row + 1];
			if (!belowRow) return { x: col, y: row + 1 };
			if (belowRow[col - 1] === '#' || belowRow[col] === '#' || belowRow[col + 1] === '#') return false;
			return { x: col, y: row + 1 };
		}
		case Direction.East: {
			const aboveRow = map[row - 1];
			const currentRow = map[row]!;
			const belowRow = map[row + 1];
			if (currentRow[col + 1] === '#' || aboveRow?.[col + 1] === '#' || belowRow?.[col + 1] === '#') return false;
			return { x: col + 1, y: row };
		}
		case Direction.West: {
			const aboveRow = map[row - 1];
			const currentRow = map[row]!;
			const belowRow = map[row + 1];
			if (currentRow[col - 1] === '#' || aboveRow?.[col - 1] === '#' || belowRow?.[col - 1] === '#') return false;
			return { x: col - 1, y: row };
		}
	}
}

function processRound() {
	proposedMovePositions.clear();
	for (const [rowIndex, row] of map.entries()) {
		for (const [colIndex, char] of row.entries()) {
			if (char === '.') continue;
			if (!hasAdjacent(row, rowIndex, colIndex)) continue;
			let toPropose: ReturnType<typeof getMoveDirection> = false;
			for (const direction of directionOrder) {
				toPropose = getMoveDirection(rowIndex, colIndex, direction);
				if (toPropose) break;
			}
			if (!toPropose) continue;
			const destinationString = `${toPropose.x},${toPropose.y}`;
			let proposed = proposedMovePositions.get(destinationString);
			if (proposed) {
				proposed.skip = true;
				continue;
			}
			proposed = {
				to: toPropose,
				from: { x: colIndex, y: rowIndex },
				skip: false,
			};
			proposedMovePositions.set(destinationString, proposed);
		}
	}

	let xOffset = 0;
	let yOffset = 0;
	let moved = 0;
	for (const [, move] of proposedMovePositions) {
		if (move.skip) continue;
		if (move.to.y + yOffset < 0) {
			map.unshift(new Array<'.'>(map[0]!.length).fill('.'));
			yOffset += 1;
		}
		if (move.to.y + yOffset >= map.length) {
			map.push(new Array<'.'>(map[0]!.length).fill('.'));
		}
		if (move.to.x + xOffset < 0) {
			for (const row of map) {
				row.unshift('.');
			}
			xOffset += 1;
		}
		if (move.to.x + xOffset >= map[0]!.length) {
			for (const row of map) {
				row.push('.');
			}
		}
		map[move.from.y + yOffset]![move.from.x + xOffset] = '.';
		map[move.to.y + yOffset]![move.to.x + xOffset] = '#';
		moved++;
	}
	directionOrder.push(directionOrder.shift()!);
	return moved;
}

let round = 0;

for (round = 0; round < Infinity; round++) {
	const moved = processRound();
	if (moved === 0) break;
}

console.log(map.reduce((prev, row) => prev + row.reduce((pre, curr) => pre + (curr === '.' ? 1 : 0), 0), 0));
console.log(round + 1);
