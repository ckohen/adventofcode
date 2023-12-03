import { readFileSync } from 'fs';

const input = readFileSync('inputs/rpsstrategyguide.txt').toString();
const lines = input.split('\n');

const enum OpponentThrow {
	Rock = 'A',
	Paper = 'B',
	Scissors = 'C',
}

const enum RoundOutcome {
	Loss = 'X',
	Draw = 'Y',
	Win = 'Z',
}

const enum OwnThrowScore {
	Rock = 1,
	Paper,
	Scissors,
}

const enum RoundOutcomeScore {
	Loss = 0,
	Draw = 3,
	Win = 6,
}

let score = 0;

for (const line of lines) {
	const [opponent, target] = line.split(' ');
	if (opponent === OpponentThrow.Paper) {
		if (target === RoundOutcome.Draw) {
			score += RoundOutcomeScore.Draw + OwnThrowScore.Paper;
			continue;
		}
		if (target === RoundOutcome.Loss) {
			score += RoundOutcomeScore.Loss + OwnThrowScore.Rock;
			continue;
		}
		score += RoundOutcomeScore.Win + OwnThrowScore.Scissors;
		continue;
	}
	if (opponent === OpponentThrow.Rock) {
		if (target === RoundOutcome.Draw) {
			score += RoundOutcomeScore.Draw + OwnThrowScore.Rock;
			continue;
		}
		if (target === RoundOutcome.Loss) {
			score += RoundOutcomeScore.Loss + OwnThrowScore.Scissors;
			continue;
		}
		score += RoundOutcomeScore.Win + OwnThrowScore.Paper;
		continue;
	}
	if (target === RoundOutcome.Draw) {
		score += RoundOutcomeScore.Draw + OwnThrowScore.Scissors;
		continue;
	}
	if (target === RoundOutcome.Loss) {
		score += RoundOutcomeScore.Loss + OwnThrowScore.Paper;
		continue;
	}
	score += RoundOutcomeScore.Win + OwnThrowScore.Rock;
}

console.log(`Total score according to stategy guide: ${score}`);
