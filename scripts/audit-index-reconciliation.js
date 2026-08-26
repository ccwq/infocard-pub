#!/usr/bin/env node
/* eslint-disable no-console */

const {
  collectIndexReconciliationData,
  formatIndexReconciliationData,
} = require('./index-build-lib');

const jsonMode = process.argv.includes('--json');

function main() {
  const report = collectIndexReconciliationData();
  if (jsonMode) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    process.stdout.write(formatIndexReconciliationData(report));
  }

  if (report.duplicate_slugs.length || report.duplicate_paths.length) {
    process.exitCode = 1;
  }
}

main();
