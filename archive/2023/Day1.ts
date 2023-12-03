import { readFile } from 'fs/promises';

const sampleInput = (await readFile('inputs/Day1Sample.txt')).toString();
const input = (await readFile('inputs/Day1.txt')).toString();
const sampleLines = sampleInput.split('\n');
const inputLines = input.split('\n');

const NumAsString = {
	one: '1',
	two: '2',
	three: '3',
	four: '4',
	five: '5',
	six: '6',
	seven: '7',
	eight: '8',
	nine: '9',
} as const;

const stringNumberRegex = /(?=(one|two|three|four|five|six|seven|eight|nine|\d))/g;
const numberRegex = /\d/g;

function getDigitsFromLine(line: string, matchStrings: boolean = false): string[] {
	if (!matchStrings) {
		return [...line.matchAll(numberRegex)].map((match) => match[0]);
	}
	return [...line.matchAll(stringNumberRegex)].map((match) =>
		match[1]!.length > 1 ? NumAsString[match[1] as keyof typeof NumAsString] : match[1]!,
	);
}

export async function part1(lines: string[]) {
	const result = lines.reduce((total, currentLine) => {
		const digits = getDigitsFromLine(currentLine);
		if (!digits[0] || !digits.at(-1)) throw new RangeError('Input contained a line without a digit');
		const lineValue = digits[0] + digits.at(-1);
		return total + Number(lineValue);
	}, 0);

	return result;
}

export async function part2(lines: string[]) {
	const result = lines.reduce((total, currentLine) => {
		const digits = getDigitsFromLine(currentLine, true);
		if (!digits[0] || !digits.at(-1)) throw new RangeError('Input contained a line without a digit');
		const lineValue = digits[0] + digits.at(-1);
		return total + Number(lineValue);
	}, 0);

	return result;
}

part1(inputLines);
sampleLines;
console.log(await part2(inputLines));
