import { init } from 'z3-solver';

export const useRawInput = false;

function getShortestPathLight(buttons: number[][], state: string, target: string) {
	const visitedTracking = new Set();
	const toVisit: { current: string; pathLength: number; visited: Set<string> }[] = [
		{
			current: state,
			pathLength: 0,
			visited: new Set(),
		},
	];

	while (toVisit.length) {
		const { visited, current, pathLength } = toVisit.shift()!;
		if (current === target) return new Set(visited).add(current);
		if (visitedTracking.has(current)) continue;
		for (const button of buttons) {
			const nextValue = [];
			for (const [index, char] of current.split('').entries()) {
				nextValue[index] = button.includes(index) ? (char === '.' ? '#' : '.') : char;
			}
			const next = nextValue.join('');
			if (visitedTracking.has(next)) continue;
			const potentialLength = pathLength + 1;

			const insertPosition = toVisit.findLastIndex((button) => button.pathLength < potentialLength);

			toVisit.splice(insertPosition + 1, 0, {
				current: next,
				visited: new Set(visited).add(current),
				pathLength: potentialLength,
			});
		}

		visitedTracking.add(current);
	}

	throw new Error(`No path found between ${state} and ${target}`);
}

export async function part1(lines: string[]) {
	const shortestPaths: number[] = [];
	for (const line of lines) {
		const split = line.split(' ');
		const lightTarget = split[0]!.slice(1, -1);
		const buttons = split.slice(1, -1).map((button) => button.slice(1, -1).split(',').map(Number));
		const lights = '.'.repeat(lightTarget.length);
		const shortestPath = getShortestPathLight(buttons, lights, lightTarget);
		shortestPaths.push(shortestPath.size - 1);
	}
	return shortestPaths.reduce((prev, curr) => prev + curr);
}

// Try as system of equations
export async function part2(lines: string[]) {
	const { Context } = await init();

	const shortestPaths: number[] = [];
	for (const line of lines) {
		const split = line.split(' ');
		const joltageTarget = split[split.length - 1]!.slice(1, -1).split(',').map(Number);
		const buttons = split.slice(1, -1).map((button) => button.slice(1, -1).split(',').map(Number));

		const { Optimize, Int } = Context('main');
		const optimizer = new Optimize();
		const variables = [];
		for (const [index] of buttons.entries()) {
			const vari = Int.const(`${index}`);
			optimizer.add(vari.ge(0));
			variables.push(vari);
		}

		for (const [index, joltage] of joltageTarget.entries()) {
			let condition = Int.val(0).add(0);
			for (const [buttonIndex, button] of buttons.entries()) {
				if (button.includes(index)) {
					condition = condition.add(variables[buttonIndex]!);
				}
			}
			const finalCondition = condition.eq(Int.val(joltage));
			optimizer.add(finalCondition);
		}

		const sum = variables.reduce((arith, val) => arith.add(val), Int.val(0));
		optimizer.minimize(sum);
		if ((await optimizer.check()) !== 'sat') throw new Error();
		shortestPaths.push(Number(`${optimizer.model().eval(sum)}`));
	}
	return shortestPaths.reduce((prev, curr) => prev + curr, 0);
}
