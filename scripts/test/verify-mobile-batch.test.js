'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const MODULE_PATH = path.join(ROOT, 'scripts/verify-mobile-batch.js');
const cleanups = [];
test.afterEach(() => { while (cleanups.length) fs.rmSync(cleanups.pop(), { recursive: true, force: true }); });

function responsiveHtml(extra = '') {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<style>table, pre, code { max-width: 100%; overflow: auto; } @media screen and (max-width: 768px) { main { padding: 8px; } }</style>
</head><body><main>ok</main>${extra}</body></html>`;
}
function validBundle(overrides = {}) {
  return { slug: 'mobile-gate', html_path: 'docs/20260711-mobile-gate.html', meta_path: 'docs/20260711-mobile-gate.html.meta.yaml', asset_dir: 'assets/img/mobile-gate', manifest_path: 'assets/img/mobile-gate/manifest.json', source_url: 'https://example.com', style: 'darkblue', category: 'test', keywords: ['mobile'], wiki: { raw_path: 'raw/a.md', knowledge_path: 'concepts/a.md' }, ...overrides };
}
function fixture(html = responsiveHtml(), bundle = validBundle()) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mobile-batch-')); cleanups.push(root);
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs/20260711-mobile-gate.html'), html);
  fs.writeFileSync(path.join(root, 'bundle.json'), JSON.stringify(bundle));
  return { root, bundlePath: path.join(root, 'bundle.json') };
}
function evidence(overrides = {}) { return { scrollWidth: 390, clientWidth: 390, brokenImages: [], screenshot: 'artifacts/mobile/mobile-gate.png', screenshotOk: true, ...overrides }; }
function writingRunner(overrides = {}) { return async ({ screenshotPath }) => { fs.mkdirSync(path.dirname(screenshotPath), { recursive: true }); fs.writeFileSync(screenshotPath, 'png'); return evidence(overrides); }; }

test('static scanner strips comments and strings and accepts overflow:auto', () => {
  const { staticCheck } = require(MODULE_PATH);
  assert.equal(staticCheck(responsiveHtml()).ok, true);
  const fake = `<!doctype html><script>const lie='@media(max-width:1px){table,pre,code{max-width:100%;overflow:auto}}'</script><style>/* same lie */</style>`;
  const result = staticCheck(fake);
  assert.equal(result.ok, false);
  for (const code of ['VIEWPORT', 'MOBILE_MEDIA', 'RESPONSIVE_TABLE']) assert.ok(result.errors.some((e) => e.code === code));
});

test('PASS requires exact 390 evidence, expected nonempty screenshot, finite dimensions, and recomputes overflow', async () => {
  const { root, bundlePath } = fixture();
  let call;
  const result = await require(MODULE_PATH).runBatch({ root, bundlePaths: [bundlePath], baseUrl: 'http://127.0.0.1:4173/site/', runner: async (input) => { call = input; return writingRunner()(input); } });
  assert.equal(result.status, 'PASS'); assert.equal(call.width, 390); assert.equal(call.url, 'http://127.0.0.1:4173/site/docs/20260711-mobile-gate.html');
  for (const bad of [evidence({ scrollWidth: 410, horizontalOverflow: false }), evidence({ clientWidth: 391 }), evidence({ scrollWidth: NaN }), evidence({ brokenImages: ['x'] }), evidence({ screenshot: 'wrong.png' })]) {
    const r = await require(MODULE_PATH).runBatch({ root, bundlePaths: [bundlePath], runner: writingRunner(bad) }); assert.equal(r.status, 'FAIL');
  }
});

test('missing screenshot fails even when runner claims success', async () => {
  const { root, bundlePath } = fixture();
  const result = await require(MODULE_PATH).runBatch({ root, bundlePaths: [bundlePath], runner: async () => evidence() });
  assert.equal(result.status, 'FAIL'); assert.equal(result.exitCode, 1);
});

test('invalid JSON, invalid bundle, missing HTML, traversal and symlink escape are per-card failures and batch continues', async () => {
  const { root, bundlePath } = fixture();
  const malformed = path.join(root, 'bad.json'); fs.writeFileSync(malformed, '{');
  const invalid = path.join(root, 'invalid.json'); fs.writeFileSync(invalid, JSON.stringify(validBundle({ slug: '../bad' })));
  const missing = path.join(root, 'missing.json'); fs.writeFileSync(missing, JSON.stringify(validBundle({ slug: 'missing', html_path: 'docs/20260711-missing.html', meta_path: 'docs/20260711-missing.html.meta.yaml', asset_dir: 'assets/img/missing', manifest_path: 'assets/img/missing/manifest.json' })));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'mobile-outside-')); cleanups.push(outside); fs.writeFileSync(path.join(outside, '20260711-mobile-gate.html'), responsiveHtml());
  fs.unlinkSync(path.join(root, 'docs/20260711-mobile-gate.html')); fs.symlinkSync(path.join(outside, '20260711-mobile-gate.html'), path.join(root, 'docs/20260711-mobile-gate.html'));
  const result = await require(MODULE_PATH).runBatch({ root, bundlePaths: [malformed, invalid, missing, bundlePath], runner: writingRunner() });
  assert.equal(result.status, 'FAIL'); assert.equal(result.cards.length, 4); assert.ok(result.cards.every((c) => c.errors?.length));
});

test('browser unavailable globally SKIPS with exit 2; ordinary runner error does not abort later cards', async () => {
  const a = fixture(); const second = validBundle({ slug: 'second', html_path: 'docs/20260712-second.html', meta_path: 'docs/20260712-second.html.meta.yaml', asset_dir: 'assets/img/second', manifest_path: 'assets/img/second/manifest.json' });
  fs.writeFileSync(path.join(a.root, 'docs/20260712-second.html'), responsiveHtml()); const bp = path.join(a.root, 'second.json'); fs.writeFileSync(bp, JSON.stringify(second));
  let n = 0;
  const failThenPass = await require(MODULE_PATH).runBatch({ root: a.root, bundlePaths: [a.bundlePath, bp], runner: async (input) => { if (++n === 1) throw new Error('page failed'); return writingRunner({ screenshot: 'artifacts/mobile/second.png' })(input); } });
  assert.equal(failThenPass.cards.length, 2); assert.equal(failThenPass.status, 'FAIL');
  const skipped = await require(MODULE_PATH).runBatch({ root: a.root, bundlePaths: [a.bundlePath], runner: async () => { const e = new Error('CDP unavailable'); e.code = 'BROWSER_UNAVAILABLE'; throw e; } });
  assert.equal(skipped.status, 'SKIPPED'); assert.equal(skipped.exitCode, 2);
});

test('argument/config errors use exit 2 and command is exposed', async () => {
  const { parseArgs, runBatch } = require(MODULE_PATH);
  assert.throws(() => parseArgs(['--wat']), /unknown/);
  const none = await runBatch({ bundlePaths: [] }); assert.equal(none.exitCode, 2);
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); assert.equal(pkg.scripts['verify-mobile-batch'], 'node scripts/verify-mobile-batch.js');
});
