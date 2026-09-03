'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { verifyPublicRelease, evaluatePublicVisualEvidence, buildChannelPayload } = require('../post-publish-verify');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'public-release-'));
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs/sample.html'), '<html data-theme="hardblue"><title>Sample Card</title><section id="section-01"></section></html>');
  fs.writeFileSync(path.join(root, 'docs/sample.html.meta.yaml'), 'slug: sample\npath: docs/sample.html\ntitle: Sample Card\n');
  return root;
}

test('HTTP 200 plus current fingerprint produces independent release success', async () => {
  /**
   * Given：公网详情页返回 200 且包含 slug、标题、主题和结构 token。
   * When：执行公网发布校验。
   * Then：release 状态为 PUBLISHED_VERIFIED，同时视觉状态仍单独记录。
   * 防回归：发布成功不能依赖后置截图任务完成。
   */
  const root = fixture();
  const result = await verifyPublicRelease({ rootDir: root, slug: 'sample', baseUrl: 'https://example.test', requestFn: async () => ({ status: 200, body: 'sample Sample Card data-theme="hardblue" section-01' }) });
  assert.equal(result.release.status, 'PUBLISHED_VERIFIED');
  assert.equal(result.public_visual.status, 'PUBLIC_VISUAL_PENDING');
});

test('HTTP 200 with stale fingerprint does not produce release success', async () => {
  /**
   * Given：公网详情页可访问，但仍是旧内容。
   * When：执行带 release fingerprint 的公网校验。
   * Then：release 不通过并列出缺失标记。
   * 防回归：旧缓存的 HTTP 200 不能伪装成新版本发布成功。
   */
  const root = fixture();
  const result = await verifyPublicRelease({ rootDir: root, slug: 'sample', requestFn: async () => ({ status: 200, body: 'old page' }) });
  assert.equal(result.release.status, 'PAGES_PENDING');
  assert.ok(result.release.missing_markers.length > 0);
});

test('public screenshot failure is a separate evidence state', () => {
  /**
   * Given：发布阻断校验已经通过，但公网截图基础设施不可用。
   * When：记录后置视觉证据状态。
   * Then：状态为 PUBLIC_VISUAL_FAILED 且带 evidence gap，不改变发布状态。
   * 防回归：截图失败不能回滚已验证的发布。
   */
  const visual = evaluatePublicVisualEvidence({ errorCategory: 'capture_timeout' });
  assert.deepEqual(visual, { status: 'PUBLIC_VISUAL_FAILED', evidence_gap: true, error_category: 'capture_timeout' });
});

test('channel payload contains public URL, fingerprint and both first-screen paths', () => {
  /**
   * Given：公网首屏桌面图、移动图和 release fingerprint 已生成。
   * When：构造 channel 通知 payload。
   * Then：payload 引用正确 URL、commit、指纹和两张图，不包含浏览器状态。
   * 防回归：通知不能只发截图或泄露 cookie/secret。
   */
  const payload = buildChannelPayload({ detailUrl: 'https://example.test/docs/sample.html?release=sample', releaseCommit: 'abc123', fingerprint: { slug: 'sample', markers: ['sample'] }, desktopPath: 'desktop.png', mobilePath: 'mobile.png', visualEvidence: { status: 'PUBLIC_VISUAL_CAPTURED' } });
  assert.equal(payload.detail_url, 'https://example.test/docs/sample.html?release=sample');
  assert.equal(payload.public_visual_status, 'PUBLIC_VISUAL_CAPTURED');
  assert.equal(payload.desktop_first_screen, 'desktop.png');
  assert.equal(payload.mobile_first_screen, 'mobile.png');
  assert.equal(Object.prototype.hasOwnProperty.call(payload, 'cookie'), false);
});
