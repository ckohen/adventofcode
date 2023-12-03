import { readFileSync } from 'fs';

const input = readFileSync('inputs/rope.txt').toString();
const lines = input.split('\n');

const knots = 9;
const map = new Set<string>(['0,0']);

const locations = new Map<number, { x: number; y: number }>();

for (let i = 0; i <= knots; i++) {
	locations.set(i, { x: 0, y: 0 });
}

let xMod = 0;
let yMod = 0;

function adjust(direction: 'x' | 'y', last: { x: number; y: number }, current: { x: number; y: number }) {
	if (last[direction] > current[direction] + 1) {
		current[direction] += 1;
	} else if (last[direction] < current[direction] - 1) {
		current[direction] -= 1;
	} else {
		current[direction] = last[direction];
	}
}

function moveTail() {
	let lastLocation = locations.get(0)!;
	for (const [key, location] of locations) {
		if (key === 0) {
			lastLocation = location;
			continue;
		}
		if (lastLocation.x > location.x + 1) {
			location.x += 1;
			adjust('y', lastLocation, location);
		}
		if (lastLocation.x < location.x - 1) {
			location.x -= 1;
			adjust('y', lastLocation, location);
		}
		if (lastLocation.y > location.y + 1) {
			location.y += 1;
			adjust('x', lastLocation, location);
		}
		if (lastLocation.y < location.y - 1) {
			location.y -= 1;
			adjust('x', lastLocation, location);
		}
		lastLocation = location;
		if (key === knots) {
			map.add(`${lastLocation.x},${lastLocation.y}`);
		}
	}
}

const head = locations.get(0)!;

for (const line of lines) {
	const [dir, rawCount] = line.split(' ');
	if (!dir || !rawCount) throw new Error('Parsing error');
	const count = parseInt(rawCount, 10);
	switch (dir) {
		case 'R': {
			xMod = 1;
			yMod = 0;
			break;
		}
		case 'L': {
			xMod = -1;
			yMod = 0;
			break;
		}
		case 'U': {
			xMod = 0;
			yMod = 1;
			break;
		}
		case 'D': {
			xMod = 0;
			yMod = -1;
			break;
		}
	}

	for (let i = 0; i < count; i++) {
		head.x += xMod;
		head.y += yMod;
		moveTail();
	}
}

console.log(map.size);
