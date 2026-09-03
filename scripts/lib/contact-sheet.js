'use strict';

const { validateCapturePlan } = require('./capture-plan');

/** Build the auditable two-panel review input metadata around existing raw PNGs. */
function createContactSheetEvidence({ plan, viewport, raw = {}, contactSheetPath } = {}) {
  const planResult = validateCapturePlan(plan);
  if (!planResult.valid) throw new TypeError(planResult.errors.join('; '));
  if (!['desktop', 'mobile'].includes(viewport)) throw new TypeError('viewport must be desktop or mobile');
  if (typeof contactSheetPath !== 'string' || !contactSheetPath.trim()) throw new TypeError('contactSheetPath is required');
  const panels = plan[viewport].map((region) => {
    const screenshotPath = raw[region];
    if (typeof screenshotPath !== 'string' || !screenshotPath.trim()) throw new TypeError(`raw screenshot is required for ${viewport}/${region}`);
    return { label: `${viewport} / ${region}`, region, screenshot_path: screenshotPath };
  });
  return { viewport, screenshot_path: contactSheetPath, panels };
}

function createContactSheetSet({ plan, raw, paths } = {}) {
  return {
    desktop: createContactSheetEvidence({ plan, viewport: 'desktop', raw: raw && raw.desktop, contactSheetPath: paths && paths.desktop }),
    mobile: createContactSheetEvidence({ plan, viewport: 'mobile', raw: raw && raw.mobile, contactSheetPath: paths && paths.mobile }),
  };
}

module.exports = { createContactSheetEvidence, createContactSheetSet };
