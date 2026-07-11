'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const MODULE_PATH = path.join(ROOT, 'scripts/verify-agent1-delivery.js');

function bundle() {
  return {
    slug: 'agent1-delivery',
    html_path: 'docs/20260711-agent1-delivery.html',
    meta_path: 'docs/20260711-agent1-delivery.html.meta.yaml',
    asset_dir: 'assets/img/agent1-delivery',
    manifest_path: 'assets/img/agent1-delivery/manifest.json',
    source_url: 'https://example.com/source',
    style: 'darkblue',
    category: '开发工具',
    keywords: ['agent1'],
    wiki: { raw_path: 'raw/article.md', knowledge_path: 'concepts/article.md' },
  };
}

function fixture(options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent1-delivery-'));
  const value = bundle();
  const factsDir = path.join(root, '.tmp/infocard', value.slug);
  const assetDir = path.join(root, value.asset_dir);
  fs.mkdirSync(factsDir, { recursive: true });
  fs.mkdirSync(assetDir, { recursive: true });
  fs.writeFileSync(path.join(factsDir, 'research.md'), '# Research\nUseful evidence.\n');
  const image = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  fs.writeFileSync(path.join(assetDir, 'hero.png'), image);
  const facts = {
    source_url: value.source_url,
    retrieved_at: '2026-07-11T00:00:00Z',
    repo_meta: { stars: 42 },
    claims: ['The project exists.'],
    required_sections: ['overview'],
    assets: [{ local_path: 'hero.png' }],
  };
  const manifest = { assets: [{ local_path: 'hero.png', bytes: image.length }] };
  fs.writeFileSync(path.join(factsDir, 'facts.json'), JSON.stringify(facts));
  fs.writeFileSync(path.join(assetDir, 'manifest.json'), JSON.stringify(manifest));
  fs.writeFileSync(path.join(root, 'bundle.json'), JSON.stringify(value));
  if (options.noAssets) {
    facts.assets = [];
    manifest.assets = [];
    manifest.reason = 'Source page has no useful images.';
    fs.writeFileSync(path.join(factsDir, 'facts.json'), JSON.stringify(facts));
    fs.writeFileSync(path.join(assetDir, 'manifest.json'), JSON.stringify(manifest));
  }
  return { root, value, factsDir, assetDir, facts, manifest };
}

function verifyAt(f) {
  delete require.cache[require.resolve(MODULE_PATH)];
  return require(MODULE_PATH).verifyAgent1Delivery(f.value, f.root);
}

for (const missing of ['facts', 'research', 'manifest']) {
  test(`rejects missing or empty ${missing} delivery`, () => {
    for (const empty of [false, true]) {
      const f = fixture();
      const file = missing === 'facts' ? path.join(f.factsDir, 'facts.json')
        : missing === 'research' ? path.join(f.factsDir, 'research.md')
          : path.join(f.assetDir, 'manifest.json');
      empty ? fs.writeFileSync(file, '') : fs.unlinkSync(file);
      const result = verifyAt(f);
      assert.equal(result.valid, false);
      assert.ok(result.errors.some((error) => error.field === missing), `${missing}, empty=${empty}`);
    }
  });
}

test('rejects source mismatch and required empty facts fields', () => {
  const cases = [
    ['source_url', 'https://wrong.example/source'],
    ['repo_meta', null],
    ['claims', []],
    ['required_sections', []],
    ['assets', null],
  ];
  for (const [field, invalid] of cases) {
    const f = fixture();
    f.facts[field] = invalid;
    fs.writeFileSync(path.join(f.factsDir, 'facts.json'), JSON.stringify(f.facts));
    const result = verifyAt(f);
    assert.equal(result.valid, false, field);
    assert.ok(result.errors.some((error) => error.field === `facts.${field}`), field);
  }
});

test('rejects unparseable manifest JSON', () => {
  const f = fixture();
  fs.writeFileSync(path.join(f.assetDir, 'manifest.json'), '{broken');
  const result = verifyAt(f);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.field === 'manifest'));
});

test('rejects missing, zero-byte, traversal, bad extension, and byte mismatch assets', () => {
  const cases = [
    ['missing.png', null],
    ['empty.png', Buffer.alloc(0)],
    ['../escape.png', Buffer.from('x')],
    ['payload.exe', Buffer.from('x')],
    ['hero.png', Buffer.from('different')],
  ];
  for (const [localPath, contents] of cases) {
    const f = fixture();
    if (contents && !localPath.includes('..')) fs.writeFileSync(path.join(f.assetDir, localPath), contents);
    f.manifest.assets = [{ local_path: localPath, bytes: localPath === 'hero.png' ? 999 : undefined }];
    fs.writeFileSync(path.join(f.assetDir, 'manifest.json'), JSON.stringify(f.manifest));
    const result = verifyAt(f);
    assert.equal(result.valid, false, localPath);
    assert.ok(result.errors.some((error) => error.field.startsWith('manifest.assets')), localPath);
  }
});

test('validates populated facts asset paths', () => {
  const f = fixture();
  f.facts.assets = [{ local_path: '../escape.png' }];
  fs.writeFileSync(path.join(f.factsDir, 'facts.json'), JSON.stringify(f.facts));
  const result = verifyAt(f);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.field.startsWith('facts.assets')));
});

test('requires an explicit nonempty reason when manifest has no assets', () => {
  const f = fixture({ noAssets: true });
  delete f.manifest.reason;
  fs.writeFileSync(path.join(f.assetDir, 'manifest.json'), JSON.stringify(f.manifest));
  const result = verifyAt(f);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.field === 'manifest.reason'));
});

test('accepts complete asset and explicit no-assets deliveries', () => {
  assert.deepEqual(verifyAt(fixture()), { valid: true, errors: [] });
  assert.deepEqual(verifyAt(fixture({ noAssets: true })), { valid: true, errors: [] });
});

test('CLI emits JSON and exits zero on pass, nonzero on delivery failure', () => {
  const passFixture = fixture();
  const pass = spawnSync(process.execPath, [MODULE_PATH, '--bundle', path.join(passFixture.root, 'bundle.json')], {
    cwd: passFixture.root, encoding: 'utf8',
  });
  assert.equal(pass.status, 0, pass.stderr);
  assert.equal(JSON.parse(pass.stdout).valid, true);

  const failFixture = fixture();
  fs.unlinkSync(path.join(failFixture.factsDir, 'facts.json'));
  const fail = spawnSync(process.execPath, [MODULE_PATH, '--bundle', path.join(failFixture.root, 'bundle.json')], {
    cwd: failFixture.root, encoding: 'utf8',
  });
  assert.notEqual(fail.status, 0);
  assert.equal(JSON.parse(fail.stdout).valid, false);
});

test('CLI reports argument and bundle load failures as JSON', () => {
  for (const args of [[], ['--bundle'], ['--bundle', '/missing/bundle.json']]) {
    const result = spawnSync(process.execPath, [MODULE_PATH, ...args], { cwd: ROOT, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.equal(JSON.parse(result.stdout).valid, false);
  }
});
