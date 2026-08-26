#!/usr/bin/env node
/**
 * publish-card.js — 单卡完整发布流水线（含 OOB 验证结果）
 *
 * 用法: node scripts/publish-card.js <slug> <html-source>
 * 示例: node scripts/publish-card.js 20260824-zoetrope .docs/20260824-zoetrope/card.html
 *
 * 在主 checkout 运行。输出结构化 JSON 结果，供 agent OOB 读取。
 */
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const slug = process.argv[2];
const htmlSource = process.argv[3];

if (!slug || !htmlSource) {
  console.error('Usage: node scripts/publish-card.js <slug> <html-source>');
  process.exit(1);
}

const repoRoot = process.cwd();
const resultFile = path.join(repoRoot, `.last-publish-${slug}.json`);

// HTML 目标路径
const htmlTarget = path.join(repoRoot, 'docs', slug + '.html');
const metaSource = htmlSource + '.meta.yaml';
const metaTarget = path.join(repoRoot, 'docs', slug + '.html.meta.yaml');

/** 同步执行命令，返回 { stdout, stderr, status } */
function run(cmd, cwd) {
  try {
    const r = execSync(cmd, { cwd: cwd || repoRoot, encoding: 'utf-8', timeout: 300000 });
    return { stdout: r, status: 0 };
  } catch (e) {
    return { stdout: e.stdout || '', stderr: e.stderr || '', status: e.status || 1 };
  }
}

/** 同步执行，不抛异常 */
function runQuiet(cmd, cwd) {
  try {
    const r = execSync(cmd, { cwd: cwd || repoRoot, encoding: 'utf-8', timeout: 300000 });
    return { ok: true, stdout: r.trim(), status: 0 };
  } catch (e) {
    return { ok: false, stdout: (e.stdout||'').trim(), stderr: (e.stderr||'').trim(), status: e.status||1 };
  }
}

const result = {
  slug,
  started_at: new Date().toISOString(),
  steps: [],
  card_count: null,
  card_hash: null,
  public_http: null,
  published: false,
  error: null
};

function step(name, fn) {
  const r = fn();
  result.steps.push({ name, ok: r.ok ?? (r.status === 0), status: r.status, stdout: String(r.stdout||'').slice(0,200) });
  return r;
}

// 1. 读取 HTML 内容并计算 SHA
const htmlContent = fs.existsSync(htmlSource) ? fs.readFileSync(htmlSource, 'utf-8') : null;
if (!htmlContent) { result.error = `Source HTML not found: ${htmlSource}`; }
const cardHash = htmlContent ? crypto.createHash('sha256').update(htmlContent).digest('hex').slice(0,16) : null;

// 2. 复制文件
if (!result.error) {
  const copyMeta = step('copy-files', () => {
    fs.copyFileSync(htmlSource, htmlTarget);
    if (fs.existsSync(metaSource)) fs.copyFileSync(metaSource, metaTarget);
    return { ok: true, stdout: 'copied' };
  });
}

// 3. build
if (!result.error) {
  step('npm-build', () => runQuiet('npm run build', repoRoot));
}

// 4. verify
if (!result.error) {
  step('npm-verify', () => runQuiet('npm run verify', repoRoot));
}

// 5. check-leak
if (!result.error) {
  step('npm-check-leak', () => runQuiet('npm run check-leak', repoRoot));
}

// 6. 读取 card count（OOB 验证，用 python 避免模块路径问题）
if (!result.error) {
  try {
    const r = execSync(
      'python3 -c "import yaml; d=yaml.safe_load(open(\\\"_index.yaml\\\")); print(len(d[\\\"cards\\\"]))"',
      { cwd: repoRoot, encoding: 'utf-8', timeout: 30000 }
    );
    result.card_count = parseInt(r.trim(), 10);
    step('card-count', () => ({ ok: true, stdout: String(result.card_count) }));
  } catch(e) {
    step('card-count', () => ({ ok: false, stdout: e.message }));
  }
}

// 7. git add
if (!result.error) {
  step('git-add', () => runQuiet(
    `git add docs/${slug}.html docs/${slug}.html.meta.yaml _index.yaml index.html`,
    repoRoot
  ));
}

// 8. git commit
if (!result.error) {
  const msg = `feat: publish ${slug} (${new Date().toISOString().slice(0,10)})`;
  step('git-commit', () => runQuiet(`git commit -m "${msg}"`, repoRoot));
  // 读取 commit hash
  try {
    const hash = execSync(`git rev-parse --short HEAD`, { cwd: repoRoot, encoding: 'utf-8' }).trim();
    result.commit = hash;
    result.commit_msg = msg;
  } catch(e) {}
}

// 9. git push
if (!result.error) {
  const push = step('git-push', () => runQuiet('git push origin main', repoRoot));
  if (push.ok) result.published = true;
}

// 10. 公网验证（延迟在外部做，这里只记录）
result.public_check = { url: `https://ccwq.github.io/infocard-pub/docs/${slug}.html` };
result.html_sha256 = cardHash;

result.finished_at = new Date().toISOString();
result.all_ok = result.steps.every(s => s.ok) && result.published && !result.error;

// 写入结果文件
fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));

console.log(JSON.stringify(result, null, 2));
process.exit(result.all_ok ? 0 : 1);
