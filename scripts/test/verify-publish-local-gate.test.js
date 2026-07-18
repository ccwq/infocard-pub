'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const SCRIPT = path.join(ROOT, 'scripts/verify-publish-local-gate.js');
const yaml = require(path.join(ROOT, 'assets/home/vendor/js-yaml.min.js'));

function git(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-local-gate-'));
  git(root, ['init', '-q']);
  git(root, ['config', 'user.email', 'test@example.com']);
  git(root, ['config', 'user.name', 'Test']);
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  const htmlPath = 'docs/20260718-boat.html';
  const metaPath = `${htmlPath}.meta.yaml`;
  const meta = {
    slug: 'boat', path: htmlPath, category: '测试', title: '测试卡片', desc: '这是完整中文摘要。',
    date: '2026-07-18 12:00:00', updated: '2026-07-18 12:00:00', tags: ['测试'],
  };
  fs.writeFileSync(path.join(root, htmlPath), '<!doctype html><title>boat</title>');
  fs.writeFileSync(path.join(root, metaPath), yaml.dump(meta));
  const indexData = { cards: [{ slug: meta.slug, path: meta.path, title: meta.title, desc: meta.desc }] };
  fs.writeFileSync(path.join(root, '_index.yaml'), yaml.dump(indexData));
  fs.writeFileSync(path.join(root, 'index.html'), `<script id="home-index-data" type="application/json">\n${JSON.stringify(indexData)}\n</script>`);
  const bundle = {
    slug: 'boat', html_path: htmlPath, meta_path: metaPath,
    asset_dir: 'assets/img/boat', manifest_path: 'assets/img/boat/manifest.json',
    source_url: 'https://example.com/source', style: 'darkblue', category: '测试', keywords: ['测试'],
    wiki: { raw_path: 'raw/boat.md', knowledge_path: 'concepts/boat.md' },
    repository: { root },
  };
  fs.writeFileSync(path.join(root, 'bundle.json'), JSON.stringify(bundle));
  git(root, ['add', '.']); git(root, ['commit', '-qm', 'fixture']);
  return { root, bundle, metaPath };
}

function run(cwd, bundlePath, phase = 'prebuild') {
  const result = spawnSync(process.execPath, [SCRIPT, '--bundle', bundlePath, '--phase', phase], { cwd, encoding: 'utf8' });
  return { ...result, json: JSON.parse(result.stdout) };
}

test('prebuild accepts a declared current worktree and strict sidecar', () => {
  const f = fixture();
  const result = run(f.root, 'bundle.json');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.json.valid, true);
  assert.equal(result.json.phase, 'prebuild');
});

test('prebuild blocks execution outside declared worktree and rejects relative roots', () => {
  const f = fixture();
  const result = run(os.tmpdir(), path.join(f.root, 'bundle.json'));
  assert.notEqual(result.status, 0);
  assert.ok(result.json.errors.some((error) => error.field === 'repository.root'));

  const bundle = JSON.parse(fs.readFileSync(path.join(f.root, 'bundle.json'), 'utf8'));
  bundle.repository.root = '.';
  fs.writeFileSync(path.join(f.root, 'relative-root.json'), JSON.stringify(bundle));
  const relative = run(f.root, 'relative-root.json');
  assert.notEqual(relative.status, 0);
  assert.ok(relative.json.errors.some((error) => error.field === 'repository.root'));
});

test('prebuild rejects a sidecar with multiple YAML documents or missing required fields', () => {
  const f = fixture();
  fs.appendFileSync(path.join(f.root, f.metaPath), '\n---\nnote: second document\n');
  const result = run(f.root, 'bundle.json');
  assert.notEqual(result.status, 0);
  assert.ok(result.json.errors.some((error) => error.field === 'meta'));

  const g = fixture();
  fs.writeFileSync(path.join(g.root, g.metaPath), 'slug: boat\npath: docs/20260718-boat.html\n');
  const missing = run(g.root, 'bundle.json');
  assert.notEqual(missing.status, 0);
  assert.ok(missing.json.errors.some((error) => error.field === 'meta.title'));
});

test('postbuild requires target slug in both generated public indexes', () => {
  const f = fixture();
  const pass = run(f.root, 'bundle.json', 'postbuild');
  assert.equal(pass.status, 0, pass.stderr);
  const preCdn = run(f.root, 'bundle.json', 'pre-cdn');
  assert.equal(preCdn.status, 0, preCdn.stderr);

  fs.writeFileSync(path.join(f.root, 'index.html'), '<!-- boat -->');
  const fail = run(f.root, 'bundle.json', 'postbuild');
  assert.notEqual(fail.status, 0);
  assert.ok(fail.json.errors.some((error) => error.field === 'index.html'));

  const g = fixture();
  fs.writeFileSync(path.join(g.root, '_index.yaml'), yaml.dump({ cards: [{ slug: 'boat', path: 'docs/wrong.html', title: '', desc: '' }] }));
  const mismatch = run(g.root, 'bundle.json', 'postbuild');
  assert.notEqual(mismatch.status, 0);
  for (const field of ['_index.yaml.path', '_index.yaml.title', '_index.yaml.desc']) {
    assert.ok(mismatch.json.errors.some((error) => error.field === field), field);
  }
});

test('cleanup refuses dirty worktrees', () => {
  const f = fixture();
  fs.writeFileSync(path.join(f.root, 'unfinished.txt'), 'keep');
  const result = run(f.root, 'bundle.json', 'cleanup');
  assert.notEqual(result.status, 0);
  assert.ok(result.json.errors.some((error) => error.field === 'git.status'));
});

test('requires repository.root and a known phase', () => {
  const f = fixture();
  const bundle = JSON.parse(fs.readFileSync(path.join(f.root, 'bundle.json'), 'utf8'));
  delete bundle.repository;
  fs.writeFileSync(path.join(f.root, 'missing-root.json'), JSON.stringify(bundle));
  const missing = run(f.root, 'missing-root.json');
  assert.notEqual(missing.status, 0);
  assert.ok(missing.json.errors.some((error) => error.field === 'repository.root'));

  const unknown = run(f.root, 'bundle.json', 'wrong');
  assert.equal(unknown.status, 2);
  assert.ok(unknown.json.errors.some((error) => error.field === 'phase'));
});
