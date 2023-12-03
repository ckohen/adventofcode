import { readFileSync } from 'fs';

const input = readFileSync('inputs/sectionAssignments.txt').toString();
const lines = input.split('\n');

let overlapping = 0;

for (const line of lines) {
	const [elf1, elf2] = line.split(',').map((range) => range.split('-').map((num) => parseInt(num, 10))) as [
		[number, number],
		[number, number],
	];
	if (elf1[0] === elf2[0] || elf1[1] === elf2[1]) {
		overlapping++;
		continue;
	}
	if (elf1[0] > elf2[0]) {
		if (elf1[0] <= elf2[1]) {
			overlapping++;
		}
		continue;
	}
	if (elf1[1] >= elf2[0]) {
		overlapping++;
	}
}

console.log(overlapping);
