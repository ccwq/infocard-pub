#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  appendTimingRecord,
  readTimingJsonl,
  summarizeTiming,
} = require('./lib/infocard-run-timing');

function usage() {
  return 'Usage: node scripts/infocard-run-timing.js <timing.jsonl> | --append <timing.jsonl> <record-json>';
}

function main(argv = process.argv.slice(2)) {
  if (argv[0] === '--append') {
    if (argv.length !== 3) throw new Error(usage());
    let record;
    try {
      record = JSON.parse(argv[2]);
    } catch (error) {
      throw new Error(`record-json must be valid JSON: ${error.message}`);
    }
    appendTimingRecord(path.resolve(argv[1]), record);
    return { appended: true, run_id: record.run_id, stage: record.stage };
  }
  if (argv.length !== 1 || argv[0].startsWith('-')) throw new Error(usage());
  return summarizeTiming(readTimingJsonl(path.resolve(argv[0])));
}

if (require.main === module) {
  try {
    process.stdout.write(`${JSON.stringify(main())}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { main };
