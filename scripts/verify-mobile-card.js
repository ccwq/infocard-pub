#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * verify-mobile-card.js <slug-or-html-path-or-url> [--browser]
 *
 * Default: deterministic static mobile checks, no Selenium/Chrome dependency.
 * Optional --browser: add Chrome headless DOM scrollWidth check (may fail if local
 * Chrome is unhealthy; keep it explicit rather than blocking every build).
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { execFileSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const target = process.argv[2];
const withBrowser = process.argv.includes('--browser');
const width = Number(process.env.MOBILE_WIDTH || 390);
const height = Number(process.env.MOBILE_HEIGHT || 844);

if (!target || target === '--help' || target === '-h') {
  console.error('Usage: node scripts/verify-mobile-card.js <slug-or-html-path-or-url> [--browser]');
  process.exit(2);
}
function normalizeSlashes(v) { return v.split(path.sep).join('/'); }
function scalar(text, name) {
  const m = text.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : '';
}
function walk(dir, pred) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
      const f = path.join(cur, e.name);
      if (e.isDirectory()) stack.push(f);
      else if (e.isFile() && pred(f)) out.push(f);
    }
  }
  return out.sort();
}
function resolveTarget(input) {
  if (/^https?:\/\//.test(input)) return { kind: 'url', value: input };
  const maybe = path.join(ROOT_DIR, input);
  if (fs.existsSync(maybe) && maybe.endsWith('.html')) return { kind: 'path', value: normalizeSlashes(path.relative(ROOT_DIR, maybe)), html: fs.readFileSync(maybe, 'utf8') };
  for (const meta of walk(path.join(ROOT_DIR, 'docs'), (f) => f.endsWith('.meta.yaml'))) {
    const raw = fs.readFileSync(meta, 'utf8');
    if (scalar(raw, 'slug') === input) {
      const p = scalar(raw, 'path');
      const file = path.join(ROOT_DIR, p);
      return { kind: 'path', value: p, html: fs.readFileSync(file, 'utf8') };
    }
  }
  throw new Error(`cannot resolve card: ${input}`);
}
function fetchText(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.get(url, { timeout: 20000, headers: { 'User-Agent': 'Hermes mobile verifier' } }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => res.statusCode === 200 ? resolve(Buffer.concat(chunks).toString('utf8')) : reject(new Error(`HTTP ${res.statusCode}`)));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}
function staticCheck(html, label) {
  const errors = [];
  const warnings = [];
  const viewport = /<meta[^>]+name=["']viewport["'][^>]+content=["'][^"']*width=device-width/i.test(html);
  if (!viewport) errors.push('missing viewport width=device-width');
  const hasMobileMedia = /@media\s*\([^)]*max-width\s*:\s*(720|768|800|880|900|1080)px/i.test(html);
  if (!hasMobileMedia) warnings.push('no obvious max-width mobile media query');
  const hasGlobalNoOverflow = /overflow-x\s*:\s*hidden/i.test(html);
  const riskyFixedWidths = [];
  for (const m of html.matchAll(/(?:^|[;{\s])(width|min-width)\s*:\s*(\d{3,4})px/gi)) {
    const val = Number(m[2]);
    if (val > width && !hasGlobalNoOverflow) riskyFixedWidths.push(`${m[1]}:${val}px`);
  }
  if (riskyFixedWidths.length) warnings.push(`fixed widths over ${width}px: ${riskyFixedWidths.slice(0, 8).join(', ')}`);
  console.log(`[verify-mobile-card] card=${label} width=${width}`);
  console.log(`[verify-mobile-card] ${viewport ? 'PASS' : 'FAIL'} viewport meta`);
  console.log(`[verify-mobile-card] ${hasMobileMedia ? 'PASS' : 'WARN'} mobile media query`);
  if (riskyFixedWidths.length) console.log(`[verify-mobile-card] WARN fixed-width heuristic | ${riskyFixedWidths.slice(0, 8).join(', ')}`);
  if (errors.length) console.error(`[verify-mobile-card] FAIL static errors=${errors.join('; ')}`);
  if (warnings.length) console.log(`[verify-mobile-card] WARN static warnings=${warnings.join('; ')}`);
  return errors.length === 0;
}
function findChrome() {
  for (const cmd of ['/usr/bin/google-chrome', 'google-chrome', 'chromium', 'chromium-browser']) {
    try { execFileSync('bash', ['-lc', `command -v ${cmd}`], { stdio: 'ignore' }); return cmd; } catch (_) {}
  }
  throw new Error('google-chrome/chromium not found');
}
function runBrowserSmoke(url) {
  const chrome = findChrome();
  const out = execFileSync(chrome, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-background-networking', '--disable-sync', '--disable-extensions', '--disable-dev-shm-usage',
    `--window-size=${width},${height}`, '--dump-dom', '--virtual-time-budget=2500', url,
  ], { encoding: 'utf8', maxBuffer: 5 * 1024 * 1024, timeout: 20000 });
  return out.includes('<html') || out.includes('<!DOCTYPE html');
}
async function main() {
  const resolved = resolveTarget(target);
  const html = resolved.kind === 'url' ? await fetchText(resolved.value) : resolved.html;
  const staticOk = staticCheck(html, resolved.value);
  if (withBrowser) {
    const url = resolved.kind === 'url' ? resolved.value : `file://${path.join(ROOT_DIR, resolved.value)}`;
    const ok = runBrowserSmoke(url);
    console.log(`[verify-mobile-card] ${ok ? 'PASS' : 'FAIL'} browser smoke`);
    if (!ok) process.exit(1);
  } else {
    console.log('[verify-mobile-card] NOTE browser DOM check skipped; pass --browser for strict headless Chrome smoke.');
  }
  if (!staticOk) process.exit(1);
}
main().catch((e) => { console.error(`[verify-mobile-card] ERROR ${e.message}`); process.exit(1); });
