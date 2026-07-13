#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const yaml = require('../assets/home/vendor/js-yaml.min.js');
const { loadBundle, validateBundle, bundleAllowlist } = require('./lib/publish-bundle');

const MECHANICAL_FIELDS = {
  slug: 'slug', path: 'html_path', style: 'style', category: 'category', source_url: 'source_url',
};

function rejectDuplicateMechanicalKeys(text) {
  const seen = new Set();
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    const match = /^([A-Za-z_][A-Za-z0-9_-]*):(?:\s|$)/.exec(line);
    if (!match || !Object.hasOwn(MECHANICAL_FIELDS, match[1])) continue;
    if (seen.has(match[1])) throw new Error(`line ${index + 1}: duplicate mechanical key ${match[1]}`);
    seen.add(match[1]);
  }
}

function parseMeta(text) {
  rejectDuplicateMechanicalKeys(text);
  const parsed = yaml.load(text, { schema: yaml.FAILSAFE_SCHEMA });
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('metadata must be a YAML mapping');
  }
  return parsed;
}

function verifyMeta(bundle, root = process.cwd()) {
  const metaPath = path.resolve(root, bundle.meta_path);
  if (!fs.existsSync(metaPath)) return { valid: true, errors: [] };
  let meta;
  try {
    meta = parseMeta(fs.readFileSync(metaPath, 'utf8'));
  } catch (error) {
    return { valid: false, errors: [{ field: 'meta', message: error.message }] };
  }
  const errors = [];
  for (const [metaField, bundleField] of Object.entries(MECHANICAL_FIELDS)) {
    if (meta[metaField] !== bundle[bundleField]) {
      errors.push({ field: `meta.${metaField}`, message: `must exactly match bundle.${bundleField}` });
    }
  }
  return { valid: errors.length === 0, errors };
}

function main(argv) {
  const bundleIndex = argv.indexOf('--bundle');
  if (bundleIndex === -1 || !argv[bundleIndex + 1]) {
    process.stdout.write(`${JSON.stringify({ valid: false, errors: [{ field: 'bundle', message: 'usage: --bundle path' }] })}\n`);
    return 2;
  }
  try {
    const bundle = loadBundle(argv[bundleIndex + 1]);
    const bundleResult = validateBundle(bundle);
    const metaResult = bundleResult.valid ? verifyMeta(bundle) : { valid: true, errors: [] };
    const result = { valid: bundleResult.valid && metaResult.valid, errors: [...bundleResult.errors, ...metaResult.errors] };
    process.stdout.write(`${JSON.stringify({ ...result, allowlist: result.valid ? bundleAllowlist(bundle) : [] })}\n`);
    return result.valid ? 0 : 1;
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ valid: false, errors: [{ field: 'bundle', message: error.message }], allowlist: [] })}\n`);
    return 1;
  }
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));
module.exports = { parseMeta, verifyMeta, main };
