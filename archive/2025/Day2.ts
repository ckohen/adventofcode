export const useRawInput = false;

function parseInput(input: string) {
	return input.split(',').map((range) => range.split('-').map(Number) as [number, number]);
}

export async function part1(lines: string[]) {
	const parsed = parseInput(lines[0]!);
	const invalids: number[] = [];
	for (const [start, end] of parsed) {
		for (let i = start; i <= end; i++) {
			const stringValue = i.toString();
			const halfLength = stringValue.length / 2;
			if (halfLength % 1 !== 0) continue;
			if (stringValue.slice(0, halfLength) !== stringValue.slice(halfLength)) continue;
			invalids.push(i);
		}
	}
	return invalids.reduce((a, b) => a + b, 0);
}

export async function part2(lines: string[]) {
	const parsed = parseInput(lines[0]!);
	const invalids: number[] = [];
	for (const [start, end] of parsed) {
		valueCheck: for (let i = start; i <= end; i++) {
			const stringValue = i.toString();
			for (let multiple = 2; multiple <= stringValue.length; multiple++) {
				const multipleLength = stringValue.length / multiple;
				if (multipleLength % 1 !== 0) continue;
				if (stringValue.split(stringValue.slice(0, multipleLength)).length - 1 === multiple) {
					invalids.push(i);
					continue valueCheck;
				}
			}
		}
	}
	return invalids.reduce((a, b) => a + b, 0);
}
