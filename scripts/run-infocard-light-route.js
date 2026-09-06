#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { classifyRoute } = require('./lib/infocard-route');
const { validatePreflight } = require('./lib/infocard-preflight');
const { promoteInfocard } = require('./lib/infocard-promotion');
const { createCapturePlan } = require('./lib/capture-plan');
const { createContactSheetSet } = require('./lib/contact-sheet');
const { LIGHT_ROUTE_LIMIT_MS, LIGHT_ROUTE_STAGES, buildTargetedGateCommands } = require('./lib/infocard-light-route');
const { runLightRoute } = require('./lib/light-route-runner');
const { appendTimingRecord } = require('./lib/infocard-run-timing');
const { createBatchState, ensureCard, applyStageOutcome, loadBatchState, saveBatchState } = require('./lib/infocard-batch-state');

function resolveBatchCard(config) {
  return config.slug || (config.preflight && config.preflight.authoringDir ? path.basename(config.preflight.authoringDir) : null);
}

function resolveBatchStatePath(config, root) {
  if (config.batchStatePath) return path.resolve(root, config.batchStatePath);
  if (config.preflight && config.preflight.authoringDir) return path.resolve(root, config.preflight.authoringDir, 'batch-state.json');
  return null;
}

function stageRecordToOutcome(record) {
  return {
    result: record.result,
    terminalState: record.terminal_state,
    duration_ms: record.duration_ms,
    retry_count: record.retry_count,
    rework_count: record.rework_count,
  };
}

function commandResult(command, cwd, timeout, extraEnv = {}) {
  if (!Array.isArray(command) || command.length === 0) return { ok: true, result: 'skipped' };
  const args = command.length === 2 && Array.isArray(command[1]) ? command[1] : command.slice(1);
  const executable = process.platform === 'win32' && command[0] === 'npm' ? 'npm.cmd' : command[0];
  const child = spawnSync(executable, args, { cwd, encoding: 'utf8', shell: false, timeout: Math.max(1, Math.floor(timeout)), env: { ...process.env, ...extraEnv } });
  return { ok: child.status === 0, result: child.status === 0 ? 'completed' : 'failed', status: child.status, stdout: child.stdout, stderr: child.stderr, error: child.error && child.error.message };
}

function buildStages(config, root, route) {
  const budgets = Object.fromEntries(LIGHT_ROUTE_STAGES);
  const candidate = config.preflight;
  const manifestPath = candidate.manifestPath || `${candidate.authoringDir}/promotion-manifest.json`;
  const htmlPath = config.htmlPath;
  const capturePlan = createCapturePlan(config.capturePlan || {});
  const commands = config.stageCommands || {};
  const remaining = (shared) => LIGHT_ROUTE_LIMIT_MS - (Date.now() - shared.startedAt);
  const invoke = (stage, shared, required = false, extraEnv = {}) => {
    if (!commands[stage]) return required ? { result: 'missing_command', terminalState: 'BLOCKED_AT_LOCAL_GATE' } : { result: 'skipped' };
    const output = commandResult(commands[stage], root, Math.max(1, shared.remainingMs || remaining(shared)), { ...(shared.forceProxy ? { HTTP_PROXY: 'http://localhost:7897', HTTPS_PROXY: 'http://localhost:7897' } : {}), ...extraEnv });
    return output.ok ? output : { ...output, terminalState: stage === 'release' ? 'PUSH_FAILED' : 'BLOCKED_AT_LOCAL_GATE' };
  };
  return [
    { stage: 'route_select', budgetMs: budgets.route_select, run: async () => ({ result: route.route }) },
    { stage: 'research', budgetMs: budgets.research, run: async (shared) => invoke('research', shared) },
    { stage: 'preflight_contract', budgetMs: budgets.preflight_contract, run: async () => { const value = validatePreflight({ root, ...candidate, manifestPath, stage: 'contract' }); return value.valid ? { result: 'completed' } : { result: 'preflight_failed', terminalState: 'BLOCKED_AT_LOCAL_GATE', errors: value.errors }; } },
    { stage: 'authoring', budgetMs: budgets.authoring, run: async (shared) => invoke('authoring', shared, false, shared.forceProjectBriefTemplate ? { INFOCARD_FORCE_PROJECT_BRIEF_TEMPLATE: '1' } : {}) },
    { stage: 'authoring_validation', budgetMs: budgets.authoring_validation, run: async () => { const value = validatePreflight({ root, ...candidate, manifestPath, stage: 'authoring_validation' }); return value.valid ? { result: 'completed' } : { result: 'authoring_validation_failed', terminalState: 'BLOCKED_AT_LOCAL_GATE', errors: value.errors }; } },
    { stage: 'promotion', budgetMs: budgets.promotion, run: async () => { const value = promoteInfocard({ root, manifestPath: path.resolve(root, manifestPath) }); return value.valid ? { result: 'completed' } : { result: 'promotion_failed', terminalState: 'BLOCKED_AT_LOCAL_GATE', errors: value.errors }; } },
    { stage: 'visual_capture', parentStage: 'visual', budgetMs: budgets.visual_capture, run: async (shared) => { const output = path.resolve(root, candidate.authoringDir, 'visual', 'capture-plan.json'); fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, JSON.stringify(capturePlan, null, 2)); if (config.visualManifestPath) { const visualManifest = path.resolve(root, config.visualManifestPath); const current = fs.existsSync(visualManifest) ? JSON.parse(fs.readFileSync(visualManifest, 'utf8')) : {}; current.capture_plan = capturePlan; if (config.rawScreenshots && config.contactSheets) current.contact_sheets = createContactSheetSet({ plan: capturePlan, raw: config.rawScreenshots, paths: config.contactSheets }); fs.mkdirSync(path.dirname(visualManifest), { recursive: true }); fs.writeFileSync(visualManifest, JSON.stringify(current, null, 2)); shared.visualManifestPath = visualManifest; } shared.capturePlanPath = output; return invoke('visual_capture', shared, true, { INFOCARD_CAPTURE_PLAN_PATH: output, INFOCARD_CAPTURE_PLAN_JSON: JSON.stringify(capturePlan) }); } },
    { stage: 'visual_review', parentStage: 'visual', budgetMs: budgets.visual_review, run: async (shared) => invoke('visual_review', shared, true, { INFOCARD_MAX_VISUAL_REPAIR_ROUNDS: String(shared.maxVisualRepairRounds || '') }) },
    { stage: 'static_gates', budgetMs: budgets.static_gates, run: async (shared) => { for (const command of buildTargetedGateCommands(htmlPath)) { const result = commandResult(command, root, remaining(shared)); if (!result.ok) return { ...result, terminalState: 'BLOCKED_AT_LOCAL_GATE' }; } return { result: 'completed' }; } },
    { stage: 'release', budgetMs: budgets.release, run: async (shared) => invoke('release', shared, true) },
    { stage: 'public_verification', workType: 'deployment_wait', budgetMs: budgets.public_verification, run: async (shared) => { if (!config.slug) return { result: 'missing_slug', terminalState: 'BLOCKED_AT_LOCAL_GATE' }; const result = commandResult([process.execPath, ['scripts/post-publish-verify.js', config.slug]], root, Math.max(1, shared.remainingMs)); if (result.ok) return result; const output = `${result.stdout || ''}\n${result.stderr || ''}`; return { ...result, terminalState: /NOT_READY|timeout|ECONN|HTTP 404/i.test(output) ? 'PAGES_PENDING' : 'BLOCKED_AT_LOCAL_GATE' }; } },
    { stage: 'closeout', budgetMs: budgets.closeout, run: async () => ({ result: 'PUBLISHED_VERIFIED', terminalState: 'PUBLISHED_VERIFIED' }) },
  ];
}

async function main(argv = process.argv.slice(2), root = process.cwd()) {
  const index = argv.indexOf('--config');
  if (index < 0 || !argv[index + 1]) throw new Error('usage: node scripts/run-infocard-light-route.js --config <run.json>');
  const config = JSON.parse(fs.readFileSync(path.resolve(root, argv[index + 1]), 'utf8'));
  const route = classifyRoute(config.request || {});
  if (route.route !== 'light') return { route, terminalState: null, escalated: true };
  const diagnostics = config.diagnosticsPath ? path.resolve(root, config.diagnosticsPath) : null;
  const batchStatePath = resolveBatchStatePath(config, root);
  const batchSlug = resolveBatchCard(config);
  let batchState = null;
  if (batchStatePath && batchSlug) {
    batchState = fs.existsSync(batchStatePath)
      ? loadBatchState(batchStatePath)
      : createBatchState({ runId: config.runId || batchSlug, cards: [batchSlug] });
    ensureCard(batchState, batchSlug);
    saveBatchState(batchStatePath, batchState);
  }
  const result = await runLightRoute({ runId: config.runId, stages: buildStages(config, root, route), context: { route }, onRecord: diagnostics ? (record) => appendTimingRecord(diagnostics, record) : () => {} });
  if (batchState && batchSlug) {
    for (const record of result.records) {
      if (record.stage === 'run_start' || record.stage === 'hard_stop') continue;
      applyStageOutcome(batchState, batchSlug, record.stage, stageRecordToOutcome(record));
    }
    saveBatchState(batchStatePath, batchState);
  }
  return { route, terminalState: result.terminalState, hardStop: result.hardStop, recordCount: result.records.length, capturePlanPath: result.context.capturePlanPath || null, batchStatePath: batchStatePath || null };
}

if (require.main === module) main().then((result) => { process.stdout.write(JSON.stringify(result, null, 2) + '\n'); process.exitCode = result.escalated || result.terminalState === 'PUBLISHED_VERIFIED' || result.terminalState === 'PAGES_PENDING' ? 0 : 1; }).catch((error) => { console.error(error.stack || error.message); process.exitCode = 2; });

module.exports = { main, buildStages, commandResult };
