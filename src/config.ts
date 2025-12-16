import fs from 'node:fs/promises';
import { type } from 'arktype';

export const Config = type({
	input: {
		tsconfigPath: 'string = "tsconfig.json"',
		routerFile: 'string',
		routerTypeName: 'string = "AppRouter"',
	},
	output: {
		filePath: 'string = "types/api.d.ts"',
	},
	verbose: 'boolean = false',
});

export type Config = typeof Config.infer;

const readFile = async (path: string) => {
	try {
		return await fs.readFile(path, { encoding: 'utf8' });
	} catch {
		return undefined;
	}
};

export const readConfig = async (path: string): Promise<Config> => {
	const fileContent = await readFile(path);

	// Show helpful message when config file is missing
	if (!fileContent) {
		console.log(`No config file found at ${path}`);
		console.log(
			`Using default configuration. To customize, create ${path} with your settings.`,
		);
		console.log(`See: https://github.com/dios-david/xtrpc#configuration`);
	}

	let json: Record<string, unknown>;
	try {
		json = JSON.parse(fileContent ?? '{}');
	} catch {
		console.error(`\nConfiguration error in ${path}:`);
		console.error('  Invalid JSON format');
		console.error(
			`\nSee https://github.com/dios-david/xtrpc#configuration for valid options.\n`,
		);
		process.exit(1);
	}

	const input = json;

	const result = Config(input);

	if (result instanceof type.errors) {
		console.error(`\nConfiguration error in ${path}:\n`);
		for (const error of result) {
			console.error(`  ${error.path.join('.')}: ${error.message}`);
		}
		console.error(
			`\nSee https://github.com/dios-david/xtrpc#configuration for valid options.\n`,
		);
		process.exit(1);
	}

	return result;
};
