#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * post-publish-verify.js <slug>
 *
 * Public read-only verification for an infocard release:
 *   1. detail page HTTP 200
 *   2. live _index.yaml contains the slug
 *   3. live homepage HTML contains the slug or title keyword
 *
 * No writes. Exits non-zero on FAIL/PENDING.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..');
const BASE_URL = process.env.INFOCARD_BASE_URL || 'https://ccwq.github.io/infocard-pub';
const slug = process.argv[2];

if (!slug || slug === '--help' || slug === '-h') {
  console.error('Usage: node scripts/post-publish-verify.js <slug>');
  process.exit(2);
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseScalar(text, name) {
  const match = text.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  if (!match) return null;
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

function findMetaBySlug(slugValue) {
  const docsDir = path.join(ROOT_DIR, 'docs');
  const stack = [docsDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name.endsWith('.meta.yaml')) {
        const raw = readText(full);
        if (parseScalar(raw, 'slug') === slugValue) return { path: full, raw };
      }
    }
  }
  return null;
}

function request(method, url, timeoutMs = 20000) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.request(url, { method, timeout: timeoutMs, headers: { 'User-Agent': 'Hermes infocard verifier' } }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve({ ok: true, status: res.statusCode, body: Buffer.concat(chunks).toString('utf8'), headers: res.headers }));
    });
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    req.on('error', (error) => resolve({ ok: false, status: 0, error: error.message, body: '' }));
    req.end();
  });
}

function absolutize(pathOrUrl) {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${BASE_URL.replace(/\/$/, '')}/${pathOrUrl.replace(/^\/?/, '')}`;
}

async function main() {
  const meta = findMetaBySlug(slug);
  if (!meta) {
    console.error(`[post-publish-verify] FAIL local meta not found for slug=${slug}`);
    process.exit(1);
  }
  const cardPath = parseScalar(meta.raw, 'path');
  const title = parseScalar(meta.raw, 'title') || slug;
  const detailUrl = absolutize(cardPath);
  const indexUrl = `${BASE_URL.replace(/\/$/, '')}/_index.yaml?ts=${Date.now()}`;
  const homeUrl = `${BASE_URL.replace(/\/$/, '')}/?ts=${Date.now()}`;

  const results = [];
  const detail = await request('GET', detailUrl);
  results.push({ name: 'detail HTTP 200', pass: detail.status === 200, detail: `${detail.status || detail.error} ${detailUrl}` });

  const liveIndex = await request('GET', indexUrl);
  results.push({ name: 'live _index.yaml contains slug', pass: liveIndex.status === 200 && liveIndex.body.includes(slug), detail: `${liveIndex.status || liveIndex.error} ${indexUrl}` });

  const home = await request('GET', homeUrl);
  const titleNeedle = title.split(/[·：:丨|\-]/)[0].trim();
  const found = home.status === 200 && (home.body.includes(slug) || (titleNeedle && home.body.includes(titleNeedle)));
  results.push({ name: 'homepage HTML contains slug/title', pass: found, detail: `${home.status || home.error} ${homeUrl}` });

  for (const item of results) {
    console.log(`[post-publish-verify] ${item.pass ? 'PASS' : 'FAIL'} ${item.name} | ${item.detail}`);
  }
  const ok = results.every((r) => r.pass);
  console.log(`[post-publish-verify] ${ok ? 'OK' : 'NOT_READY'} slug=${slug}`);
  if (!ok) process.exit(1);
}

main().catch((error) => {
  console.error(`[post-publish-verify] ERROR ${error.stack || error.message}`);
  process.exit(1);
});
