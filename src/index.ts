import { readFileSync, writeFileSync } from 'fs';
import { inspect } from 'util';

const input = readFileSync('inputs/heightmap.txt').toString();
const lines = input.split('\n');

const map = lines.map((line) => [...line]);

const bestSignalInd = 'E';
const currentPosInd = 'S';

const allowedDiff = 1;

const startRow = map.findIndex((row) => row.includes(currentPosInd));
const startCol = map[startRow]!.findIndex((col) => col === currentPosInd);

const enum Direction {
	Left,
	Right,
	Up,
	Down,
}

interface Coordinate {
	x: number;
	y: number;
}

interface Path {
	leftPath: Path | null;
	rightPath: Path | null;
	upPath: Path | null;
	downPath: Path | null;
	current: Coordinate & { value: string };
	visited: string[];
	reachedEnd: boolean;
}

const pathsFrom: Map<string, Path> = new Map();

function evaluateNext(nextX: number, nextY: number, path: Path): Path | null {
	if (path.visited.includes(`${nextX},${nextY}`)) return null;
	let nextPath = pathsFrom.get(`${nextX},${nextY}`);
	if (nextPath) return nextPath;
	const next = map[nextY]![nextX]!;
	if (next === bestSignalInd) {
		if ('z'.charCodeAt(0) > path.current.value.charCodeAt(0) + allowedDiff) {
			path.reachedEnd = true;
			return null;
		}
	}
	if (next.charCodeAt(0) > path.current.value.charCodeAt(0) + allowedDiff) return null;
	// eslint-disable-next-line @typescript-eslint/no-use-before-define
	nextPath = getNextPath({
		leftPath: null,
		rightPath: null,
		upPath: null,
		downPath: null,
		current: { value: next, x: nextX, y: nextY },
		visited: [...path.visited, `${nextX},${nextY}`],
		reachedEnd: false,
	});
	pathsFrom.set(`${nextX},${nextY}`, nextPath);
	return nextPath;
}

const pathLength = 1;

function getNextPath(path: Path): Path {
	for (let i = Direction.Left; i <= Direction.Down; i++) {
		switch (i) {
			case Direction.Left: {
				if (path.current.x === 0) break;
				const nextX = path.current.x - 1;
				const nextY = path.current.y;
				path.leftPath = evaluateNext(nextX, nextY, path);
				break;
			}
			case Direction.Right: {
				if (path.current.x === map[path.current.y]!.length - 1) break;
				const nextX = path.current.x + 1;
				const nextY = path.current.y;
				path.rightPath = evaluateNext(nextX, nextY, path);
				break;
			}
			case Direction.Up: {
				if (path.current.y === 0) break;
				const nextX = path.current.x;
				const nextY = path.current.y - 1;
				path.upPath = evaluateNext(nextX, nextY, path);
				break;
			}
			case Direction.Down: {
				if (path.current.y === map.length - 1) break;
				const nextX = path.current.x;
				const nextY = path.current.y + 1;
				path.downPath = evaluateNext(nextX, nextY, path);
				break;
			}
		}
		if (path.reachedEnd) break;
	}
	return path;
}

const path = getNextPath({
	leftPath: null,
	rightPath: null,
	upPath: null,
	downPath: null,
	current: { value: 'a', x: startCol, y: startRow },
	visited: [`${startCol},${startRow}`],
	reachedEnd: false,
});

console.log(path.downPath);
writeFileSync('output.json', inspect(path, { depth: 100 }));
console.log(pathLength);
