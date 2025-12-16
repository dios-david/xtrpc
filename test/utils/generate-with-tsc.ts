import { join } from 'node:path';
import ts from 'typescript';

/**
 * Generate TypeScript declaration using TypeScript compiler API (baseline)
 */
export function generateWithTsc(routerFilePath: string): string {
	const fixturesDir = join(import.meta.dirname, '..', 'fixtures');
	const tsconfigPath = join(fixturesDir, 'tsconfig.json');

	// Read tsconfig
	const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
	if (configFile.error) {
		throw new Error(
			`Failed to read tsconfig: ${ts.formatDiagnostic(configFile.error, {
				getCurrentDirectory: () => fixturesDir,
				getCanonicalFileName: (fileName) => fileName,
				getNewLine: () => '\n',
			})}`,
		);
	}

	// Parse tsconfig
	const parsedConfig = ts.parseJsonConfigFileContent(
		configFile.config,
		ts.sys,
		fixturesDir,
		{
			declaration: true,
			emitDeclarationOnly: true,
			noEmit: false,
		},
	);

	// Create program
	const program = ts.createProgram({
		rootNames: [routerFilePath],
		options: parsedConfig.options,
	});

	// Emit declaration files
	let declarationText = '';
	const emitResult = program.emit(
		undefined,
		(fileName, text) => {
			if (fileName.endsWith('.d.ts')) {
				declarationText = text;
			}
		},
		undefined,
		true, // emitOnlyDtsFiles
	);

	// Check for errors
	const allDiagnostics = ts
		.getPreEmitDiagnostics(program)
		.concat(emitResult.diagnostics);

	if (allDiagnostics.length > 0) {
		const formatHost = {
			getCurrentDirectory: () => fixturesDir,
			getCanonicalFileName: (fileName: string) => fileName,
			getNewLine: () => '\n',
		};
		const errors = allDiagnostics
			.map((diagnostic) => ts.formatDiagnostic(diagnostic, formatHost))
			.join('\n');
		throw new Error(`TypeScript compilation errors:\n${errors}`);
	}

	if (!declarationText) {
		throw new Error('No declaration file was generated');
	}

	return declarationText;
}
