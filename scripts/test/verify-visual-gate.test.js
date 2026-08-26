'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const test = require('node:test');

const { main } = require('../verify-visual-gate');

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-gate-'));
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  const htmlRel = 'docs/20260821-sample.html';
  const htmlPath = path.join(root, htmlRel);
  fs.writeFileSync(htmlPath, '<!doctype html><html data-theme="darkblue"><head><style>:root{--cyan:#58c3ff}</style></head><body>样例</body></html>');
  const manifestDir = path.join(root, '.visual-evidence/20260821-sample');
  fs.mkdirSync(manifestDir, { recursive: true });
  const manifestPath = path.join(manifestDir, 'manifest.json');
  const manifest = {
    target: htmlRel,
    html_sha256: sha256File(htmlPath),
    review_status: 'VISUAL_PASSED',
    theme_match: true,
    desktop: { critical: 0, major: 0, minor: 0, screenshot_path: '/tmp/desktop.png' },
    mobile: { critical: 0, major: 0, minor: 0, screenshot_path: '/tmp/mobile.png' },
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return { root, htmlRel, htmlPath, manifestPath };
}

test('visual gate accepts current HTML with desktop/mobile 0 critical/major evidence', () => {
  const f = fixture();
  const result = main([f.htmlRel], f.root);
  assert.equal(result.code, 0);
  assert.equal(result.output.valid, true);
});

test('visual gate blocks missing evidence before push', () => {
  const f = fixture();
  fs.rmSync(path.join(f.root, '.visual-evidence'), { recursive: true, force: true });
  const result = main([f.htmlRel], f.root);
  assert.equal(result.code, 1);
  assert.ok(result.output.results[0].errors.some((error) => error.field === 'manifest'));
});

test('visual gate blocks stale manifest hash after HTML edit', () => {
  const f = fixture();
  fs.appendFileSync(f.htmlPath, '<!-- changed -->');
  const result = main([f.htmlRel], f.root);
  assert.equal(result.code, 1);
  assert.ok(result.output.results[0].errors.some((error) => error.field === 'manifest.html_sha256'));
});

test('visual gate blocks critical or major defects', () => {
  const f = fixture();
  const manifest = JSON.parse(fs.readFileSync(f.manifestPath, 'utf8'));
  manifest.mobile.major = 1;
  fs.writeFileSync(f.manifestPath, JSON.stringify(manifest));
  const result = main([f.htmlRel], f.root);
  assert.equal(result.code, 1);
  assert.ok(result.output.results[0].errors.some((error) => error.field === 'manifest.mobile.major'));
});

test('visual gate blocks theme HTML loaded as stylesheet even without evidence requirement', () => {
  const f = fixture();
  fs.writeFileSync(f.htmlPath, '<!doctype html><link rel="stylesheet" href="../theme/darkblue.html"><body>坏主题</body>');
  const result = main(['--no-require-evidence', f.htmlRel], f.root);
  assert.equal(result.code, 1);
  assert.ok(result.output.results[0].errors.some((error) => error.message.includes('theme HTML as a stylesheet')));
});
