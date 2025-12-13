export const useRawInput = false;

function parseInput(lines: string[]) {
	const shapes: string[][][] = [];
	const regions: { width: number; length: number; counts: number[] }[] = [];
	let isRegion = false;
	let tempShape: string[][] = [];
	for (const line of lines) {
		if (line === '') {
			shapes.push(tempShape);
			tempShape = [];
			continue;
		}
		if (line.endsWith(':')) continue;

		if (isRegion || line.includes('x')) {
			isRegion = true;
			const [area, shapesString] = line.split(':');
			const [width, length] = area!.split('x').map(Number) as [number, number];
			const counts = shapesString!.trim().split(' ').map(Number);
			regions.push({ width, length, counts });
			continue;
		}

		tempShape.push(line.split(''));
	}

	return { shapes, regions };
}

function generateRotations(shape: string[][]) {
	let normal: string[][] = [];
	let right: string[][] = [];
	let upsidedown: string[][] = [];
	let left: string[][] = [];
	let flip: string[][] = [];
	let flipright: string[][] = [];
	let flipupsidedown: string[][] = [];
	let flipleft: string[][] = [];
	for (const [rowIndex, row] of shape.entries()) {
		for (const [colIndex, col] of row.entries()) {
			normal[rowIndex] ??= [];
			normal[rowIndex][colIndex] = col;
			right[colIndex] ??= [];
			right[colIndex]![shape.length - 1 - rowIndex] = col;
			upsidedown[shape.length - 1 - rowIndex] ??= [];
			upsidedown[shape.length - 1 - rowIndex]![row.length - 1 - colIndex] = col;
			left[row.length - 1 - colIndex] ??= [];
			left[row.length - 1 - colIndex]![rowIndex] = col;
			flip[shape.length - 1 - rowIndex] ??= [];
			flip[shape.length - 1 - rowIndex]![colIndex] = col;
			flipright[colIndex] ??= [];
			flipright[colIndex][rowIndex] = col;
			flipupsidedown[rowIndex] ??= [];
			flipupsidedown[rowIndex][row.length - 1 - colIndex] = col;
			flipleft[row.length - 1 - colIndex] ??= [];
			flipleft[row.length - 1 - colIndex]![shape.length - 1 - rowIndex] = col;
		}
	}
	const finalRotations: string[][][] = [];
	outer: for (const rotation of [normal, right, upsidedown, left, flip, flipright, flipupsidedown, flipleft]) {
		const currentShape = rotation.map((row) => row.join('')).join('\n');
		for (const existingRotation of finalRotations) {
			if (currentShape === existingRotation.map((row) => row.join('')).join('\n')) {
				continue outer;
			}
		}
		finalRotations.push(rotation);
	}

	return finalRotations;
}

function addToRegion(region: string[][], shape: string[][], startRow: number, startCol: number) {
	const newRegion = [...region.map((row) => [...row])];
	for (const [rowIndex, row] of shape.entries()) {
		for (const [colIndex, col] of row.entries()) {
			if (col === '.') continue;
			if (newRegion[rowIndex + startRow]?.[colIndex + startCol] !== '.') {
				return null;
			}
			newRegion[rowIndex + startRow]![colIndex + startCol] = col;
		}
	}
	return newRegion;
}

const memo: Record<string, string[][] | null> = {};

function placeShapes(region: string[][], shapes: string[][][][], counts: number[]): string[][] | null {
	const key = `${region.map((row) => row.join('')).join('.')}-${counts.join(',')}`;
	if (key in memo) return memo[key]!;
	if (counts.every((count) => count === 0)) {
		memo[key] = region;
		return region;
	}
	const viableNextRegions: { nextRegion: string[][]; shapeIndex: number }[] = [];
	for (const [shapeIndex, count] of counts.entries()) {
		if (count === 0) continue;
		const shape = shapes[shapeIndex]!;
		for (const rotation of shape) {
			for (let row = 0; row < region.length; row++) {
				for (let col = 0; col < region[0]!.length; col++) {
					const nextRegion = addToRegion(region, rotation, row, col);
					if (nextRegion !== null) {
						viableNextRegions.push({ nextRegion, shapeIndex });
					}
				}
			}
		}
	}
	if (viableNextRegions.length === 0) {
		memo[key] = null;
		return null;
	}
	for (const { nextRegion, shapeIndex } of viableNextRegions) {
		const newCounts = [...counts];
		newCounts[shapeIndex]! -= 1;
		const nextPlaced = placeShapes(nextRegion, shapes, newCounts);
		if (nextPlaced) {
			memo[key] = nextPlaced;
			return nextPlaced;
		}
	}
	memo[key] = null;
	return null;
}

export async function part1(lines: string[]) {
	const { shapes, regions } = parseInput(lines);
	const shapeCounts = shapes.map((shape) =>
		shape.reduce((total, row) => total + row.reduce((subtotal, col) => subtotal + (col === '#' ? 1 : 0), 0), 0),
	);
	const shapeCountsLarge = shapes.map((shape) => shape.reduce((total, row) => total + row.length, 0));
	const shapeRotations = shapes.map((shape) => generateRotations(shape));

	let fittingRegions = 0;

	for (const region of regions) {
		let sum = 0;
		let sumLarge = 0;
		for (const [shapeIndex, count] of region.counts.entries()) {
			sum += shapeCounts[shapeIndex]! * count;
			sumLarge += shapeCountsLarge[shapeIndex]! * count;
		}
		if (sum > region.width * region.length) continue;
		if (sumLarge <= region.width * region.length) {
			fittingRegions++;
			continue;
		}
		console.warn('Packing shapes....this is gonna be a while');
		const startingMap: string[][] = new Array(region.length);
		for (let i = 0; i < region.length; i++) {
			startingMap[i] = new Array(region.width).fill('.');
		}

		const result = placeShapes(startingMap, shapeRotations, region.counts);

		if (result) {
			fittingRegions++;
		}
	}

	return fittingRegions;
}

export async function part2(lines: string[]) {
	return lines;
}
