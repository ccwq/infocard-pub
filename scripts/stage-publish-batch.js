#!/usr/bin/env node
'use strict';

/**
 * Stage a publish batch by exact filename.  `_index.yaml` and `index.html` are
 * batch-generated outputs only when (a) at least one requested bundle output
 * changed and (b) that generated file itself is changed.  They are never
 * staged merely because they exist.
 */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { loadBundle, validateBundle, bundleAllowlist } = require('./lib/publish-bundle');

const ROOT = process.cwd();
const SAFE_GIT_PATH = /^[A-Za-z0-9._/-]+$/;

function fail(message, code = 1, extra = {}) {
  return { code, result: { ok: false, error: message, allowed_changes: [], unrelated_changes: [], unexpected_staged: [], ...extra } };
}
function git(args) {
  const run = spawnSync('git', args, { cwd: ROOT, encoding: 'buffer' });
  if (run.status !== 0) throw new Error(`git ${args[0]} failed: ${run.stderr.toString('utf8').trim()}`);
  return run.stdout.toString('utf8');
}
function safeRelative(value, label) {
  if (typeof value !== 'string' || !SAFE_GIT_PATH.test(value) || value.split('/').includes('..') || path.posix.isAbsolute(value)
      || path.win32.isAbsolute(value) || value.split('/').some((part) => part === '')) {
    throw new Error(`${label} must be a safe repository-relative path`);
  }
  return value;
}
function resolveInside(root, relative, label) {
  const absolute = path.resolve(root, relative);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) throw new Error(`${label} escapes repository root`);
  return absolute;
}
function parseStatus() {
  // This required porcelain preflight detects tracked modifications and index state.
  const raw = git(['status', '--porcelain=v1', '-z']);
  const entries = raw.split('\0').filter(Boolean);
  const paths = [];
  for (let index = 0; index < entries.length; index += 1) {
    const item = entries[index];
    if (item.length < 4) throw new Error('invalid git status record');
    const status = item.slice(0, 2);
    const file = item.slice(3);
    // porcelain collapses an untracked directory to `?? directory/`; expand it
    // below with git's ignore-aware exact-file listing before any staging decision.
    if (status !== '??') {
      safeRelative(file, 'git path');
      paths.push({ file, status });
    }
    // porcelain v1 rename/copy records have a second NUL-delimited old path.
    if (status[0] === 'R' || status[0] === 'C' || status[1] === 'R' || status[1] === 'C') index += 1;
  }
  const untracked = git(['ls-files', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean);
  for (const file of untracked) {
    safeRelative(file, 'untracked git path');
    paths.push({ file, status: '??' });
  }
  return paths;
}
function changed(entry) { return entry.status !== '  ' && entry.status !== '!!'; }
function existingRegularFile(root, relative) {
  const absolute = resolveInside(root, relative, relative);
  if (!fs.existsSync(absolute)) return false;
  const real = fs.realpathSync(absolute);
  const realRoot = fs.realpathSync(root);
  if (real !== realRoot && !real.startsWith(`${realRoot}${path.sep}`)) throw new Error(`${relative} symlink escapes repository root`);
  if (!fs.statSync(absolute).isFile()) throw new Error(`${relative} must be a regular file`);
  return true;
}
function filesUnderAssetDir(bundle) {
  const asset = safeRelative(bundle.asset_dir, 'asset_dir');
  const assetAbsolute = resolveInside(ROOT, asset, 'asset_dir');
  if (!fs.existsSync(assetAbsolute)) return [];
  const realRoot = fs.realpathSync(ROOT);
  const realAsset = fs.realpathSync(assetAbsolute);
  if (!realAsset.startsWith(`${realRoot}${path.sep}`)) throw new Error('asset_dir symlink escapes repository root');
  const found = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      const relative = path.relative(ROOT, absolute).split(path.sep).join('/');
      safeRelative(relative, 'asset path');
      if (entry.isSymbolicLink()) {
        const real = fs.realpathSync(absolute);
        if (!real.startsWith(`${realAsset}${path.sep}`)) throw new Error(`asset file symlink escapes asset_dir: ${relative}`);
        if (!fs.statSync(absolute).isFile()) throw new Error(`asset symlink must target a regular file: ${relative}`);
        found.push(relative);
      } else if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile()) found.push(relative);
      else throw new Error(`asset entry is not a regular file: ${relative}`);
    }
  }
  walk(assetAbsolute);
  return found;
}
function parseArgs(argv) {
  const bundles = []; let stage = false;
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--stage') { stage = true; continue; }
    if (argv[index] === '--bundle' && argv[index + 1]) { bundles.push(argv[++index]); continue; }
    throw Object.assign(new Error('usage: --bundle <path> [--bundle <path> ...] [--stage]'), { usage: true });
  }
  if (!bundles.length) throw Object.assign(new Error('usage: --bundle <path> [--bundle <path> ...] [--stage]'), { usage: true });
  return { bundles, stage };
}
function buildAllowlist(bundlePaths) {
  const allowed = new Set();
  for (const input of bundlePaths) {
    const relative = safeRelative(input, 'bundle path');
    const absolute = resolveInside(ROOT, relative, 'bundle path');
    if (!fs.existsSync(absolute) || fs.lstatSync(absolute).isSymbolicLink()) throw new Error('bundle path must be an existing non-symlink file');
    const bundle = loadBundle(absolute); const validation = validateBundle(bundle);
    if (!validation.valid) throw new Error(`invalid bundle: ${validation.errors.map((error) => error.field).join(', ')}`);
    // Reuse the canonical allowlist contract, then expand its asset glob safely.
    for (const item of bundleAllowlist(bundle)) {
      if (item.endsWith('/**')) for (const file of filesUnderAssetDir(bundle)) allowed.add(file);
      else if (item !== '_index.yaml' && item !== 'index.html') allowed.add(safeRelative(item, 'bundle output'));
    }
  }
  return allowed;
}
function main(argv) {
  try {
    const { bundles, stage } = parseArgs(argv);
    const allow = buildAllowlist(bundles);
    const status = parseStatus().filter(changed);
    const changedAllow = status.filter((entry) => allow.has(entry.file)).map((entry) => entry.file);
    // Index outputs become allowlisted only under the documented generated-output condition.
    const batchHasContentChange = changedAllow.length > 0;
    const generated = batchHasContentChange ? status.filter((entry) => ['_index.yaml', 'index.html'].includes(entry.file)).map((entry) => entry.file) : [];
    for (const file of generated) allow.add(file);
    const allowedChanges = status.filter((entry) => allow.has(entry.file)).map((entry) => entry.file).sort();
    const unrelated = status.filter((entry) => !allow.has(entry.file)).map((entry) => entry.file).sort();
    const staged = git(['diff', '--cached', '--name-only', '-z']).split('\0').filter(Boolean);
    for (const file of staged) safeRelative(file, 'staged git path');
    const unexpected = staged.filter((file) => !allow.has(file)).sort();
    const base = { ok: unexpected.length === 0, stage, allowed_changes: allowedChanges, unrelated_changes: unrelated, unexpected_staged: unexpected, generated_index_changes: generated.sort() };
    if (unexpected.length) return { code: 1, result: { ...base, error: 'pre-existing staged files outside allowlist' } };
    if (!stage) return { code: 0, result: base };
    for (const file of allowedChanges) if (existingRegularFile(ROOT, file)) git(['add', '--', file]);
    const after = git(['diff', '--cached', '--name-only', '-z']).split('\0').filter(Boolean);
    for (const file of after) safeRelative(file, 'staged git path');
    const afterUnexpected = after.filter((file) => !allow.has(file)).sort();
    const expected = allowedChanges.slice().sort();
    const actual = after.slice().sort();
    if (afterUnexpected.length || JSON.stringify(actual) !== JSON.stringify(expected)) {
      return { code: 1, result: { ...base, ok: false, unexpected_staged: afterUnexpected, error: 'staged set does not exactly match changed allowlist' } };
    }
    return { code: 0, result: { ...base, staged_changes: actual } };
  } catch (error) {
    return fail(error.message, error.usage ? 2 : 1);
  }
}
if (require.main === module) { const output = main(process.argv.slice(2)); process.stdout.write(`${JSON.stringify(output.result)}\n`); process.exitCode = output.code; }
module.exports = { main };
