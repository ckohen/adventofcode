import { readFileSync } from 'fs';

const input = readFileSync('inputs/rucksacks.txt').toString();
const lines = input.split('\n');

const priorities = new Array(52)
	.fill('')
	.map((_, index) => String.fromCharCode(index + (index >= 26 ? 39 : 97)))
	.reduce<Record<string, number>>((prev, curr, index) => {
		prev[curr] = index + 1;
		return prev;
	}, {});

let prioritySum = 0;

let line1: string | null = null;
let line2: string | null = null;

for (const line of lines) {
	if (!line1) {
		line1 = line;
		continue;
	}
	if (!line2) {
		line2 = line;
		continue;
	}
	for (const char of line1) {
		if (!line2.includes(char)) {
			continue;
		}
		if (!line.includes(char)) {
			continue;
		}
		prioritySum += priorities[char]!;
		line1 = null;
		line2 = null;
		break;
	}
}

console.log(prioritySum);
