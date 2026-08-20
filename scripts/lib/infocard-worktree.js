'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const FIXED_DIR_NAME = 'infocard-worktree';
const CLEANUP_CONFIRMATION = 'del-rm';

function fixedWorktreeRoot() {
  return path.resolve(normalizeExistingPath(os.tmpdir()), FIXED_DIR_NAME);
}

function sanitizeSegment(value, fallback) {
  const clean = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
  return clean || fallback;
}

function resolveWorktreePath({ runId, slug }) {
  const name = sanitizeSegment(runId, 'run') + '-' + sanitizeSegment(slug, 'card');
  return path.join(fixedWorktreeRoot(), name);
}

function normalizeExistingPath(targetPath) {
  const resolved = path.resolve(targetPath);
  try {
    return fs.realpathSync.native(resolved);
  } catch (_) {
    return resolved;
  }
}

function pathsEqual(left, right) {
  const a = normalizeExistingPath(left);
  const b = normalizeExistingPath(right);
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
}

function isPathInside(parent, child) {
  // Use lexical resolution for containment so Windows 8.3 temp paths
  // (for example ADMINI~1) do not mismatch realpath long names for
  // not-yet-created child paths. Git validation still verifies real worktrees.
  const resolvedParent = path.resolve(parent);
  const resolvedChild = path.resolve(child);
  const relative = path.relative(resolvedParent, resolvedChild);
  if (relative === '') return false;
  return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function isInsideFixedWorktreeRoot(targetPath) {
  return isPathInside(fixedWorktreeRoot(), targetPath);
}

function runGit(repo, args, options = {}) {
  const result = spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', ...options });
  if (result.status !== 0) {
    const error = new Error('git ' + args.join(' ') + ' failed: ' + result.stderr.trim());
    error.result = result;
    throw error;
  }
  return result.stdout;
}

function parseWorktreePorcelain(text) {
  const entries = [];
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) {
      if (current) entries.push(current);
      current = null;
      continue;
    }
    const space = line.indexOf(' ');
    const key = space === -1 ? line : line.slice(0, space);
    const value = space === -1 ? true : line.slice(space + 1);
    if (key === 'worktree') {
      if (current) entries.push(current);
      current = { path: value };
      continue;
    }
    if (!current) continue;
    current[key] = value;
  }
  if (current) entries.push(current);
  return entries;
}

function worktreeStatus(item) {
  try {
    const status = runGit(item.path, ['status', '--porcelain']);
    return { dirty: status.trim() !== '', status: status.trim() };
  } catch (cause) {
    return { dirty: true, status: '', error: cause.message };
  }
}

function listOrphanDirectories(registeredPaths) {
  const root = fixedWorktreeRoot();
  if (!fs.existsSync(root)) return [];
  const registered = new Set(registeredPaths.map((item) => normalizeExistingPath(item)));
  const entries = [];
  for (const dirent of fs.readdirSync(root, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;
    const candidate = path.join(root, dirent.name);
    const normalized = normalizeExistingPath(candidate);
    if (registered.has(normalized)) continue;
    const hasGitFile = fs.existsSync(path.join(candidate, '.git'));
    const hasPackage = fs.existsSync(path.join(candidate, 'package.json'));
    const hasAgents = fs.existsSync(path.join(candidate, 'AGENTS.md'));
    if (hasGitFile || hasPackage || hasAgents) {
      entries.push({ path: candidate, scope: 'orphan', cleanup_candidate: false });
    }
  }
  return entries;
}

function listWorktrees({ repo = process.cwd() } = {}) {
  const root = fixedWorktreeRoot();
  const parsed = parseWorktreePorcelain(runGit(repo, ['worktree', 'list', '--porcelain']));
  const worktrees = parsed.map((item) => {
    const status = worktreeStatus(item);
    const managed = isInsideFixedWorktreeRoot(item.path);
    const main = pathsEqual(item.path, repo);
    return {
      path: item.path,
      head: item.HEAD || item.head || '',
      branch: item.branch || '',
      detached: Boolean(item.detached),
      scope: managed ? 'managed' : 'external',
      dirty: status.dirty,
      status: status.status,
      error: status.error,
      cleanup_candidate: managed && !main && !status.dirty,
    };
  });
  return {
    root,
    worktrees,
    orphans: listOrphanDirectories(worktrees.map((item) => item.path)),
  };
}

function cleanupWorktrees({ repo = process.cwd(), confirm } = {}) {
  const before = listWorktrees({ repo });
  const summary = {
    authorized: confirm === CLEANUP_CONFIRMATION,
    root: before.root,
    removed: [],
    skipped: [],
    orphans: before.orphans,
    remaining: [],
  };
  if (!summary.authorized) {
    summary.remaining = before.worktrees;
    return summary;
  }

  for (const item of before.worktrees) {
    if (item.scope !== 'managed') {
      summary.skipped.push({ path: item.path, reason: 'outside-fixed-root' });
      continue;
    }
    if (pathsEqual(item.path, repo)) {
      summary.skipped.push({ path: item.path, reason: 'current-repo' });
      continue;
    }
    if (item.dirty) {
      summary.skipped.push({ path: item.path, reason: 'dirty' });
      continue;
    }
    try {
      runGit(repo, ['worktree', 'remove', item.path]);
      summary.removed.push({ path: item.path });
    } catch (cause) {
      summary.skipped.push({ path: item.path, reason: 'remove-failed', message: cause.message });
    }
  }

  try {
    runGit(repo, ['worktree', 'prune']);
  } catch (cause) {
    summary.prune_error = cause.message;
  }
  summary.remaining = listWorktrees({ repo }).worktrees;
  return summary;
}

module.exports = {
  CLEANUP_CONFIRMATION,
  FIXED_DIR_NAME,
  fixedWorktreeRoot,
  resolveWorktreePath,
  isInsideFixedWorktreeRoot,
  listWorktrees,
  cleanupWorktrees,
  parseWorktreePorcelain,
};
