'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const MODULE_PATH = path.join(ROOT, 'scripts/lib/infocard-worktree.js');
const CLI_PATH = path.join(ROOT, 'scripts/infocard-worktree.js');

function git(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function initRepo(dir) {
  fs.mkdirSync(dir, { recursive: true });
  git(dir, ['init', '-q']);
  git(dir, ['config', 'user.email', 'test@example.com']);
  git(dir, ['config', 'user.name', 'Test']);
  fs.writeFileSync(path.join(dir, 'README.md'), 'fixture\n');
  git(dir, ['add', 'README.md']);
  git(dir, ['commit', '-qm', 'fixture']);
}

test('resolveWorktreePath uses the fixed infocard-worktree directory under the system temp root', () => {
  /**
   * Given：发布流程需要在 Windows/Linux 间共享同一条 worktree 定位规则。
   * When：根据 run-id 与 slug 解析目标 worktree 路径。
   * Then：路径必须落在 os.tmpdir()/infocard-worktree 下，且名称被清洗为安全片段。
   * 防回归：禁止再次退回 repo-local wt-* 或散落的 /tmp/infocard-*。
   */
  const { fixedWorktreeRoot, resolveWorktreePath } = require(MODULE_PATH);
  const root = fixedWorktreeRoot();
  const resolved = resolveWorktreePath({ runId: '2026/08/20 10:30', slug: 'DeepSeek Harness!' });

  assert.equal(root, path.resolve(fs.realpathSync.native(os.tmpdir()), 'infocard-worktree'));
  assert.equal(path.dirname(resolved), root);
  assert.match(path.basename(resolved), /^2026-08-20-10-30-deepseek-harness$/);
});

test('isInsideFixedWorktreeRoot accepts only descendants of the fixed temp worktree root', () => {
  /**
   * Given：cleanup 授权只覆盖固定 temp/infocard-worktree 目录。
   * When：检查固定目录内、普通 temp 目录、仓库内 wt-* 三种路径。
   * Then：只有固定目录后代路径被接受。
   * 防回归：避免 del-rm 误删主仓库、用户外部 worktree 或普通临时目录。
   */
  const { fixedWorktreeRoot, isInsideFixedWorktreeRoot } = require(MODULE_PATH);
  const root = fixedWorktreeRoot();

  assert.equal(isInsideFixedWorktreeRoot(path.join(root, 'run-a')), true);
  assert.equal(isInsideFixedWorktreeRoot(root), false);
  assert.equal(isInsideFixedWorktreeRoot(path.join(os.tmpdir(), 'other-run')), false);
  assert.equal(isInsideFixedWorktreeRoot(path.join(ROOT, 'wt-example')), false);
});

test('listWorktrees classifies registered fixed-root worktrees and repo-local legacy worktrees', () => {
  /**
   * Given：历史运行可能同时存在新固定目录 worktree 与旧 repo-local wt-*。
   * When：扫描 git worktree list 与固定目录。
   * Then：固定目录 worktree 标记为 managed，repo-local worktree 标记为 external，不进入清理候选。
   * 防回归：报告历史 WT 时不再把所有注册 worktree 混成同一类。
   */
  const { fixedWorktreeRoot, listWorktrees } = require(MODULE_PATH);
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'infocard-worktree-list-'));
  const repo = path.join(base, 'repo');
  initRepo(repo);
  const managed = path.join(fixedWorktreeRoot(), `test-${process.pid}-managed`);
  const legacy = path.join(repo, 'wt-legacy');
  try {
    git(repo, ['worktree', 'add', '-q', managed, 'HEAD']);
    git(repo, ['worktree', 'add', '-q', legacy, 'HEAD']);

    const report = listWorktrees({ repo });
    const managedItem = report.worktrees.find((item) => path.basename(item.path) === path.basename(managed));
    const legacyItem = report.worktrees.find((item) => path.basename(item.path) === path.basename(legacy));

    assert.ok(managedItem);
    assert.equal(managedItem.scope, 'managed');
    assert.equal(managedItem.cleanup_candidate, true);
    assert.ok(legacyItem);
    assert.equal(legacyItem.scope, 'external');
    assert.equal(legacyItem.cleanup_candidate, false);
  } finally {
    spawnSync('git', ['-C', repo, 'worktree', 'remove', '--force', managed], { encoding: 'utf8' });
    spawnSync('git', ['-C', repo, 'worktree', 'remove', '--force', legacy], { encoding: 'utf8' });
  }
});

test('cleanupWorktrees requires exact del-rm and skips dirty worktrees', () => {
  /**
   * Given：用户要求回复 del-rm 才能清理，且脏 worktree 必须保留。
   * When：分别用错误口令和正确口令清理一个脏 managed worktree。
   * Then：错误口令不删除；正确口令仍因 dirty 跳过。
   * 防回归：避免大小写、附加文本或 force remove 绕过安全边界。
   */
  const { cleanupWorktrees, fixedWorktreeRoot } = require(MODULE_PATH);
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'infocard-worktree-clean-'));
  const repo = path.join(base, 'repo');
  initRepo(repo);
  const managed = path.join(fixedWorktreeRoot(), `test-${process.pid}-dirty`);
  try {
    git(repo, ['worktree', 'add', '-q', managed, 'HEAD']);
    fs.writeFileSync(path.join(managed, 'unfinished.txt'), 'keep\n');

    const rejected = cleanupWorktrees({ repo, confirm: 'DEL-RM' });
    assert.equal(rejected.authorized, false);
    assert.equal(fs.existsSync(managed), true);

    const accepted = cleanupWorktrees({ repo, confirm: 'del-rm' });
    assert.equal(accepted.authorized, true);
    assert.equal(accepted.removed.length, 0);
    assert.equal(accepted.skipped.some((item) => item.reason === 'dirty'), true);
    assert.equal(fs.existsSync(managed), true);
  } finally {
    spawnSync('git', ['-C', repo, 'worktree', 'remove', '--force', managed], { encoding: 'utf8' });
  }
});

test('CLI prints JSON for resolve and list', () => {
  /**
   * Given：发布 skill 和人工排查都需要稳定 CLI seam。
   * When：调用 resolve 与 list 子命令。
   * Then：stdout 输出可解析 JSON，且 resolve 返回固定根目录内路径。
   * 防回归：避免后续流程重新手写跨平台路径逻辑。
   */
  const { fixedWorktreeRoot } = require(MODULE_PATH);
  const resolved = spawnSync(process.execPath, [CLI_PATH, 'resolve', '--run-id', 'run1', '--slug', 'card-a'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(resolved.status, 0, resolved.stderr);
  const json = JSON.parse(resolved.stdout);
  assert.equal(path.dirname(json.path), fixedWorktreeRoot());

  const plain = spawnSync(process.execPath, [CLI_PATH, 'resolve', '--run-id', 'run1', '--slug', 'card-a', '--plain'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(plain.status, 0, plain.stderr);
  assert.equal(path.dirname(plain.stdout.trim()), fixedWorktreeRoot());

  const listed = spawnSync(process.execPath, [CLI_PATH, 'list', '--repo', ROOT], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(listed.status, 0, listed.stderr);
  assert.equal(JSON.parse(listed.stdout).root, fixedWorktreeRoot());
});
