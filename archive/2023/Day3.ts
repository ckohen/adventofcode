interface Line {
	numbers: { value: number; start: number; end: number }[];
	symbols: { value: string; index: number }[];
	symbolIndexes: number[];
}

function parseLine(rawLine: string) {
	const line: Line = {
		numbers: [],
		symbols: [],
		symbolIndexes: [],
	};
	for (const match of rawLine.matchAll(/\d+/g)) {
		line.numbers.push({ value: Number(match[0]), start: match.index!, end: match.index! + match[0].length - 1 });
	}
	for (const match of rawLine.matchAll(/[^\w\d\s\.]/g)) {
		line.symbols.push({ value: match[0], index: match.index! });
		line.symbolIndexes.push(match.index!);
	}
	return line;
}

function checkAdjacentLineSymbols(num: Line['numbers'][number], symbols: Line['symbols']) {
	for (const symbol of symbols) {
		if (symbol.index >= num.start - 1 && symbol.index <= num.end + 1) {
			return true;
		}
	}
	return false;
}

function getPartNumbers(prevLine: Line | null, currentLine: Line, nextLine: Line | null): number[] {
	const parts: number[] = [];
	for (const num of currentLine.numbers) {
		if (currentLine.symbolIndexes.includes(num.start - 1) || currentLine.symbolIndexes.includes(num.end + 1)) {
			parts.push(num.value);
			continue;
		}

		if (prevLine && checkAdjacentLineSymbols(num, prevLine.symbols)) {
			parts.push(num.value);
			continue;
		}

		if (nextLine && checkAdjacentLineSymbols(num, nextLine.symbols)) {
			parts.push(num.value);
			continue;
		}
	}
	return parts;
}

function getAdjacentNumbers(symbolIndex: number, numbers: Line['numbers']) {
	const adjacent: number[] = [];
	for (const num of numbers) {
		if (symbolIndex >= num.start - 1 && symbolIndex <= num.end + 1) {
			adjacent.push(num.value);
		}
	}
	return adjacent;
}

function getGearRatios(prevLine: Line | null, currentLine: Line, nextLine: Line | null): number[] {
	const gearRatios: number[] = [];
	for (const symbol of currentLine.symbols) {
		if (symbol.value !== '*') continue;

		const adjacentNumbers: number[] = [];
		adjacentNumbers.push(...getAdjacentNumbers(symbol.index, currentLine.numbers));
		if (prevLine) {
			adjacentNumbers.push(...getAdjacentNumbers(symbol.index, prevLine.numbers));
		}
		if (nextLine) {
			adjacentNumbers.push(...getAdjacentNumbers(symbol.index, nextLine.numbers));
		}

		if (adjacentNumbers.length === 2) {
			gearRatios.push(adjacentNumbers[0]! * adjacentNumbers[1]!);
		}
	}
	return gearRatios;
}

export async function part1(lines: string[]) {
	const parsedLines = lines.map(parseLine);
	let totalPartNumber = 0;
	for (let i = 0; i < parsedLines.length; i++) {
		const partNumbers = getPartNumbers(parsedLines[i - 1] ?? null, parsedLines[i]!, parsedLines[i + 1] ?? null);
		for (const partNumber of partNumbers) {
			totalPartNumber += partNumber;
		}
	}
	return totalPartNumber;
}

export async function part2(lines: string[]) {
	const parsedLines = lines.map(parseLine);
	let totalGearRatio = 0;
	for (let i = 0; i < parsedLines.length; i++) {
		const gearRatios = getGearRatios(parsedLines[i - 1] ?? null, parsedLines[i]!, parsedLines[i + 1] ?? null);
		for (const gearRatio of gearRatios) {
			totalGearRatio += gearRatio;
		}
	}
	return totalGearRatio;
}
