import { readFileSync } from 'fs';

const input = readFileSync('inputs/distressSignal.txt').toString();
const rawPacketPairs = input.split('\n\n');

type RecursiveNumArray = (RecursiveNumArray | number)[];

const packets: RecursiveNumArray[] = [];
for (const packet of rawPacketPairs) {
	const [left, right] = packet.split('\n');
	packets.push(JSON.parse(left!) as RecursiveNumArray);
	packets.push(JSON.parse(right!) as RecursiveNumArray);
}

const divider1 = [[2]];
const divider2 = [[6]];
packets.push(divider1, divider2);

function compareArrays(
	left: RecursiveNumArray | number | undefined,
	right: RecursiveNumArray | number | undefined,
): boolean | null {
	if (typeof left === 'number' && typeof right === 'number') {
		if (left !== right) {
			return left < right;
		}
		return null;
	}

	if (typeof left === 'object' && typeof right === 'object') {
		const longerLength = Math.max(left.length, right.length);
		for (let i = 0; i < longerLength; i++) {
			const compared = compareArrays(left[i], right[i]);
			if (compared !== null) return compared;
		}
	}

	if (typeof right !== 'undefined' && typeof left === 'undefined') {
		return true;
	}
	if (typeof left !== 'undefined' && typeof right === 'undefined') {
		return false;
	}

	if (typeof left === 'number') {
		return compareArrays([left], right);
	}
	if (typeof right === 'number') {
		return compareArrays(left, [right]);
	}

	return null;
}

packets.sort((a, b) => {
	const comparisonResult = compareArrays(a, b);
	if (comparisonResult === null) throw new Error('Invalid input');
	return comparisonResult ? -1 : 1;
});

const divider1Index = packets.findIndex((packet) => packet === divider1) + 1;
const divider2Index = packets.findIndex((packet) => packet === divider2) + 1;
console.log(divider1Index * divider2Index);
