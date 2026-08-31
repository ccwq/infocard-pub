'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const { buildRunPlan, evaluateQuality, loadArchitecture, validateArchitecture, runStages } = require('../lib/infocard-layered-architecture');
const ROOT = path.resolve(__dirname, '../..');
const issue = (level, category = 'layout') => ({ level, check: category, category, evidence: 'current screenshot evidence', impact: 'visible', repairer: 'infocard-author', recheck: 'infocard-publish' });

test('Router、Author、Publish 是唯一可执行架构入口', () => {
  /**
   * Given：减法后的 skills-cop 架构登记册。
   * When：加载并验证架构及本地 Skill 注册。
   * Then：仅暴露 Router、Author、Publish 三个执行入口。
   * 防回归：契约、来源、主题或质量层不得重新成为并行入口。
   */
  const architecture = loadArchitecture(ROOT);
  assert.deepEqual(architecture.skills.map((item) => item.name), ['infocard-router', 'infocard-author', 'infocard-publish']);
  assert.deepEqual(validateArchitecture(ROOT, architecture).errors, []);
});

test('新请求经 Router 到 Author 与 Publish，发布请求只走 Publish', () => {
  /**
   * Given：创建和发布两类路由请求。
   * When：生成最小运行计划。
   * Then：创建为三段链，发布不重新展开已合并的中间入口。
   * 防回归：不得恢复七层或九层架构链。
   */
  assert.deepEqual(buildRunPlan({ mode: 'create' }).stages, ['infocard-router', 'infocard-author', 'infocard-publish']);
  assert.deepEqual(buildRunPlan({ mode: 'publish', quality: { status: 'passed' }, deliveryMode: 'delegated' }).stages, ['infocard-publish']);
});

test('视觉审查最多两次，Critical 始终阻断', () => {
  /**
   * Given：含 Critical 的当前视觉审查结果，且已完成两次审查。
   * When：质量处置计算下一步。
   * Then：仍返回 blocked 与人工审核，不能发布。
   * 防回归：两次上限不得把 Critical 降级放行。
   */
  const first = evaluateQuality({ issues: [issue('Critical')], repairRound: 0 });
  assert.equal(first.status, 'blocked');
  assert.equal(first.review_attempt, 1);
  const final = evaluateQuality({ issues: [issue('Critical')], repairRound: 2 });
  assert.equal(final.status, 'blocked');
  assert.equal(final.next, 'human-review');
});

test('Major 或 Minor 两次后放行并标记需要人工审核', () => {
  /**
   * Given：Major 或 Minor 问题在审查中出现。
   * When：Publish 消费最终审查结果。
   * Then：Major 或 Minor 两次后允许继续并输出 needs_human_review。
   * 防回归：非 Critical 问题不得形成无限修复循环或伪装为无告警通过。
   */
  const major = evaluateQuality({ issues: [issue('Major')], repairRound: 2 });
  assert.equal(major.status, 'accepted_with_human_review');
  assert.equal(major.needs_human_review, true);
  const minor = evaluateQuality({ issues: [issue('Minor')], repairRound: 2 });
  assert.equal(minor.status, 'accepted_with_human_review');
  assert.equal(minor.needs_human_review, true);
  const plan = buildRunPlan({ mode: 'publish', deliveryMode: 'direct', publishAuthorized: true, quality: { status: 'accepted_with_human_review', issues: [issue('Major')] }, repairRound: 2 });
  assert.equal(plan.quality.needs_human_review, true);
  assert.equal(plan.delivery.result_protocol_header, '需要人工审核');
});

test('兼容映射只能指向三个现行入口', () => {
  /**
   * Given：历史入口兼容登记册。
   * When：校验每个 replacement 目标。
   * Then：所有目标均可解析到 Router、Author 或 Publish。
   * 防回归：删除旧入口后不得留下失效迁移链接。
   */
  const architecture = loadArchitecture(ROOT);
  const current = new Set(architecture.skills.map((item) => item.name));
  for (const pre of architecture.compatibility_contract.pre) assert.equal(current.has(pre), true, `pre:${pre}`);
  for (const route of architecture.compatibility) {
    for (const target of route.replacement.split(' + ')) assert.equal(current.has(target.split('#')[0]), true, route.legacy);
  }
});

test('阶段结果和发布前置条件 fail closed', () => {
  /**
   * Given：Publish 试图在缺少视觉证据或 accepted artifact 时完成。
   * When：执行合并后的阶段运行器。
   * Then：发布被阻断；completed 阶段缺结构化字段也被阻断。
   * 防回归：减法不能留下绕过质量门禁的伪成功路径。
   */
  const malformed = runStages({ mode: 'create' }, {
    'infocard-router': () => ({ status: 'completed' }),
  });
  assert.equal(malformed.status, 'blocked');
  const blocked = runStages({ mode: 'publish', quality: { issues: [] }, artifacts: {}, visualReviewCompleted: false }, {
    'infocard-publish': () => ({ status: 'completed', summary: 'x', artifacts: { acceptedArtifact: true }, issues: [], next: null }),
  });
  assert.equal(blocked.status, 'blocked');
  const stale = buildRunPlan({ mode: 'publish', quality: { status: 'pending', issues: [] }, deliveryMode: 'direct', publishAuthorized: true });
  assert.equal(stale.delivery.status, 'blocked');
});

test('缺失处理器会在合并后的入口链上 fail closed', () => {
  /**
   * Given：Router 计划没有对应 handler。
   * When：执行运行器。
   * Then：立即 blocked，而不是跳过到 Author 或 Publish。
   * 防回归：减法不能削弱失败关闭行为。
   */
  const result = runStages({ mode: 'create' }, {});
  assert.equal(result.status, 'blocked');
  assert.equal(result.stopped_at, 'infocard-router');
});
