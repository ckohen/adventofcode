import { readFileSync } from 'fs';

const input = readFileSync('inputs/caveScan.txt').toString();
const lines = input.split('\n');

interface Coordinate {
	x: number;
	y: number;
}

let lowestX = Infinity;
let highestX = 0;
const lowestY = 0;
let highestY = 0;
const scanLines = lines.map((line) => {
	const scan: Coordinate[] = [];
	const coords = line.split('->').map((coord) => coord.trim());
	for (const coord of coords) {
		const [x, y] = coord.split(',').map((v) => parseInt(v, 10));
		if (!x || !y) throw new Error('Invalid input');
		if (x > highestX) highestX = x;
		if (x < lowestX) lowestX = x;
		if (y > highestY) highestY = y;
		scan.push({ x, y });
	}
	return scan;
});

highestY += 2;

const map: (`#` | `.` | `+` | `o`)[][] = [];

for (let y = lowestY; y <= highestY; y++) {
	const row: typeof map[0] = [];
	map[y] = row;
	for (let x = lowestX; x <= highestX; x++) {
		row[x] = y === highestY ? '#' : '.';
	}
}

for (const line of scanLines) {
	let lastCoord: Coordinate | null = null;
	for (const coord of line) {
		if (!lastCoord) {
			lastCoord = coord;
			continue;
		}
		if (coord.y === lastCoord.y) {
			const row = map[coord.y]!;
			const lowerCoord = Math.min(coord.x, lastCoord.x);
			const higherCoord = Math.max(coord.x, lastCoord.x);
			for (let i = lowerCoord; i <= higherCoord; i++) {
				row[i] = '#';
			}
			lastCoord = coord;
			continue;
		}
		const lowerCoord = Math.min(coord.y, lastCoord.y);
		const higherCoord = Math.max(coord.y, lastCoord.y);
		for (let i = lowerCoord; i <= higherCoord; i++) {
			map[i]![coord.x] = '#';
		}
		lastCoord = coord;
	}
}

const spawnerX = 500;
const spawnerY = 0;
const spawner = { x: spawnerX, y: spawnerY };

map[spawnerY]![spawnerX] = '+';

let restingSand = 0;

function populateCol(x: number) {
	for (let y = lowestY; y <= highestY; y++) {
		map[y]![x] = y === highestY ? '#' : '.';
	}
}

function processSand(current: Coordinate): Coordinate {
	const belowRow = map[current.y + 1];
	if (!belowRow) throw new Error(`Encountered unknown row`);
	if (belowRow[current.x] === '.') {
		return { x: current.x, y: current.y + 1 };
	}

	let left = belowRow[current.x - 1];
	if (typeof left === 'undefined') {
		populateCol(current.x - 1);
		left = belowRow[current.x - 1];
	}
	if (left === '.') {
		return { x: current.x - 1, y: current.y + 1 };
	}

	let right = belowRow[current.x + 1];
	if (typeof right === 'undefined') {
		populateCol(current.x + 1);
		right = belowRow[current.x + 1];
	}
	if (right === '.') {
		return { x: current.x + 1, y: current.y + 1 };
	}

	restingSand += 1;
	return current;
}

let lastSand = spawner;
let nextSand = processSand(lastSand);

while (nextSand !== spawner) {
	if (nextSand.x === lastSand.x && nextSand.y === lastSand.y) {
		map[nextSand.y]![nextSand.x] = 'o';
		lastSand = spawner;
	} else {
		lastSand = nextSand;
	}
	nextSand = processSand(lastSand);
}

console.log(restingSand);
