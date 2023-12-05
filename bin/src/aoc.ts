#!/usr/bin/env node

import { Command, Argument, Option } from '@commander-js/extra-typings';
import { exec as execSync } from 'child_process';
import { promisify } from 'util';
import process from 'process';
import * as dotenv from 'dotenv';
import { readFile, rename, access, writeFile, cp } from 'fs/promises';
import { URL } from 'node:url';
import { default as ts } from 'typescript';
import { btoa } from 'buffer';

dotenv.config();
const exec = promisify(execSync);

// #region types
interface AOCFileRawInput {
	part1: (input: string) => Promise<unknown> | unknown;
	part2: (input: string) => Promise<unknown> | unknown;
	useRawInput: true;
}
interface AOCFileLineInput {
	part1: (lines: string[]) => Promise<unknown> | unknown;
	part2: (lines: string[]) => Promise<unknown> | unknown;
	useRawInput?: false;
}

type AOCFile = AOCFileLineInput | AOCFileRawInput;

// #endregion

// #region File constants

const distEntry = '../../dist/index.js';
const archiveRelativePath = (year: string | number) => `../../archive/${year}`;

const archiveSampleInputPath = (day: string | number, year: string | number) =>
	new URL(`${archiveRelativePath(year)}/inputs/Day${day}Sample.txt`, import.meta.url);
const archiveRealInputPath = (day: string | number, year: string | number) =>
	new URL(`${archiveRelativePath(year)}/inputs/Day${day}.txt`, import.meta.url);
const archiveIndexPath = (day: string | number, year: string | number) =>
	new URL(`${archiveRelativePath(year)}/Day${day}.ts`, import.meta.url);

const sampleInputPath = new URL(`../../inputs/sample.txt`, import.meta.url);
const realInputPath = new URL(`../../inputs/real.txt`, import.meta.url);
const srcIndexPath = new URL('../../src/index.ts', import.meta.url);
const templatePath = new URL('../templates/', import.meta.url);
const srcPath = new URL('../../src/', import.meta.url);

// #endregion

/**
 * Moves current inputsa and code to the archive
 * @param day - The day to mark the archive as
 * @param year - The year to archive within
 * @param force - Whether to skip checking if the files exist
 */
async function archiveCurrent(day: string | number, year: string | number, force: boolean) {
	if (!force) {
		const [sample, real, index] = await Promise.all([
			access(archiveSampleInputPath(day, year)).then(
				() => true,
				() => false,
			),
			access(archiveRealInputPath(day, year)).then(
				() => true,
				() => false,
			),
			access(archiveIndexPath(day, year)).then(
				() => true,
				() => false,
			),
		]);
		if (sample || real || index) {
			console.error(`Could not archive files, archives already exist (did you mean to use -f?)`);
			process.exit(1);
		}
	}
	try {
		await Promise.all([
			rename(sampleInputPath, archiveSampleInputPath(day, year)),
			rename(realInputPath, archiveRealInputPath(day, year)),
			rename(srcIndexPath, archiveIndexPath(day, year)),
		]);
	} catch (err) {
		console.error(`Error archiving files`, err);
		process.exit(1);
	}
}

async function init(force: boolean) {
	if (!force) {
		const [sample, real, index] = await Promise.all([
			access(sampleInputPath).then(
				() => true,
				() => false,
			),
			access(realInputPath).then(
				() => true,
				() => false,
			),
			access(srcIndexPath).then(
				() => true,
				() => false,
			),
		]);
		if (sample || real || index) {
			console.error(`Could not create files, some or all files already exist (did you mean to use -f?)`);
			process.exit(1);
		}
	}
	try {
		await Promise.all([
			writeFile(sampleInputPath, ''),
			writeFile(realInputPath, ''),
			cp(templatePath, srcPath, { recursive: true }),
		]);
	} catch (err) {
		console.error(`Error creating files`, err);
		process.exit(1);
	}
}

/**
 * Runs the specified modules parts with the given input, outputting the result to the console
 * @param toRun - The file to run, imported as module
 * @param input - the raw input to use
 * @param part - The specific part to run (runs both when not specified)
 * @param time - Whether to time how long it takes to obtain results
 */
async function runCode(toRun: AOCFile, input: string, part?: '1' | '2', time?: boolean) {
	const splitInput = input.split('\n');

	if (!part || part === '1') {
		let result: unknown;
		if (time) {
			console.time('Time Taken (part 1)');
		}
		if (toRun.useRawInput) {
			result = await toRun.part1(input);
		} else {
			result = await toRun.part1(splitInput);
		}
		console.log(`Part one result:\n`, result);
		if (time) {
			console.timeEnd('Time Taken (part 1)');
		}
	}

	if (!part || part === '2') {
		let result: unknown;
		if (time) {
			console.time('Time Taken (part 2)');
		}
		if (toRun.useRawInput) {
			result = await toRun.part2(input);
		} else {
			result = await toRun.part2(splitInput);
		}
		console.log(`Part two result:\n`, result);
		if (time) {
			console.timeEnd('Time Taken (part 2)');
		}
	}
}

// #region Command defintion
const command = new Command();
command
	.name(`ckohen's AOC Runner`)
	.description('CLI to manage AOC code running and file management')
	.version('0.1.0')
	.showHelpAfterError('(add --help for additional information)');

const dayArg = new Argument('<day>', 'the current day of AOC');
const yearOption = new Option('-y, --year <year>', 'the current year of AOC').env('AOC_YEAR');
const forceOption = new Option('-f, --force', 'Ignores any file warnings and forcibily performs the copies');

command
	.command('archive')
	.description('Moves current src and inputs to the archive')
	.addArgument(dayArg)
	.addOption(forceOption)
	.addOption(yearOption)
	.action(async (day, options) => {
		const year = options.year;
		if (!year) {
			console.error('Year must be specified as an option or in ENV');
			process.exit(1);
		}
		await archiveCurrent(day, year, options.force ?? false);
	});

command
	.command('init')
	.description('Copies the template files to src and creates empty input files')
	.addOption(forceOption)
	.action(async (options) => await init(options.force ?? false));

command
	.command('increment')
	.description('Archives the current code and inits the next day')
	.addArgument(dayArg)
	.addOption(forceOption)
	.addOption(yearOption)
	.action(async (day, options) => {
		const year = options.year;
		if (!year) {
			console.error('Year must be specified as an option or in ENV');
			process.exit(1);
		}
		await archiveCurrent(day, year, options.force ?? false);
		await init(options.force ?? false);
	});

const partOption = new Option('-p, --part <part>', 'the part to run (runs both if not specified)').choices([
	'1',
	'2',
] as const);
const sampleOption = new Option('-s, --sample', 'runs with sample data');
const buildOption = new Option('-b, --build', 'rebuilds the dist output before running');
const timeOption = new Option('-t, --time', 'times how long it takes to run each part');

command
	.command('run', { isDefault: true })
	.description('Runs the current days code')
	.addOption(partOption)
	.addOption(sampleOption)
	.addOption(buildOption)
	.addOption(timeOption)
	.action(async (options) => {
		if (options.build) {
			console.log('Building...');
			try {
				const { stderr } = await exec('yarn build:output --pretty');
				if (stderr !== '') {
					console.error('Error building typescript:', stderr);
					process.exit(1);
				}
			} catch (error) {
				if (typeof error === 'object' && error && 'stdout' in error) {
					console.log('Typescript build failed:\n', error.stdout);
				} else {
					console.error('Error executing build:\n', error);
				}
				process.exit(1);
			}
		}

		let toRun: AOCFile;
		let input: string;
		try {
			toRun = await import(distEntry);
		} catch (err) {
			console.error('Could not find emitted javascript (did you forget to add -b?):\n', err);
			process.exit(1);
		}
		try {
			input = (await readFile(options.sample ? sampleInputPath : realInputPath)).toString();
		} catch (err) {
			console.error('Could not read input file:\n', err);
			process.exit(1);
		}

		if (input === '') {
			console.error('Input appears empty, did you forget to copy data in?');
			process.exit(1);
		}
		await runCode(toRun, input, options.part, options.time);
	});

// TODO: use typescript api to compile in place and run
command
	.command('run-archive')
	.argument('<day>', 'the day of AOC to run')
	.argument('<year>', 'the year of AOC to run')
	.addOption(partOption)
	.addOption(sampleOption)
	.addOption(timeOption)
	.action(async (day, year, options) => {
		console.log('Reading archive...');
		let rawFile: string;
		try {
			rawFile = (await readFile(archiveIndexPath(day, year))).toString();
		} catch (error) {
			console.error('Error reading archive:\n', error);
			process.exit(1);
		}

		console.log('Building...');
		let compiled: string;
		try {
			const localTsConfig = (await import('../../tsconfig.json', { with: { type: 'json' } })).default;
			compiled = ts.transpileModule(rawFile, {
				compilerOptions: {
					...localTsConfig.compilerOptions,
					// Modules
					module: ts.ModuleKind.NodeNext,
					moduleResolution: ts.ModuleResolutionKind.NodeNext,
					// Emit
					sourceMap: false,
					removeComments: true,
					newLine: ts.NewLineKind.LineFeed,
					// Language and Environment
					target: ts.ScriptTarget.ESNext,
				},
				fileName: 'input.mts',
			}).outputText;
		} catch (err) {
			console.error('Error building typescript:\n', err);
			process.exit(1);
		}

		let toRun: AOCFile;
		let input: string;
		try {
			toRun = await import(`data:text/javascript;base64,${btoa(compiled)}`);
		} catch (err) {
			console.error('Could not process emitted javascript:\n', err);
			process.exit(1);
		}
		try {
			input = (
				await readFile(options.sample ? archiveSampleInputPath(day, year) : archiveRealInputPath(day, year))
			).toString();
		} catch (err) {
			console.error('Could not read input file:\n', err);
			process.exit(1);
		}

		if (input === '') {
			console.error('Input appears empty, did you forget to copy data in?');
			process.exit(1);
		}
		await runCode(toRun, input, options.part, options.time);
	});

command.parse();

// #endregion
