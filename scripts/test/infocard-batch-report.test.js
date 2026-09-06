'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { createBatchState, transition } = require('../lib/infocard-batch-state');
const { summarizeBatch, formatReport, main } = require('../lib/infocard-batch-report');

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'infocard-batch-report-'));
}

test('batch report summarizes created, candidate, blocked, and done cards', () => {
  const root = tempDir();
  const batchDir = path.join(root, '.docs', 'run-1');
  fs.mkdirSync(batchDir, { recursive: true });
  const state = createBatchState({ runId: 'run-1', cards: ['alpha', 'beta', 'gamma', 'delta'] });
  transition(state, 'alpha', 'AUTHORING_DONE', { artifact: 'card.html' });
  transition(state, 'beta', 'BLOCKED_PROMOTION', { error: 'hash mismatch' });
  transition(state, 'gamma', 'PUSHED', { commit: 'abc123' });
  fs.writeFileSync(path.join(batchDir, 'batch-state.json'), JSON.stringify(state, null, 2));
  fs.mkdirSync(path.join(batchDir, 'alpha'), { recursive: true });
  fs.mkdirSync(path.join(batchDir, 'beta'), { recursive: true });
  fs.mkdirSync(path.join(batchDir, 'gamma'), { recursive: true });
  const summary = summarizeBatch(root, path.join(batchDir, 'batch-state.json'));
  assert.equal(summary.counts.total, 4);
  assert.equal(summary.counts.candidate, 1);
  assert.equal(summary.counts.blocked, 1);
  assert.equal(summary.counts.done, 1);
  assert.equal(summary.cards.find((item) => item.slug === 'alpha').bucket, 'candidate');
  assert.equal(summary.cards.find((item) => item.slug === 'beta').bucket, 'blocked');
  assert.equal(summary.cards.find((item) => item.slug === 'gamma').bucket, 'done');
  assert.equal(summary.cards.find((item) => item.slug === 'delta').bucket, 'in_progress');
});

test('batch report formats a readable local spec report and supports json mode', () => {
  const root = tempDir();
  const batchDir = path.join(root, '.docs', 'run-2');
  fs.mkdirSync(batchDir, { recursive: true });
  const state = createBatchState({ runId: 'run-2', cards: ['alpha'] });
  fs.writeFileSync(path.join(batchDir, 'batch-state.json'), JSON.stringify(state, null, 2));
  const jsonSummary = main(['--state', path.join(batchDir, 'batch-state.json'), '--json'], root);
  assert.equal(jsonSummary.run_id, 'run-2');
  const text = formatReport(jsonSummary);
  assert.match(text, /# Batch Report: run-2/);
  assert.match(text, /- total: 1/);
  assert.match(text, /## alpha/);
});
