'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const {
  buildRunPlan,
  evaluateQuality,
  loadArchitecture,
  resolveLegacyRoute,
  validateArchitecture,
  runStages,
} = require('../lib/infocard-layered-architecture');

const ROOT = path.resolve(__dirname, '../..');

test('orchestrator keeps an unapproved creation request in preview delivery', () => {
  /**
   * Given：用户提供普通文本和指定主题，但没有授权公开发布。
   * When：通过统一编排入口生成运行计划。
   * Then：计划依次包含内容、创作、主题和质量阶段，交付模式保持 preview。
   * 防回归：创建请求不能因默认路由越权触发公开发布。
   */
  const plan = buildRunPlan({ mode: 'create', theme: 'infocard-bigwhite-style' });
  assert.deepEqual(plan.stages, [
    'infocard-source-and-content',
    'infocard-card-authoring',
    'infocard-theme-contract',
    'infocard-quality-gate',
    'infocard-publish-pipeline',
  ]);
  assert.equal(plan.delivery.mode, 'preview');
  assert.equal(plan.theme.id, 'infocard-bigwhite-style');
});

test('quality blockers select one repairer and force a bounded recheck loop', () => {
  /**
   * Given：质量报告包含移动端表格溢出这一项 blocker。
   * When：质量门禁计算处置和下一步。
   * Then：仅路由到一个移动端修复器，并要求回到统一质量门禁复测。
   * 防回归：同一问题不能多头修复或绕过复测直接发布。
   */
  const result = evaluateQuality({
    repairRound: 0,
    issues: [{ level: 'Blocker', check: 'mobile table', category: 'mobile-overflow', evidence: '390px table scrollWidth=612', impact: 'overflow', repairer: 'infocard-mobile-verifier', recheck: 'infocard-quality-gate' }],
  });
  assert.equal(result.status, 'blocked');
  assert.equal(result.next, 'infocard-mobile-verifier');
  assert.equal(result.recheck, 'infocard-quality-gate');
  assert.equal(result.repairRound, 1);

  const exhausted = evaluateQuality({
    repairRound: 2,
    issues: [{ level: 'Blocker', check: 'mobile table', category: 'mobile-overflow', evidence: 'still overflowing', impact: 'overflow', repairer: 'infocard-mobile-verifier', recheck: 'infocard-quality-gate' }],
  });
  assert.equal(exhausted.status, 'blocked');
  assert.equal(exhausted.next, 'human-review');
});

test('publish modes consume an accepted quality result and keep delegated delivery non-publishing', () => {
  /**
   * Given：质量门禁已经产生唯一的 passed 结果。
   * When：请求 direct 或 delegated 两种交付模式。
   * Then：direct 允许构建和公开烟雾验证，delegated 只生成标准交接包。
   * 防回归：发布阶段不得重做完整视觉验收，也不得让委派模式越权发布。
   */
  const direct = buildRunPlan({ mode: 'publish', publishAuthorized: true, deliveryMode: 'direct', quality: { status: 'passed' } });
  assert.deepEqual(direct.delivery.actions, ['build', 'index', 'resource-smoke', 'public-url-smoke']);

  const delegated = buildRunPlan({ mode: 'publish', deliveryMode: 'delegated', quality: { status: 'passed' } });
  assert.deepEqual(delegated.delivery.actions, ['handoff-package']);
  assert.equal(delegated.delivery.publishes, false);
  assert.equal(delegated.task.output, 'preview');
  const unauthorized = buildRunPlan({ mode: 'publish', deliveryMode: 'direct', quality: { status: 'passed' } });
  assert.equal(unauthorized.delivery.status, 'blocked');
  assert.deepEqual(unauthorized.delivery.actions, []);
});

test('quality schema distinguishes blocker, major and advisory and counts repairs per category', () => {
  /**
   * Given：质量问题分别属于桌面布局和移动溢出类别，并包含完整证据字段。
   * When：连续执行质量门禁。
   * Then：每个类别独立计数两轮，Blocker 始终阻断，缺字段会被拒绝。
   * 防回归：不同缺陷类别不能共享错误的全局修复次数，质量报告不能退化为自由文本。
   */
  const issue = (category, level = 'Major') => ({ level, check: 'layout', category, evidence: 'fixture evidence', impact: 'user-visible', repairer: 'debug-layout', recheck: 'infocard-quality-gate' });
  let result = evaluateQuality({ issues: [issue('desktop-overlap'), issue('mobile-overflow', 'Advisory')], repairRounds: {} });
  assert.equal(result.repairRounds['desktop-overlap'], 1);
  result = evaluateQuality({ issues: [issue('desktop-overlap')], repairRounds: result.repairRounds });
  assert.equal(result.repairRounds['desktop-overlap'], 2);
  result = evaluateQuality({ issues: [issue('desktop-overlap')], repairRounds: result.repairRounds });
  assert.equal(result.next, 'human-review');
  assert.throws(() => evaluateQuality({ issues: [{ level: 'Blocker' }] }), /quality issue missing/);
});

test('stage runner passes artifacts forward and stops before delivery on failure', () => {
  /**
   * Given：各阶段 handler 通过结构化 artifacts 传递结果，质量阶段返回 blocked。
   * When：运行实际 stage runner seam。
   * Then：后续阶段不会执行，状态保留停止阶段和已传递产物。
   * 防回归：不能只返回字符串 stage 列表，也不能在质量失败后执行发布副作用。
   */
  const calls = [];
  const result = runStages({ mode: 'create' }, {
    'infocard-source-and-content': () => { calls.push('source'); return { status: 'completed', artifacts: { contentPack: { claims: 1 } }, summary: 'ok', issues: [], next: 'infocard-card-authoring' }; },
    'infocard-card-authoring': (state) => { calls.push(`author:${state.artifacts.contentPack.claims}`); return { status: 'completed', artifacts: { draft: 'card.html' }, summary: 'ok', issues: [], next: 'infocard-theme-contract' }; },
    'infocard-theme-contract': () => { calls.push('theme'); return { status: 'completed', artifacts: { theme: 'bigwhite' }, summary: 'ok', issues: [], next: 'infocard-quality-gate' }; },
    'infocard-quality-gate': () => { calls.push('quality'); return { status: 'blocked', artifacts: {}, summary: 'blocked', issues: [{ level: 'Blocker' }], next: 'debug-layout' }; },
    'infocard-publish-pipeline': () => { calls.push('publish'); return { status: 'completed', artifacts: {}, summary: 'should not run', issues: [], next: null }; },
  });
  assert.equal(result.status, 'blocked');
  assert.equal(result.stopped_at, 'infocard-quality-gate');
  assert.deepEqual(calls, ['source', 'author:1', 'theme', 'quality']);
  assert.equal(result.artifacts.draft, 'card.html');
});

test('registered legacy skills, theme adapters and active references satisfy the versioned contract', () => {
  /**
   * Given：58 个迁移期旧入口、新核心层和主题 Skill 共存。
   * When：加载并校验版本化架构登记册。
   * Then：每个本地 SKILL.md 有唯一契约记录，旧入口有替代入口，主题有适配器。
   * 防回归：避免新增架构只覆盖少数入口，或让历史事故 reference 重新成为默认规范。
   */
  const architecture = loadArchitecture(ROOT);
  const report = validateArchitecture(ROOT, architecture);
  assert.deepEqual(report.errors, []);
  assert.ok(report.legacyCount >= 58);
  assert.ok(report.themeCount >= 17);
  assert.ok(report.referenceCount > 700);
});

test('five task modes choose minimal stages and preserve explicit theme identity', () => {
  /**
   * Given：统一入口收到 create、update、rebuild、repair、publish 五种任务，并显式指定主题。
   * When：为每种任务生成运行计划。
   * Then：每种模式只加载必要阶段，且不会替换用户指定主题。
   * 防回归：编排器不能把所有请求都展开成同一条全量链，也不能静默换主题。
   */
  const common = { theme: 'infocard-q-style', quality: { status: 'passed' } };
  assert.deepEqual(buildRunPlan({ ...common, mode: 'create' }).stages, [
    'infocard-source-and-content', 'infocard-card-authoring', 'infocard-theme-contract', 'infocard-quality-gate', 'infocard-publish-pipeline',
  ]);
  assert.deepEqual(buildRunPlan({ ...common, mode: 'update' }).stages, [
    'infocard-source-and-content', 'infocard-card-authoring', 'infocard-theme-contract', 'infocard-quality-gate', 'infocard-publish-pipeline',
  ]);
  assert.deepEqual(buildRunPlan({ ...common, mode: 'rebuild' }).stages, [
    'infocard-source-and-content', 'infocard-card-authoring', 'infocard-theme-contract', 'infocard-quality-gate', 'infocard-publish-pipeline',
  ]);
  assert.deepEqual(buildRunPlan({ ...common, mode: 'repair' }).stages, [
    'infocard-card-authoring', 'infocard-theme-contract', 'infocard-quality-gate', 'infocard-publish-pipeline',
  ]);
  assert.deepEqual(buildRunPlan({ ...common, mode: 'publish', deliveryMode: 'delegated' }).stages, [
    'infocard-quality-gate', 'infocard-publish-pipeline',
  ]);
  assert.equal(buildRunPlan({ ...common, mode: 'repair' }).theme.id, 'infocard-q-style');
});

test('source risk enables evidence plugins without changing the explicit theme', () => {
  /**
   * Given：来源涉及社媒传闻和争议事实，同时用户明确指定 Hardblue 主题。
   * When：编排器评估来源风险。
   * Then：启用来源边界与溯源插件，并保留用户指定主题。
   * 防回归：高风险来源不能绕过证据治理，主题风险也不能成为静默替换主题的理由。
   */
  const plan = buildRunPlan({
    mode: 'create',
    theme: 'infocard-hardblue-style',
    sourceRisk: ['social-rumor', 'public-dispute'],
  });
  assert.deepEqual(plan.source.required_plugins, ['social-source-boundary', 'infocard-metadata-provenance']);
  assert.equal(plan.theme.id, 'infocard-hardblue-style');
});

test('quality disposition blocks blockers and limits major exceptions to warned preview', () => {
  /**
   * Given：质量报告分别含 Blocker、Major 和 Advisory。
   * When：请求 preview、direct 或 delegated 交付。
   * Then：Blocker 阻断所有交付；Major 只在显式 warning 下允许 preview；Advisory 不阻断。
   * 防回归：正式发布不能绕过 Major，预览例外也必须留下结构化警告。
   */
  const issue = (level) => ({ level, check: 'layout', category: 'layout-overlap', evidence: 'fixture', impact: 'visible', repairer: 'debug-layout', recheck: 'infocard-quality-gate' });
  const blocker = buildRunPlan({ mode: 'create', quality: { status: 'blocked', issues: [issue('Blocker')] } });
  assert.equal(blocker.delivery.status, 'blocked');
  assert.deepEqual(blocker.delivery.actions, []);

  const majorBlocked = buildRunPlan({ mode: 'create', quality: { status: 'blocked', issues: [issue('Major')] } });
  assert.equal(majorBlocked.delivery.status, 'blocked');

  const majorPreview = buildRunPlan({
    mode: 'create',
    quality: { status: 'blocked', issues: [issue('Major')] },
    previewWarningAuthorized: true,
  });
  assert.equal(majorPreview.delivery.status, 'warning');
  assert.deepEqual(majorPreview.delivery.actions, ['preview-artifact']);
  assert.equal(majorPreview.delivery.warnings[0].level, 'Major');

  const majorDirect = buildRunPlan({
    mode: 'create',
    deliveryMode: 'direct',
    publishAuthorized: true,
    quality: { status: 'blocked', issues: [issue('Major')] },
    previewWarningAuthorized: true,
  });
  assert.equal(majorDirect.delivery.status, 'blocked');

  const advisory = buildRunPlan({ mode: 'create', quality: { status: 'passed', issues: [issue('Advisory')] } });
  assert.equal(advisory.delivery.status, 'ready');
});

test('legacy routes expose deterministic replacements and deprecated entries declare migration', () => {
  /**
   * Given：调用迁移期旧入口 infocard-direct-publish。
   * When：兼容层解析旧 Skill。
   * Then：返回确定性 replacement、deprecated 状态和统一 adapter contract。
   * 防回归：旧入口不能静默改变语义，也不能只靠模糊文档猜测新入口。
   */
  const architecture = loadArchitecture(ROOT);
  const route = resolveLegacyRoute(architecture, 'infocard-direct-publish');
  assert.equal(route.replacement, 'infocard-publish-pipeline#direct');
  assert.equal(route.status, 'deprecated');
  assert.equal(route.contract, 'legacy-adapter@1');
});

test('stage runner reports delivery failure without converting partial success to completion', () => {
  /**
   * Given：前序阶段完成，但 publish pipeline 返回 failed。
   * When：统一 runner 执行 direct 发布计划。
   * Then：整体状态为 failed，并精确保留停止阶段和既有 artifacts。
   * 防回归：构建或发布部分成功不得被汇报为整体成功。
   */
  const result = runStages({ mode: 'publish', deliveryMode: 'direct', publishAuthorized: true, quality: { status: 'passed' } }, {
    'infocard-quality-gate': () => ({ status: 'completed', summary: 'passed', artifacts: { qualityReport: 'passed.json' }, issues: [], next: 'infocard-publish-pipeline' }),
    'infocard-publish-pipeline': () => ({ status: 'failed', summary: 'public smoke failed', artifacts: { build: 'dist' }, issues: [{ code: 'PUBLIC_SMOKE_FAILED' }], next: null }),
  });
  assert.equal(result.status, 'failed');
  assert.equal(result.stopped_at, 'infocard-publish-pipeline');
  assert.equal(result.artifacts.qualityReport, 'passed.json');
});

test('stage runner fails closed when a stage handler is unavailable', () => {
  /**
   * Given：运行计划没有提供某个阶段的 handler。
   * When：统一 runner 尝试执行该阶段。
   * Then：返回 blocked 和结构化不可用问题，而不是伪装为 completed。
   * 防回归：缺失实现不能绕过质量门禁或发布授权。
   */
  const result = runStages({ mode: 'create' }, {});
  assert.equal(result.status, 'blocked');
  assert.equal(result.stages[0].issues[0].code, 'STAGE_HANDLER_UNAVAILABLE');
});
