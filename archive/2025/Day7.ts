export const useRawInput = false;

export async function part1(lines: string[]) {
	const beams = new Set<number>([lines[0]!.indexOf('S')]);
	let splitters = 0;
	for (const line of lines.slice(1)) {
		const splitterPositions = line.matchAll(/\^/g).map((match) => match.index);
		for (const position of splitterPositions) {
			if (beams.has(position)) {
				splitters++;
				beams.delete(position);
				beams.add(position + 1);
				beams.add(position - 1);
			}
		}
	}
	return splitters;
}

const cache = new Map<string, number>();

function recurseBeam(beamPosition: number, currentLine: number, lines: string[]): number {
	const cached = cache.get(`${beamPosition}:${currentLine}`);
	if (cached) {
		return cached;
	}
	for (let index = currentLine; index < lines.length; index++) {
		const line = lines[index]!;
		const splitterPositions = line.matchAll(/\^/g).map((match) => match.index);
		for (const position of splitterPositions) {
			if (beamPosition === position) {
				const result =
					recurseBeam(beamPosition - 1, index + 1, lines) + recurseBeam(beamPosition + 1, index + 1, lines);
				cache.set(`${beamPosition}:${currentLine}`, result);
				return result;
			}
		}
	}
	cache.set(`${beamPosition}:${currentLine}`, 1);
	return 1;
}

export async function part2(lines: string[]) {
	const beam = lines[0]!.indexOf('S');
	return recurseBeam(beam, 1, lines);
}
