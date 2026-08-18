'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

/**
 * Regression test: _index.yaml must not contain duplicate slug entries.
 *
 * Covers User Story 5 (spec: "重复检测成为构建后验收的一部分，
 * 以便后续发布能在推送前阻止相同 slug 重复") and the testing decision
 * "用 _index.yaml 逐一计数验证目标 slug 恰为 1"。
 *
 * Run: node scripts/test/verify-index-unique-slugs.test.js
 * Or:  npm test  (included in test suite)
 */

test('verify-index-unique-slugs: no slug appears more than once in _index.yaml', () => {
  const indexPath = path.resolve(__dirname, '..', '..', '_index.yaml');

  if (!fs.existsSync(indexPath)) {
    // When _index.yaml is not yet generated (pre-build CI), skip.
    return;
  }

  const content = fs.readFileSync(indexPath, 'utf8');

  // Extract every top-level "slug: <value>" line.
  // The index is a YAML list; each card entry has slug as a top-level scalar key.
  const slugRegex = /^slug:\s*['"]?([^'"\n]+)['"]?\s*$/gm;
  const slugs = [];
  let match;
  while ((match = slugRegex.exec(content)) !== null) {
    slugs.push(match[1]);
  }

  // Group by slug and find duplicates.
  const seen = new Map();
  for (const s of slugs) {
    seen.set(s, (seen.get(s) ?? 0) + 1);
  }

  const duplicates = [...seen.entries()].filter(([, count]) => count > 1);

  assert.deepEqual(
    duplicates,
    [],
    `Found duplicate slugs in _index.yaml: ${JSON.stringify(duplicates)}`,
  );
});
