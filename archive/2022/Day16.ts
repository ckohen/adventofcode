import { readFileSync } from 'fs';

const input = readFileSync('inputs/valves.txt').toString();
const lines = input.split('\n');

const minutes = 26;

interface Valve {
	rate: number;
	connections: string[];
	open: boolean;
}

const map = new Map<string, Valve>();

let totalFlowRate = 0;
const nonZeroFlowRate: string[] = [];

for (const line of lines) {
	const match =
		/Valve (?<valve>\w{2}) has flow rate=(?<rawRate>\d+); tunnels? leads? to valves? (?<rawConnections>.*)/gi.exec(
			line,
		);
	if (!match) throw new Error('Invalid input');
	const { valve, rawRate, rawConnections } = match.groups!;
	if (!valve || !rawRate || !rawConnections) throw new Error('Invalid input');
	const rate = parseInt(rawRate, 10);
	const connections = rawConnections.split(', ');
	map.set(valve, { rate, connections, open: false });
	if (rate > 0) {
		nonZeroFlowRate.push(valve);
		totalFlowRate += rate;
	}
}

const distancesToNext: Map<string, Map<string, number>> = new Map();

function checkNextNode(current: Valve, target: string, visited: string[]): string[] {
	if (current.connections.includes(target)) return [...visited];
	const connectionPaths: string[][] = [];
	for (const connection of current.connections) {
		if (visited.includes(connection)) continue;
		const nextValve = map.get(connection);
		if (!nextValve) throw new Error('Valve not exist');
		connectionPaths.push(checkNextNode(nextValve, target, [...visited, connection]));
	}
	let minDistance = Infinity;
	let minPath: string[] = [];
	for (const connectionPath of connectionPaths) {
		if (connectionPath.length === 0) continue;
		if (connectionPath.length < minDistance) {
			minDistance = connectionPath.length;
			minPath = connectionPath;
		}
	}
	return minPath;
}

for (const [valve, info] of map) {
	if (info.rate === 0 && valve !== 'AA') continue;
	const distanceMap = new Map<string, number>();
	distancesToNext.set(valve, distanceMap);
	for (const targetValve of nonZeroFlowRate) {
		if (targetValve === valve) continue;
		const distance = checkNextNode(info, targetValve, [valve]).length;
		distanceMap.set(targetValve, distance);
	}
}

let maxPressureReleased = 0;

function getRouteTotal(
	startingPos: string,
	minute: number,
	released: number,
	perMinute: number,
	visited: string[],
): number {
	if (visited.length === nonZeroFlowRate.length + 1) return released + perMinute * (minutes - minute);
	if (released + totalFlowRate * (minutes - minute) < maxPressureReleased) return released;
	let highestTotal = 0;
	const startingDistances = distancesToNext.get(startingPos);
	if (!startingDistances) throw new Error('Missing distances');
	for (const target of nonZeroFlowRate) {
		if (visited.includes(target)) continue;
		const targetRate = map.get(target)?.rate;
		if (!targetRate) throw new Error('Missing Rate');
		const distanceToTarget = startingDistances.get(target);
		if (!distanceToTarget) throw new Error('Missing distance');
		let pressureTotal = (minutes - minute) * perMinute + released;
		if (minute + distanceToTarget + 1 < minutes) {
			pressureTotal = getRouteTotal(
				target,
				minute + distanceToTarget + 1,
				released + perMinute * (distanceToTarget + 1),
				perMinute + targetRate,
				[...visited, target],
			);
		}

		if (pressureTotal > highestTotal) {
			highestTotal = pressureTotal;
		}
		if (highestTotal > maxPressureReleased) {
			maxPressureReleased = highestTotal;
		}
	}
	return highestTotal;
}

const allCombinations = new Array(1 << nonZeroFlowRate.length)
	.fill('')
	.map((_, index) => [
		nonZeroFlowRate.filter((_, j) => index & (1 << j)),
		nonZeroFlowRate.filter((_, j) => !(index & (1 << j))),
	]);

let combinedMaxPressureReleased = 0;
for (const [human, elephant] of allCombinations) {
	if (!human || !elephant) throw new Error('you dun goofed');
	maxPressureReleased = 0;
	const humanTotal = getRouteTotal('AA', 0, 0, 0, ['AA', ...human]);
	maxPressureReleased = 0;
	const total = getRouteTotal('AA', 0, humanTotal, 0, ['AA', ...elephant]);
	if (total > combinedMaxPressureReleased) {
		combinedMaxPressureReleased = total;
	}
}

console.log(combinedMaxPressureReleased);
