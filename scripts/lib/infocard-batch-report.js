'use strict';

const fs = require('node:fs');
const path = require('node:path');
const yaml = require('../../assets/home/vendor/js-yaml.min.js');

const FINAL_STATES = new Set(['done', 'public_verified', 'pushed', 'committed']);
const CANDIDATE_STATES = new Set(['authoring', 'candidate_ready']);
const BLOCKED_PREFIX = 'blocked';

function normalizeState(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : 'unknown';
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
}

function readYaml(file) {
  return yaml.load(fs.readFileSync(path.resolve(file), 'utf8'));
}

function indexDocs(root) {
  const docsDir = path.resolve(root, 'docs');
  if (!fs.existsSync(docsDir)) return [];
  const entries = [];
  const stack = [docsDir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolute);
        continue;
      }
      if (!/\.html\.meta\.yaml$/.test(entry.name)) continue;
      const rel = path.relative(root, absolute).split(path.sep).join('/');
      const htmlPath = rel.replace(/\.meta\.yaml$/, '');
      if (!fs.existsSync(path.join(root, htmlPath))) continue;
      entries.push({
        htmlPath,
        metaPath: rel,
        meta: readYaml(absolute),
      });
    }
  }
  return entries.sort((a, b) => a.metaPath.localeCompare(b.metaPath));
}

function readBatchState(file) {
  const state = readJson(file);
  if (!state || state.schema_version !== 1 || !state.cards || typeof state.cards !== 'object') {
    throw new Error('invalid batch state');
  }
  return state;
}

function summarizeBatch(root, batchStatePath) {
  const batchState = readBatchState(batchStatePath);
  const cards = Object.entries(batchState.cards).map(([slug, info]) => {
    const state = normalizeState(info && info.state);
    const authoringDir = path.join('.docs', batchState.run_id, slug);
    const authoringExists = fs.existsSync(path.resolve(root, authoringDir));
    const docsMatches = indexDocs(root).filter((entry) =>
      entry.meta && entry.meta.slug === slug && normalizeState(entry.meta.status || entry.meta.state || entry.meta.publish_state) !== 'unknown'
    );
    const published = docsMatches.length > 0 || FINAL_STATES.has(state);
    let bucket = 'in_progress';
    if (published) bucket = 'done';
    else if (state.startsWith(BLOCKED_PREFIX)) bucket = 'blocked';
    else if (CANDIDATE_STATES.has(state) || authoringExists) bucket = 'candidate';
    return {
      slug,
      state,
      bucket,
      authoringDir,
      authoringExists,
      last_error: info ? info.last_error : null,
      attempts: info ? info.attempts : 0,
    };
  });

  const counts = cards.reduce((acc, item) => {
    acc.total += 1;
    acc[item.bucket] += 1;
    return acc;
  }, { total: 0, candidate: 0, in_progress: 0, blocked: 0, done: 0 });

  return {
    run_id: batchState.run_id,
    created_at: batchState.created_at,
    counts,
    cards,
  };
}

function formatReport(summary) {
  const lines = [];
  lines.push(`# Batch Report: ${summary.run_id}`);
  lines.push(`- total: ${summary.counts.total}`);
  lines.push(`- done: ${summary.counts.done}`);
  lines.push(`- candidate: ${summary.counts.candidate}`);
  lines.push(`- in_progress: ${summary.counts.in_progress}`);
  lines.push(`- blocked: ${summary.counts.blocked}`);
  lines.push('');
  for (const card of summary.cards) {
    lines.push(`## ${card.slug}`);
    lines.push(`- state: ${card.state}`);
    lines.push(`- bucket: ${card.bucket}`);
    lines.push(`- authoring: ${card.authoringExists ? 'yes' : 'no'} (${card.authoringDir})`);
    lines.push(`- attempts: ${card.attempts}`);
    if (card.last_error) lines.push(`- last_error: ${card.last_error}`);
    lines.push('');
  }
  return lines.join('\n');
}

function main(argv = process.argv.slice(2), root = process.cwd()) {
  const stateIndex = argv.indexOf('--state');
  const jsonIndex = argv.indexOf('--json');
  const statePath = stateIndex >= 0 ? argv[stateIndex + 1] : null;
  if (!statePath) throw new Error('usage: --state <batch-state.json> [--json]');
  const summary = summarizeBatch(root, statePath);
  if (jsonIndex >= 0) return summary;
  return formatReport(summary);
}

if (require.main === module) {
  try {
    const result = main();
    process.stdout.write(typeof result === 'string' ? `${result}\n` : `${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { summarizeBatch, formatReport, main };
