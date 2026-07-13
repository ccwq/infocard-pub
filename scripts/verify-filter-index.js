#!/usr/bin/env node
/**
 * verify-filter-index.js — check if a card is correctly indexed for homepage filter
 *
 * Usage:
 *   node scripts/verify-filter-index.js --slug <slug>
 *   node scripts/verify-filter-index.js --slug <slug> --verbose
 *   node scripts/verify-filter-index.js --all   # audit all cards
 *
 * This script answers the core question:
 *   "Will this card be counted and filterable by the homepage facets?"
 *
 * Checks:
 *   1. Card exists in _index.yaml / index.html injected data
 *   2. taxonomy structure is complete
 *   3. Required dims (source/style/risk/content_type) are non-empty
 *   4. Each taxonomy value is within _taxonomy.yaml allowed values
 *   5. Simulates filter: card would appear when its facet values are selected
 */

const path = require('path');
const fs = require('fs');
const {
  ROOT, DOCS,
  validateTaxonomy, getAllAllowedValues,
  REQUIRED_NON_EMPTY,
} = require('./taxonomy-lib');

const SLUG = (() => {
  const idx = process.argv.indexOf('--slug');
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : null;
})();
const ALL_MODE = process.argv.includes('--all');
const VERBOSE = process.argv.includes('--verbose');

// ---------------------------------------------------------------------------
// Load index data
// ---------------------------------------------------------------------------

function loadIndexYaml() {
  const yaml = require('../assets/home/vendor/js-yaml.min.js');
  const p = path.join(ROOT, '_index.yaml');
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  try {
    const data = yaml.load(raw, { schema: yaml.FAILSAFE_SCHEMA });
    return data && data.cards ? data.cards : null;
  } catch {
    return null;
  }
}

function loadInjectedIndexHtml() {
  const yaml = require('../assets/home/vendor/js-yaml.min.js');
  const p = path.join(ROOT, 'index.html');
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const m = raw.match(/<script id="home-index-data" type="application\/json">\s*([\s\S]+?)\s*<\/script>/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Normalize facet (mirrors index.js)
// ---------------------------------------------------------------------------

function normalizeFacetArray(value) {
  return Array.isArray(value)
    ? [...new Set(value.map(v => String(v || '').trim()).filter(Boolean))]
    : [];
}

// ---------------------------------------------------------------------------
// Simulate filter (mirrors index.js filteredCards logic)
// ---------------------------------------------------------------------------

const PRIMARY_DIMENSIONS = [
  { key: 'topics' },
  { key: 'tech_stack' },
  { key: 'tool_types' },
  { key: 'stages' },
  { key: 'interaction' },
  { key: 'content_type' },
];
const ADVANCED_DIMENSIONS = [
  { key: 'source' },
  { key: 'style' },
  { key: 'risk' },
];
const ALL_DIMENSIONS = [...PRIMARY_DIMENSIONS, ...ADVANCED_DIMENSIONS];

function normalizeCard(card) {
  const taxonomy = card.taxonomy && typeof card.taxonomy === 'object' ? card.taxonomy : {};
  return {
    ...card,
    __facets: {
      topics: normalizeFacetArray(taxonomy.topics),
      tech_stack: normalizeFacetArray(taxonomy.tech_stack),
      tool_types: normalizeFacetArray(taxonomy.tool_types),
      stages: normalizeFacetArray(taxonomy.stages),
      interaction: normalizeFacetArray(taxonomy.interaction),
      content_type: normalizeFacetArray(taxonomy.content_type),
      source: normalizeFacetArray(taxonomy.source),
      style: normalizeFacetArray(
        taxonomy.style && taxonomy.style.length
          ? taxonomy.style
          : (card.style ? [card.style] : [])
      ),
      risk: normalizeFacetArray(taxonomy.risk),
    },
  };
}

function cardMatchesFacets(card, selectedFacets) {
  return ALL_DIMENSIONS.every(dim => {
    const selected = selectedFacets[dim.key] || [];
    if (!selected.length) return true;
    const values = card.__facets[dim.key] || [];
    return selected.some(v => values.includes(v));
  });
}

// ---------------------------------------------------------------------------
// Filter test: for each taxonomy value, does card appear?
// ---------------------------------------------------------------------------

function testCardFilterability(card) {
  const results = [];
  const allPassed = { topics: true, tech_stack: true, tool_types: true, stages: true, interaction: true,
    content_type: true, source: true, style: true, risk: true };

  for (const dim of ALL_DIMENSIONS) {
    const vals = card.__facets[dim.key] || [];
    if (vals.length === 0) {
      results.push({ dim: dim.key, status: 'skip', note: 'no values, not tested' });
      continue;
    }
    for (const val of vals) {
      const selectedFacets = { [dim.key]: [val] };
      const match = cardMatchesFacets(card, selectedFacets);
      if (!match) {
        results.push({ dim: dim.key, value: val, status: 'FAIL', note: 'card not found when selecting this facet' });
        allPassed[dim.key] = false;
      } else {
        results.push({ dim: dim.key, value: val, status: 'PASS', note: 'card appears when this facet is selected' });
      }
    }
  }

  return { results, allPassed };
}

// ---------------------------------------------------------------------------
// Verify single card
// ---------------------------------------------------------------------------

function verifyCard(cards, slug) {
  const card = cards.find(c => c.slug === slug || c.path.includes(slug));
  if (!card) {
    return { ok: false, error: `slug "${slug}" not found in index` };
  }

  const slug_found = card.slug;

  // check taxonomy
  const taxonomy = card.taxonomy;
  if (!taxonomy || typeof taxonomy !== 'object') {
    return { ok: false, slug: slug_found, error: 'taxonomy missing in index entry' };
  }

  // check all dims
  const dims = ['topics', 'tech_stack', 'tool_types', 'stages', 'interaction', 'content_type', 'source', 'style', 'risk'];
  const dimIssues = [];
  const requiredIssues = [];
  for (const d of dims) {
    if (!Array.isArray(taxonomy[d])) {
      dimIssues.push(`${d}: not an array`);
    } else if (taxonomy[d].length === 0 && REQUIRED_NON_EMPTY.includes(d)) {
      requiredIssues.push(`${d}: required but empty`);
    }
  }

  // validate values against spec
  const specIssues = validateTaxonomy(taxonomy).filter(i => i.type === 'error');

  if (dimIssues.length > 0 || requiredIssues.length > 0 || specIssues.length > 0) {
    return {
      ok: false, slug: slug_found,
      dimIssues, requiredIssues, specIssues,
    };
  }

  // simulate filter
  const normalized = normalizeCard(card);
  const filterResult = testCardFilterability(normalized);
  const filterPassed = Object.values(filterResult.allPassed).every(Boolean);

  return {
    ok: filterPassed && requiredIssues.length === 0,
    slug: slug_found,
    taxonomy,
    filterResult,
    filterPassed,
    requiredIssues,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const yamlCards = loadIndexYaml();
  const htmlCards = loadInjectedIndexHtml();

  // prefer _index.yaml (authoritative), fall back to injected html
  const cards = yamlCards || (htmlCards && htmlCards.cards) || [];

  if (cards.length === 0) {
    console.error('[ERROR] no cards found in _index.yaml or index.html');
    console.error('Run "npm run build" first to generate the index.');
    process.exit(1);
  }

  if (ALL_MODE) {
    let pass = 0;
    let fail = 0;
    for (const card of cards) {
      const res = verifyCard(cards, card.slug);
      const rel = card.path || card.slug;
      if (res.ok) {
        pass++;
        console.log(`[PASS] ${rel}`);
      } else {
        fail++;
        console.error(`[FAIL] ${rel}: ${res.error || res.requiredIssues?.map(i => i).join(', ') || 'filterability issue'}`);
        if (res.filterResult) {
          for (const r of res.filterResult.results) {
            if (r.status === 'FAIL') {
              console.error(`       filter FAIL: ${r.dim}="${r.value}"`);
            }
          }
        }
      }
    }
    console.log(`\n--- filter audit ---`);
    console.log(`total: ${cards.length}`);
    console.log(`pass: ${pass}`);
    console.log(`fail: ${fail}`);
    process.exit(fail > 0 ? 1 : 0);
    return;
  }

  if (!SLUG) {
    console.error('Usage: node scripts/verify-filter-index.js --slug <slug> [--verbose]');
    console.error('       node scripts/verify-filter-index.js --all');
    process.exit(1);
  }

  const res = verifyCard(cards, SLUG);

  if (!res.ok) {
    console.error(`[FAIL] ${res.slug || SLUG}`);
    if (res.error) {
      console.error(`  ${res.error}`);
    }
    if (res.dimIssues) {
      for (const i of res.dimIssues) console.error(`  dim: ${i}`);
    }
    if (res.requiredIssues) {
      for (const i of res.requiredIssues) console.error(`  required: ${i}`);
    }
    if (res.specIssues) {
      for (const i of res.specIssues) console.error(`  spec: ${i.field}: ${i.message}`);
    }
    process.exit(1);
  }

  console.log(`[PASS] ${res.slug}`);
  console.log('  taxonomy dims:');
  const dims = ['topics', 'tech_stack', 'tool_types', 'stages', 'interaction', 'content_type', 'source', 'style', 'risk'];
  for (const d of dims) {
    const vals = res.taxonomy[d] || [];
    const status = vals.length > 0 ? '✓' : '○';
    console.log(`    ${status} ${d}: ${vals.length > 0 ? vals.join(', ') : '(empty)'}`);
  }

  console.log('  filterability:');
  for (const r of res.filterResult.results) {
    const icon = r.status === 'PASS' ? '✓' : (r.status === 'skip' ? '○' : '✗');
    console.log(`    ${icon} ${r.dim}${r.value ? `="${r.value}"` : ''}: ${r.status}${r.note !== r.status ? ` (${r.note})` : ''}`);
  }

  if (!res.filterPassed) {
    console.error('\n[ERROR] card would be invisible for some filter selections');
    process.exit(1);
  } else {
    console.log('\n[OK] card is correctly indexed and filterable');
    process.exit(0);
  }
}

main();
