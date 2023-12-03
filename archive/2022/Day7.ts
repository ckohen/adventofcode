import { readFileSync } from 'fs';

const input = readFileSync('inputs/filesystem.txt').toString();
const lines = input.split('\n');

const enum DirectoryType {
	Directory,
	File,
}

interface Directory {
	type: DirectoryType.Directory;
	name: string;
	contents: DirectoryStructure;
	size: number;
}

interface File {
	type: DirectoryType.File;
	name: string;
	size: number;
}

type DirectoryStructure = Map<string, File | Directory>;

const maxSpace = 70_000_000;
const neededSpace = 30_000_000;
let totalSize = 0;
const dir: DirectoryStructure = new Map();
let currentDir: Directory['contents'] = dir;
const currentDirPath: string[] = [];

let isListing = false;

for (const line of lines) {
	if (line.startsWith('$')) {
		isListing = false;
		const [, command, arg] = line.split(' ');
		if (command === 'cd') {
			if (arg === '/') {
				currentDir = dir;
				continue;
			}
			if (arg === '..') {
				currentDirPath.pop();
				currentDir = currentDirPath.reduce<DirectoryStructure>((prev, curr) => {
					const found = prev.get(curr);
					if (!found) throw new Error('Current Dir Index Wrong');
					if (found.type === DirectoryType.File) throw new Error('Indexed to File instead of Directory');
					return found.contents;
				}, dir);
				continue;
			}
			const requested = currentDir.get(arg!);
			if (!requested) throw new Error(`Requested directory ${arg!} does not exist`);
			if (requested.type === DirectoryType.File) throw new Error(`Requested directory ${arg!} is a file`);
			currentDirPath.push(arg!);
			currentDir = requested.contents;
			continue;
		}

		if (command === 'ls') {
			isListing = true;
		}

		continue;
	}

	if (!isListing) continue;

	if (line.startsWith('dir')) {
		const name = line.split(' ')[1];
		if (!name) throw new Error('Directory unamed');
		currentDir.set(name, { type: DirectoryType.Directory, contents: new Map(), name, size: 0 });
		continue;
	}

	const [rawSize, name] = line.split(' ');
	if (!rawSize || !name) throw new Error(`Malformed line ${line}`);
	const size = parseInt(rawSize, 10);
	currentDir.set(name, { type: DirectoryType.File, name, size });
	totalSize += size;
	let aboveLevel = dir;
	for (const level of currentDirPath) {
		const nextLevel = aboveLevel.get(level);
		if (!nextLevel) throw new Error('Current Dir Index Wrong');
		if (nextLevel.type === DirectoryType.File) throw new Error('Indexed to File instead of Directory');
		nextLevel.size += size;
		aboveLevel = nextLevel.contents;
	}
}

const availableSpace = maxSpace - totalSize;

function scanDir(directory: Directory['contents'], size: number): Directory[] {
	const directories: Directory[] = [];
	for (const [, item] of directory) {
		if (item.type === DirectoryType.File) continue;
		if (item.size > size) directories.push(item);
		directories.push(...scanDir(item.contents, size));
	}
	return directories;
}

const dirsWithMinSpace: Directory[] = scanDir(dir, neededSpace - availableSpace);

let minSpaceDeleted = Infinity;

for (const directory of dirsWithMinSpace) {
	if (directory.size < minSpaceDeleted) minSpaceDeleted = directory.size;
}

console.log(minSpaceDeleted);
