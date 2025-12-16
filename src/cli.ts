#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { readConfig } from './config';
import { xtrpc } from './xtrpc';

const main = async () => {
	const config = await readConfig('xtrpc.config.json');
	const declaration = xtrpc(config);

	const outPath = config.output.filePath;

	await fs.mkdir(path.dirname(outPath), { recursive: true });
	await fs.writeFile(outPath, declaration, 'utf8');

	return `Generated ${outPath}`;
};

main().then(console.log.bind(console)).catch(console.error.bind(console));
