export const useRawInput = false;

function parseInput(lines: string[]) {
	const parsed = new Map<string, string[]>();
	for (const line of lines) {
		const split = line.split(':');
		parsed.set(split[0]!, split[1]!.trim().split(' '));
	}
	return parsed;
}

const memo: Record<string, number> = {};

function getPaths(
	start: string,
	target: string,
	map: Map<string, string[]>,
	required = new Set<string>(),
	encountered = new Set(),
): number {
	if (start === target) return required.size === 0 ? 1 : 0;
	if (encountered.has(start)) return 0;
	const key = `${start}:${[...required].sort()}`;
	if (key in memo) return memo[key]!;
	let requiredModified = new Set(required);
	requiredModified.delete(start);
	const next = map.get(start);
	if (!next) throw new Error();
	encountered.add(start);
	const output = next.reduce(
		(count, current) => count + getPaths(current, target, map, requiredModified, encountered),
		0,
	);
	encountered.delete(start);
	memo[key] = output;
	return output;
}

export async function part1(lines: string[]) {
	const parsed = parseInput(lines);
	return getPaths('you', 'out', parsed);
}

export async function part2(lines: string[]) {
	const parsed = parseInput(lines);
	return getPaths('svr', 'out', parsed, new Set(['fft', 'dac']));
}
