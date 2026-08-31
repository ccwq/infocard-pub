# Homepage SPA Session State Preservation

## Problem Class

`infocard-pub` homepage is a client-side Vue SPA. A user scrolls/filter-loads the archive, clicks a detail card, then presses browser Back. Without explicit session restoration, the homepage remounts, refetches `_index.yaml`, resets `visibleCount`, and jumps away from the prior visual position.

## Target Behavior

| Navigation scenario | Expected behavior |
|---|---|
| First open homepage | Fetch fresh `docs/version.json` and `_index.yaml`; start at top |
| Manual refresh | Fetch fresh data; start at top; do **not** replay old scroll |
| Browser Back/Forward from detail page | Render immediately from `sessionStorage`; restore filters, visible count, and scroll; avoid `_index.yaml` fetch for speed |
| Back/Forward but cache missing/invalid | Fall back to fresh network fetch; avoid blank page |

## Durable Pattern

### 1) Detect navigation type

Use the Navigation Timing API to distinguish real history traversal from refresh/new navigation.

```js
const getNavigationType = () => {
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  return nav?.type || 'navigate';
};

const shouldRestoreFromHistory = () => getNavigationType() === 'back_forward';

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
```

**Pitfall:** Do not restore old scroll on every mount. That creates the bug where every refresh jumps to the first remembered position.

### 2) Cache both data and UI state in `sessionStorage`

Store enough state to render the homepage without network on Back/Forward:

```js
const SESSION_KEY = 'infocard_archive_state';

const persistState = (state) => {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(state)); } catch {}
};

const loadPersistedState = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};
```

Persist fields:

| Field | Purpose |
|---|---|
| `cards` | Cached `_index.yaml` card array; enables instant Back render |
| `version` | Cached visible version/footer label |
| `savedAt` | Debug/expiry hook; not required for rendering |
| `searchQuery` | Search input value |
| `selectedTags` | Active tag filters |
| `tagsExpanded` | Tag panel state |
| `visibleCount` | Previously rendered batch depth |
| `scrollTop` | Window scroll position |

### 3) Restore from cache only for Back/Forward

```js
const restoreSessionState = () => {
  if (!shouldRestoreFromHistory()) return false;
  const saved = loadPersistedState();
  if (!saved) return false;

  if (Array.isArray(saved.cards)) allCards.value = saved.cards;
  if (typeof saved.version === 'string') version.value = saved.version;
  if (typeof saved.visibleCount === 'number') visibleCount.value = saved.visibleCount;
  if (Array.isArray(saved.selectedTags)) selectedTags.value = saved.selectedTags;
  if (saved.tagsExpanded === true) tagsExpanded.value = true;
  if (typeof saved.searchQuery === 'string') searchQuery.value = saved.searchQuery;
  if (typeof saved.scrollTop === 'number') scrollTop.value = saved.scrollTop;

  return Array.isArray(saved.cards) && saved.cards.length > 0;
};
```

### 4) On mount, branch between hot restore and cold load

```js
onMounted(async () => {
  let restoredFromHistory = false;

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('pagehide', persistLatestScrollState);
  window.addEventListener('beforeunload', persistLatestScrollState);

  try {
    restoredFromHistory = restoreSessionState();

    if (!restoredFromHistory) {
      await fetchVersion();
      await fetchIndex();
      resetVisibleCount();
      scrollTop.value = 0;
      saveSessionState();
    }
  } catch (error) {
    console.error(error);
    loadError.value = '加载索引失败，请稍后刷新';
  } finally {
    loading.value = false;
  }

  await nextTick();
  measureTagCollapse();

  const savedScroll = restoredFromHistory ? scrollTop.value : 0;
  if (savedScroll > 0) {
    requestAnimationFrame(() => window.scrollTo(0, savedScroll));
  } else {
    window.scrollTo(0, 0);
  }

  ensureAutoFill();
  setupObserver();
});
```

### 5) Save latest scroll before navigation away

A watch alone may not catch pure scrolling before clicking a detail link. Save on `pagehide` / `beforeunload` too.

```js
const onScroll = () => {
  scrollTop.value = window.scrollY || document.documentElement.scrollTop;
};

const saveSessionState = () => {
  persistState({
    cards: allCards.value,
    version: version.value,
    savedAt: Date.now(),
    visibleCount: visibleCount.value,
    selectedTags: selectedTags.value.slice(),
    tagsExpanded: tagsExpanded.value,
    searchQuery: searchQuery.value,
    scrollTop: scrollTop.value
  });
};

const persistLatestScrollState = () => {
  onScroll();
  saveSessionState();
};
```

Also include `allCards` and `version` in the watcher so cache refreshes after a real fetch:

```js
Vue.watch(
  [allCards, version, filteredCards, tagsExpanded, selectedTags, searchQuery, visibleCount],
  async () => {
    await nextTick();
    measureTagCollapse();
    ensureAutoFill();
    setupObserver();
    saveSessionState();
  },
  { deep: true }
);
```

## Common Pitfalls

1. **Unconditional restore** — restoring `scrollTop` from `sessionStorage` on refresh causes every refresh to jump to stale old position.
2. **Restoring after fetch only** — still creates a loading flash and defeats the Back optimization; branch before network fetch.
3. **Not caching cards** — restoring only filters/scroll still requires real index load and may render a visible gap.
4. **Not saving on pagehide** — pure scroll position may remain stale if no filter/count state changed before user clicks a card.
5. **Browser native scroll restoration conflict** — set `history.scrollRestoration = 'manual'` when taking over scroll restoration.
6. **No cache fallback** — if cached `cards` are absent, fetch network data rather than rendering an empty archive.

## Verification Checklist

- Static checks:
  - `getNavigationType() === 'back_forward'` gates restoration.
  - Back restore path assigns `allCards.value = saved.cards`.
  - Network calls `fetchVersion()` / `fetchIndex()` are inside `if (!restoredFromHistory)`.
  - `saveSessionState()` persists `cards`, `version`, `visibleCount`, filters, and `scrollTop`.
  - `pagehide` or equivalent saves latest scroll.
  - `history.scrollRestoration = 'manual'` is present.
- Local behavior:
  - Open/refresh homepage → starts at top and fetches fresh data.
  - Scroll and click a detail card → Back returns to the previous position with no visible reload gap.
  - Clear sessionStorage → Back path falls back to network load without blank page.
- Publishing:
  - Bump `index.html` resource query strings (`?v=`) after changing `assets/home/index.js`.
  - Run `python scripts/verify_index.py`.
  - Commit, push, and verify public Pages serves the new version marker and JS markers.
