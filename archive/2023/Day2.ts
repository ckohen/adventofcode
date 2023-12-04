import { readFile } from 'fs/promises';

const sampleInput = (await readFile('inputs/Day2Sample.txt')).toString();
const input = (await readFile('inputs/Day2.txt')).toString();
const sampleLines = sampleInput.split('\n');
const inputLines = input.split('\n');

interface Game {
	id: number;
	pulls: { red: number; green: number; blue: number }[];
}

function parseGame(line: string): Game {
	const [gameText, gameValues] = line.split(':');
	if (!gameText || !gameValues) throw new Error(`Line contained invalid game string: ${line}`);
	const [, rawId] = gameText.split(' ');
	if (!rawId) throw new Error(`Game id invalid: ${gameText}`);

	const pulls: Game['pulls'] = [];
	const separatedPulls = gameValues.trim().split(';');
	for (const rawPull of separatedPulls) {
		const pull: Game['pulls'][number] = { red: 0, green: 0, blue: 0 };

		const cubes = rawPull.split(',');
		for (const cube of cubes) {
			const [rawCount, color] = cube.trim().split(' ');
			const count = Number(rawCount);
			if (!['red', 'green', 'blue'].includes(color as string)) throw new Error(`Invalid color: ${color}, line ${line}`);
			pull[color as keyof typeof pull] = count;
		}
		pulls.push(pull);
	}

	return {
		id: Number(rawId),
		pulls,
	};
}

export async function part1(lines: string[]) {
	const redCubes = 12;
	const greenCubes = 13;
	const blueCubes = 14;

	let result = 0;
	for (const line of lines) {
		const game = parseGame(line);
		let failed = false;
		for (const pull of game.pulls) {
			if (pull.red > redCubes || pull.green > greenCubes || pull.blue > blueCubes) {
				failed = true;
				break;
			}
		}
		if (!failed) {
			result += game.id;
		}
	}
	return result;
}

export async function part2(lines: string[]) {
	const result = lines.reduce((totalPower, currentLine) => {
		const game = parseGame(currentLine);
		let maxRed = 0;
		let maxGreen = 0;
		let maxBlue = 0;
		for (const pull of game.pulls) {
			if (pull.red > maxRed) maxRed = pull.red;
			if (pull.green > maxGreen) maxGreen = pull.green;
			if (pull.blue > maxBlue) maxBlue = pull.blue;
		}
		const power = maxRed * maxGreen * maxBlue;
		return totalPower + power;
	}, 0);
	return result;
}

console.log(await part1(inputLines));
sampleLines;
console.log(await part2(inputLines));
