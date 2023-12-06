export const useRawInput = false;

interface Race {
	time: number;
	record: number;
}

function parseInput(lines: string[]) {
	const timeLine = lines[0]!
		.split(':')[1]!
		.split(' ')
		.filter((time) => time !== '')
		.map(Number);
	const distanceLine = lines[1]!
		.split(':')[1]!
		.split(' ')
		.filter((time) => time !== '')
		.map(Number);
	const races: Race[] = [];
	for (const [index, time] of timeLine.entries()) {
		races.push({
			time,
			record: distanceLine[index]!,
		});
	}
	return races;
}

function parseInput2(lines: string[]) {
	const timeLine = Number(lines[0]!.replaceAll(' ', '').split(':')[1]!);
	const distanceLine = Number(lines[1]!.replaceAll(' ', '').split(':')[1]!);
	return {
		time: timeLine,
		record: distanceLine,
	};
}

const startingSpeed = 0;
const speedPerHold = 1;

export async function part1(lines: string[]) {
	const races = parseInput(lines);
	const variations: number[] = new Array(races.length).fill(0);
	for (const [raceIndex, race] of races.entries()) {
		for (let holdTime = 0; holdTime <= race.time; holdTime++) {
			const speed = startingSpeed + speedPerHold * holdTime;
			const timeLeft = race.time - holdTime;
			const distanceTraveled = speed * timeLeft;
			if (distanceTraveled > race.record) {
				variations[raceIndex]++;
			}
		}
	}
	return variations.reduce((total, current) => total * current, 1);
}

export async function part2(lines: string[]) {
	const race = parseInput2(lines);
	let variations = 0;
	for (let holdTime = 0; holdTime <= race.time; holdTime++) {
		const speed = startingSpeed + speedPerHold * holdTime;
		const timeLeft = race.time - holdTime;
		const distanceTraveled = speed * timeLeft;
		if (distanceTraveled > race.record) {
			variations++;
		}
	}

	return variations;
}
