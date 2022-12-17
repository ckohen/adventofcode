import { readFileSync } from 'fs';

const input = readFileSync('inputs/gasJets.txt').toString();
const rocks = [
	[{ index: 0, length: 4 }],
	[
		{ index: 1, length: 1 },
		{ index: 0, length: 3 },
		{ index: 1, length: 1 },
	],
	[
		{ index: 2, length: 1 },
		{ index: 2, length: 1 },
		{ index: 0, length: 3 },
	],
	[
		{ index: 0, length: 1 },
		{ index: 0, length: 1 },
		{ index: 0, length: 1 },
		{ index: 0, length: 1 },
	],
	[
		{ index: 0, length: 2 },
		{ index: 0, length: 2 },
	],
] as const;

const chamberWidth = 7;
const leftEdgeOffset = 2;
const bottomEdgeOffset = 3;
const maxSpawns = 1_000_000_000_000;

let currentTop = 0;

const chamber: ('#' | '.')[][] = [];

function spawn(rock: typeof rocks[number]) {
	const height = rock.length;
	const topOfSpawn = currentTop + 1 + bottomEdgeOffset + height;
	for (let y = Math.max(currentTop + 1, chamber.length); y < topOfSpawn; y++) {
		chamber[y] = new Array<'.'>(chamberWidth).fill('.');
	}
	return { rock, x: leftEdgeOffset, y: topOfSpawn - 1 };
}

let spawned = 0;
let lastSpawned = spawn(rocks[0]);
let pushInstruction = 0;

type State = [block: number, command: number, heightDeltas: number[]];
const encounteredStates: State[] = [];

const deltaWindowLength = 10;
const heightDeltaWindow: number[] = [];
let repeatingHeightDeltas: number[] = [];

for (spawned = 1; spawned <= maxSpawns; spawned++) {
	let canMoveDown = true;
	let x = lastSpawned.x;
	let y = lastSpawned.y;
	const rockEntries = [...lastSpawned.rock.entries()];
	while (canMoveDown) {
		const pushDirection = input[pushInstruction % input.length]!;
		const mult = pushDirection === '>' ? 1 : -1;
		let canMoveSide = true;
		for (const [index, line] of rockEntries) {
			const currentLine = chamber[y - index]!;
			const newStartX = x + mult + line.index;
			if (newStartX < 0 || currentLine[newStartX] === '#') {
				canMoveSide = false;
				break;
			}
			if (newStartX + line.length > chamberWidth || currentLine[newStartX + line.length - 1] === '#') {
				canMoveSide = false;
				break;
			}
		}
		if (canMoveSide) {
			x += mult;
		}
		pushInstruction++;

		for (const [index, line] of rockEntries) {
			const nextLine = chamber[y - index - 1];
			if (!nextLine) {
				canMoveDown = false;
				break;
			}
			const intersecting = nextLine.slice(x + line.index, x + line.index + line.length);
			if (intersecting.includes('#')) {
				canMoveDown = false;
				break;
			}
		}
		if (canMoveDown) {
			y--;
		}
	}
	for (const [yOffset, line] of rockEntries) {
		for (let xOffset = line.index; xOffset < line.index + line.length; xOffset++) {
			chamber[y - yOffset]![x + xOffset] = '#';
		}
	}
	heightDeltaWindow.push(Math.max(currentTop, y) - currentTop);
	if (heightDeltaWindow.length > deltaWindowLength) {
		heightDeltaWindow.shift();
	}
	const currentState: State = [
		(spawned % rocks.length) - 1,
		(pushInstruction % input.length) - 1,
		[...heightDeltaWindow],
	];
	const indexOfState = encounteredStates.findIndex(
		(state) =>
			state[0] === currentState[0] &&
			state[1] === currentState[1] &&
			state[2].every((delta, i) => currentState[2][i] === delta),
	);
	if (indexOfState > -1) {
		repeatingHeightDeltas = encounteredStates.slice(indexOfState).map((state) => state[2][state[2].length - 1]!);
		break;
	}
	if (heightDeltaWindow.length === deltaWindowLength) {
		encounteredStates.push(currentState);
	}
	currentTop = Math.max(y, currentTop);
	if (spawned !== maxSpawns) {
		lastSpawned = spawn(rocks[spawned % rocks.length]!);
	}
}

console.log(spawned);

const totalRepeating = repeatingHeightDeltas.reduce((prev, curr) => prev + curr);

currentTop += totalRepeating * Math.floor((maxSpawns - spawned) / repeatingHeightDeltas.length);
spawned = maxSpawns - ((maxSpawns - spawned) % repeatingHeightDeltas.length);

for (let i = 0; i <= maxSpawns - spawned; i++) {
	currentTop += repeatingHeightDeltas[i]!;
}

console.log(currentTop);
