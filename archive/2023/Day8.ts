export const useRawInput = false;

function parseDirections(line: string) {
	return line.split('').map((char) => (char === 'R' ? 1 : 0));
}

function parseMap(lines: string[]) {
	const map = new Map<string, [string, string]>();
	const startingNodes: string[] = [];
	for (const line of lines) {
		const match = /(?<node>[\w\n]{3}).*(?<left>[\w\n]{3}), (?<right>[\w\n]{3})/gm.exec(line);
		if (!match) throw new Error(`Bad Input ${line}`);
		const { node, left, right } = match.groups!;
		map.set(node!, [left!, right!]);
		if (node!.endsWith('A')) {
			startingNodes.push(node!);
		}
	}
	return { map, startingNodes };
}

export async function part1(lines: string[]) {
	const directions = parseDirections(lines[0]!);
	const { map } = parseMap(lines.slice(2));
	let currentNode = 'AAA';
	let steps = 0;
	for (steps = 0; currentNode !== 'ZZZ'; steps++) {
		const currentDirection = directions[steps % directions.length]!;
		const nextNode = map.get(currentNode);
		if (!nextNode) throw new Error(`No node found, ${currentNode}`);
		currentNode = nextNode[currentDirection];
	}
	return steps;
}

export async function part2(lines: string[]) {
	const directions = parseDirections(lines[0]!);
	const { map, startingNodes } = parseMap(lines.slice(2));
	const nodeToZ = startingNodes.map(() => 0);
	let currentNodes = startingNodes;
	let isDone = false;
	let steps = 0;
	for (steps = 0; !isDone; steps++) {
		const currentDirection = directions[steps % directions.length]!;
		for (const [nodeIndex, node] of currentNodes.entries()) {
			const nextNodes = map.get(node);
			if (!nextNodes) throw new Error(`No node found, ${node}`);
			const nextNode = nextNodes[currentDirection];
			currentNodes[nodeIndex] = nextNode;
			if (nextNode.endsWith('Z')) {
				nodeToZ[nodeIndex] = steps + 1;
			}
		}
		isDone = nodeToZ.find((val) => val === 0) === undefined;
	}

	function gcd(distance1: number, distance2: number): number {
		return distance2 === 0 ? distance1 : gcd(distance2, distance1 % distance2);
	}

	return nodeToZ.reduce(
		(currentLcm, currentDistance) => (currentLcm * currentDistance) / gcd(currentLcm, currentDistance),
	);
}
