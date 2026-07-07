#!/usr/bin/env node
const {
  INDEX_HTML_PATH,
  INDEX_PATH,
  buildIndexData,
  extractInjectedIndexData,
  readText,
  serializeIndexYaml,
} = require("./index-build-lib");
const { execFileSync } = require("child_process");
const path = require("path");

function runVerifyMetaTimestamps() {
  const script = path.join(__dirname, "verify-meta-timestamps.js");
  execFileSync(process.execPath, [script], { stdio: "inherit" });
}

function main() {
  runVerifyMetaTimestamps();
  const expected = buildIndexData();
  const actualYaml = readText(INDEX_PATH);
  const expectedYaml = serializeIndexYaml(expected);

  if (actualYaml !== expectedYaml) {
    throw new Error("_index.yaml is out of date; run npm run build and commit the result");
  }

  const injected = extractInjectedIndexData(readText(INDEX_HTML_PATH));
  if (JSON.stringify(injected) !== JSON.stringify(expected)) {
    throw new Error("index.html injected home-index-data is out of date; run npm run build and commit the result");
  }

  console.log(`[verify-index] OK: ${expected._count} cards`);
}

main();
