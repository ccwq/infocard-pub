'use strict';

const fs = require('node:fs');

const HARD_STOP_MS = 20 * 60 * 1000;
const SCHEMA_VERSION = 2;
const TIMER_MODES = new Set(['serial', 'parallel']);
const WORK_TYPES = new Set(['execution', 'deployment_wait', 'repair']);
const BUDGET_STATUSES = new Set(['within', 'over', 'not_applicable']);
const TERMINAL_STATES = Object.freeze([
  'PUBLISHED_VERIFIED',
  'PAGES_PENDING',
  'PUSH_FAILED',
  'BLOCKED_AT_LOCAL_GATE',
]);
const TERMINAL_STATE_SET = new Set(TERMINAL_STATES);

function asTimestamp(value, field, errors) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || Number.isNaN(Date.parse(value))) {
    errors.push(`${field} must be an ISO-8601 timestamp`);
    return null;
  }
  return Date.parse(value);
}

function nonNegativeInteger(value, field, errors) {
  if (!Number.isInteger(value) || value < 0) errors.push(`${field} must be a non-negative integer`);
}

function validateTimingRecord(record) {
  const errors = [];
  if (!record || typeof record !== 'object' || Array.isArray(record)) return { valid: false, errors: ['record must be an object'] };
  if (record.schema_version !== SCHEMA_VERSION) errors.push(`schema_version must be ${SCHEMA_VERSION}`);
  if (typeof record.run_id !== 'string' || !record.run_id.trim()) errors.push('run_id must be a non-empty string');
  if (typeof record.stage !== 'string' || !record.stage.trim()) errors.push('stage must be a non-empty string');

  const startedAt = asTimestamp(record.started_at, 'started_at', errors);
  const isRunStart = record.event === 'run_start' || record.stage === 'run_start';
  if (isRunStart) {
    if (record.stage !== 'run_start') errors.push('run_start event must use stage run_start');
    if (record.duration_ms !== 0) errors.push('run_start duration_ms must be 0');
    if (record.ended_at !== undefined) {
      const endedAt = asTimestamp(record.ended_at, 'ended_at', errors);
      if (startedAt !== null && endedAt !== null && endedAt !== startedAt) errors.push('run_start ended_at must equal started_at');
    }
    return { valid: errors.length === 0, errors };
  }

  const endedAt = asTimestamp(record.ended_at, 'ended_at', errors);
  if (record.parent_stage !== null && (typeof record.parent_stage !== 'string' || !record.parent_stage.trim())) errors.push('parent_stage must be a non-empty string or null');
  if (!TIMER_MODES.has(record.timer_mode)) errors.push(`timer_mode must be one of: ${[...TIMER_MODES].join(', ')}`);
  if (!WORK_TYPES.has(record.work_type)) errors.push(`work_type must be one of: ${[...WORK_TYPES].join(', ')}`);
  nonNegativeInteger(record.duration_ms, 'duration_ms', errors);
  nonNegativeInteger(record.budget_ms, 'budget_ms', errors);
  if (!BUDGET_STATUSES.has(record.budget_status)) errors.push(`budget_status must be one of: ${[...BUDGET_STATUSES].join(', ')}`);
  nonNegativeInteger(record.retry_count, 'retry_count', errors);
  nonNegativeInteger(record.rework_count, 'rework_count', errors);
  if (typeof record.result !== 'string' || !record.result.trim()) errors.push('result must be a non-empty string');
  if (record.work_type === 'repair' && record.rework_count < 1) errors.push('repair work_type requires rework_count >= 1');
  if (startedAt !== null && endedAt !== null && endedAt < startedAt) errors.push('ended_at must not be earlier than started_at');
  if (startedAt !== null && endedAt !== null && Number.isInteger(record.duration_ms) && endedAt - startedAt !== record.duration_ms) {
    errors.push('duration_ms must equal ended_at minus started_at');
  }
  if (record.terminal_state !== undefined && !TERMINAL_STATE_SET.has(record.terminal_state)) errors.push(`terminal_state must be one of: ${TERMINAL_STATES.join(', ')}`);
  return { valid: errors.length === 0, errors };
}

function assertValidTimingRecord(record, context = '') {
  const check = validateTimingRecord(record);
  if (!check.valid) throw new Error(`${context}invalid timing record: ${check.errors.join('; ')}`);
  return record;
}

function parseTimingJsonl(text) {
  if (typeof text !== 'string' && !Buffer.isBuffer(text)) throw new TypeError('JSONL input must be a string or Buffer');
  const records = [];
  String(text).split(/\r?\n/).forEach((line, index) => {
    if (!line.trim()) return;
    let record;
    try {
      record = JSON.parse(line);
    } catch (error) {
      throw new Error(`line ${index + 1}: invalid JSON: ${error.message}`);
    }
    assertValidTimingRecord(record, `line ${index + 1}: `);
    records.push(record);
  });
  return records;
}

function intervalFor(record) {
  if (record.stage === 'run_start' || record.event === 'run_start') return null;
  return { start: Date.parse(record.started_at), end: Date.parse(record.ended_at) };
}

function unionDiagnostics(intervals, wallStart, wallEnd) {
  const sorted = intervals.slice().sort((a, b) => a.start - b.start || a.end - b.end);
  if (!sorted.length) return {
    overlap_ms: 0,
    leading_gap_ms: wallEnd - wallStart,
    internal_gap_ms: 0,
    trailing_gap_ms: 0,
    gap_ms: wallEnd - wallStart,
  };
  let unionEnd = sorted[0].end;
  let internalGap = 0;
  let unionMs = 0;
  let unionStart = sorted[0].start;
  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    if (current.start > unionEnd) {
      unionMs += unionEnd - unionStart;
      internalGap += current.start - unionEnd;
      unionStart = current.start;
      unionEnd = current.end;
    } else if (current.end > unionEnd) {
      unionEnd = current.end;
    }
  }
  unionMs += unionEnd - unionStart;
  const recordedMs = intervals.reduce((total, interval) => total + interval.end - interval.start, 0);
  const leadingGap = Math.max(0, sorted[0].start - wallStart);
  const trailingGap = Math.max(0, wallEnd - unionEnd);
  return {
    overlap_ms: Math.max(0, recordedMs - unionMs),
    leading_gap_ms: leadingGap,
    internal_gap_ms: internalGap,
    trailing_gap_ms: trailingGap,
    gap_ms: leadingGap + internalGap + trailingGap,
  };
}

function normalisedSignal(record) {
  return [record.terminal_state, record.result].filter(Boolean).map((value) => String(value).trim().toUpperCase());
}

function suggestedTerminalState(records) {
  for (const record of records.slice().reverse()) {
    const explicit = normalisedSignal(record).find((value) => TERMINAL_STATE_SET.has(value));
    if (explicit) return explicit;
  }
  if (records.some((record) => normalisedSignal(record).some((value) => value === 'PUSH_FAILED') || (record.stage === 'release' && /PUSH.*FAIL|FAIL.*PUSH/.test(normalisedSignal(record).join(' '))))) return 'PUSH_FAILED';
  if (records.some((record) => /BLOCKED|FAILED|REJECTED/.test(normalisedSignal(record).join(' ')))) return 'BLOCKED_AT_LOCAL_GATE';
  if (records.some((record) => record.stage === 'public_verification' && normalisedSignal(record).includes('COMPLETED'))) return 'PUBLISHED_VERIFIED';
  if (records.some((record) => record.work_type === 'deployment_wait' || normalisedSignal(record).some((value) => value === 'PAGES_PENDING'))) return 'PAGES_PENDING';
  return 'BLOCKED_AT_LOCAL_GATE';
}

function summarizeTiming(records) {
  if (!Array.isArray(records)) throw new TypeError('records must be an array');
  records.forEach((record, index) => assertValidTimingRecord(record, `record ${index + 1}: `));
  const runIds = [...new Set(records.map((record) => record.run_id))];
  if (runIds.length > 1) throw new Error('summary requires records from exactly one run_id');
  const runStart = records.find((record) => record.stage === 'run_start' || record.event === 'run_start');
  const intervals = records.map(intervalFor).filter(Boolean);
  const wallStart = runStart ? Date.parse(runStart.started_at) : (intervals.length ? Math.min(...intervals.map((item) => item.start)) : null);
  const wallEnd = intervals.length ? Math.max(...intervals.map((item) => item.end)) : wallStart;
  const wallClock = wallStart === null || wallEnd === null ? 0 : Math.max(0, wallEnd - wallStart);
  const stageTotals = {};
  const workTypeTotals = { execution: 0, deployment_wait: 0, repair: 0 };
  const timerModeTotals = { serial: 0, parallel: 0 };
  let retryCount = 0;
  let reworkCount = 0;
  for (const record of records) {
    if (!intervalFor(record)) continue;
    stageTotals[record.stage] = (stageTotals[record.stage] || 0) + record.duration_ms;
    workTypeTotals[record.work_type] += record.duration_ms;
    timerModeTotals[record.timer_mode] += record.duration_ms;
    retryCount += record.retry_count;
    reworkCount += record.rework_count;
  }
  const diagnostics = wallStart === null || wallEnd === null
    ? { overlap_ms: 0, leading_gap_ms: 0, internal_gap_ms: 0, trailing_gap_ms: 0, gap_ms: 0 }
    : unionDiagnostics(intervals, wallStart, wallEnd);
  const exceeded = wallClock >= HARD_STOP_MS;
  return {
    schema_version: SCHEMA_VERSION,
    run_id: runIds[0] || null,
    record_count: records.length,
    wall_clock_ms: wallClock,
    recorded_ms: intervals.reduce((total, interval) => total + interval.end - interval.start, 0),
    stage_totals: stageTotals,
    stage_cumulative_ms: stageTotals,
    work_type_totals: workTypeTotals,
    execution_ms: workTypeTotals.execution,
    deployment_wait_ms: workTypeTotals.deployment_wait,
    wait_ms: workTypeTotals.deployment_wait,
    repair_ms: workTypeTotals.repair,
    timer_mode_totals: timerModeTotals,
    retry_count: retryCount,
    rework_count: reworkCount,
    ...diagnostics,
    hard_stop: {
      limit_ms: HARD_STOP_MS,
      exceeded,
      warning: exceeded ? '20-minute hard stop exceeded; terminate the run with the suggested terminal state.' : null,
      suggested_terminal_state: exceeded ? suggestedTerminalState(records) : null,
      allowed_terminal_states: [...TERMINAL_STATES],
    },
  };
}

function readTimingJsonl(file) {
  return parseTimingJsonl(fs.readFileSync(file, 'utf8'));
}

function appendTimingRecord(file, record) {
  assertValidTimingRecord(record);
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const separator = existing.length > 0 && !/[\r\n]$/.test(existing) ? '\n' : '';
  fs.appendFileSync(file, `${separator}${JSON.stringify(record)}\n`, 'utf8');
  return record;
}

module.exports = {
  HARD_STOP_MS,
  SCHEMA_VERSION,
  TERMINAL_STATES,
  appendTimingRecord,
  parseTimingJsonl,
  readTimingJsonl,
  summarizeTiming,
  validateTimingRecord,
};
