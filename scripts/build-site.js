#!/usr/bin/env node
const { execFileSync } = require("child_process");
const path = require("path");
const { buildIndexData, runFixMetaDate, writeGeneratedArtifacts } = require("./index-build-lib");

function runVerifyMetaTimestamps() {
  const script = path.join(__dirname, "verify-meta-timestamps.js");
  execFileSync(process.execPath, [script], { stdio: "inherit" });
}

function runFixMetaShape() {
  // Normalize mechanical meta shape before strict index validation:
  // date/updated quotes, description->desc, safe path correction.
  const script = path.join(__dirname, "fix-meta-shape.js");
  execFileSync(process.execPath, [script, "--write"], { stdio: "inherit" });
}

function main() {
  runFixMetaShape();
  runFixMetaDate();
  runVerifyMetaTimestamps();
  const indexData = buildIndexData();
  writeGeneratedArtifacts(indexData);
  console.log(`[build-site] wrote _index.yaml and injected index.html (${indexData._count} cards)`);
}

main();
