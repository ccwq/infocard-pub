'use strict';

const fs = require('node:fs');
const path = require('node:path');

const TASK_MODES = new Set(['create', 'update', 'rebuild', 'repair', 'publish']);
const DELIVERY_MODES = new Set(['preview', 'direct', 'delegated']);
const QUALITY_LEVELS = new Set(['Critical', 'Major', 'Minor']);
const BASE_STAGES = ['infocard-router', 'infocard-author', 'infocard-publish'];

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
  if (architecture.contract_version !== '2.0.0') errors.push('unsupported contract_version');
  const skillFiles = walkSkillFiles(path.join(root, '.agents', 'skills-cop'));
  const namedFiles = new Map(skillFiles.map((file) => [skillName(file), file]).filter(([name]) => Boolean(name)));
  const names = [...namedFiles.keys()];
  const records = architecture.skills || [];
  const recordNames = records.map((item) => item.name);
  const compatibilityNames = new Set((architecture.compatibility || []).map((item) => item.legacy));
  const executableNames = new Set(recordNames);
  for (const name of names) if (!recordNames.includes(name) && !compatibilityNames.has(name)) errors.push(`unregistered skill: ${name}`);
  for (const name of recordNames) if (!names.includes(name)) errors.push(`missing registered skill: ${name}`);
  for (const name of recordNames.filter((name, index) => recordNames.indexOf(name) !== index)) errors.push(`duplicate contract record: ${name}`);
  if (records.map((item) => item.name).join(',') !== 'infocard-router,infocard-author,infocard-publish') errors.push('architecture must expose only Router, Author and Publish');
  for (const item of records) {
    if (!item.layer || !item.trigger || !item.inputs || !item.outputs || !item.success || !item.next) errors.push(`incomplete contract: ${item.name}`);
    if (item.status === 'deprecated' && !item.replacement) errors.push(`deprecated skill lacks replacement: ${item.name}`);
  }
  const compatContract = architecture.compatibility_contract;
  if (!compatContract || !compatContract.trigger || !compatContract.non_trigger || !compatContract.required_inputs || !compatContract.structured_output || !compatContract.pre || !compatContract.post || !compatContract.success || !compatContract.recoverable_errors || !compatContract.blocking_errors || !compatContract.allowed_references) errors.push('incomplete compatibility contract');
  for (const pre of compatContract?.pre || []) if (!executableNames.has(pre)) errors.push(`compatibility precondition missing: ${pre}`);
  for (const item of architecture.compatibility || []) {
    if (!item.legacy || !item.replacement || !item.status) errors.push(`incomplete compatibility mapping: ${item.legacy || 'unknown'}`);
    for (const target of String(item.replacement || '').split(' + ')) {
      const targetName = target.split('#')[0];
      if (targetName && !executableNames.has(targetName)) errors.push(`compatibility target missing: ${item.legacy}->${targetName}`);
    }
    if (item.status === 'deprecated') {
      const file = namedFiles.get(item.legacy);
      const source = file ? fs.readFileSync(file, 'utf8') : '';
      if (!source.includes('Deprecated compatibility entry')) errors.push(`deprecated skill lacks local migration declaration: ${item.legacy}`);
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
  const hasCritical = qualityIssues.some((issue) => issue.level === 'Critical');
  const review = evaluateQuality({ issues: qualityIssues, repairRound: input.repairRound || 0 });
  const declaredQualityAccepted = quality.status === review.status && (review.status === 'passed' || review.status === 'accepted_with_human_review');
  if (mode === 'publish' && !declaredQualityAccepted) return { task: { mode, audience: input.audience || 'unspecified', output: 'preview' }, stages: stagesForMode(mode), source: sourcePlan(input), quality: { ...review, declared_status: quality.status }, delivery: { mode: requestedMode, status: 'blocked', publishes: false, actions: [], reason: 'publish requires a current accepted quality report' } };
  if (hasCritical) return { task: { mode, audience: input.audience || 'unspecified', output: 'preview' }, stages: stagesForMode(mode), source: sourcePlan(input), quality: review, delivery: { mode: requestedMode, status: 'blocked', publishes: false, actions: [], reason: 'critical visual defect requires repair' } };
  if (review.status === 'blocked') return { task: { mode, audience: input.audience || 'unspecified', output: 'preview' }, stages: stagesForMode(mode), source: sourcePlan(input), quality: review, delivery: { mode: requestedMode, status: 'blocked', publishes: false, actions: [], reason: 'visual review requires its second and final attempt' } };
  if (requestedMode === 'direct' && !input.publishAuthorized) return { task: { mode, audience: input.audience || 'unspecified', output: 'preview' }, stages: ['infocard-publish'], quality: review, delivery: { mode: 'direct', status: 'blocked', publishes: false, actions: [], reason: 'publication authorization required' } };
  const delivery = { mode: requestedMode, publishes: requestedMode === 'direct' && Boolean(input.publishAuthorized) };
  if (requestedMode === 'preview') {
    delivery.actions = ['preview-artifact'];
    delivery.status = review.needs_human_review ? 'needs_human_review' : 'ready';
  }
  if (requestedMode === 'direct') delivery.actions = ['build', 'index', 'resource-smoke', 'public-url-smoke'];
  if (requestedMode === 'delegated') {
    delivery.actions = ['handoff-package'];
    delivery.publishes = false;
  }
  if (review.needs_human_review) delivery.result_protocol_header = '需要人工审核';
  return {
    task: { mode, audience: input.audience || 'unspecified', output: delivery.mode === 'preview' || requestedMode === 'delegated' ? 'preview' : 'published' },
    stages: stagesForMode(mode),
    source: sourcePlan(input),
    theme: { id: input.theme || 'recommended' },
    quality: review,
    delivery,
  };
}

function stagesForMode(mode) {
  if (mode === 'publish') return ['infocard-publish'];
  if (mode === 'repair') return ['infocard-router', 'infocard-author', 'infocard-publish'];
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

function evaluateQuality({ issues = [], repairRound = 0 } = {}) {
  const required = ['level', 'check', 'category', 'evidence', 'impact', 'repairer', 'recheck'];
  for (const issue of issues) {
    if (!QUALITY_LEVELS.has(issue.level)) throw new Error(`unsupported quality level: ${issue.level}`);
    for (const field of required) if (!issue[field]) throw new Error(`quality issue missing ${field}`);
  }
  const critical = issues.find((issue) => issue.level === 'Critical');
  const major = issues.find((issue) => issue.level === 'Major');
  const minor = issues.find((issue) => issue.level === 'Minor');
  if (!critical && !major && !minor) return { status: 'passed', critical: [], majors: [], minors: [], needs_human_review: false, next: 'infocard-publish', review_attempt: repairRound };
  const selected = critical || major || minor;
  if (repairRound >= 2) return critical
    ? { status: 'blocked', critical: issues.filter((issue) => issue.level === 'Critical'), majors: issues.filter((issue) => issue.level === 'Major'), minors: issues.filter((issue) => issue.level === 'Minor'), next: 'human-review', recheck: null, needs_human_review: false, review_attempt: 2 }
    : { status: 'accepted_with_human_review', critical: [], majors: issues.filter((issue) => issue.level === 'Major'), minors: issues.filter((issue) => issue.level === 'Minor'), next: 'infocard-publish', recheck: null, needs_human_review: true, review_attempt: 2 };
  return {
    status: 'blocked',
    critical: issues.filter((issue) => issue.level === 'Critical'),
    majors: issues.filter((issue) => issue.level === 'Major'),
    minors: issues.filter((issue) => issue.level === 'Minor'),
    next: selected.repairer || 'infocard-author',
    recheck: 'infocard-publish',
    review_attempt: repairRound + 1,
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
  const state = { task: plan.task, theme: plan.theme, quality: plan.quality, delivery: plan.delivery, artifacts: { ...(input.artifacts || {}) }, stages: [] };
  for (const stage of plan.stages) {
    if (stage === 'infocard-publish') {
      const accepted = input.quality?.status === state.quality?.status && (state.quality?.status === 'passed' || state.quality?.status === 'accepted_with_human_review');
      if (!accepted || !state.artifacts.acceptedArtifact || input.visualReviewCompleted !== true) {
        return { ...state, status: 'blocked', stopped_at: stage, error: 'publish requires accepted quality, acceptedArtifact and completed visual review' };
      }
    }
    const result = typeof handlers[stage] === 'function' ? handlers[stage](state) : { status: 'blocked', summary: `${stage} handler unavailable`, artifacts: {}, issues: [{ code: 'STAGE_HANDLER_UNAVAILABLE', stage }], next: null };
    const required = ['status', 'summary', 'artifacts', 'issues', 'next'];
    if (!result || typeof result !== 'object') {
      return { ...state, status: 'blocked', stopped_at: stage, error: `${stage} returned invalid result` };
    }
    if (result.status === 'completed' && required.some((field) => !Object.hasOwn(result, field))) {
      return { ...state, status: 'blocked', stopped_at: stage, error: `${stage} returned malformed completed result` };
    }
    state.stages.push({ stage, ...result });
    if (result.status !== 'completed') return { ...state, status: result.status, stopped_at: stage };
    Object.assign(state.artifacts, result.artifacts || {});
  }
  return { ...state, status: 'completed' };
}

module.exports = { buildRunPlan, evaluateQuality, loadArchitecture, validateArchitecture, runStages, resolveLegacyRoute };
