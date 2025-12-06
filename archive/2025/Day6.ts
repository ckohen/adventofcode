export const useRawInput = false;

export async function part1(lines: string[]) {
	const parsed: string[][] = [];
	for (const line of lines) {
		parsed.push(line.split(' ').filter((value) => value !== ''));
	}
	let totals: number[] = [];
	for (let i = 0; i < parsed[0]!.length; i++) {
		let numbers: number[] = [];
		let toDo: '*' | '+' | void;
		for (const parsedLine of parsed) {
			const num = Number(parsedLine[i]);
			if (Number.isNaN(num)) {
				if (parsedLine[i] !== '*' && parsedLine[i] !== '+') {
					throw new Error();
				}
				toDo = parsedLine[i] as '*' | '+';
			} else {
				numbers.push(num);
			}
		}
		totals.push(numbers.reduce((prev, curr) => (toDo === '*' ? prev * curr : prev + curr)));
	}
	return totals.reduce((prev, curr) => prev + curr);
}

export async function part2(lines: string[]) {
	let totals: number[] = [];
	let currentNumbers: number[] = [];
	let toDo: '*' | '+' | undefined;
	for (let i = 0; i < lines[0]!.length; i++) {
		let currentStrings: string[] = [];
		for (const line of lines) {
			currentStrings.push(line[i]!);
		}
		if (currentStrings.every((value) => value === ' ')) {
			if (toDo === undefined) throw new Error();
			totals.push(currentNumbers.reduce((prev, curr) => (toDo === '*' ? prev * curr : prev + curr)));
			currentNumbers = [];
			toDo = undefined;
			continue;
		}

		if (currentStrings[currentStrings.length - 1] !== ' ') {
			if (currentStrings[currentStrings.length - 1] !== '*' && currentStrings[currentStrings.length - 1] !== '+') {
				throw new Error();
			}
			toDo = currentStrings[currentStrings.length - 1] as '*' | '+';
			currentStrings = currentStrings.slice(0, currentStrings.length - 1);
		}
		currentStrings = currentStrings.filter((value) => value !== ' ');
		currentNumbers.push(Number(currentStrings.join('')));
	}
	if (toDo === undefined) throw new Error();
	totals.push(currentNumbers.reduce((prev, curr) => (toDo === '*' ? prev * curr : prev + curr)));
	currentNumbers = [];
	toDo = undefined;
	return totals.reduce((prev, curr) => prev + curr);
}
