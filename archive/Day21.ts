import { readFileSync } from 'fs';

const input = readFileSync('inputs/monkeyNumbers.txt').toString();
const lines = input.split('\n');

type EquationType = '+' | '-' | '*' | '/';

interface Value {
	equation?: {
		left: string;
		right: string;
		type: EquationType;
	};
	number?: number;
}

const equationMap = new Map<string, Value>();

for (const line of lines) {
	const [key, rest] = line.split(':');
	if (!key || !rest) throw new Error('Invalid input');
	const [numOrLeft, operand, right] = rest.trim().split(' ');
	if (!operand) {
		equationMap.set(key, { number: parseInt(numOrLeft!, 10) });
		continue;
	}
	equationMap.set(key, { equation: { left: numOrLeft!, type: operand as EquationType, right: right! } });
}

const human = 'humn';

function getEquationOrNumber(key: string): Exclude<Value['equation'], undefined> | Exclude<Value['number'], undefined> {
	const value = equationMap.get(key);
	if (!value) throw new Error(`No Value for ${key}!`);
	if (typeof value.number === 'number') return value.number;
	const equation = value.equation;
	if (typeof equation !== 'object') throw new Error('No number and no equation');
	return equation;
}

function solveNonHuman(from: string): number | null {
	if (from === human) return null;
	const equation = getEquationOrNumber(from);
	if (typeof equation === 'number') return equation;
	const left = solveNonHuman(equation.left);
	const right = solveNonHuman(equation.right);
	if (left === null || right === null) return null;
	switch (equation.type) {
		case '+':
			return left + right;
		case '-':
			return left - right;
		case '*':
			return left * right;
		case '/':
			return left / right;
	}
}

const root = equationMap.get('root');
if (!root) throw new Error('No Root');

if (root.number) {
	console.log(root.number);
	process.exit();
}

if (!root.equation) throw new Error('No equation for root');

const left = solveNonHuman(root.equation.left);
const right = solveNonHuman(root.equation.right);

const nonHumanValue = left ?? right;
if (nonHumanValue === null) throw new Error('Both sides require human');

function solveHuman(target: number, from: string): number {
	if (from === human) return target;
	const equation = getEquationOrNumber(from);
	if (typeof equation === 'number') return equation;
	const left = solveNonHuman(equation.left);
	const right = solveNonHuman(equation.right);
	if (left === null && right === null) throw new Error('Both subsides require human');
	if (typeof left === 'number') {
		switch (equation.type) {
			case '+':
				return solveHuman(target - left, equation.right);
			case '-':
				return solveHuman(left - target, equation.right);
			case '*':
				return solveHuman(target / left, equation.right);
			case '/':
				return solveHuman(left / target, equation.right);
		}
	}
	switch (equation.type) {
		case '+':
			return solveHuman(target - right!, equation.left);
		case '-':
			return solveHuman(target + right!, equation.left);
		case '*':
			return solveHuman(target / right!, equation.left);
		case '/':
			return solveHuman(target * right!, equation.left);
	}
}

console.log(solveHuman(nonHumanValue, left === null ? root.equation.left : root.equation.right));
