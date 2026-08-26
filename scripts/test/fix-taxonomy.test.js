'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { dimensionValues, diffTaxonomy } = require('../fix-taxonomy');

test('taxonomy diff normalizes scalar dimensions before computing additions/removals', () => {
  const changes = diffTaxonomy(
    { style: 'darkblue', topics: ['AI'] },
    { style: 'blue', topics: ['AI', 'Agents'] },
  );
  assert.deepEqual(changes, [
    { dim: 'topics', from: ['AI'], to: ['AI', 'Agents'] },
    { dim: 'style', from: ['darkblue'], to: ['blue'] },
  ]);
});

test('empty taxonomy values become empty arrays', () => {
  assert.deepEqual(dimensionValues(undefined), []);
  assert.deepEqual(dimensionValues(null), []);
  assert.deepEqual(dimensionValues(''), []);
  assert.deepEqual(dimensionValues('Python'), ['Python']);
  assert.deepEqual(dimensionValues(['Python']), ['Python']);
});
