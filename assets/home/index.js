(() => {
  const { createApp, ref, computed, onMounted, nextTick } = Vue;

  const BATCH_SIZE = 12;
  const SESSION_KEY = 'infocard_archive_state';
  const INDEX_DATA_SELECTOR = '#home-index-data';

  const loadPersistedState = () => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  };

  const persistState = (state) => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch {}
  };

  const getNavigationType = () => {
    const nav = performance.getEntriesByType?.('navigation')?.[0];
    return nav?.type || 'navigate';
  };

  const shouldRestoreFromHistory = () => getNavigationType() === 'back_forward';
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  const INTERSECTION_ROOT_MARGIN = '0px 0px 480px 0px';
  const COLLAPSED_FULL_ROWS = 3;
  const COLLAPSED_EXTRA_PX = 24;
  const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const DATETIME_MINUTE_RE = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?:Z|[+-]\d{2}:?\d{2})?$/;
  const DATETIME_SECOND_RE = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;

  const pad2 = (n) => String(n).padStart(2, '0');

  const parseLooseDate = (value) => {
    if (!value) return null;
    const raw = String(value).trim().replace(/^"|"$/g, '');
    if (!raw) return null;
    if (DATE_ONLY_RE.test(raw)) {
      const d = new Date(`${raw}T12:00:00`);
      d.__precision = 'date';
      return d;
    }
    let precision = 'minute';
    if (DATETIME_SECOND_RE.test(raw)) {
      precision = 'second';
    } else if (DATETIME_MINUTE_RE.test(raw)) {
      precision = 'minute';
    }
    const d = new Date(raw.replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return null;
    d.__precision = precision;
    return d;
  };

  const getDatePrecision = (dateValue) => {
    if (!(dateValue instanceof Date)) return 'date';
    return dateValue.__precision || 'date';
  };

  const formatDate = (dateValue) => {
    const d = dateValue instanceof Date ? dateValue : parseLooseDate(dateValue);
    if (!d) return '—';
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  };

  const formatClock = (dateValue) => {
    const d = dateValue instanceof Date ? dateValue : parseLooseDate(dateValue);
    if (!d) return '—';
    const precision = getDatePrecision(d);
    if (precision === 'date') return '';
    if (precision === 'second') {
      return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
    }
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };

  const formatDateTime = (dateValue) => {
    const d = dateValue instanceof Date ? dateValue : parseLooseDate(dateValue);
    if (!d) return '—';
    if (getDatePrecision(d) === 'date') return formatDate(d);
    return `${formatDate(d)} ${formatClock(d)}`;
  };

  const formatDateMinute = (dateValue) => {
    const d = dateValue instanceof Date ? dateValue : parseLooseDate(dateValue);
    if (!d) return '鈥?';
    return `${formatDate(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };

  const pickFirstDate = (...values) => {
    for (const value of values) {
      const d = parseLooseDate(value);
      if (d) return d;
    }
    return null;
  };

  const buildTimeMeta = (card) => {
    const updatedDate = pickFirstDate(card.updated_at, card.updated);
    const cardDate = parseLooseDate(card.date);
    const modified = pickFirstDate(card.updated_at, card.updated, card._effective_at, card._modified_at, card.modified_at, card._modified_date);
    const submitted = pickFirstDate(card._submitted_at, card._created_at, card.created_at, card.date, card.created);
    const effective = updatedDate || cardDate || modified || submitted;
    const sortTs = Number(card._sort_ts);
    const fallbackTs = effective ? effective.getTime() : 0;
    const normalizedSortTs = Number.isFinite(sortTs) && sortTs > 0
      ? (sortTs > 1e15 ? Math.floor(sortTs / 1e6) : sortTs)
      : fallbackTs;
    const label = updatedDate
      ? '更新'
      : (cardDate ? '提交' : (modified ? '修改' : '提交'));
    return {
      label,
      date: formatDate(effective),
      clock: formatClock(effective),
      full: formatDateTime(effective),
      minuteFull: formatDateMinute(effective),
      minuteClock: effective ? `${pad2(effective.getHours())}:${pad2(effective.getMinutes())}` : '—',
      ts: normalizedSortTs,
      rawTs: fallbackTs
    };
  };

  const buildKindLabel = (card) => {
    const category = String(card.category || '').toLowerCase();
    if (category === 'docs') return 'BRIEF';
    if (category === 'report') return 'REPORT';
    if (category === 'note') return 'NOTE';
    return 'CARD';
  };

  const buildLeadGlyph = (card) => {
    const category = String(card.category || '').toLowerCase();
    if (category === 'docs') return '◫';
    if (category === 'report') return '◩';
    return '◧';
  };

  const PRIMARY_DIMENSIONS = [
    { key: 'domains', label: '平台 / 领域' },
    { key: 'tool_types', label: '工具类型' },
    { key: 'stages', label: '使用阶段' },
    { key: 'interaction', label: '交互形态' },
    { key: 'content_type', label: '内容类型' }
  ];
  const ADVANCED_DIMENSIONS = [
    { key: 'source', label: '来源' },
    { key: 'style', label: '风格' },
    { key: 'risk', label: '风险' }
  ];

  const normalizeFacetArray = (value) => Array.isArray(value)
    ? [...new Set(value.map((item) => String(item || '').trim()).filter(Boolean))]
    : [];

  const normalizeCard = (card, order) => {
    const taxonomy = card.taxonomy && typeof card.taxonomy === 'object' ? card.taxonomy : {};
    const facets = {
      domains: normalizeFacetArray(taxonomy.domains),
      tool_types: normalizeFacetArray(taxonomy.tool_types),
      stages: normalizeFacetArray(taxonomy.stages),
      interaction: normalizeFacetArray(taxonomy.interaction),
      content_type: normalizeFacetArray(taxonomy.content_type),
      source: normalizeFacetArray(taxonomy.source),
      style: normalizeFacetArray(taxonomy.style && taxonomy.style.length ? taxonomy.style : (card.style ? [card.style] : [])),
      risk: normalizeFacetArray(taxonomy.risk)
    };
    return {
      ...card,
      __order: order,
      __time: buildTimeMeta(card),
      __href: card.path || `${card.slug || ''}.html`,
      __title: card.title || card.slug || '未命名',
      __category: String(card.category || 'misc').toUpperCase(),
      __desc: card.desc || card.note || '',
      __tags: Array.isArray(card.tags) ? card.tags : [],
      __kind: buildKindLabel(card),
      __glyph: buildLeadGlyph(card),
      __facets: facets
    };
  };

  const root = document.getElementById('app');
  if (!root) return;

  createApp({
    setup() {
      const version = ref('加载中…');
      const loading = ref(true);
      const loadError = ref('');
      const allCards = ref([]);
      const searchQuery = ref('');
      const selectedFacets = ref({
        domains: [],
        tool_types: [],
        stages: [],
        interaction: [],
        content_type: [],
        source: [],
        style: [],
        risk: []
      });
      const facetsExpanded = ref(false);
      const visibleCount = ref(BATCH_SIZE);
      const scrollTop = ref(0);
      const isAutoLoading = ref(false);
      const sentinelRef = ref(null);
      const tagViewportRef = ref(null);
      const tagFilterRef = ref(null);
      const tagToggleRef = ref(null);
      const tagNeedsCollapse = ref(false);
      const collapsedMaxHeight = ref('none');
      const observerRef = ref(null);

      const totalCount = computed(() => allCards.value.length);

      const normalizedCards = computed(() => allCards.value
        .map((card, order) => normalizeCard(card, order))
        .sort((a, b) => {
          if ((b.__time?.ts || 0) !== (a.__time?.ts || 0)) return (b.__time?.ts || 0) - (a.__time?.ts || 0);
          if ((b.__time?.rawTs || 0) !== (a.__time?.rawTs || 0)) return (b.__time?.rawTs || 0) - (a.__time?.rawTs || 0);
          return String(a.__title).localeCompare(String(b.__title), 'zh-Hans-CN');
        }));

      const totalCountLabel = computed(() => String(totalCount.value).padStart(2, '0'));

      const categoryCount = computed(() => {
        const set = new Set(normalizedCards.value.map((card) => card.__category));
        return set.size;
      });

      const latestTimeLabel = computed(() => normalizedCards.value[0]?.__time?.full || '—');

      const facetCounters = computed(() => {
        const result = {};
        [...PRIMARY_DIMENSIONS, ...ADVANCED_DIMENSIONS].forEach((dim) => {
          const map = new Map();
          normalizedCards.value.forEach((card) => {
            (card.__facets[dim.key] || []).forEach((item) => map.set(item, (map.get(item) || 0) + 1));
          });
          result[dim.key] = [...map.entries()]
            .sort((a, b) => (b[1] - a[1]) || String(a[0]).localeCompare(String(b[0]), 'zh-Hans-CN'))
            .map(([value, count]) => ({ value, count }));
        });
        return result;
      });

      const selectedFacetCount = computed(() => Object.values(selectedFacets.value).reduce((sum, arr) => sum + arr.length, 0));

      const filteredCards = computed(() => {
        const q = searchQuery.value.trim().toLowerCase();
        return normalizedCards.value.filter((card) => {
          const matchFacets = [...PRIMARY_DIMENSIONS, ...ADVANCED_DIMENSIONS].every((dim) => {
            const selected = selectedFacets.value[dim.key] || [];
            if (!selected.length) return true;
            const values = card.__facets[dim.key] || [];
            return selected.some((value) => values.includes(value));
          });
          const matchSearch = !q ||
            String(card.__title).toLowerCase().includes(q) ||
            String(card.slug || '').toLowerCase().includes(q) ||
            card.__tags.some((tag) => String(tag).toLowerCase().includes(q)) ||
            String(card.category || '').toLowerCase().includes(q) ||
            [...PRIMARY_DIMENSIONS, ...ADVANCED_DIMENSIONS].some((dim) => (card.__facets[dim.key] || []).some((item) => String(item).toLowerCase().includes(q)));
          return matchFacets && matchSearch;
        });
      });

      const visibleCards = computed(() => filteredCards.value.slice(0, visibleCount.value));
      const shownCount = computed(() => filteredCards.value.length);
      const renderedCount = computed(() => visibleCards.value.length);
      const hasMore = computed(() => renderedCount.value < shownCount.value);
      const countLineText = computed(() => `共 ${totalCount.value} 张信息卡 · 命中 ${shownCount.value} 张 · 已渲染 ${renderedCount.value} 张 · 多维 taxonomy 筛选`);
      const listProgressText = computed(() => hasMore.value ? `loaded ${renderedCount.value}/${shownCount.value}` : `loaded all ${renderedCount.value}`);
      const loadingNoteText = computed(() => {
        if (loadError.value) return '';
        if (!shownCount.value) return '当前筛选无结果';
        if (isAutoLoading.value && hasMore.value) return '接近底部时自动追加下一批…';
        if (hasMore.value) return '滚动到底部可自动加载，或点击按钮继续';
        return '已加载当前结果集全部条目';
      });

      const posterSummary = computed(() => `LATEST FIRST · ${shownCount.value} ACTIVE RESULTS · ${selectedFacetCount.value} ACTIVE FACETS`);
      const activeFacetClass = (dimension, value) => (selectedFacets.value[dimension] || []).includes(value);

      const resetVisibleCount = () => {
        visibleCount.value = Math.min(BATCH_SIZE, Math.max(filteredCards.value.length, BATCH_SIZE));
      };

      const loadMore = () => {
        if (!hasMore.value) return;
        visibleCount.value = Math.min(visibleCount.value + BATCH_SIZE, filteredCards.value.length);
      };

      const onSearchInput = (event) => {
        searchQuery.value = event.target.value;
        resetVisibleCount();
        nextTick(() => {
          measureTagCollapse();
          ensureAutoFill();
        });
      };

      const collapseFacetPanel = () => {
        facetsExpanded.value = false;
      };

      const toggleFacetValue = (dimension, value) => {
        const current = selectedFacets.value[dimension] || [];
        const next = current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value];
        selectedFacets.value = { ...selectedFacets.value, [dimension]: next };
        resetVisibleCount();
        nextTick(() => {
          ensureAutoFill();
        });
      };

      const clearAllFacets = () => {
        selectedFacets.value = {
          domains: [], tool_types: [], stages: [], interaction: [], content_type: [], source: [], style: [], risk: []
        };
        collapseFacetPanel();
        resetVisibleCount();
        nextTick(() => {
          ensureAutoFill();
        });
      };

      const removeFacetValue = (dimension, value) => {
        const current = selectedFacets.value[dimension] || [];
        selectedFacets.value = { ...selectedFacets.value, [dimension]: current.filter((item) => item !== value) };
        resetVisibleCount();
        nextTick(() => {
          ensureAutoFill();
        });
      };

      const toggleAdvancedFacets = () => {
        facetsExpanded.value = !facetsExpanded.value;
      };

      const measureTagCollapse = () => {
        const viewport = tagViewportRef.value;
        const filterEl = tagFilterRef.value;
        if (!viewport || !filterEl) return;

        const buttons = Array.from(filterEl.querySelectorAll('button'));
        if (!buttons.length) {
          collapsedMaxHeight.value = 'none';
          tagNeedsCollapse.value = false;
          return;
        }

        const rows = [];
        let currentTop = null;
        buttons.forEach((button) => {
          const top = button.offsetTop;
          if (currentTop === null || top !== currentTop) {
            rows.push(top);
            currentTop = top;
          }
        });

        const shouldExpand = tagsExpanded.value;
        tagNeedsCollapse.value = rows.length > COLLAPSED_FULL_ROWS;

        if (!tagNeedsCollapse.value || shouldExpand) {
          collapsedMaxHeight.value = `${filterEl.scrollHeight}px`;
          return;
        }

        const baseTop = rows[0] || 0;
        const visibleRows = rows.slice(0, COLLAPSED_FULL_ROWS);
        let lastBottom = 0;
        buttons.forEach((button) => {
          if (visibleRows.includes(button.offsetTop)) {
            lastBottom = Math.max(lastBottom, button.offsetTop + button.offsetHeight);
          }
        });
        collapsedMaxHeight.value = `${Math.max(0, lastBottom - baseTop + COLLAPSED_EXTRA_PX)}px`;
      };

      const ensureAutoFill = () => {
        const cardsContainer = root.querySelector('.cards');
        if (!cardsContainer || !hasMore.value) return;
        const shell = root.querySelector('.page');
        const shellHeight = shell ? shell.getBoundingClientRect().height : window.innerHeight;
        if (cardsContainer.scrollHeight < shellHeight * 0.82) {
          loadMore();
          nextTick(() => {
            if (hasMore.value) ensureAutoFill();
          });
        }
      };

      const setupObserver = () => {
        if (observerRef.value) {
          observerRef.value.disconnect();
          observerRef.value = null;
        }
        if (!('IntersectionObserver' in window) || !sentinelRef.value) return;
        observerRef.value = new IntersectionObserver((entries) => {
          const hit = entries.some((entry) => entry.isIntersecting);
          if (!hit || !hasMore.value) return;
          isAutoLoading.value = true;
          loadMore();
          nextTick(() => {
            isAutoLoading.value = false;
          });
        }, { root: null, rootMargin: INTERSECTION_ROOT_MARGIN, threshold: 0 });
        observerRef.value.observe(sentinelRef.value);
      };

      const fetchVersion = async () => {
        try {
          const versionResp = await fetch(`./docs/version.json?t=${Date.now()}`, { cache: 'no-store' });
          const data = await versionResp.json();
          version.value = data.version || 'v?';
        } catch {
          version.value = 'v?';
        }
      };

      const readInjectedIndex = () => {
        const source = document.querySelector(INDEX_DATA_SELECTOR);
        if (!source) {
          throw new Error('missing injected home-index-data');
        }
        const payload = source.textContent || '{}';
        return JSON.parse(payload);
      };

      const fetchIndex = async () => {
        const index = readInjectedIndex();
        const cards = Array.isArray(index?.cards) ? index.cards : [];
        allCards.value = cards;
      };

      const onResize = () => {
        window.requestAnimationFrame(() => {
          measureTagCollapse();
          ensureAutoFill();
        });
      };

      // Restore persisted session state only when returning via browser Back/Forward.
      // A normal refresh must fetch a fresh index and start from the top.
      const restoreSessionState = () => {
        if (!shouldRestoreFromHistory()) return false;
        const saved = loadPersistedState();
        if (!saved) return false;
        if (Array.isArray(saved.cards)) allCards.value = saved.cards;
        if (typeof saved.version === 'string') version.value = saved.version;
        if (typeof saved.visibleCount === 'number') visibleCount.value = saved.visibleCount;
        if (saved.selectedFacets && typeof saved.selectedFacets === 'object') selectedFacets.value = saved.selectedFacets;
        if (saved.facetsExpanded === true) facetsExpanded.value = true;
        if (typeof saved.searchQuery === 'string') searchQuery.value = saved.searchQuery;
        if (typeof saved.scrollTop === 'number') scrollTop.value = saved.scrollTop;
        return Array.isArray(saved.cards) && saved.cards.length > 0;
      };

      const saveSessionState = () => {
        persistState({
          cards: allCards.value,
          version: version.value,
          savedAt: Date.now(),
          visibleCount: visibleCount.value,
          selectedFacets: JSON.parse(JSON.stringify(selectedFacets.value)),
          facetsExpanded: facetsExpanded.value,
          searchQuery: searchQuery.value,
          scrollTop: scrollTop.value
        });
      };

      const onScroll = () => {
        scrollTop.value = window.scrollY || document.documentElement.scrollTop;
      };

      const persistLatestScrollState = () => {
        onScroll();
        saveSessionState();
      };

      onMounted(async () => {
        let restoredFromHistory = false;
        document.body.classList.add('is-loading-index');
        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('pagehide', persistLatestScrollState);
        window.addEventListener('beforeunload', persistLatestScrollState);
        try {
          restoredFromHistory = restoreSessionState(); // Back/Forward: render from sessionStorage, no network index fetch
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
          document.body.classList.remove('is-loading-index');
        }
        await nextTick();
        measureTagCollapse();
        // Restore scroll AFTER DOM + visibleCards are ready, only for browser Back/Forward.
        const savedScroll = restoredFromHistory ? scrollTop.value : 0;
        if (savedScroll > 0) {
          requestAnimationFrame(() => window.scrollTo(0, savedScroll));
        } else {
          window.scrollTo(0, 0);
        }
        ensureAutoFill();
        setupObserver();
      });

      // Watch state changes and persist
      Vue.watch([allCards, version, filteredCards, facetsExpanded, selectedFacets, searchQuery, visibleCount], async () => {
        await nextTick();
        measureTagCollapse();
        ensureAutoFill();
        setupObserver();
        saveSessionState();
      }, { deep: true });

      const renderFacetLabel = (item) => `${item.value} (${item.count})`;
      const serialOf = (card) => pad2(card.__order + 1);

      return {
        version,
        loading,
        loadError,
        totalCount,
        shownCount,
        renderedCount,
        hasMore,
        searchQuery,
        selectedFacets,
        facetsExpanded,
        visibleCards,
        facetCounters,
        PRIMARY_DIMENSIONS,
        ADVANCED_DIMENSIONS,
        selectedFacetCount,
        totalCountLabel,
        latestTimeLabel,
        categoryCount,
        posterSummary,
        countLineText,
        listProgressText,
        loadingNoteText,
        tagNeedsCollapse,
        collapsedMaxHeight,
        sentinelRef,
        tagViewportRef,
        tagFilterRef,
        tagToggleRef,
        activeFacetClass,
        onSearchInput,
        toggleFacetValue,
        clearAllFacets,
        removeFacetValue,
        toggleAdvancedFacets,
        loadMore,
        renderFacetLabel,
        serialOf
      };
    },
    template: `
      <div class="page">
        <div class="page-inner">
          <section class="poster-shell compact">
            <div class="poster-strip">
              <div class="strip-left">
                <span class="strip-mark">INFOCARD ARCHIVE</span>
                <span class="strip-sub">PUBLIC INDEX</span>
              </div>
              <div class="strip-center">{{ totalCount }} CARDS / {{ categoryCount }} CATEGORIES / {{ latestTimeLabel }}</div>
              <div class="strip-right">INDEXED / FILTERABLE / CHRONOLOGICAL</div>
            </div>

              <div class="poster-band compact">
                <div class="poster-title-zone compact">
                  <div class="poster-index">01 / ARCHIVE POSTER</div>
                  <h1>INFOCARD<br>ARCHIVE</h1>
                  <p class="poster-copy compact">公开信息卡索引，按最新时间优先排列，支持多维 taxonomy 筛选与增量浏览。</p>
                </div>

                <div class="poster-info-zone compact">
                  <div class="poster-stat-card compact">
                    <div class="poster-stat-item highlight">
                      <span class="poster-stat-label">LAST UPDATE</span>
                      <span class="poster-stat-value">{{ latestTimeLabel }}</span>
                    </div>
                    <div class="poster-stat-divider"></div>
                    <div class="poster-stat-item">
                      <span class="poster-stat-label">CARDS</span>
                      <span class="poster-stat-value">{{ totalCountLabel }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          <section class="controls controls-standalone">
            <label class="search-inline">
              <span class="search-inline-label">ARCHIVE QUERY</span>
              <input
                :value="searchQuery"
                type="search"
                placeholder="搜索标题 / slug / 标签 / 分类…"
                autocomplete="off"
                @input="onSearchInput"
              >
            </label>
          </section>

          <section class="tag-stack facet-stack">
            <div class="tag-stack-top">
              <div class="tag-stack-title-wrap">
                <div class="tag-stack-kicker">archive / taxonomy / faceted filter</div>
                <div class="tag-stack-title">多维 taxonomy 筛选</div>
              </div>
              <div class="tag-stack-note">主筛选显示 5 个维度；来源 / 风格 / 风险折叠在高级筛选里。普通 tags 退化为搜索关键词。</div>
            </div>

            <div v-if="selectedFacetCount" class="current-filter banded">
              <span class="stack-label">当前条件</span>
              <span class="selected-pills">
                <template v-for="dim in [...PRIMARY_DIMENSIONS, ...ADVANCED_DIMENSIONS]" :key="dim.key">
                  <span v-for="value in selectedFacets[dim.key]" :key="dim.key + value" class="pill pill-stack">
                    {{ dim.label }} · {{ value }}
                    <button type="button" aria-label="移除筛选" @click="removeFacetValue(dim.key, value)">×</button>
                  </span>
                </template>
              </span>
              <button type="button" class="clear-all" @click="clearAllFacets">清空</button>
            </div>

            <div class="facet-groups">
              <section v-for="dim in PRIMARY_DIMENSIONS" :key="dim.key" class="facet-group">
                <div class="facet-group-head">
                  <span class="facet-group-title">{{ dim.label }}</span>
                </div>
                <div class="tag-filter facet-filter">
                  <button
                    v-for="item in facetCounters[dim.key] || []"
                    :key="dim.key + item.value"
                    :class="{ active: activeFacetClass(dim.key, item.value) }"
                    type="button"
                    @click="toggleFacetValue(dim.key, item.value)"
                  >
                    {{ renderFacetLabel(item) }}
                  </button>
                </div>
              </section>
            </div>

            <div class="advanced-facet-wrap">
              <button type="button" class="tag-toggle-mini advanced-toggle" :class="{ active: facetsExpanded }" @click="toggleAdvancedFacets">
                {{ facetsExpanded ? '收起高级筛选' : '展开高级筛选 +' }}
              </button>
              <div v-if="facetsExpanded" class="facet-groups advanced">
                <section v-for="dim in ADVANCED_DIMENSIONS" :key="dim.key" class="facet-group">
                  <div class="facet-group-head">
                    <span class="facet-group-title">{{ dim.label }}</span>
                  </div>
                  <div class="tag-filter facet-filter">
                    <button
                      v-for="item in facetCounters[dim.key] || []"
                      :key="dim.key + item.value"
                      :class="{ active: activeFacetClass(dim.key, item.value) }"
                      type="button"
                      @click="toggleFacetValue(dim.key, item.value)"
                    >
                      {{ renderFacetLabel(item) }}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </section>

          <section class="list-header premium">
            <div class="count-line">{{ loadError || countLineText }}</div>
            <div class="list-progress">{{ listProgressText }}</div>
          </section>

          <section v-if="loadError" class="empty-state">{{ loadError }}</section>
          <section v-else-if="loading" class="empty-state loading-state" aria-live="polite" aria-busy="true">
            <span class="loading-spinner" aria-hidden="true"></span>
            <span class="loading-text">加载索引中…</span>
          </section>
          <section v-else-if="!shownCount" class="empty-state">无匹配结果</section>
          <section v-else class="cards premium-cards">
            <article v-for="card in visibleCards" :key="card.slug || card.__order" class="card-row premium-row">
              <div class="card-timeline" aria-hidden="true">
                <span class="timeline-line"></span>
                <span class="timeline-node"></span>
              </div>

              <div class="card-rail">
                <a class="rail-number-block" :href="card.__href" :aria-label="card.__title">
                  <span class="rail-serial">{{ serialOf(card) }}</span>
                  <span class="rail-category">{{ card.__category }}</span>
                  <span class="rail-time">{{ card.__time.minuteFull }}</span>
                  <span class="rail-time-stack">
                    <span class="rail-date">{{ card.__time.date }}</span>
                    <span class="rail-clock">{{ card.__time.minuteClock }}</span>
                  </span>
                </a>
                <div class="rail-file-mark" aria-hidden="true">
                  <span class="rail-file-icon">{{ card.__glyph }}</span>
                </div>
              </div>

              <div class="card-body premium-body">
                <div class="entry-copy">
                  <h2><a :href="card.__href">{{ card.__title }}</a></h2>
                  <div v-if="card.__desc" class="desc">{{ card.__desc }}</div>
                  <div class="card-meta premium-meta">
                    <span v-for="tag in card.__tags" :key="tag" class="tag-chip">{{ tag }}</span>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <div v-if="!loadError && shownCount" ref="sentinelRef" class="sentinel" aria-hidden="true"></div>

          <section v-if="!loadError && shownCount" class="load-more-wrap">
            <button class="load-more" type="button" :disabled="!hasMore" @click="loadMore">
              {{ hasMore ? '加载更多' : '已全部加载' }}
            </button>
            <div class="loading-note">{{ loadingNoteText }}</div>
          </section>

          <footer class="footer">
            <span>infocard-pub · ccwq.github.io · {{ version }}</span>
            <span>client-side filter · local-vue-shell · archive index</span>
          </footer>
        </div>
      </div>
    `
  }).mount(root);
})();
