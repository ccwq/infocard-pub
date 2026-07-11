#!/usr/bin/env node
'use strict';

const { loadBundle, validateBundle, bundleAllowlist } = require('./lib/publish-bundle');

function main(argv) {
  const bundleIndex = argv.indexOf('--bundle');
  if (bundleIndex === -1 || !argv[bundleIndex + 1]) {
    process.stdout.write(`${JSON.stringify({ valid: false, errors: [{ field: 'bundle', message: 'usage: --bundle path' }] })}\n`);
    return 2;
  }

  try {
    const bundle = loadBundle(argv[bundleIndex + 1]);
    const result = validateBundle(bundle);
    process.stdout.write(`${JSON.stringify({ ...result, allowlist: result.valid ? bundleAllowlist(bundle) : [] })}\n`);
    return result.valid ? 0 : 1;
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ valid: false, errors: [{ field: 'bundle', message: error.message }], allowlist: [] })}\n`);
    return 1;
  }
}

process.exitCode = main(process.argv.slice(2));
