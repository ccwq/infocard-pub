#!/usr/bin/env node
'use strict';

const { promoteInfocard } = require('./lib/infocard-promotion');

function parseArgs(argv) {
  const manifestIndex = argv.indexOf('--manifest');
  if (manifestIndex === -1 || !argv[manifestIndex + 1] || argv.length !== 2) {
    const err = new Error('usage: --manifest path');
    err.usage = true;
    throw err;
  }
  return { manifestPath: argv[manifestIndex + 1] };
}

function main(argv, cwd = process.cwd()) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (cause) {
    return { code: cause.usage ? 2 : 1, output: { valid: false, errors: [{ field: 'manifest', message: cause.message }], copied: [] } };
  }
  const output = promoteInfocard({ root: cwd, manifestPath: args.manifestPath });
  return { code: output.valid ? 0 : 1, output };
}

if (require.main === module) {
  const result = main(process.argv.slice(2));
  process.stdout.write(JSON.stringify(result.output) + '\n');
  process.exitCode = result.code;
}

module.exports = { parseArgs, main };
