'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { createCapturePlan, selectComplexRegion, validateCapturePlan } = require('../lib/capture-plan');
const { createContactSheetSet } = require('../lib/contact-sheet');

test('light route uses two regions and mandatory geometry', () => {
  /**
   * Given：普通单卡没有高风险布局信号。
   * When：生成标准截图计划。
   * Then：桌面和移动都只包含 hero/complex，且 geometry 开启。
   * 防回归：避免普通卡默认扩张到 footer 或全页截图。
   */
  const plan = createCapturePlan();
  assert.deepEqual(plan.desktop, ['hero', 'complex']);
  assert.deepEqual(plan.mobile, ['hero', 'complex']);
  assert.equal(plan.geometry, true);
  assert.deepEqual(plan.complex_region, { name: 'body', reason: 'fallback_body_no_risk_signals', signals: [] });
  assert.equal(validateCapturePlan(plan).valid, true);
});

for (const signal of ['code_blocks', 'tables', 'risk_panels', 'dense_grids', 'sticky_elements', 'long_page', 'suspected_clipping']) {
  test(`risk signal ${signal} is selected deterministically`, () => {
    /**
     * Given：卡片包含一个已知复杂布局风险信号。
     * When：生成截图计划并重复选择复杂区域。
     * Then：计划保持两区域，选择原因稳定且记录该信号。
     * 防回归：复杂区域选择不能依赖 Author 手工判断或随机结果。
     */
    const first = createCapturePlan({ signals: [signal] });
    const second = selectComplexRegion({ triggers: [signal] });
    assert.deepEqual(first.complex_region, second);
    assert.equal(first.complex_region.name, 'body');
    assert.ok(first.complex_region.signals.length > 0);
  });
}

test('multiple signals use stable priority and preserve all reasons', () => {
  /**
   * Given：卡片同时包含表格、代码和疑似裁切信号。
   * When：生成风险驱动截图计划。
   * Then：按固定优先级选择首个信号，并保留去重后的完整信号列表。
   * 防回归：输入顺序变化不能造成复杂区域审计理由漂移。
   */
  const plan = createCapturePlan({ signals: ['suspected_clipping', 'tables', 'code_blocks', 'tables'] });
  assert.equal(plan.complex_region.reason, 'risk_signal_code_blocks');
  assert.deepEqual(plan.complex_region.signals, ['code_blocks', 'tables_or_matrix', 'suspected_clipping']);
});

test('simple fallback never becomes a full-page region', () => {
  /**
   * Given：卡片没有任何风险信号。
   * When：读取复杂区域选择结果。
   * Then：使用稳定 body fallback，而不是 full-page 或 footer。
   * 防回归：减少截图数量不能牺牲可审计的固定区域边界。
   */
  assert.equal(selectComplexRegion({}).name, 'body');
  assert.doesNotMatch(selectComplexRegion({}).reason, /full|footer/i);
});

test('custom regions and disabled geometry are rejected', () => {
  /**
   * Given：调用方传入旧 footer 计划、重复区域或关闭 geometry。
   * When：创建或校验截图计划。
   * Then：拒绝不符合新契约的计划。
   * 防回归：planner 与 validator 不能继续接受过时或不安全的 evidence contract。
   */
  assert.throws(() => createCapturePlan({ desktop: ['hero', 'body'] }), /hero\/complex/);
  assert.throws(() => createCapturePlan({ mobile: ['hero', 'hero'] }), /hero\/complex/);
  assert.equal(validateCapturePlan({ desktop: ['hero', 'complex'], mobile: ['hero', 'complex'], geometry: false }).valid, false);
});

test('contact-sheet evidence keeps four raw captures and two labeled review inputs', () => {
  /**
   * Given：planner 已生成标准双区域计划，四张 raw screenshot 已由 web-capture 产出。
   * When：构造 contact-sheet evidence metadata。
   * Then：桌面和移动各保留 hero/complex 两个带标签 panel。
   * 防回归：contact sheet 只能压缩模型输入，不能丢失原始截图或区域身份。
   */
  const plan = createCapturePlan({ signals: ['tables'] });
  const sheets = createContactSheetSet({ plan, raw: { desktop: { hero: 'd-h.png', complex: 'd-c.png' }, mobile: { hero: 'm-h.png', complex: 'm-c.png' } }, paths: { desktop: 'd-sheet.png', mobile: 'm-sheet.png' } });
  assert.deepEqual(sheets.desktop.panels.map((panel) => panel.label), ['desktop / hero', 'desktop / complex']);
  assert.deepEqual(sheets.mobile.panels.map((panel) => panel.screenshot_path), ['m-h.png', 'm-c.png']);
});

test('sticky and clipping signals expose conditional follow-up regions', () => {
  /**
   * Given：卡片存在 sticky 控件和疑似裁切信号。
   * When：生成风险驱动截图计划。
   * Then：计划保留两张默认 raw，并声明需要追加的条件检查区域。
   * 防回归：footer/sticky 证据应按风险触发，不能恢复成每卡默认截图。
   */
  const plan = createCapturePlan({ signals: ['sticky_elements', 'suspected_clipping'] });
  assert.deepEqual(plan.conditional_regions, ['sticky', 'footer_or_clipping']);
});
