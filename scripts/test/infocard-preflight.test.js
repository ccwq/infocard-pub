'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { validatePreflight } = require('../lib/infocard-preflight');

function write(root, rel, value) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
  return file;
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'infocard-preflight-'));
  write(root, 'theme/darkblue.html', '<html></html>');
  write(root, 'theme/themes.json', JSON.stringify({ themes: { darkblue: { template: 'theme/darkblue.html', capabilities: {}, structural_signature: [] } } }));
  const dir = '.docs/run/demo';
  const html = '<!doctype html><html data-theme="darkblue"><style>:root{--accent:#fff}body{color:var(--accent)}</style></html>';
  write(root, `${dir}/card.html`, html);
  write(root, `${dir}/card.html.meta.yaml`, 'slug: demo\npath: docs/20260831-demo.html\nstyle: darkblue\n');
  write(root, `${dir}/facts.json`, '{}');
  write(root, `${dir}/theme-decision.json`, JSON.stringify({ version: 1, content_type: 'tool', content_shape: 'brief', required_capabilities: [], candidate_themes: ['darkblue'], excluded_themes: [], selection_weights: { darkblue: 1 }, seed: 'fixture', selected_theme: 'darkblue', user_override: { requested: null, accepted: false, reason: null } }));
  const manifest = { card: 'demo', bundle: { slug: 'demo', html_path: 'docs/20260831-demo.html', meta_path: 'docs/20260831-demo.html.meta.yaml', asset_dir: 'assets/img/demo', manifest_path: 'assets/img/demo/manifest.json', source_url: 'https://example.com', style: 'darkblue', category: 'tool', keywords: ['demo'], wiki: { raw_path: 'raw/demo.md', knowledge_path: 'concepts/demo.md' } }, files: [
    { source: 'card.html', destination: 'docs/20260831-demo.html' },
    { source: 'card.html.meta.yaml', destination: 'docs/20260831-demo.html.meta.yaml' },
  ] };
  const crypto = require('node:crypto');
  manifest.files.forEach((entry) => { entry.sha256 = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, dir, entry.source))).digest('hex'); });
  write(root, `${dir}/promotion-manifest.json`, JSON.stringify(manifest));
  const brief = { version: 1, route: 'light', hero: 'Demo', summary: 'Summary', core_capabilities: ['A'], tech_stack: ['JS'], usage: ['run'], use_cases: ['docs'], risk_boundary: 'bounded', sources: ['https://example.com'], source_boundary: { canonical: 'https://example.com', discovery: null } };
  write(root, `${dir}/project-brief.json`, JSON.stringify(brief));
  return { root, dir };
}

test('preflight fails closed when required contract files are missing', () => {
  /**
   * Given：authoring 目录没有完整的 brief、facts、theme decision、sidecar 和 manifest。
   * When：执行 preflight。
   * Then：返回 invalid，并列出缺少参数或文件错误。
   * 防回归：避免契约未冻结就开始 HTML 创作。
   */
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'infocard-preflight-missing-'));
  const result = validatePreflight({ root, authoringDir: '.docs/run/demo' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.field === 'briefPath'));
});

test('validates the complete contract before authoring', () => {
  /**
   * Given：.docs 目录存在有效 project-brief、facts、theme decision、sidecar 和 manifest。
   * When：执行 preflight。
   * Then：返回 valid，并锁定 route 与 selected theme。
   * 防回归：防止 promotion 阶段才发现三方主题或 manifest 契约不一致。
   */
  const f = fixture();
  fs.rmSync(path.join(f.root, f.dir, 'card.html'));
  const manifestPath = path.join(f.root, f.dir, 'promotion-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  delete manifest.files[0].sha256;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  const result = validatePreflight({ root: f.root, authoringDir: f.dir, briefPath: `${f.dir}/project-brief.json`, factsPath: `${f.dir}/facts.json`, themeDecisionPath: `${f.dir}/theme-decision.json`, metaPath: `${f.dir}/card.html.meta.yaml`, manifestPath: `${f.dir}/promotion-manifest.json`, stage: 'contract' });
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.route, 'light');
  assert.equal(result.selected_theme, 'darkblue');
});

test('authoring validation rejects missing HTML and stale hashes', () => {
  /**
   * Given：契约 preflight 已通过，但 authoring 输出缺失或 manifest hash 陈旧。
   * When：执行 authoring_validation。
   * Then：严格复用 promotion validator 并拒绝进入 promotion。
   * 防回归：preflight 的计划态不能被误当成可发布证据。
   */
  const f = fixture();
  fs.rmSync(path.join(f.root, f.dir, 'card.html'));
  const result = validatePreflight({ root: f.root, authoringDir: f.dir, briefPath: `${f.dir}/project-brief.json`, factsPath: `${f.dir}/facts.json`, themeDecisionPath: `${f.dir}/theme-decision.json`, metaPath: `${f.dir}/card.html.meta.yaml`, manifestPath: `${f.dir}/promotion-manifest.json`, stage: 'authoring_validation' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => /source file does not exist/.test(item.message)));
});

test('preflight contract files cannot escape the authoring directory', () => {
  /**
   * Given：调用方把 factsPath 指向 .docs 候选目录外部。
   * When：执行 contract preflight。
   * Then：在读取或 promotion 校验前拒绝越界路径。
   * 防回归：preflight 不能成为任意仓库文件读取器。
   */
  const f = fixture();
  write(f.root, '.docs/outside/facts.json', '{}');
  const result = validatePreflight({ root: f.root, authoringDir: f.dir, briefPath: `${f.dir}/project-brief.json`, factsPath: '.docs/outside/facts.json', themeDecisionPath: `${f.dir}/theme-decision.json`, metaPath: `${f.dir}/card.html.meta.yaml`, manifestPath: `${f.dir}/promotion-manifest.json` });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.field === 'factsPath'));
});

test('preflight targeted leak dry-run blocks a real phone number', () => {
  /**
   * Given：facts.json 含普通文本中的真实手机号。
   * When：执行 contract preflight 的定向 leak dry-run。
   * Then：返回 leak 错误并阻止 authoring。
   * 防回归：敏感信息不能拖到 promotion 或全量扫描时才发现。
   */
  const f = fixture();
  write(f.root, `${f.dir}/facts.json`, JSON.stringify({ contact: '18612345678' }));
  const result = validatePreflight({ root: f.root, authoringDir: f.dir, briefPath: `${f.dir}/project-brief.json`, factsPath: `${f.dir}/facts.json`, themeDecisionPath: `${f.dir}/theme-decision.json`, metaPath: `${f.dir}/card.html.meta.yaml`, manifestPath: `${f.dir}/promotion-manifest.json` });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.field === 'leak'));
});

test('preflight rejects symlinked contract files', () => {
  /**
   * Given：.docs authoring 目录中的 facts.json 是指向外部文件的符号链接。
   * When：执行 contract preflight。
   * Then：在读取文件前拒绝该路径。
   * 防回归：symlink 不能绕过 authoring 边界读取仓库外内容。
   */
  const f = fixture();
  const outside = write(f.root, 'outside-facts.json', '{}');
  const facts = path.join(f.root, f.dir, 'facts.json');
  fs.rmSync(facts);
  try { fs.symlinkSync(outside, facts, 'file'); }
  catch (_) { return; }
  const result = validatePreflight({ root: f.root, authoringDir: f.dir, briefPath: `${f.dir}/project-brief.json`, factsPath: `${f.dir}/facts.json`, themeDecisionPath: `${f.dir}/theme-decision.json`, metaPath: `${f.dir}/card.html.meta.yaml`, manifestPath: `${f.dir}/promotion-manifest.json` });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.field === 'factsPath' || item.field === 'facts'));
});
