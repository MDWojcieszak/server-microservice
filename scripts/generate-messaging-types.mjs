// Generates clean TypeScript types for the RabbitMQ messaging contract.
//
// Source of truth: src/api/asyncapi.yaml (AsyncAPI 2.6).
// We deliberately do NOT use `@asyncapi/cli generate models` (Modelina), because
// it mangles reserved property names (name -> reservedName, status -> reservedStatus)
// which would not match the JSON sent over the wire. json-schema-to-typescript keeps
// the field names verbatim.
//
// Output: src/generated/messaging/index.ts  (do not edit by hand — run `npm run gen:messaging`).
//
// Besides components.schemas, this also emits a type for every channel that documents
// a request/reply response via the `x-reply.payload` extension (e.g. server.transfer.get).

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { compile } from 'json-schema-to-typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTRACT = resolve(ROOT, 'src/api/asyncapi.yaml');
const OUT_DIR = resolve(ROOT, 'src/generated/messaging');
const OUT_FILE = resolve(OUT_DIR, 'index.ts');

const COMPILE_OPTS = {
  bannerComment: '',
  additionalProperties: false,
  declareExternallyReferenced: false, // referenced schemas are emitted in their own pass
  enableConstEnums: false,
  format: false, // we prettify the whole file once at the end via the consumer's formatter
};

const rewriteRefs = (value) =>
  JSON.parse(
    JSON.stringify(value).replace(/#\/components\/schemas\//g, '#/definitions/'),
  );

const pascalCase = (s) =>
  s
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');

async function main() {
  const doc = yaml.load(readFileSync(CONTRACT, 'utf8'));
  const schemas = doc?.components?.schemas ?? {};
  const definitions = rewriteRefs(schemas);

  const blocks = [];

  // 1. One named type per entry in components.schemas.
  for (const [name, schema] of Object.entries(definitions)) {
    const ts = await compile({ ...schema, definitions, title: name }, name, COMPILE_OPTS);
    blocks.push(ts.trim());
  }

  // 2. Response types documented via x-reply (not a message, so codegen misses them).
  const channels = doc?.channels ?? {};
  for (const [channelName, channel] of Object.entries(channels)) {
    const reply = channel?.publish?.['x-reply']?.payload;
    if (!reply) continue;
    const typeName = `${pascalCase(channelName)}Reply`;
    const ts = await compile(
      { ...rewriteRefs(reply), definitions, title: typeName },
      typeName,
      COMPILE_OPTS,
    );
    blocks.push(ts.trim());
  }

  const header = [
    '/* eslint-disable */',
    '/**',
    ' * AUTO-GENERATED from src/api/asyncapi.yaml — DO NOT EDIT BY HAND.',
    ' * Regenerate with: npm run gen:messaging',
    ' */',
    '',
  ].join('\n');

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, header + blocks.join('\n\n') + '\n', 'utf8');
  console.log(`Generated ${Object.keys(definitions).length} schema types -> ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
