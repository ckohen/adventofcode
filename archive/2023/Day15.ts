export const useRawInput = true;

function hash(input: string): number {
	let currentValue = 0;
	for (const char of input) {
		currentValue += char.charCodeAt(0);
		currentValue *= 17;
		currentValue %= 256;
	}
	return currentValue;
}

function hashMap(input: string) {
	const instructions = input.split(',');
	const boxes = new Array(256).fill(null).map(() => new Map<string, number>());
	for (const instruction of instructions) {
		const match = /(?<label>\w+)(?<type>[-=])(?<lens>\d)?/.exec(instruction);
		if (!match) throw new Error(`Invalid instruction: ${instruction}`);
		const { label, type, lens } = match.groups!;
		const box = boxes[hash(label!)]!;
		switch (type) {
			case '-': {
				box.delete(label!);
				break;
			}
			case '=': {
				box.set(label!, Number(lens));
				break;
			}
		}
	}
	return boxes;
}

export async function part1(input: string) {
	const instructions = input.split(',');
	let hashSum = 0;
	for (const instruction of instructions) {
		hashSum += hash(instruction);
	}
	return hashSum;
}

export async function part2(input: string) {
	const map = hashMap(input);
	let totalFocusingPower = 0;
	for (const [boxNumber, box] of map.entries()) {
		let slot = 1;
		for (const [, lens] of box) {
			totalFocusingPower += (1 + boxNumber) * slot * lens;
			slot++;
		}
	}
	return totalFocusingPower;
}
