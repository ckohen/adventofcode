export const useRawInput = false;

const enum ModuleType {
	Broadcast,
	FlipFlop,
	Conjuction,
}

const enum Pulse {
	Low,
	High,
}

interface FlipFlopModule {
	destinations: string[];
	name: string;
	state: boolean;
	type: ModuleType.FlipFlop;
}

interface ConjunctionModule {
	destinations: string[];
	name: string;
	state: Map<string, Pulse>;
	type: ModuleType.Conjuction;
}

interface BroadcastModule {
	destinations: string[];
	name: string;
	type: ModuleType.Broadcast;
}

type Module = BroadcastModule | ConjunctionModule | FlipFlopModule;

function parseModule(line: string): Module {
	const [rawModule, rawDestinations] = line.split('->').map((split) => split.trim());
	if (!rawDestinations) throw new Error(`Invalid line ${line}`);
	const destinations = rawDestinations.split(',').map((split) => split.trim());
	if (rawModule?.startsWith('%') || rawModule?.startsWith('&')) {
		const moduleType = rawModule.startsWith('%') ? ModuleType.FlipFlop : ModuleType.Conjuction;
		return {
			type: moduleType,
			name: rawModule.slice(1),
			destinations,
			// @ts-expect-error TS can't understand this for some reason
			state: moduleType === ModuleType.FlipFlop ? false : new Map(),
		};
	}

	if (rawModule === 'broadcaster') {
		return {
			type: ModuleType.Broadcast,
			name: rawModule!,
			destinations,
		};
	}

	throw new Error(`Unknown module type: ${rawModule}`);
}

function parseModules(lines: string[]) {
	const modules = new Map<string, Module>();
	const conjuctionModuleNames: string[] = [];
	const rxTransmitters: string[] = [];
	for (const line of lines) {
		const module = parseModule(line);
		modules.set(module.name, module);
		if (module.type === ModuleType.Conjuction) {
			conjuctionModuleNames.push(module.name);
		}

		if (module.destinations.includes('rx')) {
			rxTransmitters.push(module.name);
		}
	}

	for (const module of modules.values()) {
		for (const destination of module.destinations) {
			if (conjuctionModuleNames.includes(destination)) {
				(modules.get(destination) as ConjunctionModule).state.set(module.name, Pulse.Low);
			}
		}
	}

	return { modules, rxTransmitters };
}

function processButtonPress(modules: Map<string, Module>, trackHigh?: string) {
	const toProcess: [moduleName: string, sentPulse: Pulse, from: string][] = [['broadcaster', Pulse.Low, '']];
	let highPulses = 0;
	let lowPulses = 0;
	let rxLowPulses = 0;
	const trackedHighPulses: string[] = [];
	while (toProcess.length) {
		const processing = toProcess.shift()!;

		if (processing[1] === Pulse.High) {
			if (trackHigh === processing[0]) {
				trackedHighPulses.push(processing[2]);
			}

			highPulses++;
		} else {
			lowPulses++;
		}

		const module = modules.get(processing[0]);
		if (!module) {
			if (processing[0] === 'rx') {
				if (processing[1] === Pulse.Low) {
					rxLowPulses++;
				}

				continue;
			}

			console.debug(`Unknown module ${processing[0]} received pulse ${processing[1]}`);
			continue;
		}

		let toSend: Pulse;

		switch (module.type) {
			case ModuleType.Broadcast:
				toSend = processing[1];
				break;
			case ModuleType.FlipFlop:
				if (processing[1] === Pulse.High) continue;
				module.state = !module.state;
				toSend = module.state ? Pulse.High : Pulse.Low;
				break;
			case ModuleType.Conjuction: {
				module.state.set(processing[2], processing[1]);
				let allHigh = true;
				for (const state of module.state.values()) {
					if (state === Pulse.Low) {
						allHigh = false;
						break;
					}
				}

				toSend = allHigh ? Pulse.Low : Pulse.High;
				break;
			}
		}

		for (const destination of module.destinations) {
			toProcess.push([destination, toSend, module.name]);
		}
	}

	return { highPulses, lowPulses, rxLowPulses, trackedHighPulses };
}

function processButtonPresses(modules: Map<string, Module>, count: number) {
	let totalHighPulses = 0;
	let totalLowPulses = 0;
	for (let presses = 1; presses <= count; presses++) {
		const { lowPulses, highPulses } = processButtonPress(modules);
		totalHighPulses += highPulses;
		totalLowPulses += lowPulses;
	}

	return totalHighPulses * totalLowPulses;
}

function gcd(distance1: number, distance2: number): number {
	return distance2 === 0 ? distance1 : gcd(distance2, distance1 % distance2);
}

function lcm(values: number[]) {
	return values.reduce(
		(currentLcm, currentDistance) => (currentLcm * currentDistance) / gcd(currentLcm, currentDistance),
	);
}

export async function part1(lines: string[]) {
	const { modules } = parseModules(lines);
	return processButtonPresses(modules, 1_000);
}

export async function part2(lines: string[]) {
	const { modules, rxTransmitters } = parseModules(lines);

	if (rxTransmitters.length !== 1 || modules.get(rxTransmitters[0]!)!.type !== ModuleType.Conjuction) {
		console.log('Non standard "rx" transmitters, manually iterating. This will probably take a while');
		let lowPulseReceived = false;
		let presses = 0;
		while (!lowPulseReceived) {
			presses++;
			const { rxLowPulses } = processButtonPress(modules);
			if (rxLowPulses > 0) {
				lowPulseReceived = true;
			}
		}

		return presses;
	}

	const conjuctionTransmitter = modules.get(rxTransmitters[0]!) as ConjunctionModule;
	const inputPeriods = new Map<string, number>();
	let presses = 0;
	while (inputPeriods.size < conjuctionTransmitter.state.size) {
		presses++;
		const { rxLowPulses, trackedHighPulses } = processButtonPress(modules, conjuctionTransmitter.name);
		if (rxLowPulses > 0) {
			return presses;
		}

		for (const highPulse of trackedHighPulses) {
			inputPeriods.set(highPulse, inputPeriods.get(highPulse) ?? presses);
		}
	}

	return lcm([...inputPeriods.values()]);
}
