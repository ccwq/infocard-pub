'use strict';

const { performance } = require('node:perf_hooks');
const { LIGHT_ROUTE_LIMIT_MS, HARD_STOPS, TERMINAL_STATES } = require('./infocard-light-route');

function iso(ms) { return new Date(ms).toISOString(); }

/** Execute a bounded light route. Stage functions receive shared context and may return a terminalState. */
async function runLightRoute({ runId, stages, monotonicClock = performance, wallClock = Date, onRecord = () => {}, context = {} } = {}) {
  if (!runId || !Array.isArray(stages) || stages.length === 0) throw new TypeError('runId and non-empty stages are required');
  const monoNow = () => monotonicClock.now();
  const wallNow = () => wallClock.now();
  const start = monoNow();
  const wallStart = wallNow();
  const records = [];
  const emit = (record) => { records.push(record); onRecord(record); };
  emit({ schema_version: 2, run_id: runId, event: 'run_start', stage: 'run_start', started_at: iso(wallStart), duration_ms: 0 });
  const shared = { ...context, runId, startedAt: wallStart, monotonicStartedAt: start, hardStops: HARD_STOPS };
  let terminalState = null;
  let hardStop = null;
  for (const stage of stages) {
    const elapsed = monoNow() - start;
    shared.remainingMs = Math.max(0, LIGHT_ROUTE_LIMIT_MS - elapsed);
    const checkpoints = HARD_STOPS.filter((item) => !shared[`checkpoint_${item.checkpoint}`] && elapsed >= item.elapsed_ms);
    for (const checkpoint of checkpoints) {
      shared[`checkpoint_${checkpoint.checkpoint}`] = true;
      shared.hardStopActions = [...(shared.hardStopActions || []), checkpoint];
      if (checkpoint.action === 'switch_to_project_brief_template') shared.forceProjectBriefTemplate = true;
      if (checkpoint.action === 'one_standard_template_repair_or_block') shared.maxVisualRepairRounds = 1;
      if (checkpoint.action === 'stop_tool_repair_loop') shared.allowToolRepairLoop = false;
      if (checkpoint.action === 'switch_to_localhost_7897_proxy') shared.forceProxy = true;
      if (checkpoint.action === 'terminate') { hardStop = checkpoint; terminalState = terminalState || 'BLOCKED_AT_LOCAL_GATE'; }
    }
    if (terminalState) break;
    const started = monoNow();
    const controller = new AbortController();
    const stagePromise = Promise.resolve().then(() => stage.run(shared, controller.signal));
    const timeoutMs = Math.max(1, Math.min(stage.budgetMs || LIGHT_ROUTE_LIMIT_MS, shared.remainingMs || LIGHT_ROUTE_LIMIT_MS));
    let result;
    let timer;
    try {
      result = await Promise.race([stagePromise, new Promise((resolve) => { timer = setTimeout(() => { controller.abort(); resolve({ result: 'stage_timeout', terminalState: 'BLOCKED_AT_LOCAL_GATE' }); }, timeoutMs); })]);
    } finally { clearTimeout(timer); }
    const ended = monoNow();
    const duration = Math.max(0, Math.round(ended - started));
    const stageWallStart = wallStart + Math.round(started - start);
    emit({ schema_version: 2, run_id: runId, stage: stage.stage, parent_stage: stage.parentStage || null, timer_mode: stage.timerMode || 'serial', work_type: stage.workType || 'execution', started_at: iso(stageWallStart), ended_at: iso(stageWallStart + duration), duration_ms: duration, budget_ms: stage.budgetMs || 0, budget_status: duration <= (stage.budgetMs || 0) ? 'within' : 'over', retry_count: result && result.retryCount || 0, rework_count: result && result.reworkCount || 0, result: result && result.result || 'completed' });
    if (result && result.terminalState) { if (!TERMINAL_STATES.includes(result.terminalState)) throw new Error(`invalid terminal state: ${result.terminalState}`); terminalState = result.terminalState; break; }
    if (monoNow() - start >= LIGHT_ROUTE_LIMIT_MS) { hardStop = HARD_STOPS.at(-1); terminalState = terminalState || 'BLOCKED_AT_LOCAL_GATE'; break; }
  }
  if (terminalState) { const terminalAt = wallStart + (monoNow() - start); emit({ schema_version: 2, run_id: runId, stage: 'hard_stop', parent_stage: null, timer_mode: 'serial', work_type: 'execution', started_at: iso(terminalAt), ended_at: iso(terminalAt), duration_ms: 0, budget_ms: 0, budget_status: 'not_applicable', retry_count: 0, rework_count: 0, result: terminalState, terminal_state: terminalState }); }
  return { terminalState, hardStop, records, context: shared };
}

module.exports = { runLightRoute };
