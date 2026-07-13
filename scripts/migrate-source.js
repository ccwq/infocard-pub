#!/usr/bin/env node
/**
 * migrate-source.js
 * One-time migration: clean taxonomy.source values that contain URLs, domain names,
 * or non-enum source names, replacing them with canonical enum values inferred
 * from source_url. Unknown/uninferrable defaults to User-provided.
 * Only touches taxonomy.source; leaves all other fields untouched.
 */
const fs = require('fs');
const path = require('path');
const yaml = require('../assets/home/vendor/js-yaml.min.js');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');

const CANONICAL_SOURCE = new Set([
  'GitHub',
  'X / Twitter',
  'Website',
  'Blog',
  'PDF',
  'Paper',
  'Wikipedia',
  'Screenshot',
  'User-provided',
  'News',
  'Video',
]);

const CANONICAL_SOURCE_LOWER = new Set(
  [...CANONICAL_SOURCE].map(v => v.toLowerCase())
);

const URL_RE = /^https?:\/\//i;
const DOMAIN_RE = /\.(com|org|net|io|ai|dev|cc|co|me|app|dev|gov|edu|info|biz|xyz|top|cc|tv|sh|io|ai)$/i;

function canonicalizeSource(rawValues) {
  if (!Array.isArray(rawValues)) return [];
  const cleaned = rawValues
    .map(v => String(v || '').trim())
    .filter(Boolean)
    .map(v => {
      // Already canonical
      if (CANONICAL_SOURCE_LOWER.has(v.toLowerCase())) return v;
      // URL — drop it (will be inferred from source_url)
      if (URL_RE.test(v)) return null;
      // Domain-like string — drop it
      if (DOMAIN_RE.test(v)) return null;
      // Case-variant GitHub — normalize
      if (/^github$/i.test(v)) return 'GitHub';
      // Other non-canonical strings — drop
      return null;
    })
    .filter(Boolean);
  return cleaned.length ? cleaned : null;
}

function inferSourceFromUrl(sourceUrl) {
  if (!sourceUrl) return null;
  const url = String(sourceUrl).toLowerCase();
  if (/github\.com/.test(url)) return 'GitHub';
  if (/x\.com|twitter\.com/.test(url)) return 'X / Twitter';
  if (/wikipedia\.org/.test(url)) return 'Wikipedia';
  if (/arxiv|doi\.org|acm\.org|nature\.com|dl\.acm/.test(url)) return 'Paper';
  if (/\.pdf($|\?)/i.test(url)) return 'PDF';
  if (/youtube\.com|youtu\.be|bilibili\.com/.test(url)) return 'Video';
  return 'Website';
}

function walkMeta(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMeta(full, acc);
    else if (ent.isFile() && ent.name.endsWith('.meta.yaml')) acc.push(full);
  }
  return acc.sort();
}

function readMeta(p) {
  try {
    return yaml.load(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function writeMeta(p, data) {
  fs.writeFileSync(p, yaml.dump(data, { lineWidth: -1, quotingLevel: yaml.QUOTING_MINIMAL }), 'utf8');
}

const files = walkMeta(DOCS);
let changed = 0;
let errors = 0;

for (const fp of files) {
  const meta = readMeta(fp);
  if (!meta || !meta.taxonomy) continue;

  const rawSource = meta.taxonomy.source || [];
  const cleaned = canonicalizeSource(rawSource);

  // If already clean, skip
  const stillDirty = (cleaned || []).some(v => !CANONICAL_SOURCE_LOWER.has(v.toLowerCase()));
  if (!stillDirty && cleaned && cleaned.length > 0) continue;

  // Determine final source
  let finalSource;
  if (cleaned && cleaned.length > 0) {
    finalSource = cleaned;
  } else {
    const inferred = inferSourceFromUrl(meta.source_url);
    finalSource = inferred ? [inferred] : ['User-provided'];
  }

  meta.taxonomy.source = finalSource;

  try {
    writeMeta(fp, meta);
    changed++;
    const rel = path.relative(ROOT, fp);
    console.log(`[MIGRATE] ${rel}: ${JSON.stringify(rawSource)} → ${JSON.stringify(finalSource)}`);
  } catch (err) {
    errors++;
    console.error(`[ERROR] ${fp}: ${err.message}`);
  }
}

console.log(`\nDone: ${changed} files migrated, ${errors} errors, ${files.length - changed - errors} skipped.`);
process.exit(errors > 0 ? 1 : 0);
