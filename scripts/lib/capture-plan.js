'use strict';

const DEFAULT_CAPTURE_PLAN = Object.freeze({
  desktop: ['hero', 'complex'],
  mobile: ['hero', 'complex'],
  geometry: true,
  complex_region: Object.freeze({ name: 'body', reason: 'fallback_body_no_risk_signals', signals: [] }),
  conditional_regions: Object.freeze([]),
});

const RISK_SIGNALS = Object.freeze([
  ['code_blocks', ['code', 'code_blocks', 'pre'], 'code_blocks'],
  ['tables', ['table', 'tables', 'matrix'], 'tables_or_matrix'],
  ['risk_panels', ['risk', 'risk_panel', 'risk_panels'], 'risk_panels'],
  ['dense_grids', ['grid', 'dense_grid', 'dense_grids'], 'dense_grids'],
  ['sticky_elements', ['sticky', 'sticky_element', 'sticky_elements'], 'sticky_elements'],
  ['long_page', ['long_page', 'long_text', 'long_content'], 'long_page_or_text'],
  ['suspected_clipping', ['clipping', 'suspected_clipping', 'overflow'], 'suspected_clipping'],
]);

const EXTRA_REGION_TRIGGERS = Object.freeze(RISK_SIGNALS.map(([key]) => key));
const ALLOWED_REGIONS = new Set(['hero', 'complex']);

function normalizeSignals(input) {
  const values = [];
  if (Array.isArray(input.signals)) values.push(...input.signals);
  if (Array.isArray(input.triggers)) values.push(...input.triggers);
  if (input.features && typeof input.features === 'object') {
    for (const [key, value] of Object.entries(input.features)) if (value) values.push(key);
  }
  const aliases = new Map(RISK_SIGNALS.flatMap(([, names, canonical]) => names.map((name) => [name, canonical])));
  return [...new Set(values.map((value) => aliases.get(value)).filter(Boolean))]
    .sort((a, b) => RISK_SIGNALS.findIndex(([, , reason]) => reason === a) - RISK_SIGNALS.findIndex(([, , reason]) => reason === b));
}

function selectComplexRegion(input = {}) {
  const signals = normalizeSignals(input);
  if (signals.length === 0) return { name: 'body', reason: 'fallback_body_no_risk_signals', signals: [] };
  return { name: 'body', reason: `risk_signal_${signals[0]}`, signals };
}

function validateRegions(value) {
  return Array.isArray(value)
    && value.length === 2
    && value[0] === 'hero'
    && value[1] === 'complex'
    && new Set(value).size === value.length;
}

function createCapturePlan(input = {}) {
  for (const viewport of ['desktop', 'mobile']) {
    if (input[viewport] !== undefined && !validateRegions(input[viewport])) {
      throw new TypeError(`${viewport} regions must be exactly hero/complex`);
    }
  }
  const complexRegion = selectComplexRegion(input);
  const conditionalRegions = [];
  if (complexRegion.signals.includes('sticky_elements')) conditionalRegions.push('sticky');
  if (complexRegion.signals.includes('suspected_clipping')) conditionalRegions.push('footer_or_clipping');
  return {
    desktop: ['hero', 'complex'],
    mobile: ['hero', 'complex'],
    geometry: input.geometry !== false,
    complex_region: complexRegion,
    conditional_regions: conditionalRegions,
  };
}

function validateCapturePlan(plan) {
  const errors = [];
  for (const viewport of ['desktop', 'mobile']) {
    if (!plan || !validateRegions(plan[viewport])) errors.push(`${viewport} regions must be exactly hero/complex`);
  }
  if (!plan || plan.geometry !== true) errors.push('geometry must be enabled');
  const selected = plan && plan.complex_region;
  if (!selected || selected.name !== 'body' || typeof selected.reason !== 'string' || !Array.isArray(selected.signals)) {
    errors.push('complex_region must include body, stable reason, and signals');
  }
  if (!plan || !Array.isArray(plan.conditional_regions)) errors.push('conditional_regions must be an array');
  return { valid: errors.length === 0, errors };
}

module.exports = { DEFAULT_CAPTURE_PLAN, EXTRA_REGION_TRIGGERS, ALLOWED_REGIONS, createCapturePlan, selectComplexRegion, validateCapturePlan };
