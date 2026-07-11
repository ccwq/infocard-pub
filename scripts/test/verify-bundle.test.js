'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const MODULE_PATH = path.join(ROOT, 'scripts/lib/publish-bundle.js');

function validBundle(overrides = {}) {
  const bundle = {
    slug: 'publish-bundle-validator',
    html_path: 'docs/20260711-publish-bundle-validator.html',
    meta_path: 'docs/20260711-publish-bundle-validator.html.meta.yaml',
    asset_dir: 'assets/img/publish-bundle-validator',
    manifest_path: 'assets/img/publish-bundle-validator/manifest.json',
    source_url: 'https://example.com/source',
    style: 'darkblue',
    category: '开发工具',
    keywords: ['bundle', 'validator'],
    wiki: {
      raw_path: 'raw/articles/2026-07-11-infocard-publish-bundle-validator.md',
      knowledge_path: 'concepts/publish-bundle-validator.md',
    },
  };
  return { ...bundle, ...overrides };
}

test('loadBundle reads a JSON bundle and validation accepts the contract', () => {
  const { loadBundle, validateBundle } = require(MODULE_PATH);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-bundle-'));
  const bundlePath = path.join(dir, 'bundle.json');
  fs.writeFileSync(bundlePath, JSON.stringify(validBundle()));

  assert.deepEqual(loadBundle(bundlePath), validBundle());
  assert.deepEqual(validateBundle(loadBundle(bundlePath)), { valid: true, errors: [] });
});

test('validateBundle reports every invalid contract field', () => {
  const { validateBundle } = require(MODULE_PATH);
  const result = validateBundle(validBundle({
    slug: '20260711-Bad_Slug',
    html_path: '/tmp/card.html',
    meta_path: 'docs/wrong.meta.yaml',
    asset_dir: '../assets',
    manifest_path: 'manifest.json',
    source_url: 'ftp://example.com/source',
    style: 'unknown-theme',
    category: '',
    keywords: [],
    wiki: { raw_path: '/absolute/raw.md', knowledge_path: '../escape.md' },
  }));

  assert.equal(result.valid, false);
  for (const field of [
    'slug', 'html_path', 'meta_path', 'asset_dir', 'manifest_path',
    'source_url', 'style', 'category', 'keywords', 'wiki.raw_path',
    'wiki.knowledge_path',
  ]) {
    assert.ok(result.errors.some((error) => error.field === field), `missing error for ${field}`);
  }
});

test('all required repository style names are accepted', () => {
  const { validateBundle } = require(MODULE_PATH);
  const styles = [
    'darkblue', 'redswiss', 'hardblue', 'main-style', 'darkgreen',
    'graph-paper', 'handline', 'wood', 'black-head', 'pixelstack',
    'q-style', 'paper-warm', 'white-purple', 'color-material',
  ];

  for (const style of styles) {
    assert.equal(validateBundle(validBundle({ style })).valid, true, style);
  }
});

test('bundleAllowlist contains only publish outputs for the bundle', () => {
  const { bundleAllowlist } = require(MODULE_PATH);
  assert.deepEqual(bundleAllowlist(validBundle()), [
    'docs/20260711-publish-bundle-validator.html',
    'docs/20260711-publish-bundle-validator.html.meta.yaml',
    'assets/img/publish-bundle-validator/**',
    '_index.yaml',
    'index.html',
  ]);
});

test('CLI emits JSON and exits according to validation result', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-bundle-cli-'));
  const validPath = path.join(dir, 'valid.json');
  const invalidPath = path.join(dir, 'invalid.json');
  fs.writeFileSync(validPath, JSON.stringify(validBundle()));
  fs.writeFileSync(invalidPath, JSON.stringify(validBundle({ keywords: [] })));

  const pass = spawnSync(process.execPath, ['scripts/verify-bundle.js', '--bundle', validPath], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(pass.status, 0, pass.stderr);
  assert.equal(JSON.parse(pass.stdout).valid, true);

  const fail = spawnSync(process.execPath, ['scripts/verify-bundle.js', '--bundle', invalidPath], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.notEqual(fail.status, 0);
  assert.equal(JSON.parse(fail.stdout).valid, false);
});
