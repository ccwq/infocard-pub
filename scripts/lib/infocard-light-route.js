'use strict';

const LIGHT_ROUTE_LIMIT_MS = 20 * 60 * 1000;
const LIGHT_ROUTE_STAGES = Object.freeze([
  ['route_select', 30000], ['research', 150000], ['preflight_contract', 60000],
  ['authoring', 240000], ['authoring_validation', 60000], ['promotion', 60000],
  ['visual_capture', 120000], ['visual_review', 90000], ['static_gates', 120000],
  ['release', 90000], ['public_verification', 120000], ['closeout', 30000],
]);

const HARD_STOPS = Object.freeze([
  { elapsed_ms: 480000, checkpoint: 'card_html_ready', action: 'switch_to_project_brief_template' },
  { elapsed_ms: 810000, checkpoint: 'local_visual_complete', action: 'one_standard_template_repair_or_block' },
  { elapsed_ms: 930000, checkpoint: 'static_gates_complete', action: 'stop_tool_repair_loop' },
  { elapsed_ms: 1020000, checkpoint: 'push_complete', action: 'switch_to_localhost_7897_proxy' },
  { elapsed_ms: LIGHT_ROUTE_LIMIT_MS, checkpoint: 'terminal_state', action: 'terminate' },
]);

const TERMINAL_STATES = Object.freeze(['PUBLISHED_VERIFIED', 'PAGES_PENDING', 'PUSH_FAILED', 'BLOCKED_AT_LOCAL_GATE']);

function buildTargetedGateCommands(htmlPath, metaPath = htmlPath + '.meta.yaml') {
  if (typeof htmlPath !== 'string' || !/^docs\/.+\.html$/.test(htmlPath)) throw new TypeError('htmlPath must be docs/<slug>.html');
  const npm = (args) => process.platform === 'win32'
    ? ['cmd.exe', ['/d', '/s', '/c', 'npm', ...args]]
    : ['npm', args];
  return [
    npm(['run', 'build']),
    npm(['run', 'verify']),
    ['node', ['scripts/verify-taxonomy.js', metaPath]],
    ['node', ['scripts/check-info-leak.js', htmlPath]],
    npm(['run', 'verify:visual-gate', '--', htmlPath]),
  ];
}

function evaluateSla(stageDurations = {}) {
  const stage_budget_ms = Object.fromEntries(LIGHT_ROUTE_STAGES);
  const errors = [];
  let stage_total_ms = 0;
  for (const [stage, rawDuration] of Object.entries(stageDurations)) {
    const duration = Number(rawDuration);
    if (stage_budget_ms[stage] === undefined) { errors.push({ stage, message: 'unknown stage' }); continue; }
    if (!Number.isFinite(duration) || duration < 0) { errors.push({ stage, message: 'duration must be a non-negative number' }); continue; }
    stage_total_ms += duration;
    if (duration > stage_budget_ms[stage]) errors.push({ stage, message: 'stage budget exceeded', duration_ms: duration, budget_ms: stage_budget_ms[stage] });
  }
  const budget_total_ms = LIGHT_ROUTE_STAGES.reduce((sum, [, budget]) => sum + budget, 0);
  const missing = LIGHT_ROUTE_STAGES.map(([stage]) => stage).filter((stage) => !Object.prototype.hasOwnProperty.call(stageDurations, stage));
  for (const stage of missing) errors.push({ stage, message: 'stage is missing' });
  return {
    valid: errors.length === 0 && budget_total_ms === 1170000 && stage_total_ms <= LIGHT_ROUTE_LIMIT_MS,
    wall_clock_limit_ms: LIGHT_ROUTE_LIMIT_MS,
    budget_total_ms,
    buffer_ms: LIGHT_ROUTE_LIMIT_MS - budget_total_ms,
    stage_total_ms,
    over_limit: stage_total_ms > LIGHT_ROUTE_LIMIT_MS,
    stage_budget_ms,
    errors,
  };
}

module.exports = { LIGHT_ROUTE_LIMIT_MS, LIGHT_ROUTE_STAGES, HARD_STOPS, TERMINAL_STATES, buildTargetedGateCommands, evaluateSla };
