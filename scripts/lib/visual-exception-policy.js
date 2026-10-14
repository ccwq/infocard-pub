'use strict';
// Per-card/check budgets; this validates evidence, never manufactures it.
function validateVisualBudgetException(m, currentHash) {
  const errors = [];
  const add = (field, message) => errors.push({ field, message });
  if (!Array.isArray(m.checks) || !m.checks.length) return [{field:'manifest.checks',message:'non-empty per-check evidence required'}];
  const seen = new Set();
  for (const [i,c] of m.checks.entries()) {
    const p = `manifest.checks[${i}]`;
    if (!c || typeof c !== 'object') { add(p,'check object required'); continue; }
    if (!c.id || seen.has(c.id)) add(p+'.id','unique check id required');
    seen.add(c.id);
    if (!['desktop','mobile'].includes(c.viewport)) add(p+'.viewport','desktop or mobile required');
    if (c.html_sha256 !== currentHash) add(p+'.html_sha256','current hash required');
    if (c.status === 'passed') {
      if (!c.review || c.review.critical !== 0 || c.review.major !== 0 || !c.review.screenshot_path) add(p+'.review','zero-defect screenshot review required');
      continue;
    }
    if (c.status === 'tool_exhausted') {
      if (!Array.isArray(c.attempts) || c.attempts.length !== 3) { add(p+'.attempts','initial plus two retries required'); continue; }
      c.attempts.forEach((a,j)=>{
        if (!a || a.attempt !== j+1 || a.type !== 'infrastructure_failure' || !a.error_category || !a.error || !a.strategy || a.evidence_gap !== true) add(p+`.attempts[${j}]`,'ordered real tool error and strategy required');
        if (a && (a.review || a.critical !== undefined || a.major !== undefined)) add(p+`.attempts[${j}]`,'tool failure must not invent review');
      });
      if (!Array.isArray(c.remaining_defects)) add(p+'.remaining_defects','retain known defects, including empty list');
      continue;
    }
    if (c.status === 'repairs_exhausted') {
      if (!c.initial_review || !c.initial_review.screenshot_path || !(c.initial_review.critical > 0 || c.initial_review.major > 0)) add(p+'.initial_review','initial defect evidence required');
      if (!Array.isArray(c.repairs) || c.repairs.length !== 3) { add(p+'.repairs','exactly three repair rounds required'); continue; }
      c.repairs.forEach((r,j)=>{
        if (!r || r.round !== j+1 || r.change_made !== true || !r.change_description || !/^[a-f0-9]{64}$/.test(r.before_hash || '') || !/^[a-f0-9]{64}$/.test(r.after_hash || '') || r.before_hash === r.after_hash) add(p+`.repairs[${j}]`,'real change and different valid hashes required');
        if (r && j && r.before_hash !== c.repairs[j-1].after_hash) add(p+`.repairs[${j}]`,'hash chain broken');
        if (!r || !r.review || !r.review.screenshot_path || !Number.isInteger(r.review.critical) || !Number.isInteger(r.review.major) || r.review.critical < 0 || r.review.major < 0 || !(r.review.critical > 0 || r.review.major > 0)) add(p+`.repairs[${j}].review`,'fresh unresolved defect review required');
      });
      if (c.repairs[2].after_hash !== currentHash) add(p+'.repairs','last repair must match current HTML');
      if (!Array.isArray(c.remaining_defects) || !c.remaining_defects.length || c.remaining_defects.some(d=>!d || !d.description || !d.impact)) add(p+'.remaining_defects','remaining defects and impacts required');
      continue;
    }
    add(p+'.status','passed, tool_exhausted or repairs_exhausted required');
  }
  for (const v of ['desktop','mobile']) if (!m.checks.some(c=>c && c.viewport===v)) add('manifest.checks','both viewports required');
  if (!m.checks.some(c=>c && ['tool_exhausted','repairs_exhausted'].includes(c.status))) add('manifest.checks','clean pass is not an exception');
  return errors;
}
module.exports = { validateVisualBudgetException };
