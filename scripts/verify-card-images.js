#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * verify-card-images.js <slug-or-path>
 *
 * Read-only image verifier. Local/site-relative image 404 is FAIL.
 * External failures are WARNING by default because remote hosts often block HEAD.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..');
const BASE_URL = process.env.INFOCARD_BASE_URL || 'https://ccwq.github.io/infocard-pub';
const target = process.argv[2];
const strictExternal = process.argv.includes('--strict-external');

if (!target || target === '--help' || target === '-h') {
  console.error('Usage: node scripts/verify-card-images.js <slug-or-html-path> [--strict-external]');
  process.exit(2);
}
function normalizeSlashes(v) { return v.split(path.sep).join('/'); }
function read(file) { return fs.readFileSync(file, 'utf8'); }
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
function resolveHtmlPath(input) {
  const maybe = path.join(ROOT_DIR, input);
  if (fs.existsSync(maybe) && maybe.endsWith('.html')) return normalizeSlashes(path.relative(ROOT_DIR, maybe));
  for (const meta of walk(path.join(ROOT_DIR, 'docs'), (f) => f.endsWith('.meta.yaml'))) {
    const raw = read(meta);
    if (scalar(raw, 'slug') === input) return scalar(raw, 'path');
  }
  throw new Error(`cannot resolve card: ${input}`);
}
function extractImageSrcs(html) {
  const srcs = [];
  // Scope intentionally limited to rendered image elements. CSS url() often
  // points to fonts/background decorations and belongs in a separate asset audit,
  // not the image-HTTP gate.
  for (const m of html.matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)) srcs.push(m[1]);
  for (const m of html.matchAll(/<source\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)) srcs.push(m[1]);
  for (const m of html.matchAll(/<source\b[^>]*\bsrcset\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    for (const part of m[1].split(',')) srcs.push(part.trim().split(/\s+/)[0]);
  }
  return Array.from(new Set(srcs)).filter((src) => src && !src.startsWith('data:') && !src.startsWith('blob:') && !src.startsWith('#'));
}
function absolutize(src, htmlPath) {
  if (/^https?:\/\//i.test(src)) return src;
  const base = new URL(`${BASE_URL.replace(/\/$/, '')}/${htmlPath}`);
  return new URL(src, base).toString();
}
function isLocalUrl(url) {
  return url.startsWith(`${BASE_URL.replace(/\/$/, '')}/`);
}
function request(url, method = 'HEAD', timeoutMs = 15000) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.request(url, { method, timeout: timeoutMs, headers: { 'User-Agent': 'Hermes image verifier', Range: 'bytes=0-2047' } }, (res) => {
      res.resume();
      res.on('end', () => resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 }));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', (e) => resolve({ status: 0, ok: false, error: e.message }));
    req.end();
  });
}
async function check(url) {
  let r = await request(url, 'HEAD');
  if (!r.ok && [0, 403, 405].includes(r.status)) r = await request(url, 'GET');
  return r;
}
async function main() {
  const htmlPath = resolveHtmlPath(target);
  const htmlFile = path.join(ROOT_DIR, htmlPath);
  const html = read(htmlFile);
  const srcs = extractImageSrcs(html);
  console.log(`[verify-card-images] card=${htmlPath} images=${srcs.length}`);
  let fail = 0;
  let warn = 0;
  for (const src of srcs) {
    const url = absolutize(src, htmlPath);
    const local = isLocalUrl(url);
    const r = await check(url);
    if (r.ok) console.log(`[verify-card-images] PASS ${r.status} ${src}`);
    else if (local || strictExternal) { fail++; console.error(`[verify-card-images] FAIL ${r.status || r.error} ${src}`); }
    else { warn++; console.log(`[verify-card-images] WARN ${r.status || r.error} ${src}`); }
  }
  console.log(`[verify-card-images] summary pass=${srcs.length - fail - warn} warn=${warn} fail=${fail}`);
  if (fail) process.exit(1);
}
main().catch((e) => { console.error(`[verify-card-images] ERROR ${e.stack || e.message}`); process.exit(1); });
