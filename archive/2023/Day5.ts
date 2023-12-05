export const useRawInput = false;

interface Range {
	srcStart: number;
	destStart: number;
	length: number;
}

interface RangeMap {
	text: string;
	ranges: Range[];
}

function parseSeedLine(line: string): number[] {
	return line.split(':')[1]!.trim().split(' ').map(Number);
}

function parseRangeLine(line: string): Range {
	const [dest, src, len] = line.split(' ');
	if (!dest || !src || !len) throw new Error(`Invalid input: ${line}`);
	return {
		srcStart: Number(src),
		destStart: Number(dest),
		length: Number(len),
	};
}

function parseLines(lines: string[]) {
	let seeds: number[] = [];
	const maps: RangeMap[] = [];
	let currentMapIndex = -1;
	for (const [index, line] of lines.entries()) {
		if (index === 0) {
			seeds = parseSeedLine(line);
			continue;
		}

		if (line === '') {
			continue;
		}

		if (line.endsWith(':')) {
			maps.push({
				text: line,
				ranges: [],
			});
			currentMapIndex++;
			continue;
		}

		const parsedRange = parseRangeLine(line);
		maps[currentMapIndex]!.ranges.push(parsedRange);
	}

	return { seeds, maps };
}

export async function part1(lines: string[]) {
	const { seeds, maps } = parseLines(lines);
	let lowestLocation = Number.MAX_SAFE_INTEGER;
	for (const seed of seeds) {
		let currentMappedvalue = seed;
		let nextMappedValue = seed;
		for (const [mapIndex, map] of maps.entries()) {
			currentMappedvalue = nextMappedValue;
			for (const range of map.ranges) {
				if (range.srcStart <= currentMappedvalue && range.srcStart + range.length > currentMappedvalue) {
					nextMappedValue = currentMappedvalue - range.srcStart + range.destStart;
					break;
				}
			}
			if (mapIndex === maps.length - 1) {
				if (nextMappedValue < lowestLocation) {
					lowestLocation = nextMappedValue;
				}
			}
		}
	}
	return lowestLocation;
}

export async function part2(lines: string[]) {
	const { seeds: seedsRaw, maps } = parseLines(lines);
	const seedRanges: { start: number; length: number }[] = [];
	for (let i = 0; i + 1 < seedsRaw.length; i += 2) {
		seedRanges.push({ start: seedsRaw[i]!, length: seedsRaw[i + 1]! });
	}
	const [locations, ...finalMaps] = maps.reverse();
	locations!.ranges.sort((rangeA, rangeB) => rangeA.destStart - rangeB.destStart);
	const highestLocationRange = locations!.ranges[locations!.ranges.length - 1]!;
	const highestLocationChecked = highestLocationRange.destStart + highestLocationRange.length - 1;
	for (let location = 0; location < highestLocationChecked; location++) {
		const relatedLocationRange = locations!.ranges.find(
			(range) => range.destStart <= location && range.destStart + range.length > location,
		);
		let currentMappedValue = relatedLocationRange
			? relatedLocationRange.srcStart + location - relatedLocationRange.destStart
			: location;
		let nextMappedValue = currentMappedValue;
		for (const [mapIndex, map] of finalMaps.entries()) {
			currentMappedValue = nextMappedValue;
			for (const range of map.ranges) {
				if (range.destStart <= currentMappedValue && range.destStart + range.length > currentMappedValue) {
					nextMappedValue = currentMappedValue - range.destStart + range.srcStart;
					break;
				}
			}
			if (mapIndex === finalMaps.length - 1) {
				for (const seedRange of seedRanges) {
					if (seedRange.start <= nextMappedValue && seedRange.length + seedRange.start > nextMappedValue) {
						return location;
					}
				}
			}
		}
	}
	return Number.MAX_SAFE_INTEGER;
}
