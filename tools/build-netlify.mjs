import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');

if (!output.startsWith(`${root}\\`) && !output.startsWith(`${root}/`)) {
  throw new Error('Refusing to build outside the project directory.');
}

// A deploy must never inherit stale files from an older release.
await rm(output, { recursive: true, force: true });

const files = [
  'index.html',
  'manifest.json',
  'sw.js',
  'data/vocab.js',
  'data/reading-docs.js',
  'data/writing-templates.js',
  'data/grammar-lessons.js',
  'data/plan-tasks.js',
  'fonts/cairo-arabic.woff2',
  'fonts/cairo-latin.woff2',
  'fonts/roboto-flex-latin.woff2',
  'icons/icon.svg',
  'icons/icon-maskable.svg',
  '_headers',
  '_redirects'
];

await mkdir(output, { recursive: true });

for (const source of files) {
  const destination = resolve(output, source);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(resolve(root, source), destination);
}

const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const metadata = {
  name: packageJson.name,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  files
};
await writeFile(resolve(output, 'deploy-metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');

console.log(`Netlify bundle ${metadata.version} created in ${output}`);
