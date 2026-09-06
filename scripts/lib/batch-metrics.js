#!/usr/bin/env node
/**
 * scripts/lib/batch-metrics.js
 *
 * 批次指标采集器：记录 SOP 执行过程中的关键效率指标。
 * 在批次开始时 require 此模块，之后在关键节点调用 record()。
 *
 * Usage:
 *   const metrics = require('./scripts/lib/batch-metrics')(runId)
 *   metrics.record('tool_call', { type: 'terminal' })
 *   metrics.record('stage_enter', { stage: 'AUTHORING', card: 'my-slug' })
 *   metrics.record('stage_exit', { stage: 'PROMOTION', card: 'my-slug', duration_ms: 1234 })
 *   metrics.record('takeover', { from: 'subagent', reason: 'timeout' })
 *   metrics.record('visual_block', { reason: 'cdp_unavailable' })
 *   metrics.finish()  // 输出指标报告
 */

'use strict';

const fs = require('fs');
const path = require('path');

class BatchMetrics {
  constructor(runId) {
    this.runId = runId || new Date().toISOString().replace(/[:.]/g, '-');
    this.startTime = Date.now();
    this.events = [];
    this.stages = {}; // stage → { enter, exits: [] }
    this.toolCalls = 0;
    this.turns = 0;
    this.takeovers = 0;
    this.visualBlocks = 0;
    this.promotionRetries = 0;
    this.buildCount = 0;
    this.verifyFailures = 0;
  }

  record(type, data = {}) {
    this.events.push({ ts: Date.now(), type, ...data });
    switch (type) {
      case 'tool_call': this.toolCalls++; break;
      case 'user_turn': this.turns++; break;
      case 'takeover': this.takeovers++; break;
      case 'visual_block': this.visualBlocks++; break;
      case 'promotion_retry': this.promotionRetries++; break;
      case 'build': this.buildCount++; break;
      case 'verify_failure': this.verifyFailures++; break;
      case 'stage_enter':
        if (!this.stages[data.stage]) this.stages[data.stage] = { enter: Date.now(), exits: [] };
        else this.stages[data.stage].enter = Date.now();
        break;
      case 'stage_exit':
        if (this.stages[data.stage]) {
          this.stages[data.stage].exits.push({
            ts: Date.now(),
            duration_ms: data.duration_ms || (Date.now() - this.stages[data.stage].enter),
            card: data.card,
          });
        }
        break;
    }
  }

  _fmt(ms) {
    const s = Math.round(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  }

  summary() {
    const wallTime = Date.now() - this.startTime;
    const stageDurations = Object.fromEntries(
      Object.entries(this.stages).map(([k, v]) => {
        const lastEnter = v.enter;
        const lastExit = v.exits[v.exits.length - 1];
        const duration = lastExit ? lastExit.duration_ms : (Date.now() - lastEnter);
        return [k, { total_ms: duration, exits: v.exits.length }];
      })
    );
    return {
      run_id: this.runId,
      wall_time_ms: wallTime,
      wall_time_fmt: this._fmt(wallTime),
      tool_calls: this.toolCalls,
      turns: this.turns,
      promotion_retries: this.promotionRetries,
      build_count: this.buildCount,
      verify_failures: this.verifyFailures,
      takeovers: this.takeovers,
      visual_blocks: this.visualBlocks,
      stage_durations_ms: stageDurations,
    };
  }

  print() {
    const s = this.summary();
    const lines = [
      '',
      '=== Batch Metrics ===',
      `wall_time:      ${s.wall_time_fmt}`,
      `tool_calls:     ${s.tool_calls}`,
      `turns:          ${s.turns}`,
      `promotion_retries: ${s.promotion_retries}`,
      `build_count:    ${s.build_count}`,
      `verify_failures: ${s.verify_failures}`,
      `takeovers:      ${s.takeovers}`,
      `visual_blocks:  ${s.visual_blocks}`,
      '',
      'Stage durations:',
    ];
    for (const [stage, info] of Object.entries(s.stage_durations_ms)) {
      lines.push(`  ${stage.padEnd(20)} ${this._fmt(info.total_ms).padStart(8)} (${info.exits} exit(s))`);
    }
    lines.push('');
    console.log(lines.join('\n'));
    return s;
  }

  save(outPath) {
    const data = this.summary();
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
    return data;
  }
}

module.exports = (runId) => new BatchMetrics(runId);
