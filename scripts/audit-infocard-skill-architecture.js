'use strict';
const path = require('node:path');
const { audit } = require('./lib/infocard-skill-architecture');

const args = process.argv.slice(2).reduce((out, value, index, all) => {
  if (value.startsWith('--')) out[value.slice(2)] = all[index + 1];
  return out;
}, {});
const root = path.resolve(args['project-root'] || process.cwd());
const report = audit({
  projectRoot: root,
  manifest: path.resolve(args.manifest || path.join(root, '.scratch/infocard-skill-architecture/migration-manifest.md')),
  globalRoot: path.resolve(args['global-root'] || process.env.INFOCARD_GLOBAL_SKILLS_ROOT || path.join(root, '.global-skills-fixture')),
  router: path.resolve(args.router || path.join(root, '.global-skills-fixture/infocard-router/SKILL.md')),
});
process.stdout.write(`${JSON.stringify(report)}\n`);
process.exitCode = report.errors.length ? 1 : 0;
