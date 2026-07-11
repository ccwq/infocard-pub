#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { loadBundle, validateBundle } = require('./lib/publish-bundle');

const ROOT = path.resolve(__dirname, '..');
const WIDTH = 390;
const HEIGHT = 844;
const DEFAULT_CDP = process.env.MOBILE_CDP_URL || 'http://127.0.0.1:9222';

function stripComments(text) {
  return text.replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\//g, '');
}
function staticCheck(html) {
  const withoutScripts = stripComments(html).replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  const cssSource = withoutScripts.replace(/(['"`])(?:\\.|(?!\1)[\s\S])*\1/g, '');
  const errors = [];
  if (!/<meta\b(?=[^>]*\bname\s*=\s*["']?viewport\b)(?=[^>]*\bcontent\s*=\s*["'][^"']*width\s*=\s*device-width)[^>]*>/i.test(withoutScripts)) errors.push({ code: 'VIEWPORT', message: 'missing viewport width=device-width' });
  if (!/@media\s*(?:screen\s+and\s*)?\([^)]*(?:max-width\s*:|width\s*<=)[^)]*\)\s*\{/i.test(cssSource)) errors.push({ code: 'MOBILE_MEDIA', message: 'missing mobile max-width media rule' });
  const coverage = Object.fromEntries(['table', 'pre', 'code'].map((tag) => [tag, { maxWidth: false, overflow: false }]));
  for (const match of cssSource.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
    const selectors = match[1].split(',').map((v) => v.trim());
    const declarations = match[2];
    const maxWidth = /(?:^|;)\s*max-width\s*:\s*100%\s*(?:!important\s*)?(?:;|$)/i.test(`;${declarations};`);
    const overflow = /(?:^|;)\s*overflow(?:-x)?\s*:\s*auto\s*(?:!important\s*)?(?:;|$)/i.test(`;${declarations};`);
    for (const tag of Object.keys(coverage)) if (selectors.some((s) => new RegExp(`(^|[^a-z0-9_-])${tag}([^a-z0-9_-]|$)`, 'i').test(s))) { coverage[tag].maxWidth ||= maxWidth; coverage[tag].overflow ||= overflow; }
  }
  for (const [tag, rule] of Object.entries(coverage)) if (!rule.maxWidth || !rule.overflow) errors.push({ code: `RESPONSIVE_${tag.toUpperCase()}`, message: `${tag} requires max-width:100% and overflow:auto` });
  return { ok: errors.length === 0, errors };
}
function parseArgs(argv) {
  const result = { bundlePaths: [], bundleGlobs: [], baseUrl: 'http://127.0.0.1:4173', root: ROOT, cdpUrl: DEFAULT_CDP };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (!['--bundle', '--bundles', '--base-url', '--root', '--artifacts-dir', '--cdp-url'].includes(flag)) throw new Error(`unknown argument: ${flag}`);
    const value = argv[++i]; if (!value) throw new Error(`missing value for ${flag}`);
    if (flag === '--bundle') result.bundlePaths.push(value); else if (flag === '--bundles') result.bundleGlobs.push(value); else if (flag === '--base-url') result.baseUrl = value; else if (flag === '--root') result.root = path.resolve(value); else if (flag === '--cdp-url') result.cdpUrl = value; else result.artifactsDir = path.resolve(value);
  }
  return result;
}
function expandGlob(pattern) {
  const absolute = path.resolve(pattern); const star = absolute.search(/[?*]/); if (star < 0) return fs.existsSync(absolute) ? [absolute] : [];
  const split = absolute.lastIndexOf(path.sep, star); const dir = absolute.slice(0, split) || path.parse(absolute).root; const base = absolute.slice(split + 1);
  const regex = new RegExp(`^${base.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
  return fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isFile() && regex.test(e.name)).map((e) => path.join(dir, e.name)).sort() : [];
}
function resolveBundlePaths(paths, globs) { return [...new Set([...paths.map((p) => path.resolve(p)), ...globs.flatMap(expandGlob)])]; }
function inside(root, target) { const rel = path.relative(root, target); return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel)); }
function safeExistingFile(root, relative) {
  const target = path.resolve(root, relative); if (!inside(root, target)) throw new Error('path escapes repository');
  const realRoot = fs.realpathSync(root); const real = fs.realpathSync(target); if (!inside(realRoot, real) || !fs.statSync(real).isFile()) throw new Error('path escapes repository through symlink'); return real;
}
function expectedScreenshot(root, slug) { const dir = path.join(root, 'artifacts/mobile'); const target = path.join(dir, `${slug}.png`); if (!inside(dir, target)) throw new Error('unsafe screenshot path'); return target; }
function cardUrl(baseUrl, htmlPath) { return new URL(htmlPath.replaceAll(path.sep, '/').replace(/^\/+/, ''), baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).href; }
async function fetchJson(url, options = {}) { const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 3000); try { const r = await fetch(url, { ...options, signal: controller.signal }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return await r.json(); } finally { clearTimeout(timer); } }
function cdpSocket(wsUrl, timeoutMs = 15000) {
  const ws = new WebSocket(wsUrl); let next = 0; const pending = new Map();
  const opened = new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', () => reject(new Error('CDP WebSocket connection failed')), { once: true }); });
  ws.addEventListener('message', (event) => { const msg = JSON.parse(event.data); if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); clearTimeout(p.timer); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result || {}); } });
  function send(method, params = {}) { return opened.then(() => new Promise((resolve, reject) => { const id = ++next; const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, timeoutMs); pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params })); })); }
  function close() { for (const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error('CDP closed')); } pending.clear(); ws.close(); }
  return { send, close };
}
async function defaultBrowserRunner({ url, width, height, screenshotPath, cdpUrl = DEFAULT_CDP }) {
  let target; let cdp;
  try {
    await fetchJson(`${cdpUrl.replace(/\/$/, '')}/json/version`); const list = await fetchJson(`${cdpUrl.replace(/\/$/, '')}/json/list`);
    target = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
    if (!target) target = await fetchJson(`${cdpUrl.replace(/\/$/, '')}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' });
    if (!target.webSocketDebuggerUrl) throw new Error('no debuggable page target');
  } catch (error) { error.code = 'BROWSER_UNAVAILABLE'; throw error; }
  cdp = cdpSocket(target.webSocketDebuggerUrl);
  try {
    await cdp.send('Page.enable'); await cdp.send('Runtime.enable'); await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true }); await cdp.send('Page.navigate', { url });
    for (let i = 0; i < 50; i++) { const r = await cdp.send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true }); if (r.result?.value === 'complete') break; await new Promise((resolve) => setTimeout(resolve, 100)); }
    const measured = await cdp.send('Runtime.evaluate', { expression: `(() => { const d=document.documentElement; return {scrollWidth:d.scrollWidth,clientWidth:d.clientWidth,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.currentSrc||i.src)} })()`, returnByValue: true });
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }); fs.mkdirSync(path.dirname(screenshotPath), { recursive: true }); fs.writeFileSync(screenshotPath, Buffer.from(shot.data, 'base64'));
    return { ...measured.result.value, screenshot: path.relative(path.resolve(screenshotPath, '../../..'), screenshotPath).replaceAll(path.sep, '/'), screenshotOk: true };
  } finally { cdp.close(); }
}
function validateEvidence(e, screenshotPath, root, slug) {
  const errors = []; const expected = path.relative(root, screenshotPath).replaceAll(path.sep, '/');
  if (!e || !Number.isFinite(e.scrollWidth) || !Number.isFinite(e.clientWidth)) errors.push('scroll/client widths must be finite');
  else { if (e.clientWidth !== WIDTH) errors.push(`clientWidth must equal ${WIDTH}`); if (e.scrollWidth > e.clientWidth + 1) errors.push('horizontal overflow'); }
  if (!Array.isArray(e?.brokenImages) || e.brokenImages.length) errors.push('broken images detected or evidence malformed');
  if (e?.screenshot !== expected || expected !== `artifacts/mobile/${slug}.png`) errors.push('unexpected screenshot path');
  try { if (!fs.statSync(screenshotPath).isFile() || fs.statSync(screenshotPath).size === 0) errors.push('screenshot missing or empty'); } catch { errors.push('screenshot missing or empty'); }
  return errors;
}
async function runBatch(options = {}) {
  const root = path.resolve(options.root || ROOT); const runner = options.runner || defaultBrowserRunner; const bundlePaths = resolveBundlePaths(options.bundlePaths || [], options.bundleGlobs || []);
  if (!bundlePaths.length) return { status: 'SKIPPED', reason: 'no bundles supplied', exitCode: 2, cards: [] };
  const cards = [];
  for (const bundlePath of bundlePaths) {
    const card = { bundlePath }; cards.push(card); let bundle;
    try { bundle = loadBundle(bundlePath); const checked = validateBundle(bundle); if (!checked.valid) throw new Error(checked.errors.map((e) => `${e.field}: ${e.message}`).join('; ')); card.slug = bundle.slug; card.htmlPath = bundle.html_path; const htmlFile = safeExistingFile(root, bundle.html_path); card.static = staticCheck(fs.readFileSync(htmlFile, 'utf8')); if (!card.static.ok) { card.errors = card.static.errors.map((e) => e.message); continue; } }
    catch (error) { card.errors = [error.message]; continue; }
    const screenshotPath = expectedScreenshot(root, bundle.slug); try { fs.rmSync(screenshotPath, { force: true }); card.browser = await runner({ url: cardUrl(options.baseUrl || 'http://127.0.0.1:4173', bundle.html_path), width: WIDTH, height: HEIGHT, screenshotPath, cdpUrl: options.cdpUrl || DEFAULT_CDP }); card.errors = validateEvidence(card.browser, screenshotPath, root, bundle.slug); }
    catch (error) { if (error.code === 'BROWSER_UNAVAILABLE') return { status: 'SKIPPED', reason: error.message, exitCode: 2, cards }; card.errors = [error.message]; }
  }
  const failed = cards.some((c) => c.errors?.length); return { status: failed ? 'FAIL' : 'PASS', exitCode: failed ? 1 : 0, width: WIDTH, cards };
}
async function main(argv) { try { const args = parseArgs(argv); const result = await runBatch(args); process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); return result.exitCode; } catch (error) { process.stdout.write(`${JSON.stringify({ status: 'SKIPPED', reason: error.message, exitCode: 2, cards: [] }, null, 2)}\n`); return 2; } }
if (require.main === module) main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
module.exports = { WIDTH, staticCheck, parseArgs, expandGlob, resolveBundlePaths, cardUrl, defaultBrowserRunner, runBatch, main };
