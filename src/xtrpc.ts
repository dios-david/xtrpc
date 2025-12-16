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
		const project = timed(
			'Load TypeScript project',
			() =>
				new Project({
					tsConfigFilePath: config.input.tsconfigPath,
					compilerOptions: {
						outDir: 'dist',
						declaration: true,
						noEmit: false,
					},
				}),
		);

		const sourceFiles = timed('Load source files', () => {
			return project.getSourceFiles();
		});

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
			const routerPath = join(process.cwd(), config.input.routerFile);
			const routerFile = sourceFiles.find(
				(file) => file.getFilePath() === routerPath,
			);

			if (!routerFile) {
				throw new Error(
					`Router is not found in file: ${config.input.routerFile}`,
				);
			}

			return findNodeOrThrow(
				routerFile,
				isAppRouterName(config.input.routerTypeName),
			);
		});

		appRouter.replaceWithText(config.input.routerTypeName);

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
