#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { loadBundle, validateBundle } = require('./lib/publish-bundle');

function yamlString(value) {
  return JSON.stringify(String(value));
}

function generateMeta(bundle) {
  return [
    `slug: ${yamlString(bundle.slug)}`,
    `path: ${yamlString(bundle.html_path)}`,
    `style: ${yamlString(bundle.style)}`,
    `category: ${yamlString(bundle.category)}`,
    `source_url: ${yamlString(bundle.source_url)}`,
    `title: ${yamlString('__AGENT2_FILL_TITLE__')}`,
    `desc: ${yamlString('__AGENT2_FILL_DESC__')}`,
    `tags: [${yamlString('__AGENT2_FILL_TAGS__')}]`,
    '',
  ].join('\n');
}

function output(body) {
  process.stdout.write(`${JSON.stringify(body)}\n`);
}

function main(argv) {
  const bundleIndex = argv.indexOf('--bundle');
  const write = argv.includes('--write');
  const replace = argv.includes('--replace');
  if (bundleIndex === -1 || !argv[bundleIndex + 1] || (replace && !write)) {
    output({ valid: false, errors: [{ field: 'arguments', message: 'usage: --bundle path [--write [--replace]]' }] });
    return 2;
  }

  try {
    const bundle = loadBundle(argv[bundleIndex + 1]);
    const validation = validateBundle(bundle);
    if (!validation.valid) {
      output({ ...validation, written: false });
      return 1;
    }

    const yaml = generateMeta(bundle);
    if (!write) {
      output({ valid: true, errors: [], written: false, path: bundle.meta_path, yaml });
      return 0;
    }

    const metaPath = path.resolve(bundle.meta_path);
    if (fs.existsSync(metaPath) && !replace) {
      output({ valid: false, errors: [{ field: 'meta_path', message: 'already exists; pass --replace to overwrite' }], written: false, path: bundle.meta_path });
      return 1;
    }
    fs.mkdirSync(path.dirname(metaPath), { recursive: true });
    fs.writeFileSync(metaPath, yaml, 'utf8');
    output({ valid: true, errors: [], written: true, path: bundle.meta_path });
    return 0;
  } catch (error) {
    output({ valid: false, errors: [{ field: 'bundle', message: error.message }], written: false });
    return 1;
  }
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { generateMeta, yamlString, main };
