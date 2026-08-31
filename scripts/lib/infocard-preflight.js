'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { validateProjectBrief } = require('./project-brief');
const { validatePromotionManifest, loadPromotionManifest } = require('./infocard-promotion');
const { validateBundle, bundleAllowlist } = require('./publish-bundle');
const { topLevelYamlValue } = require('./theme-contract');
const { scanFile } = require('../check-info-leak');
const { readThemeDecision } = require('../../.agents/skills/infocard/infocard-theme-assignment/scripts/theme-decision');

function error(field, message) { return { field, message }; }

function readJson(file, field, errors) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (cause) { errors.push(error(field, cause.message)); return null; }
}

function rejectSymlinkPath(file, boundary, field, errors) {
  let current = path.resolve(file);
  const stop = path.resolve(boundary);
  while (current === stop || current.startsWith(stop + path.sep)) {
    try {
      if (fs.lstatSync(current).isSymbolicLink()) { errors.push(error(field, 'must not use a symlink')); return; }
    } catch (cause) { if (cause.code !== 'ENOENT') errors.push(error(field, cause.message)); }
    if (current === stop) break;
    current = path.dirname(current);
  }
}

function safeRelative(value) {
  return typeof value === 'string' && value.trim() !== '' && !path.isAbsolute(value)
    && !value.includes('\\') && !value.split('/').includes('..') && !path.posix.normalize(value).startsWith('../');
}

function validateManifestContract(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return [error('manifest', 'must be an object')];
  const bundleResult = validateBundle(manifest.bundle);
  errors.push(...bundleResult.errors.map((item) => error('bundle.' + item.field, item.message)));
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) return [...errors, error('files', 'must be a non-empty array')];
  const allow = bundleResult.valid ? bundleAllowlist(manifest.bundle) : [];
  const destinations = new Set();
  const processFile = /(?:^|\/)(?:project-brief|facts|theme-decision|promotion-manifest|visual|screenshots?)(?:\.|\/|$)/i;
  manifest.files.forEach((entry, index) => {
    const prefix = `files[${index}]`;
    if (!entry || !safeRelative(entry.source)) errors.push(error(prefix + '.source', 'must be a safe manifest-relative source'));
    if (!entry || !safeRelative(entry.destination)) errors.push(error(prefix + '.destination', 'must be a safe repository-relative target'));
    else {
      const target = path.posix.normalize(entry.destination);
      const allowed = allow.some((item) => item === target || (item.endsWith('/**') && target.startsWith(item.slice(0, -2))));
      if (!allowed || (!target.startsWith('docs/') && !target.startsWith('assets/'))) errors.push(error(prefix + '.destination', 'must be an allowlisted docs/ or assets/ target'));
      if (processFile.test(target)) errors.push(error(prefix + '.destination', 'must not publish process or screenshot files'));
      if (destinations.has(target)) errors.push(error(prefix + '.destination', 'must be unique'));
      destinations.add(target);
    }
  });
  if (bundleResult.valid) {
    if (!destinations.has(manifest.bundle.html_path)) errors.push(error('files', 'must declare bundle html_path'));
    if (!destinations.has(manifest.bundle.meta_path)) errors.push(error('files', 'must declare bundle meta_path'));
  }
  return errors;
}

function validatePreflight({ root = process.cwd(), authoringDir, briefPath, factsPath, themeDecisionPath, metaPath, manifestPath, stage = 'contract' } = {}) {
  const errors = [];
  const required = { authoringDir, briefPath, factsPath, themeDecisionPath, metaPath, manifestPath };
  for (const [field, value] of Object.entries(required)) if (!value) errors.push(error(field, 'is required'));
  if (errors.length) return { valid: false, errors };

  const resolvedRoot = path.resolve(root);
  const resolvedAuthoring = path.resolve(resolvedRoot, authoringDir);
  if (!resolvedAuthoring.startsWith(path.join(resolvedRoot, '.docs') + path.sep)) errors.push(error('authoringDir', 'must be inside .docs/'));
  const contractFiles = { briefPath, factsPath, themeDecisionPath, metaPath, manifestPath };
  const expectedNames = { briefPath: 'project-brief.json', factsPath: 'facts.json', themeDecisionPath: 'theme-decision.json', metaPath: 'card.html.meta.yaml', manifestPath: 'promotion-manifest.json' };
  for (const [field, file] of Object.entries(contractFiles)) {
    const absolute = path.resolve(resolvedRoot, file);
    const relative = path.relative(resolvedAuthoring, absolute);
    if (relative.startsWith('..') || path.isAbsolute(relative)) errors.push(error(field, 'must be inside authoringDir'));
    if (path.basename(absolute) !== expectedNames[field]) errors.push(error(field, `must be named ${expectedNames[field]}`));
    rejectSymlinkPath(absolute, resolvedAuthoring, field, errors);
  }
  rejectSymlinkPath(resolvedAuthoring, path.join(resolvedRoot, '.docs'), 'authoringDir', errors);
  if (errors.length) return { valid: false, errors, stage };
  const brief = readJson(path.resolve(resolvedRoot, briefPath), 'brief', errors);
  const facts = readJson(path.resolve(resolvedRoot, factsPath), 'facts', errors);
  let meta = '';
  try { meta = fs.readFileSync(path.resolve(resolvedRoot, metaPath), 'utf8'); }
  catch (cause) { errors.push(error('meta', cause.message)); }
  const decision = readThemeDecision(path.resolve(resolvedRoot, themeDecisionPath), { projectRoot: resolvedRoot });
  if (!decision.valid) errors.push(...decision.errors.map((item) => error('theme-decision.' + item.field, item.message)));
  if (brief) errors.push(...validateProjectBrief(brief).errors.map((item) => error('brief.' + item.field, item.message)));
  if (!facts || typeof facts !== 'object' || Array.isArray(facts)) errors.push(error('facts', 'must be a JSON object'));
  const leakTargets = stage === 'authoring_validation'
    ? [path.join(resolvedAuthoring, 'card.html')]
    : [briefPath, factsPath, metaPath].map((file) => path.resolve(resolvedRoot, file));
  for (const target of leakTargets) {
    const blocking = scanFile(target).filter((item) => item.severity === 'HIGH' || item.severity === 'CRITICAL');
    if (blocking.length) errors.push(error('leak', `${path.basename(target)} has ${blocking.length} HIGH/CRITICAL finding(s)`));
  }

  const manifestAbsolute = path.resolve(resolvedRoot, manifestPath);
  let manifest = null;
  try { manifest = loadPromotionManifest(manifestAbsolute); }
  catch (cause) { errors.push(error('manifest', cause.message)); }
  if (manifest) {
    if (stage === 'authoring_validation') {
      const result = validatePromotionManifest(manifest, resolvedRoot, manifestPath);
      errors.push(...result.errors.map((item) => error('manifest.' + item.field, item.message)));
    } else {
      errors.push(...validateManifestContract(manifest).map((item) => error('manifest.' + item.field, item.message)));
    }
    if (decision.valid && decision.decision.selected_theme !== manifest.bundle.style) errors.push(error('theme', 'theme decision and manifest style differ'));
    if (meta) {
      const metaPathValue = topLevelYamlValue(meta, 'path');
      const metaStyle = topLevelYamlValue(meta, 'style');
      if (metaPathValue !== manifest.bundle.meta_path.replace(/\.meta\.yaml$/, '')) errors.push(error('meta.path', 'must equal manifest bundle html_path'));
      if (decision.valid && metaStyle !== decision.decision.selected_theme) errors.push(error('meta.style', 'must equal selected theme'));
    }
  }
  return { valid: errors.length === 0, errors, stage, route: brief && brief.route, selected_theme: decision.valid ? decision.decision.selected_theme : null };
}

module.exports = { validatePreflight, validateManifestContract };
