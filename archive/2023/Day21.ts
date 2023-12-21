export const useRawInput = false;

const directions = {
	North: [-1, 0],
	South: [1, 0],
	East: [0, 1],
	West: [0, -1],
} as const;

const directionValues = Object.values(directions);

function parsePlot(lines: string[]) {
	const plot: boolean[][] = [];
	let start: [number, number] | undefined;
	for (const [lineIndex, line] of lines.entries()) {
		plot.push(line.split('').map((char) => ['S', '.'].includes(char)));

		if (line.includes('S')) {
			start = [lineIndex, line.indexOf('S')];
		}
	}

	if (!start) throw new Error('No starting point found');

	return { start, plot };
}

function processSteps(plot: boolean[][], start: [number, number], stepCount: number, infinite = false) {
	let positions = new Set([start.join(',')]);

	let finalPositionCount = 0;
	let countForOppositeParity = 0;

	const skip = new Set<string>();

	const lineCount = plot.length;
	const rowCount = plot[0]!.length;
	const stepsPastGridMult = stepCount % lineCount;

	const newStepIncrements: number[] = [];

	for (let steps = 0; steps < stepCount; steps++) {
		if (steps % lineCount === stepsPastGridMult) {
			newStepIncrements.push(steps % 2 === stepCount % 2 ? finalPositionCount : countForOppositeParity);
		}

		if (newStepIncrements.length === 3) {
			break;
		}

		const newPositions = new Set<string>();
		for (const rawPosition of positions) {
			const position = rawPosition.split(',').map(Number);
			for (const direction of directionValues) {
				let checkLine = position[0]! + direction[0];
				let checkRow = position[1]! + direction[1];

				const newPosition = `${checkLine},${checkRow}`;
				if (skip.has(newPosition)) {
					continue;
				}

				if (infinite) {
					checkLine %= lineCount;
					if (checkLine < 0) {
						checkLine += lineCount;
					}

					checkRow %= rowCount;
					if (checkRow < 0) {
						checkRow += rowCount;
					}
				}

				if (plot[checkLine]?.[checkRow]) {
					if (steps % 2 === stepCount % 2) {
						countForOppositeParity++;
					} else {
						finalPositionCount++;
					}

					skip.add(newPosition);
					newPositions.add(newPosition);
				}
			}
		}

		if (newPositions.size === 0) break;

		positions = newPositions;
	}

	if (newStepIncrements.length === 3 && infinite) {
		const loopNumber = Math.floor(stepCount / lineCount);
		console.log(loopNumber);
		const constant = newStepIncrements[0]!;
		const linear = newStepIncrements[1]! - newStepIncrements[0]!;
		const quadratic = newStepIncrements[2]! - newStepIncrements[1]!;
		return constant + linear * loopNumber + Math.floor((loopNumber * (loopNumber - 1)) / 2) * (quadratic - linear);
	}

	return finalPositionCount;
}

export async function part1(lines: string[]) {
	const { start, plot } = parsePlot(lines);
	return processSteps(plot, start, 64);
}

export async function part2(lines: string[]) {
	const { start, plot } = parsePlot(lines);
	return processSteps(plot, start, 26_501_365, true);
}
