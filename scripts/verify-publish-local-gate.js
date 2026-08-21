#!/usr/bin/env node
'use strict';

/**
 * Deterministic local hard gates for a single infocard publish bundle.
 * This command validates the primary repository directly; it never builds,
 * stages, commits, pushes, removes worktrees, or reads authoring bundles from .docs.
 */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const yaml = require('../assets/home/vendor/js-yaml.min.js');
const { loadBundle, validateBundle } = require('./lib/publish-bundle');
const { extractInjectedIndexData } = require('./index-build-lib');

const REQUIRED_META_FIELDS = ['slug', 'path', 'category', 'title', 'desc', 'date', 'updated', 'tags'];
const PHASES = new Set(['prebuild', 'postbuild', 'pre-cdn', 'cleanup']);

function error(field, message) { return { field, message }; }
function result(valid, phase, errors, extra = {}) { return { valid, phase, errors, ...extra }; }

function parseArgs(argv) {
  let bundlePath = ''; let phase = 'prebuild';
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--bundle' && argv[index + 1]) { bundlePath = argv[++index]; continue; }
    if (argv[index] === '--phase' && argv[index + 1]) { phase = argv[++index]; continue; }
    throw Object.assign(new Error('usage: --bundle path [--phase prebuild|postbuild|pre-cdn|cleanup]'), { usage: true });
  }
  if (!bundlePath) throw Object.assign(new Error('usage: --bundle path [--phase prebuild|postbuild|pre-cdn|cleanup]'), { usage: true });
  if (!PHASES.has(phase)) throw Object.assign(new Error('phase must be prebuild, postbuild, pre-cdn, or cleanup'), { phase: true });
  return { bundlePath, phase };
}

function git(cwd, args) {
  const run = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (run.status !== 0) throw new Error('git ' + args.join(' ') + ' failed: ' + run.stderr.trim());
  return run.stdout.trim();
}

function normalizeRelative(value) {
  if (typeof value !== 'string' || value.trim() === '') return null;
  if (path.posix.isAbsolute(value) || path.win32.isAbsolute(value) || /^[A-Za-z]:/.test(value)) return null;
  if (value.includes('\\')) return null;
  const normalized = path.posix.normalize(value);
  if (normalized === '.' || normalized === '..' || normalized.startsWith('../')) return null;
  return normalized;
}

function isSameDirectory(left, right) {
  const leftReal = fs.realpathSync.native(left);
  const rightReal = fs.realpathSync.native(right);
  return process.platform === 'win32' ? leftReal.toLowerCase() === rightReal.toLowerCase() : leftReal === rightReal;
}

function isInsideDirectory(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (relative && !relative.startsWith('..') && !path.isAbsolute(relative));
}

function relativeToRoot(root, target) {
  const relative = path.relative(root, target).replace(/\\/g, '/');
  return relative === '' ? '.' : relative;
}

function verifyPrimaryRepository(cwd) {
  const errors = [];
  let gitRoot;
  try {
    gitRoot = path.resolve(cwd, git(cwd, ['rev-parse', '--show-toplevel']));
  } catch (_) {
    return { root: cwd, errors: [error('repository.root', 'current directory must be a Git primary repository root')] };
  }
  try {
    if (!isSameDirectory(cwd, gitRoot)) {
      errors.push(error('repository.root', 'current directory must equal the primary repository root'));
    }
  } catch (cause) {
    errors.push(error('repository.root', 'cannot resolve repository root: ' + cause.message));
  }
  return { root: gitRoot, errors };
}

function verifyBundleInput(bundlePath, root) {
  const absolute = path.resolve(root, bundlePath);
  const errors = [];
  if (!isInsideDirectory(root, absolute)) {
    errors.push(error('bundle', 'bundle path must stay inside the primary repository'));
  }
  const relative = relativeToRoot(root, absolute);
  if (relative === '.docs' || relative.startsWith('.docs/')) {
    errors.push(error('bundle', 'bundle input must not be loaded from .docs authoring space'));
  }
  return { absolute, errors };
}

function verifyFormalOutputs(bundle) {
  const errors = [];
  const fields = ['html_path', 'meta_path', 'asset_dir', 'manifest_path'];
  for (const field of fields) {
    const value = typeof bundle[field] === 'string' ? bundle[field].replace(/\\/g, '/') : '';
    if (value === '.docs' || value.startsWith('.docs/')) {
      errors.push(error(field, 'formal publish output must be outside .docs'));
    }
  }
  return errors;
}

function parseStrictSingleDocumentMeta(text) {
  // YAML document separators are only valid as the optional opening marker.
  const separators = text.match(/^---\s*$/gm) || [];
  if (separators.length > 1 || (separators.length === 1 && !text.trimStart().startsWith('---'))) {
    throw new Error('metadata must contain exactly one YAML document');
  }
  const docs = yaml.loadAll(text, { schema: yaml.FAILSAFE_SCHEMA });
  if (docs.length !== 1 || !docs[0] || typeof docs[0] !== 'object' || Array.isArray(docs[0])) {
    throw new Error('metadata must be one YAML mapping document');
  }
  return docs[0];
}

function verifyMeta(bundle, root) {
  const errors = [];
  const metaAbsolute = path.resolve(root, bundle.meta_path || '');
  if (!isInsideDirectory(root, metaAbsolute)) return [error('meta', 'sidecar path escapes repository root')];
  if (!fs.existsSync(metaAbsolute)) return [error('meta', 'sidecar file does not exist')];
  let meta;
  try {
    meta = parseStrictSingleDocumentMeta(fs.readFileSync(metaAbsolute, 'utf8'));
  } catch (cause) {
    return [error('meta', cause.message)];
  }
  for (const field of REQUIRED_META_FIELDS) {
    const value = meta[field];
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      errors.push(error('meta.' + field, 'is required and must be non-empty'));
    }
  }
  if (meta.slug !== bundle.slug) errors.push(error('meta.slug', 'must exactly match bundle.slug'));
  if (meta.path !== bundle.html_path) errors.push(error('meta.path', 'must exactly match bundle.html_path'));
  if (meta.category !== bundle.category) errors.push(error('meta.category', 'must exactly match bundle.category'));
  if (typeof meta.desc !== 'string' || !/[\u3400-\u9fff]/.test(meta.desc.trim())) {
    errors.push(error('meta.desc', 'must be a non-placeholder Chinese summary'));
  }
  return errors;
}

function verifyIndexes(bundle, root) {
  const errors = [];
  const indexYaml = path.join(root, '_index.yaml');
  const indexHtml = path.join(root, 'index.html');
  if (!fs.existsSync(indexYaml)) {
    errors.push(error('_index.yaml', 'generated public index is missing'));
  } else {
    try {
      const parsed = yaml.load(fs.readFileSync(indexYaml, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
      const card = Array.isArray(parsed && parsed.cards) ? parsed.cards.find((item) => item && item.slug === bundle.slug) : null;
      if (!card) errors.push(error('_index.yaml', 'must contain a card entry for the bundle target slug'));
      else {
        if (card.path !== bundle.html_path) errors.push(error('_index.yaml.path', 'target entry must exactly match bundle.html_path'));
        if (typeof card.title !== 'string' || card.title.trim() === '') errors.push(error('_index.yaml.title', 'target entry must have a non-empty title'));
        if (typeof card.desc !== 'string' || card.desc.trim() === '') errors.push(error('_index.yaml.desc', 'target entry must have a non-empty description'));
      }
    } catch (cause) {
      errors.push(error('_index.yaml', 'cannot parse generated index: ' + cause.message));
    }
  }
  if (!fs.existsSync(indexHtml)) {
    errors.push(error('index.html', 'generated public index is missing'));
  } else {
    try {
      const injected = extractInjectedIndexData(fs.readFileSync(indexHtml, 'utf8'));
      const injectedCard = Array.isArray(injected && injected.cards)
        ? injected.cards.find((item) => item && item.slug === bundle.slug)
        : null;
      if (!injectedCard) errors.push(error('index.html', 'home-index-data must contain the bundle target slug'));
      else {
        if (injectedCard.path !== bundle.html_path) errors.push(error('index.html.path', 'target entry must exactly match bundle.html_path'));
        if (typeof injectedCard.title !== 'string' || injectedCard.title.trim() === '') errors.push(error('index.html.title', 'target entry must have a non-empty title'));
        if (typeof injectedCard.desc !== 'string' || injectedCard.desc.trim() === '') errors.push(error('index.html.desc', 'target entry must have a non-empty description'));
      }
    } catch (cause) {
      errors.push(error('index.html', 'cannot parse injected home-index-data: ' + cause.message));
    }
  }
  return errors;
}

function verifyClean(root) {
  const status = git(root, ['status', '--porcelain']);
  return status.trim() === '' ? [] : [error('git.status', 'primary repository is dirty; cleanup is blocked')];
}

function main(argv, cwd = process.cwd()) {
  let parsed;
  try { parsed = parseArgs(argv); } catch (cause) {
    const field = cause.phase ? 'phase' : 'bundle';
    return { code: cause.phase ? 2 : cause.usage ? 2 : 1, output: result(false, '', [error(field, cause.message)]) };
  }

  const repo = verifyPrimaryRepository(cwd);
  const bundleInput = verifyBundleInput(parsed.bundlePath, repo.root);
  const earlyErrors = [...repo.errors, ...bundleInput.errors];
  if (earlyErrors.length) return { code: 1, output: result(false, parsed.phase, earlyErrors) };

  try {
    const bundle = loadBundle(bundleInput.absolute);
    const bundleResult = validateBundle(bundle);
    const errors = [...bundleResult.errors, ...verifyFormalOutputs(bundle)];
    if (bundleResult.valid && errors.length === 0) {
      errors.push(...verifyMeta(bundle, repo.root));
      // pre-cdn is intentionally equivalent to postbuild: it must pass
      // before any failed public request can be classified as CDN propagation.
      if (parsed.phase === 'postbuild' || parsed.phase === 'pre-cdn') errors.push(...verifyIndexes(bundle, repo.root));
      if (parsed.phase === 'cleanup') errors.push(...verifyClean(repo.root));
    }
    return { code: errors.length ? 1 : 0, output: result(errors.length === 0, parsed.phase, errors) };
  } catch (cause) {
    return { code: 1, output: result(false, parsed.phase, [error('bundle', cause.message)]) };
  }
}

if (require.main === module) {
  const outcome = main(process.argv.slice(2));
  process.stdout.write(JSON.stringify(outcome.output) + '\n');
  process.exitCode = outcome.code;
}

module.exports = {
  main,
  parseStrictSingleDocumentMeta,
  verifyMeta,
  verifyIndexes,
  verifyPrimaryRepository,
  verifyBundleInput,
  verifyFormalOutputs,
};
