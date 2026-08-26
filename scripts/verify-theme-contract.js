#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { validateThemeContract } = require('./lib/theme-contract');

function main(argv = process.argv.slice(2), cwd = process.cwd()) {
  const bundlePath = argv.indexOf('--bundle');
  if (bundlePath === -1 || !argv[bundlePath + 1]) {
    return { code: 2, output: { valid: false, errors: [{ field: 'bundle', message: 'usage: --bundle path' }] } };
  }
  const absolute = path.resolve(cwd, argv[bundlePath + 1]);
  try {
    const manifest = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    const entries = manifest.files.map((entry) => ({
      ...entry,
      sourceAbsolute: path.resolve(cwd, entry.source),
    }));
    const result = validateThemeContract({ root: cwd, bundle: manifest.bundle, entries });
    return { code: result.valid ? 0 : 1, output: result };
  } catch (cause) {
    return { code: 1, output: { valid: false, errors: [{ field: 'bundle', message: cause.message }] } };
  }
}

if (require.main === module) {
  const result = main();
  process.stdout.write(JSON.stringify(result.output, null, 2) + '\n');
  process.exitCode = result.code;
}

module.exports = { main };