'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { validateBundle, bundleAllowlist } = require('./publish-bundle');
const { validateThemeContract } = require('./theme-contract');
const { readThemeDecision } = require('../../.agents/skills/infocard/infocard-theme-assignment/scripts/theme-decision');

function error(field, message) { return { field, message }; }

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function normalizeRelative(value) {
  if (typeof value !== 'string' || value.trim() === '') return null;
  if (path.posix.isAbsolute(value) || path.win32.isAbsolute(value) || /^[A-Za-z]:/.test(value)) return null;
  if (value.includes('\\')) return null;
  const normalized = path.posix.normalize(value);
  if (normalized === '.' || normalized.startsWith('../') || normalized === '..') return null;
  return normalized;
}

function isInsideRelative(parent, child) {
  const relative = path.posix.relative(parent, child);
  return relative !== '' && !relative.startsWith('..') && !path.posix.isAbsolute(relative);
}

function isAssetAllowlisted(pattern, destination) {
  if (!pattern.endsWith('/**')) return false;
  const dir = pattern.slice(0, -3);
  return isInsideRelative(dir, destination);
}

function isAllowlistedDestination(bundle, destination) {
  return bundleAllowlist(bundle).some((item) => item === destination || isAssetAllowlisted(item, destination));
}

function loadPromotionManifest(manifestPath) {
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function validatePromotionManifest(manifest, root, manifestPath = '') {
  const errors = [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return { valid: false, errors: [error('manifest', 'must be an object')], entries: [] };
  }
  if (typeof manifest.card !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.card)) {
    errors.push(error('card', 'must be lowercase kebab-case'));
  }
  const bundleResult = validateBundle(manifest.bundle);
  errors.push(...bundleResult.errors.map((item) => error('bundle.' + item.field, item.message)));
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    errors.push(error('files', 'must be a non-empty array'));
  }

  // Sources are scoped to the directory containing the manifest. This supports
  // run-scoped authoring paths such as .docs/<run-id>/<slug>/ while keeping
  // promotion bounded to the declared candidate directory.
  const manifestRelative = path.relative(root, path.resolve(root, manifestPath));
  const decisionPath = manifestRelative && !manifestRelative.startsWith('..')
    ? path.join(root, path.dirname(manifestRelative), 'theme-decision.json')
    : null;
  if (!decisionPath || !fs.existsSync(decisionPath)) {
    errors.push(error('theme.decision', 'theme-decision.json is required beside promotion-manifest.json'));
  }
  const sourceRoot = manifestRelative && !manifestRelative.startsWith('..')
    ? path.posix.dirname(manifestRelative)
    : (typeof manifest.card === 'string' ? '.docs/' + manifest.card : '');
  const destinationSeen = new Map();
  const entries = [];
  if (Array.isArray(manifest.files)) {
    manifest.files.forEach((entry, index) => {
      const prefix = 'files[' + index + ']';
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        errors.push(error(prefix, 'must be an object'));
        return;
      }
      const source = normalizeRelative(entry.source);
      const destination = normalizeRelative(entry.destination);
      const sourceFromRoot = source && sourceRoot && isInsideRelative(sourceRoot, source);
      const sourceFromManifest = source && sourceRoot && !source.startsWith('.docs/') && !path.posix.isAbsolute(source);
      if (!source || !sourceRoot || (!sourceFromRoot && !sourceFromManifest)) {
        errors.push(error(prefix + '.source', 'must be inside .docs/<card>/'));
      }
      if (!destination) {
        errors.push(error(prefix + '.destination', 'must be a relative repository path'));
      } else {
        if (destination === '.docs' || destination.startsWith('.docs/')) {
          errors.push(error(prefix + '.destination', 'formal output must be outside .docs'));
        }
        if (bundleResult.valid && !isAllowlistedDestination(manifest.bundle, destination)) {
          errors.push(error(prefix + '.destination', 'must be declared by the bundle publish allowlist'));
        }
        if (destinationSeen.has(destination)) {
          errors.push(error(prefix + '.destination', 'duplicates ' + destinationSeen.get(destination)));
        } else {
          destinationSeen.set(destination, prefix + '.destination');
        }
      }
      if (typeof entry.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(entry.sha256)) {
        errors.push(error(prefix + '.sha256', 'must be a hex SHA-256 digest'));
      }

      if (!source || !destination) return;
      const sourceRelative = sourceFromRoot ? source : path.posix.join(sourceRoot, source);
      const sourceAbsolute = path.resolve(root, sourceRelative);
      const destinationAbsolute = path.resolve(root, destination);
      try {
        const sourceStat = fs.lstatSync(sourceAbsolute);
        if (sourceStat.isSymbolicLink()) errors.push(error(prefix + '.source', 'must not be a symlink'));
        if (!sourceStat.isFile()) errors.push(error(prefix + '.source', 'must be a regular file'));
      } catch (_) {
        errors.push(error(prefix + '.source', 'source file does not exist'));
      }
      try {
        const destinationStat = fs.lstatSync(destinationAbsolute);
        if (destinationStat.isSymbolicLink()) errors.push(error(prefix + '.destination', 'must not overwrite a symlink'));
        if (!destinationStat.isFile()) errors.push(error(prefix + '.destination', 'must be a file destination'));
      } catch (cause) {
        if (cause.code !== 'ENOENT') errors.push(error(prefix + '.destination', cause.message));
      }
      entries.push({ index, source, destination, sourceAbsolute, destinationAbsolute, sha256: entry.sha256 });
    });
  }
  if (errors.length) return { valid: false, errors, entries: [] };
  for (const entry of entries) {
    const actual = sha256File(entry.sourceAbsolute);
    if (actual.toLowerCase() !== entry.sha256.toLowerCase()) {
      errors.push(error('files[' + entry.index + '].sha256', 'source hash mismatch'));
    }
  }
  const themeResult = validateThemeContract({ root, bundle: manifest.bundle, entries });
  errors.push(...themeResult.errors.map((item) => error('theme.' + item.field, item.message)));
  if (decisionPath && fs.existsSync(decisionPath)) {
    const decision = readThemeDecision(decisionPath, { projectRoot: root });
    if (!decision.valid) errors.push(...decision.errors.map((item) => error('theme.decision.' + item.field, item.message)));
    else if (decision.decision.selected_theme !== manifest.bundle.style) {
      errors.push(error('theme.decision.selected_theme', 'must equal bundle.style'));
    }
  }
  return { valid: errors.length === 0, errors, entries: errors.length ? [] : entries };
}

function promoteInfocard({ root = process.cwd(), manifestPath } = {}) {
  if (!manifestPath) return { valid: false, errors: [error('manifest', 'usage: --manifest path')], copied: [] };
  const resolvedRoot = path.resolve(root);
  let manifest;
  try {
    manifest = loadPromotionManifest(manifestPath);
  } catch (cause) {
    return { valid: false, errors: [error('manifest', cause.message)], copied: [] };
  }
  const validation = validatePromotionManifest(manifest, resolvedRoot, manifestPath);
  if (!validation.valid) return { valid: false, errors: validation.errors, copied: [] };

  const copied = [];
  try {
    for (const entry of validation.entries) {
      fs.mkdirSync(path.dirname(entry.destinationAbsolute), { recursive: true });
      fs.copyFileSync(entry.sourceAbsolute, entry.destinationAbsolute);
      const destinationHash = sha256File(entry.destinationAbsolute);
      if (destinationHash.toLowerCase() !== entry.sha256.toLowerCase()) {
        return { valid: false, errors: [error('files[' + entry.index + '].sha256', 'destination hash mismatch after copy')], copied };
      }
      copied.push({ source: entry.source, destination: entry.destination, sha256: destinationHash });
    }
  } catch (cause) {
    return { valid: false, errors: [error('copy', cause.message)], copied };
  }
  return { valid: true, errors: [], copied };
}

module.exports = {
  loadPromotionManifest,
  normalizeRelative,
  validatePromotionManifest,
  promoteInfocard,
};
