import { readFileSync } from 'fs';

const input = readFileSync('inputs/crates.txt').toString();
const [rawCrates, instructions] = input.split('\n\n').map((lineset) => lineset.split('\n'));

const crates: string[][] = [];
let firstLine = true;

for (const line of rawCrates!.reverse()) {
	if (firstLine) {
		for (let i = 0; i < line.length - 1; i += 4) {
			crates[i / 4 + 1] = [];
		}
		firstLine = false;
		continue;
	}
	for (let i = 0; i < line.length - 1; i += 4) {
		const char = line[i + 1]!;
		if (char === ' ') continue;
		crates[i / 4 + 1]!.push(char);
	}
}

for (const instruction of instructions!) {
	const match = /move (?<rawCount>\d*) from (?<rawFrom>\d*) to (?<rawTo>\d*)/gi.exec(instruction);
	if (!match) continue;
	const { rawCount, rawFrom, rawTo } = match.groups!;
	const count = parseInt(rawCount!, 10);
	const from = parseInt(rawFrom!, 10);
	const to = parseInt(rawTo!, 10);
	const moving: string[] = [];
	for (let moved = 0; moved < count; moved++) {
		moving.push(crates[from]!.pop()!);
	}
	crates[to]!.push(...moving.reverse());
}

console.log(crates.reduce((prev, curr) => prev + curr[curr.length - 1]!, ''));
