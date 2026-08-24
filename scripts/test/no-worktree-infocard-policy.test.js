'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..', '..');
const SKILLS = path.join(ROOT, '.agents', 'skills');
const AGENTS = path.join(ROOT, 'AGENTS.md');

const ACTIVE_INFocard_SKILLS = [
  path.join(SKILLS, 'productivity', 'infocard-publish-sop', 'SKILL.md'),
  path.join(SKILLS, 'productivity', 'infocard-direct-publish', 'SKILL.md'),
  path.join(SKILLS, 'productivity', 'infocard-pub-publisher', 'SKILL.md'),
  path.join(SKILLS, 'productivity', 'delegated-infocard-publishing', 'SKILL.md'),
  path.join(SKILLS, 'productivity', 'infocard-three-stage-pipeline', 'SKILL.md'),
  path.join(SKILLS, 'infocard', 'infocard-authoring-workflow', 'SKILL.md'),
  path.join(SKILLS, 'infocard', 'infocard-theme-assignment', 'SKILL.md'),
  path.join(SKILLS, 'infocard', 'infocard-update-vs-new-pattern', 'SKILL.md'),
  path.join(SKILLS, 'publishing', 'authorized-infocard-execution', 'SKILL.md'),
];

const FORBIDDEN_ACTIVE_PATTERNS = [
  /git\s+worktree\s+(?:add|remove|prune)\s+[^`\n]/i,
  /\/tmp\/infocard(?:-worktree|[-/])[^*`\s]/i,
  /git\s+clone\s+https?:\/\//i,
  /git\s+push\s+.*--force/i,
  /HEAD:main\s+--force/i,
];

test('infocard policy: AGENTS declares the .docs promotion boundary', () => {
  const content = fs.readFileSync(AGENTS, 'utf8');
  for (const phrase of [
    '.docs/<run-id>/<slug>/',
    'promotion manifest',
    '禁止',
    'Git worktree',
    '主 checkout',
  ]) {
    assert.ok(content.includes(phrase), `AGENTS.md missing required policy phrase: ${phrase}`);
  }
});

test('infocard policy: active execution skills have no executable worktree path', () => {
  const failures = [];
  for (const skillPath of ACTIVE_INFocard_SKILLS) {
    assert.ok(fs.existsSync(skillPath), `missing active policy skill: ${skillPath}`);
    const content = fs.readFileSync(skillPath, 'utf8');
    const executableLines = content.split('\n').filter(line =>
      !/禁止|不得|never use|do not create|forbidden/i.test(line));
    for (const pattern of FORBIDDEN_ACTIVE_PATTERNS) {
      if (executableLines.some(line => pattern.test(line))) {
        failures.push(`${path.relative(ROOT, skillPath)} matches ${pattern}`);
      }
    }
    assert.match(content, /\.docs\/<run-id>\/<slug>|\.docs\/<card>/,
      `${path.relative(ROOT, skillPath)} must name .docs authoring`);
  }
  assert.deepEqual(failures, [], failures.join('\n'));
});

test('infocard policy: retired poster-shell and direct-publish worktree references are absent', () => {
  const absent = [
    path.join(SKILLS, 'infocard', 'infocard-poster-shell-rebuild'),
    path.join(SKILLS, 'productivity', 'infocard-direct-publish', 'references', 'worktree-isolated-commit.md'),
    path.join(SKILLS, 'productivity', 'infocard-direct-publish', 'references', 'topic-driven-direct-publish-pattern.md'),
    path.join(SKILLS, 'infocard-styles', 'infocard-hardblue-style', 'references', 'worktree-draft-pattern.md'),
  ];
  for (const item of absent) assert.ok(!fs.existsSync(item), `retired worktree artifact still exists: ${item}`);
});

test('infocard policy: publisher keeps manifest sources and formal targets separated', () => {
  const publisher = fs.readFileSync(
    path.join(SKILLS, 'productivity', 'infocard-pub-publisher', 'SKILL.md'), 'utf8');
  assert.match(publisher, /source relative to `?\.docs/i);
  assert.match(publisher, /targets? .*`?docs\/`? or `?assets\//i);
  assert.match(publisher, /not a worktree or detached HEAD/i);
});
