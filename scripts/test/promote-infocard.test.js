'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const SCRIPT = path.join(ROOT, 'scripts/promote-infocard.js');
const { promoteInfocard } = require(path.join(ROOT, 'scripts/lib/infocard-promotion.js'));

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function writeFile(root, relativePath, content) {
  const absolute = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content);
  return sha256(Buffer.from(content));
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'promote-infocard-'));
  fs.mkdirSync(path.join(root, 'theme'), { recursive: true });
  fs.writeFileSync(path.join(root, 'theme', 'darkblue.html'), '<html></html>');
  const card = 'copy-card';
  const bundle = {
    slug: card,
    html_path: 'docs/20260820-copy-card.html',
    meta_path: 'docs/20260820-copy-card.html.meta.yaml',
    asset_dir: 'assets/img/copy-card',
    manifest_path: 'assets/img/copy-card/manifest.json',
    source_url: 'https://example.com/source',
    style: 'darkblue',
    category: '测试',
    keywords: ['copy'],
    wiki: { raw_path: 'raw/copy.md', knowledge_path: 'concepts/copy.md' },
  };
  const files = [
    { source: '.docs/' + card + '/docs/20260820-copy-card.html', destination: bundle.html_path, body: '<!doctype html><html data-theme="darkblue"><style>:root{--cyan:var(--accent)}body{color:var(--cyan)}</style><title>copy</title>' },
    { source: '.docs/' + card + '/docs/20260820-copy-card.html.meta.yaml', destination: bundle.meta_path, body: 'slug: copy-card\npath: docs/20260820-copy-card.html\nstyle: darkblue\n' },
    { source: '.docs/' + card + '/assets/img/copy-card/manifest.json', destination: bundle.manifest_path, body: '{"images":[]}' },
  ];
  const manifest = { card, bundle, files: files.map((file) => ({
    source: file.source,
    destination: file.destination,
    sha256: writeFile(root, file.source, file.body),
  })) };
  const manifestPath = path.join(root, '.docs/' + card + '/promotion-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return { root, card, bundle, manifest, manifestPath };
}

function runCli(cwd, manifestPath) {
  const result = spawnSync(process.execPath, [SCRIPT, '--manifest', manifestPath], { cwd, encoding: 'utf8' });
  return { ...result, json: JSON.parse(result.stdout) };
}

test('promotes only exact manifest files and verifies destination hashes', () => {
  /**
   * Given：promotion manifest 显式列出 source、destination 与 SHA-256。
   * When：执行 promotion。
   * Then：只复制声明文件，并在复制后复核目标 hash。
   * 防回归：禁止重新引入 wildcard whole-dir copy 或复制未声明草稿文件。
   */
  const f = fixture();
  writeFile(f.root, '.docs/' + f.card + '/docs/undeclared.html', 'draft only');

  const result = promoteInfocard({ root: f.root, manifestPath: f.manifestPath });

  assert.equal(result.valid, true);
  assert.deepEqual(result.copied.map((item) => item.destination).sort(), [
    f.bundle.html_path,
    f.bundle.manifest_path,
    f.bundle.meta_path,
  ].sort());
  for (const entry of f.manifest.files) {
    assert.equal(sha256(fs.readFileSync(path.join(f.root, entry.destination))), entry.sha256);
  }
  assert.equal(fs.existsSync(path.join(f.root, 'docs/undeclared.html')), false);
});

test('refuses hash mismatches before copying any later files', () => {
  /**
   * Given：manifest 中每个文件都有独立来源 hash。
   * When：某个 source 内容与声明 SHA-256 不一致。
   * Then：promotion 拒绝执行，防止发布被篡改或陈旧的源文件。
   * 防回归：不能只复制后检查目标，也不能忽略 source hash。
   */
  const f = fixture();
  f.manifest.files[0].sha256 = '0'.repeat(64);
  fs.writeFileSync(f.manifestPath, JSON.stringify(f.manifest, null, 2));

  const result = promoteInfocard({ root: f.root, manifestPath: f.manifestPath });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.field === 'files[0].sha256'));
  assert.equal(fs.existsSync(path.join(f.root, f.bundle.meta_path)), false);
});

test('enforces containment for sources and formal destinations', () => {
  /**
   * Given：authoring source 只能来自 primary repo 的 .docs/<card>/。
   * When：source 越界或 destination 使用绝对/上跳路径。
   * Then：promotion 拒绝越界路径。
   * 防回归：防止 manifest 被用作任意文件复制器。
   */
  const f = fixture();
  f.manifest.files[0].source = '.docs/' + f.card + '/../escape.html';
  fs.writeFileSync(f.manifestPath, JSON.stringify(f.manifest, null, 2));
  const sourceEscape = promoteInfocard({ root: f.root, manifestPath: f.manifestPath });
  assert.equal(sourceEscape.valid, false);
  assert.ok(sourceEscape.errors.some((error) => error.field === 'files[0].source'));

  const g = fixture();
  g.manifest.files[0].destination = '../docs/escape.html';
  fs.writeFileSync(g.manifestPath, JSON.stringify(g.manifest, null, 2));
  const destinationEscape = promoteInfocard({ root: g.root, manifestPath: g.manifestPath });
  assert.equal(destinationEscape.valid, false);
  assert.ok(destinationEscape.errors.some((error) => error.field === 'files[0].destination'));
});

test('refuses ambiguous destination collisions', () => {
  /**
   * Given：manifest 精确声明每个目标文件。
   * When：两个不同 source 指向同一个 destination。
   * Then：promotion 拒绝，避免后者静默覆盖前者。
   * 防回归：发布输出不能依赖 JSON 顺序产生模糊覆盖。
   */
  const f = fixture();
  f.manifest.files.push({ ...f.manifest.files[1], source: '.docs/' + f.card + '/docs/duplicate.meta.yaml' });
  const hash = writeFile(f.root, '.docs/' + f.card + '/docs/duplicate.meta.yaml', 'slug: duplicate\n');
  f.manifest.files[3].sha256 = hash;
  fs.writeFileSync(f.manifestPath, JSON.stringify(f.manifest, null, 2));

  const result = promoteInfocard({ root: f.root, manifestPath: f.manifestPath });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.field === 'files[3].destination'));
});

test('refuses symlink sources and symlink destinations', { skip: process.platform === 'win32' && !process.env.CI ? 'Windows symlink privilege varies by host' : false }, () => {
  /**
   * Given：promotion 只允许普通文件精确复制。
   * When：source 或已存在 destination 是 symlink。
   * Then：promotion 拒绝，避免链接穿透到未授权文件。
   * 防回归：不能依赖 realpath 后的偶然位置判断放行 symlink。
   */
  const f = fixture();
  fs.rmSync(path.join(f.root, f.manifest.files[0].source));
  fs.symlinkSync(path.join(f.root, f.manifest.files[1].source), path.join(f.root, f.manifest.files[0].source));
  const sourceLink = promoteInfocard({ root: f.root, manifestPath: f.manifestPath });
  assert.equal(sourceLink.valid, false);
  assert.ok(sourceLink.errors.some((error) => error.field === 'files[0].source'));

  const g = fixture();
  fs.mkdirSync(path.dirname(path.join(g.root, g.bundle.html_path)), { recursive: true });
  fs.symlinkSync(path.join(g.root, g.manifest.files[1].source), path.join(g.root, g.bundle.html_path));
  const destinationLink = promoteInfocard({ root: g.root, manifestPath: g.manifestPath });
  assert.equal(destinationLink.valid, false);
  assert.ok(destinationLink.errors.some((error) => error.field === 'files[0].destination'));
});

test('refuses outputs outside the bundle allowlist or inside .docs', () => {
  /**
   * Given：formal outputs 只允许 bundle 发布 allowlist。
   * When：manifest 声明未授权输出，或把 formal output 写回 .docs。
   * Then：promotion 拒绝。
   * 防回归：source 草稿区与发布输出区不能混在一起。
   */
  const f = fixture();
  f.manifest.files[0].destination = 'docs/20260820-other.html';
  fs.writeFileSync(f.manifestPath, JSON.stringify(f.manifest, null, 2));
  const undeclared = promoteInfocard({ root: f.root, manifestPath: f.manifestPath });
  assert.equal(undeclared.valid, false);
  assert.ok(undeclared.errors.some((error) => error.field === 'files[0].destination'));

  const g = fixture();
  g.manifest.files[0].destination = '.docs/' + g.card + '/docs/20260820-copy-card.html';
  fs.writeFileSync(g.manifestPath, JSON.stringify(g.manifest, null, 2));
  const docsOutput = promoteInfocard({ root: g.root, manifestPath: g.manifestPath });
  assert.equal(docsOutput.valid, false);
  assert.ok(docsOutput.errors.some((error) => error.field === 'files[0].destination'));
});

test('CLI promotes with JSON output and reports usage errors', () => {
  /**
   * Given：promote-infocard 是发布流程调用的公共 CLI seam。
   * When：传入合法 manifest 或缺少 --manifest。
   * Then：CLI 输出 JSON，并用退出码表达成功/失败。
   * 防回归：上层脚本可以稳定解析 promotion gate 结果。
   */
  const f = fixture();
  const pass = runCli(f.root, f.manifestPath);
  assert.equal(pass.status, 0, pass.stderr);
  assert.equal(pass.json.valid, true);

  const fail = spawnSync(process.execPath, [SCRIPT], { cwd: f.root, encoding: 'utf8' });
  assert.equal(fail.status, 2);
  assert.equal(JSON.parse(fail.stdout).valid, false);
});
