'use strict';

const fs = require('node:fs');
const path = require('node:path');

const CARD_STATES = Object.freeze([
  'DISCOVERED', 'FACTS_FROZEN', 'THEME_FROZEN', 'AUTHORING_READY', 'AUTHORING_DONE',
  'STATIC_PREFLIGHT_PASSED', 'PROMOTED', 'VISUAL_PENDING', 'VISUAL_PASSED',
  'BUILD_PASSED', 'VERIFY_PASSED', 'COMMITTED', 'PUSHED', 'PUBLIC_VERIFIED',
]);
const BLOCKED_STATES = Object.freeze([
  'BLOCKED_RESEARCH', 'BLOCKED_AUTHORING', 'BLOCKED_THEME', 'BLOCKED_PROMOTION',
  'BLOCKED_VISUAL', 'BLOCKED_BUILD', 'BLOCKED_PUBLIC', 'BLOCKED_INTEGRATION',
]);
const ALL_STATES = new Set([...CARD_STATES, ...BLOCKED_STATES]);

function createBatchState({ runId, cards = [] } = {}) {
  if (!runId || typeof runId !== 'string') throw new TypeError('runId is required');
  if (!Array.isArray(cards) || cards.some((slug) => typeof slug !== 'string' || !slug.trim())) {
    throw new TypeError('cards must be a non-empty slug array');
  }
  return {
    schema_version: 1,
    run_id: runId,
    created_at: new Date().toISOString(),
    cards: Object.fromEntries(cards.map((slug) => [slug, {
      state: 'DISCOVERED',
      attempts: 0,
      stages: {},
      last_error: null,
    }])),
    shared: { build: 'pending', verify: 'pending', commit: 'pending', push: 'pending' },
  };
}

function transition(state, slug, next, detail = {}) {
  if (!state || !state.cards || !state.cards[slug]) throw new Error(`unknown card: ${slug}`);
  if (!ALL_STATES.has(next)) throw new Error(`unknown state: ${next}`);
  const card = state.cards[slug];
  const previous = card.state;
  card.state = next;
  card.attempts += 1;
  card.stages[next] = { at: new Date().toISOString(), ...detail };
  card.last_error = next.startsWith('BLOCKED_') ? (detail.error || 'blocked') : null;
  return { previous, next, slug };
}

function assertSharedStageOrder(state, stage) {
  const order = ['build', 'verify', 'commit', 'push'];
  const index = order.indexOf(stage);
  if (index < 0) throw new Error(`unknown shared stage: ${stage}`);
  for (let i = 0; i < index; i++) {
    if (state.shared[order[i]] !== 'passed') throw new Error(`${stage} requires ${order[i]} to be passed`);
  }
  state.shared[stage] = 'passed';
  return state;
}

function saveBatchState(file, state) {
  const target = path.resolve(file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(state, null, 2) + '\n');
}

function loadBatchState(file) {
  const state = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  if (state.schema_version !== 1 || !state.run_id || !state.cards) throw new Error('invalid batch state');
  return state;
}

module.exports = { CARD_STATES, BLOCKED_STATES, ALL_STATES, createBatchState, transition, assertSharedStageOrder, saveBatchState, loadBatchState };
