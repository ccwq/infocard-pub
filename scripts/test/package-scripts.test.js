'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const packageJson = require(path.resolve(__dirname, '../../package.json'));

test('exposes card verification gates as package scripts', () => {
  assert.equal(
    packageJson.scripts['verify-card-content'],
    'node scripts/verify-card-content.js'
  );
  assert.equal(
    packageJson.scripts['verify-local-assets'],
    'node scripts/verify-local-assets.js'
  );
  assert.equal(
    packageJson.scripts['verify:publish-local-gate'],
    'node scripts/verify-publish-local-gate.js'
  );
});
