'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { sortCardsByMode } = require('../../assets/home/sort-mode.js');

test('默认首发日期模式按 date 降序，忽略较晚的 updated', () => {
  const cards = sortCardsByMode([
    { slug: 'older-but-updated', title: '旧卡', date: '2026-06-01 09:00:00', updated: '2026-08-07 20:00:00' },
    { slug: 'newer-published', title: '新卡', date: '2026-07-01 09:00:00', updated: '2026-07-01 09:00:00' }
  ], 'published');

  assert.deepEqual(cards.map((card) => card.slug), ['newer-published', 'older-but-updated']);
});

test('修改日期模式把较晚更新的旧卡排在前面', () => {
  const cards = sortCardsByMode([
    { slug: 'older-but-updated', title: '旧卡', date: '2026-06-01 09:00:00', updated: '2026-08-07 20:00:00' },
    { slug: 'newer-published', title: '新卡', date: '2026-07-01 09:00:00', updated: '2026-07-01 09:00:00' }
  ], 'updated');

  assert.deepEqual(cards.map((card) => card.slug), ['older-but-updated', 'newer-published']);
});

test('修改日期缺失或无效时回退至首发日期，且相同时间排序稳定', () => {
  const cards = sortCardsByMode([
    { slug: 'zeta', title: 'Zeta', date: '2026-07-01 09:00:00', updated: 'not-a-date' },
    { slug: 'alpha', title: 'Alpha', date: '2026-07-01 09:00:00' },
    { slug: 'older', title: '旧卡', date: '2026-06-01 09:00:00' }
  ], 'updated');

  assert.deepEqual(cards.map((card) => card.slug), ['alpha', 'zeta', 'older']);
});

test('未知模式回退到首发日期模式', () => {
  const cards = sortCardsByMode([
    { slug: 'older-but-updated', title: '旧卡', date: '2026-06-01 09:00:00', updated: '2026-08-07 20:00:00' },
    { slug: 'newer-published', title: '新卡', date: '2026-07-01 09:00:00' }
  ], 'unexpected');

  assert.deepEqual(cards.map((card) => card.slug), ['newer-published', 'older-but-updated']);
});
