#!/usr/bin/env node
/**
 * taxonomy-lib.js — infocard-pub taxonomy shared library
 *
 * Provides:
 *   - loadTaxonomySpec()   load _taxonomy.yaml once, cache result
 *   - loadMetaYaml()       parse a .meta.yaml (handles duplicate keys)
 *   - dumpMetaYaml()       serialize back to YAML string
 *   - canonicalizeStyle()  normalize style slug to canonical form
 *   - inferSource()        source from source_url / top-level source
 *   - inferStyle()         style from taxonomy.style / top-level style
 *   - inferRisk()          risk from title / tags / category
 *   - inferContentType()    content_type from category / source_url / text
 *   - inferDomains()        domains from text / tags
 *   - inferToolTypes()      tool_types from text / tags
 *   - inferStages()         stages from text / tags
 *   - inferInteraction()     interaction from text / tags
 *   - buildTaxonomy()       assemble full taxonomy object from meta data
 *   - validateTaxonomy()     check values against taxonomy spec
 *   - CHANGED_ONLY flag     set by CLI wrappers to scope to changed files
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TAXONOMY_PATH = path.join(ROOT, '_taxonomy.yaml');
const DOCS = path.join(ROOT, 'docs');

// ---------------------------------------------------------------------------
// YAML utilities
// ---------------------------------------------------------------------------

function readYaml(p) {
  const yaml = require('../assets/home/vendor/js-yaml.min.js');
  const raw = fs.readFileSync(p, 'utf8');
  try {
    return yaml.load(raw, { schema: yaml.FAILSAFE_SCHEMA }) || {};
  } catch (error) {
    if (!/duplicated mapping key/i.test(String(error && error.message))) throw error;
    const lines = raw.split(/\r?\n/);
    const seen = new Map();
    for (let i = 0; i < lines.length; i += 1) {
      const key = lines[i].replace(/:.*/, '').trim();
      if (/^\S[^:]*:/.test(lines[i])) seen.set(key, i);
    }
    const filtered = lines.filter((line, i) => {
      const m = line.match(/^\S[^:]*:/);
      if (!m) return true;
      return seen.get(m[0].replace(/:.*/, '').trim()) === i;
    });
    return yaml.load(filtered.join('\n'), { schema: yaml.FAILSAFE_SCHEMA }) || {};
  }
}

function dumpYaml(obj) {
  const yaml = require('../assets/home/vendor/js-yaml.min.js');
  return yaml.dump(obj, { lineWidth: -1, noRefs: true, sortKeys: false });
}

// ---------------------------------------------------------------------------
// Taxonomy spec singleton
// ---------------------------------------------------------------------------

let _spec = null;

function loadTaxonomySpec() {
  if (_spec) return _spec;
  _spec = readYaml(TAXONOMY_PATH);
  return _spec;
}

function getSpecValues(dim) {
  const spec = loadTaxonomySpec();
  const dimSpec = (spec.dimensions || {})[dim];
  if (!dimSpec) return new Set();
  const tags = dimSpec.tags;
  return new Set(Array.isArray(tags) ? tags.map(String) : []);
}

function getAllAllowedValues() {
  const spec = loadTaxonomySpec();
  const result = {};
  for (const [key, dim] of Object.entries(spec.dimensions || {})) {
    result[key] = new Set(Array.isArray(dim.tags) ? dim.tags.map(String) : []);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Canonicalization
// ---------------------------------------------------------------------------

const STYLE_ALIASES = {
  'hardblue-style': 'hardblue',
  'redswiss-style': 'redswiss',
  'graph-paper-style': 'graph-paper',
  'infocard-darkblue-style': 'darkblue',
  'infocard-redswiss-style': 'redswiss',
  'infocard-hardblue-style': 'hardblue',
  'infocard-redswiss-style': 'redswiss',
  'infocard-graph-paper-style': 'graph-paper',
  'infocard-darkgreen-style': 'darkgreen',
  'blue-technical-manual': 'blue-technical-manual',
  'infocard-blue-technical-manual-style': 'blue-technical-manual',
  'q': 'q-style',
  'q-style': 'q-style',
  'bigwhite-style': 'bigwhite',
  'big-white': 'bigwhite',
  'archive-green': 'archive-green',
  'darkblue': 'darkblue',
  'darkgreen': 'darkgreen',
  'redswiss': 'redswiss',
  'hardblue': 'hardblue',
  'wood': 'wood',
  'scrapbook': 'scrapbook',
  'white-purple': 'white-purple',
  'color-material': 'color-material',
  'dang-ai-dark': 'dang-ai-dark',
  'pixelstack': 'pixelstack',
  'handline': 'handline',
  'black-head': 'black-head',
  'graph-paper': 'graph-paper',
  'paper-warm-style': 'paper-warm-style',
  'infocard-paper-warm-style': 'paper-warm-style',
  'infocard-pixelstack-style': 'pixelstack',
};

function canonicalizeStyle(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  return STYLE_ALIASES[s] || s;
}

function canonicalizeValue(raw, dim) {
  if (!raw) return null;
  const s = String(raw).trim();
  const allowed = getSpecValues(dim);
  // check alias map first (style only)
  if (dim === 'style') {
    const canon = STYLE_ALIASES[s];
    if (canon && allowed.has(canon)) return canon;
    if (allowed.has(s)) return s;
    return null;
  }
  // general: exact match
  if (allowed.has(s)) return s;
  return null;
}

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function makeText(title, desc, note, tags) {
  return [
    title || '',
    desc || '',
    note || '',
    ...(Array.isArray(tags) ? tags : []),
  ].join(' | ').toLowerCase();
}

// ---------------------------------------------------------------------------
// Infer: source
// ---------------------------------------------------------------------------

function inferSource(data) {
  const out = [];
  const url = String(data.source_url || '').toLowerCase();
  const src = String(data.source || '').toLowerCase();

  if (src === 'github' || /github\.com/.test(url)) out.push('GitHub');
  if (src === 'x' || /x\.com|twitter\.com/.test(url)) out.push('X / Twitter');
  if (/wikipedia\.org/.test(url)) out.push('Wikipedia');
  if (/arxiv|doi\.org|acm\.org|nature\.com|dl\.acm/.test(url)) out.push('Paper');
  if (/\.pdf($|\?)/.test(url)) out.push('PDF');
  if (/youtube\.com|youtu\.be|bilibili\.com/.test(url)) out.push('Video');
  if (src === 'website' || (/^https?:\/\//.test(url) && !/(github|twitter|x\.com|wikipedia|arxiv|bilibili|youtube)\.com/.test(url))) {
    out.push('Website');
  }
  if (src === 'blog') out.push('Blog');
  if (src === 'news') out.push('News');
  if (src === 'user-provided') out.push('User-provided');
  if (src === 'screenshot') out.push('Screenshot');

  return uniq(out);
}

// ---------------------------------------------------------------------------
// Infer: style
// ---------------------------------------------------------------------------

function inferStyle(data) {
  // priority: taxonomy.style > top-level style
  const top = canonicalizeStyle(data.style);
  if (top) return [top];
  return [];
}

// ---------------------------------------------------------------------------
// Infer: risk
// ---------------------------------------------------------------------------

function inferRisk(data) {
  const text = makeText(
    data.title || '',
    data.desc || '',
    data.note || '',
    data.tags || []
  );
  const cat = String(data.category || '').toLowerCase();

  if (/red\s*team|安全|漏洞|勒索|攻击|绕过|反检测|sandbox|classifier|exploit|payload|backdoor/i.test(text)) {
    return ['安全敏感'];
  }
  if (/舆情|政策|监管|社会事件|争议|调查|敏感|封禁/i.test(text)) {
    return ['政策敏感'];
  }
  return ['低风险'];
}

// ---------------------------------------------------------------------------
// Infer: content_type
// ---------------------------------------------------------------------------

const CATEGORY_MAP = new Map([
  ['tool', '工具介绍'], ['tools', '工具介绍'], ['工具', '工具介绍'],
  ['open-source-tool', '开源项目'], ['open-source', '开源项目'],
  ['repository', '开源项目'], ['开源工具', '开源项目'],
  ['knowledge', '技术手册'], ['docs', '技术手册'],
  ['skill', '技术手册'], ['skills', '技术手册'], ['technical', '技术手册'],
  ['investigation', '调查报告'], ['深度调查', '调查报告'],
  ['舆情调查', '调查报告'], ['舆情核查', '舆情核查'],
  ['方法论', '方法论'], ['技术方法论', '方法论'],
  ['技术观点', '观点文章'], ['观点', '观点文章'],
  ['analysis', '产品分析'], ['product', '产品分析'],
  ['comparison', '对比评测'],
  ['website', '工具介绍'], ['workflow', '方法论'], ['tooling', '工具介绍'],
  ['ai工具', '工具介绍'], ['ai engineering', '技术手册'],
  ['person', '人物 / 组织'], ['人物', '人物 / 组织'],
  ['resource', '资源清单'], ['资源', '资源清单'],
]);

function inferContentType(data) {
  const text = makeText(
    data.category || '',
    data.title || '',
    data.desc || '',
    data.note || '',
    data.tags || []
  );
  const cat = String(data.category || '').trim().toLowerCase();
  const out = [];

  // category mapping
  if (CATEGORY_MAP.has(cat)) out.push(CATEGORY_MAP.get(cat));

  // GitHub repo signal
  if (/github\.com/.test(String(data.source_url || ''))) out.push('开源项目');

  // content signals
  if (/tutorial|guide|入门|上手|教程/i.test(text)) out.push('教程 / 入门');
  if (/compare|comparison|对比|vs\./i.test(text)) out.push('对比评测');
  if (/method|workflow|philosophy|方法论/i.test(text)) out.push('方法论');
  if (/manual|handbook|reference|手册|cli|command/i.test(text)) out.push('技术手册');
  if (/(^|\/)tool|工具介绍/i.test(text)) out.push('工具介绍');
  if (/安全|漏洞|leak|风险/i.test(text)) out.push('安全风险');
  if (/产品|product/i.test(text)) out.push('产品分析');
  if (/科普|科学|voxel|theorem/i.test(text)) out.push('科普解释');
  if (/essay|opinion|观点/i.test(text)) out.push('观点文章');
  if (/调查|investigation|analysis|report/i.test(text)) out.push('调查报告');
  if (/舆情核查|factcheck|核查/i.test(text)) out.push('舆情核查');
  if (/list|awesome|collection|清单/i.test(text)) out.push('资源清单');

  return uniq(out);
}

// ---------------------------------------------------------------------------
// Infer: domains
// ---------------------------------------------------------------------------

function inferDomains(data) {
  const text = makeText(data.title || '', data.desc || '', data.note || '', data.tags || []);
  const out = [];

  if (/python/.test(text)) out.push('Python');
  if (/typescript|\bts\b/.test(text)) out.push('TypeScript');
  if (/javascript/.test(text)) out.push('JavaScript');
  if (/node\.js|\bnode\b|npm/.test(text)) out.push('Node.js');
  if (/rust/.test(text)) out.push('Rust');
  if (/\bgo\b|golang/.test(text)) out.push('Go');
  if (/kotlin/.test(text)) out.push('Kotlin');
  if (/android/.test(text)) out.push('Android');
  if (/obsidian/.test(text)) out.push('Obsidian');
  if (/knowledge|wiki|vault|笔记|知识/.test(text)) out.push('知识管理');
  if (/agent|claude|codex|llm|gpt|anthropic|openai|rag|mcp/.test(text)) out.push('AI / LLM');
  if (/automation|workflow|subagent|harness/.test(text)) out.push('Agent / 自动化');
  if (/cli|terminal|shell|tmux|tui/.test(text)) out.push('CLI / Terminal');
  if (/linux|windows|macos|kernel/.test(text)) out.push('操作系统');
  if (/frontend|web |webapp|react|vue|dom|browser/.test(text)) out.push('Web 前端');
  if (/playwright|security|red[- ]team|sandbox/.test(text)) out.push('安全 / 红队');
  if (/animation|video|image|3d|canvas|svg|design|motion/.test(text)) out.push('设计 / 动效');
  if (/video|image|audio|tts|multimodal/.test(text)) out.push('多媒体 / 视频');
  if (/research|benchmark|舆情|调查/.test(text)) out.push('舆情 / 调查');

  const allowed = getSpecValues('domains');
  return uniq(out).filter(v => allowed.has(v));
}

// ---------------------------------------------------------------------------
// Infer: tool_types
// ---------------------------------------------------------------------------

function inferToolTypes(data) {
  const text = makeText(data.title || '', data.desc || '', data.note || '', data.tags || []);
  const out = [];

  if (/cli|terminal|shell|tmux|tui/.test(text)) out.push('CLI 工具');
  if (/editor|ide|cursor|vscode|codex|claude code/.test(text)) out.push('IDE / 编辑器');
  if (/build|bundler|vite|webpack/.test(text)) out.push('构建工具');
  if (/npm|pnpm|yarn|pip|uv/.test(text)) out.push('包管理器');
  if (/debug|trace|inspect/.test(text)) out.push('调试工具');
  if (/automation|workflow|playwright|agent-browser/.test(text)) out.push('自动化工具');
  if (/network|proxy|gateway|router|socks|http/.test(text)) out.push('网络工具');
  if (/graph|visual|canvas|diagram/.test(text)) out.push('图形 / 可视化');
  if (/animation|motion|gsap/.test(text)) out.push('动画引擎');
  if (/map|gis/.test(text)) out.push('地理引擎');
  if (/ai|llm|agent|prompt/.test(text)) out.push('AI 辅助工具');
  if (/framework|agent framework|sdk|adk/.test(text)) out.push('Agent 框架');
  if (/mcp/.test(text)) out.push('MCP / 协议');
  if (/script/.test(text)) out.push('脚本工具');
  if (/multi[- ]repo|worktree/.test(text)) out.push('多仓库管理');
  if (/knowledge|wiki|obsidian|notebook/.test(text)) out.push('知识库工具');
  if (/browser|playwright|cdp/.test(text)) out.push('浏览器自动化');
  if (/design|ui|ux/.test(text)) out.push('设计工具');
  if (/data|csv|analytics|benchmark/.test(text)) out.push('数据处理工具');
  if (/observability|monitor|trace|metrics/.test(text)) out.push('监控 / 可观测');
  if (/security|sandbox|red team|red-team/.test(text)) out.push('安全工具');
  if (/video|image|audio|tts|content/.test(text)) out.push('内容生成工具');

  const allowed = getSpecValues('tool_types');
  return uniq(out).filter(v => allowed.has(v));
}

// ---------------------------------------------------------------------------
// Infer: stages
// ---------------------------------------------------------------------------

function inferStages(data) {
  const text = makeText(data.title || '', data.desc || '', data.note || '', data.tags || []);
  const out = [];

  if (/plan|spec|需求|规划/.test(text)) out.push('需求 / 规划');
  if (/develop|coding|开发|agent coding/.test(text)) out.push('开发');
  if (/build|构建/.test(text)) out.push('构建');
  if (/debug|troubleshoot|诊断|排错/.test(text)) out.push('调试');
  if (/test|playwright|验收/.test(text)) out.push('测试');
  if (/publish|deploy|release|发布/.test(text)) out.push('发布');
  if (/ops|运维|runtime/.test(text)) out.push('运维');
  if (/monitor|observability/.test(text)) out.push('监控');
  if (/refactor|重构/.test(text)) out.push('重构');
  if (/performance|benchmark|性能/.test(text)) out.push('性能优化');
  if (/guide|tutorial|入门|学习/.test(text)) out.push('学习 / 入门');
  if (/workflow|规范|流程|manual/.test(text)) out.push('规范 / 流程');
  if (/research|analysis|compare|对比|调查/.test(text)) out.push('调研 / 选型');
  if (/knowledge|wiki|note|沉淀/.test(text)) out.push('知识沉淀');
  if (/security|risk|风险/.test(text)) out.push('风险评估');

  const allowed = getSpecValues('stages');
  return uniq(out).filter(v => allowed.has(v));
}

// ---------------------------------------------------------------------------
// Infer: interaction
// ---------------------------------------------------------------------------

function inferInteraction(data) {
  const text = makeText(data.title || '', data.desc || '', data.note || '', data.tags || []);
  const out = [];

  if (/cli|terminal|shell|tmux|tui/.test(text)) out.push('命令行');
  if (/gui|desktop|app|window/.test(text)) out.push('GUI');
  if (/api|rest|graphql|openai-compatible/.test(text)) out.push('Web API');
  if (/sdk|library/.test(text)) out.push('库 / SDK');
  if (/framework|adk/.test(text)) out.push('框架');
  if (/daemon|service|server/.test(text)) out.push('守护进程');
  if (/proxy|gateway|router|agent service/.test(text)) out.push('代理 / 服务');
  if (/plugin|extension/.test(text)) out.push('插件');
  if (/browser extension|chrome extension/.test(text)) out.push('浏览器扩展');
  if (/mcp/.test(text)) out.push('MCP Server');
  if (/desktop|tauri|electron/.test(text)) out.push('桌面应用');
  if (/website|web app|webui/.test(text)) out.push('Web 应用');
  if (/android|ios|mobile/.test(text)) out.push('移动端');
  if (/config|dotfile|settings\.json|yaml/.test(text)) out.push('配置文件');
  if (/skill|prompt|system prompt|claude\.md|design\.md/.test(text)) out.push('提示词 / Skill');

  const allowed = getSpecValues('interaction');
  return uniq(out).filter(v => allowed.has(v));
}

// ---------------------------------------------------------------------------
// Build complete taxonomy
// ---------------------------------------------------------------------------

const REQUIRED_NON_EMPTY = ['source', 'style', 'risk', 'content_type'];
const OPTIONAL = ['domains', 'tool_types', 'stages', 'interaction'];

function buildTaxonomy(data) {
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const title = String(data.title || '');
  const desc = String(data.desc || data.note || '');
  const note = String(data.note || '');

  const domains = inferDomains({ title, desc, note, tags });
  const toolTypes = inferToolTypes({ title, desc, note, tags });
  const stages = inferStages({ title, desc, note, tags });
  const interaction = inferInteraction({ title, desc, note, tags });
  const source = inferSource(data);
  const style = inferStyle(data);
  const risk = inferRisk({ title, desc, note, tags, category: data.category });
  const contentType = inferContentType({ ...data, title, desc, note, tags });

  return {
    domains: domains.length ? domains : [],
    tool_types: toolTypes.length ? toolTypes : [],
    stages: stages.length ? stages : [],
    interaction: interaction.length ? interaction : [],
    content_type: contentType.length ? contentType : [],
    source: source.length ? source : [],
    style: style.length ? style : [],
    risk: risk.length ? risk : [],
  };
}

// ---------------------------------------------------------------------------
// Validate taxonomy against spec
// ---------------------------------------------------------------------------

function validateTaxonomy(taxonomy) {
  if (!taxonomy || typeof taxonomy !== 'object') {
    return [{ type: 'error', field: 'taxonomy', message: 'taxonomy missing or not an object' }];
  }
  const allowed = getAllAllowedValues();
  const issues = [];

  const dims = ['domains', 'tool_types', 'stages', 'interaction', 'content_type', 'source', 'style', 'risk'];

  for (const dim of dims) {
    const val = taxonomy[dim];
    if (!Array.isArray(val)) {
      issues.push({ type: 'error', field: dim, message: `${dim} must be an array` });
      continue;
    }

    // canonicalize + validate each value
    for (const item of val) {
      const canon = dim === 'style' ? canonicalizeStyle(item) : String(item);
      if (canon && allowed[dim] && !allowed[dim].has(canon)) {
        issues.push({ type: 'error', field: dim, value: item, canonical: canon, message: `invalid value "${item}" for ${dim}; did you mean "${canon}"?` });
      }
    }
  }

  // required non-empty
  for (const dim of REQUIRED_NON_EMPTY) {
    const val = taxonomy[dim];
    if (!Array.isArray(val) || val.length === 0) {
      issues.push({ type: 'error', field: dim, message: `${dim} must be non-empty (can be auto-inferred)` });
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Merge: prefer existing non-empty values, fill gaps
// ---------------------------------------------------------------------------

function mergeTaxonomy(existing, inferred) {
  const result = {};
  const dims = ['domains', 'tool_types', 'stages', 'interaction', 'content_type', 'source', 'style', 'risk'];

  for (const dim of dims) {
    const have = Array.isArray(existing[dim]) ? existing[dim].filter(Boolean) : [];
    const fill = Array.isArray(inferred[dim]) ? inferred[dim] : [];
    if (have.length > 0) {
      // canonicalize existing values
      result[dim] = have.map(v => dim === 'style' ? canonicalizeStyle(v) : String(v)).filter(Boolean);
    } else if (fill.length > 0) {
      result[dim] = fill;
    } else {
      result[dim] = [];
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Meta file I/O
// ---------------------------------------------------------------------------

function walkMetaFiles(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMetaFiles(full, acc);
    else if (ent.isFile() && ent.name.endsWith('.meta.yaml')) acc.push(full);
  }
  return acc.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
}

function getChangedMetaFiles() {
  // works in CI (GITHUB_BASE_REF) or local (git diff)
  const base = process.env.GITHUB_BASE_REF
    ? `origin/${process.env.GITHUB_BASE_REF}`
    : 'origin/main';
  try {
    const { execSync } = require('child_process');
    const out = execSync(
      `git diff --name-only ${base}...HEAD -- 'docs/**/*.meta.yaml'`,
      { cwd: ROOT, encoding: 'utf8' }
    ).trim();
    if (!out) return [];
    return out.split('\n').filter(Boolean).map(f => path.join(ROOT, f));
  } catch {
    return [];
  }
}

function readMeta(p) {
  try {
    return readYaml(p);
  } catch (error) {
    return null;
  }
}

function writeMeta(p, data) {
  fs.writeFileSync(p, dumpYaml(data), 'utf8');
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  ROOT,
  DOCS,
  loadTaxonomySpec,
  getSpecValues,
  getAllAllowedValues,
  canonicalizeStyle,
  canonicalizeValue,
  inferSource,
  inferStyle,
  inferRisk,
  inferContentType,
  inferDomains,
  inferToolTypes,
  inferStages,
  inferInteraction,
  buildTaxonomy,
  validateTaxonomy,
  mergeTaxonomy,
  readYaml,
  dumpYaml,
  walkMetaFiles,
  getChangedMetaFiles,
  readMeta,
  writeMeta,
  REQUIRED_NON_EMPTY,
  OPTIONAL,
};
