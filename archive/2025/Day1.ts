export const useRawInput = false;

const enum Direction {
	Left = 'L',
	Right = 'R',
}

const startingPosition = 50;

function rotateDial(current: number, instruction: string) {
	const direction = instruction.charAt(0) as Direction;
	const steps = parseInt(instruction.slice(1), 10);
	let newPosition = current + steps * (direction === Direction.Right ? 1 : -1);
	let zeros = 0;
	if (newPosition > 99) {
		zeros = Math.floor(newPosition / 100);
		newPosition = newPosition % 100;
	} else if (newPosition < 0) {
		zeros = Math.floor(-newPosition / 100) + (current === 0 ? 0 : 1);
		newPosition = newPosition % 100;
		if (newPosition < 0) {
			newPosition += 100;
		}
	} else if (newPosition === 0) {
		zeros = 1;
	}
	return [newPosition, zeros] as const;
}

export async function part1(lines: string[]) {
	let position = startingPosition;
	let zeroCount = 0;
	for (const line of lines) {
		position = rotateDial(position, line)[0];
		if (position === 0) {
			zeroCount++;
		}
	}
	return zeroCount;
}

export async function part2(lines: string[]) {
	let position = startingPosition;
	let zeroCount = 0;
	for (const line of lines) {
		let result = rotateDial(position, line);
		position = result[0];
		zeroCount += result[1];
	}
	return zeroCount;
}
