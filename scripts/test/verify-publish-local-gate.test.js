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
<<<<<<< HEAD
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-primary-gate-'));
=======
  fs.mkdirSync(fixedWorktreeRoot(), { recursive: true });
  const root = fs.mkdtempSync(path.join(fixedWorktreeRoot(), 'publish-local-gate-'));
  FIXTURE_ROOTS.push(root);
>>>>>>> c23d4d1f2ee3dd05cbbbeb57333bc2f5479e6fdf
  git(root, ['init', '-q']);
  git(root, ['config', 'user.email', 'test@example.com']);
  git(root, ['config', 'user.name', 'Test']);
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  const htmlPath = 'docs/20260718-boat.html';
  const metaPath = htmlPath + '.meta.yaml';
  const meta = {
    slug: 'boat', path: htmlPath, category: '测试', title: '测试卡片', desc: '这是完整中文摘要。',
    date: '2026-07-18 12:00:00', updated: '2026-07-18 12:00:00', tags: ['测试'],
  };
  fs.writeFileSync(path.join(root, htmlPath), '<!doctype html><title>boat</title>');
  fs.writeFileSync(path.join(root, metaPath), yaml.dump(meta));
  const indexData = { cards: [{ slug: meta.slug, path: meta.path, title: meta.title, desc: meta.desc }] };
  fs.writeFileSync(path.join(root, '_index.yaml'), yaml.dump(indexData));
  fs.writeFileSync(path.join(root, 'index.html'), '<script id="home-index-data" type="application/json">\n' + JSON.stringify(indexData) + '\n</script>');
  const bundle = {
    slug: 'boat', html_path: htmlPath, meta_path: metaPath,
    asset_dir: 'assets/img/boat', manifest_path: 'assets/img/boat/manifest.json',
    source_url: 'https://example.com/source', style: 'darkblue', category: '测试', keywords: ['测试'],
    wiki: { raw_path: 'raw/boat.md', knowledge_path: 'concepts/boat.md' },
  };
  fs.writeFileSync(path.join(root, 'bundle.json'), JSON.stringify(bundle));
  git(root, ['add', '.']);
  git(root, ['commit', '-qm', 'fixture']);
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

test('prebuild accepts the primary repository cwd and strict sidecar', () => {
  /**
   * Given：publish gate 在 primary repository 根目录运行，bundle 不再声明 dedicated worktree。
   * When：执行 prebuild gate。
   * Then：sidecar 严格校验通过，命令返回 valid=true。
   * 防回归：防止 gate 再次要求 temp/fixed dedicated worktree。
   */
  const f = fixture();
  const result = run(f.root, 'bundle.json');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.json.valid, true);
  assert.equal(result.json.phase, 'prebuild');
});

<<<<<<< HEAD
test('prebuild rejects execution outside the primary repository root', () => {
  /**
   * Given：bundle 属于一个 primary repository。
   * When：从 repo 外部 cwd 调用同一个 bundle。
   * Then：gate 拒绝运行，避免相对路径落到错误目录。
   * 防回归：迁移到 primary repo 后仍必须保留 cwd containment。
=======
test('prebuild blocks execution outside declared worktree and rejects relative roots', () => {
  /**
   * Given：bundle.repository.root 是发布 worktree 的唯一运行时根目录。
   * When：命令不在声明目录运行，或 root 使用相对路径。
   * Then：prebuild 必须拒绝，避免同一 bundle 在不同 CWD 指向不同目录。
   * 防回归：防止发布流程重新混用主仓库与 publish worktree。
>>>>>>> c23d4d1f2ee3dd05cbbbeb57333bc2f5479e6fdf
   */
  const f = fixture();
  const result = run(os.tmpdir(), path.join(f.root, 'bundle.json'));
  assert.notEqual(result.status, 0);
  assert.ok(result.json.errors.some((error) => error.field === 'repository.root'));
});

test('prebuild rejects bundle inputs loaded from .docs authoring space', () => {
  /**
   * Given：.docs/<card>/ 是 authoring source 草稿区。
   * When：把 publish gate 的 --bundle 指向 .docs 内文件。
   * Then：gate 拒绝该输入，只允许 primary repo 中的正式 bundle 输入。
   * 防回归：防止草稿区 bundle 绕过 promotion manifest。
   */
  const f = fixture();
  fs.mkdirSync(path.join(f.root, '.docs/boat'), { recursive: true });
  fs.copyFileSync(path.join(f.root, 'bundle.json'), path.join(f.root, '.docs/boat/bundle.json'));
  const result = run(f.root, '.docs/boat/bundle.json');
  assert.notEqual(result.status, 0);
  assert.ok(result.json.errors.some((error) => error.field === 'bundle'));
});

test('prebuild rejects formal publish outputs inside .docs', () => {
  /**
   * Given：formal outputs 必须在 .docs 外，并受 publish allowlist 约束。
   * When：bundle 把 HTML/meta 输出声明到 .docs。
   * Then：gate 拒绝该 bundle。
   * 防回归：防止 promotion 后的正式文件又写回 authoring source。
   */
  const f = fixture();
  const bundle = { ...f.bundle };
  bundle.html_path = '.docs/boat/docs/20260718-boat.html';
  bundle.meta_path = '.docs/boat/docs/20260718-boat.html.meta.yaml';
  fs.writeFileSync(path.join(f.root, 'docs-output.json'), JSON.stringify(bundle));
  const result = run(f.root, 'docs-output.json');
  assert.notEqual(result.status, 0);
  assert.ok(result.json.errors.some((error) => error.field === 'html_path'));
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
  /**
   * Given：每张发布卡必须只有一个 sidecar YAML document，且字段齐全。
   * When：sidecar 出现多文档或缺少 required meta 字段。
   * Then：prebuild gate 拒绝。
   * 防回归：保留迁移前已有的 sidecar 严格校验。
   */
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
  /**
   * Given：postbuild/pre-cdn gate 负责确认生成索引包含目标卡。
   * When：_index.yaml 或 index.html 缺失/错配目标条目。
   * Then：gate 拒绝。
   * 防回归：迁移到 primary repo 后不能放松 sidecar/index 严格校验。
   */
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

test('cleanup refuses dirty primary repositories', () => {
  /**
   * Given：cleanup phase 只能在发布结果干净时放行。
   * When：primary repository 有未提交改动。
   * Then：cleanup gate 拒绝。
   * 防回归：迁移后仍不能在 dirty repo 上执行后续清理判断。
   */
  const f = fixture();
  fs.writeFileSync(path.join(f.root, 'unfinished.txt'), 'keep');
  const result = run(f.root, 'bundle.json', 'cleanup');
  assert.notEqual(result.status, 0);
  assert.ok(result.json.errors.some((error) => error.field === 'git.status'));
});

test('requires a bundle and a known phase', () => {
  /**
   * Given：CLI 由上游流程按 phase 调用。
   * When：缺少 --bundle 或 phase 不在枚举内。
   * Then：返回稳定 JSON 错误与 exit code 2。
   * 防回归：上游脚本可以继续可靠解析 gate 失败原因。
   */
  const f = fixture();
  const missing = spawnSync(process.execPath, [SCRIPT], { cwd: f.root, encoding: 'utf8' });
  assert.equal(missing.status, 2);
  assert.ok(JSON.parse(missing.stdout).errors.some((error) => error.field === 'bundle'));

  const unknown = run(f.root, 'bundle.json', 'wrong');
  assert.equal(unknown.status, 2);
  assert.ok(unknown.json.errors.some((error) => error.field === 'phase'));
});
