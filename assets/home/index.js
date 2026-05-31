(() => {
  const { createApp, ref, computed, onMounted, nextTick } = Vue;

  const BATCH_SIZE = 12;
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

  const pickFirstDate = (...values) => {
    for (const value of values) {
      const d = parseLooseDate(value);
      if (d) return d;
    }
    return null;
  };

  const buildTimeMeta = (card) => {
    const cardDate = parseLooseDate(card.date);
    const submitted = pickFirstDate(card._submitted_at, card._created_at, card.created_at, card.date, card.created);
    const modified = pickFirstDate(card._effective_at, card._modified_at, card.modified_at, card._modified_date, card.updated_at, card.updated, card.date, card._created_at, card.created_at);
    const hasExplicitCardTime = cardDate && getDatePrecision(cardDate) !== 'date';
    const effective = hasExplicitCardTime ? cardDate : (modified || submitted);
    const sortTs = Number(card._sort_ts);
    const fallbackTs = effective ? effective.getTime() : 0;
    const normalizedSortTs = hasExplicitCardTime
      ? fallbackTs
      : (Number.isFinite(sortTs) && sortTs > 0
        ? (sortTs > 1e15 ? Math.floor(sortTs / 1e6) : sortTs)
        : fallbackTs);
    const label = hasExplicitCardTime
      ? '提交'
      : (modified && submitted && modified.getTime() > submitted.getTime() ? '修改' : '提交');
    return {
      label,
      date: formatDate(effective),
      clock: formatClock(effective),
      full: formatDateTime(effective),
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

  const normalizeCard = (card, order) => ({
    ...card,
    __order: order,
    __time: buildTimeMeta(card),
    __href: card.path || `${card.slug || ''}.html`,
    __title: card.title || card.slug || '未命名',
    __category: String(card.category || 'misc').toUpperCase(),
    __desc: card.desc || card.note || '',
    __tags: Array.isArray(card.tags) ? card.tags : [],
    __kind: buildKindLabel(card),
    __glyph: buildLeadGlyph(card)
  });

  const root = document.getElementById('app');
  if (!root) return;

  createApp({
    setup() {
      const version = ref('加载中…');
      const loading = ref(true);
      const loadError = ref('');
      const allCards = ref([]);
      const searchQuery = ref('');
      const selectedTags = ref([]);
      const tagsExpanded = ref(false);
      const visibleCount = ref(BATCH_SIZE);
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

      const tagCounter = computed(() => {
        const map = new Map();
        normalizedCards.value.forEach((card) => {
          card.__tags.forEach((tag) => map.set(tag, (map.get(tag) || 0) + 1));
        });
        return map;
      });

      const sortedTags = computed(() => [...tagCounter.value.entries()]
        .sort((a, b) => (b[1] - a[1]) || String(a[0]).localeCompare(String(b[0]), 'zh-Hans-CN'))
        .map(([tag, count]) => ({ tag, count })));

      const hotTags = computed(() => sortedTags.value.slice(0, 3));

      const filteredCards = computed(() => {
        const q = searchQuery.value.trim().toLowerCase();
        return normalizedCards.value.filter((card) => {
          const matchTag = !selectedTags.value.length || selectedTags.value.some((tag) => card.__tags.includes(tag));
          const matchSearch = !q ||
            String(card.__title).toLowerCase().includes(q) ||
            String(card.slug || '').toLowerCase().includes(q) ||
            card.__tags.some((tag) => String(tag).toLowerCase().includes(q)) ||
            String(card.category || '').toLowerCase().includes(q);
          return matchTag && matchSearch;
        });
      });

      const visibleCards = computed(() => filteredCards.value.slice(0, visibleCount.value));
      const shownCount = computed(() => filteredCards.value.length);
      const renderedCount = computed(() => visibleCards.value.length);
      const hasMore = computed(() => renderedCount.value < shownCount.value);
      const countLineText = computed(() => `共 ${totalCount.value} 张信息卡 · 命中 ${shownCount.value} 张 · 已渲染 ${renderedCount.value} 张 · 严格时间降序`);
      const listProgressText = computed(() => hasMore.value ? `loaded ${renderedCount.value}/${shownCount.value}` : `loaded all ${renderedCount.value}`);
      const loadingNoteText = computed(() => {
        if (loadError.value) return '';
        if (!shownCount.value) return '当前筛选无结果';
        if (isAutoLoading.value && hasMore.value) return '接近底部时自动追加下一批…';
        if (hasMore.value) return '滚动到底部可自动加载，或点击按钮继续';
        return '已加载当前结果集全部条目';
      });

      const posterSummary = computed(() => `LATEST FIRST · ${shownCount.value} ACTIVE RESULTS · ${categoryCount.value} CATEGORIES`);
      const activeTagClass = (tag) => selectedTags.value.includes(tag);

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

      const collapseTagPanel = () => {
        tagsExpanded.value = false;
      };

      const toggleTag = (tag) => {
        if (!tag) {
          selectedTags.value = [];
        } else if (selectedTags.value.includes(tag)) {
          selectedTags.value = selectedTags.value.filter((item) => item !== tag);
        } else {
          selectedTags.value = [...selectedTags.value, tag];
        }
        collapseTagPanel();
        resetVisibleCount();
        nextTick(() => {
          measureTagCollapse();
          ensureAutoFill();
        });
      };

      const clearSelectedTags = () => {
        selectedTags.value = [];
        collapseTagPanel();
        resetVisibleCount();
        nextTick(() => {
          measureTagCollapse();
          ensureAutoFill();
        });
      };

      const removeTag = (tag) => {
        selectedTags.value = selectedTags.value.filter((item) => item !== tag);
        resetVisibleCount();
        nextTick(() => {
          measureTagCollapse();
          ensureAutoFill();
        });
      };

      const toggleTagsExpanded = () => {
        tagsExpanded.value = !tagsExpanded.value;
        nextTick(measureTagCollapse);
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

      const fetchIndex = async () => {
        const response = await fetch(`./_index.yaml?t=${Date.now()}`, { cache: 'no-store' });
        const text = await response.text();
        const index = jsyaml.load(text);
        const cards = Array.isArray(index?.cards) ? index.cards : [];
        allCards.value = cards;
      };

      const onResize = () => {
        window.requestAnimationFrame(() => {
          measureTagCollapse();
          ensureAutoFill();
        });
      };

      onMounted(async () => {
        window.addEventListener('resize', onResize);
        await fetchVersion();
        try {
          await fetchIndex();
          resetVisibleCount();
        } catch (error) {
          console.error(error);
          loadError.value = '加载索引失败，请稍后刷新';
        } finally {
          loading.value = false;
        }
        await nextTick();
        measureTagCollapse();
        ensureAutoFill();
        setupObserver();
      });

      Vue.watch([filteredCards, tagsExpanded, selectedTags], async () => {
        await nextTick();
        measureTagCollapse();
        ensureAutoFill();
        setupObserver();
      }, { deep: true });

      const renderTagLabel = (tag) => `${tag.tag} (${tag.count})`;
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
        selectedTags,
        tagsExpanded,
        visibleCards,
        sortedTags,
        hotTags,
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
        activeTagClass,
        onSearchInput,
        toggleTag,
        clearSelectedTags,
        removeTag,
        toggleTagsExpanded,
        loadMore,
        renderTagLabel,
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
                  <p class="poster-copy compact">公开信息卡索引，按最新时间优先排列，支持标签并集筛选与增量浏览。</p>
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

          <section class="tag-stack">
            <div class="tag-stack-top">
              <div class="tag-stack-title-wrap">
                <div class="tag-stack-kicker">archive / taxonomy / multi-select</div>
                <div class="tag-stack-title">标签并集筛选</div>
              </div>
              <div class="tag-stack-note">默认显示 3 行半，支持多选并集；最新排序始终置顶。</div>
            </div>

            <div v-if="selectedTags.length" class="current-filter banded">
              <span class="stack-label">当前条件</span>
              <span class="selected-pills">
                <span v-for="tag in selectedTags" :key="tag" class="pill pill-stack">
                  {{ tag }}
                  <button type="button" aria-label="移除标签" @click="removeTag(tag)">×</button>
                </span>
              </span>
              <button type="button" class="clear-all" @click="clearSelectedTags">清空</button>
            </div>

            <div class="tag-row tag-row-layered">
              <div class="tag-viewport-wrap" :class="{ expanded: tagsExpanded, collapsed: tagNeedsCollapse && !tagsExpanded }">
                <div ref="tagViewportRef" class="tag-viewport layered" :style="{ maxHeight: collapsedMaxHeight }">
                  <div ref="tagFilterRef" class="tag-filter">
                    <button
                      :class="{ active: !selectedTags.length }"
                      type="button"
                      @click="clearSelectedTags"
                    >
                      全部
                    </button>
                    <button
                      v-for="tag in sortedTags"
                      :key="tag.tag"
                      :class="{ active: activeTagClass(tag.tag) }"
                      type="button"
                      @click="toggleTag(tag.tag)"
                    >
                      {{ renderTagLabel(tag) }}
                    </button>
                  </div>
                </div>
                <button
                  v-if="tagNeedsCollapse"
                  ref="tagToggleRef"
                  class="tag-toggle-mini"
                  :class="{ active: tagsExpanded }"
                  type="button"
                  @click.stop="toggleTagsExpanded"
                  :aria-label="tagsExpanded ? '收起标签' : '展开标签'"
                >
                  {{ tagsExpanded ? '−' : '+' }}
                </button>
                <div
                  v-if="tagNeedsCollapse && !tagsExpanded"
                  class="tag-fade"
                  aria-hidden="true"
                  @click.stop.prevent
                ></div>
              </div>
            </div>
          </section>

          <section class="list-header premium">
            <div class="count-line">{{ loadError || countLineText }}</div>
            <div class="list-progress">{{ listProgressText }}</div>
          </section>

          <section v-if="loadError" class="empty-state">{{ loadError }}</section>
          <section v-else-if="loading" class="empty-state">加载索引中…</section>
          <section v-else-if="!shownCount" class="empty-state">无匹配结果</section>
          <section v-else class="cards premium-cards">
            <article v-for="card in visibleCards" :key="card.slug || card.__order" class="card-row premium-row">
              <div class="card-rail">
                <div class="rail-top">
                  <span class="rail-serial">{{ serialOf(card) }}</span>
                  <span class="rail-glyph">{{ card.__glyph }}</span>
                </div>
                <div class="rail-middle">
                  <span class="rail-kind">{{ card.__kind }}</span>
                  <span class="rail-state">{{ card.__time.label }}</span>
                </div>
                <div class="rail-bottom">
                  <span class="rail-line"></span>
                  <span class="rail-tail">↗</span>
                </div>
              </div>
              <div class="card-body premium-body">
                <div class="entry-topline">
                  <span class="entry-time">{{ card.__time.full }}</span>
                  <span class="entry-cat">{{ card.__category }}</span>
                </div>
                <h2><a :href="card.__href">{{ card.__title }}</a></h2>
                <div v-if="card.__desc" class="desc">{{ card.__desc }}</div>
                <div class="card-meta premium-meta">
                  <span v-for="tag in card.__tags" :key="tag" class="tag-chip">{{ tag }}</span>
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
