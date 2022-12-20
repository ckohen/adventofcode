import { readFileSync } from 'fs';

const input = readFileSync('inputs/groveFile.txt').toString();
const lines = input.split('\n');

const decryptionKeyNumber = 811589153;

let decryptionKey = new Map<number, number>();

const file = lines.map((line, index) => {
	decryptionKey.set(index, index);
	return { index, value: parseInt(line, 10) * decryptionKeyNumber };
});

for (let round = 0; round < 10; round++) {
	for (const [index, num] of file.entries()) {
		let newIndex = num.index + (num.value % (file.length - 1));
		if (newIndex < 0) {
			newIndex += file.length - 1;
		}
		if (newIndex >= file.length) {
			newIndex -= file.length - 1;
		}
		const newDecryptionKey = new Map<number, number>(decryptionKey);
		let direction = 1;
		if (newIndex > num.index) direction = -1;
		const lowerIndex = Math.min(num.index, newIndex);
		const higherIndex = Math.max(num.index, newIndex);
		for (let i = lowerIndex; i <= higherIndex; i++) {
			const encryptedIndex = decryptionKey.get(i);
			if (typeof encryptedIndex === 'undefined') throw new Error('Broken decryption key');
			const line = file[encryptedIndex];
			if (!line) throw new Error('Broken decryption key index');
			if (line === num) continue;
			line.index += direction;
			newDecryptionKey.set(line.index, encryptedIndex);
		}
		num.index = newIndex;
		newDecryptionKey.set(num.index, index);
		decryptionKey = newDecryptionKey;
	}
}

const decrypted: number[] = [];

let zeroIndex = 0;

for (const num of file) {
	decrypted[num.index] = num.value;
	if (num.value === 0) zeroIndex = num.index;
}

const coordinateIndexes = [1000, 2000, 3000];

const coordinates: [number, number, number] = [0, 0, 0];

for (const [direction, coordinateIndex] of coordinateIndexes.entries()) {
	coordinates[direction] = decrypted[(zeroIndex + coordinateIndex) % decrypted.length]!;
}

console.log(coordinates.reduce((prev, curr) => prev + curr));
