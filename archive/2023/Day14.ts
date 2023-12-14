export const useRawInput = false;

const enum Direction {
	North,
	East,
	South,
	West,
}

function calculateTilt(
	mutateablePlatform: string[][],
	originalPlatform: string[][],
	moveInRow = false,
	invert = false,
) {
	const nonMoveDirLength = moveInRow ? originalPlatform.length : originalPlatform[0]!.length;
	const moveDirLength = moveInRow ? originalPlatform[0]!.length : originalPlatform.length;
	for (let index1 = 0; index1 < nonMoveDirLength; index1++) {
		let roundedCount = 0;
		let pileStart = invert ? moveDirLength - 1 : 0;
		for (
			let index2 = invert ? moveDirLength - 1 : 0;
			invert ? index2 >= 0 : index2 < moveDirLength;
			index2 += invert ? -1 : 1
		) {
			const rowIndex = moveInRow ? index1 : index2;
			const col = moveInRow ? index2 : index1;
			const row = originalPlatform[rowIndex]!;
			if (row[col] === '.') continue;
			if (row[col] === 'O') {
				roundedCount++;
				continue;
			}
			if (roundedCount > 0) {
				for (
					let moveToIndex = pileStart;
					invert ? moveToIndex > index2 : moveToIndex < index2;
					moveToIndex += invert ? -1 : 1
				) {
					mutateablePlatform[moveInRow ? rowIndex : moveToIndex]![moveInRow ? moveToIndex : col] = (
						invert ? moveToIndex > pileStart - roundedCount : moveToIndex < pileStart + roundedCount
					)
						? 'O'
						: '.';
				}
			}
			pileStart = index2 + (invert ? -1 : 1);
			roundedCount = 0;
		}
		if (roundedCount > 0) {
			for (
				let moveToIndex = pileStart;
				invert ? moveToIndex >= 0 : moveToIndex < moveDirLength;
				moveToIndex += invert ? -1 : 1
			) {
				mutateablePlatform[moveInRow ? index1 : moveToIndex]![moveInRow ? moveToIndex : index1] = (
					invert ? moveToIndex > pileStart - roundedCount : moveToIndex < pileStart + roundedCount
				)
					? 'O'
					: '.';
			}
		}
	}
}

function tiltPlatform(platform: string[][], direction: Direction): string[][] {
	const newPlatform = platform;
	switch (direction) {
		case Direction.North:
			calculateTilt(newPlatform, platform);
			break;
		case Direction.West:
			calculateTilt(newPlatform, platform, true);
			break;
		case Direction.South:
			calculateTilt(newPlatform, platform, false, true);
			break;
		case Direction.East:
			calculateTilt(newPlatform, platform, true, true);
			break;
	}
	return newPlatform;
}

function getTotalLoad(finalTilted: string[][]) {
	let totalLoad = 0;
	const totalRows = finalTilted.length;
	for (let col = 0; col < finalTilted[0]!.length; col++) {
		for (const [rowIndex, row] of finalTilted.entries()) {
			if (row[col] !== 'O') continue;
			totalLoad += totalRows - rowIndex;
		}
	}
	return totalLoad;
}

export async function part1(lines: string[]) {
	const platform = lines.map((line) => line.split(''));
	const tilted = tiltPlatform(platform, Direction.North);
	return getTotalLoad(tilted);
}

export async function part2(lines: string[]) {
	const platform = lines.map((line) => line.split(''));
	const seen: string[] = [lines.join('\n')];
	let tilted: string[][] = platform;
	const cycleCount = 1_000_000_000;
	for (let cycle = 1; cycle <= cycleCount; cycle++) {
		tilted = tiltPlatform(tilted, Direction.North);
		tilted = tiltPlatform(tilted, Direction.West);
		tilted = tiltPlatform(tilted, Direction.South);
		tilted = tiltPlatform(tilted, Direction.East);
		const hash = tilted.map((line) => line.join('')).join('\n');
		const seenIndex = seen.findIndex((value) => value === hash);
		if (seenIndex > -1) {
			const loopLength = cycle - seenIndex;
			tilted = seen[((cycleCount - seenIndex) % loopLength) + seenIndex]!.split('\n').map((line) => line.split(''));
			break;
		}
		seen.push(hash);
	}
	return getTotalLoad(tilted);
}
