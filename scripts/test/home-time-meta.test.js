'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { selectDisplayTimestamp } = require('../../assets/home/time-meta.js');

test('首页展示卡片的原始提交日期，而不是批量维护更新时间', () => {
  /**
   * Given：卡片保留了原始 date，同时 updated 因一次批量维护被写为相同时间
   * When：首页选择卡片的展示时间
   * Then：使用 date 并标注为提交
   * 防回归：taxonomy 等批量维护不能让首页所有卡片显示为同一更新时间
   */
  const result = selectDisplayTimestamp({
    date: '2026-06-01 09:30:00',
    updated: '2026-07-13 14:00:00',
  });

  assert.deepEqual(result, { value: '2026-06-01 09:30:00', label: '提交' });
});
