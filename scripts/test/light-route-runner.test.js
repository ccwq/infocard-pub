'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { runLightRoute } = require('../lib/light-route-runner');

test('runner executes ordered stages and stops at the twenty-minute hard stop', async () => {
  /**
   * Given：使用可控单调时钟的完整 light-route fixture，每阶段推进 2 分钟。
   * When：执行真实编排入口。
   * Then：阶段按顺序记录，达到 20 分钟后停止并写入允许的终态记录。
   * 防回归：hard-stop 不能只存在于事后 summary，超时后不得继续跑阶段。
   */
  let time = 0;
  const clock = { now: () => time };
  const called = [];
  const stages = Array.from({ length: 12 }, (_, index) => ({ stage: `stage_${index}`, budgetMs: 120000, run: async () => { called.push(index); time += 120000; return { result: 'completed' }; } }));
  const result = await runLightRoute({ runId: 'fixture', monotonicClock: clock, wallClock: clock, stages });
  assert.equal(result.terminalState, 'BLOCKED_AT_LOCAL_GATE');
  assert.equal(called.length, 10);
  assert.equal(result.records.at(-1).terminal_state, 'BLOCKED_AT_LOCAL_GATE');
});

test('runner preserves a stage terminal state and does not overwrite it', async () => {
  /**
   * Given：release 阶段明确返回 PUSH_FAILED。
   * When：执行 light-route runner。
   * Then：立即停止后续阶段并保留 PUSH_FAILED 终态。
   * 防回归：通用 hard-stop 不能覆盖更具体的发布失败证据。
   */
  let time = 0;
  const result = await runLightRoute({ runId: 'failed', monotonicClock: { now: () => time }, wallClock: { now: () => time }, stages: [
    { stage: 'release', budgetMs: 90000, run: async () => { time += 1000; return { result: 'push_failed', terminalState: 'PUSH_FAILED' }; } },
    { stage: 'public_verification', budgetMs: 150000, run: async () => { throw new Error('must not run'); } },
  ] });
  assert.equal(result.terminalState, 'PUSH_FAILED');
  assert.equal(result.records.at(-1).terminal_state, 'PUSH_FAILED');
});
