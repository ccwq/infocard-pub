'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const SCRIPT = path.join(ROOT, 'scripts/stage-publish-batch.js');

function git(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}
function write(root, name, text = 'x') {
  const target = path.join(root, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text);
}
function bundle(slug = 'boat') {
  return { slug, html_path: `docs/20260711-${slug}.html`, meta_path: `docs/20260711-${slug}.html.meta.yaml`, asset_dir: `assets/img/${slug}`, manifest_path: `assets/img/${slug}/manifest.json`, source_url: 'https://example.com/source', style: 'darkblue', category: '测试', keywords: ['test'], wiki: { raw_path: 'raw/x.md', knowledge_path: 'concepts/x.md' } };
}
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stage-publish-batch-'));
  git(root, ['init', '-q']); git(root, ['config', 'user.email', 'test@example.com']); git(root, ['config', 'user.name', 'Test']);
  write(root, '.gitignore', '.hermes/\n'); git(root, ['add', '.gitignore']); git(root, ['commit', '-qm', 'initial']);
  return root;
}
function makeBundle(root, slug = 'boat') {
  const value = bundle(slug); const file = `.publish/${slug}.json`;
  write(root, file, JSON.stringify(value));
  write(root, value.html_path, '<html>card</html>'); write(root, value.meta_path, 'slug: boat\n');
  write(root, `${value.asset_dir}/manifest.json`, '{}'); write(root, `${value.asset_dir}/nested/image.png`, 'png');
  return file;
}
function run(root, args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: root, encoding: 'utf8' });
  return { ...result, json: JSON.parse(result.stdout) };
}
function staged(root) { return git(root, ['diff', '--cached', '--name-only']).trim().split('\n').filter(Boolean).sort(); }

test('dry run reports exact changed bundle files and leaves index untouched', () => {
  const root = fixture(); const file = makeBundle(root); write(root, 'assets/img/rowboat/adjacent.png'); write(root, 'notes.txt');
  const before = git(root, ['write-tree']); const result = run(root, ['--bundle', file]);
  assert.equal(result.status, 0, result.stderr); assert.equal(result.json.ok, true);
  assert.deepEqual(result.json.allowed_changes.sort(), ['assets/img/boat/manifest.json', 'assets/img/boat/nested/image.png', 'docs/20260711-boat.html', 'docs/20260711-boat.html.meta.yaml'].sort());
  assert.deepEqual(result.json.unrelated_changes.sort(), ['.publish/boat.json', 'assets/img/rowboat/adjacent.png', 'notes.txt'].sort());
  assert.equal(git(root, ['write-tree']), before); assert.deepEqual(staged(root), []);
});

test('stage adds only exact allowlisted files and keeps adjacent and unrelated files unstaged', () => {
  const root = fixture(); const file = makeBundle(root); write(root, 'assets/img/rowboat/adjacent.png'); write(root, 'unrelated.txt');
  const result = run(root, ['--bundle', file, '--stage']);
  assert.equal(result.status, 0, result.stderr); assert.deepEqual(staged(root), ['assets/img/boat/manifest.json', 'assets/img/boat/nested/image.png', 'docs/20260711-boat.html', 'docs/20260711-boat.html.meta.yaml']);
  assert.ok(result.json.unrelated_changes.includes('unrelated.txt')); assert.ok(!staged(root).includes('assets/img/rowboat/adjacent.png'));
});

test('stages an allowlisted tracked deletion by exact path without staging unrelated files', () => {
  const root = fixture(); const file = makeBundle(root); const tracked = bundle().html_path;
  git(root, ['add', 'docs', 'assets']); git(root, ['commit', '-qm', 'track bundle outputs']);
  fs.rmSync(path.join(root, tracked)); write(root, 'unrelated.txt');
  const result = run(root, ['--bundle', file, '--stage']);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.json.allowed_changes.includes(tracked));
  assert.ok(result.json.staged_changes.includes(tracked));
  assert.deepEqual(git(root, ['diff', '--cached', '--name-status']).trim().split('\n'), [`D\t${tracked}`]);
  assert.deepEqual(staged(root), [tracked]);
  assert.ok(result.json.unrelated_changes.includes('unrelated.txt'));
});

test('rejects a rename from an unrelated source to an allowlisted destination without changing the index', () => {
  const root = fixture(); const file = makeBundle(root); const destination = bundle().html_path;
  write(root, 'docs/unrelated.html', 'source'); git(root, ['add', 'docs/unrelated.html']); git(root, ['commit', '-qm', 'track unrelated source']);
  fs.rmSync(path.join(root, destination)); git(root, ['mv', 'docs/unrelated.html', destination]);
  const before = git(root, ['diff', '--cached', '--raw', '-z']); const result = run(root, ['--bundle', file, '--stage']);
  assert.equal(result.status, 1); assert.equal(result.json.error, 'rename/copy changes are unsupported; stage as explicit delete/add');
  assert.deepEqual(result.json.unsafe_status, [{ type: 'rename_or_copy', source: 'docs/unrelated.html', destination }]);
  assert.equal(git(root, ['diff', '--cached', '--raw', '-z']), before);
});

test('rejects a rename between two allowlisted paths without changing the index or staging it', () => {
  const root = fixture(); const file = makeBundle(root); const source = bundle().html_path; const destination = 'assets/img/boat/renamed.html';
  git(root, ['add', 'docs', 'assets']); git(root, ['commit', '-qm', 'track bundle outputs']);
  git(root, ['mv', source, destination]);
  const before = git(root, ['diff', '--cached', '--raw', '-z']); const result = run(root, ['--bundle', file, '--stage']);
  assert.equal(result.status, 1); assert.equal(result.json.error, 'rename/copy changes are unsupported; stage as explicit delete/add');
  assert.deepEqual(result.json.unsafe_status, [{ type: 'rename_or_copy', source, destination }]);
  assert.equal(git(root, ['diff', '--cached', '--raw', '-z']), before);
});

test('rejects an allowlisted unmerged conflict without changing its unmerged index entries', () => {
  const root = fixture(); const file = makeBundle(root); const conflicted = bundle().html_path;
  git(root, ['add', conflicted]); git(root, ['commit', '-qm', 'track bundle html']);
  git(root, ['checkout', '-qb', 'other']); write(root, conflicted, 'other'); git(root, ['commit', '-am', 'other change']);
  git(root, ['checkout', '-q', 'master']); write(root, conflicted, 'main'); git(root, ['commit', '-am', 'main change']);
  const merge = spawnSync('git', ['merge', 'other'], { cwd: root, encoding: 'utf8' }); assert.notEqual(merge.status, 0);
  const before = git(root, ['ls-files', '-u', '-z']); const result = run(root, ['--bundle', file, '--stage']);
  assert.equal(result.status, 1); assert.equal(result.json.error, 'unsafe unmerged git state');
  assert.ok(result.json.unsafe_status.some((entry) => entry.type === 'unmerged' && entry.file === conflicted));
  assert.equal(git(root, ['ls-files', '-u', '-z']), before);
});

/**
 * Given：仓库中已有与本次信息卡无关的 staged 文件
 * When：发布脚本按 bundle 精确暂存本次输出
 * Then：既有 staged 文件保持不变，本次输出同时进入 index，并分别报告两类路径
 * 防回归：避免为了发布信息卡而要求清空、重置或改写用户已有的 index 状态
 */
test('preserves unrelated staged files while staging only the publish allowlist', () => {
  const root = fixture(); const file = makeBundle(root); write(root, 'already-staged.txt'); git(root, ['add', 'already-staged.txt']);
  const result = run(root, ['--bundle', file, '--stage']);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.json.preexisting_staged, ['already-staged.txt']);
  assert.deepEqual(result.json.unexpected_staged, []);
  assert.deepEqual(result.json.staged_changes, [
    'assets/img/boat/manifest.json',
    'assets/img/boat/nested/image.png',
    'docs/20260711-boat.html',
    'docs/20260711-boat.html.meta.yaml',
  ]);
  assert.deepEqual(staged(root), ['already-staged.txt', ...result.json.staged_changes].sort());
});

test('handles multiple bundles and only permits generated index outputs when both are changed', () => {
  const root = fixture(); const first = makeBundle(root, 'boat'); const second = makeBundle(root, 'ship');
  write(root, 'docs/20260711-ship.html.meta.yaml', 'slug: ship\n'); write(root, '_index.yaml', 'generated'); write(root, 'index.html', 'generated');
  const result = run(root, ['--bundle', first, '--bundle', second, '--stage']);
  assert.equal(result.status, 0, result.stderr); assert.ok(staged(root).includes('_index.yaml')); assert.ok(staged(root).includes('index.html')); assert.ok(staged(root).includes('assets/img/ship/nested/image.png'));
});

test('rejects symlinked asset escapes and leaves index unchanged', { skip: process.platform === 'win32' }, () => {
  const root = fixture(); const file = makeBundle(root); const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'stage-outside-'));
  fs.rmSync(path.join(root, 'assets/img/boat'), { recursive: true }); fs.symlinkSync(outside, path.join(root, 'assets/img/boat'));
  const result = run(root, ['--bundle', file, '--stage']);
  assert.equal(result.status, 1); assert.equal(result.json.ok, false); assert.deepEqual(staged(root), []);
});

test('usage errors return structured JSON with exit code 2', () => {
  const root = fixture(); const result = run(root, ['--bundle']);
  assert.equal(result.status, 2); assert.equal(result.json.ok, false);
});

test('root-traversing bundle paths fail closed', () => {
  const root = fixture(); const result = run(root, ['--bundle', '../escape.json']);
  assert.equal(result.status, 1); assert.equal(result.json.ok, false);
});
