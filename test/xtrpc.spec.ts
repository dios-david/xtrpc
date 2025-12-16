import assert from 'node:assert';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import { formatWithBiome } from './utils/format-with-biome';
import { generateWithTsc } from './utils/generate-with-tsc';
import { generateWithXtrpc } from './utils/generate-with-xtrpc';

describe('xtrpc type generation', () => {
	const routers = [
		{ name: 'arktype', file: 'router-arktype.ts' },
		{ name: 'zod3', file: 'router-zod3.ts' },
		{ name: 'zod4', file: 'router-zod4.ts' },
	];

	for (const { name, file } of routers) {
		test(`${name} output matches tsc-generated declaration`, async () => {
			const routerPath = join(import.meta.dirname, 'fixtures', file);

			// Generate with both methods
			const tscOutput = generateWithTsc(routerPath);
			const xtrpcOutput = generateWithXtrpc(routerPath);

			// Format both outputs with Biome for consistent comparison
			const tscOutputFormatted = await formatWithBiome(tscOutput);
			const xtrpcOutputFormatted = await formatWithBiome(xtrpcOutput);

			// Compare the outputs
			assert.strictEqual(
				xtrpcOutputFormatted,
				tscOutputFormatted,
				`${name}: Our output should match tsc-generated declaration after formatting`,
			);
		});
	}
});
