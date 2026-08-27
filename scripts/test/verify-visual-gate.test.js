'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const test = require('node:test');
const { main } = require('../verify-visual-gate');

const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function makeFixture({ status = 'VISUAL_PASSED', attempts = [], rounds = [], theme_match = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-gate-'));
  const htmlRel = 'docs/sample.html';
  const htmlPath = path.join(root, htmlRel);
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, '<!doctype html><html><body>sample</body></html>');
  const currentHash = hash(htmlPath);
  const dir = path.join(root, '.visual-evidence/sample');
  fs.mkdirSync(dir, { recursive: true });
  const manifest = { target: htmlRel, html_sha256: currentHash, review_status: status, theme_match };
  if (status === 'VISUAL_PASSED') {
    manifest.desktop = { critical: 0, major: 0, minor: 0, screenshot_path: 'desktop.png' };
    manifest.mobile = { critical: 0, major: 0, minor: 0, screenshot_path: 'mobile.png' };
  } else {
    manifest.visual_failure_attempts = attempts;
    if (rounds !== undefined) manifest.repair_rounds = rounds;
  }
  const manifestPath = path.join(dir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  return { root, htmlRel, htmlPath, manifestPath, currentHash };
}

const attempt = (name, type = 'visual_defect', extra = {}) => ({ name, type, outcome: 'failed', ...extra });
const round = (f, n, extra = {}) => ({
  attempt: n, repair_completed: true, change_made: true,
  before_html_sha256: 'before-' + n, html_sha256: f.currentHash,
  desktop: { critical: 1, major: 0, minor: 0, screenshot_path: `desktop-${n}.png` },
  mobile: { critical: 1, major: 0, minor: 0, screenshot_path: `mobile-${n}.png` },
  review: { critical: 1, major: 0, disposition: `review-${n}` },
  ...extra,
});

function exceptionFixture(count = 3, options = {}) {
  const f = makeFixture({ status: 'VISUAL_EXCEPTION_AFTER_MAX_REPAIRS', ...options });
  const attempts = options.attempts || Array.from({ length: count }, (_, i) => attempt(`attempt-${i + 1}`));
  const rounds = options.rounds === undefined ? Array.from({ length: 3 }, (_, i) => round(f, i + 1)) : options.rounds;
  const manifest = JSON.parse(fs.readFileSync(f.manifestPath));
  manifest.visual_failure_attempts = attempts;
  manifest.repair_rounds = rounds;
  fs.writeFileSync(f.manifestPath, JSON.stringify(manifest));
  return f;
}

test('clean VISUAL_PASSED remains accepted', () => {
  const f = makeFixture();
  const result = main([f.htmlRel], f.root);
  assert.equal(result.code, 0);
});

test('exception accepts exactly three recorded visual failures', () => {
  const f = exceptionFixture(3);
  assert.equal(main([f.htmlRel], f.root).code, 0);
});

test('exception accepts four or more recorded failures', () => {
  const f = exceptionFixture(4);
  assert.equal(main([f.htmlRel], f.root).code, 0);
});

test('infrastructure failure counts, requires evidence gap, and has no screenshot/review', () => {
  const f = exceptionFixture(3, { attempts: [
    attempt('capture-1', 'infrastructure_failure', { evidence_gap: true, error_category: 'capture_timeout' }),
    attempt('review-1', 'infrastructure_failure', { evidence_gap: true, error_category: 'vision_503' }),
    attempt('defect-1'),
  ] });
  assert.equal(main([f.htmlRel], f.root).code, 0);
  const manifest = JSON.parse(fs.readFileSync(f.manifestPath));
  manifest.visual_failure_attempts[0].screenshot_path = 'fabricated.png';
  fs.writeFileSync(f.manifestPath, JSON.stringify(manifest));
  assert.equal(main([f.htmlRel], f.root).code, 1);
});

test('fewer than three recorded failures is rejected even with three repair records', () => {
  const f = exceptionFixture(2);
  assert.equal(main([f.htmlRel], f.root).code, 1);
});

test('missing or malformed attempt records are rejected', () => {
  const f = exceptionFixture(3, { attempts: [attempt('a'), {}, attempt('c')] });
  assert.equal(main([f.htmlRel], f.root).code, 1);
});

test('completed repair requires real change, fresh evidence, and review', () => {
  const f = exceptionFixture(3);
  const manifest = JSON.parse(fs.readFileSync(f.manifestPath));
  delete manifest.repair_rounds[0].change_made;
  assert.ok(fs.writeFileSync(f.manifestPath, JSON.stringify(manifest)) === undefined);
  assert.equal(main([f.htmlRel], f.root).code, 1);
});

test('VISUAL_PENDING and unknown statuses remain rejected', () => {
  const f = makeFixture({ status: 'VISUAL_PENDING' });
  assert.equal(main([f.htmlRel], f.root).code, 1);
  const g = makeFixture({ status: 'VISUAL_BLOCKED' });
  assert.equal(main([g.htmlRel], g.root).code, 1);
});

test('non-visual theme gate remains blocking under exception', () => {
  const f = exceptionFixture(3, { theme_match: false });
  assert.equal(main([f.htmlRel], f.root).code, 1);
});

test('stale HTML binding remains blocking', () => {
  const f = exceptionFixture(3);
  const manifest = JSON.parse(fs.readFileSync(f.manifestPath));
  manifest.repair_rounds[0].html_sha256 = 'stale';
  fs.writeFileSync(f.manifestPath, JSON.stringify(manifest));
  assert.equal(main([f.htmlRel], f.root).code, 1);
});
