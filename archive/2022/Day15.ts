import { readFileSync } from 'fs';

const input = readFileSync('inputs/sensors.txt').toString();
const lines = input.split('\n');

interface Coordinate {
	x: number;
	y: number;
}

const beacons = new Map<number, Set<number>>();

const lowestX = 0;
const highestX = 4_000_000;
const lowestY = 0;
const highestY = 4_000_000;
const sensorLines: { location: Coordinate; distance: number }[] = lines.map((line) => {
	const match = /.*x\=(?<sensorx>-?\d*), y=(?<sensory>-?\d*).*x\=(?<beaconx>-?\d*), y=(?<beacony>-?\d*)/gi.exec(line);
	if (!match) throw new Error(`Invalid input`);
	const { sensorx, sensory, beaconx, beacony } = match.groups!;

	const sensor = { x: parseInt(sensorx!, 10), y: parseInt(sensory!, 10) };

	const beacon = { x: parseInt(beaconx!, 10), y: parseInt(beacony!, 10) };

	let beaconRow = beacons.get(beacon.y);
	if (typeof beaconRow === 'undefined') {
		beaconRow = new Set();
		beacons.set(beacon.y, beaconRow);
	}
	beaconRow.add(beacon.x);

	const lowerX = Math.min(sensor.x, beacon.x);
	const higherX = Math.max(sensor.x, beacon.x);
	const lowerY = Math.min(sensor.y, beacon.y);
	const higherY = Math.max(sensor.y, beacon.y);
	return { location: sensor, distance: Math.abs(higherX - lowerX) + Math.abs(higherY - lowerY) };
});

const enum RowInfoType {
	Beacon,
	Empty,
	Filled,
}

let result = -1;

for (let row = lowestY; row <= highestY; row++) {
	let rowInfo: { type: RowInfoType; length: number }[] = [];

	for (const [row, cols] of beacons) {
		beacons.set(row, new Set([...cols].sort((a, b) => a - b)));
	}

	const beaconsInRow = beacons.get(row);
	if (beaconsInRow) {
		let lastX = lowestX;
		for (const x of beaconsInRow) {
			if (x < lowestX) continue;
			if (x > highestX) continue;
			rowInfo.push({ type: RowInfoType.Empty, length: x - lastX }, { type: RowInfoType.Beacon, length: 1 });
			lastX = x;
		}
		rowInfo.push({ type: RowInfoType.Empty, length: highestX - lastX + (lastX === lowestX ? 1 : 0) });
	} else {
		rowInfo.push({ type: RowInfoType.Empty, length: highestX - lowestX + 1 });
	}

	for (const sensor of sensorLines) {
		if (sensor.location.y + sensor.distance < row) continue;
		if (sensor.location.y - sensor.distance > row) continue;
		const toFillOffset = sensor.distance - Math.abs(sensor.location.y - row);

		let filling = toFillOffset * 2 + 1;
		let fillingFrom = sensor.location.x - toFillOffset;

		const lowerThanLowest = lowestX - fillingFrom;
		if (lowerThanLowest > 0) {
			filling -= lowerThanLowest;
			fillingFrom = lowestX;
		}

		const higherThanHighest = fillingFrom + filling - (highestX + 1);
		if (higherThanHighest > 0) {
			filling -= higherThanHighest;
		}

		if (filling <= 0) continue;

		let pos = lowestX;
		let filled = 0;
		let offsetSlices = 0;
		for (const [index, block] of rowInfo.entries()) {
			switch (block.type) {
				case RowInfoType.Beacon:
					if (fillingFrom <= pos && fillingFrom + filling >= pos) {
						filled += 1;
					}
					break;
				case RowInfoType.Filled:
					if (pos + block.length > fillingFrom) {
						filled += Math.min(filling - filled, block.length, pos + block.length - fillingFrom);
					}
					break;
				case RowInfoType.Empty:
					if (pos >= fillingFrom && pos + block.length <= fillingFrom + filling) {
						block.type = RowInfoType.Filled;
						filled += block.length;
						break;
					}
					if (pos < fillingFrom && pos + block.length > fillingFrom && pos + block.length > fillingFrom + filling) {
						rowInfo = [
							...rowInfo.slice(0, index + offsetSlices),
							{ type: RowInfoType.Empty, length: fillingFrom - pos },
							{ type: RowInfoType.Filled, length: filling },
							{ type: RowInfoType.Empty, length: block.length - filling - (fillingFrom - pos) },
							...rowInfo.slice(index + 1 + offsetSlices),
						];
						filled = filling;
						offsetSlices += 2;
						break;
					}
					if (pos >= fillingFrom) {
						rowInfo = [
							...rowInfo.slice(0, index + offsetSlices),
							{ type: RowInfoType.Filled, length: filling - filled },
							{ type: RowInfoType.Empty, length: block.length - (filling - filled) },
							...rowInfo.slice(index + 1 + offsetSlices),
						];
						filled = filling;
						offsetSlices += 1;
						break;
					}
					if (pos <= fillingFrom && pos + block.length > fillingFrom) {
						rowInfo = [
							...rowInfo.slice(0, index + offsetSlices),
							{ type: RowInfoType.Empty, length: fillingFrom - pos },
							{ type: RowInfoType.Filled, length: block.length - (fillingFrom - pos) },
							...rowInfo.slice(index + 1 + offsetSlices),
						];
						filled += block.length - (fillingFrom - pos);
						offsetSlices += 1;
						break;
					}
			}
			if (filled === filling) break;
			pos += block.length;
		}
	}

	let pos = lowestX;
	for (const block of rowInfo) {
		if (block.type === RowInfoType.Empty) {
			result = pos * 4_000_000 + row;
			break;
		}
		pos += block.length;
	}

	if (result > -1) {
		break;
	}
}

console.log(result);
