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
const { fixedWorktreeRoot } = require(path.join(ROOT, 'scripts/lib/infocard-worktree.js'));

const FIXTURE_ROOTS = [];

function git(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function fixture() {
  fs.mkdirSync(fixedWorktreeRoot(), { recursive: true });
  const root = fs.mkdtempSync(path.join(fixedWorktreeRoot(), 'publish-local-gate-'));
  FIXTURE_ROOTS.push(root);
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

test.after(() => {
  for (const root of FIXTURE_ROOTS.reverse()) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

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
  /**
   * Given：bundle.repository.root 是发布 worktree 的唯一运行时根目录。
   * When：命令不在声明目录运行，或 root 使用相对路径。
   * Then：prebuild 必须拒绝，避免同一 bundle 在不同 CWD 指向不同目录。
   * 防回归：防止发布流程重新混用主仓库与 publish worktree。
   */
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

test('prebuild rejects repo-local worktrees outside the fixed temp infocard-worktree root', () => {
  /**
   * Given：新协议要求发布 worktree 只允许放在系统 temp/infocard-worktree 下。
   * When：bundle.repository.root 指向仓库内 wt-* 旧路径。
   * Then：prebuild 必须拒绝该路径。
   * 防回归：阻止再次在主仓库下创建 gitlink 风险目录或散落历史 WT。
   */
  const f = fixture();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-local-gate-outside-'));
  git(outside, ['init', '-q']);
  const bundle = JSON.parse(fs.readFileSync(path.join(f.root, 'bundle.json'), 'utf8'));
  bundle.repository.root = outside;
  fs.writeFileSync(path.join(outside, 'bundle.json'), JSON.stringify(bundle));
  const result = run(outside, 'bundle.json');

  assert.notEqual(result.status, 0);
  assert.ok(result.json.errors.some((error) => error.field === 'repository.root'));
});

test('prebuild allows an explicit user-supplied external recovery worktree policy', () => {
  /**
   * Given：兼容性要求允许用户显式指定既有外部 recovery worktree。
   * When：bundle.repository.root 在固定 temp 根目录外，但声明 root_policy=external-user-supplied。
   * Then：prebuild 可以继续执行普通 worktree 与 sidecar 校验。
   * 防回归：固定路径规则不能误伤用户明确给出的接管场景。
   */
  const f = fixture();
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-local-gate-external-'));
  git(outside, ['init', '-q']);
  git(outside, ['config', 'user.email', 'test@example.com']);
  git(outside, ['config', 'user.name', 'Test']);
  fs.cpSync(f.root, outside, { recursive: true, force: true });
  const bundle = JSON.parse(fs.readFileSync(path.join(outside, 'bundle.json'), 'utf8'));
  bundle.repository.root = outside;
  bundle.repository.root_policy = 'external-user-supplied';
  fs.writeFileSync(path.join(outside, 'bundle.json'), JSON.stringify(bundle));
  git(outside, ['add', '.']);
  git(outside, ['commit', '-qm', 'external fixture']);

  const result = run(outside, 'bundle.json');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.json.valid, true);
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
