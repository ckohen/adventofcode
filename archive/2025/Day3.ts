export const useRawInput = false;

export async function part1(lines: string[]) {
	const maxVoltages: number[] = [];
	for (const line of lines) {
		outer: for (let num = 9; num >= 0; num--) {
			const match = line.match(new RegExp(`${num}`));
			if (!match) continue;
			for (let num2 = 9; num2 >= 0; num2--) {
				const match2 = line.slice(match.index! + 1).match(new RegExp(`${num2}`));
				if (!match2) continue;
				maxVoltages.push(Number(`${num}${num2}`));
				break outer;
			}
		}
	}
	return maxVoltages.reduce((a, b) => a + b, 0);
}

export async function part2(lines: string[]) {
	const maxVoltages: number[] = [];
	function findMatch(line: string, indexOffset: number, left: number) {
		for (let num = 9; num >= 0; num--) {
			const match = line.slice(indexOffset, line.length - left + 1).match(new RegExp(`${num}`));
			if (match) return { number: num, index: match.index! + 1 + indexOffset };
		}
		return null;
	}

	for (const line of lines) {
		let currentNums: string[] = [];
		let offset = 0;
		for (let index = 0; index < 12; index++) {
			const match = findMatch(line, offset, 12 - index);
			if (!match) throw new Error();
			currentNums.push(match.number.toString());
			offset = match.index;
		}
		maxVoltages.push(Number(currentNums.join('')));
	}
	return maxVoltages.reduce((a, b) => a + b, 0);
}
