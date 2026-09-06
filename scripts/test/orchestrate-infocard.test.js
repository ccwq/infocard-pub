'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { main, parseConfigPath } = require('../orchestrate-infocard');

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestrate-infocard-'));
  const runId = 'run-1';
  const slug = 'demo';
  const authoringDir = `.docs/${runId}/${slug}`;
  write(path.join(root, 'theme/darkblue.html'), '<html></html>');
  write(path.join(root, 'theme/themes.json'), JSON.stringify({ themes: {
    darkblue: { template: 'theme/darkblue.html', capabilities: {}, structural_signature: [] },
  } }, null, 2));
  write(path.join(root, 'scripts/verify-taxonomy.js'), '#!/usr/bin/env node\nprocess.exit(0)\n');
  write(path.join(root, 'scripts/check-info-leak.js'), '#!/usr/bin/env node\nprocess.exit(0)\n');
  write(path.join(root, 'scripts/verify-visual-gate.js'), '#!/usr/bin/env node\nprocess.exit(0)\n');
  write(path.join(root, 'scripts/post-publish-verify.js'), '#!/usr/bin/env node\nprocess.exit(0)\n');
  write(path.join(root, authoringDir, 'card.html'), '<!doctype html><html data-theme="darkblue"><style>:root{--accent:#000}body{color:var(--accent)}</style><body>demo</body></html>');
  write(path.join(root, authoringDir, 'card.html.meta.yaml'), 'slug: demo\npath: docs/20260831-demo.html\nstyle: darkblue\n');
  write(path.join(root, authoringDir, 'project-brief.json'), JSON.stringify({ version: 1, route: 'light', hero: 'demo', summary: 'demo', core_capabilities: ['A'], tech_stack: ['JS'], usage: ['run'], use_cases: ['docs'], risk_boundary: 'bounded', sources: ['https://example.com/demo'], source_boundary: { canonical: 'https://example.com/demo', discovery: null } }, null, 2));
  write(path.join(root, authoringDir, 'facts.json'), JSON.stringify({ source: 'https://example.com/demo' }, null, 2));
  write(path.join(root, authoringDir, 'theme-decision.json'), JSON.stringify({ version: 1, content_type: 'tool', content_shape: 'brief', required_capabilities: [], candidate_themes: ['darkblue'], excluded_themes: [], selection_weights: { darkblue: 1 }, seed: 'fixture', selected_theme: 'darkblue', user_override: { requested: null, accepted: false, reason: null } }, null, 2));
  const config = {
    runId,
    slug,
    htmlPath: 'docs/20260831-demo.html',
    diagnosticsPath: `${authoringDir}/timing.jsonl`,
    batchStatePath: `${authoringDir}/batch-state.json`,
    request: { sourceUrl: 'https://example.com/demo', topic: 'demo' },
    preflight: {
      authoringDir,
      briefPath: `${authoringDir}/project-brief.json`,
      factsPath: `${authoringDir}/facts.json`,
      themeDecisionPath: `${authoringDir}/theme-decision.json`,
      metaPath: `${authoringDir}/card.html.meta.yaml`,
      manifestPath: `${authoringDir}/promotion-manifest.json`,
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
  return { root, configPath };
}

test('orchestrate entry delegates light routes and reports unified batch state path', async () => {
  const f = fixture();
  const result = await main(['--config', f.configPath], f.root);
  assert.equal(result.orchestrated, true);
  assert.equal(result.route.route, 'light');
  assert.ok(result.batchStatePath.endsWith('batch-state.json'));
});

test('parseConfigPath enforces explicit config usage', () => {
  assert.throws(() => parseConfigPath([]), /--config/);
  assert.equal(parseConfigPath(['--config', 'demo.json']), 'demo.json');
});
