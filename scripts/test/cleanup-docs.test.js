'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const SCRIPT = path.join(ROOT, 'scripts/cleanup-docs.js');
const NOW = '2026-08-20T00:00:00.000Z';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const FIXTURES = [];

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanup-docs-'));
  FIXTURES.push(root);
  return root;
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function makeDocsRoot(root) {
  return mkdirp(path.join(root, '.docs'));
}

function makeOldDir(docsRoot, name, offsetMs = 0) {
  const dir = mkdirp(path.join(docsRoot, name));
  fs.writeFileSync(path.join(dir, 'note.txt'), name + '\n');
  const mtime = new Date(Date.parse(NOW) - SEVEN_DAYS_MS + offsetMs);
  fs.utimesSync(dir, mtime, mtime);
  return dir;
}

function run(args, options = {}) {
  const result = spawnSync(process.execPath, [SCRIPT].concat(args), {
    cwd: options.cwd || ROOT,
    encoding: 'utf8',
  });
  let json = null;
  if (result.stdout.trim()) {
    json = JSON.parse(result.stdout);
  }
  return { ...result, json };
}

function names(items) {
  return items.map((item) => item.name);
}

test.after(() => {
  for (const root of FIXTURES.reverse()) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('dry-run reports old direct child directories without deleting them', () => {
  /**
   * Given：.docs 下同时存在过期直接子目录、普通文件和较新的目录。
   * When：默认 dry-run 执行清理 CLI。
   * Then：只报告过期目录，不删除任何内容。
   * 防回归：防止默认模式误删真实 .docs 内容，或把文件当目录处理。
   */
  const root = fixture();
  const docsRoot = makeDocsRoot(root);
  const oldDir = makeOldDir(docsRoot, 'old-card');
  makeOldDir(docsRoot, 'new-card', 1000);
  fs.writeFileSync(path.join(docsRoot, 'plain-file.md'), 'keep\n');

  const result = run(['--repo-root', root, '--now', NOW]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.json.ok, true);
  assert.equal(result.json.mode, 'dry-run');
  assert.deepEqual(names(result.json.candidates), ['old-card']);
  assert.deepEqual(names(result.json.deleted), []);
  assert.equal(fs.existsSync(oldDir), true);
  assert.equal(fs.existsSync(path.join(docsRoot, 'plain-file.md')), true);
});

test('apply deletes old direct child directories and keeps the .docs root', () => {
  /**
   * Given：.docs 下只有一个达到七天阈值的直接子目录。
   * When：带 --apply 执行清理 CLI。
   * Then：候选目录被删除，但 .docs 根目录仍然存在。
   * 防回归：清理逻辑只能删除候选子目录，不能删除 .docs 根本身。
   */
  const root = fixture();
  const docsRoot = makeDocsRoot(root);
  const oldDir = makeOldDir(docsRoot, 'old-card');

  const result = run(['--repo-root', root, '--now', NOW, '--apply']);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.json.mode, 'apply');
  assert.deepEqual(names(result.json.deleted), ['old-card']);
  assert.equal(fs.existsSync(oldDir), false);
  assert.equal(fs.existsSync(docsRoot), true);
});

test('time boundary includes directories whose mtime is exactly seven days old', () => {
  /**
   * Given：一个目录 mtime 正好等于七天阈值，另一个目录比阈值新 1 秒。
   * When：执行 dry-run 扫描。
   * Then：正好七天的目录进入候选，较新的目录被跳过。
   * 防回归：避免边界条件从 >= 七天退化成 > 七天或受当前系统时间影响。
   */
  const root = fixture();
  const docsRoot = makeDocsRoot(root);
  makeOldDir(docsRoot, 'exactly-seven-days');
  makeOldDir(docsRoot, 'one-second-newer', 1000);

  const result = run(['--repo-root', root, '--now', NOW]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(names(result.json.candidates), ['exactly-seven-days']);
  assert.ok(result.json.skipped.some((item) => item.name === 'one-second-newer' && item.reason === 'too-new'));
});

test('custom retention days changes the cleanup threshold', () => {
  /**
   * Given：保留天数被缩短为 1 天，且目录 mtime 处于 2 天前与 12 小时前。
   * When：执行 dry-run 扫描。
   * Then：只有超过 1 天的目录进入候选。
   * 防回归：确保 retention 参数真的参与年龄判断，而不是被忽略。
   */
  const root = fixture();
  const docsRoot = makeDocsRoot(root);
  const oldDir = makeOldDir(docsRoot, 'two-days-old', 5 * 24 * 60 * 60 * 1000);
  const freshDir = makeOldDir(docsRoot, 'half-day-old', 6.5 * 24 * 60 * 60 * 1000);

  const result = run(['--repo-root', root, '--days', '1', '--now', NOW]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(names(result.json.candidates), ['two-days-old']);
  assert.equal(fs.existsSync(oldDir), true);
  assert.equal(fs.existsSync(freshDir), true);
});

test('missing and empty .docs roots produce stable empty summaries', () => {
  /**
   * Given：一个仓库没有 .docs 根目录，另一个仓库有空的 .docs 根目录。
   * When：分别执行清理 CLI。
   * Then：两者都成功返回空摘要，不创建或删除任何目录。
   * 防回归：缺失根目录不能被当成失败，也不能隐式创建 .docs。
   */
  const missingRoot = path.join(fixture(), '.docs');
  const emptyRoot = makeDocsRoot(fixture());

  const missing = run(['--repo-root', path.dirname(missingRoot), '--now', NOW]);
  const empty = run(['--repo-root', path.dirname(emptyRoot), '--now', NOW]);

  assert.equal(missing.status, 0, missing.stderr);
  assert.equal(missing.json.root_exists, false);
  assert.deepEqual(missing.json.summary, { scanned: 0, candidates: 0, deleted: 0, skipped: 0, failed: 0, reclaimed_bytes: 0 });
  assert.equal(fs.existsSync(missingRoot), false);

  assert.equal(empty.status, 0, empty.stderr);
  assert.equal(empty.json.root_exists, true);
  assert.deepEqual(empty.json.summary, { scanned: 0, candidates: 0, deleted: 0, skipped: 0, failed: 0, reclaimed_bytes: 0 });
});

test('candidate order is stable by child directory name', () => {
  /**
   * Given：.docs 下存在多个过期直接子目录，创建顺序不是字典序。
   * When：执行 dry-run 扫描。
   * Then：候选摘要按目录名稳定排序。
   * 防回归：避免不同文件系统 readdir 顺序导致测试和人工审阅结果漂移。
   */
  const root = fixture();
  const docsRoot = makeDocsRoot(root);
  makeOldDir(docsRoot, 'z-card');
  makeOldDir(docsRoot, 'a-card');
  makeOldDir(docsRoot, 'm-card');

  const result = run(['--repo-root', root, '--now', NOW]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(names(result.json.candidates), ['a-card', 'm-card', 'z-card']);
});

test('apply with more than ten candidates requires explicit bulk confirmation', () => {
  /**
   * Given：.docs 下有 11 个达到删除条件的直接子目录。
   * When：先不带 bulk 确认执行 --apply，再带精确确认执行。
   * Then：第一次拒绝且不删除，第二次才删除所有候选。
   * 防回归：避免大批量删除绕过额外人工确认门禁。
   */
  const root = fixture();
  const docsRoot = makeDocsRoot(root);
  for (let index = 0; index < 11; index += 1) {
    makeOldDir(docsRoot, 'old-' + String(index).padStart(2, '0'));
  }

  const blocked = run(['--repo-root', root, '--now', NOW, '--apply']);

  assert.equal(blocked.status, 2);
  assert.equal(blocked.json.ok, false);
  assert.equal(blocked.json.bulk_confirmation_required, true);
  assert.equal(fs.existsSync(path.join(docsRoot, 'old-00')), true);

  const accepted = run(['--repo-root', root, '--now', NOW, '--apply', '--bulk-confirm', 'cleanup-docs-bulk']);

  assert.equal(accepted.status, 0, accepted.stderr);
  assert.equal(accepted.json.bulk_confirmation_required, false);
  assert.equal(accepted.json.deleted.length, 11);
  assert.equal(fs.readdirSync(docsRoot).length, 0);
});

test('symlink children are skipped safely', (t) => {
  /**
   * Given：.docs 直接子项中包含指向外部目录的 symlink。
   * When：带 --apply 执行清理 CLI。
   * Then：symlink 和外部目标都不被删除，并在 skipped 中标注。
   * 防回归：避免清理逻辑沿链接越界删除真实资料。
   */
  const root = fixture();
  const docsRoot = makeDocsRoot(root);
  const outside = mkdirp(path.join(root, 'outside-target'));
  fs.writeFileSync(path.join(outside, 'keep.txt'), 'keep\n');
  const link = path.join(docsRoot, 'symlink-child');
  try {
    fs.symlinkSync(outside, link, 'dir');
  } catch (error) {
    if (!['EPERM', 'EACCES'].includes(error.code)) {
      throw error;
    }
    t.skip('当前环境不允许创建 symlink fixture');
    return;
  }

  const result = run(['--repo-root', root, '--now', NOW, '--apply']);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(names(result.json.deleted), []);
  assert.ok(result.json.skipped.some((item) => item.name === path.basename(link) && item.reason === 'link-or-reparse'));
  assert.equal(fs.existsSync(link), true);
  assert.equal(fs.existsSync(path.join(outside, 'keep.txt')), true);
});

test('available Windows junction or reparse-point children are skipped safely', (t) => {
  /**
   * Given：Windows 上 .docs 直接子项中包含指向外部目录的 Junction/reparse point。
   * When：带 --apply 执行清理 CLI。
   * Then：Junction/reparse point 和外部目标都不被删除，并在 skipped 中标注。
   * 防回归：避免把 Junction 当普通目录递归删除，导致越界清理。
   */
  if (process.platform !== 'win32') {
    t.skip('Junction/reparse point fixture 仅在 Windows 上创建');
    return;
  }
  const root = fixture();
  const docsRoot = makeDocsRoot(root);
  const outside = mkdirp(path.join(root, 'outside-junction-target'));
  fs.writeFileSync(path.join(outside, 'keep.txt'), 'keep\n');
  const junction = path.join(docsRoot, 'junction-child');
  try {
    fs.symlinkSync(outside, junction, 'junction');
  } catch (error) {
    if (!['EPERM', 'EACCES'].includes(error.code)) {
      throw error;
    }
    t.skip('当前 Windows 环境不允许创建 Junction/reparse point fixture');
    return;
  }

  const result = run(['--repo-root', root, '--now', NOW, '--apply']);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(names(result.json.deleted), []);
  assert.ok(result.json.skipped.some((item) => item.name === path.basename(junction) && item.reason === 'link-or-reparse'));
  assert.equal(fs.existsSync(junction), true);
  assert.equal(fs.existsSync(path.join(outside, 'keep.txt')), true);
});
