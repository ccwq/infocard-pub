#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { loadBundle, validateBundle } = require('./lib/publish-bundle');
const ROOT = path.resolve(__dirname, '..');
const WIDTH = 390, HEIGHT = 844;
const DEFAULT_CDP = process.env.MOBILE_CDP_URL || 'http://127.0.0.1:9222';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function stripComments(text) { return text.replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\//g, ''); }
function staticCheck(html) {
  const clean = stripComments(html).replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  const styles = [...clean.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n').replace(/(['"`])(?:\\.|(?!\1)[\s\S])*\1/g, '');
  const errors = [];
  if (!/<meta\b(?=[^>]*\bname\s*=\s*["']?viewport\b)(?=[^>]*\bcontent\s*=\s*["'][^"']*width\s*=\s*device-width)[^>]*>/i.test(clean)) errors.push({ code: 'VIEWPORT', message: 'missing viewport width=device-width' });
  if (!/@media\s*(?:screen\s+and\s*)?\([^)]*(?:max-width\s*:|width\s*<=)[^)]*\)\s*\{/i.test(styles)) errors.push({ code: 'MOBILE_MEDIA', message: 'missing inline mobile max-width media rule' });
  const coverage = Object.fromEntries(['table','pre','code'].map((tag) => [tag, { maxWidth: false, overflow: false }]));
  for (const match of styles.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
    const selectors = match[1].split(',').map((v) => v.trim()), declarations = match[2];
    const maxWidth = /(?:^|;)\s*max-width\s*:\s*100%\s*(?:!important\s*)?(?:;|$)/i.test(`;${declarations};`);
    const overflow = /(?:^|;)\s*overflow(?:-x)?\s*:\s*auto\s*(?:!important\s*)?(?:;|$)/i.test(`;${declarations};`);
    for (const tag of Object.keys(coverage)) if (selectors.some((s) => new RegExp(`(^|[^a-z0-9_-])${tag}([^a-z0-9_-]|$)`, 'i').test(s))) { coverage[tag].maxWidth ||= maxWidth; coverage[tag].overflow ||= overflow; }
  }
  for (const [tag, rule] of Object.entries(coverage)) if (!rule.maxWidth || !rule.overflow) errors.push({ code: `RESPONSIVE_${tag.toUpperCase()}`, message: `${tag} requires inline max-width:100% overflow:auto` });
  return { ok: !errors.length, errors };
}
function parseArgs(argv) {
  const result = { bundlePaths: [], bundleGlobs: [], baseUrl: 'http://127.0.0.1:4173', root: ROOT, cdpUrl: DEFAULT_CDP };
  for (let i = 0; i < argv.length; i++) { const flag = argv[i]; if (!['--bundle','--bundles','--base-url','--root','--artifacts-dir','--cdp-url'].includes(flag)) throw new Error(`unknown argument: ${flag}`); const value = argv[++i]; if (!value) throw new Error(`missing value ${flag}`); if (flag === '--bundle') result.bundlePaths.push(value); else if (flag === '--bundles') result.bundleGlobs.push(value); else if (flag === '--base-url') result.baseUrl = value; else if (flag === '--root') result.root = path.resolve(value); else if (flag === '--cdp-url') result.cdpUrl = value; else result.artifactsDir = path.resolve(value); }
  return result;
}
function expandGlob(pattern) { const absolute = path.resolve(pattern), star = absolute.search(/[?*]/); if (star < 0) return fs.existsSync(absolute) ? [absolute] : []; const split = absolute.lastIndexOf(path.sep, star), dir = absolute.slice(0, split) || path.parse(absolute).root, base = absolute.slice(split + 1), regex = new RegExp(`^${base.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`); return fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isFile() && regex.test(e.name)).map((e) => path.join(dir, e.name)).sort() : []; }
function resolveBundlePaths(paths, globs) { return [...new Set([...paths.map((p) => path.resolve(p)), ...globs.flatMap(expandGlob)])]; }
function inside(root, target) { const rel = path.relative(root, target); return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel)); }
function safeExistingFile(root, relative) { const target = path.resolve(root, relative); if (!inside(root, target)) throw new Error('path escapes repository'); const realRoot = fs.realpathSync(root), real = fs.realpathSync(target); if (!inside(realRoot, real) || !fs.statSync(real).isFile()) throw new Error('path escapes repository through symlink'); return real; }
function rejectSymlinkComponents(root, target) { const rel = path.relative(root, target); if (!inside(root, target)) throw new Error('artifact path escapes repository'); let current = root; for (const part of rel.split(path.sep)) { current = path.join(current, part); try { if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`artifact symlink forbidden: ${current}`); } catch (e) { if (e.code !== 'ENOENT') throw e; } } }
function expectedScreenshot(root, slug, artifactsDir) { const realRoot = fs.realpathSync(root), parent = path.resolve(artifactsDir || path.join(root, 'artifacts/mobile')); if (!inside(root, parent)) throw new Error('artifacts parent escapes repository'); rejectSymlinkComponents(root, parent); fs.mkdirSync(parent, { recursive: true }); const realParent = fs.realpathSync(parent); if (!inside(realRoot, realParent)) throw new Error('artifacts parent realpath escapes repository'); const target = path.join(parent, `${slug}.png`); rejectSymlinkComponents(root, target); if (!inside(realParent, path.resolve(target))) throw new Error('unsafe screenshot path'); return target; }
function cardUrl(baseUrl, htmlPath) { return new URL(htmlPath.replaceAll(path.sep, '/').replace(/^\/+/, ''), baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).href; }
async function fetchJson(url, options = {}) { const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 3000); try { const r = await fetch(url, { ...options, signal: controller.signal }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return await r.json(); } finally { clearTimeout(timer); } }
function cdpSocket(wsUrl, timeoutMs = 15000, WebSocketFactory = (url) => new WebSocket(url)) {
  const ws = WebSocketFactory(wsUrl), pending = new Map(); let next = 0, state = 'opening'; let openResolve, openReject;
  const opened = new Promise((resolve, reject) => { openResolve = resolve; openReject = reject; });
  const connectTimer = setTimeout(() => fail(new Error('CDP connect timeout')), timeoutMs);
  function fail(error) { if (state === 'failed' || state === 'closed') return; const wasOpening = state === 'opening'; state = 'failed'; clearTimeout(connectTimer); if (wasOpening) openReject(error); for (const p of pending.values()) { clearTimeout(p.timer); p.reject(error); } pending.clear(); }
  ws.addEventListener('open', () => { if (state !== 'opening') return; state = 'open'; clearTimeout(connectTimer); openResolve(); });
  ws.addEventListener('error', () => fail(new Error('CDP WebSocket error')));
  ws.addEventListener('close', () => fail(new Error('CDP WebSocket closed')));
  ws.addEventListener('message', (event) => { let msg; try { msg = JSON.parse(event.data); } catch { fail(new Error('CDP malformed JSON')); return; } if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); clearTimeout(p.timer); msg.error ? p.reject(new Error(msg.error.message || 'CDP protocol error')) : p.resolve(msg.result || {}); } });
  function send(method, params = {}, sessionId) { if (state === 'failed' || state === 'closed') return Promise.reject(new Error('CDP connection unavailable')); return opened.then(() => new Promise((resolve, reject) => { const id = ++next, timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, timeoutMs); pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); })); }
  function close() { if (state === 'closed') return; fail(new Error('CDP closed')); state = 'closed'; try { ws.close(); } catch {} }
  return { send, close };
}
async function probeBrowser(cdpUrl = DEFAULT_CDP, fetcher = fetchJson) { try { const version = await fetcher(`${cdpUrl.replace(/\/$/, '')}/json/version`); if (!version.webSocketDebuggerUrl) throw new Error('browser websocket unavailable'); return version; } catch (error) { error.code = 'BROWSER_UNAVAILABLE'; throw error; } }
async function defaultBrowserRunner({ url, width, height, screenshotPath, cdpUrl = DEFAULT_CDP, fetcher = fetchJson, clientFactory = cdpSocket, readinessTimeoutMs = 10000 }) {
  let cdp, contextId, targetId, sessionId;
  try { const version = await probeBrowser(cdpUrl, fetcher); cdp = clientFactory(version.webSocketDebuggerUrl); try { ({ browserContextId: contextId } = await cdp.send('Target.createBrowserContext')); } catch { contextId = undefined; } const created = await cdp.send('Target.createTarget', { url: 'about:blank', ...(contextId ? { browserContextId: contextId } : {}) }); targetId = created.targetId; if (!targetId) throw new Error('CDP did not create target'); ({ sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true })); if (!sessionId) throw new Error('CDP did not attach target');
    await cdp.send('Page.enable', {}, sessionId); await cdp.send('Runtime.enable', {}, sessionId); await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true }, sessionId); const nav = await cdp.send('Page.navigate', { url }, sessionId); if (nav.errorText) throw new Error(`Page.navigate failed: ${nav.errorText}`);
    const deadline = Date.now() + readinessTimeoutMs; let settled = false;
    while (Date.now() < deadline) { const r = await cdp.send('Runtime.evaluate', { expression: `(() => ({ready:document.readyState==='complete',settled:document.readyState==='complete'&&(!document.fonts||document.fonts.status==='loaded')&&[...document.images].every(i=>i.complete)}))()`, returnByValue: true, awaitPromise: true }, sessionId); const value = r.result?.value; if (value?.ready && value?.settled) { settled = true; break; } await sleep(25); }
    if (!settled) throw new Error('document readiness timeout');
    const measured = await cdp.send('Runtime.evaluate', { expression: `(() => {const d=document.documentElement;return {scrollWidth:d.scrollWidth,clientWidth:d.clientWidth,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.currentSrc||i.src)}})()`, returnByValue: true }, sessionId);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: true }, sessionId); fs.mkdirSync(path.dirname(screenshotPath), { recursive: true }); fs.writeFileSync(screenshotPath, Buffer.from(shot.data || '', 'base64'));
    return { ...measured.result?.value, screenshot: `artifacts/mobile/${path.basename(screenshotPath)}` };
  } finally { if (cdp) { if (sessionId) try { await cdp.send('Target.detachFromTarget', { sessionId }); } catch {} if (targetId) try { await cdp.send('Target.closeTarget', { targetId }); } catch {} if (contextId) try { await cdp.send('Target.disposeBrowserContext', { browserContextId: contextId }); } catch {} cdp.close(); } }
}
function pngDimensions(file) { const b = fs.readFileSync(file); if (b.length < 24 || !b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || b.toString('ascii',12,16) !== 'IHDR') throw new Error('invalid PNG'); return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) }; }
function validateEvidence(e, screenshotPath, root, slug) { const errors = [], expected = path.relative(root, screenshotPath).replaceAll(path.sep, '/'); if (!e || !Number.isFinite(e.scrollWidth) || !Number.isFinite(e.clientWidth)) errors.push('scroll/client widths must be finite'); else { if (e.clientWidth !== WIDTH) errors.push(`clientWidth must equal ${WIDTH}`); if (e.scrollWidth > e.clientWidth + 1) errors.push('horizontal overflow'); } if (!Array.isArray(e?.brokenImages) || e.brokenImages.length) errors.push('broken images detected or evidence malformed'); if (e?.screenshot !== expected || expected !== `artifacts/mobile/${slug}.png`) errors.push('unexpected screenshot path'); try { const stat = fs.statSync(screenshotPath), d = pngDimensions(screenshotPath); if (!stat.isFile() || !stat.size) throw new Error(); if (d.width !== WIDTH || d.height < 1) errors.push(`PNG dimensions must be ${WIDTH}px wide and nonzero`); } catch { errors.push('screenshot must be a nonempty valid PNG'); } return errors; }
async function runBatch(options = {}) {
  const root = path.resolve(options.root || ROOT), runner = options.runner || defaultBrowserRunner, bundlePaths = resolveBundlePaths(options.bundlePaths || [], options.bundleGlobs || []); if (!bundlePaths.length) return { status:'SKIPPED', reason:'no bundles supplied', exitCode:2, cards:[] };
  const probe = options.probe || ((cdpUrl) => probeBrowser(cdpUrl)); try { await probe(options.cdpUrl || DEFAULT_CDP); } catch (error) { if (error.code === 'BROWSER_UNAVAILABLE') return { status:'SKIPPED', reason:error.message, browserUnavailable:error.message, exitCode:2, cards:[] }; throw error; }
  const cards = []; let browserUnavailable;
  for (const bundlePath of bundlePaths) { const card = { bundlePath }; cards.push(card); let bundle; try { bundle = loadBundle(bundlePath); const checked = validateBundle(bundle); if (!checked.valid) throw new Error(checked.errors.map((e) => `${e.field}: ${e.message}`).join('; ')); card.slug=bundle.slug; card.htmlPath=bundle.html_path; card.static=staticCheck(fs.readFileSync(safeExistingFile(root,bundle.html_path),'utf8')); if (!card.static.ok) { card.errors=card.static.errors.map((e)=>e.message); continue; } const screenshotPath=expectedScreenshot(root,bundle.slug,options.artifactsDir); fs.rmSync(screenshotPath,{force:true}); card.browser=await runner({url:cardUrl(options.baseUrl||'http://127.0.0.1:4173',bundle.html_path),width:WIDTH,height:HEIGHT,screenshotPath,cdpUrl:options.cdpUrl||DEFAULT_CDP}); card.errors=validateEvidence(card.browser,screenshotPath,root,bundle.slug); } catch(error) { if(error.code==='BROWSER_UNAVAILABLE'){browserUnavailable=error.message; card.errors=[error.message]; break;} card.errors=[error.message]; } }
  const failed=cards.some((c)=>c.errors?.length); if(browserUnavailable && !cards.slice(0,-1).some((c)=>c.errors?.length)) return {status:'SKIPPED',reason:browserUnavailable,browserUnavailable,exitCode:2,cards}; return {status:failed?'FAIL':'PASS',exitCode:failed?1:0,width:WIDTH,cards,...(browserUnavailable?{browserUnavailable}:{})};
}
async function main(argv) { try { const result=await runBatch(parseArgs(argv)); process.stdout.write(`${JSON.stringify(result,null,2)}\n`); return result.exitCode; } catch(error) { process.stdout.write(`${JSON.stringify({status:'SKIPPED',reason:error.message,exitCode:2,cards:[]},null,2)}\n`); return 2; } }
if(require.main===module) main(process.argv.slice(2)).then((code)=>{process.exitCode=code;});
module.exports={WIDTH,staticCheck,parseArgs,expandGlob,resolveBundlePaths,cardUrl,cdpSocket,probeBrowser,defaultBrowserRunner,validateEvidence,runBatch,main};
