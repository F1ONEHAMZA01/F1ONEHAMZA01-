import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = process.argv[2] ? resolve(process.argv[2]) : resolve(root, 'dist');
const required = [
  'index.html',
  'manifest.json',
  'sw.js',
  'data/vocab.js',
  'icons/icon.svg',
  'icons/icon-maskable.svg',
  '_headers',
  '_redirects',
  'deploy-metadata.json'
];

required.forEach(file => assert.ok(existsSync(resolve(dist, file)), `dist/${file} is missing`));

const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const fullPath = resolve(directory, entry.name);
  return entry.isDirectory() ? walk(fullPath) : [fullPath];
});

const deployedFiles = walk(dist);
const totalBytes = deployedFiles.reduce((sum, file) => sum + statSync(file).size, 0);
assert.ok(totalBytes < 10 * 1024 * 1024, `deploy bundle is unexpectedly large: ${totalBytes} bytes`);
assert.ok(!deployedFiles.some(file => /btp_maroc_(?:offline|app)|\.zip$/i.test(file)), 'legacy or ZIP files leaked into dist');

const html = readFileSync(resolve(dist, 'index.html'), 'utf8');
const sw = readFileSync(resolve(dist, 'sw.js'), 'utf8');
const headers = readFileSync(resolve(dist, '_headers'), 'utf8');
const manifest = JSON.parse(readFileSync(resolve(dist, 'manifest.json'), 'utf8'));
const metadata = JSON.parse(readFileSync(resolve(dist, 'deploy-metadata.json'), 'utf8'));

assert.match(html, /data\/vocab\.js\?v=3\.1\.1/);
assert.match(sw, /APP_VERSION = '3\.1\.1'/);
assert.match(headers, /Content-Security-Policy:/);
assert.match(headers, /\/sw\.js[\s\S]+Cache-Control: public, max-age=0, no-cache, must-revalidate/);
assert.equal(manifest.start_url, './index.html');
assert.equal(metadata.version, '3.1.1');

console.log(`${deployedFiles.length} production files validated (${(totalBytes / 1024 / 1024).toFixed(2)} MiB).`);
