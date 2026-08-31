'use strict';

const FULL_ROUTE_LIMIT_MS = 30 * 60 * 1000;
const FULL_ROUTE_STAGES = Object.freeze([
  ['research', 240000],
  ['theme_decision', 60000],
  ['authoring', 360000],
  ['publisher_audit', 180000],
  ['promotion_static', 240000],
  ['build_verify', 300000],
  ['release_public', 240000],
]);
const FULL_ROUTE_HARD_STOPS = Object.freeze([
  { elapsed_ms: 240000, checkpoint: 'research_closed', action: 'stop_research_and_author' },
  { elapsed_ms: 600000, checkpoint: 'candidate_ready', action: 'stop_child_and_take_over' },
  { elapsed_ms: 1020000, checkpoint: 'release_ready', action: 'minimal_gap_recovery_only' },
  { elapsed_ms: FULL_ROUTE_LIMIT_MS, checkpoint: 'terminal_state', action: 'terminate' },
]);

function evaluateFullRouteSla(stageDurations = {}) {
  const stage_budget_ms = Object.fromEntries(FULL_ROUTE_STAGES);
  const errors = [];
  let stage_total_ms = 0;
  for (const [stage, rawDuration] of Object.entries(stageDurations)) {
    const duration = Number(rawDuration);
    if (stage_budget_ms[stage] === undefined) { errors.push({ stage, message: 'unknown stage' }); continue; }
    if (!Number.isFinite(duration) || duration < 0) { errors.push({ stage, message: 'duration must be a non-negative number' }); continue; }
    stage_total_ms += duration;
    if (duration > stage_budget_ms[stage]) errors.push({ stage, message: 'stage budget exceeded', duration_ms: duration, budget_ms: stage_budget_ms[stage] });
  }
  for (const [stage] of FULL_ROUTE_STAGES) if (!Object.hasOwn(stageDurations, stage)) errors.push({ stage, message: 'stage is missing' });
  const budget_total_ms = FULL_ROUTE_STAGES.reduce((total, [, budget]) => total + budget, 0);
  return {
    valid: errors.length === 0 && stage_total_ms <= FULL_ROUTE_LIMIT_MS,
    wall_clock_limit_ms: FULL_ROUTE_LIMIT_MS,
    budget_total_ms,
    buffer_ms: FULL_ROUTE_LIMIT_MS - budget_total_ms,
    stage_total_ms,
    over_limit: stage_total_ms > FULL_ROUTE_LIMIT_MS,
    stage_budget_ms,
    errors,
  };
}

module.exports = { FULL_ROUTE_LIMIT_MS, FULL_ROUTE_STAGES, FULL_ROUTE_HARD_STOPS, evaluateFullRouteSla };
