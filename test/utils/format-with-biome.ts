import { execSync } from 'node:child_process';

/**
 * Format TypeScript code using Biome formatter
 */
export async function formatWithBiome(code: string): Promise<string> {
	const formatted = execSync(
		`pnpm exec biome format --stdin-file-path=test.ts`,
		{
			input: code,
		},
	).toString();

	return formatted;
}
