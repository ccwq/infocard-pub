#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * audit-wiki-coverage.js
 *
 * Read-only audit: compare infocard-pub metadata sidecars against
 * LLM Wiki raw article markdown files by public infocard URL and source_url.
 *
 * No writes. Output missing / duplicate / ambiguous coverage signals.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const WIKI_DIR = process.env.WIKI_PATH || '/home/ccwq/hehome/hermes-data/home/wiki';
const BASE_URL = process.env.INFOCARD_BASE_URL || 'https://ccwq.github.io/infocard-pub';
const limit = Number(process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || '50');
const jsonMode = process.argv.includes('--json');

function normalizeSlashes(value) { return value.split(path.sep).join('/'); }
function walk(dir, predicate) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && predicate(full)) out.push(full);
    }
  }
  return out.sort();
}
function read(file) { return fs.readFileSync(file, 'utf8'); }
function scalar(text, name) {
  const match = text.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  if (!match) return '';
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}
function firstUrl(text) {
  const m = text.match(/https?:\/\/[^\s)\]>"']+/);
  return m ? m[0].replace(/[.,;]+$/, '') : '';
}
function publicUrlForPath(p) {
  return `${BASE_URL.replace(/\/$/, '')}/${p.replace(/^\/?/, '')}`;
}
function collectCards() {
  return walk(DOCS_DIR, (f) => f.endsWith('.meta.yaml')).map((metaPath) => {
    const raw = read(metaPath);
    const rel = normalizeSlashes(path.relative(ROOT_DIR, metaPath));
    const cardPath = scalar(raw, 'path');
    return {
      meta: rel,
      slug: scalar(raw, 'slug'),
      title: scalar(raw, 'title'),
      path: cardPath,
      public_url: cardPath ? publicUrlForPath(cardPath) : '',
      source_url: scalar(raw, 'source_url') || scalar(raw, 'source') || '',
    };
  });
}
function collectRawWiki() {
  const rawDir = path.join(WIKI_DIR, 'raw', 'articles');
  return walk(rawDir, (f) => f.endsWith('.md')).map((file) => {
    const text = read(file);
    const rel = normalizeSlashes(path.relative(WIKI_DIR, file));
    const sourceUrl = scalar(text, 'source_url');
    const infocardUrl = scalar(text, 'infocard_url') || scalar(text, 'public_url');
    const anyUrl = firstUrl(text);
    return { file: rel, source_url: sourceUrl, infocard_url: infocardUrl, any_url: anyUrl, text };
  });
}
function mapBy(items, keys) {
  const m = new Map();
  for (const item of items) {
    const uniqueKeys = Array.from(new Set(keys(item).filter(Boolean)));
    for (const key of uniqueKeys) {
      if (!m.has(key)) m.set(key, new Map());
      m.get(key).set(item.file, item);
    }
  }
  const out = new Map();
  for (const [key, byFile] of m.entries()) out.set(key, Array.from(byFile.values()));
  return out;
}
function main() {
  const cards = collectCards();
  const raws = collectRawWiki();
  const rawByUrl = mapBy(raws, (r) => [r.source_url, r.infocard_url, r.any_url]);

  const missing = [];
  const covered = [];
  const duplicates = [];
  for (const card of cards) {
    const keys = [card.public_url, card.source_url].filter(Boolean);
    const hits = new Map();
    for (const key of keys) for (const r of rawByUrl.get(key) || []) hits.set(r.file, r);
    if (hits.size) covered.push({ card, hits: Array.from(hits.values()).map((h) => h.file) });
    else missing.push(card);
  }

  for (const [url, entries] of rawByUrl.entries()) {
    if (url && entries.length > 1) duplicates.push({ url, files: entries.map((e) => e.file) });
  }

  const result = { wiki: WIKI_DIR, cards: cards.length, raw_articles: raws.length, covered: covered.length, missing_count: missing.length, duplicate_url_count: duplicates.length, missing, duplicates };
  if (jsonMode) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`[audit-wiki-coverage] wiki=${WIKI_DIR}`);
    console.log(`[audit-wiki-coverage] cards=${cards.length} raw_articles=${raws.length} covered=${covered.length} missing=${missing.length} duplicate_urls=${duplicates.length}`);
    for (const card of missing.slice(0, limit)) console.log(`[audit-wiki-coverage] MISSING ${card.slug || '<no-slug>'} | ${card.title || ''} | ${card.public_url}`);
    if (missing.length > limit) console.log(`[audit-wiki-coverage] ... ${missing.length - limit} more missing (use --limit=N or --json)`);
    for (const d of duplicates.slice(0, 20)) console.log(`[audit-wiki-coverage] DUPLICATE ${d.url} | ${d.files.join(', ')}`);
  }
  if (missing.length || duplicates.length) process.exitCode = 1;
}

main();
