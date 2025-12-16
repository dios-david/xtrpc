import { execSync } from 'node:child_process';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Format TypeScript code using Biome formatter
 */
export async function formatWithBiome(code: string): Promise<string> {
	// Create a temporary file
	const tempFile = join(tmpdir(), `biome-format-${Date.now()}.ts`);

	try {
		// Write code to temp file
		await writeFile(tempFile, code, 'utf-8');

		// Run Biome format
		execSync(`npx @biomejs/biome format --write "${tempFile}"`, {
			stdio: 'pipe',
			encoding: 'utf-8',
		});

		// Read formatted content
		const formatted = await readFile(tempFile, 'utf-8');
		return formatted;
	} finally {
		// Clean up temp file
		try {
			await unlink(tempFile);
		} catch {
			// Ignore cleanup errors
		}
	}
}
