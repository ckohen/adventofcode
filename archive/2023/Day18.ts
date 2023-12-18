export const useRawInput = false;

const directions = {
	R: [0, 1],
	D: [1, 0],
	L: [0, -1],
	U: [-1, 0],
} as const;

interface Instruction {
	direction: keyof typeof directions;
	distance: number;
}

function parseInput(lines: string[], useHex = false) {
	const instructions: Instruction[] = [];
	for (const line of lines) {
		const match = /(?<direction>[RDLU]) (?<rawDistance>\d+) \(#(?<rawColor>[\d\w]+)/gi.exec(line);
		if (!match) throw new Error(`Invalid line ${line}`);
		const { direction, rawDistance, rawColor } = match.groups!;
		if (useHex) {
			const colorDistance = parseInt(rawColor!.slice(0, 5), 16);
			const colorDirection = Object.keys(directions)[Number(rawColor![5]!)]!;
			instructions.push({
				direction: colorDirection as Instruction['direction'],
				distance: colorDistance,
			});
		} else {
			instructions.push({
				direction: direction as Instruction['direction'],
				distance: Number(rawDistance),
			});
		}
	}
	return instructions;
}

function calculateArea(instructions: Instruction[]) {
	let total = 0;
	let perimiter = 0;
	let position: [number, number] = [0, 0];
	for (const instruction of instructions) {
		perimiter += instruction.distance;
		const direction = directions[instruction.direction];
		const nextY = position[0] + direction[0] * instruction.distance;
		const nextX = position[1] + direction[1] * instruction.distance;
		total += position[0] * nextX - position[1] * nextY;
		position = [nextY, nextX];
	}
	const area = Math.abs(total) / 2;
	const interiorPoints = area - perimiter / 2 + 1;
	return interiorPoints + perimiter;
}

export async function part1(lines: string[]) {
	const instructions = parseInput(lines);
	return calculateArea(instructions);
}

export async function part2(lines: string[]) {
	const instructions = parseInput(lines, true);
	return calculateArea(instructions);
}
