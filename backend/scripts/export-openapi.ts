import { mkdirSync, writeFileSync } from 'node:fs';
import { buildOpenApiDocument } from '../src/docs/openapi';

mkdirSync('docs', { recursive: true });
writeFileSync('docs/openapi.json', JSON.stringify(buildOpenApiDocument(), null, 2) + '\n');
console.log('נכתב docs/openapi.json');
