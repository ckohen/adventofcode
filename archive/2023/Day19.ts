export const useRawInput = false;

type Part = Record<'x' | 'm' | 'a' | 's', number>;

type TestPart = Record<'x' | 'm' | 'a' | 's', { greaterThan: number; lessThan: number }>;

interface Rule {
	comparison?: {
		test: keyof Part;
		against: number;
		equality: '>' | '<';
	};
	result: string | boolean;
}

function parseWorkflow(line: string) {
	const match = /(?<name>\w+)\{(?<rules>.*)}/gi.exec(line);
	if (!match) throw new Error(`Invalid line ${line}`);
	const { name, rules: rawRules } = match.groups!;
	const rules: Rule[] = [];
	for (const rule of rawRules!.split(',')) {
		const ruleMatch = /((?<test>[xmas])(?<equality>[<>])(?<against>\d+):)?(?<result>\w+)/gi.exec(rule);
		if (!ruleMatch) throw new Error(`Invalid rule ${rule}`);
		const { test, equality, against, result } = ruleMatch.groups!;

		let finalResult: string | boolean = result!;
		if (result === 'A') {
			finalResult = true;
		} else if (result === 'R') {
			finalResult = false;
		}

		const finalRule: Rule = {
			result: finalResult,
		};
		if (typeof test === 'string') {
			finalRule.comparison = {
				test: test as keyof Part,
				against: Number(against),
				equality: equality as '>' | '<',
			};
		}
		rules.push(finalRule);
	}
	return { name: name!, rules };
}

function parsePart(line: string): Part {
	const match = /\{x=(?<x>\d+),m=(?<m>\d+),a=(?<a>\d+),s=(?<s>\d+)\}/gi.exec(line);
	if (!match) throw new Error(`Invalid line ${line}`);
	const { x, m, a, s } = match.groups!;
	return {
		x: Number(x),
		m: Number(m),
		a: Number(a),
		s: Number(s),
	};
}

function testPart(workflows: Map<string, Rule[]>, part: Part, workflowName: string = 'in'): boolean {
	const workflow = workflows.get(workflowName);
	if (!workflow) throw new Error(`Tried to access non-existant workflow: ${workflowName}`);
	let result: string | boolean | undefined;
	for (const rule of workflow) {
		if (!rule.comparison) {
			result = rule.result;
			break;
		}
		const { against, equality, test } = rule.comparison;
		const toTest = part[test];
		if (equality === '<' ? toTest < against : toTest > against) {
			result = rule.result;
			break;
		}
	}
	if (result === undefined) throw new Error(`Could not find result for ${workflowName}`);
	if (typeof result === 'string') {
		return testPart(workflows, part, result);
	}
	return result;
}

function testSubCombinations(workflows: Map<string, Rule[]>, testPart: TestPart, workflowName = 'in'): number {
	const workflow = workflows.get(workflowName);
	if (!workflow) throw new Error(`Tried to access non-existant workflow: ${workflowName}`);

	let totalAccepted = 0;

	function processResult(result: string | boolean, newTestPart: TestPart) {
		// We don't need to follow paths where greaterThan and lessThan have crossed
		if (Object.values(newTestPart).find((category) => category.lessThan - category.greaterThan <= 1)) {
			return;
		}
		if (typeof result === 'string') {
			totalAccepted += testSubCombinations(workflows, newTestPart, result);
			return;
		}
		if (result === false) return;
		totalAccepted += Object.values(newTestPart).reduce(
			(total, cat) => total * Math.max(0, cat.lessThan - cat.greaterThan - 1),
			1,
		);
	}

	const mutateableTestPart = {
		...testPart,
	};

	for (const rule of workflow) {
		if (!rule.comparison) {
			processResult(rule.result, mutateableTestPart);
			break;
		}
		const { against, equality, test } = rule.comparison;
		const original = mutateableTestPart[test];
		const resultVersion = {
			greaterThan: equality === '>' ? against : original.greaterThan,
			lessThan: equality === '<' ? against : original.lessThan,
		};
		processResult(rule.result, { ...mutateableTestPart, [test]: resultVersion });
		mutateableTestPart[test] = {
			greaterThan: equality === '<' ? against - 1 : original.greaterThan,
			lessThan: equality === '>' ? against + 1 : original.lessThan,
		};
	}
	return totalAccepted;
}

export async function part1(lines: string[]) {
	const workflows = new Map<string, Rule[]>();
	let parsingWorkflows = true;
	let totalAccepted = 0;
	for (const line of lines) {
		if (line === '') {
			parsingWorkflows = false;
			continue;
		}

		if (parsingWorkflows) {
			const { name, rules } = parseWorkflow(line);
			workflows.set(name, rules);
			continue;
		}

		const part = parsePart(line);
		if (testPart(workflows, part)) {
			totalAccepted += part['x'] + part['m'] + part['a'] + part['s'];
		}
	}
	return totalAccepted;
}

export async function part2(lines: string[]) {
	const workflows = new Map<string, Rule[]>();
	for (const line of lines) {
		if (line === '') {
			break;
		}

		const { name, rules } = parseWorkflow(line);
		workflows.set(name, rules);
	}

	return testSubCombinations(workflows, {
		x: { greaterThan: 0, lessThan: 4001 },
		m: { greaterThan: 0, lessThan: 4001 },
		a: { greaterThan: 0, lessThan: 4001 },
		s: { greaterThan: 0, lessThan: 4001 },
	});
}
