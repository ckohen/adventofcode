export const useRawInput = false;

export async function part1(lines: string[]) {
	let maxArea = 0;
	const points = lines.map((line) => line.split(',').map(Number) as [number, number]);
	for (const [index, point] of points.entries()) {
		for (const point2 of points.slice(index + 1)) {
			maxArea = Math.max((Math.abs(point[0] - point2[0]) + 1) * (Math.abs(point[1] - point2[1]) + 1), maxArea);
		}
	}
	return maxArea;
}

export async function part2(lines: string[]) {
	const points = lines.map((line) => line.split(',').map(Number) as [number, number]);

	const xRanges: [number, number, continues: boolean][][] = [];

	for (const [index, point] of points.entries()) {
		const nextPoint = points[index + 1] ?? points[0]!;
		if (nextPoint[1] === point[1]) {
			const lastPoint = points[index - 1] ?? points[points.length - 1]!;
			const nextNextPoint = points[index + 2] ?? points[index === points.length - 1 ? 1 : 0]!;
			const lastPointToPointDirection = point[1] - lastPoint[1] > 0;
			const nextPointToNextNextPointDirection = nextPoint[1] - nextNextPoint[1] > 0;
			xRanges[point[1]] ??= [];
			xRanges[point[1]]!.push([
				Math.min(nextPoint[0], point[0]),
				Math.max(nextPoint[0], point[0]),
				lastPointToPointDirection !== nextPointToNextNextPointDirection,
			]);
		} else if (nextPoint[0] === point[0]) {
			const min = Math.min(nextPoint[1], point[1]);
			const max = Math.max(nextPoint[1], point[1]);
			for (let row = min + 1; row < max; row++) {
				xRanges[row] ??= [];
				xRanges[row]!.push([point[0], point[0], false]);
			}
		} else {
			throw new Error();
		}
	}

	const finalRanges: [number, number][][] = [];

	for (const [index, row] of xRanges.entries()) {
		if (!row) continue;
		row.sort((a, b) => a[0] - b[0]);
		const newRanges: [number, number][] = [];
		let last = -1;
		for (const range of row) {
			if (range[0] !== range[1]) {
				if (last !== -1) {
					if (range[2]) {
						newRanges.push([last, range[1]]);
						last = -1;
					}
					continue;
				}
				last = -1;
				newRanges.push([range[0], range[1]]);
				if (range[2]) {
					last = range[1];
				}
				continue;
			}
			if (newRanges.find((existing) => existing[0] === range[0] || existing[1] === range[0])) continue;
			if (last !== -1) {
				newRanges.push([last, range[1]]);
				last = -1;
			} else {
				last = range[1];
			}
		}
		if (last !== -1) {
			throw new Error();
		}
		const consolidated: [number, number][] = [];
		let lastRange: [number, number] = [-1, -1];
		for (const range of newRanges) {
			if (lastRange[1] !== -1) {
				if (range[0] === lastRange[1]) {
					lastRange[1] = range[1];
				} else {
					consolidated.push(lastRange);
					lastRange = [-1, -1];
				}
				continue;
			}
			lastRange = range;
		}
		if (lastRange[0] !== -1) {
			consolidated.push(lastRange);
		}
		finalRanges[index] = consolidated;
	}

	let maxArea = 0;
	for (const [index, point] of points.entries()) {
		inner: for (const point2 of points.slice(index + 1)) {
			const xRange = [Math.min(point[0], point2[0]), Math.max(point[0], point2[0])] as const;
			const yRange = [Math.min(point[1], point2[1]), Math.max(point[1], point2[1])] as const;
			row: for (let row = yRange[0]; row <= yRange[1]; row++) {
				const validRanges = finalRanges[row];
				if (!validRanges) throw new Error();
				for (const range of validRanges) {
					if (range[0] <= xRange[0] && xRange[1] <= range[1]) continue row;
				}
				continue inner;
			}
			maxArea = Math.max((Math.abs(point[0] - point2[0]) + 1) * (Math.abs(point[1] - point2[1]) + 1), maxArea);
		}
	}
	return maxArea;
}
