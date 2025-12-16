import fs from 'node:fs/promises';
import path from 'node:path';
import { Config } from '../src/config';

const schema = Config.toJsonSchema();
const schemaPath = path.join(process.cwd(), 'dist', 'xtrpc.schema.json');

await fs.mkdir(path.dirname(schemaPath), { recursive: true });
await fs.writeFile(schemaPath, JSON.stringify(schema, null, 2), 'utf8');

console.log(`Generated JSON schema at ${schemaPath}`);
