export const useRawInput = false;

function getDistance(coord1: [number, number, number], coord2: [number, number, number]) {
	const xDistance = coord2[0] - coord1[0];
	const yDistance = coord2[1] - coord1[1];
	const zDistance = coord2[2] - coord1[2];
	return Math.sqrt(xDistance ** 2 + yDistance ** 2 + zDistance ** 2);
}

export async function part1(lines: string[]) {
	const coords = lines.map((line) => line.split(',').map(Number) as [number, number, number]);
	let longestShortestDistance = 0;
	const shortestDistances = new Map<number, string>();
	for (const [index, coord] of coords.entries()) {
		for (const coord2 of coords.slice(index + 1)) {
			const distance = getDistance(coord, coord2);
			if (distance > longestShortestDistance && shortestDistances.size >= 1000) {
				continue;
			}

			if (distance > longestShortestDistance) {
				longestShortestDistance = distance;
			}

			if (shortestDistances.has(distance)) {
				throw new Error();
			}

			if (shortestDistances.size >= 1000) {
				const distances = [...shortestDistances.keys()].sort((a, b) => b - a);
				longestShortestDistance = distances[1]!;
				shortestDistances.delete(distances[0]!);
			}

			shortestDistances.set(distance, `${coord.join(',')}-${coord2.join(',')}`);
		}
	}

	const sorted = [...shortestDistances.entries()].sort((a, b) => a[0] - b[0]);
	const connections = new Map<string, Set<string>>();

	for (let i = 0; i < 1000; i++) {
		const toConnect = sorted[i]![1].split('-');
		const existing1 = connections.get(toConnect[0]!);
		const existing2 = connections.get(toConnect[1]!);
		if (existing1 && existing2) {
			for (const point of existing2) {
				existing1.add(point);
				connections.set(point, existing1);
			}
		} else if (existing1) {
			existing1.add(toConnect[1]!);
			connections.set(toConnect[1]!, existing1);
		} else if (existing2) {
			existing2.add(toConnect[0]!);
			connections.set(toConnect[0]!, existing2);
		} else {
			const set = new Set(toConnect);
			connections.set(toConnect[0]!, set);
			connections.set(toConnect[1]!, set);
		}
	}

	let seen: Set<string>[] = [];

	const sortedConnections = [...connections.values()]
		.filter((set) => (seen.includes(set) ? false : seen.push(set)))
		.sort((a, b) => b.size - a.size);

	if (sortedConnections.length < 3) throw new Error();
	return sortedConnections[0]!.size * sortedConnections[1]!.size * sortedConnections[2]!.size;
}

export async function part2(lines: string[]) {
	const coords = lines.map((line) => line.split(',').map(Number) as [number, number, number]);
	const distances = new Map<number, string>();
	for (const [index, coord] of coords.entries()) {
		for (const coord2 of coords.slice(index + 1)) {
			const distance = getDistance(coord, coord2);
			if (distances.has(distance)) {
				throw new Error();
			}

			distances.set(distance, `${coord.join(',')}-${coord2.join(',')}`);
		}
	}

	const sorted = [...distances.entries()].sort((a, b) => a[0] - b[0]);
	const connections = new Map<string, Set<string>>();

	for (const connection of sorted) {
		const toConnect = connection[1].split('-');
		const existing1 = connections.get(toConnect[0]!);
		const existing2 = connections.get(toConnect[1]!);
		let set;
		if (existing1 && existing2) {
			set = existing1;
			for (const point of existing2) {
				existing1.add(point);
				connections.set(point, existing1);
			}
		} else if (existing1) {
			set = existing1;
			existing1.add(toConnect[1]!);
			connections.set(toConnect[1]!, existing1);
		} else if (existing2) {
			set = existing2;
			existing2.add(toConnect[0]!);
			connections.set(toConnect[0]!, existing2);
		} else {
			set = new Set(toConnect);
			connections.set(toConnect[0]!, set);
			connections.set(toConnect[1]!, set);
		}

		if (set.size === coords.length) {
			const finalCoords = toConnect.map((coord) => coord.split(',').map(Number));
			return finalCoords[0]![0]! * finalCoords[1]![0]!;
		}
	}

	throw new Error();
}
