#!/usr/bin/env node
/**
 * fix-taxonomy.js — auto-fix taxonomy fields in .meta.yaml files
 *
 * Usage:
 *   node scripts/fix-taxonomy.js --write --changed-only   # default: fix modified files only
 *   node scripts/fix-taxonomy.js --write --all            # fix all files
 *   node scripts/fix-taxonomy.js --write docs/foo.meta.yaml [docs/bar.meta.yaml]
 *   node scripts/fix-taxonomy.js --dry-run --changed-only  # report only, no writes
 *   node scripts/fix-taxonomy.js --check docs/foo.meta.yaml # strict check, exit 1 on missing required
 */

const path = require('path');
const {
  ROOT, DOCS,
  buildTaxonomy, mergeTaxonomy, validateTaxonomy,
  walkMetaFiles, getChangedMetaFiles, readMeta, writeMeta,
  REQUIRED_NON_EMPTY,
} = require('./taxonomy-lib');

const WRITE = process.argv.includes('--write');
const DRY_RUN = process.argv.includes('--dry-run');
const CHECK_MODE = process.argv.includes('--check');
const ALL_MODE = process.argv.includes('--all');

function getTargets() {
  // explicit file paths
  const files = process.argv.filter(a =>
    a.endsWith('.meta.yaml') && !a.startsWith('--')
  );
  if (files.length > 0) {
    return files.map(f => path.isAbsolute(f) ? f : path.join(ROOT, f));
  }
  if (ALL_MODE) return walkMetaFiles(DOCS);
  // changed files
  const changed = getChangedMetaFiles();
  if (changed.length > 0) return changed;
  // fallback: all
  return walkMetaFiles(DOCS);
}

function arrayEq(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => String(v) === String(sb[i]));
}

function diffTaxonomy(existing, next) {
  const dims = ['tech_stack', 'topics', 'tool_types', 'stages', 'interaction', 'content_type', 'source', 'style', 'risk'];
  const changes = [];
  for (const dim of dims) {
    if (!arrayEq(existing[dim], next[dim])) {
      changes.push({
        dim,
        from: existing[dim] || [],
        to: next[dim] || [],
      });
    }
  }
  const existingPrimary = typeof existing.primary_content_type === 'string'
    ? existing.primary_content_type.trim()
    : '';
  const nextPrimary = typeof next.primary_content_type === 'string'
    ? next.primary_content_type.trim()
    : '';
  if (existingPrimary !== nextPrimary) {
    changes.push({
      dim: 'primary_content_type',
      // 与数组维度保持相同的数据形状，复用后续的增删日志输出。
      from: existingPrimary ? [existingPrimary] : [],
      to: nextPrimary ? [nextPrimary] : [],
    });
  }
  return changes;
}

function fixMeta(file) {
  const data = readMeta(file);
  if (!data) {
    return { ok: false, file, error: 'failed to read meta' };
  }

  const existingTax = data.taxonomy && typeof data.taxonomy === 'object' ? data.taxonomy : {};
  const inferred = buildTaxonomy(data);
  const merged = mergeTaxonomy(existingTax, inferred);

  // check required non-empty
  const issues = validateTaxonomy(merged);
  const missingRequired = issues.filter(i => i.type === 'error' && REQUIRED_NON_EMPTY.includes(i.field));

  if (CHECK_MODE) {
    // strict: exit 1 if required dims missing
    if (missingRequired.length > 0) {
      return { ok: false, file, issues: missingRequired, merged };
    }
    return { ok: true, file, issues: [], merged };
  }

  const changes = diffTaxonomy(existingTax, merged);
  const hasChanges = changes.length > 0;

  if (!hasChanges) {
    return { ok: true, file, changed: false, issues, merged };
  }

  if (WRITE && !DRY_RUN) {
    data.taxonomy = merged;
    writeMeta(file, data);
  }

  return { ok: true, file, changed: hasChanges, changes, issues, merged };
}

function main() {
  const targets = getTargets();
  const results = { ok: 0, changed: 0, failed: 0, skipped: 0, checkFails: [] };

  for (const file of targets) {
    const res = fixMeta(file);
    const rel = path.relative(ROOT, file);

    if (res.error) {
      results.failed++;
      console.error(`[FAIL] ${rel}: ${res.error}`);
      continue;
    }

    if (CHECK_MODE) {
      if (!res.ok) {
        results.checkFails.push({ file: rel, issues: res.issues });
        results.failed++;
        console.error(`[FAIL] ${rel}:`);
        for (const issue of res.issues) {
          console.error(`       ${issue.field}: ${issue.message}`);
        }
      } else {
        results.ok++;
        console.log(`[PASS] ${rel}`);
      }
      continue;
    }

    if (!res.changed) {
      results.skipped++;
      if (process.argv.includes('--verbose')) {
        console.log(`[SKIP] ${rel}: no change`);
      }
      continue;
    }

    results.changed++;
    console.log(`[CHG] ${rel}`);
    for (const c of res.changes) {
      const added = c.to.filter(v => !c.from.includes(v));
      const removed = c.from.filter(v => !c.to.includes(v));
      if (added.length) console.log(`      + ${c.dim}: ${added.join(', ')}`);
      if (removed.length) console.log(`      - ${c.dim}: ${removed.join(', ')}`);
    }
    if (res.issues && res.issues.length > 0) {
      for (const issue of res.issues) {
        if (issue.type === 'error') {
          console.error(`      ![${issue.field}] ${issue.message}`);
        }
      }
    }
  }

  console.log(`\n--- summary ---`);
  console.log(`total: ${targets.length}`);
  if (CHECK_MODE) {
    console.log(`check pass: ${results.ok}`);
    console.log(`check fail: ${results.failed}`);
    if (results.failed > 0) {
      console.error('\n[ERROR] required taxonomy fields missing in some files');
      process.exit(1);
    }
  } else {
    console.log(`changed: ${results.changed}`);
    console.log(`skipped (no change): ${results.skipped}`);
    console.log(`failed: ${results.failed}`);
    if (WRITE && !DRY_RUN && results.changed > 0) {
      console.log('\nWrote changes. Run "npm run build && npm run verify" to regenerate index.');
    }
    if (DRY_RUN) {
      console.log('\nDry-run: no files written.');
    }
  }
}

main();
