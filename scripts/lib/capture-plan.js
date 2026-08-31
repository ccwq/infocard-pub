'use strict';

const DEFAULT_CAPTURE_PLAN = Object.freeze({
  desktop: ['hero', 'body', 'footer'],
  mobile: ['hero', 'body', 'footer'],
  geometry: true,
});

const EXTRA_REGION_TRIGGERS = Object.freeze(['tables', 'code_blocks', 'sticky_elements', 'suspected_clipping']);
const BASE_REGIONS = new Set(DEFAULT_CAPTURE_PLAN.desktop);

function createCapturePlan(input = {}) {
  for (const viewport of ['desktop', 'mobile']) {
    if (input[viewport] !== undefined) {
      if (!Array.isArray(input[viewport]) || input[viewport].some((region) => !BASE_REGIONS.has(region)) || new Set(input[viewport]).size !== input[viewport].length || input[viewport].length > 3) {
        throw new TypeError(`${viewport} regions must be unique hero/body/footer entries`);
      }
    }
  }
  const plan = {
    desktop: Array.isArray(input.desktop) && input.desktop.length ? [...input.desktop] : [...DEFAULT_CAPTURE_PLAN.desktop],
    mobile: Array.isArray(input.mobile) && input.mobile.length ? [...input.mobile] : [...DEFAULT_CAPTURE_PLAN.mobile],
    geometry: input.geometry !== false,
  };
  const triggers = Array.isArray(input.triggers) ? input.triggers.filter((item) => EXTRA_REGION_TRIGGERS.includes(item)) : [];
  if (triggers.length) plan.extra_regions = triggers;
  return plan;
}

function validateCapturePlan(plan) {
  const errors = [];
  const validRegions = (value) => Array.isArray(value) && value.length > 0 && value.length <= 3 && value.every((region) => BASE_REGIONS.has(region)) && new Set(value).size === value.length;
  for (const viewport of ['desktop', 'mobile']) {
    if (!plan || !validRegions(plan[viewport])) errors.push(`${viewport} regions must be unique hero/body/footer entries`);
  }
  if (!plan || plan.geometry !== true) errors.push('geometry must be enabled');
  return { valid: errors.length === 0, errors };
}

module.exports = { DEFAULT_CAPTURE_PLAN, EXTRA_REGION_TRIGGERS, createCapturePlan, validateCapturePlan };
