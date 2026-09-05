'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  FULL_ROUTE_LIMIT_MS,
  FULL_ROUTE_STAGES,
  FULL_ROUTE_HARD_STOPS,
  evaluateFullRouteSla,
} = require('../lib/infocard-full-route');

test('full route has a thirty-minute bounded budget with a reserve', () => {
  const result = evaluateFullRouteSla(Object.fromEntries(FULL_ROUTE_STAGES));
  assert.equal(FULL_ROUTE_LIMIT_MS, 30 * 60 * 1000);
  assert.equal(result.valid, true);
  assert.equal(result.budget_total_ms, 27 * 60 * 1000);
  assert.equal(result.buffer_ms, 3 * 60 * 1000);
  assert.equal(FULL_ROUTE_HARD_STOPS.at(-1).action, 'terminate');
});

test('full route rejects missing, unknown, and over-budget stages', () => {
  const result = evaluateFullRouteSla({ research: 240001, unknown: 1 });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.stage === 'research'));
  assert.ok(result.errors.some((item) => item.stage === 'unknown'));
  assert.ok(result.errors.some((item) => item.message === 'stage is missing'));
});

// The lock is a public coordination seam: same slug may not have two active authors.
test('high-density directories are routed to the bounded full route', () => {
  const { classifyRoute } = require('../lib/infocard-route');
  const result = classifyRoute({ canonicalUrl: 'https://example.test/', highDensity: true, categoryCount: 20, itemCount: 121 });
  assert.equal(result.route, 'full');
  assert.match(result.reason, /高密度目录/);
});

// The lock is a public coordination seam: same slug may not have two active authors.
test('authoring lock allows one owner and rejects a second owner until release', () => {
  const { createAuthoringLock } = require('../lib/infocard-authoring-lock');
  const lock = createAuthoringLock();
  assert.deepEqual(lock.acquire('demo', 'deleg-1'), { acquired: true, owner: 'deleg-1' });
  assert.deepEqual(lock.acquire('demo', 'deleg-2'), { acquired: false, owner: 'deleg-1' });
  assert.deepEqual(lock.release('demo', 'deleg-1'), { released: true });
  assert.deepEqual(lock.acquire('demo', 'deleg-2'), { acquired: true, owner: 'deleg-2' });
});

test('authoring policy becomes write-only after one decision read', () => {
  const { authoringPlan } = require('../lib/infocard-authoring-lock');
  const plan = authoringPlan({ sourceBriefComplete: true, themeDecisionPath: '.docs/demo/theme-decision.json' });
  assert.deepEqual(plan.allowedReads, ['.docs/demo/theme-decision.json']);
  assert.deepEqual(plan.requiredWrites, ['card.html', 'card.html.meta.yaml', 'research.md', 'visual/evidence_gap.md', 'promotion-manifest.json']);
  assert.equal(plan.maxNoWriteMs, 60000);
});

// Batch visual infrastructure is a shared seam, not a per-card retry loop.
test('visual preflight produces one reusable pending disposition when capture is unavailable', () => {
  const { visualPreflight } = require('../lib/infocard-authoring-lock');
  assert.deepEqual(visualPreflight({ cdpAvailable: false, captureAvailable: false }), {
    status: 'VISUAL_PENDING', error_category: 'browser_capture_unavailable', retryPerCard: false,
  });
});

// New sidecars must not invoke git show HEAD:path in timestamp comparisons.
test('new metadata is not taxonomy-only and does not need a HEAD read', () => {
  const { classifyMetadataAtHead } = require('../verify-meta-timestamps');
  assert.deepEqual(classifyMetadataAtHead('docs/new.html.meta.yaml', 'date: "2026-08-31 00:00:00"\n', () => { throw new Error('must not read HEAD'); }), {
    state: 'new', taxonomyOnly: false,
  });
});

// Hashing must happen after timestamp normalization, so the sidecar remains stable.
test('publish order refreshes updated before promotion for an existing card', () => {
  const { publishOrder } = require('../lib/infocard-authoring-lock');
  assert.deepEqual(publishOrder(), ['promotion', 'build_timestamp_normalization', 'sync_candidate_sidecar', 'recompute_manifest_hashes', 'verify', 'commit_push']);
  assert.deepEqual(publishOrder({ update: true }), ['sync_publish_metadata', 'promotion', 'build_timestamp_normalization', 'sync_candidate_sidecar', 'recompute_manifest_hashes', 'verify', 'commit_push']);
});

test('update sidecar always refreshes updated while preserving original date', () => {
  const { updateSidecar } = require('../sync-publish-metadata');
  const raw = 'slug: demo\npath: docs/demo.html\ndate: "2026-01-01 10:00:00"\nupdated: "2026-01-01 10:00:00"\n';
  const next = updateSidecar(raw, { isNew: false, changedHtml: true, timestamp: '2026-09-05 20:00:00' });
  assert.match(next, /date: "2026-01-01 10:00:00"/);
  assert.match(next, /updated: "2026-09-05 20:00:00"/);
});

test('new sidecar sets date and updated to the same timestamp', () => {
  const { updateSidecar } = require('../sync-publish-metadata');
  const raw = 'slug: demo\npath: docs/demo.html\n';
  const next = updateSidecar(raw, { isNew: true, changedHtml: true, timestamp: '2026-09-05 20:01:00' });
  assert.match(next, /date: "2026-09-05 20:01:00"/);
  assert.match(next, /updated: "2026-09-05 20:01:00"/);
});

test('timeout handoff is filesystem-first and never redelegates the same slug', () => {
  const { timeoutHandoffState } = require('../lib/infocard-authoring-lock');
  assert.deepEqual(timeoutHandoffState({ cardHtml: true, meta: true, manifest: true }), { state: 'AUTHORING_COMPLETE', action: 'continue_at_publisher', redelegate: false });
  assert.deepEqual(timeoutHandoffState({}), { state: 'TIMEOUT_NO_AUTHORING_OR_PARTIAL', action: 'publisher_takeover_same_directory', redelegate: false });
  assert.deepEqual(timeoutHandoffState({ frozenContract: false }), { state: 'BLOCKED_AT_PREFLIGHT', action: 'stop', redelegate: false });
});

// Palette literals in :root are legal; component literals remain blocked.
test('theme contract permits root palette literals but rejects component literals', () => {
  const { colorLiteralMatches } = require('../lib/theme-contract');
  const css = ':root{--alpha:rgba(1,2,3,.5)} .card{background:var(--alpha)} .bad{color:rgb(1,2,3)}';
  const component = css.replace(/:root\s*\{[^{}]*\}/gi, '');
  assert.deepEqual(colorLiteralMatches(component), ['rgb(']);
});
