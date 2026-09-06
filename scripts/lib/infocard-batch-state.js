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
const STAGE_SUCCESS_STATE = Object.freeze({
  route_select: 'DISCOVERED',
  research: 'FACTS_FROZEN',
  preflight_contract: 'THEME_FROZEN',
  authoring: 'AUTHORING_DONE',
  authoring_validation: 'STATIC_PREFLIGHT_PASSED',
  promotion: 'PROMOTED',
  visual_capture: 'VISUAL_PENDING',
  visual_review: 'VISUAL_PASSED',
  static_gates: 'VERIFY_PASSED',
  release: 'PUSHED',
  public_verification: 'PUBLIC_VERIFIED',
  closeout: 'PUBLIC_VERIFIED',
});
const STAGE_BLOCKED_STATE = Object.freeze({
  route_select: 'BLOCKED_RESEARCH',
  research: 'BLOCKED_RESEARCH',
  preflight_contract: 'BLOCKED_THEME',
  authoring: 'BLOCKED_AUTHORING',
  authoring_validation: 'BLOCKED_AUTHORING',
  promotion: 'BLOCKED_PROMOTION',
  visual_capture: 'BLOCKED_VISUAL',
  visual_review: 'BLOCKED_VISUAL',
  static_gates: 'BLOCKED_BUILD',
  release: 'BLOCKED_INTEGRATION',
  public_verification: 'BLOCKED_PUBLIC',
  closeout: 'BLOCKED_INTEGRATION',
});
const FINAL_STATES = new Set(['COMMITTED', 'PUSHED', 'PUBLIC_VERIFIED']);

function stageSuccessState(stage) {
  return STAGE_SUCCESS_STATE[stage] || null;
}

function stageBlockedState(stage) {
  return STAGE_BLOCKED_STATE[stage] || 'BLOCKED_INTEGRATION';
}

function markSharedStageProgress(state, stage) {
  if (!state || !state.shared) return;
  if (stage === 'static_gates') {
    assertSharedStageOrder(state, 'build');
    assertSharedStageOrder(state, 'verify');
  }
  if (stage === 'release') {
    assertSharedStageOrder(state, 'commit');
    assertSharedStageOrder(state, 'push');
  }
}

function applyStageOutcome(state, slug, stage, outcome = {}) {
  if (!state || !state.cards || !state.cards[slug]) throw new Error(`unknown card: ${slug}`);
  if (!stage || typeof stage !== 'string') throw new TypeError('stage is required');
  const card = state.cards[slug];
  const previous = card.state;
  card.stages[stage] = { at: new Date().toISOString(), ...card.stages[stage], ...outcome };
  const terminalState = typeof outcome.terminalState === 'string' ? outcome.terminalState : null;
  const failed = Boolean(terminalState && terminalState.startsWith('BLOCKED_'))
    || outcome.result === 'failed'
    || outcome.result === 'stage_timeout';
  if (failed) {
    const next = terminalState && ALL_STATES.has(terminalState) ? terminalState : stageBlockedState(stage);
    transition(state, slug, next, { stage, ...outcome });
    return { previous, next, slug };
  }
  const next = stageSuccessState(stage);
  if (next) transition(state, slug, next, { stage, ...outcome });
  markSharedStageProgress(state, stage);
  return { previous, next: next || previous, slug };
}

function createEmptyCard() {
  return { state: 'DISCOVERED', attempts: 0, stages: {}, last_error: null };
}

function ensureCard(state, slug) {
  if (!state || !state.cards || typeof slug !== 'string' || !slug.trim()) return state;
  if (!state.cards[slug]) state.cards[slug] = createEmptyCard();
  return state;
}

function createBatchState({ runId, cards = [] } = {}) {
  if (!runId || typeof runId !== 'string') throw new TypeError('runId is required');
  if (!Array.isArray(cards) || cards.some((slug) => typeof slug !== 'string' || !slug.trim())) {
    throw new TypeError('cards must be a non-empty slug array');
  }
  return {
    schema_version: 1,
    run_id: runId,
    created_at: new Date().toISOString(),
    cards: Object.fromEntries(cards.map((slug) => [slug, createEmptyCard()])),
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

module.exports = {
  CARD_STATES,
  BLOCKED_STATES,
  ALL_STATES,
  createBatchState,
  createEmptyCard,
  ensureCard,
  stageSuccessState,
  stageBlockedState,
  applyStageOutcome,
  transition,
  assertSharedStageOrder,
  saveBatchState,
  loadBatchState,
};
