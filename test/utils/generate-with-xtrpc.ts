import { join, relative } from 'node:path';
import { xtrpc } from '../../src/xtrpc';

/**
 * Generate TypeScript declaration using our tool
 */
export function generateWithXtrpc(routerFilePath: string): string {
	const fixturesDir = join(import.meta.dirname, '..', 'fixtures');
	const tsconfigPath = join(fixturesDir, 'tsconfig.json');

	return xtrpc({
		input: {
			tsconfigPath,
			routerFile: relative(process.cwd(), routerFilePath),
			routerTypeName: 'AppRouter',
		},
		output: {
			filePath: 'types/api.d.ts',
		},
		verbose: false,
	});
}
