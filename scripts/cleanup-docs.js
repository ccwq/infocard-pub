'use strict';

const fs = require('node:fs');
const path = require('node:path');

const BULK_CONFIRM_TOKEN = 'cleanup-docs-bulk';

function parseArgs(argv) {
  const options = {
    apply: false,
    bulkConfirm: '',
    now: new Date(),
    repoRoot: path.resolve(__dirname, '..'),
    retentionDays: 7,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') {
      options.apply = true;
    } else if (arg === '--repo-root') {
      options.repoRoot = path.resolve(requireValue(argv, index, arg));
      index += 1;
    } else if (arg === '--days') {
      const value = Number(requireValue(argv, index, arg));
      if (!Number.isFinite(value) || value < 0) throw new Error('--days must be a non-negative number');
      options.retentionDays = value;
      index += 1;
    } else if (arg === '--now') {
      const value = requireValue(argv, index, arg);
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error('--now must be a valid date');
      }
      options.now = parsed;
      index += 1;
    } else if (arg === '--bulk-confirm') {
      options.bulkConfirm = requireValue(argv, index, arg);
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error('Unknown argument: ' + arg);
    }
  }

  return options;
}

function requireValue(argv, index, name) {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(name + ' requires a value');
  }
  return value;
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function item(name, reason, extra = {}) {
  return { name, reason, ...extra };
}

function scan(options) {
  const docsRoot = path.resolve(options.repoRoot, '.docs');
  const ageMs = options.retentionDays * 24 * 60 * 60 * 1000;
  const report = {
    ok: true,
    mode: options.apply ? 'apply' : 'dry-run',
    root: docsRoot,
    root_exists: false,
    age_days: options.retentionDays,
    bulk_confirmation_required: false,
    candidates: [],
    deleted: [],
    skipped: [],
    errors: [],
    summary: { scanned: 0, candidates: 0, deleted: 0, skipped: 0, failed: 0, reclaimed_bytes: 0 },
  };

  let rootStat;
  try {
    rootStat = fs.lstatSync(docsRoot);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return finalize(report);
    }
    report.ok = false;
    report.errors.push({ path: docsRoot, reason: 'root-stat-failed', message: error.message });
    return finalize(report);
  }

  report.root_exists = true;
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    report.ok = false;
    report.errors.push({ path: docsRoot, reason: 'invalid-root', message: '.docs root must be a real directory' });
    return finalize(report);
  }

  let rootReal;
  try {
    rootReal = fs.realpathSync.native(docsRoot);
  } catch (error) {
    report.ok = false;
    report.errors.push({ path: docsRoot, reason: 'root-realpath-failed', message: error.message });
    return finalize(report);
  }

  let entries;
  try {
    entries = fs.readdirSync(docsRoot, { withFileTypes: true });
  } catch (error) {
    report.ok = false;
    report.errors.push({ path: docsRoot, reason: 'root-read-failed', message: error.message });
    return finalize(report);
  }

  entries.sort((a, b) => a.name.localeCompare(b.name, 'en'));

  for (const entry of entries) {
    report.summary.scanned += 1;
    const childPath = path.join(docsRoot, entry.name);
    let stat;
    try {
      stat = fs.lstatSync(childPath);
    } catch (error) {
      report.skipped.push(item(entry.name, 'stat-failed', { message: error.message }));
      continue;
    }

    // Windows Junction 与 symlink 都是 reparse/link 风险点；不跟随，不删除。
    if (stat.isSymbolicLink()) {
      report.skipped.push(item(entry.name, 'link-or-reparse'));
      continue;
    }
    if (!stat.isDirectory()) {
      report.skipped.push(item(entry.name, 'not-directory'));
      continue;
    }
    if (options.now.getTime() - stat.mtimeMs < ageMs) {
      report.skipped.push(item(entry.name, 'too-new'));
      continue;
    }

    report.candidates.push({ name: entry.name, path: childPath, mtime: stat.mtime.toISOString() });
  }

  if (options.apply && report.candidates.length > 10 && options.bulkConfirm !== BULK_CONFIRM_TOKEN) {
    report.ok = false;
    report.bulk_confirmation_required = true;
    report.errors.push({ reason: 'bulk-confirmation-required', message: 'More than 10 candidates require --bulk-confirm ' + BULK_CONFIRM_TOKEN });
    return finalize(report);
  }

  if (options.apply) {
    report.bulk_confirmation_required = false;
    for (const candidate of report.candidates) {
      deleteCandidate({ docsRoot, rootReal, candidate, report });
    }
  }

  return finalize(report);
}

function deleteCandidate({ docsRoot, rootReal, candidate, report }) {
  try {
    const targetPath = path.resolve(docsRoot, candidate.name);
    const stat = fs.lstatSync(targetPath);
    if (stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new Error('candidate changed before delete');
    }
    const targetReal = fs.realpathSync.native(targetPath);
    if (!isInside(rootReal, targetReal)) {
      throw new Error('candidate escaped .docs root');
    }
    const reclaimedBytes = directorySize(targetPath);
    fs.rmSync(targetPath, { recursive: true, force: false });
    report.deleted.push({ name: candidate.name, path: targetPath, bytes: reclaimedBytes });
    report.summary.reclaimed_bytes += reclaimedBytes;
  } catch (error) {
    report.ok = false;
    report.errors.push({ name: candidate.name, path: candidate.path, reason: 'delete-failed', message: error.message });
  }
}

function directorySize(targetPath) {
  let total = 0;
  const stat = fs.lstatSync(targetPath);
  if (stat.isSymbolicLink()) return 0;
  if (stat.isFile()) return stat.size;
  if (!stat.isDirectory()) return 0;
  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    const child = path.join(targetPath, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) total += directorySize(child);
    else if (entry.isFile()) total += fs.lstatSync(child).size;
  }
  return total;
}

function finalize(report) {
  report.summary = {
    scanned: report.summary.scanned || 0,
    candidates: report.candidates.length,
    deleted: report.deleted.length,
    skipped: report.skipped.length,
    failed: report.errors.length,
    reclaimed_bytes: report.summary.reclaimed_bytes || 0,
  };
  if (report.errors.length > 0) {
    report.ok = false;
  }
  return report;
}

function printHelp() {
  const usage = [
    'Usage: node scripts/cleanup-docs.js [--repo-root <repo>] [--days <n>] [--apply] [--bulk-confirm cleanup-docs-bulk] [--now <iso>]',
    '',
    'Default mode is dry-run. Only --apply deletes old direct child directories under the repo-local .docs root.',
  ].join('\n');
  process.stdout.write(usage + '\n');
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    const report = finalize({
      ok: false,
      mode: 'dry-run',
      repoRoot: path.resolve(__dirname, '..'),
      retentionDays: 7,
      root_exists: false,
      age_days: 7,
      bulk_confirmation_required: false,
      candidates: [],
      deleted: [],
      skipped: [],
      errors: [{ reason: 'argument-error', message: error.message }],
      summary: { scanned: 0, candidates: 0, deleted: 0, skipped: 0, failed: 1, reclaimed_bytes: 0 },
    });
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    printHelp();
    return;
  }

  const report = scan(options);
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  process.exitCode = report.ok ? 0 : 2;
}

if (require.main === module) {
  main();
}
