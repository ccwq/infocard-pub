#!/usr/bin/env node
const { execFileSync } = require("child_process");
const path = require("path");
const { buildIndexData, runFixMetaDate, writeGeneratedArtifacts } = require("./index-build-lib");

function runQuoteMetaDates() {
  // Auto-quote bare wall-clock date/updated values before the build's strict
  // assertion runs. Keeps "must be quoted strings" out of the human's hands.
  const script = path.join(__dirname, "quote-meta-dates.js");
  execFileSync(process.execPath, [script, "--write"], { stdio: "inherit" });
}

function main() {
  runQuoteMetaDates();
  runFixMetaDate();
  const indexData = buildIndexData();
  writeGeneratedArtifacts(indexData);
  console.log(`[build-site] wrote _index.yaml and injected index.html (${indexData._count} cards)`);
}

main();
