#!/usr/bin/env node
/**
 * jsdom-vue-mount-check.js
 *
 * Verifies that a built infocard-pub index.html actually mounts its Vue app
 * and renders real card links — without needing a browser, and without
 * depending on GitHub Pages CDN freshness.
 *
 * Use when:
 *   - You want a deterministic post-build/runtime sanity check (not just HTTP 200).
 *   - browser_navigate refuses to load the public URL.
 *   - You need to confirm the fix before pushing, OR after pushing but before
 *     the Pages CDN has refreshed.
 *
 * Usage:
 *   node scripts/jsdom-vue-mount-check.js <index.html> <vue.js> <yaml.js> <index.js> [knownTitle]
 *
 * Defaults knownTitle="BrowserSkill" (a card known to be present in the
 * current 514-card archive).
 *
 * Exit codes:
 *   0 = Vue mounted and at least one card link rendered
 *   1 = mount failed (Vue missing, app empty, or no card links)
 *   2 = bad usage / missing files
 *
 * Pair with `npm run build` so the dist/ inputs are fresh:
 *   npm run build && node scripts/jsdom-vue-mount-check.js \
 *     dist/index.html \
 *     dist/assets/home/vendor/vue.global.prod.js \
 *     dist/assets/home/vendor/js-yaml.min.js \
 *     dist/assets/home/index.js
 */
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
if (argv.length < 4) {
  console.error('usage: jsdom-vue-mount-check.js <index.html> <vue.js> <yaml.js> <index.js> [knownTitle]');
  process.exit(2);
}
const [htmlPath, vuePath, yamlPath, idxPath] = argv;
const knownTitle = argv[4] || 'BrowserSkill';

for (const p of [htmlPath, vuePath, yamlPath, idxPath]) {
  if (!fs.existsSync(p)) {
    console.error(`missing file: ${p}`);
    process.exit(2);
  }
}

let JSDOM;
try {
  ({ JSDOM } = require('jsdom'));
} catch (e) {
  console.error('jsdom not installed. Run: npm install --no-save jsdom');
  process.exit(2);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const vue  = fs.readFileSync(vuePath, 'utf8');
const yaml = fs.readFileSync(yamlPath, 'utf8');
const idx  = fs.readFileSync(idxPath, 'utf8');

// Strip external scripts/styles so jsdom doesn't try to fetch them.
let stripped = html
  .replace(/<script\b[^>]*src=["'][^"']*["'][^>]*>\s*<\/script>/g, '')
  .replace(/<link[^>]*stylesheet[^>]*>/g, '');

const dom = new JSDOM(stripped, {
  url: 'http://localhost/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
});
const w = dom.window;
const errs = [];
w.addEventListener('error', (e) => errs.push('window error: ' + (e.error?.stack || e.message)));
w.addEventListener('unhandledrejection', (e) => errs.push('rejection: ' + (e.reason?.stack || e.reason)));

function inject(t) {
  const s = w.document.createElement('script');
  s.textContent = t;
  w.document.body.appendChild(s);
}
inject(vue);
inject(yaml);
inject(idx);

setTimeout(() => {
  const app = w.document.getElementById('app');
  const report = {
    hasVue: typeof w.Vue,
    hasYaml: typeof w.jsyaml,
    appExists: !!app,
    appInnerLen: app ? app.innerHTML.length : -1,
    cardLinks: w.document.querySelectorAll('#app a[href]').length,
    titleVisible: app ? app.innerHTML.includes(knownTitle) : false,
    errs,
  };
  console.log(JSON.stringify(report, null, 2));

  const ok =
    report.hasVue === 'object' &&
    report.appExists &&
    report.appInnerLen > 1000 &&
    report.cardLinks > 0 &&
    report.titleVisible &&
    report.errs.length === 0;
  process.exit(ok ? 0 : 1);
}, 800);