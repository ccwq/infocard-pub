'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const GENERATOR = path.join(ROOT, 'scripts/generate-card-meta.js');
const VERIFY = path.join(ROOT, 'scripts/verify-bundle.js');
const fixtureRoots = new Set();

test.afterEach(() => {
  for (const root of fixtureRoots) fs.rmSync(root, { recursive: true, force: true });
  fixtureRoots.clear();
});

function fixture(overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'generate-card-meta-'));
  fixtureRoots.add(root);
  const bundle = {
    slug: 'yaml-safe-card',
    html_path: 'docs/20260711-yaml-safe-card.html',
    meta_path: 'docs/20260711-yaml-safe-card.html.meta.yaml',
    asset_dir: 'assets/img/yaml-safe-card',
    manifest_path: 'assets/img/yaml-safe-card/manifest.json',
    source_url: 'https://example.com/a?q=x:y&quote="yes"',
    style: 'darkblue',
    category: '开发工具: Agent',
    keywords: ['one', 'two: three', 'quote " tag'],
    wiki: { raw_path: 'raw/article.md', knowledge_path: 'concepts/article.md' },
    ...overrides,
  };
  fs.writeFileSync(path.join(root, 'bundle.json'), JSON.stringify(bundle));
  return { root, bundle, bundlePath: path.join(root, 'bundle.json'), metaPath: path.join(root, bundle.meta_path) };
}

function run(script, args, cwd, env = {}) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

test('prints minimal safe YAML with locked mechanical fields and explicit Agent2 placeholders', () => {
  const f = fixture();
  const result = run(GENERATOR, ['--bundle', f.bundlePath], f.root);
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.valid, true);
  assert.equal(output.written, false);
  assert.match(output.yaml, /slug: yaml-safe-card/);
  assert.match(output.yaml, /path: "docs\/20260711-yaml-safe-card\.html"/);
  assert.match(output.yaml, /style: "darkblue"/);
  assert.match(output.yaml, /category: "开发工具: Agent"/);
  assert.match(output.yaml, /source_url: "https:\/\/example\.com\/a\?q=x:y&quote=\\"yes\\""/);
  assert.match(output.yaml, /title: "__AGENT2_FILL_TITLE__"/);
  assert.match(output.yaml, /desc: "__AGENT2_FILL_DESC__"/);
  assert.match(output.yaml, /tags: \["__AGENT2_FILL_TAGS__"\]/);
  assert.doesNotMatch(output.yaml, /^(date|updated):/m);
  assert.equal(fs.existsSync(f.metaPath), false);
});

test('--write creates absent meta and refuses overwrite unless --replace is explicit', () => {
  const f = fixture();
  const first = run(GENERATOR, ['--bundle', f.bundlePath, '--write'], f.root);
  assert.equal(first.status, 0, first.stderr);
  assert.equal(JSON.parse(first.stdout).written, true);
  const generated = fs.readFileSync(f.metaPath, 'utf8');

  fs.writeFileSync(f.metaPath, 'keep me');
  const refused = run(GENERATOR, ['--bundle', f.bundlePath, '--write'], f.root);
  assert.equal(refused.status, 1);
  assert.equal(JSON.parse(refused.stdout).valid, false);
  assert.equal(fs.readFileSync(f.metaPath, 'utf8'), 'keep me');

  const replaced = run(GENERATOR, ['--bundle', f.bundlePath, '--write', '--replace'], f.root);
  assert.equal(replaced.status, 0, replaced.stderr);
  assert.equal(fs.readFileSync(f.metaPath, 'utf8'), generated);
});

test('generator reports usage and invalid bundles as JSON with consistent exit codes', () => {
  const usage = run(GENERATOR, [], ROOT);
  assert.equal(usage.status, 2);
  assert.equal(JSON.parse(usage.stdout).valid, false);

  const f = fixture({ keywords: [] });
  const invalid = run(GENERATOR, ['--bundle', f.bundlePath], f.root);
  assert.equal(invalid.status, 1);
  assert.equal(JSON.parse(invalid.stdout).valid, false);
});

test('verify-bundle remains valid before meta generation', () => {
  const f = fixture();
  const result = run(VERIFY, ['--bundle', f.bundlePath], f.root);
  assert.equal(result.status, 0, result.stdout);
  assert.equal(JSON.parse(result.stdout).valid, true);
});

test('verify-bundle exactly checks existing meta mechanical fields against bundle', () => {
  const f = fixture();
  assert.equal(run(GENERATOR, ['--bundle', f.bundlePath, '--write'], f.root).status, 0);
  const pass = run(VERIFY, ['--bundle', f.bundlePath], f.root);
  assert.equal(pass.status, 0, pass.stdout);

  const original = fs.readFileSync(f.metaPath, 'utf8');
  for (const [field, replacement] of [
    ['slug', 'wrong'], ['path', 'docs/wrong.html'], ['style', 'redswiss'],
    ['category', 'wrong'], ['source_url', 'https://wrong.example/'],
  ]) {
    fs.writeFileSync(f.metaPath, original.replace(new RegExp(`^${field}: .+$`, 'm'), `${field}: ${JSON.stringify(replacement)}`));
    const fail = run(VERIFY, ['--bundle', f.bundlePath], f.root);
    assert.equal(fail.status, 1, `${field}: ${fail.stdout}`);
    const body = JSON.parse(fail.stdout);
    assert.ok(body.errors.some((error) => error.field === `meta.${field}`), field);
  }
});

test('verify-bundle accepts YAML block arrays while checking mechanical fields', () => {
  const f = fixture();
  fs.mkdirSync(path.dirname(f.metaPath), { recursive: true });
  fs.writeFileSync(f.metaPath, [
    `slug: ${f.bundle.slug}`, `path: ${f.bundle.html_path}`, `style: ${f.bundle.style}`,
    `category: ${JSON.stringify(f.bundle.category)}`, `source_url: ${JSON.stringify(f.bundle.source_url)}`,
    'title: Agent2 title', 'desc: Agent2 desc', 'tags:', '  - one', '  - "two: three"', '',
  ].join('\n'));
  const result = run(VERIFY, ['--bundle', f.bundlePath], f.root);
  assert.equal(result.status, 0, result.stdout);
});

test('verify-bundle reports malformed existing meta as structured JSON', () => {
  const f = fixture();
  fs.mkdirSync(path.dirname(f.metaPath), { recursive: true });
  fs.writeFileSync(f.metaPath, 'slug: "unterminated\n');
  const result = run(VERIFY, ['--bundle', f.bundlePath], f.root);
  assert.equal(result.status, 1);
  const body = JSON.parse(result.stdout);
  assert.equal(body.valid, false);
  assert.ok(body.errors.some((error) => error.field === 'meta'));
});

test('verify-bundle uses repository YAML semantics for comments, hashes, escaped quotes, and arrays', () => {
  const f = fixture();
  fs.mkdirSync(path.dirname(f.metaPath), { recursive: true });
  fs.writeFileSync(f.metaPath, [
    `slug: ${f.bundle.slug} # generated`,
    `path: "${f.bundle.html_path}" # generated`,
    `style: '${f.bundle.style}'`,
    `category: "开发工具: Agent" # comment`,
    `source_url: 'https://example.com/a?q=x:y&quote="yes"' # comment`,
    'title: "Agent \\"Two\\" # literal"',
    'tags:', '  - one', '  - "two # literal"', '',
  ].join('\n'));
  const result = run(VERIFY, ['--bundle', f.bundlePath], f.root);
  assert.equal(result.status, 0, result.stdout);
});

test('verify-bundle rejects duplicate mechanical keys before YAML parsing', () => {
  const f = fixture();
  fs.mkdirSync(path.dirname(f.metaPath), { recursive: true });
  fs.writeFileSync(f.metaPath, [
    'slug: wrong', `slug: ${f.bundle.slug}`, `path: ${f.bundle.html_path}`,
    `style: ${f.bundle.style}`, `category: ${f.bundle.category}`,
    `source_url: ${f.bundle.source_url}`, '',
  ].join('\n'));
  const result = run(VERIFY, ['--bundle', f.bundlePath], f.root);
  assert.equal(result.status, 1, result.stdout);
  assert.match(JSON.parse(result.stdout).errors[0].message, /duplicate mechanical key.*slug/i);
});

test('generator refuses an external symlinked parent and leaves external files untouched', () => {
  const f = fixture();
  const external = fs.mkdtempSync(path.join(os.tmpdir(), 'generate-card-meta-external-'));
  fixtureRoots.add(external);
  fs.symlinkSync(external, path.join(f.root, 'docs'));
  const sentinel = path.join(external, path.basename(f.metaPath));
  fs.writeFileSync(sentinel, 'external sentinel');
  const result = run(GENERATOR, ['--bundle', f.bundlePath, '--write', '--replace'], f.root);
  assert.equal(result.status, 1, result.stdout);
  assert.equal(fs.readFileSync(sentinel, 'utf8'), 'external sentinel');
});

test('generator refuses an external symlink target and leaves it untouched', () => {
  const f = fixture();
  const external = fs.mkdtempSync(path.join(os.tmpdir(), 'generate-card-meta-target-'));
  fixtureRoots.add(external);
  fs.mkdirSync(path.dirname(f.metaPath), { recursive: true });
  const sentinel = path.join(external, 'sentinel.yaml');
  fs.writeFileSync(sentinel, 'external target');
  fs.symlinkSync(sentinel, f.metaPath);
  const result = run(GENERATOR, ['--bundle', f.bundlePath, '--write', '--replace'], f.root);
  assert.equal(result.status, 1, result.stdout);
  assert.equal(fs.readFileSync(sentinel, 'utf8'), 'external target');
  assert.equal(fs.lstatSync(f.metaPath).isSymbolicLink(), true);
});

test('atomic create failure after fsync leaves no final metadata file', () => {
  const f = fixture();
  const result = run(GENERATOR, ['--bundle', f.bundlePath, '--write'], f.root, {
    SAFE_META_WRITE_FAIL_AFTER_FSYNC: '1',
  });
  assert.equal(result.status, 1, result.stdout);
  assert.equal(fs.existsSync(f.metaPath), false);
  assert.deepEqual(fs.readdirSync(path.dirname(f.metaPath)), []);
});

test('descriptor traversal resists parent component swap race', () => {
  const f = fixture({ meta_path: 'docs/nested/card.meta.yaml' });
  fs.mkdirSync(path.join(f.root, 'docs', 'nested'), { recursive: true });
  const external = fs.mkdtempSync(path.join(os.tmpdir(), 'generate-card-meta-swap-'));
  fixtureRoots.add(external);
  const result = run(GENERATOR, ['--bundle', f.bundlePath, '--write'], f.root, {
    SAFE_META_WRITE_SWAP_COMPONENT: 'docs',
  });
  assert.equal(result.status, 1, result.stdout);
  assert.equal(fs.existsSync(path.join(external, 'nested', 'card.meta.yaml')), false);
  assert.equal(fs.existsSync(f.metaPath), false);
});

test('--replace without --write rejected usage error', () => {
  const f = fixture();
  const result = run(GENERATOR, ['--bundle', f.bundlePath, '--replace'], f.root);
  assert.equal(result.status, 2);
  assert.equal(JSON.parse(result.stdout).valid, false);
});
