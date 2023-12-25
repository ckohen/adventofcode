export const useRawInput = false;

type Hailstone = Record<'start' | 'velocity', [number, number, number]>;

type AxisEqaution = ConstantEquation | EqualEquation | SlopedEquation;

interface EqualEquation {
	type: 'equal';
}

interface ConstantEquation {
	constant: number;
	type: 'constant1' | 'constant2';
}

interface SlopedEquation {
	constant: number;
	timeMult: number;
	type: 'variable';
}

function parseLine(line: string): Hailstone {
	const [pos, rawVelocity] = line.split('@').map((text) => text.trim());
	const start = pos?.split(',').map((coord) => Number(coord.trim()));
	const velocity = rawVelocity?.split(',').map((coord) => Number(coord.trim()));
	if (start?.length !== 3 || velocity?.length !== 3) throw new Error(`Invalid line ${line}`);
	return {
		start,
		velocity,
	} as Hailstone;
}

function getAxisCollisionEquation(hailstone1: Hailstone, hailstone2: Hailstone, axis: 0 | 1 | 2): AxisEqaution | null {
	if (hailstone1.velocity[axis] === 0) {
		if (hailstone2.velocity[axis] === 0) {
			return hailstone1.start[axis] === hailstone2.start[axis] ? { type: 'equal' } : null;
		}

		const constant = (hailstone1.start[axis] - hailstone2.start[axis]) / hailstone2.velocity[axis];
		if (constant < 0) return null;
		return { constant, type: 'constant1' };
	}

	if (hailstone2.velocity[axis] === 0) {
		const constant = (hailstone2.start[axis] - hailstone1.start[axis]) / hailstone1.velocity[axis];
		if (constant < 0) return null;
		return { constant, type: 'constant2' };
	}

	const constant = (hailstone2.start[axis] - hailstone1.start[axis]) / hailstone1.velocity[axis];
	const timeMult = hailstone2.velocity[axis] / hailstone1.velocity[axis];
	return { constant, type: 'variable', timeMult };
}

function checkConstantEquality(
	xAxisApplyTo: Hailstone,
	yAxisApplyTo: Hailstone,
	xAxisConstant: number,
	yAxisConstant: number,
): [number, number] | null {
	if (xAxisConstant < 0 || yAxisConstant < 0) return null;
	const xForX = xAxisApplyTo.start[0] + xAxisConstant * xAxisApplyTo.velocity[0];
	const yForX = xAxisApplyTo.start[1] + xAxisConstant * xAxisApplyTo.velocity[1];
	const xForY = yAxisApplyTo.start[0] + yAxisConstant * yAxisApplyTo.velocity[0];
	const yForY = yAxisApplyTo.start[1] + yAxisConstant * yAxisApplyTo.velocity[1];

	if (xForX !== xForY || yForX !== yForY) return null;

	return [xForX, yForX];
}

function getCollisionPoint(hailstone1: Hailstone, hailstone2: Hailstone): true | [x: number, y: number] | null {
	const xAxis = getAxisCollisionEquation(hailstone1, hailstone2, 0);
	const yAxis = getAxisCollisionEquation(hailstone1, hailstone2, 1);

	if (!xAxis || !yAxis) return null;
	if (xAxis.type === 'equal' || yAxis.type === 'equal') {
		return true;
	}

	if (xAxis.type !== 'variable' && yAxis.type !== 'variable') {
		if (xAxis.type === yAxis.type) {
			if (xAxis.constant !== yAxis.constant) return null;
			const applyTo = xAxis.type === 'constant1' ? hailstone1 : hailstone2;
			return [
				applyTo.start[0] + xAxis.constant * applyTo.velocity[0],
				applyTo.start[1] + xAxis.constant * applyTo.velocity[1],
			];
		}

		const xAxisApplyTo = xAxis.type === 'constant1' ? hailstone1 : hailstone2;
		const yAxisApplyTo = yAxis.type === 'constant1' ? hailstone1 : hailstone2;

		return checkConstantEquality(xAxisApplyTo, yAxisApplyTo, xAxis.constant, yAxis.constant);
	}

	if (xAxis.type !== 'variable') {
		let constant = yAxis.constant;
		let timeMult = (yAxis as SlopedEquation).timeMult;
		if (xAxis.type === 'constant1') {
			constant *= -1;
			timeMult = 1 / timeMult;
		}

		const secondTimeMult = xAxis.constant * timeMult + constant;

		const xAxisApplyTo = xAxis.type === 'constant1' ? hailstone1 : hailstone2;
		const yAxisApplyTo = xAxis.type === 'constant1' ? hailstone2 : hailstone1;

		return checkConstantEquality(xAxisApplyTo, yAxisApplyTo, xAxis.constant, secondTimeMult);
	}

	if (yAxis.type !== 'variable') {
		let constant = xAxis.constant;
		let slope = xAxis.timeMult;
		if (yAxis.type === 'constant1') {
			constant *= -1;
			slope = 1 / slope;
		}

		const secondTimeMult = yAxis.constant * slope + constant;

		const xAxisApplyTo = yAxis.type === 'constant1' ? hailstone2 : hailstone1;
		const yAxisApplyTo = yAxis.type === 'constant1' ? hailstone1 : hailstone2;

		return checkConstantEquality(xAxisApplyTo, yAxisApplyTo, secondTimeMult, yAxis.constant);
	}

	const newConstant = yAxis.constant - xAxis.constant;
	const newTimeMult = xAxis.timeMult - yAxis.timeMult;
	const finalTimeMult = newConstant / newTimeMult;

	if (finalTimeMult < 0 || finalTimeMult * xAxis.timeMult + xAxis.constant < 0) return null;

	return [
		hailstone2.start[0] + finalTimeMult * hailstone2.velocity[0],
		hailstone2.start[1] + finalTimeMult * hailstone2.velocity[1],
	];
}

function hailstoneCollisionsInsideBoundary(hailstones: Hailstone[], min: number, max: number) {
	let totalInsideBoundary = 0;
	for (const [startIndex, hailstone] of hailstones.entries()) {
		for (let index = startIndex + 1; index < hailstones.length; index++) {
			const hailstone2 = hailstones[index]!;
			const collision = getCollisionPoint(hailstone, hailstone2);
			if (!collision) continue;
			if (collision === true) {
				totalInsideBoundary++;
				continue;
			}

			if (collision.some((coord) => coord < min || coord > max)) continue;
			totalInsideBoundary++;
		}
	}

	return totalInsideBoundary;
}

export async function part1(lines: string[]) {
	const hailstones = lines.map(parseLine);
	// return hailstoneCollisionsInsideBoundary(hailstones, 4, 27);
	return hailstoneCollisionsInsideBoundary(hailstones, 200_000_000_000_000, 400_000_000_000_000);
}

/**
 * x + y + z + t(xv + yv + zv) = x2 + y2 + z2 + t(x2v + y2v + z2v)
 * x + y + z + t2(xv + yv + zv) = x3 + y3 + z3 + t2(x3v + y3v + z3v)
 * x + y + z + t3(xv + yv + zv) = x4 + y4 + z4 + t3(x4v + y4v + z4v)
 *
 * x + t(xv) = x2 + t(x2v)
 * y + t(yv) = y2 + t(y2v)
 * z + t(zv) = y2 + t(z2v)
 *
 */

function getPossibleVelocities(hailstone1: Hailstone, hailstone2: Hailstone, axis: 0 | 1 | 2) {
	if (hailstone1.velocity[axis] !== hailstone2.velocity[axis]) return null;
	const distance = hailstone2.start[axis] - hailstone1.start[axis];

	const possibles = new Set<number>();

	for (let velocity = -1_000; velocity <= 1_000; velocity++) {
		if (distance % (velocity - hailstone1.velocity[axis]) === 0) {
			possibles.add(velocity);
		}
	}

	return possibles;
}

function getRockVelocity(hailstones: Hailstone[]) {
	const velocity: [number, number, number] = [0, 0, 0];
	for (let axis = 0; axis <= 2; axis++) {
		let axisPossibles: Set<number> | undefined;
		for (const [startIndex, hailstone] of hailstones.entries()) {
			for (let index = startIndex + 1; index < hailstones.length; index++) {
				const hailstone2 = hailstones[index]!;
				const possibles = getPossibleVelocities(hailstone, hailstone2, axis as 0 | 1 | 2);
				if (!possibles) continue;

				if (!axisPossibles) {
					axisPossibles = new Set(possibles);
					continue;
				}

				for (const possible of axisPossibles) {
					if (!possibles.has(possible)) {
						axisPossibles.delete(possible);
					}
				}

				if (axisPossibles.size === 0) {
					throw new Error('Did not test large enough velocity range, no matching velocities found');
				}
			}
		}

		if (!axisPossibles || axisPossibles.size > 1) {
			throw new Error('Could not determine vecloity from hailstones, not enough data');
		}

		velocity[axis] = axisPossibles.values().next().value as number;
	}

	return velocity;
}

function getRockLine(hailstone: Hailstone, rockVelocity: [number, number, number]) {
	const slope = (hailstone.velocity[1] - rockVelocity[1]) / (hailstone.velocity[0] - rockVelocity[0]);
	const constant = hailstone.start[1] - slope * hailstone.start[0];
	return { slope, constant };
}

/* eslint-disable id-length */
export async function part2(lines: string[]) {
	const hailstones = lines.map(parseLine);
	const rockVelocity = getRockVelocity(hailstones);
	const hailstone0 = hailstones[0]!;
	const lineA = getRockLine(hailstone0, rockVelocity);
	const lineB = getRockLine(hailstones[1]!, rockVelocity);

	const x = Math.round((lineB.constant - lineA.constant) / (lineA.slope - lineB.slope));
	const y = Math.round(lineA.slope * x + lineA.constant);
	const time = Math.floor((x - hailstone0.start[0]) / (hailstone0.velocity[1] - rockVelocity[1]));
	const z = hailstone0.start[2] + (hailstone0.velocity[2] - rockVelocity[2]) * time;
	return x + y + z;
}
