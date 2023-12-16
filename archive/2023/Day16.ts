export const useRawInput = false;

const enum Direction {
	Right,
	Down,
	Left,
	Up,
}

interface Node {
	char: '-' | '|' | '\\' | '/' | '.';
	visited: Direction[];
}

function parseInput(lines: string[]): Node[][] {
	return lines.map((row) => row.split('').map((char) => ({ char: char as Node['char'], visited: [] })));
}

function propagate(map: Node[][], row: number, column: number, direction: Direction) {
	const currentNode = map[row]?.[column];
	if (!currentNode || currentNode.visited.includes(direction)) {
		return;
	}

	currentNode.visited.push(direction);

	const toVisit: [number, number, Direction][] = [];

	switch (currentNode.char) {
		case '-': {
			if (direction !== Direction.Left) {
				toVisit.push([row, column + 1, Direction.Right]);
			}
			if (direction !== Direction.Right) {
				toVisit.push([row, column - 1, Direction.Left]);
			}
			break;
		}
		case '|': {
			if (direction !== Direction.Down) {
				toVisit.push([row - 1, column, Direction.Up]);
			}
			if (direction !== Direction.Up) {
				toVisit.push([row + 1, column, Direction.Down]);
			}
			break;
		}
		case '/': {
			switch (direction) {
				case Direction.Down:
					toVisit.push([row, column - 1, Direction.Left]);
					break;
				case Direction.Right:
					toVisit.push([row - 1, column, Direction.Up]);
					break;
				case Direction.Up:
					toVisit.push([row, column + 1, Direction.Right]);
					break;
				case Direction.Left:
					toVisit.push([row + 1, column, Direction.Down]);
					break;
			}
			break;
		}
		case '\\': {
			switch (direction) {
				case Direction.Down:
					toVisit.push([row, column + 1, Direction.Right]);
					break;
				case Direction.Right:
					toVisit.push([row + 1, column, Direction.Down]);
					break;
				case Direction.Up:
					toVisit.push([row, column - 1, Direction.Left]);
					break;
				case Direction.Left:
					toVisit.push([row - 1, column, Direction.Up]);
					break;
			}
			break;
		}
		case '.': {
			switch (direction) {
				case Direction.Down:
					toVisit.push([row + 1, column, Direction.Down]);
					break;
				case Direction.Right:
					toVisit.push([row, column + 1, Direction.Right]);
					break;
				case Direction.Up:
					toVisit.push([row - 1, column, Direction.Up]);
					break;
				case Direction.Left:
					toVisit.push([row, column - 1, Direction.Left]);
					break;
			}
			break;
		}
	}

	for (const nextVisit of toVisit) {
		propagate(map, ...nextVisit);
	}
}

function countVisited(map: Node[][]) {
	return map.reduce(
		(total, currentRow) => total + currentRow.reduce((rowTotal, node) => rowTotal + (node.visited.length ? 1 : 0), 0),
		0,
	);
}

export async function part1(lines: string[]) {
	const map = parseInput(lines);
	propagate(map, 0, 0, Direction.Right);
	return countVisited(map);
}

export async function part2(lines: string[]) {
	let highestEnergy = 0;
	const colLength = lines.length;
	const rowLength = lines[0]!.length;
	for (let row = 0; row < colLength; row++) {
		const map1 = parseInput(lines);
		const map2 = parseInput(lines);
		propagate(map1, row, 0, Direction.Right);
		propagate(map2, row, rowLength - 1, Direction.Left);
		highestEnergy = Math.max(countVisited(map1), countVisited(map2), highestEnergy);
	}
	for (let col = 0; col < rowLength; col++) {
		const map1 = parseInput(lines);
		const map2 = parseInput(lines);
		propagate(map1, 0, col, Direction.Down);
		propagate(map2, colLength - 1, col, Direction.Up);
		highestEnergy = Math.max(countVisited(map1), countVisited(map2), highestEnergy);
	}
	return highestEnergy;
}
