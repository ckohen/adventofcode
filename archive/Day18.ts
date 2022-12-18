import { readFileSync } from 'fs';

const input = readFileSync('inputs/droplets.txt').toString();
const lines = input.split('\n');

interface Coordinate {
	x: number;
	y: number;
	z: number;
}

interface Droplet extends Coordinate {
	left: boolean;
	right: boolean;
	up: boolean;
	down: boolean;
	forward: boolean;
	back: boolean;
}

let maxX = -Infinity;
let maxY = -Infinity;
let maxZ = -Infinity;
let minX = Infinity;
let minY = Infinity;
let minZ = Infinity;

const droplets: Droplet[] = lines.map((line) => {
	const [x, y, z] = line.split(',').map((val) => parseInt(val, 10));
	if (typeof x === 'undefined' || typeof y === 'undefined' || typeof z === 'undefined') {
		throw new Error('Invalid input');
	}
	if (x > maxX) maxX = x;
	if (y > maxY) maxY = y;
	if (z > maxZ) maxZ = z;
	if (x < minX) minX = x;
	if (y < minY) minY = y;
	if (z < minZ) minZ = z;
	return { x, y, z, left: false, right: false, up: false, down: false, forward: false, back: false };
});

const cube: number[][][] = [];

const zLength = maxZ - minZ + 1;
const yLength = maxY - minY + 1;
const xLength = maxX - minX + 1;

for (let z = 0; z < zLength; z++) {
	const plane: number[][] = [];
	for (let y = 0; y < yLength; y++) {
		const line = new Array<number>(xLength).fill(0);
		plane.push(line);
	}
	cube.push(plane);
}

for (const droplet of droplets) {
	cube[droplet.z - minZ]![droplet.y - minY]![droplet.x - minX] = 1;
}

function getAdjacents(x: number, y: number, z: number) {
	return [
		{ x: x + 1, y, z },
		{ x: x - 1, y, z },
		{ x, y: y + 1, z },
		{ x, y: y - 1, z },
		{ x, y, z: z + 1 },
		{ x, y, z: z - 1 },
	];
}

function bfs(x: number, y: number, z: number) {
	if (cube[z]?.[y]?.[x] === -1) return 0;
	if (cube[z]?.[y]?.[x] === 1) return 1;

	const queue: Coordinate[] = [{ x, y, z }];
	cube[z]![y]![x] = -1;

	let total = 0;

	while (queue.length) {
		const next = queue.shift();
		for (const { x: adjX, y: adjY, z: adjZ } of getAdjacents(next!.x, next!.y, next!.z)) {
			if (adjX < 0 || adjX >= xLength || adjY < 0 || adjY >= yLength || adjZ < 0 || adjZ >= zLength) {
				continue;
			}

			const adjacentValue = cube[adjZ]?.[adjY]?.[adjX];
			if (adjacentValue === 1) {
				total++;
			}

			if (adjacentValue === 0) {
				queue.push({ x: adjX, y: adjY, z: adjZ });
				cube[adjZ]![adjY]![adjX] = -1;
			}
		}
	}
	return total;
}

let surfaceArea = 0;

for (let x = 0; x < xLength; x++) {
	for (let y = 0; y < yLength; y++) {
		surfaceArea += bfs(x, y, 0);
		surfaceArea += bfs(x, y, zLength - 1);
	}
}
for (let y = 0; y < yLength; y++) {
	for (let z = 0; z < zLength; z++) {
		surfaceArea += bfs(0, y, z);
		surfaceArea += bfs(xLength - 1, y, z);
	}
}
for (let x = 0; x < xLength; x++) {
	for (let z = 0; z < zLength; z++) {
		surfaceArea += bfs(x, 0, z);
		surfaceArea += bfs(x, yLength - 1, z);
	}
}

console.log(surfaceArea);
