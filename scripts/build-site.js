#!/usr/bin/env node
const { buildIndexData, runFixMetaDate, writeGeneratedArtifacts } = require("./index-build-lib");

function main() {
  runFixMetaDate();
  const indexData = buildIndexData();
  writeGeneratedArtifacts(indexData);
  console.log(`[build-site] wrote _index.yaml and injected index.html (${indexData._count} cards)`);
}

main();
