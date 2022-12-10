import { readFileSync } from 'fs';

const input = readFileSync('inputs/assembly.txt').toString();
const lines = input.split('\n');

let xReg = 1;
let cycle = 0;

const lineCount = 6;
const spriteWidth = 3;

const crt: string[] = [];

for (let i = 0; i < lineCount; i++) {
	crt[i] = '';
}

function advanceCycle() {
	if (cycle >= 240) return;
	const currentPosition = crt[Math.floor(cycle / 40)]!.length;
	const active =
		currentPosition >= xReg - Math.floor(spriteWidth / 2) && currentPosition <= xReg + Math.floor(spriteWidth / 2);
	crt[Math.floor(cycle / 40)]! += active ? '#' : '.';
	cycle += 1;
}

const instructions = {
	noop: () => advanceCycle(),
	addx: (value: string | undefined) => {
		if (!value) throw new Error('No value provided');
		const num = parseInt(value, 10);
		advanceCycle();
		advanceCycle();
		xReg += num;
	},
};

function isinstruction(instruct: string): instruct is keyof typeof instructions {
	return Object.keys(instructions).includes(instruct);
}

for (const line of lines) {
	const [instruction, value] = line.split(' ');
	if (!instruction || !isinstruction(instruction)) throw new Error('Not a valid instruction');
	instructions[instruction](value);
}

console.log(crt);
