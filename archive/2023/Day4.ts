export const useRawInput = false;

interface Card {
	id: number;
	winners: Set<number>;
	yours: number[];
	copies: number;
}

function parseLine(line: string): Card {
	const [card, numbers] = line.split(':');
	if (!card || !numbers) throw new Error('Invalid input');
	const [, rawCardId] = card.replace(/ +/, ' ').split(' ');
	const [rawWinners, rawYours] = numbers.trim().split('|');
	if (!rawCardId || !rawWinners || !rawYours) throw new Error('Invalid input');
	const winners = new Set(
		rawWinners
			.trim()
			.split(' ')
			.filter((val) => val !== '')
			.map(Number),
	);
	const yours = rawYours
		.trim()
		.split(' ')
		.filter((val) => val !== '')
		.map(Number);
	return {
		id: Number(rawCardId),
		winners,
		yours,
		copies: 1,
	};
}

export async function part1(lines: string[]) {
	const result = lines.reduce((totalPoints, currentLine) => {
		const card = parseLine(currentLine);
		let toAdd = 0;
		for (const number of card.yours) {
			if (card.winners.has(number)) {
				if (toAdd === 0) {
					toAdd = 1;
				} else {
					toAdd *= 2;
				}
			}
		}
		return totalPoints + toAdd;
	}, 0);
	return result;
}

export async function part2(lines: string[]) {
	const cards = lines.map(parseLine);
	let totalCards = 0;
	for (const card of cards) {
		const won = card.yours.reduce(
			(totalWon, currentNum) => (card.winners.has(currentNum) ? totalWon + 1 : totalWon),
			0,
		);
		for (let i = card.id; i < card.id + won; i++) {
			const nextCard = cards[i];
			if (nextCard) {
				nextCard.copies += card.copies;
			}
		}
		totalCards += card.copies;
	}
	return totalCards;
}
