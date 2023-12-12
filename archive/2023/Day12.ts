export const useRawInput = false;

function parseLine(line: string) {
	const [springs, rawBrokenCounts] = line.split(' ');
	const brokenCounts = rawBrokenCounts!.split(',').map(Number);
	return { springs: springs!, brokenCounts };
}

const storedArrangmentCounts = new Map<string, number>();

function determineArrangements(
	springs: string,
	groupsToFulfill: number[],
	length: number,
	startingIndex = 0,
	reEvaluateAs?: string,
): number {
	if (startingIndex >= length) return groupsToFulfill.length ? 0 : 1;
	if (groupsToFulfill.length === 0) {
		return springs.slice(startingIndex).includes('#') ? 0 : 1;
	}

	const totalCharsRequired = groupsToFulfill.reduce((total, current) => total + current + 1);
	if (length - startingIndex < totalCharsRequired) {
		return 0;
	}

	const currentChar = reEvaluateAs ?? springs[startingIndex];

	if (currentChar === '.') {
		return recurseCheckCache(springs, groupsToFulfill, length, startingIndex + 1);
	}

	const fulfillingGroup = groupsToFulfill[0]!;
	if (currentChar === '#') {
		if (springs.slice(startingIndex, startingIndex + fulfillingGroup).includes('.')) return 0;
		if (springs[startingIndex + fulfillingGroup] === '#') return 0;
		return recurseCheckCache(springs, groupsToFulfill.slice(1), length, startingIndex + fulfillingGroup + 1);
	}

	return (
		recurseCheckCache(springs, groupsToFulfill, length, startingIndex, '#') +
		recurseCheckCache(springs, groupsToFulfill, length, startingIndex, '.')
	);
}

function recurseCheckCache(
	springs: string,
	groupsToFulfill: number[],
	length: number,
	startingIndex = 0,
	reEvaluateAs?: string,
) {
	const accessor = `${springs}${groupsToFulfill.join('')}:${startingIndex}${reEvaluateAs ?? ''}`;
	const found = storedArrangmentCounts.get(accessor);
	if (found === undefined) {
		const value = determineArrangements(springs, groupsToFulfill, length, startingIndex, reEvaluateAs);
		storedArrangmentCounts.set(accessor, value);
		return value;
	}
	return found;
}

export async function part1(lines: string[]) {
	const result = lines.reduce((total, currentLine) => {
		const parsed = parseLine(currentLine);
		const arrangements = determineArrangements(parsed.springs, parsed.brokenCounts, parsed.springs.length);
		if (arrangements === null) throw new Error(`Invalid line: ${currentLine}`);
		return arrangements + total;
	}, 0);
	return result;
}

export async function part2(lines: string[]) {
	const result = lines.reduce((total, currentLine) => {
		const parsed = parseLine(currentLine);
		const unfoldedSprings = new Array(5).fill(parsed.springs).join('?');
		const unfoldedBrokenCount = new Array(5).fill(parsed.brokenCounts).flat();
		const arrangements = determineArrangements(unfoldedSprings, unfoldedBrokenCount, unfoldedSprings.length);
		if (arrangements === null) throw new Error(`Invalid line: ${currentLine}`);
		return arrangements + total;
	}, 0);
	return result;
}
