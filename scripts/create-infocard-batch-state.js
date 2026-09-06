#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createBatchState, saveBatchState } = require('./lib/infocard-batch-state');

function main(argv = process.argv.slice(2), root = process.cwd()) {
  const runIndex = argv.indexOf('--run-id');
  const cardsIndex = argv.indexOf('--cards');
  const outputIndex = argv.indexOf('--output');
  if (runIndex < 0 || cardsIndex < 0 || outputIndex < 0) throw new Error('usage: --run-id <id> --cards <slug,...> --output <path>');
  const runId = argv[runIndex + 1];
  const cards = (argv[cardsIndex + 1] || '').split(',').map((item) => item.trim()).filter(Boolean);
  const output = path.resolve(root, argv[outputIndex + 1]);
  const state = createBatchState({ runId, cards });
  saveBatchState(output, state);
  const batchDir = path.dirname(output);
  fs.writeFileSync(path.join(batchDir, 'author-context.txt'), `run_id=${runId}\nworkflow=infocard-authoring\nselected_theme=deferred-per-card-decision\nwrite_boundary=${batchDir}\n`);
  return { valid: true, output, cards };
}

if (require.main === module) {
  try { process.stdout.write(JSON.stringify(main()) + '\n'); }
  catch (error) { process.stdout.write(JSON.stringify({ valid: false, error: error.message }) + '\n'); process.exitCode = 2; }
}
module.exports = { main };
