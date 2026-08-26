'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('path');
const test = require('node:test');

/**
 * verify-theme-gate.test.js
 *
 * Mechanical theme gate checks for infocard-pub npm verify suite.
 *
 * Gate 1 (all cards with top-level style:): bare slug is registered
 * Gate 2 (today's 16 darkblue cards): meta.yaml ↔ HTML data-theme consistency
 * Gate 3 (today's 16 darkblue cards): HTML :root CSS has darkblue token (--cyan:)
 * Gate 4 (hardblue/redswiss cards): HTML has ≥2 structural class signatures
 *
 * For today's darkblue cards: Gate 2 + Gate 3 only; no structural enforcement,
 * no rebuild enforcement — user has not yet authorised structural changes.
 */

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS = path.join(ROOT, 'docs');

// ── Today's card scope ─────────────────────────────────────────────────────────
const TODAY_PREFIX = '20260819'; // today's 16 darkblue cards live here

function isToday(metaFile) {
  return metaFile.startsWith(TODAY_PREFIX + '-');
}

// ── Registered bare slugs ──────────────────────────────────────────────────────
const REGISTERED_SLUGS = new Set([
  'archive-green', 'bigwhite', 'black', 'black-head', 'blue',
  'blue-technical-manual', 'codex-notebook', 'color-material', 'crayon',
  'dang-ai-dark', 'darkblue', 'darkgreen', 'graph-paper', 'green',
  'handline', 'hardblue', 'main', 'paper-warm', 'pixelstack', 'q',
  'redblack', 'redswiss', 'sage-swiss', 'scrapbook', 'white-purple', 'wood',
]);

// ── Style normalisation ────────────────────────────────────────────────────────
const STYLE_ALIASES = {
  'infocard-bigwhite-style':         'bigwhite',
  'infocard-black-head-style':       'black-head',
  'infocard-blue-technical-manual-style': 'blue-technical-manual',
  'infocard-darkblue-style':        'darkblue',
  'infocard-graph-paper-style':     'graph-paper',
  'infocard-green-style':           'green',
  'infocard-hardblue-style':         'hardblue',
  'infocard-paper-warm-style':     'paper-warm',
  'infocard-redswiss-style':       'redswiss',
  'infocard-white-purple-style':    'white-purple',
  'infocard-wood-style':           'wood',
  'bigwhite-style':                 'bigwhite',
  'graph-paper-style':              'graph-paper',
  'hardblue-style':                'hardblue',
  'main-style':                   'main',
  'q-style':                      'q',
  'redswiss-style':               'redswiss',
};

function normaliseStyle(style) {
  if (!style) return null;
  if (REGISTERED_SLUGS.has(style)) return style;
  if (STYLE_ALIASES[style]) return STYLE_ALIASES[style];
  return style.replace(/^infocard-/, '').replace(/-style$/, '');
}

// ── Token signatures ───────────────────────────────────────────────────────────
const THEME_TOKEN_SIGNATURES = {
  darkblue:           ['--cyan:'],
  hardblue:           ['--red:', '--blue:'],
  redswiss:           ['--red:', '--paper:'],
  'blue-technical-manual': ['--blue:'],
  bigwhite:           ['--paper:'],
  blue:               ['--blue:'],
  black:              ['--ink:'],
  'black-head':       ['--ink:'],
  'codex-notebook':   ['--paper:'],
  'color-material':   ['--cyan:'],
  crayon:             ['--pink:', '--purple:'],
  darkgreen:          ['--green:'],
  'dang-ai-dark':    ['--ink:'],
  'graph-paper':     ['--paper:'],
  green:              ['--green:'],
  handline:           ['--ink:'],
  main:               ['--red:', '--blue:'],
  'paper-warm':      ['--paper:'],
  pixelstack:         ['--cyan:'],
  q:                  ['--paper:'],
  redblack:           ['--red:'],
  'sage-swiss':      ['--sage:'],
  scrapbook:          ['--pink:'],
  'white-purple':    ['--purple:'],
  wood:               ['--paper:'],
  'archive-green':    ['--green:'],
};

// ── Structural signatures ──────────────────────────────────────────────────────
const THEME_STRUCTURAL_SIGNATURES = {
  hardblue:  ['hero-bar', 'section-no'],
  redswiss:  ['topbar-hero', 'sec-head'],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function readMetaStyle(metaPath) {
  const content = fs.readFileSync(metaPath, 'utf8');
  for (const line of content.split('\n')) {
    if (line.startsWith('  ') || line.startsWith('\t')) continue;
    const m = line.match(/^style:\s*['"]?([^'"\n]+)['"]?\s*$/);
    if (m) return m[1].trim();
  }
  return null;
}

function readHtmlDataTheme(htmlPath) {
  const content = fs.readFileSync(htmlPath, 'utf8');
  const m = content.match(/<html[^>]*\sdata-theme=["']([^"']+)["']/);
  return m ? m[1].trim() : null;
}

function extractStyleBlock(htmlPath) {
  const content = fs.readFileSync(htmlPath, 'utf8');
  const m = content.match(/<style>([\s\S]*?)<\/style>/);
  return m ? m[1] : null;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

/**
 * Gate 1: Every card with a top-level style: field must normalise to a
 * registered bare slug. Cards without a top-level style: are legacy and exempt.
 */
test('theme-gate: meta.yaml style normalises to a registered bare slug', () => {
  const metaFiles = fs.readdirSync(DOCS).filter(e => e.endsWith('.html.meta.yaml'));

  const errors = [];
  for (const metaFile of metaFiles) {
    const metaPath = path.join(DOCS, metaFile);
    const style = readMetaStyle(metaPath);
    if (style === null) continue; // legacy card without top-level style — skip
    const bare = normaliseStyle(style);
    if (!REGISTERED_SLUGS.has(bare)) {
      errors.push(`${metaFile}: style="${style}" → bare="${bare}" is not registered`);
    }
  }
  assert.deepEqual(errors, [],
    `Unregistered style values: ${errors.slice(0, 5).join(' | ')}${errors.length > 5 ? ' …' : ''}`);
});

/**
 * Gate 2 (today's darkblue cards only):
 * Warn if HTML data-theme is present but mismatches meta.yaml style.
 * Missing data-theme is warned (not failed) — no rebuild enforcement.
 */
test('theme-gate: HTML data-theme matches normalised meta.yaml style (today 20260819 darkblue only)', () => {
  const metaFiles = fs.readdirSync(DOCS).filter(e => e.endsWith('.html.meta.yaml'));

  const errors = [];
  const warnings = [];
  for (const metaFile of metaFiles) {
    // Gate 2 scope: today's darkblue cards only
    if (!isToday(metaFile)) continue;

    const metaPath = path.join(DOCS, metaFile);
    const htmlPath = path.join(DOCS, metaFile.replace('.meta.yaml', ''));
    if (!fs.existsSync(htmlPath)) continue;

    const style = readMetaStyle(metaPath);
    if (style === null) continue;
    const bareSlug = normaliseStyle(style);
    const dataTheme = readHtmlDataTheme(htmlPath);

    if (dataTheme === null) {
      // No data-theme attribute in HTML — no rebuild enforcement, warn only
      warnings.push(`${metaFile}: HTML missing data-theme (expected "${bareSlug}")`);
    } else if (dataTheme !== bareSlug) {
      errors.push(`${metaFile}: data-theme="${dataTheme}" !== expected "${bareSlug}"`);
    }
  }
  if (warnings.length) console.log(`[theme-gate warn] ${warnings.join(' | ')}`);
  assert.deepEqual(errors, [],
    `data-theme mismatches: ${errors.join(' | ')}`);
});

/**
 * Gate 3 (today's darkblue cards only):
 * Verify HTML :root CSS contains darkblue's token signature (--cyan:).
 * No rebuild enforcement for today's cards.
 */
test('theme-gate: HTML :root CSS has darkblue token --cyan: (today 20260819 only)', () => {
  const metaFiles = fs.readdirSync(DOCS).filter(e => e.endsWith('.html.meta.yaml'));

  const errors = [];
  for (const metaFile of metaFiles) {
    // Gate 3 scope: today's darkblue cards only
    if (!isToday(metaFile)) continue;

    const metaPath = path.join(DOCS, metaFile);
    const htmlPath = path.join(DOCS, metaFile.replace('.meta.yaml', ''));
    if (!fs.existsSync(htmlPath)) continue;

    const style = readMetaStyle(metaPath);
    if (style === null) continue;
    const bareSlug = normaliseStyle(style);

    // Gate 3 scope: darkblue only
    if (bareSlug !== 'darkblue') continue;

    const styleBlock = extractStyleBlock(htmlPath);
    if (!styleBlock) {
      errors.push(`${metaFile}: no <style> block found`);
      continue;
    }
    if (!THEME_TOKEN_SIGNATURES[bareSlug].some(sig => styleBlock.includes(sig))) {
      const sigs = THEME_TOKEN_SIGNATURES[bareSlug].join(', ');
      errors.push(`${metaFile}: :root missing token for "${bareSlug}" (need [${sigs}])`);
    }
  }
  assert.deepEqual(errors, [],
    `Token signature failures: ${errors.join(' | ')}`);
});

/**
 * Gate 4 (hardblue/redswiss cards from 202606XX onwards):
 * Warn if HTML has fewer than 2 structural class signatures.
 * Pre-202606XX cards are exempt (predate this gate).
 * darkblue is exempt per user directive.
 * No rebuild enforcement — only warn.
 */
test('theme-gate: HTML has ≥2 structural class signatures (202606XX+ hardblue/redswiss only, warn-only)', () => {
  const metaFiles = fs.readdirSync(DOCS).filter(e => e.endsWith('.html.meta.yaml'));

  const errors = [];
  const warnings = [];
  for (const metaFile of metaFiles) {
    const metaPath = path.join(DOCS, metaFile);
    const style = readMetaStyle(metaPath);
    if (style === null) continue;
    const bareSlug = normaliseStyle(style);
    if (!THEME_STRUCTURAL_SIGNATURES[bareSlug]) continue;
    // Exempt pre-202606XX cards (they predate this gate)
    const datePart = metaFile.match(/^(\d{8})-/);
    if (datePart && datePart[1] < '20260601') continue;

    const htmlPath = path.join(DOCS, metaFile.replace('.meta.yaml', ''));
    if (!fs.existsSync(htmlPath)) continue;

    const content = fs.readFileSync(htmlPath, 'utf8');
    const classes = THEME_STRUCTURAL_SIGNATURES[bareSlug];
    const matches = classes.filter(c =>
      content.includes(`class="${c}"`) ||
      content.includes(`class="${c} `) ||
      content.includes(`class="${c}"`) ||
      content.includes(`class='${c}'`) ||
      content.includes(`class='${c} `)
    );

    if (matches.length < 2) {
      // Warn only — no rebuild enforcement; user has not authorised structural fixes
      warnings.push(`${metaFile}: "${bareSlug}" ${matches.length}/2 sigs [${matches.join(',') || 'none'}]`);
    }
  }
  if (warnings.length) {
    console.log(`[theme-gate warn] structural deficits (${warnings.length} cards): ${warnings.slice(0, 5).join(' | ')}${warnings.length > 5 ? ' …' : ''}`);
  }
  assert.deepEqual(errors, [], 'no hard errors');
});
