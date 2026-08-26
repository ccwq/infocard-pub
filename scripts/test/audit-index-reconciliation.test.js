'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const SCRIPT = path.join(ROOT, 'scripts/audit-index-reconciliation.js');

function run(args = []) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return result;
}

test('audit-index-reconciliation reports known duplicate families in json and text modes', () => {
  const jsonResult = run(['--json']);
  assert.notEqual(jsonResult.status, null);
  assert.notEqual(jsonResult.status, 2, jsonResult.stderr);

  const report = JSON.parse(jsonResult.stdout);
  const duplicateSlugNames = report.duplicate_slugs.map((group) => group.slug);
  const duplicatePathNames = report.duplicate_paths.map((group) => group.path);

  assert.ok(duplicateSlugNames.includes('graph-engineering'));
  assert.ok(duplicateSlugNames.includes('20260621-camoufox-anti-detect-browser-firefox'));
  assert.ok(duplicatePathNames.includes('docs/20260621-camoufox-anti-detect-browser-firefox.html'));
  assert.ok(duplicatePathNames.includes('docs/20260713-colibri-moe-inference.html'));
  assert.ok(duplicatePathNames.includes('docs/20260726-qwable-local-deploy.html'));

  const textResult = run();
  assert.notEqual(textResult.status, null);
  assert.notEqual(textResult.status, 2, textResult.stderr);
  assert.match(textResult.stdout, /\[index-reconciliation\] DUPLICATE_SLUG graph-engineering/);
  assert.match(textResult.stdout, /\[index-reconciliation\] DUPLICATE_PATH docs\/20260726-qwable-local-deploy\.html/);
  assert.match(textResult.stdout, /\[index-reconciliation\] duplicate_slugs=/);
});
