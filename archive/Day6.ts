import { readFileSync } from 'fs';

const input = readFileSync('inputs/datastream.txt').toString();

const charCount = 14;
const lastChars: string[] = [...input.slice(0, charCount)];
let lastIndex = charCount - 1;

for (lastIndex; lastIndex < input.length; lastIndex++) {
	if (new Set(lastChars).size === charCount) break;
	lastChars.shift();
	lastChars.push(input[lastIndex + 1]!);
}

console.log(lastIndex + 1);
