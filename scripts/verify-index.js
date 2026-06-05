#!/usr/bin/env node
const {
  INDEX_HTML_PATH,
  INDEX_PATH,
  buildIndexData,
  extractInjectedIndexData,
  readText,
  serializeIndexYaml,
} = require("./index-build-lib");

function main() {
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
