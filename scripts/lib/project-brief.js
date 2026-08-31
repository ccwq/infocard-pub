'use strict';

const SECTIONS = Object.freeze([
  'hero', 'summary', 'core_capabilities', 'tech_stack', 'usage',
  'use_cases', 'risk_boundary', 'sources',
]);

function issue(field, message) { return { field, message }; }

function validateProjectBrief(brief) {
  const errors = [];
  if (!brief || typeof brief !== 'object' || Array.isArray(brief)) return { valid: false, errors: [issue('brief', 'must be an object')] };
  if (!['light', 'full'].includes(brief.route)) errors.push(issue('route', 'must be light or full'));
  for (const section of SECTIONS) {
    const value = brief[section];
    const valid = section === 'hero' || section === 'summary' || section === 'risk_boundary'
      ? typeof value === 'string' && value.trim() !== ''
      : Array.isArray(value) && value.length > 0;
    if (!valid) errors.push(issue(section, section === 'hero' || section === 'summary' || section === 'risk_boundary' ? 'must be a non-empty string' : 'must be a non-empty array'));
  }
  if (!brief.source_boundary || typeof brief.source_boundary.canonical !== 'string' || !brief.source_boundary.canonical.trim()) errors.push(issue('source_boundary.canonical', 'canonical source is required'));
  if (Array.isArray(brief.sources) && brief.sources.some((source) => typeof source !== 'string' || !source.trim())) errors.push(issue('sources', 'each source must be a non-empty string'));
  if (brief.source_boundary && brief.source_boundary.canonical && Array.isArray(brief.sources) && !brief.sources.includes(brief.source_boundary.canonical)) errors.push(issue('source_boundary.canonical', 'canonical source must appear in sources'));
  return { valid: errors.length === 0, errors };
}

function normalizeProjectBrief(input = {}) {
  return {
    version: 1,
    route: input.route || 'light',
    hero: String(input.hero || input.title || '').trim(),
    summary: String(input.summary || '').trim(),
    core_capabilities: Array.isArray(input.core_capabilities) ? input.core_capabilities : [],
    tech_stack: Array.isArray(input.tech_stack) ? input.tech_stack : [],
    usage: Array.isArray(input.usage) ? input.usage : [],
    use_cases: Array.isArray(input.use_cases) ? input.use_cases : [],
    risk_boundary: String(input.risk_boundary || '仅整理来源中可确认的信息，不扩展未证实结论。').trim(),
    sources: Array.isArray(input.sources) ? input.sources : [],
    source_boundary: input.source_boundary || { canonical: null, discovery: null },
  };
}

module.exports = { SECTIONS, validateProjectBrief, normalizeProjectBrief };
