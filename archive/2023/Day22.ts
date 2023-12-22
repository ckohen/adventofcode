export const useRawInput = false;

const enum BrickDirection {
	Vertical,
	HorizontalX,
	HorizontalY,
}

type BrickSnapshot = Record<'end' | 'start', [number, number, number]> & {
	direction: BrickDirection;
	length: number;
	supportedBy: Set<number>;
	supports: Set<number>;
};

function parseLine(line: string): BrickSnapshot {
	const [rawStart, rawEnd] = line.split('~');
	if (!rawStart || !rawEnd) throw new Error(`Invalid line: ${line}`);
	const start = rawStart.split(',').map(Number);
	const end = rawEnd.split(',').map(Number);
	if (start.length !== 3 || end.length !== 3) throw new Error(`Invalid line: ${line}`);

	let length = 0;
	let direction = BrickDirection.Vertical;
	let conformIndex = 2;

	if (start[0] !== end[0]) {
		length = Math.abs(start[0]! - end[0]!);
		direction = BrickDirection.HorizontalX;
		conformIndex = 0;
	}

	if (start[1] !== end[1]) {
		length = Math.abs(start[1]! - end[1]!);
		direction = BrickDirection.HorizontalY;
		conformIndex = 1;
	}

	if (start[2] !== end[2]) {
		length = Math.abs(start[2]! - end[2]!);
	}

	const lower = Math.min(start[conformIndex]!, end[conformIndex]!);
	const upper = Math.max(start[conformIndex]!, end[conformIndex]!);
	start[conformIndex] = lower;
	end[conformIndex] = upper;

	return {
		start,
		end,
		length: length + 1,
		direction,
		supportedBy: new Set(),
		supports: new Set(),
	} as BrickSnapshot;
}

function generateLandedMap(bricks: BrickSnapshot[]) {
	const sorted = bricks.sort((brickA, brickB) => brickA.start[2] - brickB.start[2]);
	const map: number[][][] = [];
	for (const [brickIndex, brick] of sorted.entries()) {
		let startZ = 0;
		let endZ: number;
		if (brick.direction === BrickDirection.Vertical) {
			startZ = map[brick.start[0]]?.[brick.start[1]]?.length ?? 0;
			endZ = startZ + brick.length - 1;

			if (startZ > 0) {
				const supportedBy = map[brick.start[0]]![brick.start[1]]![startZ - 1]!;
				brick.supportedBy.add(supportedBy);
				sorted[supportedBy]!.supports.add(brickIndex);
			}
		} else {
			let supportedBy: number[] = [];
			for (let x = brick.start[0]; x <= brick.end[0]; x++) {
				for (let y = brick.start[1]; y <= brick.end[1]; y++) {
					const before = startZ;
					startZ = Math.max(map[x]?.[y]?.length ?? 0, startZ);
					if (startZ !== before) {
						supportedBy = [];
					}

					const possiblyBelow = map[x]?.[y]?.[startZ - 1];
					if (possiblyBelow !== undefined) {
						supportedBy.push(possiblyBelow);
					}
				}
			}

			for (const supporting of supportedBy) {
				brick.supportedBy.add(supporting);
				sorted[supporting]!.supports.add(brickIndex);
			}

			endZ = startZ;
		}

		for (let x = brick.start[0]; x <= brick.end[0]; x++) {
			let mapX = map[x];
			if (!mapX) {
				mapX = [];
				map[x] = mapX;
			}

			for (let y = brick.start[1]; y <= brick.end[1]; y++) {
				let mapY = mapX[y];
				if (!mapY) {
					mapY = [];
					mapX[y] = mapY;
				}

				// eslint-disable-next-line id-length
				for (let z = startZ; z <= endZ; z++) {
					mapY[z] = brickIndex;
				}
			}
		}
	}

	return map;
}

function disintigrateBrick(bricks: BrickSnapshot[], brickId: number) {
	const toDisintigrate = [brickId];
	const disintigrated = new Set<number>();
	let cascaded = -1;
	while (toDisintigrate.length) {
		const id = toDisintigrate.shift()!;
		if (disintigrated.has(id)) continue;
		const brick = bricks[id]!;
		if (id !== brickId) {
			const supportedBy = [...brick.supportedBy.values()].filter((support) => !disintigrated.has(support));
			if (supportedBy.length) continue;
		}

		cascaded++;
		disintigrated.add(id);
		for (const supported of brick.supports) {
			toDisintigrate.push(supported);
		}
	}

	return cascaded;
}

export async function part1(lines: string[]) {
	const bricks = lines.map(parseLine);
	generateLandedMap(bricks);

	let canBeDisintegrated = 0;
	outerloop: for (const brick of bricks) {
		for (const supporting of brick.supports) {
			const supported = bricks[supporting]!;
			if (supported.supportedBy.size === 1) {
				continue outerloop;
			}
		}

		canBeDisintegrated++;
	}

	return canBeDisintegrated;
}

export async function part2(lines: string[]) {
	const bricks = lines.map(parseLine);
	generateLandedMap(bricks);

	let disintigrated = 0;
	for (let brickId = 0; brickId < bricks.length; brickId++) {
		disintigrated += disintigrateBrick(bricks, brickId);
	}

	return disintigrated;
}
