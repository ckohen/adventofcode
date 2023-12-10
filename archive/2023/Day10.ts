export const useRawInput = false;

const enum Direction {
	Unknown,
	Up,
	Down,
	Left,
	Right,
}

function mapLine(line: string) {
	let startingIndex = -1;
	const mappedLine = line.split('').map((char, index) => {
		if (char === 'S') startingIndex = index;
		return { value: char, inLoop: char === 'S', stepsFormStart: 0 };
	});
	return { mappedLine, startingIndex };
}

function getFullMap(lines: string[]) {
	let startingPosition: [number, number] = [0, 0];
	const fullMap = lines.map((line, index) => {
		const { mappedLine, startingIndex } = mapLine(line);
		if (startingIndex !== -1) {
			startingPosition = [index, startingIndex];
		}
		return mappedLine;
	});
	return { startingPosition, fullMap };
}

function getNextPosition(
	map: ReturnType<typeof getFullMap>['fullMap'],
	currentDirection: Direction,
	currentPosition: [number, number],
	stepCount: number,
	ignorePosition?: [number, number],
) {
	let finalDirection = currentDirection;
	if (currentDirection === Direction.Unknown) {
		const possibles = [
			{ position: [currentPosition[0] - 1, currentPosition[1]], allowed: ['|', '7', 'F'], direction: Direction.Up },
			{ position: [currentPosition[0], currentPosition[1] - 1], allowed: ['-', 'L', 'F'], direction: Direction.Left },
			{
				position: [currentPosition[0], currentPosition[1] + 1],
				allowed: ['-', '7', 'J'],
				direction: Direction.Right,
			},
			{ position: [currentPosition[0] + 1, currentPosition[1]], allowed: ['|', 'L', 'J'], direction: Direction.Down },
		] as const;
		for (const possible of possibles) {
			if (ignorePosition && possible.position[0] === ignorePosition[0] && possible.position[1] === ignorePosition[1]) {
				continue;
			}
			const char = map[possible.position[0]]?.[possible.position[1]]?.value;
			if (!char) continue;
			if ((possible.allowed as unknown as string[]).includes(char)) {
				finalDirection = possible.direction;
				break;
			}
		}
	}

	let nextPosition: [number, number];
	let next: ReturnType<typeof mapLine>['mappedLine'][number];
	let nextDirection: Direction;
	switch (finalDirection) {
		case Direction.Unknown:
			throw new Error('Unkown direction after unknown check');
		case Direction.Up: {
			nextPosition = [currentPosition[0] - 1, currentPosition[1]];
			const rawNext = map[currentPosition[0] - 1]?.[currentPosition[1]];
			if (!rawNext) throw new Error('Invalid Map');
			next = rawNext;
			switch (next.value) {
				case '|':
					nextDirection = Direction.Up;
					break;
				case '7':
					nextDirection = Direction.Left;
					break;
				case 'F':
					nextDirection = Direction.Right;
					break;
				default:
					throw new Error('Invalid Map');
			}
			break;
		}
		case Direction.Left: {
			nextPosition = [currentPosition[0], currentPosition[1] - 1];
			const rawNext = map[currentPosition[0]]?.[currentPosition[1] - 1];
			if (!rawNext) throw new Error('Invalid Map');
			next = rawNext;
			switch (next.value) {
				case '-':
					nextDirection = Direction.Left;
					break;
				case 'L':
					nextDirection = Direction.Up;
					break;
				case 'F':
					nextDirection = Direction.Down;
					break;
				default:
					throw new Error('Invalid Map');
			}
			break;
		}
		case Direction.Right: {
			nextPosition = [currentPosition[0], currentPosition[1] + 1];
			const rawNext = map[currentPosition[0]]?.[currentPosition[1] + 1];
			if (!rawNext) throw new Error('Invalid Map');
			next = rawNext;
			switch (next.value) {
				case '-':
					nextDirection = Direction.Right;
					break;
				case '7':
					nextDirection = Direction.Down;
					break;
				case 'J':
					nextDirection = Direction.Up;
					break;
				default:
					throw new Error('Invalid Map');
			}
			break;
		}
		case Direction.Down: {
			nextPosition = [currentPosition[0] + 1, currentPosition[1]];
			const rawNext = map[currentPosition[0] + 1]?.[currentPosition[1]];
			if (!rawNext) throw new Error('Invalid Map');
			next = rawNext;
			switch (next.value) {
				case '|':
					nextDirection = Direction.Down;
					break;
				case 'L':
					nextDirection = Direction.Right;
					break;
				case 'J':
					nextDirection = Direction.Left;
					break;
				default:
					throw new Error('Invalid Map');
			}
			break;
		}
	}
	next.inLoop = true;
	next.stepsFormStart = stepCount;
	return { nextPosition, nextDirection };
}

function generateLoop({ fullMap, startingPosition }: ReturnType<typeof getFullMap>) {
	let matched = false;
	const currentPositions: [typeof startingPosition, typeof startingPosition] = [startingPosition, startingPosition];
	const currentDirections: [Direction, Direction] = [Direction.Unknown, Direction.Unknown];
	let steps = 1;
	for (steps = 1; !matched; steps++) {
		const { nextPosition: nextPosition0, nextDirection: nextDirection0 } = getNextPosition(
			fullMap,
			currentDirections[0],
			currentPositions[0],
			steps,
		);
		const { nextPosition: nextPosition1, nextDirection: nextDirection1 } = getNextPosition(
			fullMap,
			currentDirections[1],
			currentPositions[1],
			steps,
			nextPosition0,
		);
		currentPositions[0] = nextPosition0;
		currentPositions[1] = nextPosition1;
		currentDirections[0] = nextDirection0;
		currentDirections[1] = nextDirection1;
		if (steps === 1) {
			let possibleStartingValues = ['|', '-', 'L', 'J', 'F', '7'];
			if (nextPosition0[0] === startingPosition[0] - 1 || nextPosition1[0] === startingPosition[0] - 1) {
				possibleStartingValues = possibleStartingValues.filter((val) => ['|', 'J', 'L'].includes(val));
			}
			if (nextPosition0[0] === startingPosition[0] + 1 || nextPosition1[0] === startingPosition[0] + 1) {
				possibleStartingValues = possibleStartingValues.filter((val) => ['|', 'F', '7'].includes(val));
			}
			if (nextPosition0[1] === startingPosition[1] - 1 || nextPosition1[1] === startingPosition[1] - 1) {
				possibleStartingValues = possibleStartingValues.filter((val) => ['-', 'J', '7'].includes(val));
			}
			if (nextPosition0[1] === startingPosition[1] + 1 || nextPosition1[1] === startingPosition[1] + 1) {
				possibleStartingValues = possibleStartingValues.filter((val) => ['-', 'F', 'L'].includes(val));
			}
			if (possibleStartingValues.length !== 1) throw new Error('Invalid input');
			fullMap[startingPosition[0]]![startingPosition[1]]!.value = possibleStartingValues[0]!;
		}

		if (currentPositions[0][0] === currentPositions[1][0] && currentPositions[0][1] === currentPositions[1][1]) {
			matched = true;
		}
	}
	return steps - 1;
}

export async function part1(lines: string[]) {
	const { startingPosition, fullMap } = getFullMap(lines);
	return generateLoop({ startingPosition, fullMap });
}

export async function part2(lines: string[]) {
	const { startingPosition, fullMap } = getFullMap(lines);
	generateLoop({ startingPosition, fullMap });
	let enclosed = 0;
	for (const row of fullMap) {
		let lastCorner = '';
		let wallCount = 0;
		for (const node of row) {
			if (node.inLoop) {
				if (node.value === '-') {
					continue;
				}
				if (node.value === '|') {
					wallCount++;
					continue;
				}
				if (lastCorner === '') {
					lastCorner = node.value;
					continue;
				}

				if (lastCorner === 'L') {
					if (node.value === '7') {
						wallCount++;
					}
					lastCorner = '';
					continue;
				}
				if (lastCorner === 'F') {
					if (node.value === 'J') {
						wallCount++;
					}
					lastCorner = '';
					continue;
				}
			}

			if (wallCount % 2 !== 0) {
				enclosed++;
			}
		}
	}
	return enclosed;
}
