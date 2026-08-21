'use strict';

const fs = require('node:fs');
const path = require('node:path');

const CLASSIFICATIONS = new Set(['move', 'router-only', 'shared-support', 'merge', 'retire']);
const REQUIRED_ROUTES = {
  create: ['infocard-publish-sop', 'infocard-authoring-workflow', 'any2card'],
  query: ['infocard-topic-selection', 'infocard-metadata-provenance'],
  theme: ['infocard-theme-assignment'],
  themeCreate: ['infocard-style-man-skill', 'infocard-theme-redesign'],
  update: ['infocard-update-vs-new-pattern', 'infocard-publish-sop'],
  preview: [
    'infocard-creation-preview-standards',
    'infocard-mobile-verifier',
    'infocard-mobile-rendering-verification',
    'infocard-responsive-layout',
    'infocard-legibility-publishing',
    'infocard-visual-pass-loop',
    'infocard-visual-evidence-grounding',
    'cdp-visual-evidence-verification',
    'visual-verification-gate',
    'visual-review-orchestration',
  ],
  publish: ['infocard-pub-publisher', 'infocard-build-and-deploy'],
  metadata: ['infocard-metadata-provenance', 'infocard-wiki-coverage'],
};

function skillName(file) {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/^---\s*\n([\s\S]*?)\n---/);
  const name = match && match[1].match(/^name:\s*["']?([^"'\n]+)["']?\s*$/m);
  return name ? name[1].trim() : null;
}

function isValidSkill(file) {
  const text = fs.readFileSync(file, 'utf8');
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return Boolean(
    skillName(file)
    && frontmatter
    && /^description:\s*.+$/m.test(frontmatter[1])
    && /\r?\n---\r?\n(?:\r?\n)*\S/.test(text),
  );
}

function walkSkills(root) {
  if (!root || !fs.existsSync(root)) return [];
  const result = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...walkSkills(full));
    else if (entry.isFile() && entry.name === 'SKILL.md') result.push(full);
  }
  return result;
}

function parseManifest(file) {
  const rows = [];
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|/);
    if (match) rows.push({ name: match[1], source: match[2].trim(), destination: match[3].trim(), classification: match[4] });
  }
  return rows;
}

function audit({ projectRoot, manifest, globalRoot, router }) {
  const errors = [];
  const rows = parseManifest(manifest);
  const skillFiles = walkSkills(path.join(projectRoot, '.agents', 'skills'));
  const names = skillFiles.map(skillName).filter(Boolean);
  const duplicates = names.filter((name, i) => names.indexOf(name) !== i);
  if (duplicates.length) errors.push(`duplicate project skill names: ${[...new Set(duplicates)].join(', ')}`);
  for (const file of skillFiles) if (!isValidSkill(file)) errors.push(`invalid project skill: ${path.relative(projectRoot, file)}`);
  for (const row of rows) {
    if (!CLASSIFICATIONS.has(row.classification)) errors.push(`invalid classification for ${row.name}`);
    const destination = row.destination.replace(/^`|`$/g, '');
    const resolved = path.resolve(projectRoot, destination, 'SKILL.md');
    const skillsRoot = `${path.resolve(projectRoot, '.agents', 'skills')}${path.sep}`;
    if (!resolved.startsWith(skillsRoot)) errors.push(`unsafe destination for ${row.name}: ${destination}`);
    else if (!fs.existsSync(resolved)) errors.push(`missing destination for ${row.name}: ${destination}`);
  }
  const globalNames = walkSkills(globalRoot).map(skillName).filter(Boolean);
  const classified = new Set(rows.map((row) => row.name));
  for (const name of globalNames.filter((name) => name.startsWith('infocard-') || ['any2card', 'social-source-boundary', 'visual-verification-gate', 'visual-review-orchestration', 'authorized-infocard-execution', 'delegated-infocard-publishing'].includes(name))) {
    if (name !== 'infocard-router' && !classified.has(name)) errors.push(`unclassified global candidate: ${name}`);
  }
  if (!router) return { project_skill_count: names.length, unique_name_count: new Set(names).size, migration_records: rows.length, errors };
  const routerText = fs.existsSync(router) ? fs.readFileSync(router, 'utf8') : '';
  if (!routerText.includes('PROJECT_SKILL_UNAVAILABLE')) errors.push('router missing PROJECT_SKILL_UNAVAILABLE');
  for (const [route, targets] of Object.entries(REQUIRED_ROUTES)) for (const target of targets) if (!routerText.includes(target)) errors.push(`router ${route} missing ${target}`);
  if (/publish|create/i.test(routerText) && !/authoriz/i.test(routerText)) errors.push('router lacks authorization boundary');
  return { project_skill_count: names.length, unique_name_count: new Set(names).size, migration_records: rows.length, errors };
}

module.exports = { audit, parseManifest, walkSkills, REQUIRED_ROUTES };
