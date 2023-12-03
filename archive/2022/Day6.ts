import { readFileSync } from 'fs';

const input = readFileSync('inputs/datastream.txt').toString();

const charCount = 14;
const lastChars: string[] = [...input.slice(0, charCount)];
let startOfStream = charCount;

for (startOfStream; startOfStream < input.length; startOfStream++) {
	if (new Set(lastChars).size === charCount) break;
	lastChars.shift();
	lastChars.push(input[startOfStream]!);
}

console.log(startOfStream);
