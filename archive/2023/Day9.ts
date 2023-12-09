export const useRawInput = false;

function parseLine(line: string): number[] {
	return line.split(' ').map(Number);
}

function getPredictedValue(values: number[], reverse = false): number {
	const differences: number[] = [];
	let isAllZero = true;
	for (let index = 0; index < values.length - 1; index++) {
		const difference = values[index + 1]! - values[index]!;
		differences.push(difference);
		if (difference !== 0) {
			isAllZero = false;
		}
	}
	if (isAllZero) {
		return reverse ? values[0]! : values.at(-1)!;
	}
	const nextPredicted = getPredictedValue(differences, reverse);
	return reverse ? values[0]! - nextPredicted : values.at(-1)! + nextPredicted;
}

export async function part1(lines: string[]) {
	return lines.reduce((totalPredicted, currentLine) => {
		const history = parseLine(currentLine);
		const predicted = getPredictedValue(history);
		return totalPredicted + predicted;
	}, 0);
}

export async function part2(lines: string[]) {
	return lines.reduce((totalPredicted, currentLine) => {
		const history = parseLine(currentLine);
		const predicted = getPredictedValue(history, true);
		return totalPredicted + predicted;
	}, 0);
}
