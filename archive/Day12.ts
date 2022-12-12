import { readFileSync } from 'fs';

const input = readFileSync('inputs/heightmap.txt').toString();
const lines = input.split('\n');

const map = lines.map((line) => [...line]);

const bestSignalInd = 'E';
const currentPosInd = 'S';

const allowedDiff = 1;

const startRow = map.findIndex((row) => row.includes(bestSignalInd));
const startCol = map[startRow]!.findIndex((col) => col === bestSignalInd);

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
	distance?: number;
}

const pathsFrom: Map<string, Path> = new Map();

function evaluateNext(nextX: number, nextY: number, path: Path): Path | null {
	const next = map[nextY]![nextX]!;
	if (next === currentPosInd) {
		if ('a'.charCodeAt(0) + allowedDiff < path.current.value.charCodeAt(0)) {
			return null;
		}
	}
	if (next.charCodeAt(0) + allowedDiff < path.current.value.charCodeAt(0)) return null;
	let nextPath = pathsFrom.get(`${nextX},${nextY}`);
	if (nextPath) return nextPath;
	nextPath = {
		leftPath: null,
		rightPath: null,
		upPath: null,
		downPath: null,
		current: { value: next, x: nextX, y: nextY },
	};
	pathsFrom.set(`${nextX},${nextY}`, nextPath);
	// eslint-disable-next-line @typescript-eslint/no-use-before-define
	return getNextPath(nextPath);
}

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
	}
	return path;
}

const path = getNextPath({
	leftPath: null,
	rightPath: null,
	upPath: null,
	downPath: null,
	current: { value: 'z', x: startCol, y: startRow },
	distance: 0,
});

const queuedForLength: Path[] = [];
const visited: string[] = [];

let currentPath = path;

queuedForLength.push(currentPath);

visited.push(`${currentPath.current.x},${currentPath.current.y}`);

let start: Path | undefined;

function enqueuePotential(nextPath: Path | null) {
	if (nextPath && !visited.includes(`${nextPath.current.x},${nextPath.current.y}`)) {
		visited.push(`${nextPath.current.x},${nextPath.current.y}`);
		queuedForLength.push(nextPath);
		nextPath.distance = currentPath.distance! + 1;
	}
}

while (!start) {
	currentPath = queuedForLength.shift()!;
	if (currentPath.current.value === 'a') {
		start = currentPath;
		break;
	}
	enqueuePotential(currentPath.leftPath);
	enqueuePotential(currentPath.rightPath);
	enqueuePotential(currentPath.upPath);
	enqueuePotential(currentPath.downPath);
}

console.log(start.distance!);
