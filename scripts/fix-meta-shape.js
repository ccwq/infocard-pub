#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * fix-meta-shape.js
 *
 * Mechanical metadata normalizer for infocard-pub.
 * Safe-by-default:
 *   - dry-run unless --write is passed
 *   - date/updated quote fix: write-safe
 *   - description -> desc: write-safe only when desc is absent
 *   - path fix: write-safe only when the sidecar's sibling HTML exists
 *   - slug mismatch: report-only by default; write only with --fix-slug
 *
 * Usage:
 *   node scripts/fix-meta-shape.js
 *   node scripts/fix-meta-shape.js --write
 *   node scripts/fix-meta-shape.js --write --fix-slug
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const META_SUFFIX = '.meta.yaml';

const args = new Set(process.argv.slice(2));
const shouldWrite = args.has('--write');
const shouldFixSlug = args.has('--fix-slug');
const jsonMode = args.has('--json');

const BARE_WALL_CLOCK_RE = /^(date|updated):(\s*)(?!["'])(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?)\s*$/gm;
const FIELD_LINE = (name) => new RegExp(`^(${name}:\\s*)(.*)$`, 'm');

function normalizeSlashes(value) {
  return value.split(path.sep).join('/');
}

function walkMetaFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkMetaFiles(full));
    else if (entry.isFile() && entry.name.endsWith(META_SUFFIX)) files.push(full);
  }
  return files.sort();
}

function parseScalarLine(text, name) {
  const match = text.match(FIELD_LINE(name));
  if (!match) return null;
  return match[2].trim().replace(/^['"]|['"]$/g, '');
}

function hasField(text, name) {
  return FIELD_LINE(name).test(text);
}

function replaceOrInsertField(text, name, value, insertAfter = 'path') {
  const line = FIELD_LINE(name);
  if (line.test(text)) return text.replace(line, `${name}: ${value}`);
  const after = FIELD_LINE(insertAfter);
  if (after.test(text)) return text.replace(after, `$1$2\n${name}: ${value}`);
  return `${name}: ${value}\n${text}`;
}

function removeField(text, name) {
  return text.replace(new RegExp(`^${name}:.*(?:\\r?\\n|$)`, 'm'), '');
}

function expectedHtmlFromMeta(metaFile) {
  const rel = normalizeSlashes(path.relative(ROOT_DIR, metaFile));
  if (!rel.endsWith(META_SUFFIX)) return null;
  const withoutSuffix = rel.slice(0, -META_SUFFIX.length);
  // Standard sidecars are either docs/foo.html.meta.yaml or
  // docs/foo/index.html.meta.yaml. Legacy docs/foo.meta.yaml exists; for those
  // only infer docs/foo.html when it is actually present, otherwise skip path fix.
  if (withoutSuffix.endsWith('.html')) return withoutSuffix;
  const htmlCandidate = `${withoutSuffix}.html`;
  if (fs.existsSync(path.join(ROOT_DIR, htmlCandidate))) return htmlCandidate;
  return null;
}

function expectedSlugFromPath(cardPath) {
  const normalized = cardPath.replace(/^\.\//, '');
  if (normalized.endsWith('/index.html')) {
    return path.posix.basename(path.posix.dirname(normalized));
  }
  if (normalized.endsWith('.html')) {
    return path.posix.basename(normalized, '.html');
  }
  return null;
}

function processFile(metaFile) {
  const rel = normalizeSlashes(path.relative(ROOT_DIR, metaFile));
  const raw = fs.readFileSync(metaFile, 'utf8');
  let next = raw;
  const actions = [];
  const warnings = [];
  const errors = [];

  // 1) quote bare wall-clock date/updated, preserving value
  next = next.replace(BARE_WALL_CLOCK_RE, (_m, field, spacing, value) => {
    actions.push(`quote ${field}`);
    return `${field}:${spacing}"${value}"`;
  });

  // 2) description -> desc if safe
  const desc = parseScalarLine(next, 'desc');
  const description = parseScalarLine(next, 'description');
  if (description != null) {
    if (desc == null) {
      next = removeField(next, 'description');
      next = replaceOrInsertField(next, 'desc', description.includes(':') || description.includes('#') ? JSON.stringify(description) : description, 'title');
      actions.push('rename description->desc');
    } else {
      warnings.push('both desc and description exist; not merging automatically');
    }
  }

  // 3) path must match sidecar sibling HTML when the sibling exists
  const expectedPath = expectedHtmlFromMeta(metaFile);
  const expectedAbs = expectedPath ? path.join(ROOT_DIR, expectedPath) : null;
  const currentPath = parseScalarLine(next, 'path');
  if (expectedPath && fs.existsSync(expectedAbs)) {
    if (currentPath == null) {
      next = replaceOrInsertField(next, 'path', expectedPath, 'slug');
      actions.push(`insert path=${expectedPath}`);
    } else if (currentPath !== expectedPath) {
      next = replaceOrInsertField(next, 'path', expectedPath, 'slug');
      actions.push(`fix path ${currentPath}->${expectedPath}`);
    }
  } else if (!expectedPath) {
    // Legacy sidecar shape (e.g. docs/foo.meta.yaml) with no obvious sibling HTML.
    // Leave it alone; build/verify owns the authoritative path existence check.
  }

  // 4) slug: report by default; write only with --fix-slug
  const effectivePath = parseScalarLine(next, 'path');
  const expectedSlug = effectivePath ? expectedSlugFromPath(effectivePath) : null;
  const currentSlug = parseScalarLine(next, 'slug');
  if (expectedSlug) {
    if (currentSlug == null) {
      if (shouldFixSlug) {
        next = replaceOrInsertField(next, 'slug', expectedSlug, 'path');
        actions.push(`insert slug=${expectedSlug}`);
      } else {
        warnings.push(`missing slug; expected ${expectedSlug}`);
      }
    } else if (currentSlug !== expectedSlug) {
      if (shouldFixSlug) {
        next = replaceOrInsertField(next, 'slug', expectedSlug, 'path');
        actions.push(`fix slug ${currentSlug}->${expectedSlug}`);
      } else {
        warnings.push(`slug mismatch: ${currentSlug} != ${expectedSlug}`);
      }
    }
  }

  const changed = next !== raw;
  if (changed && shouldWrite) fs.writeFileSync(metaFile, next, 'utf8');
  return { rel, changed, actions, warnings, errors };
}

function main() {
  const files = walkMetaFiles(DOCS_DIR);
  const results = files.map(processFile);
  const changed = results.filter((r) => r.changed).length;
  const warnings = results.reduce((n, r) => n + r.warnings.length, 0);
  const errors = results.reduce((n, r) => n + r.errors.length, 0);

  if (jsonMode) {
    console.log(JSON.stringify({ mode: shouldWrite ? 'write' : 'dry-run', scanned: files.length, changed, warnings, errors, results }, null, 2));
  } else {
    for (const r of results) {
      if (!r.changed && !r.warnings.length && !r.errors.length) continue;
      const verb = shouldWrite ? 'FIX' : 'WOULD-FIX';
      if (r.actions.length) console.log(`[fix-meta-shape] ${verb} ${r.rel} | ${r.actions.join(', ')}`);
      for (const warning of r.warnings) console.log(`[fix-meta-shape] WARN ${r.rel} | ${warning}`);
      for (const error of r.errors) console.error(`[fix-meta-shape] ERROR ${r.rel} | ${error}`);
    }
    console.log(`[fix-meta-shape] mode=${shouldWrite ? 'write' : 'dry-run'} scanned=${files.length} changed=${changed} warnings=${warnings} errors=${errors}`);
  }
  if (errors) process.exitCode = 1;
}

main();
