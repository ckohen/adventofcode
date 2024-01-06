export const useRawInput = false;

function parseInput(lines: string[]) {
	const componentConnections = new Map<string, string[]>();
	for (const line of lines) {
		const [connect, to] = line.split(':').map((text) => text.trim());
		const connections = to?.split(' ');
		if (!connect || !connections) throw new Error(`Invalid line: ${line}`);
		componentConnections.set(connect, [...(componentConnections.get(connect) ?? []), ...connections]);
		for (const connection of connections) {
			componentConnections.set(connection, [...(componentConnections.get(connection) ?? []), connect]);
		}
	}

	return componentConnections;
}

function splitComponentGroups(
	connections: Map<string, string[]>,
	disconnect: [[string, string], [string, string], [string, string]],
) {
	const group1 = new Set<string>();
	const group2 = new Set<string>();

	const queue = [connections.keys().next().value as string];

	while (queue.length) {
		const next = queue.shift()!;
		const nextConnections = connections.get(next)!;
		if (group1.has(next)) continue;
		group1.add(next);
		const disconnecting = disconnect.findIndex((connection) => connection.includes(next));
		const disconnected = disconnect[disconnecting]?.find((module) => module !== next);
		for (const connection of nextConnections) {
			if (disconnected === connection) {
				if (group1.has(connection)) {
					return null;
				}

				group2.add(connection);
				continue;
			}

			if (group2.has(connection)) {
				return null;
			}

			queue.push(connection);
		}
	}

	if (group2.size === 0) return null;

	return { group1, group2 };
}

function getRandomNodes(nodes: [string, string[]][]) {
	const node1 = nodes[Math.floor(Math.random() * nodes.length)]!;
	let node2 = nodes[Math.floor(Math.random() * nodes.length)]!;
	while (node1[0] === node2[0]) {
		node2 = nodes[Math.floor(Math.random() * nodes.length)]!;
	}

	return { node1, node2 };
}

function getShortestPath(nodes: Map<string, string[]>, node1: [string, string[]], node2: [string, string[]]) {
	const visitedTracking = new Set();
	const toVisit: { current: string; pathLength: number; visited: Set<string> }[] = [
		{
			current: node1[0],
			pathLength: 0,
			visited: new Set(),
		},
	];
	const shortestPaths = new Map<string, number>();

	while (toVisit.length) {
		const { visited, current, pathLength } = toVisit.shift()!;
		if (current === node2[0]) return new Set(visited).add(current);
		if (visitedTracking.has(current)) continue;
		const currentAdj = nodes.get(current)!;
		for (const next of currentAdj) {
			if (visitedTracking.has(next)) continue;
			const potentialLength = pathLength + 1;

			const existing = shortestPaths.get(next);
			if (!existing || existing > potentialLength) {
				shortestPaths.set(next, potentialLength);
			} else {
				continue;
			}

			const insertPosition = toVisit.findLastIndex((node) => node.pathLength < potentialLength);

			toVisit.splice(insertPosition + 1, 0, {
				current: next,
				visited: new Set(visited).add(current),
				pathLength: potentialLength,
			});
		}

		visitedTracking.add(current);
	}

	throw new Error(`No path found between ${node1[0]} and ${node2[0]}`);
}

function getHash(start: string, end: string) {
	const inOrder = start < end;
	if (inOrder) {
		return `${start},${end}`;
	}

	return `${end},${start}`;
}

function findMostOccuring(connections: Map<string, string[]>, entries: [string, string[]][], randomNodeCount: number) {
	const connectionOccurences = new Map<string, number>();
	const exploredPaths = new Set<string>();
	for (let test = 0; test < randomNodeCount; test++) {
		const { node1, node2 } = getRandomNodes(entries);
		const hash = getHash(node1[0], node2[0]);
		if (exploredPaths.has(hash)) continue;
		const path = getShortestPath(connections, node1, node2);
		exploredPaths.add(hash);
		let lastNode: string | undefined;
		for (const connection of path.values()) {
			if (!lastNode) {
				lastNode = connection;
				continue;
			}

			const connectionHash = getHash(lastNode, connection);
			const existing = connectionOccurences.get(connectionHash);
			if (existing) {
				connectionOccurences.set(connectionHash, existing + 1);
			} else {
				connectionOccurences.set(connectionHash, 1);
			}
		}
	}

	if (connectionOccurences.size < 3) return null;
	const connectionOccurencesEntries = connectionOccurences.entries();
	let topConnection: [string, number] = connectionOccurencesEntries.next().value as [string, number];
	let secondTopConnection: [string, number] | undefined;
	let thirdTopConnection: [string, number] | undefined;
	for (const [connection, occurences] of connectionOccurencesEntries) {
		if (occurences > topConnection[1]) {
			thirdTopConnection = secondTopConnection;
			secondTopConnection = topConnection;
			topConnection = [connection, occurences];
			continue;
		}

		if (!secondTopConnection || occurences > secondTopConnection[1]) {
			thirdTopConnection = secondTopConnection;
			secondTopConnection = [connection, occurences];
			continue;
		}

		if (!thirdTopConnection || occurences > thirdTopConnection[1]) {
			thirdTopConnection = [connection, occurences];
		}
	}

	return [topConnection, secondTopConnection!, thirdTopConnection!] as const;
}

export async function part1(lines: string[]) {
	const connections = parseInput(lines);
	const connectionEntries = [...connections.entries()];
	let split: ReturnType<typeof splitComponentGroups> = null;
	let loops = 0;
	while (split === null) {
		const mostOcurring = findMostOccuring(connections, connectionEntries, 100);
		if (!mostOcurring) continue;
		loops++;
		split = splitComponentGroups(
			connections,
			mostOcurring.map(([connection]) => connection.split(',')) as [
				[string, string],
				[string, string],
				[string, string],
			],
		);
	}

	return { connectionSize: connections.size, group1Size: split.group1.size, group2Size: split.group2.size, loops };
}

export async function part2(lines: string[]) {
	return lines;
}
