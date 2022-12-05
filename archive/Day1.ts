import { readFileSync } from 'fs';

const input = readFileSync('inputs/calories.txt').toString();
const lines = input.split('\n');

const elves: number[] = [0];

let elfNum = 0;

for (const line of lines) {
	if (line.trim() === '') {
		elfNum++;
		elves[elfNum] = 0;
		continue;
	}
	elves[elfNum] += parseInt(line.trim(), 10);
}

const mostCarried: [[number, number], [number, number], [number, number]] = [
	[-1, 0],
	[-1, 0],
	[-1, 0],
];

for (const [index, elf] of elves.entries()) {
	if (elf < mostCarried[2][1]) {
		continue;
	}
	if (elf > mostCarried[0][1]) {
		mostCarried[2] = mostCarried[1];
		mostCarried[1] = mostCarried[0];
		mostCarried[0] = [index, elf];
		continue;
	}
	if (elf > mostCarried[1][1]) {
		mostCarried[2] = mostCarried[1];
		mostCarried[1] = [index, elf];
		continue;
	}
	mostCarried[2] = [index, elf];
}

const totalMostCarried = mostCarried.reduce((prev, curr) => prev + curr[1], 0);

console.log(
	`The elves carrying the most are elf ${mostCarried[0][0]}, ${mostCarried[1][0]}, and ${mostCarried[2][0]} with ${mostCarried[0][1]}, ${mostCarried[1][1]}, and ${mostCarried[2][1]} calories.\n A combined total of ${totalMostCarried}`,
);
