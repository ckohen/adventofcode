import { readFileSync } from 'fs';

const input = readFileSync('inputs/trees.txt').toString();
const lines = input.split('\n');

const trees: number[][] = [];

for (const line of lines) {
	trees.push([...line].map((tree) => parseInt(tree, 10)));
}

const columns = (Object.keys(trees[0]!) as unknown as number[]).map((col) => trees.map((row) => row[col]));

let highestScore = 0;

for (const [rowIndex, treeRow] of trees.entries()) {
	for (const [colIndex, tree] of treeRow.entries()) {
		const leftArr = treeRow.slice(0, colIndex);

		let left = 0;
		for (let i = leftArr.length - 1; i >= 0; i--) {
			left++;
			if (leftArr[i]! >= tree) break;
		}
		if (left === 0) continue;

		const rightArr = treeRow.slice(colIndex + 1);

		let right = 0;
		for (right; right < rightArr.length; right++) {
			if (rightArr[right]! >= tree) {
				right++;
				break;
			}
		}
		if (right === 0) continue;

		const topArr = columns[colIndex]!.slice(0, rowIndex);

		let top = 0;
		for (let i = topArr.length - 1; i >= 0; i--) {
			top++;
			if (topArr[i]! >= tree) break;
		}
		if (top === 0) continue;

		const botArr = columns[colIndex]!.slice(rowIndex + 1);
		let bot = 0;
		for (bot; bot < botArr.length; bot++) {
			if (botArr[bot]! >= tree) {
				bot++;
				break;
			}
		}
		if (bot === 0) continue;

		const score = left * right * top * bot;
		if (score > highestScore) highestScore = score;
	}
}

console.log(highestScore);
