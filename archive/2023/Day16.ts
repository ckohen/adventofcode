export const useRawInput = false;

const enum Direction {
	Right,
	Down,
	Left,
	Up,
}

function propagate(
	map: string[],
	row: number,
	column: number,
	direction: Direction,
	visited: Map<string, Direction[]>,
): Map<string, Direction[]> {
	const currentChar = map[row]?.[column];
	const visitedAccessor = `${row}.${column}`;
	const directionsVisited = visited.get(visitedAccessor);
	if (!currentChar || directionsVisited?.includes(direction)) {
		return new Map();
	}

	visited.set(visitedAccessor, directionsVisited ? directionsVisited.concat(direction) : [direction]);

	const toVisit: [number, number, Direction][] = [];

	switch (currentChar) {
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
		propagate(map, ...nextVisit, visited);
	}

	return visited;
}

export async function part1(lines: string[]) {
	const visited = await propagate(lines, 0, 0, Direction.Right, new Map());
	return visited.size;
}

export async function part2(lines: string[]) {
	let highestEnergy = 0;
	const colLength = lines.length;
	const rowLength = lines[0]!.length;
	for (let row = 0; row < colLength; row++) {
		const visitedL = await propagate(lines, row, 0, Direction.Right, new Map());
		const visitedR = await propagate(lines, row, rowLength - 1, Direction.Left, new Map());
		highestEnergy = Math.max(visitedL.size, visitedR.size, highestEnergy);
	}
	for (let col = 0; col < rowLength; col++) {
		const visitedTop = await propagate(lines, 0, col, Direction.Down, new Map());
		const visitedBottom = await propagate(lines, colLength - 1, col, Direction.Up, new Map());
		highestEnergy = Math.max(visitedTop.size, visitedBottom.size, highestEnergy);
	}
	return highestEnergy;
}
