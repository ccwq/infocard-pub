#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { loadBundle, validateBundle, bundleAllowlist } = require('./lib/publish-bundle');

const MECHANICAL_FIELDS = {
  slug: 'slug',
  path: 'html_path',
  style: 'style',
  category: 'category',
  source_url: 'source_url',
};

function parseScalar(raw, lineNumber) {
  const value = raw.trim();
  if (!value) return '';
  if (value.startsWith('"')) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== 'string') throw new Error('must be a string');
      return parsed;
    } catch (error) {
      throw new Error(`line ${lineNumber}: invalid quoted scalar (${error.message})`);
    }
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'") || value.length < 2) throw new Error(`line ${lineNumber}: invalid quoted scalar`);
    return value.slice(1, -1).replaceAll("''", "'");
  }
  if (value.startsWith('[') || value.startsWith('{')) return value;
  return value.replace(/\s+#.*$/, '').trim();
}

function parseMeta(text) {
  const result = {};
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || /^\s*#/.test(line) || /^\s/.test(line)) continue;
    const match = /^([A-Za-z_][A-Za-z0-9_-]*):(?:\s*(.*))?$/.exec(line);
    if (!match) throw new Error(`line ${index + 1}: invalid top-level YAML`);
    result[match[1]] = parseScalar(match[2] || '', index + 1);
  }
  return result;
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
    const result = {
      valid: bundleResult.valid && metaResult.valid,
      errors: [...bundleResult.errors, ...metaResult.errors],
    };
    process.stdout.write(`${JSON.stringify({ ...result, allowlist: result.valid ? bundleAllowlist(bundle) : [] })}\n`);
    return result.valid ? 0 : 1;
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ valid: false, errors: [{ field: 'bundle', message: error.message }], allowlist: [] })}\n`);
    return 1;
  }
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { parseMeta, verifyMeta, main };
