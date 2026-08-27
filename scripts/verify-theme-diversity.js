'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { evaluateBatchDiversity } = require('../.agents/skills/infocard/infocard-theme-assignment/scripts/theme-decision');

function main(argv = process.argv.slice(2)) {
  const index = argv.indexOf('--themes');
  if (index < 0 || !argv[index + 1]) {
    console.error('usage: node scripts/verify-theme-diversity.js --themes <theme-sequence.json>');
    return 2;
  }
  const file = path.resolve(argv[index + 1]);
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  const themes = Array.isArray(payload) ? payload : payload.themes;
  const result = evaluateBatchDiversity(themes);
  console.log(JSON.stringify({ valid: !result.review_required, ...result }, null, 2));
  return result.review_required ? 1 : 0;
}

if (require.main === module) process.exitCode = main();
module.exports = { main };
