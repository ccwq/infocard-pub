#!/usr/bin/env node
'use strict';

const { main } = require('./lib/infocard-batch-report');

if (require.main === module) {
  try {
    const result = main();
    process.stdout.write(typeof result === 'string' ? `${result}\n` : `${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { main };
