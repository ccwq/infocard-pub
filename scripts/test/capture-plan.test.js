'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { createCapturePlan, validateCapturePlan } = require('../lib/capture-plan');

test('light route uses compact desktop/mobile capture plan with geometry', () => {
  /**
   * Given：普通单卡没有表格、代码块或疑似裁切信号。
   * When：生成截图计划。
   * Then：只保留 desktop/mobile 的 hero、body、footer 和 geometry。
   * 防回归：避免普通卡默认扩张到多尺寸、多区域截图。
   */
  const plan = createCapturePlan();
  assert.deepEqual(plan, { desktop: ['hero', 'body', 'footer'], mobile: ['hero', 'body', 'footer'], geometry: true });
  assert.equal(validateCapturePlan(plan).valid, true);
});

test('risk signals opt into extra regions without disabling geometry', () => {
  /**
   * Given：卡片包含表格且首轮发现疑似裁切。
   * When：生成截图计划。
   * Then：增加定向 extra_regions，仍保留基础双视口与 geometry。
   * 防回归：风险驱动扩展不能退化成全尺寸截图风暴。
   */
  const plan = createCapturePlan({ triggers: ['tables', 'suspected_clipping', 'unknown'] });
  assert.deepEqual(plan.extra_regions, ['tables', 'suspected_clipping']);
  assert.equal(plan.geometry, true);
});

test('custom capture regions cannot expand the light route', () => {
  /**
   * Given：调用方尝试加入 full-page、tablet 或重复区域。
   * When：生成 light-route capture plan。
   * Then：拒绝非 hero/body/footer 的自定义扩张。
   * 防回归：截图计划不能重新膨胀为多尺寸、多区域流程。
   */
  assert.throws(() => createCapturePlan({ desktop: ['hero', 'full-page'] }), /hero\/body\/footer/);
  assert.throws(() => createCapturePlan({ mobile: ['hero', 'hero'] }), /unique/);
});
