import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Loads a browser-oriented source file into a sandboxed context with minimal
 * DOM/browser stubs and returns the requested exported functions.
 * Mirrors the extraction technique used by tools/validate-app.mjs.
 */
export function loadSourceModule(relPath, functionNames) {
  const source = readFileSync(resolve(root, relPath), 'utf8');
  const stripped = source
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?/gm, '')
    .replace(/^\s*export\s+(const|let|var)\s+/gm, '$1 ')
    .replace(/^\s*export\s+(async\s+)?function\s+/gm, (m, a) => (a || '') + 'function ');

  const sandboxWindow = {
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
    requestAnimationFrame: () => {},
    navigator: {},
    location: { href: 'http://localhost:3000/' }
  };
  const sandboxDocument = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, setAttribute() {}, appendChild() {} })
  };

  const context = {
    window: sandboxWindow,
    document: sandboxDocument,
    navigator: sandboxWindow.navigator,
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    state: {},
    console,
    Math,
    JSON,
    Number,
    String,
    Array,
    Object,
    Set,
    Map,
    parseFloat,
    parseInt,
    isNaN,
    encodeURIComponent,
    decodeURIComponent,
    requestIdleCallback: undefined
  };
  context.globalThis = context;
  vm.createContext(context);

  const prologue = `${functionNames.map(n => `const __${n} = typeof ${n} === 'function' ? ${n} : undefined;`).join('\n')}\nreturn { ${functionNames.map(n => `${n}: __${n}`).join(', ')} };`;
  const wrapped = `(function(){\n${stripped}\n${prologue}\n})();`;
  return vm.runInContext(wrapped, context, { filename: relPath });
}

/** Loads a window-global dataset file (data/*.js style) */
export function loadDataset(relPath, globalName) {
  const context = {
    window: {},
    atob: b64 => Buffer.from(b64, 'base64').toString('latin1'),
    escape: s => encodeURIComponent(s),
    decodeURIComponent,
    JSON
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(readFileSync(resolve(root, relPath), 'utf8'), context, { filename: relPath });
  return context.window[globalName];
}
