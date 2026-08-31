'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const {
  HARD_STOP_MS,
  parseTimingJsonl,
  summarizeTiming,
  validateTimingRecord,
} = require('../lib/infocard-run-timing');

const CLI = path.resolve(__dirname, '../infocard-run-timing.js');

function record(overrides = {}) {
  return {
    schema_version: 2,
    run_id: 'run-1',
    stage: 'research',
    parent_stage: null,
    timer_mode: 'serial',
    work_type: 'execution',
    started_at: '2026-08-31T00:00:00.000Z',
    ended_at: '2026-08-31T00:01:00.000Z',
    duration_ms: 60000,
    budget_ms: 150000,
    budget_status: 'within',
    retry_count: 0,
    rework_count: 0,
    result: 'completed',
    ...overrides,
  };
}

function jsonl(records) {
  return records.map((item) => JSON.stringify(item)).join('\n');
}

test('parses schema v2 and rejects timestamp duration drift', () => {
  /**
   * Given：JSONL 含 run_start 事件和一个 schema v2 阶段记录。
   * When：通过公开解析接口读取，并将阶段 duration 改为不匹配时间戳。
   * Then：合法记录可解析，漂移记录被 fail closed 拒绝。
   * 防回归：避免日志中的阶段耗时与时间戳互相矛盾，破坏后续诊断。
   */
  const start = {
    schema_version: 2,
    run_id: 'run-1',
    event: 'run_start',
    stage: 'run_start',
    started_at: '2026-08-31T00:00:00.000Z',
    duration_ms: 0,
  };
  const parsed = parseTimingJsonl(jsonl([start, record()]));
  assert.equal(parsed.length, 2);
  assert.deepEqual(validateTimingRecord(start), { valid: true, errors: [] });

  const invalid = record({ duration_ms: 59000 });
  assert.throws(() => parseTimingJsonl(jsonl([start, invalid])), /duration_ms/);
});

test('requires parent stage and a canonical budget status', () => {
  /**
   * Given：阶段记录缺失 parent_stage 或使用未知 budget_status。
   * When：执行 schema v2 校验。
   * Then：两种记录都被拒绝。
   * 防回归：诊断日志必须保持可聚合的阶段层级与预算语义。
   */
  const missingParent = record();
  delete missingParent.parent_stage;
  assert.equal(validateTimingRecord(missingParent).valid, false);
  assert.equal(validateTimingRecord(record({ budget_status: 'maybe' })).valid, false);
});

test('summarizes serial and parallel work, waits, retries, and rework', () => {
  /**
   * Given：一个 run 含串行 research、并行 visual capture，以及 Pages 等待和 repair。
   * When：按公开 summary 接口计算耗时。
   * Then：阶段累计、执行/等待/修复、retry/rework 与墙钟均可独立读取。
   * 防回归：避免把 deployment_wait 或 repair 混入普通创作执行时间。
   */
  const start = {
    schema_version: 2,
    run_id: 'run-1',
    event: 'run_start',
    stage: 'run_start',
    started_at: '2026-08-31T00:00:00.000Z',
    duration_ms: 0,
  };
  const records = [
    start,
    record({ stage: 'research', ended_at: '2026-08-31T00:01:00.000Z' }),
    record({
      stage: 'visual_capture',
      timer_mode: 'parallel',
      started_at: '2026-08-31T00:01:10.000Z',
      ended_at: '2026-08-31T00:03:10.000Z',
      duration_ms: 120000,
      budget_ms: 210000,
      retry_count: 1,
    }),
    record({
      stage: 'visual_review',
      timer_mode: 'parallel',
      started_at: '2026-08-31T00:02:10.000Z',
      ended_at: '2026-08-31T00:03:10.000Z',
      duration_ms: 60000,
      budget_ms: 210000,
    }),
    record({
      stage: 'public_verification',
      work_type: 'deployment_wait',
      started_at: '2026-08-31T00:03:30.000Z',
      ended_at: '2026-08-31T00:04:00.000Z',
      duration_ms: 30000,
      budget_ms: 150000,
    }),
    record({
      stage: 'repair',
      work_type: 'repair',
      started_at: '2026-08-31T00:04:10.000Z',
      ended_at: '2026-08-31T00:04:40.000Z',
      duration_ms: 30000,
      budget_ms: 60000,
      rework_count: 1,
    }),
  ];

  const summary = summarizeTiming(parseTimingJsonl(jsonl(records)));
  assert.equal(summary.wall_clock_ms, 280000);
  assert.equal(summary.recorded_ms, 300000);
  assert.equal(summary.stage_totals.visual_capture, 120000);
  assert.equal(summary.work_type_totals.deployment_wait, 30000);
  assert.equal(summary.work_type_totals.repair, 30000);
  assert.equal(summary.retry_count, 1);
  assert.equal(summary.rework_count, 1);
  assert.equal(summary.overlap_ms, 60000);
  assert.equal(summary.gap_ms, 40000);
});

test('reports hard-stop warning and only suggests an allowed terminal state', () => {
  /**
   * Given：阶段记录从 run_start 到最后阶段超过 20 分钟，并出现 push failure。
   * When：生成 timing summary。
   * Then：summary 标记 hard-stop，给出 PUSH_FAILED，且终态属于固定白名单。
   * 防回归：防止超时后继续无界修工具循环或输出未定义终态。
   */
  const start = {
    schema_version: 2,
    run_id: 'run-1',
    event: 'run_start',
    stage: 'run_start',
    started_at: '2026-08-31T00:00:00.000Z',
    duration_ms: 0,
  };
  const late = record({
    stage: 'release',
    started_at: '2026-08-31T00:19:00.000Z',
    ended_at: '2026-08-31T00:21:00.000Z',
    duration_ms: 120000,
    result: 'push_failed',
  });
  const summary = summarizeTiming(parseTimingJsonl(jsonl([start, late])));
  assert.equal(summary.wall_clock_ms, 1260000);
  assert.equal(summary.hard_stop.exceeded, true);
  assert.equal(summary.hard_stop.limit_ms, HARD_STOP_MS);
  assert.equal(summary.hard_stop.suggested_terminal_state, 'PUSH_FAILED');
  assert.deepEqual(summary.hard_stop.allowed_terminal_states, [
    'PUBLISHED_VERIFIED',
    'PAGES_PENDING',
    'PUSH_FAILED',
    'BLOCKED_AT_LOCAL_GATE',
  ]);
});

test('hard stop triggers at exactly twenty minutes', () => {
  /**
   * Given：run_start 到阶段结束恰好为 20 分钟。
   * When：生成 timing summary。
   * Then：hard-stop 立即标记 exceeded。
   * 防回归：边界比较不能允许临界点继续执行下一阶段。
   */
  const start = { schema_version: 2, run_id: 'run-limit', event: 'run_start', stage: 'run_start', started_at: '2026-08-31T00:00:00.000Z', duration_ms: 0 };
  const last = record({ run_id: 'run-limit', stage: 'release', started_at: '2026-08-31T00:19:00.000Z', ended_at: '2026-08-31T00:20:00.000Z', result: 'push_failed' });
  assert.equal(summarizeTiming([start, last]).hard_stop.exceeded, true);
});

test('suggests published verified after a completed public verification at hard stop', () => {
  /**
   * Given：运行跨过 20 分钟，但 public_verification 已明确完成。
   * When：生成 timing summary。
   * Then：建议终态为 PUBLISHED_VERIFIED，而不是把成功交付误判为本地阻塞。
   * 防回归：避免 hard-stop 收尾覆盖已完成的公网核验事实。
   */
  const start = {
    schema_version: 2,
    run_id: 'run-verified',
    event: 'run_start',
    stage: 'run_start',
    started_at: '2026-08-31T00:00:00.000Z',
    duration_ms: 0,
  };
  const verified = record({
    run_id: 'run-verified',
    stage: 'public_verification',
    started_at: '2026-08-31T00:19:00.000Z',
    ended_at: '2026-08-31T00:21:00.000Z',
    duration_ms: 120000,
    result: 'completed',
  });
  const summary = summarizeTiming(parseTimingJsonl(jsonl([start, verified])));
  assert.equal(summary.hard_stop.suggested_terminal_state, 'PUBLISHED_VERIFIED');
});

test('detects gaps and overlaps without treating run_start as work', () => {
  /**
   * Given：run_start 后先有空档，再有两个重叠阶段，且末尾还有空档。
   * When：计算 interval diagnostics。
   * Then：leading/internal/trailing gap 与 overlap 均可观察，run_start 不进入累计。
   * 防回归：避免总控事件与阶段事件重叠计时，造成墙钟或执行时间虚增。
   */
  const start = {
    schema_version: 2,
    run_id: 'run-1',
    event: 'run_start',
    stage: 'run_start',
    started_at: '2026-08-31T00:00:00.000Z',
    duration_ms: 0,
  };
  const a = record({
    stage: 'authoring',
    started_at: '2026-08-31T00:01:00.000Z',
    ended_at: '2026-08-31T00:03:00.000Z',
    duration_ms: 120000,
  });
  const b = record({
    stage: 'visual_review',
    timer_mode: 'parallel',
    started_at: '2026-08-31T00:02:00.000Z',
    ended_at: '2026-08-31T00:04:00.000Z',
    duration_ms: 120000,
  });
  const summary = summarizeTiming(parseTimingJsonl(jsonl([start, a, b])));
  assert.equal(summary.leading_gap_ms, 60000);
  assert.equal(summary.internal_gap_ms, 0);
  assert.equal(summary.trailing_gap_ms, 0);
  assert.equal(summary.overlap_ms, 60000);
  assert.equal(summary.gap_ms, 60000);
  assert.equal(summary.stage_totals.run_start, undefined);
});

test('CLI reads an explicit JSONL file and emits JSON only', () => {
  /**
   * Given：临时目录中的 timing JSONL，不是仓库根 .stop.jsonl。
   * When：CLI 读取显式文件路径。
   * Then：stdout 是可解析 JSON summary，且输入文件内容未被修改。
   * 防回归：避免诊断工具隐式触碰生产日志或输出不可编排的人类文本。
   */
  const file = path.join(os.tmpdir(), `infocard-run-timing-${process.pid}.jsonl`);
  const content = jsonl([{
    schema_version: 2,
    run_id: 'run-cli',
    event: 'run_start',
    stage: 'run_start',
    started_at: '2026-08-31T00:00:00.000Z',
    duration_ms: 0,
  }, record({ run_id: 'run-cli' })]);
  fs.writeFileSync(file, `${content}\n`, 'utf8');
  const before = fs.readFileSync(file, 'utf8');
  const result = spawnSync(process.execPath, [CLI, file], { encoding: 'utf8' });
  const after = fs.readFileSync(file, 'utf8');
  fs.rmSync(file, { force: true });

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).wall_clock_ms, 60000);
  assert.equal(after, before);
});
