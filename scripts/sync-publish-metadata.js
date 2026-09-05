#!/usr/bin/env node
/**
 * Make publish-time date semantics explicit before visual review.
 *
 * Contract:
 * - Existing card with changed HTML: preserve date, set updated to publish timestamp.
 * - New card: set date and updated to the same publish timestamp.
 * - Taxonomy-only changes are not handled here; build's existing classifier keeps updated.
 * - Candidate sidecar and promoted sidecar are synchronized, then manifest hashes are refreshed.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const TS_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
const DATE_RE = /^(date:\s*)(?:["'][^\r\n"']*["']|[^\r\n]*)\s*$/m;
const UPDATED_RE = /^(updated:\s*)(?:["'][^\r\n"']*["']|[^\r\n]*)\s*$/m;

function replaceOrInsert(raw, field, re, value) {
  const line = `${field}: "${value}"`;
  if (re.test(raw)) return raw.replace(re, line);
  const pathRe = /^(path:\s*[^\r\n]+)\s*$/m;
  if (!pathRe.test(raw)) throw new Error(`missing path field while inserting ${field}`);
  return raw.replace(pathRe, `${pathRe.exec(raw)[1]}\n${line}`);
}

function value(raw, field) {
  const m = raw.match(new RegExp(`^${field}:\\s*(.*)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}

function gitHas(rel) {
  try { execFileSync('git', ['cat-file', '-e', `HEAD:${rel}`], { cwd: ROOT, stdio: 'ignore' }); return true; }
  catch { return false; }
}

function headText(rel) {
  try { return execFileSync('git', ['show', `HEAD:${rel}`], { cwd: ROOT, encoding: 'utf8' }); }
  catch { return null; }
}

function htmlChanged(htmlRel, candidateHtmlPath = null) {
  const target = path.join(ROOT, htmlRel);
  if (!fs.existsSync(target)) return true;
  const candidate = candidateHtmlPath ? fs.readFileSync(candidateHtmlPath) : null;
  const current = fs.readFileSync(target);
  if (candidate) return !candidate.equals(current);
  const old = headText(htmlRel);
  return old == null || old !== current.toString('utf8');
}

function updateSidecar(raw, { isNew, changedHtml, timestamp }) {
  if (!TS_RE.test(timestamp)) throw new Error(`invalid timestamp: ${timestamp}`);
  let next = raw;
  if (isNew) {
    next = replaceOrInsert(next, 'date', DATE_RE, timestamp);
    next = replaceOrInsert(next, 'updated', UPDATED_RE, timestamp);
  } else if (changedHtml) {
    next = replaceOrInsert(next, 'updated', UPDATED_RE, timestamp);
  }
  return next;
}

function refreshManifest(manifest, authoringRoot) {
  for (const file of manifest.files || []) {
    const source = path.join(authoringRoot, file.source);
    if (!fs.existsSync(source)) throw new Error(`manifest source missing: ${file.source}`);
    file.sha256 = crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');
  }
}

function main(argv = process.argv.slice(2)) {
  const mi = argv.indexOf('--manifest');
  const ti = argv.indexOf('--timestamp');
  if (mi < 0 || ti < 0) throw new Error('Usage: sync-publish-metadata.js --manifest <path> --timestamp "YYYY-MM-DD HH:MM:SS"');
  const manifestPath = path.resolve(ROOT, argv[mi + 1]);
  const timestamp = argv[ti + 1];
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const authoringRoot = path.dirname(manifestPath);
  const htmlTarget = manifest.bundle.html_path;
  const metaTarget = manifest.bundle.meta_path;
  const metaFile = (manifest.files || []).find((f) => f.destination === metaTarget);
  const htmlFile = (manifest.files || []).find((f) => f.destination === htmlTarget);
  if (!metaFile || !htmlFile) throw new Error('manifest must declare matching HTML and meta targets');
  const targetMeta = path.join(ROOT, metaTarget);
  const targetHtml = path.join(ROOT, htmlTarget);
  const isNew = !gitHas(metaTarget);
  const sourceMeta = path.join(authoringRoot, metaFile.source);
  const sourceHtml = path.join(authoringRoot, htmlFile.source);
  const sourceRaw = fs.readFileSync(sourceMeta, 'utf8');
  // Update detection must compare the candidate against the current formal HTML
  // before promotion. Comparing formal HTML to HEAD here makes every pre-promotion
  // update look unchanged and leaves the old `updated` value in place.
  const candidateChangedHtml = isNew || htmlChanged(htmlTarget, sourceHtml);
  const next = updateSidecar(sourceRaw, { isNew, changedHtml: candidateChangedHtml, timestamp });
  fs.writeFileSync(sourceMeta, next, 'utf8');
  fs.mkdirSync(path.dirname(targetMeta), { recursive: true });
  fs.writeFileSync(targetMeta, next, 'utf8');
  refreshManifest(manifest, authoringRoot);
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ ok: true, target: metaTarget, state: isNew ? 'new' : candidateChangedHtml ? 'updated' : 'unchanged', date: value(next, 'date'), updated: value(next, 'updated'), timestamp }));
}

module.exports = { TS_RE, updateSidecar, htmlChanged };
if (require.main === module) main();
