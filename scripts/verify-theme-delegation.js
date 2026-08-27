'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { validateAuthorDelegationContext, readThemeDecision } = require('../.agents/skills/infocard/infocard-theme-assignment/scripts/theme-decision');

function arg(name, argv) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : null;
}

function main(argv = process.argv.slice(2)) {
  const contextPath = arg('--context', argv);
  const decisionPath = arg('--decision', argv);
  if (!contextPath || !decisionPath) {
    console.error('usage: node scripts/verify-theme-delegation.js --context <prompt.txt> --decision <theme-decision.json>');
    return 2;
  }
  const decision = readThemeDecision(path.resolve(decisionPath), { projectRoot: process.cwd() });
  const context = fs.readFileSync(path.resolve(contextPath), 'utf8');
  const result = validateAuthorDelegationContext(context, decision.valid ? decisionPath : null);
  const output = {
    valid: decision.valid && result.valid,
    decision_valid: decision.valid,
    decision_errors: decision.errors || [],
    delegation: result,
  };
  console.log(JSON.stringify(output, null, 2));
  return output.valid ? 0 : 1;
}

if (require.main === module) process.exitCode = main();
module.exports = { main };
