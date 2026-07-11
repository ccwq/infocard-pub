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

function nonemptyFile(filePath) {
  try { return fs.statSync(filePath).isFile() && fs.statSync(filePath).size > 0; } catch (_) { return false; }
}

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

function assetPath(bundle, rootDir, localPath) {
  if (typeof localPath !== 'string' || localPath.trim() === '' || localPath.includes('\\') || path.posix.isAbsolute(localPath)) return null;
  const parts = localPath.split('/');
  if (parts.includes('..')) return null;
  const assetRoot = path.resolve(rootDir, bundle.asset_dir);
  const repoRelativePrefix = `${bundle.asset_dir}/`;
  const relative = localPath.startsWith(repoRelativePrefix) ? localPath.slice(repoRelativePrefix.length) : localPath;
  const resolved = path.resolve(assetRoot, relative);
  return resolved.startsWith(`${assetRoot}${path.sep}`) ? resolved : null;
}

function validateAssetEntries(entries, field, bundle, rootDir, errors, checkDisk) {
  if (!Array.isArray(entries)) {
    errors.push({ field, message: 'must be an array' });
    return;
  }
  entries.forEach((entry, index) => {
    const entryField = `${field}.${index}`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push({ field: entryField, message: 'must be an object' });
      return;
    }
    const filePath = assetPath(bundle, rootDir, entry.local_path);
    if (!filePath) {
      errors.push({ field: `${entryField}.local_path`, message: 'must stay under bundle.asset_dir' });
      return;
    }
    const extension = path.extname(filePath).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      errors.push({ field: `${entryField}.local_path`, message: 'must use an accepted image extension' });
      return;
    }
    if (entry.mime_type && (!MIME_EXTENSIONS[entry.mime_type] || !MIME_EXTENSIONS[entry.mime_type].has(extension))) {
      errors.push({ field: `${entryField}.mime_type`, message: 'must match the local file extension' });
    }
    if (!checkDisk) return;
    if (!nonemptyFile(filePath)) {
      errors.push({ field: `${entryField}.local_path`, message: 'must exist and contain bytes' });
      return;
    }
    if (!contentMatchesExtension(filePath, extension)) {
      errors.push({ field: `${entryField}.local_path`, message: 'file content must match its image extension' });
    }
    if (Number.isInteger(entry.bytes) && entry.bytes >= 0 && fs.statSync(filePath).size !== entry.bytes) {
      errors.push({ field: `${entryField}.bytes`, message: 'must match bytes on disk' });
    }
  });
}

function readRequired(filePath, field, errors) {
  if (!nonemptyFile(filePath)) {
    errors.push({ field, message: 'must exist and be nonempty' });
    return null;
  }
  return fs.readFileSync(filePath, 'utf8');
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

  const deliveryDir = path.join(rootDir, '.tmp', 'infocard', bundle.slug);
  const facts = parseJson(readRequired(path.join(deliveryDir, 'facts.json'), 'facts', errors), 'facts', errors);
  readRequired(path.join(deliveryDir, 'research.md'), 'research', errors);
  const manifest = parseJson(readRequired(path.join(rootDir, bundle.manifest_path), 'manifest', errors), 'manifest', errors);

  if (facts && typeof facts === 'object' && !Array.isArray(facts)) {
    if (facts.source_url !== bundle.source_url) errors.push({ field: 'facts.source_url', message: 'must equal bundle.source_url' });
    if (typeof facts.retrieved_at !== 'string' || facts.retrieved_at.trim() === '') errors.push({ field: 'facts.retrieved_at', message: 'must be nonempty' });
    if (!facts.repo_meta || typeof facts.repo_meta !== 'object' || Array.isArray(facts.repo_meta)) errors.push({ field: 'facts.repo_meta', message: 'must be an object' });
    if (!Array.isArray(facts.claims) || facts.claims.length === 0) errors.push({ field: 'facts.claims', message: 'must be a nonempty array' });
    if (!Array.isArray(facts.required_sections) || facts.required_sections.length === 0) errors.push({ field: 'facts.required_sections', message: 'must be a nonempty array' });
    validateAssetEntries(facts.assets, 'facts.assets', bundle, rootDir, errors, false);
  } else if (facts !== null) errors.push({ field: 'facts', message: 'must be a JSON object' });

  if (manifest && typeof manifest === 'object' && !Array.isArray(manifest)) {
    validateAssetEntries(manifest.assets, 'manifest.assets', bundle, rootDir, errors, true);
    if (Array.isArray(manifest.assets) && manifest.assets.length === 0
        && (typeof manifest.reason !== 'string' || manifest.reason.trim() === '')) {
      errors.push({ field: 'manifest.reason', message: 'must explain why there are no assets' });
    }
  } else if (manifest !== null) errors.push({ field: 'manifest', message: 'must be a JSON object' });

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
