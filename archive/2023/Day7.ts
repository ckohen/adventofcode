export const useRawInput = false;

const cards = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'] as const;
const jokerCards = ['J', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'Q', 'K', 'A'] as const;
const enum WinKind {
	HighCard,
	OnePair,
	TwoPair,
	ThreeKind,
	FullHouse,
	FourKind,
	FiveKind,
}

interface Hand {
	hand: string;
	bid: number;
	win: WinKind;
}

function parseInput(line: string, jokers = false): Hand {
	const [rawHand, rawBid] = line.split(' ');
	const bid = Number(rawBid);
	let win: WinKind;

	const hand = new Map<string, number>();

	for (const char of rawHand!.split('')) {
		const existing = hand.get(char as (typeof cards)[number]);
		hand.set(char as (typeof cards)[number], (existing ?? 0) + 1);
	}

	const hasJokers = jokers && hand.get('J');

	const counts = [...hand.values()];
	if (hand.size === 1) {
		win = WinKind.FiveKind;
	} else if (hand.size === 2) {
		if (hasJokers) {
			win = WinKind.FiveKind;
		} else {
			const aCount = counts[0]!;
			if (aCount === 1 || aCount === 4) {
				win = WinKind.FourKind;
			} else {
				win = WinKind.FullHouse;
			}
		}
	} else if (hand.size === 3) {
		const isThree = counts.find((val) => val === 3);
		if (hasJokers) {
			if (hasJokers === 1) {
				if (isThree) {
					win = WinKind.FourKind;
				} else {
					win = WinKind.FullHouse;
				}
			} else {
				win = WinKind.FourKind;
			}
		} else {
			if (isThree) {
				win = WinKind.ThreeKind;
			} else {
				win = WinKind.TwoPair;
			}
		}
	} else if (hand.size === 4) {
		if (hasJokers) {
			win = WinKind.ThreeKind;
		} else {
			win = WinKind.OnePair;
		}
	} else {
		if (hasJokers) {
			win = WinKind.OnePair;
		} else {
			win = WinKind.HighCard;
		}
	}

	return {
		hand: rawHand!,
		bid,
		win,
	};
}

function sortHands(handA: Hand, handB: Hand, jokers = false) {
	if (handA.win === handB.win) {
		for (let charIndex = 0; charIndex < handA.hand.length; charIndex++) {
			if (handA.hand[charIndex]! === handB.hand[charIndex]!) continue;
			return (
				(jokers ? jokerCards : cards).findIndex((val) => handA.hand[charIndex]! === val) -
				(jokers ? jokerCards : cards).findIndex((val) => handB.hand[charIndex]! === val)
			);
		}
	}

	return handA.win - handB.win;
}

export async function part1(lines: string[]) {
	const hands = lines.map((line) => parseInput(line));
	hands.sort(sortHands);
	const winnings = hands.reduce((total, currentHand, currentIndex) => total + currentHand.bid * (currentIndex + 1), 0);
	return winnings;
}

export async function part2(lines: string[]) {
	const hands = lines.map((line) => parseInput(line, true));
	hands.sort((a, b) => sortHands(a, b, true));
	const winnings = hands.reduce((total, currentHand, currentIndex) => total + currentHand.bid * (currentIndex + 1), 0);
	return winnings;
}
