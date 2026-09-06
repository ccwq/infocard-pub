'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createBatchState, transition, applyStageOutcome, ensureCard, assertSharedStageOrder, saveBatchState, loadBatchState } = require('../lib/infocard-batch-state');

test('batch state records per-card progress and minimal recovery state', () => {
  const state = createBatchState({ runId: 'run-1', cards: ['demo'] });
  assert.equal(state.cards.demo.state, 'DISCOVERED');
  ensureCard(state, 'extra');
  assert.equal(state.cards.extra.state, 'DISCOVERED');
  applyStageOutcome(state, 'demo', 'authoring', { result: 'completed', artifact: 'card.html' });
  applyStageOutcome(state, 'demo', 'promotion', { result: 'failed', terminalState: 'BLOCKED_PROMOTION', error: 'hash mismatch' });
  assert.equal(state.cards.demo.state, 'BLOCKED_PROMOTION');
  assert.equal(state.cards.demo.last_error, 'hash mismatch');
  assert.equal(state.cards.demo.stages.authoring.artifact, 'card.html');
  assert.equal(state.cards.demo.stages.promotion.error, 'hash mismatch');
});

test('shared stages are strictly ordered and state is durable', () => {
  const state = createBatchState({ runId: 'run-2', cards: ['demo'] });
  assert.throws(() => assertSharedStageOrder(state, 'verify'), /requires build/);
  assertSharedStageOrder(state, 'build');
  assertSharedStageOrder(state, 'verify');
  assertSharedStageOrder(state, 'commit');
  assertSharedStageOrder(state, 'push');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'batch-state-'));
  const file = path.join(dir, 'state.json');
  saveBatchState(file, state);
  assert.deepEqual(loadBatchState(file), state);
});
