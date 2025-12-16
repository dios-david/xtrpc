import { join } from 'node:path';
import { Project } from 'ts-morph';
import { findNodeOrThrow } from './ast';
import type { Config } from './config';
import {
	isAppRouterName,
	isContext,
	isMiddleware,
	isRouter,
} from './predicates';
import {
	CONTEXT_STUB,
	getAllTransformers,
	MIDDLEWARE_STUB,
	pruneProcedureImplementations,
	redefine,
} from './transformer';

export const xtrpc = (config: Config) => {
	const timed = <T>(label: string, fn: () => T): T => {
		if (config.verbose) console.time(label);
		const result = fn();
		if (config.verbose) console.timeEnd(label);
		return result;
	};

	return timed('Total xtrpc execution', () => {
		if (config.verbose) {
			console.log('xtrpc configuration:', JSON.stringify(config, null, 2));
		}

		const project = timed(
			'Load TypeScript project',
			() =>
				new Project({
					skipAddingFilesFromTsConfig: !!config.input.routerPaths?.length,
					tsConfigFilePath: config.input.tsconfigPath,
					compilerOptions: {
						outDir: 'dist',
						declaration: true,
						noEmit: false,
					},
				}),
		);

		const sourceFiles = timed('Load source files', () => {
			if (config.input.routerPaths) {
				return project.addSourceFilesAtPaths(config.input.routerPaths);
			}

			return project.getSourceFiles();
		});

		if (config.verbose) {
			console.log('Source files to process:', sourceFiles.length);
		}

		const transformers = timed('Collect transformers', () => {
			return getAllTransformers(
				sourceFiles,
				[
					[isContext, redefine(CONTEXT_STUB)],
					[isMiddleware, redefine(MIDDLEWARE_STUB)],
					[isRouter, pruneProcedureImplementations],
				],
				config.verbose,
			);
		});

		timed('Transform AST', () => {
			for (const transform of transformers) {
				transform();
			}
		});

		const [appRouter, rootFile] = timed('Find router', () => {
			const routerPath = join(process.cwd(), config.input.appRouterFilePath);
			const routerFile = sourceFiles.find(
				(file) => file.getFilePath() === routerPath,
			);

			if (!routerFile) {
				throw new Error(
					`Router is not found in file: ${config.input.appRouterFilePath}`,
				);
			}

			return findNodeOrThrow(
				routerFile,
				isAppRouterName(config.input.appRouterTypeName),
			);
		});

		appRouter.replaceWithText(config.input.appRouterTypeName);

		const [outputFile] = timed('Generate declaration file', () => {
			return project
				.getSourceFileOrThrow(rootFile.getBaseName())
				.getEmitOutput({ emitOnlyDtsFiles: true })
				.getOutputFiles();
		});

		if (!outputFile) {
			throw new Error('Could not emit output.');
		}

		return outputFile.getText();
	});
};
