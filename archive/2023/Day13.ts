export const useRawInput = false;

function getHorizontalReflection(lines: string[]) {
	const reflections: number[] = [];
	let didBreak = false;
	for (let index = 0; index < lines.length - 1; index++) {
		didBreak = false;
		for (let reflectedIndex = index + 1; reflectedIndex < lines.length; reflectedIndex++) {
			const initialIndex = index - (reflectedIndex - (index + 1));
			if (initialIndex < 0) {
				reflections.push((index + 1) * 100);
			}
			const line = lines[initialIndex]!;
			const reflectedLine = lines[reflectedIndex];
			if (line !== reflectedLine) {
				didBreak = true;
				break;
			}
		}
		if (!didBreak) {
			reflections.push((index + 1) * 100);
		}
	}
	return reflections;
}

function parseInput(lines: string[], shouldTest = false, isTest = false) {
	const patternResults: number[] = [];
	let patternStartIndex = 0;
	let currentVerticalReflections: boolean[] = new Array(lines[0]!.length - 1).fill(true);

	function processLastPattern(currentIndex: number) {
		const verticalReflections = currentVerticalReflections.reduce<number[]>(
			(reflections, currentCol, index) => (currentCol === true ? [...reflections, index + 1] : reflections),
			[],
		);
		const originalResults: number[] = [];
		originalResults.push(...verticalReflections);

		const horiziontalReflections = getHorizontalReflection(lines.slice(patternStartIndex, currentIndex));
		originalResults.push(...horiziontalReflections);

		if (!isTest && originalResults.length !== 1) {
			throw new Error(`Invalid pattern before ${currentIndex}, ${originalResults}`);
		}

		currentVerticalReflections = new Array((lines[currentIndex + 1]?.length ?? 1) - 1).fill(true);

		// We can always return here because there will only be one group
		if (shouldTest) {
			const thisPattern = lines.slice(patternStartIndex, currentIndex);
			patternStartIndex = currentIndex + 1;
			for (let row = 0; row < thisPattern.length; row++) {
				const thisRow = thisPattern[row]!;
				for (let col = 0; col < thisRow.length; col++) {
					const replacedRow = `${thisRow.slice(0, col)}${thisRow[col] === '#' ? '.' : '#'}${thisRow.slice(col + 1)}`;
					thisPattern[row] = replacedRow;
					const testResult = parseInput(thisPattern, false, true);
					const originalResult = originalResults[0]!;
					if (testResult.length > 1) {
						patternResults.push(...testResult.filter((result) => result !== originalResult));
						return;
					}
					if (testResult[0] === undefined) continue;
					if (testResult[0] !== originalResult) {
						patternResults.push(testResult[0]);
						return;
					}
				}
				thisPattern[row] = thisRow;
			}
			return;
		}

		patternResults.push(...originalResults);
		patternStartIndex = currentIndex + 1;
	}

	for (const [lineIndex, line] of lines.entries()) {
		if (line === '') {
			try {
				processLastPattern(lineIndex);
			} catch (err) {
				if (isTest) return [];
				throw err;
			}
			continue;
		}
		for (let charIndex = 0; charIndex < line.length - 1; charIndex++) {
			for (let reflectedIndex = charIndex + 1; reflectedIndex < line.length; reflectedIndex++) {
				const initialIndex = charIndex - (reflectedIndex - (charIndex + 1));
				if (initialIndex < 0) {
					break;
				}
				if (line[initialIndex] !== line[reflectedIndex]) {
					currentVerticalReflections[charIndex] = false;
					break;
				}
			}
		}
	}
	try {
		processLastPattern(lines.length);
	} catch (err) {
		if (isTest) return [];
		throw err;
	}
	return patternResults;
}

export async function part1(lines: string[]) {
	const reflectionPoints = parseInput(lines);
	return reflectionPoints.reduce((total, current) => total + current);
}

export async function part2(lines: string[]) {
	const reflectionPoints = parseInput(lines, true);
	return reflectionPoints.reduce((total, current) => total + current);
}
