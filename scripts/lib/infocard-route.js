'use strict';

const DEFAULT_SENSITIVE_PATTERNS = [
  /敏感|隐私|漏洞|安全事件|政治|医疗|法律|争议|投诉|个人信息/i,
  /password|secret|token|credential|vulnerability|security incident|controversy/i,
];

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isXStatusUrl(value) {
  if (!nonEmpty(value)) return false;
  try { return /(^|\.)x\.com$/i.test(new URL(value).hostname) && /\/status\/\d+/.test(new URL(value).pathname); }
  catch (_) { return false; }
}

/**
 * Classify one infocard request before research or authoring starts.
 * The light route is deliberately conservative and has no network side effects.
 */
function classifyRoute(input = {}, options = {}) {
  const reasons = [];
  const declaredSources = Array.isArray(input.sources)
    ? input.sources.filter(nonEmpty)
    : (nonEmpty(input.sourceUrl) ? [input.sourceUrl.trim()] : []);
  const explicitCanonical = nonEmpty(input.canonicalUrl) ? input.canonicalUrl.trim() : null;
  const discovery = nonEmpty(input.discoveryUrl) ? input.discoveryUrl.trim() : (declaredSources.find(isXStatusUrl) || (isXStatusUrl(explicitCanonical) ? explicitCanonical : null));
  const canonical = explicitCanonical && !isXStatusUrl(explicitCanonical)
    ? explicitCanonical
    : (declaredSources.length === 1 && !isXStatusUrl(declaredSources[0]) ? declaredSources[0] : null);
  const sources = canonical ? [canonical] : [];
  if (sources.length === 0 && input.completeBrief === true && nonEmpty(input.brief)) sources.push('user-brief');
  const text = [input.topic, input.brief, input.content, ...(input.riskSignals || [])]
    .filter(nonEmpty).join('\n');
  const sensitivePatterns = options.sensitivePatterns || DEFAULT_SENSITIVE_PATTERNS;
  const risk = Array.isArray(input.riskSignals) && input.riskSignals.length > 0;

  if (sources.length !== 1) reasons.push(sources.length === 0 ? '需要一个完整来源或 brief' : '存在多个来源，需要多源事实裁决');
  if (discovery && !canonical) reasons.push('X 仅是 discovery source，必须先确认 canonical source');
  if (declaredSources.filter((item) => !isXStatusUrl(item)).length > 1) reasons.push('存在多个来源，需要多源事实裁决');
  if (input.batch === true || (Array.isArray(input.items) && input.items.length > 1)) reasons.push('批量对象不属于 light route');
  if (input.sourceConflict === true || input.requiresReconciliation === true) reasons.push('需要多源冲突 reconciliation');
  if (input.sourceCodeAudit === true || input.requiresSourceAudit === true) reasons.push('需要源码级审计');
  if (input.complexVisual === true || input.requiresComplexVisual === true) reasons.push('需要复杂视觉创作');
  if (input.highDensity === true || Number(input.categoryCount || 0) > 12 || Number(input.itemCount || 0) > 60) reasons.push('高密度目录内容不属于 light route');
  if (risk || sensitivePatterns.some((pattern) => pattern.test(text))) reasons.push('命中敏感或高风险声明');

  return {
    route: reasons.length === 0 ? 'light' : 'full',
    sources,
    reason: reasons.length === 0 ? '单一完整来源、低风险、单卡整理' : reasons.join('；'),
    source_boundary: { canonical: sources.length === 1 ? sources[0] : null, discovery },
    claim_status: reasons.length === 0 ? 'confirmed' : 'needs_bounded_research',
  };
}

module.exports = { classifyRoute, isXStatusUrl, DEFAULT_SENSITIVE_PATTERNS };
