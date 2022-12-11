import { readFileSync } from 'fs';

const input = readFileSync('inputs/monkeyNotes.txt').toString();
const monkeyLines = input.split('\n\n').map((monkey) => monkey.split('\n'));

interface Monkey {
	items: number[];
	operation: (old: number) => number;
	test: (value: number) => boolean;
	trueResult: number;
	falseResult: number;
	inspected: number;
}

const monkeys: Monkey[] = [];

let productOfDivisibilities = 1;

for (const monkey of monkeyLines) {
	const [, startingLine, operationLine, testLine, trueLine, falseLine] = monkey;
	if (!startingLine || !operationLine || !testLine || !trueLine || !falseLine) throw new Error('Input Parsing error');
	const items = startingLine
		.split(':')[1]!
		.trim()
		.split(',')
		.map((item) => parseInt(item.trim(), 10));
	const operationRaw = operationLine.split('=')[1]!.trim();
	const [rawFirstOperand, operant, rawSecondOperand] = operationRaw.split(' ');
	if (!rawFirstOperand || !operant || !rawSecondOperand) throw new Error('Input Parsing error');
	const operation: Monkey['operation'] = (old) => {
		const firstOperand = rawFirstOperand === 'old' ? old : parseInt(rawFirstOperand, 10);
		const secondoperand = rawSecondOperand === 'old' ? old : parseInt(rawSecondOperand, 10);
		switch (operant) {
			case '*':
				return firstOperand * secondoperand;
			case '+':
				return firstOperand + secondoperand;
		}
		return -1;
	};
	const testValue = parseInt(testLine.split(' ').reverse()[0]!, 10);
	productOfDivisibilities *= testValue;
	const test: Monkey['test'] = (value) => value % testValue === 0;
	const trueResult = parseInt(trueLine.trim().split(' ').reverse()[0]!, 10);
	const falseResult = parseInt(falseLine.trim().split(' ').reverse()[0]!, 10);
	monkeys.push({ items, operation, test, trueResult, falseResult, inspected: 0 });
}

function relief(old: number) {
	return old % productOfDivisibilities;
}

function executeRound() {
	for (const monkey of monkeys) {
		for (const item of monkey.items) {
			const newWorry = relief(monkey.operation(item));
			let target = -1;
			if (monkey.test(newWorry)) {
				target = monkey.trueResult;
			} else {
				target = monkey.falseResult;
			}
			const newMonkey = monkeys[target];
			if (!newMonkey) throw new Error('Monkey not exist');
			newMonkey.items.push(newWorry);
		}
		monkey.inspected += monkey.items.length;
		monkey.items = [];
	}
}

const roundCount = 10_000;

for (let i = 0; i < roundCount; i++) {
	executeRound();
}

const monkeysByInspected = [...monkeys].sort((a, b) => b.inspected - a.inspected);

const monkeyBusiness = monkeysByInspected[0]!.inspected * monkeysByInspected[1]!.inspected;

console.log(monkeys.map((monkey, index) => `Monkey ${index}: ${monkey.inspected}`));
console.log(monkeyBusiness);
