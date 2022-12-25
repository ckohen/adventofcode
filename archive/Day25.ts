import { readFileSync } from 'fs';

const input = readFileSync('inputs/fuelRequirements.txt').toString();
const lines = input.split('\n');

const numbers = {
	2: 2,
	1: 1,
	0: 0,
	'-': -1,
	'=': -2,
} as const;

function isSnafuNumber(digit: string | number): digit is keyof typeof numbers {
	return Object.keys(numbers).includes(digit as string);
}

const decimalNumbers: number[] = [];

for (const line of lines) {
	const digits = line.split('');
	let placeMult = 1;
	let decimalNumber = 0;
	for (const digit of digits.reverse()) {
		if (!isSnafuNumber(digit)) throw new Error('Invalid input');
		decimalNumber += numbers[digit] * placeMult;
		placeMult *= 5;
	}
	decimalNumbers.push(decimalNumber);
}

const total = decimalNumbers.reduce((prev, curr) => prev + curr);

function recode(decimal: number): string {
	let leftToRecode = decimal;
	let placeMult = 1;
	let output = '';

	while (leftToRecode > 0) {
		let remainder = (leftToRecode % (placeMult * 5)) / placeMult;
		if (remainder > 2) {
			remainder -= 5;
		}
		output = `${remainder === -1 ? '-' : remainder === -2 ? '=' : remainder}${output}`;
		leftToRecode -= remainder * placeMult;

		placeMult *= 5;
	}
	return output;
}

console.log(total);
console.log(recode(total));
