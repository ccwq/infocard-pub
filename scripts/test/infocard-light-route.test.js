'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { LIGHT_ROUTE_LIMIT_MS, LIGHT_ROUTE_STAGES, HARD_STOPS, TERMINAL_STATES, buildTargetedGateCommands, evaluateSla } = require('../lib/infocard-light-route');

test('light route budgets reserve thirty seconds below hard limit', () => {
  /**
   * Given：spec 声明 12 个阶段和 20 分钟硬上限。
   * When：汇总 light route 阶段预算。
   * Then：预算为 19 分 30 秒，并保留 30 秒缓冲。
   * 防回归：新增步骤不能静默挤占 SLA 缓冲。
   */
  const result = evaluateSla(Object.fromEntries(LIGHT_ROUTE_STAGES));
  assert.equal(result.valid, true);
  assert.equal(result.budget_total_ms, 1170000);
  assert.equal(result.buffer_ms, 30000);
  assert.equal(LIGHT_ROUTE_LIMIT_MS, 1200000);
});

test('targeted gates never request full taxonomy or full leak scans', () => {
  /**
   * Given：普通单卡已 promotion 到明确 HTML 和 sidecar。
   * When：生成 static gate 命令。
   * Then：taxonomy、leak 和 visual gate 都绑定当前卡片文件。
   * 防回归：历史全仓问题不能进入普通单卡 SLA。
   */
  const commands = buildTargetedGateCommands('docs/20260831-demo.html');
  const text = JSON.stringify(commands);
  assert.match(text, /verify-taxonomy\.js.*20260831-demo\.html\.meta\.yaml/);
  assert.match(text, /check-info-leak\.js.*20260831-demo\.html/);
  assert.doesNotMatch(text, /--all|fix-taxonomy/);
});

test('hard stops and terminal states are closed enumerations', () => {
  /**
   * Given：light route 可能在创作、视觉、静态门禁或发布阶段超时。
   * When：读取 hard-stop contract。
   * Then：20 分钟必须 terminate，终态只包含四种可诊断结果。
   * 防回归：超时后不能无限进入修工具或等待循环。
   */
  assert.equal(HARD_STOPS.at(-1).elapsed_ms, 1200000);
  assert.equal(HARD_STOPS.at(-1).action, 'terminate');
  assert.deepEqual(TERMINAL_STATES, ['PUBLISHED_VERIFIED', 'PAGES_PENDING', 'PUSH_FAILED', 'BLOCKED_AT_LOCAL_GATE']);
});

test('SLA rejects negative, unknown, and over-budget stages', () => {
  /**
   * Given：阶段输入包含未知阶段、负数耗时和超过阶段预算的耗时。
   * When：执行 SLA 汇总。
   * Then：结果无效并分别暴露这些问题。
   * 防回归：异常输入不能被静默忽略而伪装成 SLA 通过。
   */
  const result = evaluateSla({ research: 150001, mystery: 1, authoring: -1 });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.stage === 'research'));
  assert.ok(result.errors.some((item) => item.stage === 'mystery'));
  assert.ok(result.errors.some((item) => item.stage === 'authoring'));
});

test('SLA rejects incomplete stage input', () => {
  /**
   * Given：阶段耗时对象为空或只包含部分阶段。
   * When：执行 SLA 汇总。
   * Then：所有缺失阶段均被报告。
   * 防回归：不能用空输入伪造一次完整 light-route smoke。
   */
  const result = evaluateSla({});
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.stage === 'research'));
});
