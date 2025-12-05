export const useRawInput = false;

export async function part1(lines: string[]) {
	let i = 0;
	let line = lines[0];
	const ranges: [number, number][] = [];
	while (line !== '') {
		const [start, end] = line!.split('-').map(Number);
		ranges.push([start!, end!]);
		line = lines[++i];
	}

	let count = 0;
	for (const line of lines.slice(i + 1)) {
		const currentNum = Number(line);
		for (const [start, end] of ranges) {
			if (start <= currentNum && end >= currentNum) {
				count += 1;
				break;
			}
		}
	}
	return count;
}

export async function part2(lines: string[]) {
	let i = 0;
	let line = lines[0];
	const ranges: [number, number][] = [];
	while (line !== '') {
		const [start, end] = line!.split('-').map(Number);
		ranges.push([start!, end!]);
		line = lines[++i];
	}

	for (let index = ranges.length - 1; index > 0; index--) {
		const range1 = ranges[index]!;
		for (const range2 of ranges.slice(0, index)) {
			if (range1[0] <= range2[0] && range2[0] <= range1[1] && range1[0] <= range2[1] && range2[1] <= range1[1]) {
				range2[0] = 1;
				range2[1] = 0;
				continue;
			}
			if (range2[0] <= range1[0] && range1[0] <= range2[1] && range2[0] <= range1[1] && range1[1] <= range2[1]) {
				range1[0] = 1;
				range1[1] = 0;
				break;
			}
			if (range2[0] <= range1[0] && range1[0] <= range2[1]) {
				range1[0] = Math.min(range2[1] + 1, range1[1]);
			}

			if (range2[0] <= range1[1] && range1[1] <= range2[1]) {
				range1[1] = Math.max(range2[0] - 1, range1[0]);
			}
		}
	}

	return ranges.reduce((prev, curr) => (prev += curr[1] - curr[0] + 1), 0);
}
