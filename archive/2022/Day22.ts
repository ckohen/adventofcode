import { readFileSync } from 'fs';

const input = readFileSync('inputs/monkeyPassword.txt').toString();
const [rawLines, rawDirections] = input.split('\n\n');
const lines = rawLines!.split('\n');

const mapValues = ['.', '#', '>', '<', '^', 'v'] as const;

type MapValue = typeof mapValues[number];

function isTest(): boolean {
	return false;
}

const cubeSize = isTest() ? 4 : 50;

type CubeId = 1 | 2 | 3 | 4 | 5 | 6;

interface CubeDirection {
	id: CubeId;
	directionOffset: 0 | 1 | 2 | 3;
}

interface CubeFace {
	id: CubeId;
	rightIndex?: number;
	right?: CubeDirection;
	bottomIndex?: number;
	bottom?: CubeDirection;
	leftIndex?: number;
	left?: CubeDirection;
	topIndex?: number;
	top?: CubeDirection;
}

interface MapRow {
	values: MapValue[];
	leftMostIndex: number;
}

const faces: CubeFace[] = [];

const map: MapRow[] = [];

function isMapValue(string: string): string is MapValue {
	return mapValues.includes(string as MapValue);
}

let currentFace: CubeFace = {
	id: 1,
	topIndex: 0,
	bottomIndex: cubeSize - 1,
};

for (const [lineIndex, line] of lines.entries()) {
	const split = line.split('');
	const row: MapRow = {
		values: [],
		leftMostIndex: Infinity,
	};
	for (const [index, char] of split.entries()) {
		if (!isMapValue(char)) continue;
		if (row.leftMostIndex > index) {
			row.leftMostIndex = index;
		}
		if (typeof currentFace.leftIndex === 'undefined') {
			currentFace.leftIndex = index;
			currentFace.rightIndex = index + cubeSize - 1;
		} else if (index > currentFace.rightIndex! || lineIndex > currentFace.bottomIndex!) {
			faces.push(currentFace);
			currentFace = {
				id: (currentFace.id + 1) as CubeId,
				leftIndex: index,
				rightIndex: index + cubeSize - 1,
				topIndex: lineIndex,
				bottomIndex: lineIndex + cubeSize - 1,
			};
		}
		row.values[index] = char;
	}
	map[lineIndex] = row;
}

faces.push(currentFace);

// Hardcode cube net translations cause I can't anymore
for (const face of faces) {
	switch (face.id) {
		case 1:
			face.top = {
				id: isTest() ? 2 : 6,
				directionOffset: isTest() ? 2 : 1,
			};
			face.right = {
				id: isTest() ? 6 : 2,
				directionOffset: isTest() ? 2 : 0,
			};
			face.bottom = {
				id: isTest() ? 4 : 3,
				directionOffset: isTest() ? 0 : 0,
			};
			face.left = {
				id: isTest() ? 3 : 4,
				directionOffset: isTest() ? 3 : 2,
			};
			break;
		case 2:
			face.top = {
				id: isTest() ? 1 : 6,
				directionOffset: isTest() ? 2 : 0,
			};
			face.right = {
				id: isTest() ? 3 : 5,
				directionOffset: isTest() ? 0 : 2,
			};
			face.bottom = {
				id: isTest() ? 5 : 3,
				directionOffset: isTest() ? 2 : 1,
			};
			face.left = {
				id: isTest() ? 6 : 1,
				directionOffset: isTest() ? 1 : 0,
			};
			break;
		case 3:
			face.top = {
				id: isTest() ? 1 : 1,
				directionOffset: isTest() ? 1 : 0,
			};
			face.right = {
				id: isTest() ? 4 : 2,
				directionOffset: isTest() ? 0 : 3,
			};
			face.bottom = {
				id: isTest() ? 5 : 5,
				directionOffset: isTest() ? 3 : 0,
			};
			face.left = {
				id: isTest() ? 2 : 4,
				directionOffset: isTest() ? 0 : 3,
			};
			break;
		case 4:
			face.top = {
				id: isTest() ? 1 : 3,
				directionOffset: isTest() ? 0 : 1,
			};
			face.right = {
				id: isTest() ? 6 : 5,
				directionOffset: isTest() ? 1 : 0,
			};
			face.bottom = {
				id: isTest() ? 5 : 6,
				directionOffset: isTest() ? 0 : 0,
			};
			face.left = {
				id: isTest() ? 3 : 1,
				directionOffset: isTest() ? 0 : 2,
			};
			break;
		case 5:
			face.top = {
				id: isTest() ? 4 : 3,
				directionOffset: isTest() ? 0 : 0,
			};
			face.right = {
				id: isTest() ? 6 : 2,
				directionOffset: isTest() ? 0 : 2,
			};
			face.bottom = {
				id: isTest() ? 2 : 6,
				directionOffset: isTest() ? 2 : 1,
			};
			face.left = {
				id: isTest() ? 3 : 4,
				directionOffset: isTest() ? 1 : 0,
			};
			break;
		case 6:
			face.top = {
				id: isTest() ? 4 : 4,
				directionOffset: isTest() ? 3 : 0,
			};
			face.right = {
				id: isTest() ? 1 : 5,
				directionOffset: isTest() ? 2 : 3,
			};
			face.bottom = {
				id: isTest() ? 2 : 2,
				directionOffset: isTest() ? 3 : 0,
			};
			face.left = {
				id: isTest() ? 5 : 1,
				directionOffset: isTest() ? 0 : 3,
			};
			break;
	}
}

currentFace = faces[0]!;

const directions = [...rawDirections!.matchAll(/(?<count>\d+)(?<direction>[A-Z])?/g)].map((direction) => ({
	count: parseInt(direction.groups!.count!, 10),
	direction: direction.groups!.direction ?? null,
}));

const directionArr = ['>', 'v', '<', '^'] as const;

let pos: { x: number; y: number; direction: typeof directionArr[number]; directionIndex: number } = {
	x: map[0]!.leftMostIndex,
	y: 0,
	direction: directionArr[0],
	directionIndex: 0,
};

for (const direction of directions) {
	for (let moved = 0; moved < direction.count; moved++) {
		const nextPos: typeof pos = {
			x: pos.x,
			y: pos.y,
			direction: pos.direction,
			directionIndex: pos.directionIndex,
		};
		let nextFace: CubeFace | null = null;
		switch (pos.direction) {
			case '>':
				if (currentFace.rightIndex! >= pos.x + 1) {
					nextPos.x = pos.x + 1;
					break;
				}
				nextFace = faces[currentFace.right!.id - 1]!;
				nextPos.directionIndex = (nextPos.directionIndex + currentFace.right!.directionOffset) % directionArr.length;
				nextPos.direction = directionArr[nextPos.directionIndex]!;
				switch (currentFace.right!.directionOffset) {
					case 0:
						nextPos.x = nextFace.leftIndex!;
						nextPos.y = nextFace.topIndex! + (pos.y - currentFace.topIndex!);
						break;
					case 1:
						nextPos.x = nextFace.leftIndex! + (currentFace.bottomIndex! - pos.y);
						nextPos.y = nextFace.topIndex!;
						break;
					case 2:
						nextPos.x = nextFace.rightIndex!;
						nextPos.y = nextFace.topIndex! + (currentFace.bottomIndex! - pos.y);
						break;
					case 3:
						nextPos.x = nextFace.leftIndex! + (pos.y - currentFace.topIndex!);
						nextPos.y = nextFace.bottomIndex!;
						break;
				}
				break;
			case 'v':
				if (currentFace.bottomIndex! >= pos.y + 1) {
					nextPos.y = pos.y + 1;
					break;
				}
				nextFace = faces[currentFace.bottom!.id - 1]!;
				nextPos.directionIndex = (nextPos.directionIndex + currentFace.bottom!.directionOffset) % directionArr.length;
				nextPos.direction = directionArr[nextPos.directionIndex]!;
				switch (currentFace.bottom!.directionOffset) {
					case 0:
						nextPos.x = nextFace.leftIndex! + (pos.x - currentFace.leftIndex!);
						nextPos.y = nextFace.topIndex!;
						break;
					case 1:
						nextPos.x = nextFace.rightIndex!;
						nextPos.y = nextFace.topIndex! + (pos.x - currentFace.leftIndex!);
						break;
					case 2:
						nextPos.x = nextFace.leftIndex! + (currentFace.rightIndex! - pos.x);
						nextPos.y = nextFace.bottomIndex!;
						break;
					case 3:
						nextPos.x = nextFace.leftIndex!;
						nextPos.y = nextFace.topIndex! + (currentFace.rightIndex! - pos.x);
						break;
				}
				break;
			case '<':
				if (currentFace.leftIndex! <= pos.x - 1) {
					nextPos.x = pos.x - 1;
					break;
				}
				nextFace = faces[currentFace.left!.id - 1]!;
				nextPos.directionIndex = (nextPos.directionIndex + currentFace.left!.directionOffset) % directionArr.length;
				nextPos.direction = directionArr[nextPos.directionIndex]!;
				switch (currentFace.left!.directionOffset) {
					case 0:
						nextPos.x = nextFace.rightIndex!;
						nextPos.y = nextFace.topIndex! + (pos.y - currentFace.topIndex!);
						break;
					case 1:
						nextPos.x = nextFace.leftIndex! + (currentFace.bottomIndex! - pos.y);
						nextPos.y = nextFace.bottomIndex!;
						break;
					case 2:
						nextPos.x = nextFace.leftIndex!;
						nextPos.y = nextFace.topIndex! + (currentFace.bottomIndex! - pos.y);
						break;
					case 3:
						nextPos.x = nextFace.leftIndex! + (pos.y - currentFace.topIndex!);
						nextPos.y = nextFace.topIndex!;
						break;
				}
				break;
			case '^':
				if (currentFace.topIndex! <= pos.y - 1) {
					nextPos.y = pos.y - 1;
					break;
				}
				nextFace = faces[currentFace.top!.id - 1]!;
				nextPos.directionIndex = (nextPos.directionIndex + currentFace.top!.directionOffset) % directionArr.length;
				nextPos.direction = directionArr[nextPos.directionIndex]!;
				switch (currentFace.top!.directionOffset) {
					case 0:
						nextPos.x = nextFace.leftIndex! + (pos.x - currentFace.leftIndex!);
						nextPos.y = nextFace.bottomIndex!;
						break;
					case 1:
						nextPos.x = nextFace.leftIndex!;
						nextPos.y = nextFace.topIndex! + (pos.x - currentFace.leftIndex!);
						break;
					case 2:
						nextPos.x = nextFace.leftIndex! + (currentFace.rightIndex! - pos.x);
						nextPos.y = nextFace.topIndex!;
						break;
					case 3:
						nextPos.x = nextFace.rightIndex!;
						nextPos.y = nextFace.topIndex! + (currentFace.rightIndex! - pos.x);
						break;
				}
		}
		const nextRow = map[nextPos.y];
		if (!nextRow) throw new Error(`Next row not real`);
		if (nextRow.values[nextPos.x] === '#') break;
		map[pos.y]!.values[pos.x] = pos.direction;
		pos = nextPos;
		if (nextFace) currentFace = nextFace;
	}
	if (direction.direction === null) break;
	pos.directionIndex =
		(direction.direction === 'R' ? pos.directionIndex + 1 : pos.directionIndex - 1 + directionArr.length) %
		directionArr.length;
	pos.direction = directionArr[pos.directionIndex]!;
}

if (isTest()) {
	console.log(
		map
			.map((row) => {
				let output = row.values.join('');
				for (let i = 0; i < row.leftMostIndex; i++) {
					output = ` ${output}`;
				}
				return output;
			})
			.join('\n'),
	);
}

const password = 1000 * (pos.y + 1) + 4 * (pos.x + 1) + pos.directionIndex;

console.log(password);
