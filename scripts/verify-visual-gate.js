#!/usr/bin/env node
'use strict';

/**
 * Mechanical visual evidence gate for infocard HTML files.
 *
 * This script does not decide whether a screenshot is beautiful. It verifies that
 * the current HTML cannot be pushed without a fresh, structured visual review
 * manifest bound to the exact file hash, and catches known theme-link regressions.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function error(field, message) { return { field, message }; }
function sha256File(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function sha256Text(text) { return crypto.createHash('sha256').update(text).digest('hex'); }

function normalizeRelative(value) {
  if (typeof value !== 'string' || value.trim() === '') return null;
  if (path.isAbsolute(value) || value.includes('\\')) return null;
  const normalized = path.posix.normalize(value.replace(/^\.\//, ''));
  if (normalized === '.' || normalized === '..' || normalized.startsWith('../')) return null;
  return normalized;
}

function parseArgs(argv) {
  const args = { manifest: null, requireEvidence: true, files: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--manifest' && argv[i + 1]) { args.manifest = argv[++i]; continue; }
    if (arg === '--no-require-evidence') { args.requireEvidence = false; continue; }
    if (arg === '--help' || arg === '-h') {
      throw Object.assign(new Error('usage: node scripts/verify-visual-gate.js [--manifest path] [--no-require-evidence] docs/<slug>.html ...'), { help: true });
    }
    args.files.push(arg);
  }
  if (args.files.length === 0) {
    throw Object.assign(new Error('usage: node scripts/verify-visual-gate.js [--manifest path] [--no-require-evidence] docs/<slug>.html ...'), { usage: true });
  }
  return args;
}

function defaultManifestPath(htmlRelative) {
  const parsed = path.posix.parse(htmlRelative);
  const slug = parsed.name === 'index' ? path.posix.basename(parsed.dir) : parsed.name;
  return path.posix.join('.visual-evidence', slug, 'manifest.json');
}

function findManifestFor(manifestInput, htmlRelative, root) {
  const candidates = [];
  if (manifestInput) candidates.push(manifestInput);
  candidates.push(defaultManifestPath(htmlRelative));
  const htmlBase = htmlRelative.replace(/\.html$/, '');
  candidates.push(htmlBase + '.visual-manifest.json');

  for (const candidate of candidates) {
    const rel = normalizeRelative(candidate);
    if (!rel) continue;
    const absolute = path.resolve(root, rel);
    if (fs.existsSync(absolute)) return { relative: rel, absolute };
  }
  return { relative: candidates[0], absolute: null };
}

function checkNoBrokenThemeHtmlStylesheet(html, htmlRelative) {
  const errors = [];
  const re = /<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*\/theme\/[^"']+\.html(?:\?[^"']*)?)["'][^>]*>/gi;
  let match;
  while ((match = re.exec(html))) {
    errors.push(error(htmlRelative, `must not load theme HTML as a stylesheet: ${match[1]}`));
  }
  const reAlt = /<link\b[^>]*href=["']([^"']*\/theme\/[^"']+\.html(?:\?[^"']*)?)["'][^>]*rel=["']stylesheet["'][^>]*>/gi;
  while ((match = reAlt.exec(html))) {
    errors.push(error(htmlRelative, `must not load theme HTML as a stylesheet: ${match[1]}`));
  }
  return errors;
}

function viewportDisposition(manifest, key) {
  const value = manifest && manifest[key];
  if (!value || typeof value !== 'object') return null;
  return value;
}

function numberField(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  return null;
}

function checkDisposition(item, fieldPrefix, allowNonZero = false) {
  const errors = [];
  if (!item) return [error(fieldPrefix, 'required visual disposition is missing')];
  const critical = numberField(item.critical);
  const major = numberField(item.major);
  if (critical === null) errors.push(error(fieldPrefix + '.critical', 'must be a number'));
  if (major === null) errors.push(error(fieldPrefix + '.major', 'must be a number'));
  if (critical !== null && !allowNonZero && critical > 0) {
    errors.push(error(fieldPrefix + '.critical', 'must be 0 before push'));
  }
  if (major !== null && !allowNonZero && major > 0) {
    errors.push(error(fieldPrefix + '.major', 'must be 0 before push'));
  }
  const screenshot = item.screenshot_path || item.screenshot || item.path;
  if (typeof screenshot !== 'string' || screenshot.trim() === '') {
    errors.push(error(fieldPrefix + '.screenshot_path', 'must point to the reviewed PNG'));
  }
  return errors;
}

/**
 * Validate a single repair-round record.
 * Returns an array of error objects.
 */
function checkRepairRound(round, index, htmlHash, htmlTextHash) {
  const errors = [];
  const prefix = `manifest.repair_rounds[${index}]`;

  if (!round || typeof round !== 'object') {
    return [error(prefix, 'repair round must be an object')];
  }

  // A completed repair must explicitly record a real change. When before/after
  // hashes are supplied, they must also prove that the content changed.
  const changed = round.change_made === true || round.changed === true || round.repair_changed === true;
  if (!changed) {
    errors.push(error(prefix + '.change_made', 'must be true for a completed repair round'));
  }
  const beforeHash = round.before_html_sha256 || round.previous_html_sha256 || round.before_html_hash;
  const roundHash = round.html_sha256 || round.source_sha256 || round.html_hash;
  if (beforeHash && roundHash && beforeHash === roundHash) {
    errors.push(error(prefix + '.before_html_sha256', 'before and after HTML hashes must differ'));
  }
  if (!roundHash || (roundHash !== htmlHash && roundHash !== htmlTextHash)) {
    errors.push(error(prefix + '.html_sha256', 'must match current HTML sha256'));
  }
  if (round.repair_completed !== true) {
    errors.push(error(prefix + '.repair_completed', 'must be true for a completed repair round'));
  }
  if (typeof round.attempt !== 'number' || round.attempt !== index + 1) {
    errors.push(error(prefix + '.attempt', `must equal ${index + 1}`));
  }

  // Each round must have desktop and mobile evidence
  const desktop = viewportDisposition(round, 'desktop') || viewportDisposition(round, 'desktop_1280') || viewportDisposition(round, 'desktop_1440');
  const mobile = viewportDisposition(round, 'mobile') || viewportDisposition(round, 'mobile_390') || viewportDisposition(round, 'mobile_480');
  errors.push(...checkDisposition(desktop, prefix + '.desktop', true));
  errors.push(...checkDisposition(mobile, prefix + '.mobile', true));

  if (!round.review || typeof round.review !== 'object') {
    errors.push(error(prefix + '.review', 'fresh review disposition is required'));
  } else {
    const reviewCritical = numberField(round.review.critical);
    const reviewMajor = numberField(round.review.major);
    if (reviewCritical === null) errors.push(error(prefix + '.review.critical', 'must be a number'));
    if (reviewMajor === null) errors.push(error(prefix + '.review.major', 'must be a number'));
    if (typeof round.review.disposition !== 'string' && typeof round.review.review_id !== 'string') {
      errors.push(error(prefix + '.review', 'must identify the fresh review disposition'));
    }
  }

  return errors;
}

/**
 * Validate the VISUAL_EXCEPTION_AFTER_MAX_REPAIRS disposition.
 * Returns an array of error objects.
 */
function checkVisualException(manifest, htmlHash, htmlTextHash) {
  const errors = [];

  if (!Array.isArray(manifest.visual_failure_attempts)) {
    errors.push(error('manifest.visual_failure_attempts', 'must be an array for VISUAL_EXCEPTION_AFTER_MAX_REPAIRS'));
    return errors;
  }

  if (manifest.visual_failure_attempts.length !== 2) {
    errors.push(error('manifest.visual_failure_attempts', 'must contain exactly 2 recorded visual failure attempts'));
  }

  for (let i = 0; i < manifest.visual_failure_attempts.length; i++) {
    const attempt = manifest.visual_failure_attempts[i];
    const prefix = `manifest.visual_failure_attempts[${i}]`;
    if (!attempt || typeof attempt !== 'object') {
      errors.push(error(prefix, 'visual failure attempt must be an object'));
      continue;
    }
    if (typeof attempt.name !== 'string' || attempt.name.trim() === '') errors.push(error(prefix + '.name', 'must be a non-empty deterministic name'));
    if (!['visual_defect', 'infrastructure_failure'].includes(attempt.type)) errors.push(error(prefix + '.type', 'must be visual_defect or infrastructure_failure'));
    if (typeof attempt.outcome !== 'string' || attempt.outcome.trim() === '') errors.push(error(prefix + '.outcome', 'must record the attempt outcome'));
    if (attempt.type === 'infrastructure_failure') {
      if (attempt.evidence_gap !== true) errors.push(error(prefix + '.evidence_gap', 'must be true for infrastructure failure'));
      if (typeof attempt.error_category !== 'string' || attempt.error_category.trim() === '') errors.push(error(prefix + '.error_category', 'must record the infrastructure error category'));
      if (attempt.screenshot_path || attempt.screenshot || attempt.review) errors.push(error(prefix, 'infrastructure failure must not fabricate screenshot or review evidence'));
    } else if (attempt.evidence_gap === true) {
      errors.push(error(prefix + '.evidence_gap', 'visual defect attempt must have evidence unless explicitly an infrastructure failure'));
    }
  }

  if (manifest.repair_rounds !== undefined && !Array.isArray(manifest.repair_rounds)) {
    errors.push(error('manifest.repair_rounds', 'must be an array when present'));
  }
  for (let i = 0; i < (Array.isArray(manifest.repair_rounds) ? manifest.repair_rounds.length : 0); i++) {
    errors.push(...checkRepairRound(manifest.repair_rounds[i], i, htmlHash, htmlTextHash));
  }

  return errors;
}

function checkManifest(manifestPath, htmlRelative, htmlHash, htmlTextHash) {
  const errors = [];
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath.absolute, 'utf8'));
  } catch (cause) {
    return [error(manifestPath.relative, 'cannot parse visual manifest JSON: ' + cause.message)];
  }

  if (manifest.target && normalizeRelative(manifest.target) !== htmlRelative) {
    errors.push(error('manifest.target', `must equal ${htmlRelative}`));
  }
  const manifestHash = manifest.html_sha256 || manifest.source_sha256 || manifest.html_hash;
  if (manifestHash !== htmlHash && manifestHash !== htmlTextHash) {
    errors.push(error('manifest.html_sha256', 'must match current HTML sha256'));
  }

  const status = manifest.review_status || manifest.status || manifest.visual_status;

  if (manifest.route === 'light') {
    const plan = manifest.capture_plan;
    const expected = ['hero', 'body', 'footer'];
    if (!plan || JSON.stringify(plan.desktop) !== JSON.stringify(expected) || JSON.stringify(plan.mobile) !== JSON.stringify(expected) || plan.geometry !== true) {
      errors.push(error('manifest.capture_plan', 'light route requires desktop/mobile hero/body/footer and geometry=true'));
    }
    for (const viewport of ['desktop', 'mobile']) {
      const geometry = manifest.geometry && manifest.geometry[viewport];
      if (!geometry || numberField(geometry.scrollWidth) === null || numberField(geometry.clientWidth) === null) {
        errors.push(error(`manifest.geometry.${viewport}`, 'scrollWidth and clientWidth are required for light route'));
      } else if (numberField(geometry.scrollWidth) > numberField(geometry.clientWidth)) {
        errors.push(error(`manifest.geometry.${viewport}`, 'page-level horizontal overflow is not allowed'));
      }
    }
  }

  if (status === 'VISUAL_EXCEPTION_AFTER_MAX_REPAIRS') {
    // Exception path: require completed repair rounds with fresh evidence
    errors.push(...checkVisualException(manifest, htmlHash, htmlTextHash));
  } else if (status) {
    // Existing path: strict 0 critical / 0 major
    if (!['VISUAL_PASSED', 'PASSED', 'passed'].includes(status)) {
      errors.push(error('manifest.review_status', 'must be VISUAL_PASSED before push'));
    }
    const desktop = viewportDisposition(manifest, 'desktop') || viewportDisposition(manifest, 'desktop_1280') || viewportDisposition(manifest, 'desktop_1440');
    const mobile = viewportDisposition(manifest, 'mobile') || viewportDisposition(manifest, 'mobile_390') || viewportDisposition(manifest, 'mobile_480');
    errors.push(...checkDisposition(desktop, 'manifest.desktop', false));
    errors.push(...checkDisposition(mobile, 'manifest.mobile', false));
  }

  if (manifest.theme_match === false) {
    errors.push(error('manifest.theme_match', 'must not be false'));
  }
  return errors;
}

function verifyFile(input, root, options) {
  const errors = [];
  const htmlRelative = normalizeRelative(input);
  if (!htmlRelative) return { target: input, valid: false, errors: [error('target', 'must be a repository-relative HTML path')] };
  if (!htmlRelative.startsWith('docs/') || !htmlRelative.endsWith('.html')) {
    errors.push(error('target', 'must be docs/<slug>.html'));
  }
  const htmlAbsolute = path.resolve(root, htmlRelative);
  if (!fs.existsSync(htmlAbsolute)) {
    return { target: htmlRelative, valid: false, errors: [error('target', 'HTML file does not exist')] };
  }
  const html = fs.readFileSync(htmlAbsolute, 'utf8');
  errors.push(...checkNoBrokenThemeHtmlStylesheet(html, htmlRelative));

  const manifestPath = findManifestFor(options.manifest, htmlRelative, root);
  if (!manifestPath.absolute) {
    if (options.requireEvidence) {
      errors.push(error('manifest', `visual manifest is required before push; expected ${manifestPath.relative}`));
    }
  } else {
    errors.push(...checkManifest(manifestPath, htmlRelative, sha256File(htmlAbsolute), sha256Text(html)));
  }

  return { target: htmlRelative, manifest: manifestPath.absolute ? manifestPath.relative : null, valid: errors.length === 0, errors };
}

function main(argv, cwd = process.cwd()) {
  let args;
  try { args = parseArgs(argv); } catch (cause) {
    return { code: cause.help || cause.usage ? 2 : 1, output: { valid: false, errors: [error('args', cause.message)] } };
  }
  const results = args.files.map((file) => verifyFile(file, cwd, args));
  const valid = results.every((result) => result.valid);
  return { code: valid ? 0 : 1, output: { valid, results } };
}

if (require.main === module) {
  const outcome = main(process.argv.slice(2));
  process.stdout.write(JSON.stringify(outcome.output, null, 2) + '\n');
  process.exitCode = outcome.code;
}

module.exports = { main, verifyFile, checkNoBrokenThemeHtmlStylesheet, checkManifest, checkDisposition, checkRepairRound, checkVisualException };
