'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { classifyRoute } = require('./lib/infocard-route');
const { main: runLightRoute } = require('./run-infocard-light-route');

function parseConfigPath(argv) {
  const index = argv.indexOf('--config');
  if (index < 0 || !argv[index + 1]) throw new Error('usage: node scripts/orchestrate-infocard.js --config <run.json>');
  return argv[index + 1];
}

async function main(argv = process.argv.slice(2), root = process.cwd()) {
  const configPath = parseConfigPath(argv);
  const config = JSON.parse(fs.readFileSync(path.resolve(root, configPath), 'utf8'));
  const route = classifyRoute(config.request || {});
  if (route.route !== 'light') {
    return { orchestrated: false, route, terminalState: null, escalated: true };
  }
  const lightResult = await runLightRoute(['--config', configPath], root);
  return {
    orchestrated: true,
    route,
    terminalState: lightResult.terminalState,
    hardStop: lightResult.hardStop,
    recordCount: lightResult.recordCount,
    capturePlanPath: lightResult.capturePlanPath || null,
    batchStatePath: lightResult.batchStatePath || null,
  };
}

if (require.main === module) {
  main().then((result) => {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exitCode = result.escalated || result.terminalState === 'PUBLISHED_VERIFIED' || result.terminalState === 'PAGES_PENDING' ? 0 : 1;
  }).catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 2;
  });
}

module.exports = { main, parseConfigPath };
