export const useRawInput = false;

function parseLine(line: string) {
	const galaxyPositions: number[] = [];
	for (const [index, char] of line.split('').entries()) {
		if (char === '.') continue;
		galaxyPositions.push(index);
	}
	return galaxyPositions;
}

function getGalaxyPositions(lines: string[], growthFactor: number) {
	const emptyRows = new Array(lines[0]!.length).fill(true);
	const galaxyPositions: [number, number][] = [];
	let index = 0;
	for (const line of lines) {
		const galaxies = parseLine(line);
		for (const galaxy of galaxies) {
			emptyRows[galaxy] = false;
			galaxyPositions.push([index, galaxy]);
		}
		index += galaxies.length === 0 ? growthFactor : 1;
	}
	for (const position of galaxyPositions) {
		const rowsExpandedBefore = emptyRows.reduce(
			(rows, currentRow, currentIndex) => rows + (position[1] > currentIndex && currentRow ? growthFactor - 1 : 0),
			0,
		);
		position[1] += rowsExpandedBefore;
	}
	return galaxyPositions;
}

export async function part1(lines: string[]) {
	const galaxyPositions = getGalaxyPositions(lines, 2);
	let shortestPathSum = 0;
	for (let index1 = 0; index1 < galaxyPositions.length; index1++) {
		for (let index2 = index1 + 1; index2 < galaxyPositions.length; index2++) {
			const galaxy1 = galaxyPositions[index1]!;
			const galaxy2 = galaxyPositions[index2]!;
			shortestPathSum += Math.abs(galaxy2[0] - galaxy1[0]) + Math.abs(galaxy2[1] - galaxy1[1]);
		}
	}
	return shortestPathSum;
}

export async function part2(lines: string[]) {
	const galaxyPositions = getGalaxyPositions(lines, 1_000_000);
	let shortestPathSum = 0;
	for (let index1 = 0; index1 < galaxyPositions.length; index1++) {
		for (let index2 = index1 + 1; index2 < galaxyPositions.length; index2++) {
			const galaxy1 = galaxyPositions[index1]!;
			const galaxy2 = galaxyPositions[index2]!;
			shortestPathSum += Math.abs(galaxy2[0] - galaxy1[0]) + Math.abs(galaxy2[1] - galaxy1[1]);
		}
	}
	return shortestPathSum;
}
