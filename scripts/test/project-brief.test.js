'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { normalizeProjectBrief, validateProjectBrief } = require('../lib/project-brief');

test('project brief validates the fixed light-route content slots', () => {
  /**
   * Given：project-brief 填满固定内容槽位并声明 canonical source。
   * When：执行 brief 校验。
   * Then：校验通过且包含风险边界。
   * 防回归：避免作者在契约未冻结时自由扩展内容结构。
   */
  const result = validateProjectBrief(normalizeProjectBrief({
    route: 'light', title: 'Demo', summary: 'Summary', core_capabilities: ['A'], tech_stack: ['JS'],
    usage: ['run'], use_cases: ['docs'], sources: ['https://example.com'],
    source_boundary: { canonical: 'https://example.com', discovery: null },
  }));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test('missing brief contract fails closed', () => {
  /**
   * Given：project-brief 缺少 summary 和 canonical source。
   * When：执行 brief 校验。
   * Then：返回失败并指出缺失字段。
   * 防回归：禁止在 preflight 前开始 HTML 创作。
   */
  const result = validateProjectBrief({ route: 'light', hero: 'Demo' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.field === 'summary'));
  assert.ok(result.errors.some((item) => item.field === 'source_boundary.canonical'));
});

test('blank canonical source fails validation', () => {
  /**
   * Given：brief 声明了 source_boundary，但 canonical 为空白字符串。
   * When：执行 brief 校验。
   * Then：校验失败。
   * 防回归：空来源不能伪装成已确认的完整事实输入。
   */
  const result = validateProjectBrief({ route: 'light', hero: 'Demo', summary: 'Summary', core_capabilities: ['A'], tech_stack: ['JS'], usage: ['run'], use_cases: ['docs'], risk_boundary: 'bounded', sources: [''], source_boundary: { canonical: '  ' } });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.field === 'source_boundary.canonical'));
});
