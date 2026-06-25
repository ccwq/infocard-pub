#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('../assets/home/vendor/js-yaml.min.js');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const TAXONOMY_PATH = path.join(ROOT, '_taxonomy.yaml');
const OUT = path.join(ROOT, 'tmp_taxonomy_audit.json');

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, acc);
    else if (ent.isFile() && ent.name.endsWith('.meta.yaml')) acc.push(full);
  }
  return acc;
}

function readYaml(p) {
  const raw = fs.readFileSync(p, 'utf8');
  try {
    return yaml.load(raw, { schema: yaml.FAILSAFE_SCHEMA }) || {};
  } catch (error) {
    if (!/duplicated mapping key/i.test(String(error && error.message))) throw error;
    const lines = raw.split(/\r?\n/);
    const seen = new Map();
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (/^(\S[^:]*):\s*/.test(line)) {
        const key = line.replace(/:.*/, '').trim();
        seen.set(key, i);
      }
    }
    const filtered = lines.filter((line, i) => {
      const m = line.match(/^(\S[^:]*):\s*/);
      if (!m) return true;
      return seen.get(m[1]) === i;
    });
    return yaml.load(filtered.join('\n'), { schema: yaml.FAILSAFE_SCHEMA }) || {};
  }
}

function normTag(t) {
  return String(t || '').trim();
}

function duplicateKey(t) {
  return String(t || '').toLowerCase().replace(/[\s_\-/·｜|]+/g, '');
}

const taxonomy = readYaml(TAXONOMY_PATH);
const styleSet = new Set((((taxonomy.dimensions||{}).style||{}).tags||[]).map(String));
const sourceSet = new Set((((taxonomy.dimensions||{}).source||{}).tags||[]).map(String));

const files = walk(DOCS);
const categories = new Map();
const tagCounts = new Map();
const duplicateGroups = new Map();
let tagInstances = 0;
let singleton = 0;
let styleTagInstances = 0;
let sourceTagInstances = 0;
const cards = [];

for (const file of files) {
  const data = readYaml(file);
  const tags = Array.isArray(data.tags) ? data.tags.map(normTag).filter(Boolean) : [];
  const category = String(data.category || '').trim();
  categories.set(category, (categories.get(category) || 0) + 1);
  for (const t of tags) {
    tagInstances += 1;
    tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    const dk = duplicateKey(t);
    if (!duplicateGroups.has(dk)) duplicateGroups.set(dk, new Set());
    duplicateGroups.get(dk).add(t);
    if (styleSet.has(t)) styleTagInstances += 1;
    if (sourceSet.has(t)) sourceTagInstances += 1;
  }
  cards.push({
    slug: data.slug,
    title: data.title,
    category,
    tags,
    style: data.style || null,
    source_url: data.source_url || null,
    path: path.relative(ROOT, file)
  });
}

const tagEntries = [...tagCounts.entries()].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0], 'zh-Hans-CN'));
const singletonTags = tagEntries.filter(([,c])=>c===1).map(([t])=>t);
const duplicateCandidates = [...duplicateGroups.entries()]
  .filter(([,set])=>set.size>1)
  .map(([norm,set])=>({ norm, values:[...set].sort((a,b)=>a.localeCompare(b,'zh-Hans-CN')) }))
  .sort((a,b)=>b.values.length-a.values.length || a.norm.localeCompare(b.norm));

const report = {
  cards: cards.length,
  categories_unique: [...categories.keys()].filter(Boolean).length,
  tags_unique: tagEntries.length,
  tag_instances: tagInstances,
  singleton_tags: singletonTags.length,
  duplicate_normalized_groups: duplicateCandidates.length,
  style_tag_instances: styleTagInstances,
  source_tag_instances: sourceTagInstances,
  top_categories: [...categories.entries()].sort((a,b)=>b[1]-a[1]).slice(0,80),
  top_tags: tagEntries.slice(0,160),
  duplicate_candidates: duplicateCandidates.slice(0,300),
  singleton_tag_sample: singletonTags.slice(0,200),
  cards
};

fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
console.log(`wrote ${path.relative(ROOT, OUT)}`);
console.log(JSON.stringify({
  cards: report.cards,
  categories_unique: report.categories_unique,
  tags_unique: report.tags_unique,
  singleton_tags: report.singleton_tags,
  duplicate_normalized_groups: report.duplicate_normalized_groups,
  style_tag_instances: report.style_tag_instances,
  source_tag_instances: report.source_tag_instances
}, null, 2));
