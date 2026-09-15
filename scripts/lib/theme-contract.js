'use strict';

const fs = require('node:fs');
const { registeredThemes, normalizeThemeSlug, themeImplementation } = require('./theme-registry');

function error(field, message) {
  return { field, message };
}

function canonicalStyle(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
    ? value
    : null;
}

function topLevelYamlValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+?)["']?\\s*$`, 'm'));
  return match ? match[1].trim() : null;
}

function htmlTheme(text) {
  const match = text.match(/<html\b[^>]*\bdata-theme=["']([^"']+)["']/i);
  return match ? match[1].trim() : null;
}

function colorLiteralMatches(text) {
  const matches = [];
  const css = text.replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/gi, '');

  // Strip :root{} blocks first using brace counting (handles any nesting)
  let depth = 0, inRoot = false, rootStart = -1;
  const rootRemoved = [];
  for (let i = 0; i < css.length; i++) {
    if (!inRoot && css.slice(i, i + 6) === ':root ') { inRoot = true; rootStart = i; }
    else if (!inRoot && css.slice(i, i + 5) === ':root{') { inRoot = true; rootStart = i; }
    if (inRoot) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') { depth--; if (depth === 0) { rootRemoved.push(css.slice(rootStart, i + 1)); inRoot = false; } }
    }
  }
  let stripped = css;
  for (const block of rootRemoved) stripped = stripped.split(block).join('');

  // Strip color function calls using bracket counting to handle nested parens
  // (e.g. rgba(255,255,255,.58) — nested commas stop non-greedy regex).
  const COLOR_FNS = [
    'linear-gradient', 'radial-gradient', 'conic-gradient',
    'repeating-linear-gradient', 'repeating-radial-gradient',
    'rgb', 'rgba', 'hsl', 'hsla',
  ];
  const colorFnRe = new RegExp(
    '\\b(?:' + COLOR_FNS.join('|') + ')\\s*\\('
  );
  let out = '';
  let i = 0;
  while (i < stripped.length) {
    if (colorFnRe.test(stripped.slice(i))) {
      // Consume the fn name + opening paren
      const fnMatch = stripped.slice(i).match(colorFnRe);
      out += stripped.slice(i, i + fnMatch[0].length);
      i += fnMatch[0].length;
      // Count brackets to find the true closing paren
      let parenDepth = 1;
      while (i < stripped.length && parenDepth > 0) {
        const ch = stripped[i];
        if (ch === '(') parenDepth++;
        else if (ch === ')') parenDepth--;
        i++;
      }
    } else {
      out += stripped[i];
      i++;
    }
  }
  stripped = out;

  // Also strip var() tokens (they're not color literals we flag)
  stripped = stripped.replace(/var\s*\([^)]*\)/g, '');

  const patterns = [/#([0-9a-f]{3,8})\b/gi];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(stripped))) matches.push(match[0]);
  }
  return matches;
}

function validateThemeImplementation({ root, style, html, enforce = false }) {
  if (!enforce) return [];
  const implementation = themeImplementation(root, style);
  if (!implementation || !Array.isArray(implementation.required_selectors)) return [];
  return implementation.required_selectors
    .filter((selector) => typeof selector === 'string' && selector.trim() && !html.includes(selector.replace(/^\./, 'class="')))
    .map((selector) => `missing required selector ${selector}`);
}

function validateThemeContract({ root, bundle, entries, enforceImplementation = false }) {
  const errors = [];
  const add = (field, message) => errors.push(error(field, message));
  const themes = registeredThemes(root);
  const style = bundle && bundle.style;
  const canonical = canonicalStyle(style);

  if (!canonical) add('bundle.style', 'must be a canonical bare theme slug');
  else if (!themes.has(canonical)) add('bundle.style', `theme "${canonical}" is not registered in theme/*.html`);

  const byDestination = new Map((entries || []).map((entry) => [entry.destination, entry]));
  const htmlEntry = byDestination.get(bundle && bundle.html_path);
  const metaEntry = byDestination.get(bundle && bundle.meta_path);
  if (!htmlEntry) add('files', 'bundle html_path must be declared in promotion files');
  if (!metaEntry) add('files', 'bundle meta_path must be declared in promotion files');
  if (!htmlEntry || !metaEntry) return { valid: false, errors };

  const html = fs.readFileSync(htmlEntry.sourceAbsolute, 'utf8');
  const meta = fs.readFileSync(metaEntry.sourceAbsolute, 'utf8');
  const dataTheme = htmlTheme(html);
  const metaStyle = topLevelYamlValue(meta, 'style');
  const normalizedMetaStyle = normalizeThemeSlug(root, metaStyle);

  if (!dataTheme) add('html.data-theme', `must equal "${style}"`);
  else if (dataTheme !== style) add('html.data-theme', `"${dataTheme}" !== bundle.style "${style}"`);
  if (!metaStyle) add('meta.style', `must equal "${style}"`);
  else if (normalizedMetaStyle !== style) add('meta.style', `"${metaStyle}" !== bundle.style "${style}"`);
  if (/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["'][^"']*theme\/[^"']+\.html["']/i.test(html)) {
    add('html.theme_link', 'theme/*.html templates must not be used as stylesheets');
  }

  // Theme palette declarations are allowed in :root; only component declarations
  // must consume variables instead of hard-coding colors.
  const componentCss = html
    .replace(/:root\s*\{[^{}]*\}/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');
  const literals = colorLiteralMatches(componentCss);
  if (literals.length) add('html.colors', `hard-coded color literals are forbidden (${literals.slice(0, 8).join(', ')})`);
  if (!/var\(\s*--[a-z0-9-]+/i.test(html)) add('html.tokens', 'must consume theme CSS variables via var(--token)');
  for (const message of validateThemeImplementation({ root, style, html, enforce: enforceImplementation })) add('html.implementation', message);
  return { valid: errors.length === 0, errors };
}

module.exports = {
  registeredThemes,
  canonicalStyle,
  topLevelYamlValue,
  htmlTheme,
  colorLiteralMatches,
  validateThemeImplementation,
  validateThemeContract,
};