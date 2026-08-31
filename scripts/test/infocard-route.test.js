'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { classifyRoute } = require('../lib/infocard-route');

test('single low-risk source uses light route', () => {
  /**
   * Given：请求只有一个完整来源且没有敏感或重型信号。
   * When：执行路线分类。
   * Then：进入 light route 并标记 canonical source。
   * 防回归：普通单卡不应被默认升级为重型流程。
   */
  const result = classifyRoute({ sourceUrl: 'https://example.com/project', topic: '工具介绍' });
  assert.equal(result.route, 'light');
  assert.equal(result.source_boundary.canonical, 'https://example.com/project');
});

test('multiple sources and source audit use full route', () => {
  /**
   * Given：请求含多来源且要求源码审计。
   * When：执行路线分类。
   * Then：进入 full route 并保留升级原因。
   * 防回归：不能用 20 分钟 SLA 掩盖事实裁决或审计成本。
   */
  const result = classifyRoute({ sources: ['https://a.example', 'https://b.example'], sourceCodeAudit: true });
  assert.equal(result.route, 'full');
  assert.match(result.reason, /多个来源/);
  assert.match(result.reason, /源码级审计/);
});

test('a declared complete user brief can use light route without a URL', () => {
  /**
   * Given：用户提供完整 brief，并明确它足以作为单一事实输入。
   * When：执行路线分类。
   * Then：把 user-brief 视为单一 canonical input 并进入 light route。
   * 防回归：light route 不应被错误限制为仅 URL 输入。
   */
  const result = classifyRoute({ completeBrief: true, brief: '完整项目摘要、能力、用法、风险与来源说明。' });
  assert.equal(result.route, 'light');
  assert.equal(result.source_boundary.canonical, 'user-brief');
});

test('X status remains discovery until canonical source is confirmed', () => {
  /**
   * Given：请求只提供一个 X status URL，没有上游 canonical source。
   * When：执行路线分类。
   * Then：升级 full route，X 只记录为 discovery，claim 不得 confirmed。
   * 防回归：不能把社交帖直接当作项目事实源。
   */
  const result = classifyRoute({ sourceUrl: 'https://x.com/user/status/2094218611112263944' });
  assert.equal(result.route, 'full');
  assert.equal(result.source_boundary.canonical, null);
  assert.equal(result.source_boundary.discovery, 'https://x.com/user/status/2094218611112263944');
  assert.notEqual(result.claim_status, 'confirmed');
});

test('explicit X canonical URL cannot override discovery boundary', () => {
  /**
   * Given：调用方同时传入 X status 作为 canonicalUrl。
   * When：执行路线分类。
   * Then：仍升级 full route，不把 X status 当事实源。
   * 防回归：显式字段不能绕过社交来源边界。
   */
  const result = classifyRoute({ canonicalUrl: 'https://x.com/user/status/2094218611112263944' });
  assert.equal(result.route, 'full');
  assert.equal(result.source_boundary.canonical, null);
});
