'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REGISTRY_PATH = path.join('theme', 'themes.json');

function loadThemeRegistry(projectRoot) {
  const file = path.join(projectRoot, REGISTRY_PATH);
  if (!fs.existsSync(file)) return null;
  const registry = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!registry || typeof registry !== 'object' || !registry.themes || typeof registry.themes !== 'object') {
    throw new TypeError('theme/themes.json must contain a themes object');
  }
  return registry;
}

function registeredThemes(projectRoot) {
  const registry = loadThemeRegistry(projectRoot);
  if (registry) return new Set(Object.keys(registry.themes));
  const dir = path.join(projectRoot, 'theme');
  if (!fs.existsSync(dir)) return new Set();
  return new Set(fs.readdirSync(dir).filter((name) => name.endsWith('.html')).map((name) => name.slice(0, -5)));
}

function normalizeThemeSlug(projectRoot, value) {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  const aliases = {
    'main-style': 'main',
    'q-style': 'q',
    'paper-warm': 'graph-paper',
    'paper-warm-style': 'paper-warm',
    'black-head': 'black',
    'black-head-style': 'black',
    'color-material-style': 'color-material',
    'blue-technical-manual': 'blue',
    'blue-technical-manual-style': 'blue',
  };
  const candidate = aliases[raw] || (raw.startsWith('infocard-') && raw.endsWith('-style')
    ? raw.slice(9, -6) : raw.endsWith('-style') ? raw.slice(0, -6) : raw);
  return registeredThemes(projectRoot).has(candidate) ? candidate : null;
}

function themeDefinition(projectRoot, slug) {
  const definition = loadThemeRegistry(projectRoot).themes[slug];
  if (!definition) return null;
  return { slug, ...definition };
}

function themeImplementation(projectRoot, slug) {
  const definition = themeDefinition(projectRoot, slug);
  return definition && definition.implementation ? definition.implementation : null;
}

function validateThemeRegistry(projectRoot) {
  const registry = loadThemeRegistry(projectRoot);
  if (!registry) return { valid: false, errors: ['theme/themes.json is missing'], themes: [] };
  const errors = [];
  const actualFiles = new Set(fs.readdirSync(path.join(projectRoot, 'theme'))
    .filter((name) => name.endsWith('.html'))
    .map((name) => name.slice(0, -5)));
  const declared = new Set(Object.keys(registry.themes));
  for (const slug of actualFiles) {
    if (!declared.has(slug)) errors.push(`theme/${slug}.html is not declared in theme/themes.json`);
  }
  for (const slug of declared) {
    const def = registry.themes[slug];
    if (!actualFiles.has(slug)) errors.push(`theme/${slug}.html is missing`);
    if (!def || def.template !== `theme/${slug}.html`) errors.push(`${slug}.template must be theme/${slug}.html`);
    if (!def || !def.capabilities || typeof def.capabilities !== 'object') errors.push(`${slug}.capabilities is required`);
    if (!def || !Array.isArray(def.structural_signature)) errors.push(`${slug}.structural_signature must be an array`);
  }
  return { valid: errors.length === 0, errors, themes: [...declared].sort() };
}

module.exports = { REGISTRY_PATH, loadThemeRegistry, registeredThemes, normalizeThemeSlug, themeDefinition, themeImplementation, validateThemeRegistry };
