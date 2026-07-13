#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { loadBundle, validateBundle } = require('./lib/publish-bundle');

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif']);
const MIME_EXTENSIONS = {
  'image/png': new Set(['.png']),
  'image/jpeg': new Set(['.jpg', '.jpeg']),
  'image/webp': new Set(['.webp']),
  'image/gif': new Set(['.gif']),
  'image/svg+xml': new Set(['.svg']),
  'image/avif': new Set(['.avif']),
};

function contentMatchesExtension(filePath, extension) {
  const bytes = fs.readFileSync(filePath);
  if (extension === '.png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (extension === '.jpg' || extension === '.jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (extension === '.gif') return bytes.subarray(0, 6).toString('ascii') === 'GIF87a' || bytes.subarray(0, 6).toString('ascii') === 'GIF89a';
  if (extension === '.webp') return bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  if (extension === '.avif') return bytes.length >= 12 && bytes.subarray(4, 8).toString('ascii') === 'ftyp' && bytes.subarray(8, 12).toString('ascii').includes('avif');
  if (extension === '.svg') return /<svg(?:\s|>)/i.test(bytes.toString('utf8', 0, Math.min(bytes.length, 4096)));
  return false;
}

function assetPath(bundle, assetRoot, localPath) {
  if (typeof localPath !== 'string' || localPath.trim() === '' || localPath.includes('\\') || path.posix.isAbsolute(localPath)) return null;
  const parts = localPath.split('/');
  if (parts.includes('..')) return null;
  const repoRelativePrefix = `${bundle.asset_dir}/`;
  const relative = localPath.startsWith(repoRelativePrefix) ? localPath.slice(repoRelativePrefix.length) : localPath;
  const resolved = path.resolve(assetRoot, relative);
  return resolved.startsWith(`${assetRoot}${path.sep}`) ? resolved : null;
}

function isNonemptyStringArray(value) {
  return Array.isArray(value) && value.length > 0
    && value.every((entry) => typeof entry === 'string' && entry.trim() !== '');
}

function localPathSet(entries) {
  return new Set(entries.map((entry) => entry && entry.local_path));
}

function validateAssetEntries(entries, field, bundle, assetRoot, errors, checkDisk) {
  if (!Array.isArray(entries)) {
    errors.push({ field, message: 'must be an array' });
    return;
  }
  const seen = new Set();
  entries.forEach((entry, index) => {
    const entryField = `${field}.${index}`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push({ field: entryField, message: 'must be an object' });
      return;
    }
    if (typeof entry.local_path === 'string') {
      if (seen.has(entry.local_path)) errors.push({ field: `${entryField}.local_path`, message: 'must be unique' });
      seen.add(entry.local_path);
    }
    const filePath = assetPath(bundle, assetRoot, entry.local_path);
    if (!filePath) {
      errors.push({ field: `${entryField}.local_path`, message: 'must stay under bundle.asset_dir' });
      return;
    }
    const extension = path.extname(filePath).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      errors.push({ field: `${entryField}.local_path`, message: 'must use an accepted image extension' });
      return;
    }
    if (field === 'manifest.assets') {
      if (typeof entry.mime_type !== 'string' || !MIME_EXTENSIONS[entry.mime_type]) {
        errors.push({ field: `${entryField}.mime_type`, message: 'must be an accepted image MIME type' });
      } else if (!MIME_EXTENSIONS[entry.mime_type].has(extension)) {
        errors.push({ field: `${entryField}.mime_type`, message: 'must match local file extension' });
      }
      if (!Number.isInteger(entry.bytes) || entry.bytes <= 0) {
        errors.push({ field: `${entryField}.bytes`, message: 'must be a positive integer' });
      }
    }
    if (!checkDisk) return;
    let stat;
    let realFilePath;
    try {
      stat = fs.statSync(filePath);
      realFilePath = fs.realpathSync(filePath);
    } catch (error) {
      errors.push({ field: `${entryField}.local_path`, message: `must be readable: ${error.message}` });
      return;
    }
    if (!stat.isFile() || stat.size <= 0) {
      errors.push({ field: `${entryField}.local_path`, message: 'must exist and contain bytes' });
      return;
    }
    if (!realFilePath.startsWith(`${assetRoot}${path.sep}`)) {
      errors.push({ field: `${entryField}.local_path`, message: 'resolved file must stay under bundle.asset_dir' });
      return;
    }
    try {
      if (!contentMatchesExtension(filePath, extension)) {
        errors.push({ field: `${entryField}.local_path`, message: 'file content must match image extension' });
      }
    } catch (error) {
      errors.push({ field: `${entryField}.local_path`, message: `must be readable: ${error.message}` });
      return;
    }
    if (Number.isInteger(entry.bytes) && entry.bytes > 0 && stat.size !== entry.bytes) {
      errors.push({ field: `${entryField}.bytes`, message: 'must match bytes on disk' });
    }
  });
}

function readRequired(filePath, field, errors) {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile() || stat.size <= 0) {
      errors.push({ field, message: 'must exist and be nonempty' });
      return null;
    }
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    errors.push({ field, message: `must be readable: ${error.message}` });
    return null;
  }
}

function parseJson(text, field, errors) {
  if (text === null) return null;
  try { return JSON.parse(text); } catch (error) {
    errors.push({ field, message: `must be parseable JSON: ${error.message}` });
    return null;
  }
}

function verifyAgent1Delivery(bundle, rootDir = process.cwd()) {
  const errors = [];
  const contract = validateBundle(bundle);
  if (!contract.valid) errors.push(...contract.errors.map((error) => ({ ...error, field: `bundle.${error.field}` })));
  if (!bundle || typeof bundle.slug !== 'string' || typeof bundle.asset_dir !== 'string') return { valid: false, errors };

  const lexicalRoot = path.resolve(rootDir);
  const lexicalAssetRoot = path.resolve(rootDir, bundle.asset_dir);
  let realRoot;
  let realAssetRoot;
  try {
    realRoot = fs.realpathSync(lexicalRoot);
    realAssetRoot = fs.realpathSync(lexicalAssetRoot);
  } catch (error) {
    errors.push({ field: 'bundle.asset_dir', message: `must resolve to a readable directory: ${error.message}` });
  }
  if (realRoot && realAssetRoot
      && (!lexicalAssetRoot.startsWith(`${lexicalRoot}${path.sep}`)
          || !realAssetRoot.startsWith(`${realRoot}${path.sep}`))) {
    errors.push({ field: 'bundle.asset_dir', message: 'resolved directory must stay under repository root and expected path' });
  }
  const assetRoot = realAssetRoot || lexicalAssetRoot;
  const deliveryDir = path.join(rootDir, '.tmp', 'infocard', bundle.slug);
  const facts = parseJson(readRequired(path.join(deliveryDir, 'facts.json'), 'facts', errors), 'facts', errors);
  readRequired(path.join(deliveryDir, 'research.md'), 'research', errors);
  const manifest = parseJson(readRequired(path.join(rootDir, bundle.manifest_path), 'manifest', errors), 'manifest', errors);

  if (facts && typeof facts === 'object' && !Array.isArray(facts)) {
    if (facts.source_url !== bundle.source_url) errors.push({ field: 'facts.source_url', message: 'must equal bundle.source_url' });
    if (typeof facts.retrieved_at !== 'string' || facts.retrieved_at.trim() === '') errors.push({ field: 'facts.retrieved_at', message: 'must be nonempty' });
    if (!facts.repo_meta || typeof facts.repo_meta !== 'object' || Array.isArray(facts.repo_meta)) errors.push({ field: 'facts.repo_meta', message: 'must be an object' });
    if (!isNonemptyStringArray(facts.claims)) errors.push({ field: 'facts.claims', message: 'must be a nonempty string array' });
    if (!isNonemptyStringArray(facts.required_sections)) errors.push({ field: 'facts.required_sections', message: 'must be a nonempty string array' });
    validateAssetEntries(facts.assets, 'facts.assets', bundle, assetRoot, errors, false);
  } else if (facts !== null) errors.push({ field: 'facts', message: 'must be a JSON object' });

  if (manifest && typeof manifest === 'object' && !Array.isArray(manifest)) {
    validateAssetEntries(manifest.assets, 'manifest.assets', bundle, assetRoot, errors, true);
    if (Array.isArray(manifest.assets) && manifest.assets.length === 0
        && (typeof manifest.reason !== 'string' || manifest.reason.trim() === '')) {
      errors.push({ field: 'manifest.reason', message: 'must explain why there are no assets' });
    }
  } else if (manifest !== null) errors.push({ field: 'manifest', message: 'must be a JSON object' });

  if (facts && typeof facts === 'object' && !Array.isArray(facts)
      && manifest && typeof manifest === 'object' && !Array.isArray(manifest)
      && Array.isArray(facts.assets) && Array.isArray(manifest.assets)) {
    const factsPaths = localPathSet(facts.assets);
    const manifestPaths = localPathSet(manifest.assets);
    const samePaths = factsPaths.size === manifestPaths.size
      && [...factsPaths].every((localPath) => manifestPaths.has(localPath));
    if (!samePaths) errors.push({ field: 'facts.assets', message: 'local_path set must equal manifest.assets' });
  }

  return { valid: errors.length === 0, errors };
}

function main(argv) {
  const index = argv.indexOf('--bundle');
  if (index === -1 || !argv[index + 1]) {
    process.stdout.write(`${JSON.stringify({ valid: false, errors: [{ field: 'bundle', message: 'usage: --bundle path' }] })}\n`);
    return 2;
  }
  try {
    const bundlePath = path.resolve(argv[index + 1]);
    const result = verifyAgent1Delivery(loadBundle(bundlePath), process.cwd());
    process.stdout.write(`${JSON.stringify(result)}\n`);
    return result.valid ? 0 : 1;
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ valid: false, errors: [{ field: 'bundle', message: error.message }] })}\n`);
    return 1;
  }
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { verifyAgent1Delivery, main };
