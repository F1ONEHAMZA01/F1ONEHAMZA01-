import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, readFileSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';

const PORT = 3000;
const root = resolve(import.meta.dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

// Mirrors production `_headers`, but computes inline script hashes at request
// time so local dev matches the strict deploy CSP without unsafe-inline.
function buildSecurityHeaders(html) {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  };
  const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(m => `'sha256-${createHash('sha256').update(m[1], 'utf8').digest('base64')}'`)
    .join(' ');
  headers['Content-Security-Policy'] =
    `default-src 'self'; script-src 'self' ${hashes}; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; media-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`;
  return headers;
}

function resolveSafeRequestPath(rawUrl) {
  const pathname = decodeURIComponent(rawUrl.split('?')[0]);
  const candidate = resolve(join(root, pathname === '/' ? 'index.html' : pathname));
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  return candidate;
}

const server = createServer((req, res) => {
  try {
    const filePath = resolveSafeRequestPath(req.url);
    if (!filePath) {
      res.writeHead(403, { ...buildSecurityHeaders(''), 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    const effectivePath = !existsSync(filePath) || statSync(filePath).isDirectory()
      ? join(root, 'index.html')
      : filePath;

    const ext = extname(effectivePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const securityHeaders = ext === '.html'
      ? buildSecurityHeaders(readFileSync(effectivePath, 'utf8'))
      : buildSecurityHeaders('');

    res.writeHead(200, {
      ...securityHeaders,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });

    createReadStream(effectivePath).pipe(res);
  } catch (err) {
    console.error('Static file server error:', err);
    res.writeHead(500, { ...buildSecurityHeaders(''), 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Français BTP Maroc is running locally at:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`👉 http://127.0.0.1:${PORT}\n`);
});
