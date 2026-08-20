# SPA homepage Back-navigation state preservation

Session lesson: preserving a client-rendered index page's state with `sessionStorage` can easily create a refresh regression.

## Problem pattern

A Vue/SPA homepage renders a long, incrementally-loaded list. User clicks a detail page and presses browser Back. Desired behavior:

- restore search query
- restore selected tags / filters
- restore loaded batch count (`visibleCount`)
- restore scroll position

Naive fix: write all state to `sessionStorage` and restore it on `onMounted()`.

Regression: normal refresh or newly navigating to the homepage also replays the old `scrollTop`, so every refresh jumps back to the first remembered position.

## Root cause

`sessionStorage` survives refreshes in the same tab. It does not distinguish:

- `reload`
- new `navigate`
- browser history `back_forward`

So scroll restoration must be gated by navigation type.

## Correct implementation pattern

1. Before editing code in `infocard-pub`, run `git pull` first so local code and generated `_index.yaml` are current.
2. Set browser-native scroll restoration to manual:

```js
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
```

3. Detect navigation type:

```js
const getNavigationType = () => {
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  return nav?.type || 'navigate';
};

const shouldRestoreFromHistory = () => getNavigationType() === 'back_forward';
```

4. Restore saved state only when `shouldRestoreFromHistory()` is true.

```js
const restoreSessionState = () => {
  if (!shouldRestoreFromHistory()) return false;
  const saved = loadPersistedState();
  if (!saved) return false;
  // restore filters, query, visibleCount, scrollTop
  return true;
};
```

5. On normal refresh / new navigation, reset list and scroll state explicitly:

```js
if (!restoredFromHistory) {
  resetVisibleCount();
  scrollTop.value = 0;
}
```

6. Persist the latest scroll just before leaving the page, not only when filters or `visibleCount` change:

```js
const persistLatestScrollState = () => {
  onScroll();
  saveSessionState();
};

window.addEventListener('pagehide', persistLatestScrollState);
window.addEventListener('beforeunload', persistLatestScrollState);
```

7. Restore scroll after DOM and loaded batch are ready:

```js
const savedScroll = restoredFromHistory ? scrollTop.value : 0;
if (savedScroll > 0) {
  requestAnimationFrame(() => window.scrollTo(0, savedScroll));
} else {
  window.scrollTo(0, 0);
}
```

## Verification checklist

- Normal refresh from a deep scroll position returns to top.
- Opening homepage in a fresh tab starts at top.
- Homepage → detail → Back restores the prior position.
- If user had filtered/searched before entering detail, Back restores filter/search plus enough `visibleCount` to make the saved scroll position reachable.
- `_index.yaml` verification still passes.
- After push, public HTML references the bumped asset version and public JS contains `back_forward` plus `scrollRestoration` markers.

## Pitfalls

- Do not restore scroll unconditionally from `sessionStorage`.
- Do not save scroll only inside Vue watchers for filters/list size; pure scrolling may never update the persisted value.
- Do not rely on browser-native scroll restoration and custom SPA restoration simultaneously; set `history.scrollRestoration = 'manual'`.
- Do not claim the fix is complete until both refresh and browser Back cases have been tested separately.
