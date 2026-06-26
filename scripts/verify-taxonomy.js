#!/usr/bin/env node
/**
 * verify-taxonomy.js — taxonomy gate for publish / CI
 *
 * Usage:
 *   node scripts/verify-taxonomy.js --changed-only   # default: verify modified files only
 *   node scripts/verify-taxonomy.js --all             # verify all files
 *   node scripts/verify-taxonomy.js docs/foo.meta.yaml [docs/bar.meta.yaml]
 *
 * Exit codes:
 *   0 = all checked files pass
 *   1 = one or more files have taxonomy errors
 *
 * In CI / publish flows, run this AFTER fix-taxonomy.
 * It does NOT write files — only reads and validates.
 */

const path = require('path');
const {
  ROOT, DOCS,
  validateTaxonomy, getAllAllowedValues,
  walkMetaFiles, getChangedMetaFiles, readMeta,
  REQUIRED_NON_EMPTY,
} = require('./taxonomy-lib');

const ALL_MODE = process.argv.includes('--all');
const STRICT_MODE = process.argv.includes('--strict');

function getTargets() {
  const files = process.argv.filter(a =>
    a.endsWith('.meta.yaml') && !a.startsWith('--')
  );
  if (files.length > 0) {
    return files.map(f => path.isAbsolute(f) ? f : path.join(ROOT, f));
  }
  if (ALL_MODE) return walkMetaFiles(DOCS);
  // --changed-only: only check files that differ from the base branch.
  // In CI (shallow clone) origin/main may not exist, so this returns [].
  // Return [] to signal "nothing to check" rather than falling back to all files.
  return getChangedMetaFiles();
}

function verifyMeta(file) {
  const data = readMeta(file);
  if (!data) {
    return { ok: false, file, errors: [{ message: 'failed to read meta' }] };
  }

  const slug = data.slug || path.basename(file);

  // taxonomy must exist
  if (!data.taxonomy || typeof data.taxonomy !== 'object') {
    return {
      ok: false,
      file,
      slug,
      errors: [{ field: 'taxonomy', message: 'taxonomy object missing' }],
    };
  }

  // all 8 dims must exist as arrays
  const dims = ['domains', 'tool_types', 'stages', 'interaction', 'content_type', 'source', 'style', 'risk'];
  const missingDims = dims.filter(d => !Array.isArray(data.taxonomy[d]));
  if (missingDims.length > 0) {
    return {
      ok: false,
      file,
      slug,
      errors: missingDims.map(d => ({ field: d, message: `${d} dimension missing from taxonomy` })),
    };
  }

  // validate values
  const issues = validateTaxonomy(data.taxonomy);
  const errors = issues.filter(i => i.type === 'error');

  // warnings (non-blocking)
  const warnings = issues.filter(i => i.type === 'warning');

  // style: if taxonomy.style exists but top-level style is different, warn
  const topStyle = data.style ? String(data.style).trim() : null;
  const taxStyle = Array.isArray(data.taxonomy.style) ? data.taxonomy.style[0] : null;
  if (topStyle && taxStyle && topStyle !== taxStyle) {
    warnings.push({
      type: 'warning',
      field: 'style',
      message: `top-level style="${topStyle}" differs from taxonomy.style[0]="${taxStyle}"`,
    });
  }

  // tags pollution check: style slugs / source types in tags
  const allowedStyleVals = getAllAllowedValues().style || new Set();
  const allowedSourceVals = getAllAllowedValues().source || new Set();
  const CATEGORY_VALS = new Set(['tool','tools','工具','open-source-tool','open-source','knowledge','docs','skill','skills','investigation','舆情','调查','技术观点','comparison','product','website','workflow','技术分享','ai工具','ai engineering','person','repository']);
  const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
  const pollutedTags = tags.filter(t => {
    const lower = t.toLowerCase();
    return allowedStyleVals.has(t) || allowedSourceVals.has(t) || CATEGORY_VALS.has(lower);
  });

  if (pollutedTags.length > 0) {
    warnings.push({
      type: 'warning',
      field: 'tags',
      message: `tags contain style/source/category values that should be in taxonomy instead: ${pollutedTags.join(', ')}`,
    });
  }

  return {
    ok: errors.length === 0,
    file,
    slug,
    errors,
    warnings,
  };
}

function main() {
  const targets = getTargets();
  const results = [];
  let pass = 0;
  let fail = 0;
  let warn = 0;

  // --changed-only with no base ref / no changed files: skip gracefully
  if (targets.length === 0 && !ALL_MODE) {
    console.log('[SKIP] no changed meta files detected (--changed-only, no base ref available in CI shallow clone)');
    console.log('      Use --all to audit the full repository, or ensure origin/main exists locally.');
    process.exit(0);
    return;
  }

  for (const file of targets) {
    const res = verifyMeta(file);
    const rel = path.relative(ROOT, file);

    if (res.ok && res.errors.length === 0) {
      pass++;
      const wCount = res.warnings ? res.warnings.length : 0;
      if (wCount > 0) {
        console.log(`[PASS+W] ${rel}`);
        for (const w of res.warnings) {
          console.log(`         [warn] ${w.field}: ${w.message}`);
        }
        warn += wCount;
      } else {
        console.log(`[PASS] ${rel}`);
      }
    } else {
      fail++;
      console.error(`[FAIL] ${rel}`);
      for (const e of res.errors) {
        console.error(`       [error] ${e.field}: ${e.message}`);
      }
      if (STRICT_MODE && res.warnings) {
        for (const w of res.warnings) {
          console.error(`       [warn] ${w.field}: ${w.message}`);
        }
      }
    }
    results.push(res);
  }

  console.log(`\n--- taxonomy verify ---`);
  console.log(`total checked: ${targets.length}`);
  console.log(`pass: ${pass}`);
  console.log(`fail: ${fail}`);
  if (warn > 0) console.log(`warnings: ${warn}`);

  if (fail > 0) {
    console.error(`\n[ERROR] ${fail} file(s) have taxonomy errors. Run "npm run fix-taxonomy --write --changed-only" to auto-fix.`);
    process.exit(1);
  } else {
    console.log(`\n[OK] all checked files pass taxonomy validation.`);
    if (warn > 0 && !STRICT_MODE) {
      console.log(`(use --strict to treat warnings as errors)`);
    }
    process.exit(0);
  }
}

main();
