(function attachHomeSortMode(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.InfocardHomeSortMode = api;
}(typeof globalThis === 'undefined' ? this : globalThis, () => {
  const MODES = Object.freeze({
    PUBLISHED: 'published',
    UPDATED: 'updated'
  });

  const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const DATETIME_RE = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;

  function normalizeMode(value) {
    return value === MODES.UPDATED ? MODES.UPDATED : MODES.PUBLISHED;
  }

  function parseTimestamp(value) {
    if (value == null) return 0;
    const raw = String(value).trim().replace(/^["']|["']$/g, '');
    if (!raw) return 0;
    const candidate = DATE_ONLY_RE.test(raw)
      ? `${raw}T00:00:00+08:00`
      : DATETIME_RE.test(raw)
        ? (raw.includes('Z') || /[+-]\d{2}:?\d{2}$/.test(raw)
          ? raw.replace(' ', 'T')
          : `${raw.replace(' ', 'T')}+08:00`)
        : null;
    if (!candidate) return 0;
    const timestamp = Date.parse(candidate);
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function publishedTimestamp(card) {
    return parseTimestamp(card?.date) || Number(card?._sort_ts) || 0;
  }

  function updatedTimestamp(card) {
    return parseTimestamp(card?.updated) || parseTimestamp(card?.updated_at) || publishedTimestamp(card);
  }

  function sortCardsByMode(cards, mode) {
    const normalizedMode = normalizeMode(mode);
    const timestampFor = normalizedMode === MODES.UPDATED ? updatedTimestamp : publishedTimestamp;
    return [...cards].sort((a, b) => {
      const timestampDifference = timestampFor(b) - timestampFor(a);
      if (timestampDifference !== 0) return timestampDifference;
      const titleDifference = String(a?.title || '').localeCompare(String(b?.title || ''), 'zh-Hans-CN');
      if (titleDifference !== 0) return titleDifference;
      return String(a?.slug || '').localeCompare(String(b?.slug || ''), 'zh-Hans-CN');
    });
  }

  return { MODES, normalizeMode, publishedTimestamp, sortCardsByMode, updatedTimestamp };
}));
