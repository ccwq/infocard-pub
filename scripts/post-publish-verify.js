#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Public release verification. Transport/fingerprint success is deliberately
 * independent from the later public screenshot delivery task.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_BASE_URL = 'https://ccwq.github.io/infocard-pub';

function parseScalar(text, name) {
  const match = text.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

function findMetaBySlug(slugValue, rootDir = ROOT_DIR) {
  const docsDir = path.join(rootDir, 'docs');
  const stack = [docsDir];
  while (stack.length) {
    const dir = stack.pop();
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name.endsWith('.meta.yaml')) {
        const raw = fs.readFileSync(full, 'utf8');
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
      res.on('data', (data) => chunks.push(data));
      res.on('end', () => resolve({ ok: true, status: res.statusCode, body: Buffer.concat(chunks).toString('utf8'), headers: res.headers }));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', (error) => resolve({ ok: false, status: 0, error: error.message, body: '' }));
    req.end();
  });
}

function absolutize(pathOrUrl, baseUrl) {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${baseUrl.replace(/\/$/, '')}/${pathOrUrl.replace(/^\/?/, '')}`;
}

function buildReleaseFingerprint({ slug, title, localHtml = '' }) {
  const markers = [slug, title].filter(Boolean);
  const theme = localHtml.match(/data-theme=["']([^"']+)["']/i);
  if (theme) markers.push(`data-theme=\"${theme[1]}\"`);
  const sections = [...localHtml.matchAll(/<section\b[^>]*\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  if (sections.length) markers.push(...sections.slice(0, 3));
  return { slug, title, markers: [...new Set(markers)] };
}

function evaluateRelease({ detail, fingerprint }) {
  const body = typeof detail.body === 'string' ? detail.body : '';
  const missing = (fingerprint.markers || []).filter((marker) => !body.includes(marker));
  const httpPass = detail.status === 200;
  return {
    status: httpPass && missing.length === 0 ? 'PUBLISHED_VERIFIED' : 'PAGES_PENDING',
    http_pass: httpPass,
    fingerprint_pass: missing.length === 0,
    missing_markers: missing,
  };
}

function evaluatePublicVisualEvidence({ desktopPath, mobilePath, errorCategory } = {}) {
  if (desktopPath && mobilePath) return { status: 'PUBLIC_VISUAL_CAPTURED', desktop_path: desktopPath, mobile_path: mobilePath, evidence_gap: false };
  return errorCategory
    ? { status: 'PUBLIC_VISUAL_FAILED', evidence_gap: true, error_category: errorCategory }
    : { status: 'PUBLIC_VISUAL_PENDING', evidence_gap: true };
}

function buildChannelPayload({ detailUrl, releaseCommit, fingerprint, desktopPath, mobilePath, visualEvidence }) {
  return {
    detail_url: detailUrl,
    release_commit: releaseCommit || null,
    release_fingerprint: fingerprint,
    desktop_first_screen: desktopPath || null,
    mobile_first_screen: mobilePath || null,
    public_visual_status: visualEvidence.status,
  };
}

async function verifyPublicRelease({ slug, rootDir = ROOT_DIR, baseUrl = process.env.INFOCARD_BASE_URL || DEFAULT_BASE_URL, requestFn = request } = {}) {
  const meta = findMetaBySlug(slug, rootDir);
  if (!meta) return { release: { status: 'PAGES_PENDING', http_pass: false, fingerprint_pass: false, missing_markers: ['local_meta'] }, public_visual: evaluatePublicVisualEvidence({ errorCategory: 'local_meta_missing' }) };
  const cardPath = parseScalar(meta.raw, 'path');
  const title = parseScalar(meta.raw, 'title') || slug;
  const localHtmlPath = path.resolve(rootDir, cardPath);
  const localHtml = fs.existsSync(localHtmlPath) ? fs.readFileSync(localHtmlPath, 'utf8') : '';
  const fingerprint = buildReleaseFingerprint({ slug, title, localHtml });
  const detailUrl = absolutize(`${cardPath}?release=${encodeURIComponent(slug)}`, baseUrl);
  const detail = await requestFn('GET', detailUrl);
  const release = evaluateRelease({ detail, fingerprint });
  return { release, public_visual: evaluatePublicVisualEvidence({}), detail_url: detailUrl, fingerprint };
}

async function main(slug = process.argv[2], options = {}) {
  if (!slug || slug === '--help' || slug === '-h') throw new Error('Usage: node scripts/post-publish-verify.js <slug>');
  const result = await verifyPublicRelease({ slug, ...options });
  console.log(`[post-publish-verify] ${result.release.http_pass ? 'PASS' : 'FAIL'} detail HTTP 200 | ${result.detail_url}`);
  console.log(`[post-publish-verify] ${result.release.fingerprint_pass ? 'PASS' : 'FAIL'} release fingerprint | ${result.fingerprint.markers.join(', ')}`);
  console.log(`[post-publish-verify] release_status=${result.release.status}`);
  console.log(`[post-publish-verify] public_visual_status=${result.public_visual.status} (post-release, non-blocking)`);
  if (result.release.status !== 'PUBLISHED_VERIFIED') throw new Error('NOT_READY');
  return result;
}

if (require.main === module) main().catch((error) => { console.error(`[post-publish-verify] ${error.message}`); process.exitCode = 1; });

module.exports = { parseScalar, findMetaBySlug, request, buildReleaseFingerprint, evaluateRelease, evaluatePublicVisualEvidence, buildChannelPayload, verifyPublicRelease, main };
