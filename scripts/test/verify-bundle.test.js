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
    'darkblue', 'redswiss', 'hardblue', 'main', 'darkgreen',
    'graph-paper', 'handline', 'wood', 'black', 'pixelstack',
    'q', 'white-purple', 'color-material',
  ];

  for (const style of styles) {
    assert.equal(validateBundle(validBundle({ style })).valid, true, style);
  }
});

test('wiki paths reject drive-qualified and UNC paths', () => {
  const { validateBundle } = require(MODULE_PATH);
  const paths = ['C:/wiki/page.md', 'C:\\wiki\\page.md', '//server/share/page.md'];

  for (const field of ['raw_path', 'knowledge_path']) {
    for (const invalidPath of paths) {
      const bundle = validBundle();
      bundle.wiki[field] = invalidPath;
      const result = validateBundle(bundle);
      assert.equal(result.valid, false, `${field}: ${invalidPath}`);
      assert.ok(result.errors.some((error) => error.field === `wiki.${field}`));
    }
  }
});

test('html_path date prefix must be a real calendar date', () => {
  const { validateBundle } = require(MODULE_PATH);
  for (const date of ['00000000', '20260230', '20261301']) {
    const result = validateBundle(validBundle({
      html_path: `docs/${date}-publish-bundle-validator.html`,
      meta_path: `docs/${date}-publish-bundle-validator.html.meta.yaml`,
    }));
    assert.equal(result.valid, false, date);
    assert.ok(result.errors.some((error) => error.field === 'html_path'), date);
  }
  const leapDay = validateBundle(validBundle({
    html_path: 'docs/20240229-publish-bundle-validator.html',
    meta_path: 'docs/20240229-publish-bundle-validator.html.meta.yaml',
  }));
  assert.equal(leapDay.valid, true);
});

test('bundleAllowlist contains only publish outputs from bundle', () => {
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

test('CLI reports missing --bundle argument as JSON with exit code 2', () => {
  for (const args of [[], ['--bundle']]) {
    const result = spawnSync(process.execPath, ['scripts/verify-bundle.js', ...args], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    assert.equal(result.status, 2);
    assert.equal(JSON.parse(result.stdout).valid, false);
  }
});

test('CLI reports bundle load errors as JSON with nonzero exit', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-bundle-cli-errors-'));
  const invalidJsonPath = path.join(dir, 'invalid.json');
  fs.writeFileSync(invalidJsonPath, '{not json');

  for (const bundlePath of [path.join(dir, 'missing.json'), invalidJsonPath, dir]) {
    const result = spawnSync(process.execPath, ['scripts/verify-bundle.js', '--bundle', bundlePath], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    assert.notEqual(result.status, 0, bundlePath);
    assert.equal(JSON.parse(result.stdout).valid, false, bundlePath);
  }
});
