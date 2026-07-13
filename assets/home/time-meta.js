(function attachTimeMeta(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.InfocardTimeMeta = api;
}(typeof globalThis === 'undefined' ? this : globalThis, () => {
  /**
   * 首页代表的是信息卡的归档时间线，因此优先使用卡片创建时写入的 date。
   * updated 仅表示后续内容或元数据维护时间，不能覆盖该语义。
   */
  function selectDisplayTimestamp(card) {
    if (card && card.date) return { value: card.date, label: '提交' };
    if (card && card.updated_at) return { value: card.updated_at, label: '更新' };
    if (card && card.updated) return { value: card.updated, label: '更新' };
    return { value: null, label: '提交' };
  }

  return { selectDisplayTimestamp };
}));
