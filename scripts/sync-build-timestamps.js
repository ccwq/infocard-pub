#!/usr/bin/env node
/**
 * Stamp changed infocard metadata at the start of a publish build.
 *
 * Contract:
 * - New cards: date = updated = one shared Asia/Shanghai build timestamp.
 * - Existing changed cards: preserve date; updated = that build timestamp.
 * - Missing date on an existing card is repaired with the build timestamp.
 *
 * This is intentionally a write step. verify-meta-timestamps.js remains a
 * read-only release gate after this script runs.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const yaml = require('../assets/home/vendor/js-yaml.min.js');

const ROOT_DIR = path.resolve(__dirname, '..');
const TS_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
const DATE_RE = /^(date:\s*)(?:["'][^\r\n"']*["']|[^\r\n]*)\s*$/m;
const UPDATED_RE = /^(updated:\s*)(?:["'][^\r\n"']*["']|[^\r\n]*)\s*$/m;
const PATH_RE = /^(path:\s*[^\r\n]+)\s*$/m;

function git(args) {
  return execFileSync('git', args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function changedMetaFiles() {
  const files = new Set();
  for (const file of git(['diff', '--name-only', 'HEAD']).split(/\r?\n/).filter(Boolean)) files.add(file.replace(/\\/g, '/'));
  for (const file of git(['ls-files', '--others', '--exclude-standard', '--', 'docs']).split(/\r?\n/).filter(Boolean)) files.add(file.replace(/\\/g, '/'));
  return [...files].filter(file => file.startsWith('docs/') && file.endsWith('.meta.yaml')).sort();
}

function trackedAtHead(file) {
  try {
    execFileSync('git', ['cat-file', '-e', `HEAD:${file}`], { cwd: ROOT_DIR, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function extractValue(raw, re) {
  const match = raw.match(re);
  if (!match) return null;
  return match[0].replace(/^[^:]+:\s*/, '').trim().replace(/^["']|["']$/g, '');
}

function upsert(raw, field, re, value) {
  const line = `${field}: "${value}"`;
  if (re.test(raw)) return raw.replace(re, line);
  const pathMatch = raw.match(PATH_RE);
  if (!pathMatch) throw new Error('missing path field');
  return raw.replace(PATH_RE, `${pathMatch[1]}\n${line}`);
}

function comparableMeta(raw) {
  const data = yaml.load(raw, { schema: yaml.FAILSAFE_SCHEMA });
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const comparable = { ...data };
  // Taxonomy-only migrations should not make a card look newly updated.
  delete comparable.taxonomy;
  delete comparable.updated;
  return JSON.stringify(comparable);
}

function isTaxonomyOnlyChange(rel, raw) {
  try {
    const headRaw = execFileSync('git', ['show', `HEAD:${rel}`], { cwd: ROOT_DIR, encoding: 'utf8' });
    return comparableMeta(headRaw) === comparableMeta(raw);
  } catch {
    return false;
  }
}

function main() {
  const timestampIndex = process.argv.indexOf('--timestamp');
  const timestamp = timestampIndex >= 0 ? process.argv[timestampIndex + 1] : null;
  if (!timestamp || !TS_RE.test(timestamp)) {
    throw new Error('Use --timestamp "YYYY-MM-DD HH:MM:SS" (Asia/Shanghai wall-clock time)');
  }

  const summary = { newCards: 0, updatedCards: 0, repairedDate: 0, unchanged: 0 };
  for (const rel of changedMetaFiles()) {
    const abs = path.join(ROOT_DIR, rel);
    if (!fs.existsSync(abs)) continue;
    const raw = fs.readFileSync(abs, 'utf8');
    const isNew = !trackedAtHead(rel);
    const currentDate = extractValue(raw, DATE_RE);
    const currentUpdated = extractValue(raw, UPDATED_RE);
    let next = raw;

    if (isNew) {
      next = upsert(next, 'date', DATE_RE, timestamp);
      next = upsert(next, 'updated', UPDATED_RE, timestamp);
      summary.newCards += 1;
      console.log(`[sync-build-timestamps] NEW ${rel} | date=updated=${timestamp}`);
    } else if (isTaxonomyOnlyChange(rel, raw)) {
      summary.unchanged += 1;
      console.log(`[sync-build-timestamps] KEEP ${rel} | taxonomy-only change`);
    } else {
      if (!currentDate || !TS_RE.test(currentDate)) {
        next = upsert(next, 'date', DATE_RE, timestamp);
        summary.repairedDate += 1;
      }
      next = upsert(next, 'updated', UPDATED_RE, timestamp);
      summary.updatedCards += 1;
      console.log(`[sync-build-timestamps] UPDATE ${rel} | date=${currentDate || timestamp} | updated=${timestamp}`);
    }

    if (next !== raw) fs.writeFileSync(abs, next, 'utf8');
    else summary.unchanged += 1;
  }
  console.log(`[sync-build-timestamps] build_ts=${timestamp} new=${summary.newCards} existing=${summary.updatedCards} repaired_date=${summary.repairedDate}`);
}

main();

module.exports = { TS_RE };
