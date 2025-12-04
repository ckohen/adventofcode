export const useRawInput = false;

function getToX(input: string[][]): [number, number][] {
	let toX: [number, number][] = [];
	for (let y = 0; y < input.length; y++) {
		for (let x = 0; x < input[y]!.length; x++) {
			if (input[y]![x] === '@') {
				let count = 0;
				const prevY = input[y - 1];
				if (prevY) {
					if (prevY[x - 1] === '@') count++;
					if (prevY[x] === '@') count++;
					if (prevY[x + 1] === '@') count++;
				}
				if (input[y]![x - 1] === '@') count++;
				if (input[y]![x + 1] === '@') count++;
				const nextY = input[y + 1];
				if (nextY) {
					if (nextY[x - 1] === '@') count++;
					if (nextY[x] === '@') count++;
					if (nextY[x + 1] === '@') count++;
				}
				if (count < 4) {
					toX.push([x, y]);
				}
			}
		}
	}
	return toX;
}

export async function part1(lines: string[]) {
	const input = lines.map((line) => line.split(''));

	return getToX(input).length;
}

export async function part2(lines: string[]) {
	const input = lines.map((line) => line.split(''));
	let count = 0;
	let prevCount = -1;
	while (prevCount !== 0) {
		const result = getToX(input);
		for (const [x, y] of result) {
			input[y]![x] = '.';
		}
		prevCount = result.length;
		count += prevCount;
	}

	return count;
}
