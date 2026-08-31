'use strict';

const fs = require('node:fs');
const path = require('node:path');

const TASK_MODES = new Set(['create', 'update', 'rebuild', 'repair', 'publish']);
const DELIVERY_MODES = new Set(['preview', 'direct', 'delegated']);
const QUALITY_LEVELS = new Set(['Blocker', 'Major', 'Advisory']);
const REPAIRERS = {
  'layout-overlap': 'infocard-layout-debugging',
  'mobile-overflow': 'infocard-mobile-verifier',
  'theme-guard': 'infocard-crayon-r5-guard',
  'evidence-mismatch': 'infocard-visual-evidence-grounding',
  'source-gap': 'infocard-source-and-content',
};
const BASE_STAGES = [
  'infocard-source-and-content',
  'infocard-card-authoring',
  'infocard-theme-contract',
  'infocard-quality-gate',
  'infocard-publish-pipeline',
];

function loadArchitecture(root) {
  const file = path.join(root, '.agents', 'skills-cop', 'infocard', 'infocard-core-contract', 'contracts', 'architecture.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function walkSkillFiles(root) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walkSkillFiles(full));
    if (entry.isFile() && entry.name === 'SKILL.md') files.push(full);
  }
  return files;
}

function skillName(file) {
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/^---\r?\n[\s\S]*?^name:\s*["']?([^"'\r\n]+)["']?\s*$[\s\S]*?^---/m);
  return match ? match[1].trim() : null;
}

function validateArchitecture(root, architecture) {
  const errors = [];
  if (architecture.contract_version !== '1.0.0') errors.push('unsupported contract_version');
  const skillFiles = walkSkillFiles(path.join(root, '.agents', 'skills-cop'));
  const namedFiles = new Map(skillFiles.map((file) => [skillName(file), file]).filter(([name]) => Boolean(name)));
  const names = [...namedFiles.keys()];
  const records = architecture.skills || [];
  const recordNames = records.map((item) => item.name);
  const compatibilityNames = new Set((architecture.compatibility || []).map((item) => item.legacy));
  for (const name of names) if (!recordNames.includes(name) && !compatibilityNames.has(name)) errors.push(`unregistered skill: ${name}`);
  for (const name of recordNames) if (!names.includes(name)) errors.push(`missing registered skill: ${name}`);
  for (const name of recordNames.filter((name, index) => recordNames.indexOf(name) !== index)) errors.push(`duplicate contract record: ${name}`);
  for (const item of records) {
    if (!item.layer || !item.trigger || !item.inputs || !item.outputs || !item.success || !item.next) errors.push(`incomplete contract: ${item.name}`);
    if (item.status === 'deprecated' && !item.replacement) errors.push(`deprecated skill lacks replacement: ${item.name}`);
  }
  const compatContract = architecture.compatibility_contract;
  if (!compatContract || !compatContract.trigger || !compatContract.non_trigger || !compatContract.required_inputs || !compatContract.structured_output || !compatContract.pre || !compatContract.post || !compatContract.success || !compatContract.recoverable_errors || !compatContract.blocking_errors || !compatContract.allowed_references) errors.push('incomplete compatibility contract');
  for (const item of architecture.compatibility || []) {
    if (!item.legacy || !item.replacement || !item.status) errors.push(`incomplete compatibility mapping: ${item.legacy || 'unknown'}`);
    for (const target of String(item.replacement || '').split(' + ')) {
      const targetName = target.split('#')[0];
      if (targetName && !names.includes(targetName)) errors.push(`compatibility target missing: ${item.legacy}->${targetName}`);
    }
    if (item.status === 'deprecated') {
      const file = namedFiles.get(item.legacy);
      const source = file ? fs.readFileSync(file, 'utf8') : '';
      const targets = String(item.replacement || '').split(' + ').map((target) => target.split('#')[0]);
      if (!source.includes('Deprecated compatibility entry') || targets.some((target) => !source.includes(target))) errors.push(`deprecated skill lacks local migration declaration: ${item.legacy}`);
    }
  }
  const themeRecords = [
    ...records.filter((item) => item.layer === 'theme'),
    ...(architecture.compatibility || []).filter((item) => item.adapter),
  ];
  for (const item of themeRecords) {
    const adapter = typeof item.adapter === 'string' ? item.adapter : item.adapter && item.adapter.contract;
    if (adapter !== 'infocard-theme-contract@1') errors.push(`theme adapter missing: ${item.name || item.legacy}`);
  }
  const adapterFile = path.join(root, '.agents', 'skills-cop', 'infocard', 'infocard-theme-contract', 'adapters', 'index.json');
  const adapters = JSON.parse(fs.readFileSync(adapterFile, 'utf8'));
  if (adapters.contract !== 'infocard-theme-contract@1') errors.push('unsupported theme adapter contract');
  const adapterIds = (adapters.adapters || []).map((item) => item.id);
  const defaults = adapters.contract_defaults || {};
  for (const field of ['tokens', 'typography', 'colors', 'borders', 'shadows', 'background', 'components', 'mobile', 'prohibitions', 'template', 'assets']) if (!Object.hasOwn(defaults, field)) errors.push(`theme contract default missing: ${field}`);
  for (const item of adapters.adapters || []) {
    for (const field of ['id', 'skill_path', 'suitable', 'unsuitable']) if (!Object.hasOwn(item, field)) errors.push(`theme adapter field missing: ${item.id || 'unknown'}:${field}`);
    if (!fs.existsSync(path.join(root, item.skill_path, 'SKILL.md'))) errors.push(`theme adapter path missing: ${item.id}`);
    const themeSource = fs.existsSync(path.join(root, item.skill_path, 'SKILL.md')) ? fs.readFileSync(path.join(root, item.skill_path, 'SKILL.md'), 'utf8') : '';
    if (!themeSource.includes('Runtime boundary') || !themeSource.includes('legacy archive')) errors.push(`theme runtime boundary missing: ${item.id}`);
  }
  for (const item of (architecture.compatibility || []).filter((entry) => entry.adapter)) {
    if (item.legacy !== 'infocard-style-man-skill' && !adapterIds.includes(item.legacy)) errors.push(`missing theme adapter registry entry: ${item.legacy}`);
  }
  for (const id of adapterIds.filter((id, index) => adapterIds.indexOf(id) !== index)) errors.push(`duplicate theme adapter: ${id}`);
  const references = architecture.references || [];
  for (const ref of references.filter((item) => item.status === 'active')) {
    if (!ref.scope || !ref.trigger || !ref.updated || !Object.hasOwn(ref, 'replacement')) errors.push(`active reference metadata incomplete: ${ref.path}`);
  }
  const refRoot = path.join(root, '.agents', 'skills-cop');
  let referenceCount = 0;
  for (const file of walkFiles(refRoot).filter((item) => item.includes(`${path.sep}references${path.sep}`))) {
    referenceCount += 1;
    const rel = path.relative(root, file).replaceAll(path.sep, '/');
    const record = references.find((item) => rel.endsWith(item.path));
    const rule = (architecture.reference_policy?.rules || []).find((candidate) => candidate.prefix ? rel.startsWith(`.agents/skills-cop/${candidate.prefix}`) : candidate.pattern && new RegExp(candidate.pattern).test(rel));
    if (!record && !rule) errors.push(`unclassified reference: ${rel}`);
    if (rule && (!rule.kind || !rule.status || !rule.scope || !rule.trigger || !rule.updated || !Object.hasOwn(rule, 'replacement'))) errors.push(`reference rule metadata incomplete: ${rel}`);
  }
  return { errors, skillCount: names.length, legacyCount: compatibilityNames.size, themeCount: adapterIds.length, referenceCount };
}

function buildRunPlan(input = {}) {
  const mode = input.mode || 'create';
  if (!TASK_MODES.has(mode)) throw new Error(`unsupported task mode: ${mode}`);
  const quality = input.quality || { status: 'pending' };
  const qualityIssues = quality.issues || [];
  const requestedMode = input.deliveryMode || (input.publishAuthorized ? 'direct' : 'preview');
  if (!DELIVERY_MODES.has(requestedMode)) throw new Error(`unsupported delivery mode: ${requestedMode}`);
  if (mode === 'publish' && quality.status !== 'passed') throw new Error('publish requires an accepted quality result');
  const hasBlocker = qualityIssues.some((issue) => issue.level === 'Blocker');
  const hasMajor = qualityIssues.some((issue) => issue.level === 'Major');
  const majorPreviewAllowed = hasMajor && requestedMode === 'preview' && Boolean(input.previewWarningAuthorized);
  if (hasBlocker || (hasMajor && !majorPreviewAllowed)) {
    return {
      task: { mode, audience: input.audience || 'unspecified', output: 'preview' },
      stages: stagesForMode(mode, input),
      source: sourcePlan(input),
      theme: { id: input.theme || 'recommended', contract_version: '1.0.0' },
      quality: { status: quality.status, issues: qualityIssues },
      delivery: {
        mode: requestedMode,
        status: 'blocked',
        publishes: false,
        actions: [],
        reason: hasBlocker ? 'quality blocker requires repair' : 'major issue requires explicit preview warning for preview mode only',
      },
    };
  }
  if (requestedMode === 'direct' && !input.publishAuthorized) return { task: { mode, audience: input.audience || 'unspecified', output: 'preview' }, stages: ['infocard-quality-gate', 'infocard-publish-pipeline'], quality: { status: quality.status }, delivery: { mode: 'direct', status: 'blocked', publishes: false, actions: [], reason: 'publication authorization required' } };
  const delivery = { mode: requestedMode, publishes: requestedMode === 'direct' && Boolean(input.publishAuthorized) };
  if (requestedMode === 'preview') {
    delivery.actions = ['preview-artifact'];
    delivery.status = hasMajor ? 'warning' : 'ready';
    if (hasMajor) delivery.warnings = qualityIssues.filter((issue) => issue.level === 'Major');
  }
  if (requestedMode === 'direct') delivery.actions = ['build', 'index', 'resource-smoke', 'public-url-smoke'];
  if (requestedMode === 'delegated') {
    delivery.actions = ['handoff-package'];
    delivery.publishes = false;
  }
  return {
    task: { mode, audience: input.audience || 'unspecified', output: delivery.mode === 'preview' || requestedMode === 'delegated' ? 'preview' : 'published' },
    stages: stagesForMode(mode, input),
    source: sourcePlan(input),
    theme: { id: input.theme || 'recommended', contract_version: '1.0.0' },
    quality: { status: quality.status, repair_round: input.repairRound || 0 },
    delivery,
  };
}

function stagesForMode(mode, input = {}) {
  if (mode === 'publish') return ['infocard-quality-gate', 'infocard-publish-pipeline'];
  if (mode === 'repair' && !input.repairNeedsSource) return BASE_STAGES.slice(1);
  return BASE_STAGES;
}

function sourcePlan(input = {}) {
  const risk = new Set(input.sourceRisk || []);
  const required_plugins = [];
  if (risk.has('social-rumor') || risk.has('public-dispute')) {
    required_plugins.push('social-source-boundary', 'infocard-metadata-provenance');
  }
  return { required_plugins };
}

function resolveLegacyRoute(architecture, name) {
  const route = (architecture.compatibility || []).find((item) => item.legacy === name);
  if (!route) throw new Error(`unknown legacy skill: ${name}`);
  return { ...route, contract: architecture.compatibility_contract?.id || 'legacy-adapter@1' };
}

function evaluateQuality({ issues = [], repairRound = 0, repairRounds = {} } = {}) {
  const required = ['level', 'check', 'category', 'evidence', 'impact', 'repairer', 'recheck'];
  for (const issue of issues) {
    if (!QUALITY_LEVELS.has(issue.level)) throw new Error(`unsupported quality level: ${issue.level}`);
    for (const field of required) if (!issue[field]) throw new Error(`quality issue missing ${field}`);
  }
  const blocking = issues.find((issue) => issue.level === 'Blocker');
  const major = issues.find((issue) => issue.level === 'Major');
  if (!blocking && !major) return { status: 'passed', blockers: [], advisories: issues.filter((issue) => issue.level === 'Advisory'), next: 'infocard-publish-pipeline', repairRounds };
  const selected = blocking || major;
  const category = selected.category;
  const count = repairRounds[category] ?? repairRound;
  if (count >= 2) return { status: 'blocked', blockers: issues.filter((issue) => issue.level !== 'Advisory'), advisories: [], next: 'human-review', recheck: null, repairRounds };
  const nextRounds = { ...repairRounds, [category]: count + 1 };
  return {
    status: 'blocked',
    blockers: issues.filter((issue) => issue.level !== 'Advisory'),
    advisories: issues.filter((issue) => issue.level === 'Advisory'),
    next: selected.repairer || REPAIRERS[category] || 'human-review',
    recheck: 'infocard-quality-gate',
    repairRound: repairRound + 1,
    repairRounds: nextRounds,
  };
}

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full)); else out.push(full);
  }
  return out;
}

function runStages(input = {}, handlers = {}) {
  const plan = buildRunPlan(input);
  const state = { task: plan.task, theme: plan.theme, quality: plan.quality, delivery: plan.delivery, artifacts: {}, stages: [] };
  for (const stage of plan.stages) {
    const result = typeof handlers[stage] === 'function' ? handlers[stage](state) : { status: 'blocked', summary: `${stage} handler unavailable`, artifacts: {}, issues: [{ code: 'STAGE_HANDLER_UNAVAILABLE', stage }], next: null };
    state.stages.push({ stage, ...result });
    if (result.status !== 'completed') return { ...state, status: result.status, stopped_at: stage };
    Object.assign(state.artifacts, result.artifacts || {});
  }
  return { ...state, status: 'completed' };
}

module.exports = { buildRunPlan, evaluateQuality, loadArchitecture, validateArchitecture, runStages, resolveLegacyRoute };
