import { readFileSync } from 'fs';

const input = readFileSync('inputs/blueprints.txt').toString();
const rawBlueprints = input.split('\n');

interface Blueprint {
	id: number;
	ore: number;
	clay: {
		ore: number;
	};
	obsidian: { ore: number; clay: number };
	geode: { ore: number; obsidian: number };
	maxOreRequired: number;
	openedGeodes: number;
}

const blueprints: Blueprint[] = [];

for (const blueprint of rawBlueprints) {
	const [rawOre, rawClay, rawObsidian, rawGeode] = blueprint.split(':')[1]!.split('.');
	const id = parseInt(/\d+/g.exec(blueprint)![0]!, 10);
	if (id > 3) break;
	const ore = parseInt(/\d+/g.exec(rawOre!)![0]!, 10);
	const clay = {
		ore: parseInt(/\d+/g.exec(rawClay!)![0]!, 10),
	};
	const obsidianMatch = /(?<ore>\d+) ore.* (?<clay>\d+)/g.exec(rawObsidian!)!;
	const obsidian = {
		ore: parseInt(obsidianMatch.groups!.ore!, 10),
		clay: parseInt(obsidianMatch.groups!.clay!, 10),
	};
	const geodeMatch = /(?<ore>\d+) ore.* (?<obsidian>\d+)/g.exec(rawGeode!)!;
	const geode = {
		ore: parseInt(geodeMatch.groups!.ore!, 10),
		obsidian: parseInt(geodeMatch.groups!.obsidian!, 10),
	};
	blueprints.push({
		id,
		ore,
		clay,
		obsidian,
		geode,
		maxOreRequired: Math.max(ore, clay.ore, obsidian.ore, geode.ore),
		openedGeodes: 0,
	});
}

const maxMinutes = 32;

interface Path {
	robots: {
		ore: number;
		clay: number;
		obsidian: number;
		geode: number;
	};
	ore: number;
	clay: number;
	obsidian: number;
	geode: number;
}

for (const blueprint of blueprints) {
	let paths: Path[] = [
		{
			robots: {
				ore: 1,
				clay: 0,
				obsidian: 0,
				geode: 0,
			},
			ore: 0,
			clay: 0,
			obsidian: 0,
			geode: 0,
		},
	];

	let maxGeodes = 0;

	const visited = new Set<string>();

	for (let minute = 0; minute < maxMinutes; minute++) {
		const newPaths: Path[] = [];
		for (const path of paths) {
			if (path.ore > blueprint.maxOreRequired * 3) continue;
			if (path.geode + (maxMinutes - minute) * path.robots.geode < maxGeodes) continue;
			const visitedString = [
				path.ore,
				path.clay,
				path.obsidian,
				path.geode,
				path.robots.ore,
				path.robots.clay,
				path.robots.obsidian,
				path.robots.geode,
			].join(',');
			if (visited.has(visitedString)) continue;
			visited.add(visitedString);
			const addedOre = path.ore >= blueprint.ore;
			const addedClay = path.ore >= blueprint.clay.ore;
			const addedObsidian = path.ore >= blueprint.obsidian.ore && path.clay >= blueprint.obsidian.clay;
			const addedGeode = path.ore >= blueprint.geode.ore && path.obsidian >= blueprint.geode.obsidian;

			path.ore += path.robots.ore;
			path.clay += path.robots.clay;
			path.obsidian += path.robots.obsidian;
			path.geode += path.robots.geode;
			if (maxGeodes < path.geode) maxGeodes = path.geode;

			if (addedGeode) {
				newPaths.push({
					...path,
					ore: path.ore - blueprint.geode.ore,
					obsidian: path.obsidian - blueprint.geode.obsidian,
					robots: {
						...path.robots,
						geode: path.robots.geode + 1,
					},
				});
				continue;
			}

			newPaths.push(path);

			if (addedOre) {
				newPaths.push({
					...path,
					ore: path.ore - blueprint.ore,
					robots: {
						...path.robots,
						ore: path.robots.ore + 1,
					},
				});
			}

			if (addedClay) {
				newPaths.push({
					...path,
					ore: path.ore - blueprint.clay.ore,
					robots: {
						...path.robots,
						clay: path.robots.clay + 1,
					},
				});
			}

			if (addedObsidian) {
				newPaths.push({
					...path,
					ore: path.ore - blueprint.obsidian.ore,
					clay: path.clay - blueprint.obsidian.clay,
					robots: {
						...path.robots,
						obsidian: path.robots.obsidian + 1,
					},
				});
			}
		}
		paths = newPaths;
	}
	blueprint.openedGeodes = maxGeodes;
}

console.log(blueprints.reduce((prev, curr) => prev * curr.openedGeodes, 1));
