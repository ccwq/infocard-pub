'use strict';

function createAuthoringLock() {
  const owners = new Map();
  return {
    acquire(slug, owner) {
      if (!slug || !owner) throw new TypeError('slug and owner are required');
      const existing = owners.get(slug);
      if (existing && existing !== owner) return { acquired: false, owner: existing };
      owners.set(slug, owner);
      return { acquired: true, owner };
    },
    release(slug, owner) {
      if (owners.get(slug) !== owner) return { released: false };
      owners.delete(slug);
      return { released: true };
    },
  };
}

function authoringPlan({ sourceBriefComplete, themeDecisionPath }) {
  if (!sourceBriefComplete || !themeDecisionPath) throw new TypeError('complete source brief and theme decision path are required');
  return {
    allowedReads: [themeDecisionPath],
    requiredWrites: ['card.html', 'card.html.meta.yaml', 'research.md', 'visual/evidence_gap.md', 'promotion-manifest.json'],
    maxNoWriteMs: 60000,
    stopAtMs: 60000,
  };
}

function visualPreflight({ cdpAvailable, captureAvailable }) {
  if (cdpAvailable && captureAvailable) return { status: 'VISUAL_ACTIVE', error_category: null, retryPerCard: true };
  return { status: 'VISUAL_PENDING', error_category: 'browser_capture_unavailable', retryPerCard: false };
}

function publishOrder() {
  return ['promotion', 'build_timestamp_normalization', 'sync_candidate_sidecar', 'recompute_manifest_hashes', 'verify', 'commit_push'];
}

module.exports = { createAuthoringLock, authoringPlan, visualPreflight, publishOrder };
