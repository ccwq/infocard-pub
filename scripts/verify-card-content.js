#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { loadBundle, validateBundle } = require('./lib/publish-bundle');

// Invalid thresholds default to one only when at least one valid claim exists.
const DEFAULT_MIN_CLAIM_COVERAGE = 1;
const NAMED = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", colon: ':', sol: '/' };
function decode(text) {
  return String(text).replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi, (all, entity) => {
    if (entity[0] === '#') {
      const hex = entity[1].toLowerCase() === 'x';
      const value = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      try { return String.fromCodePoint(value); } catch { return all; }
    }
    return Object.hasOwn(NAMED, entity.toLowerCase()) ? NAMED[entity.toLowerCase()] : all;
  });
}
function normalize(text) { return decode(text).normalize('NFKC').toLocaleLowerCase('en-US').replace(/[\p{P}\p{S}\s]+/gu, ' ').trim(); }
function visibleText(html) { return normalize(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ')); }
function attrs(tag) {
  const result = {};
  const re = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while ((match = re.exec(tag))) result[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4]);
  return result;
}
function heroText(html) {
  const matches = [];
  const re = /<(header|section|div)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = re.exec(html))) {
    const a = attrs(match[2]);
    const classes = (a.class || '').split(/[\t\n\f\r ]+/).filter(Boolean);
    if (a.id === 'hero' || classes.includes('hero')) matches.push(match[3]);
  }
  if (!matches.length) { const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html); if (h1) matches.push(h1[1]); }
  return visibleText(matches.join(' '));
}
function identities(facts, bundle) {
  const values = [];
  const meta = facts.repo_meta && typeof facts.repo_meta === 'object' ? facts.repo_meta : {};
  for (const key of ['name', 'title', 'full_name', 'fullName']) if (typeof meta[key] === 'string') values.push(meta[key]);
  for (const key of ['name', 'title']) if (typeof facts[key] === 'string') values.push(facts[key]);
  try { const parts = new URL(facts.source_url || bundle.source_url).pathname.split('/').filter(Boolean).slice(0, 2); if (parts.length) values.push(parts.join(' '), parts.join('/'), parts.at(-1)); } catch {}
  return [...new Set(values.map(normalize).filter(Boolean))];
}
function readJson(file, field, errors) { try { const stat = fs.statSync(file); if (!stat.isFile() || !stat.size) throw new Error('must exist and be nonempty'); return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) { errors.push({ field, message: error.message }); return null; } }
function sectionEvidence(html) {
  const evidence = [];
  let match;
  const headings = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  while ((match = headings.exec(html))) evidence.push(visibleText(match[1]));
  const landmarks = /<(section|article|nav|aside)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  while ((match = landmarks.exec(html))) {
    const a = attrs(match[2]);
    for (const value of [a.id, a['aria-label'], a['data-section']]) if (value) evidence.push(normalize(value));
    const first = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i.exec(match[3]);
    if (first) evidence.push(visibleText(first[1]));
  }
  return evidence;
}
function verifyCardContent(bundle, rootDir = process.cwd()) {
  const errors = [];
  const contract = validateBundle(bundle);
  if (!contract.valid) errors.push(...contract.errors.map(error => ({ ...error, field: `bundle.${error.field}` })));
  if (!bundle || typeof bundle.slug !== 'string') return { valid: false, errors, claim_coverage: { matched: 0, required: 0, total: 0 } };
  const facts = readJson(path.join(rootDir, '.tmp', 'infocard', bundle.slug, 'facts.json'), 'facts', errors);
  let html = '';
  try { const file = path.resolve(rootDir, bundle.html_path); const stat = fs.statSync(file); if (!stat.isFile() || !stat.size) throw new Error('must exist and be nonempty'); html = fs.readFileSync(file, 'utf8'); } catch (error) { errors.push({ field: 'html', message: error.message }); }
  let coverage = { matched: 0, required: 0, total: 0 };
  if (facts && typeof facts === 'object' && !Array.isArray(facts) && html) {
    const text = visibleText(html);
    if (!identities(facts, bundle).some(identity => heroText(html).includes(identity))) errors.push({ field: 'hero', message: 'must contain project identity in an exact hero class token/id (or h1 fallback)' });
    const sectionsValid = Array.isArray(facts.required_sections) && facts.required_sections.length > 0 && facts.required_sections.every(value => typeof value === 'string' && normalize(value));
    if (!sectionsValid) errors.push({ field: 'required_sections', message: 'must be a nonempty array of nonempty strings' });
    else { const evidence = sectionEvidence(html); facts.required_sections.forEach((section, index) => { const key = normalize(section); if (!evidence.some(value => value.includes(key))) errors.push({ field: `required_sections.${index}`, message: `missing semantic section evidence for ${section}` }); }); }
    const claimsValid = Array.isArray(facts.claims) && facts.claims.length > 0 && facts.claims.every(value => typeof value === 'string' && normalize(value));
    const claims = claimsValid ? facts.claims : [];
    if (!claimsValid) errors.push({ field: 'claims', message: 'must be a nonempty array of nonempty strings' });
    const configured = Number.isInteger(facts.min_claim_coverage) && facts.min_claim_coverage >= 1 && facts.min_claim_coverage <= claims.length ? facts.min_claim_coverage : (claims.length ? DEFAULT_MIN_CLAIM_COVERAGE : 0);
    const matched = claims.filter(claim => text.includes(normalize(claim))).length;
    coverage = { matched, required: configured, total: claims.length };
    if (matched < configured) errors.push({ field: 'claims', message: `claim coverage ${matched}/${claims.length} below required ${configured}` });
    if (!/<meta\b[^>]*name\s*=\s*["']?viewport["']?[^>]*>/i.test(html)) errors.push({ field: 'viewport', message: 'viewport meta required' });
    if (!/@media\b[^\{]*(?:max-width|min-width|width)\s*:/i.test(html)) errors.push({ field: 'mobile_media', message: 'responsive media rule required' });
  }
  return { valid: errors.length === 0, errors, claim_coverage: coverage };
}
function main(argv) { const index = argv.indexOf('--bundle'); if (index < 0 || !argv[index + 1]) { process.stdout.write(JSON.stringify({ valid: false, errors: [{ field: 'bundle', message: 'usage: --bundle path' }] }) + '\n'); return 2; } try { const result = verifyCardContent(loadBundle(path.resolve(argv[index + 1])), process.cwd()); process.stdout.write(JSON.stringify(result) + '\n'); return result.valid ? 0 : 1; } catch (error) { process.stdout.write(JSON.stringify({ valid: false, errors: [{ field: 'bundle', message: error.message }] }) + '\n'); return 1; } }
if (require.main === module) process.exitCode = main(process.argv.slice(2));
module.exports = { verifyCardContent, main, DEFAULT_MIN_CLAIM_COVERAGE };
