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
function png(width = 390, height = 844) {
  const b = Buffer.alloc(33); b.set([137,80,78,71,13,10,26,10]); b.writeUInt32BE(13, 8); b.write('IHDR', 12); b.writeUInt32BE(width, 16); b.writeUInt32BE(height, 20); b[24] = 8; b[25] = 6; return b;
}
function evidence(slug = 'mobile-gate', overrides = {}) { return { scrollWidth: 390, clientWidth: 390, brokenImages: [], screenshot: `artifacts/mobile/${slug}.png`, ...overrides }; }
function writingRunner(overrides = {}, dimensions = [390, 844]) { return async ({ screenshotPath }) => { fs.mkdirSync(path.dirname(screenshotPath), { recursive: true }); fs.writeFileSync(screenshotPath, png(...dimensions)); return evidence(path.basename(screenshotPath, '.png'), overrides); }; }

class FakeWebSocket {
  constructor(script = {}) { this.script = script; this.listeners = {}; this.sent = []; queueMicrotask(() => script.open !== false && this.emit('open', {})); }
  addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
  emit(name, event) { for (const fn of this.listeners[name] || []) fn(event); }
  send(raw) { const msg = JSON.parse(raw); this.sent.push(msg); this.script.onSend?.(msg, this); }
  close() { this.emit('close', {}); }
}

test('static scanner requires inline responsive rules and does not accept external stylesheet', () => {
  const { staticCheck } = require(MODULE_PATH);
  assert.equal(staticCheck(responsiveHtml()).ok, true);
  const external = '<!doctype html><html><head><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="styles.css"></head></html>';
  const result = staticCheck(external);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.code === 'MOBILE_MEDIA'));
});

test('evidence requires exact path and a real PNG with sensible exact viewport dimensions', async () => {
  const { root, bundlePath } = fixture();
  assert.equal((await require(MODULE_PATH).runBatch({ root, bundlePaths: [bundlePath], probe: async () => {}, runner: writingRunner() })).status, 'PASS');
  for (const runner of [
    writingRunner({}, [389, 844]), writingRunner({}, [390, 0]),
    async ({ screenshotPath }) => { fs.mkdirSync(path.dirname(screenshotPath), { recursive: true }); fs.writeFileSync(screenshotPath, 'not png'); return evidence(); },
    writingRunner({ screenshot: 'wrong.png' }), writingRunner({ scrollWidth: 410 }), writingRunner({ clientWidth: 391 }), writingRunner({ brokenImages: ['x'] })
  ]) assert.equal((await require(MODULE_PATH).runBatch({ root, bundlePaths: [bundlePath], probe: async () => {}, runner })).status, 'FAIL');
});

test('browser evidence recomputes and returns horizontal overflow instead of trusting runner evidence', async () => {
  const { root, bundlePath } = fixture();
  const mod = require(MODULE_PATH);
  const passed = await mod.runBatch({ root, bundlePaths: [bundlePath], probe: async () => {}, runner: writingRunner({ horizontalOverflow: true }) });
  assert.equal(passed.status, 'PASS');
  assert.equal(passed.cards[0].browser.horizontalOverflow, false);
  const overflow = await mod.runBatch({ root, bundlePaths: [bundlePath], probe: async () => {}, runner: writingRunner({ scrollWidth: 392, horizontalOverflow: false }) });
  assert.equal(overflow.status, 'FAIL');
  assert.equal(overflow.cards[0].browser.horizontalOverflow, true);
  assert.ok(overflow.cards[0].errors.includes('horizontal overflow'));
});

test('parseArgs consumes all shell-expanded --bundles values until the next flag and keeps repeated values', () => {
  const { parseArgs } = require(MODULE_PATH);
  const parsed = parseArgs(['--bundles', 'a.json', 'b.json', 'c.json', '--base-url', 'http://example.test', '--bundles', 'quoted-*.json']);
  assert.deepEqual(parsed.bundleGlobs, ['a.json', 'b.json', 'c.json', 'quoted-*.json']);
  assert.equal(parsed.baseUrl, 'http://example.test');
});

test('artifact path rejects symlink parent and target without deleting outside files', async () => {
  for (const targetSymlink of [false, true]) {
    const { root, bundlePath } = fixture();
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'mobile-outside-')); cleanups.push(outside);
    const sentinel = path.join(outside, 'sentinel'); fs.writeFileSync(sentinel, 'keep');
    fs.mkdirSync(path.join(root, 'artifacts'), { recursive: true });
    if (targetSymlink) { fs.mkdirSync(path.join(root, 'artifacts/mobile')); fs.symlinkSync(sentinel, path.join(root, 'artifacts/mobile/mobile-gate.png')); }
    else fs.symlinkSync(outside, path.join(root, 'artifacts/mobile'));
    const result = await require(MODULE_PATH).runBatch({ root, bundlePaths: [bundlePath], probe: async () => {}, runner: writingRunner() });
    assert.equal(result.status, 'FAIL'); assert.equal(fs.readFileSync(sentinel, 'utf8'), 'keep');
  }
});

test('browser unavailable status preserves prior failure precedence and annotates result', async () => {
  const a = fixture(); const second = validBundle({ slug: 'second', html_path: 'docs/20260712-second.html', meta_path: 'docs/20260712-second.html.meta.yaml', asset_dir: 'assets/img/second', manifest_path: 'assets/img/second/manifest.json' });
  fs.writeFileSync(path.join(a.root, 'docs/20260712-second.html'), responsiveHtml()); const bp = path.join(a.root, 'second.json'); fs.writeFileSync(bp, JSON.stringify(second));
  let n = 0;
  const result = await require(MODULE_PATH).runBatch({ root: a.root, bundlePaths: [a.bundlePath, bp], probe: async () => {}, runner: async () => { if (++n === 1) throw new Error('card failed'); const e = new Error('gone'); e.code = 'BROWSER_UNAVAILABLE'; throw e; } });
  assert.equal(result.status, 'FAIL'); assert.equal(result.exitCode, 1); assert.equal(result.browserUnavailable, 'gone');
  const early = await require(MODULE_PATH).runBatch({ root: a.root, bundlePaths: [a.bundlePath], probe: async () => { const e = new Error('no cdp'); e.code = 'BROWSER_UNAVAILABLE'; throw e; }, runner: writingRunner() });
  assert.equal(early.status, 'SKIPPED'); assert.equal(early.exitCode, 2);
});

test('CDP socket has connect timeout and rejects open or pending requests on close error and malformed JSON', async () => {
  const { cdpSocket } = require(MODULE_PATH);
  const never = new FakeWebSocket({ open: false });
  await assert.rejects(cdpSocket('ws://x', 10, () => never).send('A'), /connect timeout/);
  for (const event of ['close', 'error']) {
    const ws = new FakeWebSocket(); const client = cdpSocket('ws://x', 100, () => ws); const pending = client.send('A'); await new Promise(setImmediate); ws.emit(event, {}); await assert.rejects(pending, /CDP/); await assert.rejects(client.send('B'), /CDP/);
  }
  const ws = new FakeWebSocket(); const client = cdpSocket('ws://x', 100, () => ws); const pending = client.send('A'); await new Promise(setImmediate); ws.emit('message', { data: '{' }); await assert.rejects(pending, /malformed/);
});

test('browser runner creates isolated target, uses flattened session, settles document, and cleans only what it created', async () => {
  const calls = []; let evalCount = 0;
  const client = { send: async (method, params, sessionId) => { calls.push({ method, params, sessionId });
    if (method === 'Target.createBrowserContext') return { browserContextId: 'ctx' };
    if (method === 'Target.createTarget') return { targetId: 'new-target' };
    if (method === 'Target.attachToTarget') return { sessionId: 'session' };
    if (method === 'Page.navigate') return { frameId: 'f' };
    if (method === 'Runtime.evaluate') return { result: { value: ++evalCount === 1 ? { ready: false } : evalCount === 2 ? { ready: true, settled: false } : evalCount === 3 ? { ready: true, settled: true } : { scrollWidth: 390, clientWidth: 390, brokenImages: [] } } };
    if (method === 'Page.captureScreenshot') return { data: png().toString('base64') }; return {};
  }, close() { calls.push({ method: 'socket.close' }); } };
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'runner-')); cleanups.push(root); const shot = path.join(root, 'artifacts/mobile/a.png');
  await require(MODULE_PATH).defaultBrowserRunner({ url: 'http://local/a', width: 390, height: 844, screenshotPath: shot, cdpUrl: 'http://cdp', fetcher: async () => ({ webSocketDebuggerUrl: 'ws://browser' }), clientFactory: () => client, readinessTimeoutMs: 200 });
  assert.ok(calls.some((c) => c.method === 'Target.createTarget' && c.params.browserContextId === 'ctx'));
  assert.ok(calls.filter((c) => ['Page.enable','Runtime.enable','Emulation.setDeviceMetricsOverride','Page.navigate','Runtime.evaluate','Page.captureScreenshot'].includes(c.method)).every((c) => c.sessionId === 'session'));
  assert.ok(calls.some((c) => c.method === 'Target.detachFromTarget' && c.params.sessionId === 'session'));
  assert.ok(calls.some((c) => c.method === 'Target.closeTarget' && c.params.targetId === 'new-target'));
  assert.ok(calls.some((c) => c.method === 'Target.disposeBrowserContext' && c.params.browserContextId === 'ctx'));
  assert.ok(!calls.some((c) => c.method === 'Target.getTargets'));
});

test('navigation protocol error and readiness hard timeout fail', async () => {
  const makeClient = (navigateResult) => ({ send: async (method) => { if (method === 'Target.createBrowserContext') throw new Error('unsupported'); if (method === 'Target.createTarget') return { targetId: 't' }; if (method === 'Target.attachToTarget') return { sessionId: 's' }; if (method === 'Page.navigate') return navigateResult; if (method === 'Runtime.evaluate') return { result: { value: { ready: false } } }; return {}; }, close() {} });
  const args = { url: 'http://local', width: 390, height: 844, screenshotPath: '/tmp/no.png', cdpUrl: 'http://cdp', fetcher: async () => ({ webSocketDebuggerUrl: 'ws://browser' }), readinessTimeoutMs: 15 };
  await assert.rejects(require(MODULE_PATH).defaultBrowserRunner({ ...args, clientFactory: () => makeClient({ errorText: 'ERR_FAILED' }) }), /ERR_FAILED/);
  await assert.rejects(require(MODULE_PATH).defaultBrowserRunner({ ...args, clientFactory: () => makeClient({ frameId: 'f' }) }), /readiness timeout/);
});

test('command remains exposed and no bundles skips', async () => {
  const mod = require(MODULE_PATH); assert.equal((await mod.runBatch({ bundlePaths: [] })).exitCode, 2);
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); assert.equal(pkg.scripts['verify-mobile-batch'], 'node scripts/verify-mobile-batch.js');
});
