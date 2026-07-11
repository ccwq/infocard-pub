'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const MODULE = path.join(ROOT, 'scripts/verify-card-content.js');
const roots = new Set();
test.afterEach(() => { for (const root of roots) fs.rmSync(root, { recursive: true, force: true }); roots.clear(); });

function fixture(overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'card-content-')); roots.add(root);
  const bundle = { slug: 'widget-kit', html_path: 'docs/20260711-widget-kit.html', meta_path: 'docs/20260711-widget-kit.html.meta.yaml', asset_dir: 'assets/img/widget-kit', manifest_path: 'assets/img/widget-kit/manifest.json', source_url: 'https://github.com/acme/widget-kit', style: 'darkblue', category: '开发工具', keywords: ['widget'], wiki: { raw_path: 'raw/a.md', knowledge_path: 'concepts/a.md' } };
  const facts = { source_url: bundle.source_url, retrieved_at: '2026-07-11T00:00:00Z', repo_meta: { name: 'Widget Kit', title: 'Acme Widget Kit' }, claims: ['Fast local rendering engine', 'Portable zero dependency CLI'], required_sections: ['Installation', 'Architecture'], assets: [], min_claim_coverage: 2 };
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>@media (max-width: 700px){.card{width:100%}}</style></head><body><header class="hero"><h1>Widget Kit</h1></header><main><h2>Installation</h2><p>Portable zero dependency CLI.</p><h2>Architecture</h2><p>Fast local rendering engine.</p></main></body></html>`;
  fs.mkdirSync(path.join(root, '.tmp/infocard', bundle.slug), { recursive: true });
  fs.mkdirSync(path.join(root, path.dirname(bundle.html_path)), { recursive: true });
  fs.mkdirSync(path.join(root, bundle.asset_dir), { recursive: true });
  fs.writeFileSync(path.join(root, 'bundle.json'), JSON.stringify(bundle));
  fs.writeFileSync(path.join(root, '.tmp/infocard', bundle.slug, 'facts.json'), JSON.stringify({ ...facts, ...(overrides.facts || {}) }));
  fs.writeFileSync(path.join(root, bundle.manifest_path), JSON.stringify({ assets: [] }));
  if (!overrides.missingHtml) fs.writeFileSync(path.join(root, bundle.html_path), overrides.html === undefined ? html : overrides.html);
  return { root, bundle };
}
function verify(f) { delete require.cache[require.resolve(MODULE)]; return require(MODULE).verifyCardContent(f.bundle, f.root); }

test('accepts complete content contract and normalized entity/case evidence', () => {
  const f = fixture({ html: `<!doctype html><meta name="viewport" content="width=device-width"><style>@media screen and (max-width:600px){body{margin:0}}</style><header class=hero><h1>WIDGET&nbsp;KIT</h1></header><h2>installation</h2><p>portable zero dependency cli</p><h2>ARCHITECTURE</h2><p>fast local rendering engine</p>` });
  assert.deepEqual(verify(f), { valid: true, errors: [], claim_coverage: { matched: 2, required: 2, total: 2 } });
});

test('rejects missing/empty HTML, hero identity, required section, claim coverage, viewport and mobile rule', () => {
  const cases = [
    [{ missingHtml: true }, 'html'], [{ html: '' }, 'html'],
    [{ html: '<meta name="viewport" content="width=device-width"><style>@media(max-width:1px){}</style><h1>Other</h1><h2>Installation</h2><h2>Architecture</h2><p>Fast local rendering engine Portable zero dependency CLI</p>' }, 'hero'],
    [{ html: '<meta name="viewport" content="width=device-width"><style>@media(max-width:1px){}</style><header class=hero>Widget Kit</header><h2>Installation</h2><p>Fast local rendering engine Portable zero dependency CLI</p>' }, 'required_sections.1'],
    [{ facts: { claims: ['Alpha unique fact', 'Beta unique fact'], min_claim_coverage: 2 }, html: '<meta name="viewport" content="width=device-width"><style>@media(max-width:1px){}</style><header class=hero>Widget Kit</header><h2>Installation</h2><h2>Architecture</h2><p>Alpha unique fact</p>' }, 'claims'],
    [{ html: '<style>@media(max-width:1px){}</style><header class=hero>Widget Kit</header><h2>Installation</h2><h2>Architecture</h2><p>Fast local rendering engine Portable zero dependency CLI</p>' }, 'viewport'],
    [{ html: '<meta name="viewport" content="width=device-width"><header class=hero>Widget Kit</header><h2>Installation</h2><h2>Architecture</h2><p>Fast local rendering engine Portable zero dependency CLI</p>' }, 'mobile_media']
  ];
  for (const [options, field] of cases) { const result = verify(fixture(options)); assert.equal(result.valid, false, field); assert.ok(result.errors.some(e => e.field === field), `${field}: ${JSON.stringify(result)}`); }
});

test('infers identity from source owner/repo and ignores scripts/styles as textual evidence', () => {
  const pass = fixture({ facts: { repo_meta: {} }, html: '<meta name=viewport content="width=device-width"><style>@media(max-width:2px){} .x{content:"Architecture Fast local rendering engine"}</style><header class=hero>acme / widget-kit</header><h2>Installation</h2><h2>Architecture</h2><p>Fast local rendering engine Portable zero dependency CLI</p>' });
  assert.equal(verify(pass).valid, true);
  const fail = fixture({ html: '<meta name=viewport content="width=device-width"><style>@media(max-width:2px){} .x{content:"Widget Kit Architecture Fast local rendering engine Portable zero dependency CLI"}</style><script>"Installation"</script><header class=hero>Other</header>' });
  assert.equal(verify(fail).valid, false);
});

test('uses documented default claim coverage when configured threshold invalid', () => {
  const f = fixture({ facts: { min_claim_coverage: 'bad' }, html: '<meta name=viewport content="width=device-width"><style>@media(max-width:2px){}</style><header class=hero>Widget Kit</header><h2>Installation</h2><h2>Architecture</h2><p>Fast local rendering engine</p>' });
  const result = verify(f); assert.equal(result.valid, true); assert.equal(result.claim_coverage.required, 1);
});

test('CLI emits structured JSON and exit codes', () => {
  const f = fixture();
  const ok = spawnSync(process.execPath, [MODULE, '--bundle', path.join(f.root, 'bundle.json')], { cwd: f.root, encoding: 'utf8' });
  assert.equal(ok.status, 0); assert.equal(JSON.parse(ok.stdout).valid, true);
  for (const args of [[], ['--bundle'], ['--bundle', '/missing']]) { const result = spawnSync(process.execPath, [MODULE, ...args], { cwd: f.root, encoding: 'utf8' }); assert.notEqual(result.status, 0); assert.equal(JSON.parse(result.stdout).valid, false); }
});

test('rejects invalid bundle and malformed facts as structured errors', () => {
  const f = fixture(); f.bundle.keywords = []; assert.equal(verify(f).valid, false);
  const g = fixture(); fs.writeFileSync(path.join(g.root, '.tmp/infocard', g.bundle.slug, 'facts.json'), '{bad'); assert.equal(verify(g).valid, false);
});
