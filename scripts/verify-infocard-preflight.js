'use strict';
const { validatePreflight } = require('./lib/infocard-preflight');

function value(argv, name) { const index = argv.indexOf(name); return index >= 0 ? argv[index + 1] : null; }
function main(argv = process.argv.slice(2)) {
  const authoringDir = value(argv, '--authoring-dir');
  const result = validatePreflight({
    root: process.cwd(), authoringDir,
    briefPath: value(argv, '--brief') || (authoringDir && `${authoringDir}/project-brief.json`),
    factsPath: value(argv, '--facts') || (authoringDir && `${authoringDir}/facts.json`),
    themeDecisionPath: value(argv, '--theme-decision') || (authoringDir && `${authoringDir}/theme-decision.json`),
    metaPath: value(argv, '--meta') || (authoringDir && `${authoringDir}/card.html.meta.yaml`),
    manifestPath: value(argv, '--manifest') || (authoringDir && `${authoringDir}/promotion-manifest.json`),
    stage: value(argv, '--stage') || 'contract',
  });
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  return result.valid ? 0 : 1;
}
if (require.main === module) process.exitCode = main();
module.exports = { main };
