'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { validateThemeContract, registeredThemes } = require('../lib/theme-contract');

function fixture(overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'theme-contract-'));
  fs.mkdirSync(path.join(root, 'theme'), { recursive: true });
  fs.writeFileSync(path.join(root, 'theme', 'blue.html'), '<html></html>');
  const html = overrides.html || '<html data-theme="blue"><style>:root{--bg:white}body{background:var(--bg)}</style></html>';
  const meta = overrides.meta || 'style: blue\n';
  const htmlPath = path.join(root, '.docs/card/card.html');
  const metaPath = path.join(root, '.docs/card/card.meta.yaml');
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, html);
  fs.writeFileSync(metaPath, meta);
  const bundle = { style: overrides.style || 'blue', html_path: 'docs/20260826-card.html', meta_path: 'docs/20260826-card.html.meta.yaml' };
  const entries = [
    { destination: bundle.html_path, sourceAbsolute: htmlPath },
    { destination: bundle.meta_path, sourceAbsolute: metaPath },
  ];
  return { root, bundle, entries };
}

test('theme contract discovers registered themes from theme/*.html', () => {
  const f = fixture();
  assert.deepEqual([...registeredThemes(f.root)], ['blue']);
});

test('theme contract accepts matching canonical declarations and tokens', () => {
  const f = fixture();
  assert.deepEqual(validateThemeContract(f), { valid: true, errors: [] });
});

test('theme contract rejects missing and mismatched declarations', () => {
  const missing = fixture({ html: '<html><style>body{color:var(--bg)}</style></html>', meta: 'style: blue\n' });
  assert.ok(validateThemeContract(missing).errors.some((item) => item.field === 'html.data-theme'));
  const mismatch = fixture({ html: '<html data-theme="blue"><style>body{color:var(--bg)}</style></html>', meta: 'style: red\n' });
  assert.ok(validateThemeContract(mismatch).errors.some((item) => item.field === 'meta.style'));
});

test('theme contract rejects unregistered and hard-coded colors', () => {
  const f = fixture({ style: 'red', html: '<html data-theme="red"><style>body{color:#fff;background:rgb(0,0,0)}</style></html>', meta: 'style: red\n' });
  const errors = validateThemeContract(f).errors;
  assert.ok(errors.some((item) => item.field === 'bundle.style'));
  assert.ok(errors.some((item) => item.field === 'html.colors'));
});