'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { registeredThemes: registeredThemesFromRegistry } = require('../../../../../scripts/lib/theme-registry');

const CAPABILITIES = [
  'long_title',
  'dense_content',
  'tables',
  'code_blocks',
  'process_blocks',
  'imagery',
  'risk_panels',
  'mobile_layout',
];

const STYLE_SKILL_ALIASES = Object.freeze({
  blue: 'blue-technical-manual',
  black: 'black-head',
  main: 'main',
  'paper-warm': 'paper-warm',
});

function styleSkillName(theme) {
  const slug = STYLE_SKILL_ALIASES[theme] || theme;
  return `infocard-${slug}-style`;
}

function styleSkillPath(theme) {
  const slug = STYLE_SKILL_ALIASES[theme] || theme;
  return `infocard-styles/${styleSkillName(theme)}/SKILL.md`;
}

// These defaults are intentionally conservative only where a theme family is
// known to be illustration-first. Callers can provide a project-specific
// capability map when a theme has been visually verified for more modules.
const DEFAULT_CAPABILITIES = Object.freeze({
  crayon: { code_blocks: false, tables: false },
  q: { code_blocks: false, tables: false },
  scrapbook: { code_blocks: false, tables: false },
  pixelstack: { code_blocks: false, tables: false },
});

const STYLE_ALIASES = Object.freeze({
  'blue-technical-manual': 'blue',
  'blue-technical-manual-style': 'blue',
  'infocard-blue-technical-manual-style': 'blue',
  'black-head': 'black',
  'black-head-style': 'black',
  'infocard-black-head-style': 'black',
});

function registeredThemes(projectRoot) {
  return registeredThemesFromRegistry(projectRoot);
}

function normalizeThemeSlug(value, projectRoot) {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;
  const registered = registeredThemes(projectRoot);
  if (registered.has(raw)) return raw;
  const alias = STYLE_ALIASES[raw]
    || (raw.startsWith('infocard-') && raw.endsWith('-style')
      ? raw.slice('infocard-'.length, -'-style'.length)
      : raw.endsWith('-style') ? raw.slice(0, -'-style'.length) : null);
  return alias && registered.has(alias) ? alias : null;
}

function capabilitiesFor(theme, capabilityMap = {}) {
  const overrides = capabilityMap[theme] || {};
  const defaults = DEFAULT_CAPABILITIES[theme] || {};
  return Object.fromEntries(CAPABILITIES.map((key) => [
    key,
    overrides[key] !== undefined ? Boolean(overrides[key]) : defaults[key] !== false,
  ]));
}

function missingCapabilities(theme, requiredCapabilities, capabilityMap) {
  const capabilities = capabilitiesFor(theme, capabilityMap);
  return requiredCapabilities.filter((key) => !CAPABILITIES.includes(key) || !capabilities[key]);
}

function stableNumber(seed, value) {
  let hash = 2166136261;
  for (const char of `${seed}:${value}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function chooseWeighted(themes, weights, seed) {
  const total = themes.reduce((sum, theme) => sum + weights[theme], 0);
  const cursor = stableNumber(seed, themes.join('|')) * total;
  let accumulated = 0;
  for (const theme of themes) {
    accumulated += weights[theme];
    if (cursor < accumulated) return theme;
  }
  return themes[themes.length - 1];
}

function validateSelectionWeights(themes, weights) {
  const finalCandidates = new Set(themes);
  for (const [theme, weight] of Object.entries(weights)) {
    if (!finalCandidates.has(theme)) {
      throw new TypeError(`selection weight for ${theme} must target a final candidate theme`);
    }
    if (typeof weight !== 'number' || !Number.isFinite(weight) || weight < 0) {
      throw new TypeError(`selection weight for ${theme} must be a finite non-negative number`);
    }
  }
}

function normalizeOverride(userOverride) {
  if (typeof userOverride === 'string') return { requested: userOverride };
  return userOverride && typeof userOverride === 'object' ? userOverride : { requested: null };
}

function selectTheme({
  projectRoot,
  contentType,
  contentSubtype = null,
  contentShape,
  requiredCapabilities = [],
  candidateThemes,
  selectionWeights = {},
  excludedThemes = [],
  seed,
  userOverride,
  capabilityMap = {},
}) {
  const registered = registeredThemes(projectRoot);
  const excluded = new Map(excludedThemes.map((item) => [
    typeof item === 'string' ? item : item.theme,
    typeof item === 'string' ? 'excluded by caller' : item.reason,
  ]));
  // Decision records use registered bare slugs. Alias normalization is kept
  // for sidecar declarations only, so a style skill name cannot silently
  // become a user override or a second routing input.
  const pool = [...new Set(candidateThemes || [...registered])];
  const requested = normalizeOverride(userOverride).requested || null;
  if (requested && registered.has(requested) && !pool.includes(requested)) pool.push(requested);

  const recordExclusions = [];
  const candidates = [];
  for (const theme of pool) {
    if (!registered.has(theme)) {
      recordExclusions.push({ theme, reason: 'theme is not registered in theme/*.html' });
    } else if (excluded.has(theme)) {
      recordExclusions.push({ theme, reason: excluded.get(theme) || 'excluded by caller' });
    } else {
      const missing = missingCapabilities(theme, requiredCapabilities, capabilityMap);
      if (missing.length) recordExclusions.push({ theme, reason: `missing capabilities: ${missing.join(', ')}` });
      else candidates.push(theme);
    }
  }

  validateSelectionWeights(candidates, selectionWeights);
  const weights = Object.fromEntries(candidates.map((theme) => [
    theme,
    Object.prototype.hasOwnProperty.call(selectionWeights, theme) ? selectionWeights[theme] : 1,
  ]));
  const overrideAccepted = Boolean(requested && candidates.includes(requested));
  let selected = overrideAccepted ? requested : null;
  if (requested && !overrideAccepted) {
    const reason = !registered.has(requested)
      ? 'requested theme is not registered'
      : 'requested theme does not satisfy required capabilities or is excluded';
    recordExclusions.push({ theme: requested, reason });
  }
  if (!selected && candidates.length && Object.values(weights).some((weight) => weight > 0)) {
    selected = chooseWeighted(candidates, weights, String(seed || 'default'));
  }

  return {
    version: 2,
    content_type: contentType,
    content_subtype: contentSubtype,
    content_shape: contentShape,
    required_capabilities: [...requiredCapabilities],
    candidate_themes: candidates,
    excluded_themes: recordExclusions,
    selection_weights: weights,
    seed: String(seed || ''),
    selected_theme: selected,
    style_skill: selected ? {
      name: styleSkillName(selected),
      path: styleSkillPath(selected),
    } : null,
    user_override: {
      requested,
      accepted: overrideAccepted,
      reason: requested ? (overrideAccepted ? 'registered and capability-compatible' : 'rejected by registration/capability gate') : null,
    },
  };
}

function validateThemeDecision(decision, {
  projectRoot,
  capabilityMap = {},
  html,
  sidecarStyle,
} = {}) {
  const errors = [];
  const add = (field, message) => errors.push({ field, message });
  if (!decision || typeof decision !== 'object' || Array.isArray(decision)) {
    return { valid: false, errors: [{ field: 'record', message: 'must be a JSON object' }] };
  }
  const registered = projectRoot ? registeredThemes(projectRoot) : new Set();
  const required = Array.isArray(decision.required_capabilities) ? decision.required_capabilities : [];
  const candidates = Array.isArray(decision.candidate_themes) ? decision.candidate_themes : null;
  if (!candidates) add('candidate_themes', 'must be an array');
  else {
    for (const theme of candidates) {
      if (typeof theme !== 'string' || !registered.has(theme)) add('candidate_themes', `unregistered theme: ${theme}`);
      const missing = missingCapabilities(theme, required, capabilityMap);
      if (missing.length) add('candidate_themes', `${theme} misses: ${missing.join(', ')}`);
    }
  }
  if (typeof decision.seed !== 'string' || !decision.seed.trim()) add('seed', 'must be a non-empty string');
  if (!candidates || typeof decision.selected_theme !== 'string' || !candidates.includes(decision.selected_theme)) {
    add('selected_theme', 'must be a candidate theme');
  }
  if (decision.version >= 2) {
    const styleSkill = decision.style_skill;
    const declaredStyleSkillName = typeof styleSkill?.name === 'string' ? styleSkill.name : null;
    const expectedSkillName = typeof decision.selected_theme === 'string'
      ? styleSkillName(decision.selected_theme)
      : null;
    if (!styleSkill || typeof styleSkill !== 'object' || Array.isArray(styleSkill)) {
      add('style_skill', 'must bind the selected theme to a concrete style skill');
    } else {
      if (declaredStyleSkillName !== expectedSkillName) add('style_skill.name', `must equal ${expectedSkillName}`);
      if (typeof styleSkill.path !== 'string' || styleSkill.path !== styleSkillPath(decision.selected_theme)) {
        add('style_skill.path', 'must point to the selected theme style skill');
      }
      if (projectRoot && styleSkill.path && !fs.existsSync(path.resolve(projectRoot, '.agents/skills', styleSkill.path))) {
        add('style_skill.path', 'style skill file does not exist');
      }
    }
  }
  const excluded = Array.isArray(decision.excluded_themes) ? decision.excluded_themes : [];
  for (const item of excluded) {
    if (!item || typeof item.theme !== 'string' || typeof item.reason !== 'string' || !item.reason.trim()) add('excluded_themes', 'each item needs theme and non-empty reason');
    if (candidates && item && candidates.includes(item.theme)) add('excluded_themes', `${item.theme} cannot be both excluded and candidate`);
  }
  const weights = decision.selection_weights;
  if (!weights || typeof weights !== 'object' || Array.isArray(weights)) add('selection_weights', 'must be an object');
  else {
    for (const [theme, weight] of Object.entries(weights)) {
      if (!candidates || !candidates.includes(theme)) add('selection_weights', `${theme} is not a candidate`);
      if (typeof weight !== 'number' || !Number.isFinite(weight) || weight < 0) add('selection_weights', `${theme} must be a finite non-negative number`);
    }
    if (!Object.values(weights).some((weight) => typeof weight === 'number' && weight > 0)) add('selection_weights', 'at least one weight must be positive');
  }
  const override = decision.user_override;
  if (!override || typeof override !== 'object') add('user_override', 'must be an object');
  else if (override.requested != null) {
    const accepted = candidates && candidates.includes(override.requested) && registered.has(override.requested) && !missingCapabilities(override.requested, required, capabilityMap).length;
    if (override.accepted !== Boolean(accepted)) add('user_override.accepted', 'does not match registration/capability gate');
    if (accepted && decision.selected_theme !== override.requested) add('selected_theme', 'accepted override must be selected');
  }
  if (html !== undefined) {
    const match = String(html).match(/<html\b[^>]*\bdata-theme=["']([^"']+)["']/i);
    if (!match || match[1] !== decision.selected_theme) add('html.data-theme', 'must match selected_theme');
  }
  if (sidecarStyle !== undefined) {
    const normalizedSidecar = normalizeThemeSlug(sidecarStyle, projectRoot);
    if (normalizedSidecar !== decision.selected_theme) add('sidecar.style', 'must normalize to selected_theme');
  }
  return { valid: errors.length === 0, errors };
}

function parseThemeDecision(text, options) {
  let decision;
  try {
    decision = JSON.parse(text);
  } catch (error) {
    return { valid: false, errors: [{ field: 'json', message: error.message }] };
  }
  return { decision, ...validateThemeDecision(decision, options) };
}

function readThemeDecision(filePath, options = {}) {
  try {
    return parseThemeDecision(fs.readFileSync(filePath, 'utf8'), options);
  } catch (error) {
    return { valid: false, errors: [{ field: 'file', message: error.message }] };
  }
}

function evaluateBatchDiversity(themes, {
  recentLimit = 6,
  consecutiveLimit = 3,
  concentrationLimit = 0.5,
} = {}) {
  const sequence = Array.isArray(themes) ? themes.filter(Boolean).map(String) : [];
  const recent = sequence.slice(-recentLimit);
  const counts = Object.fromEntries([...new Set(recent)].map((theme) => [theme, 0]));
  for (const theme of recent) counts[theme] += 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [null, 0];
  let consecutive = 0;
  for (let i = sequence.length - 1; i >= 0 && sequence[i] === top[0]; i -= 1) consecutive += 1;
  return {
    recent_themes: recent,
    counts,
    dominant_theme: top[0],
    dominant_count: top[1],
    dominant_ratio: recent.length ? top[1] / recent.length : 0,
    consecutive_count: consecutive,
    review_required: consecutive >= consecutiveLimit || (recent.length > 0 && top[1] / recent.length >= concentrationLimit),
    thresholds: { recent_limit: recentLimit, consecutive_limit: consecutiveLimit, concentration_limit: concentrationLimit },
  };
}

function validateAuthorDelegationContext(context, decisionPath) {
  const text = String(context || '');
  const forbidden = [
    /(?:^|\n)\s*Theme\s*:\s*[`']?[a-z0-9][a-z0-9-]*[`']?/i,
    /Create\s+(?:a|an)\s+[a-z0-9][a-z0-9-]*\s+(?:information\s+)?card/i,
    /(?:use|使用|采用)\s+(?:the\s+)?[a-z0-9][a-z0-9-]*\s+theme/i,
  ];
  const violations = forbidden.filter((pattern) => pattern.test(text)).map((pattern) => pattern.toString());
  const hasConsumerInstruction = /theme-decision\.json[\s\S]{0,240}(?:selected_theme|消费|读取|consume|read)/i.test(text);
  return {
    valid: violations.length === 0 && Boolean(decisionPath) && hasConsumerInstruction,
    decision_path: decisionPath || null,
    violations,
    errors: [
      ...(decisionPath ? [] : ['missing frozen theme-decision.json']),
      ...(hasConsumerInstruction ? [] : ['delegation must consume theme-decision.json.selected_theme']),
      ...(violations.length ? ['delegation context hard-codes a concrete theme'] : []),
    ],
  };
}

module.exports = {
  registeredThemes,
  normalizeThemeSlug,
  capabilitiesFor,
  selectTheme,
  validateThemeDecision,
  parseThemeDecision,
  readThemeDecision,
  evaluateBatchDiversity,
  validateAuthorDelegationContext,
  styleSkillName,
  styleSkillPath,
};
