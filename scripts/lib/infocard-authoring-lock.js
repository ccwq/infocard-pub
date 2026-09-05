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

function publishOrder({ update = false } = {}) {
  const order = [];
  if (update) order.push('sync_publish_metadata');
  order.push('promotion', 'build_timestamp_normalization', 'sync_candidate_sidecar', 'recompute_manifest_hashes', 'verify', 'commit_push');
  return order;
}

function timeoutHandoffState({ cardHtml = false, meta = false, manifest = false, frozenContract = true } = {}) {
  if (!frozenContract) return { state: 'BLOCKED_AT_PREFLIGHT', action: 'stop', redelegate: false };
  if (cardHtml && meta && manifest) return { state: 'AUTHORING_COMPLETE', action: 'continue_at_publisher', redelegate: false };
  return { state: 'TIMEOUT_NO_AUTHORING_OR_PARTIAL', action: 'publisher_takeover_same_directory', redelegate: false };
}

module.exports = { createAuthoringLock, authoringPlan, visualPreflight, publishOrder, timeoutHandoffState };
