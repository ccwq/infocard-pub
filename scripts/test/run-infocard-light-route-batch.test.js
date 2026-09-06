'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { main } = require('../run-infocard-light-route');
const { loadBatchState } = require('../lib/infocard-batch-state');

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'infocard-light-route-batch-'));
  write(path.join(root, 'package.json'), JSON.stringify({
    private: true,
    scripts: {
      build: 'node -e "process.exit(0)"',
      verify: 'node -e "process.exit(0)"',
      'verify:visual-gate': 'node -e "process.exit(0)"',
    },
  }, null, 2));
  write(path.join(root, 'theme/darkblue.html'), '<html></html>');
  write(path.join(root, 'theme/themes.json'), JSON.stringify({ themes: {
    darkblue: { template: 'theme/darkblue.html', capabilities: {}, structural_signature: [] },
  } }, null, 2));
  write(path.join(root, 'scripts/verify-taxonomy.js'), '#!/usr/bin/env node\nprocess.exit(0)\n');
  write(path.join(root, 'scripts/check-info-leak.js'), '#!/usr/bin/env node\nprocess.exit(0)\n');
  write(path.join(root, 'scripts/verify-visual-gate.js'), '#!/usr/bin/env node\nprocess.exit(0)\n');
  write(path.join(root, 'scripts/post-publish-verify.js'), '#!/usr/bin/env node\nprocess.exit(0)\n');
  const runId = 'run-1';
  const slug = 'demo';
  const authoringDir = `.docs/${runId}/${slug}`;
  const htmlPath = 'docs/20260831-demo.html';
  const metaPath = `${authoringDir}/card.html.meta.yaml`;
  const manifestPath = `${authoringDir}/promotion-manifest.json`;
  const themeDecisionPath = `${authoringDir}/theme-decision.json`;
  const briefPath = `${authoringDir}/project-brief.json`;
  const factsPath = `${authoringDir}/facts.json`;
  const batchStatePath = `${authoringDir}/batch-state.json`;
  write(path.join(root, authoringDir, 'card.html'), '<!doctype html><html data-theme="darkblue"><style>:root{--accent:#000}.card{color:var(--accent)}</style><body>demo</body></html>');
  write(path.join(root, authoringDir, 'card.html.meta.yaml'), 'slug: demo\npath: docs/20260831-demo.html\nstyle: darkblue\n');
  write(path.join(root, authoringDir, 'project-brief.json'), JSON.stringify({ version: 1, route: 'light', hero: 'demo', summary: 'demo', core_capabilities: ['A'], tech_stack: ['JS'], usage: ['run'], use_cases: ['docs'], risk_boundary: 'bounded', sources: ['https://example.com/demo'], source_boundary: { canonical: 'https://example.com/demo', discovery: null } }, null, 2));
  write(path.join(root, authoringDir, 'facts.json'), JSON.stringify({ source: 'https://example.com/demo' }, null, 2));
  write(path.join(root, authoringDir, 'theme-decision.json'), JSON.stringify({ version: 1, content_type: 'tool', content_shape: 'brief', required_capabilities: [], candidate_themes: ['darkblue'], excluded_themes: [], selection_weights: { darkblue: 1 }, seed: 'fixture', selected_theme: 'darkblue', user_override: { requested: null, accepted: false, reason: null } }, null, 2));
  const bundle = {
    slug,
    html_path: 'docs/20260831-demo.html',
    meta_path: 'docs/20260831-demo.html.meta.yaml',
    asset_dir: 'assets/img/demo',
    manifest_path: 'assets/img/demo/manifest.json',
    source_url: 'https://example.com/demo',
    style: 'darkblue',
    category: 'tool',
    keywords: ['demo'],
    wiki: { raw_path: 'raw/demo.md', knowledge_path: 'concepts/demo.md' },
  };
  const files = [
    { source: `${authoringDir}/card.html`, destination: bundle.html_path },
    { source: `${authoringDir}/card.html.meta.yaml`, destination: bundle.meta_path },
  ].map((item) => {
    const sourcePath = path.join(root, item.source);
    const sha256 = require('node:crypto').createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex');
    return { ...item, sha256 };
  });
  write(path.join(root, authoringDir, 'promotion-manifest.json'), JSON.stringify({ card: slug, bundle, files }, null, 2));
  const config = {
    runId,
    slug,
    htmlPath,
    diagnosticsPath: `${authoringDir}/timing.jsonl`,
    batchStatePath,
    request: { sourceUrl: 'https://example.com/demo', topic: 'demo' },
    preflight: {
      authoringDir,
      briefPath,
      factsPath,
      themeDecisionPath,
      metaPath,
      manifestPath,
    },
    stageCommands: {
      research: [process.execPath, '-e', 'process.exit(0)'],
      authoring: [process.execPath, '-e', 'process.exit(0)'],
      build: [process.execPath, '-e', 'process.exit(0)'],
      verify: [process.execPath, '-e', 'process.exit(0)'],
      visual_capture: [process.execPath, '-e', 'process.exit(0)'],
      visual_review: [process.execPath, '-e', 'process.exit(0)'],
      release: [process.execPath, '-e', 'process.exit(0)'],
    },
  };
  const configPath = path.join(root, 'run.json');
  write(configPath, JSON.stringify(config, null, 2));
  return { root, configPath, batchStatePath: path.join(root, batchStatePath), slug };
}

test('run route updates batch-state through publish completion', async () => {
  const f = fixture();
  const result = await main(['--config', f.configPath], f.root);
  assert.equal(result.terminalState, 'PUBLISHED_VERIFIED', JSON.stringify(result));
  const state = loadBatchState(f.batchStatePath);
  assert.equal(state.cards[f.slug].state, 'PUBLIC_VERIFIED');
  assert.equal(state.shared.build, 'passed');
  assert.equal(state.shared.verify, 'passed');
  assert.equal(state.shared.commit, 'passed');
  assert.equal(state.shared.push, 'passed');
});
