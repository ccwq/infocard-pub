#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('../assets/home/vendor/js-yaml.min.js');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const TAXONOMY_PATH = path.join(ROOT, '_taxonomy.yaml');
const WRITE = process.argv.includes('--write');

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, acc);
    else if (ent.isFile() && ent.name.endsWith('.meta.yaml')) acc.push(full);
  }
  return acc;
}

function readYaml(p) {
  const raw = fs.readFileSync(p, 'utf8');
  try {
    return yaml.load(raw, { schema: yaml.FAILSAFE_SCHEMA }) || {};
  } catch (error) {
    if (!/duplicated mapping key/i.test(String(error && error.message))) throw error;
    const lines = raw.split(/\r?\n/);
    const seen = new Map();
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (/^(\S[^:]*):\s*/.test(line)) {
        const key = line.replace(/:.*/, '').trim();
        seen.set(key, i);
      }
    }
    const filtered = lines.filter((line, i) => {
      const m = line.match(/^(\S[^:]*):\s*/);
      if (!m) return true;
      return seen.get(m[1]) === i;
    });
    return yaml.load(filtered.join('\n'), { schema: yaml.FAILSAFE_SCHEMA }) || {};
  }
}

function dumpYaml(obj) {
  return yaml.dump(obj, { lineWidth: -1, noRefs: true, sortKeys: false });
}

const taxonomySpec = readYaml(TAXONOMY_PATH);
const aliases = taxonomySpec.aliases || {};
const dims = taxonomySpec.dimensions || {};
const styleSet = new Set(((dims.style||{}).tags||[]).map(String));
const sourceSet = new Set(((dims.source||{}).tags||[]).map(String));
const domainValues = new Set(((dims.domains||{}).tags||[]).map(String));
const toolTypeValues = new Set(((dims.tool_types||{}).tags||[]).map(String));
const stageValues = new Set(((dims.stages||{}).tags||[]).map(String));
const interactionValues = new Set(((dims.interaction||{}).tags||[]).map(String));
const contentTypeValues = new Set(((dims.content_type||{}).tags||[]).map(String));

const categoryMap = new Map([
  ['tool', '工具介绍'], ['tools', '工具介绍'], ['工具', '工具介绍'], ['open-source-tool', '开源项目'], ['open-source', '开源项目'], ['repository', '开源项目'],
  ['knowledge', '技术手册'], ['docs', '技术手册'], ['skill', '技术手册'], ['skills', '技术手册'], ['technical', '技术手册'],
  ['investigation', '调查报告'], ['深度调查', '调查报告'], ['舆情调查', '调查报告'], ['舆情核查', '舆情核查'],
  ['方法论', '方法论'], ['技术方法论', '方法论'], ['技术观点', '观点文章'], ['观点', '观点文章'], ['analysis', '产品分析'], ['comparison', '对比评测'],
  ['website', '工具介绍'], ['workflow', '方法论'], ['tooling', '工具介绍']
]);

function canonicalTag(t) {
  const raw = String(t || '').trim();
  if (!raw) return '';
  return aliases[raw] || raw;
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function inferSource(data, tags) {
  const out = [];
  const url = String(data.source_url || '').toLowerCase();
  if (data.source === 'x' || tags.includes('X') || tags.includes('X / Twitter') || /x\.com|twitter\.com/.test(url)) out.push('X / Twitter');
  if (/github\.com/.test(url)) out.push('GitHub');
  else if (/wikipedia\.org/.test(url)) out.push('Wikipedia');
  else if (/arxiv|doi\.org|acm|nature\.com/.test(url)) out.push('Paper');
  else if (/\.pdf($|\?)/.test(url)) out.push('PDF');
  else if (/youtube\.com|youtu\.be|bilibili\.com/.test(url)) out.push('Video');
  else if (/^https?:\/\//.test(url)) out.push('Website');
  return uniq(out);
}

function inferDomains(data, tags, title, desc) {
  const text = [title, desc, ...tags].join(' | ').toLowerCase();
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
  if (/knowledge|wiki|vault|note|笔记|知识/.test(text)) out.push('知识管理');
  if (/agent|claude|codex|llm|gpt|anthropic|openai|rag|mcp/.test(text)) out.push('AI / LLM');
  if (/agent|automation|workflow|subagent|harness/.test(text)) out.push('Agent / 自动化');
  if (/cli|terminal|shell|tmux|tui/.test(text)) out.push('CLI / Terminal');
  if (/linux|windows|macos|kernel|system/.test(text)) out.push('操作系统');
  if (/frontend|web |webapp|react|vue|dom|browser/.test(text)) out.push('Web 前端');
  if (/playwright|security|red[- ]team|sandbox/.test(text)) out.push('安全 / 红队');
  if (/animation|video|image|3d|canvas|svg|design|motion/.test(text)) out.push('设计 / 动效');
  if (/video|image|audio|tts|multimodal/.test(text)) out.push('多媒体 / 视频');
  if (/research|benchmark|analysis|investigation|调查|舆情/.test(text)) out.push('舆情 / 调查');
  return uniq(out).filter(v => domainValues.has(v));
}

function inferToolTypes(data, tags, title, desc) {
  const text = [title, desc, ...tags].join(' | ').toLowerCase();
  const out = [];
  if (/cli|terminal|shell|tmux|tui/.test(text)) out.push('CLI 工具');
  if (/editor|ide|cursor|vscode|codex|claude code/.test(text)) out.push('IDE / 编辑器');
  if (/build|bundler|vite|webpack/.test(text)) out.push('构建工具');
  if (/npm|pnpm|yarn|pip|uv/.test(text)) out.push('包管理器');
  if (/debug|trace|inspect/.test(text)) out.push('调试工具');
  if (/automation|workflow|playwright|agent-browser/.test(text)) out.push('自动化工具');
  if (/network|proxy|gateway|router|socks|http/.test(text)) out.push('网络工具');
  if (/graph|visual|canvas|diagram/.test(text)) out.push('图形 / 可视化');
  if (/animation|motion|remotion|gsap/.test(text)) out.push('动画引擎');
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
  return uniq(out).filter(v => toolTypeValues.has(v));
}

function inferStages(data, tags, title, desc) {
  const text = [title, desc, ...tags].join(' | ').toLowerCase();
  const out = [];
  if (/plan|spec|需求|规划/.test(text)) out.push('需求 / 规划');
  if (/develop|coding|开发|agent coding/.test(text)) out.push('开发');
  if (/build|构建/.test(text)) out.push('构建');
  if (/debug|troubleshoot|诊断|排错/.test(text)) out.push('调试');
  if (/test|playwright|验收/.test(text)) out.push('测试');
  if (/publish|deploy|release|发布/.test(text)) out.push('发布');
  if (/ops|运维|runtime|monitor/.test(text)) out.push('运维');
  if (/monitor|observability/.test(text)) out.push('监控');
  if (/refactor|重构/.test(text)) out.push('重构');
  if (/performance|benchmark|性能/.test(text)) out.push('性能优化');
  if (/guide|tutorial|入门|学习/.test(text)) out.push('学习 / 入门');
  if (/workflow|规范|流程|manual/.test(text)) out.push('规范 / 流程');
  if (/research|analysis|compare|对比|调查/.test(text)) out.push('调研 / 选型');
  if (/knowledge|wiki|note|沉淀/.test(text)) out.push('知识沉淀');
  if (/security|risk|风险/.test(text)) out.push('风险评估');
  return uniq(out).filter(v => stageValues.has(v));
}

function inferInteraction(data, tags, title, desc) {
  const text = [title, desc, ...tags].join(' | ').toLowerCase();
  const out = [];
  if (/cli|terminal|shell|tmux|tui/.test(text)) out.push('命令行');
  if (/gui|desktop|app|window/.test(text)) out.push('GUI');
  if (/api|rest|graphql|openai-compatible/.test(text)) out.push('Web API');
  if (/sdk|library|库 /.test(text)) out.push('库 / SDK');
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
  if (/skill|prompt|system prompt/.test(text)) out.push('提示词 / Skill');
  return uniq(out).filter(v => interactionValues.has(v));
}

function inferContentType(data, tags, title, desc) {
  const text = [String(data.category||''), title, desc, ...tags].join(' | ').toLowerCase();
  const out = [];
  const mapped = categoryMap.get(String(data.category || '').trim().toLowerCase());
  if (mapped) out.push(mapped);
  if (/github\.com/.test(String(data.source_url||''))) out.push('开源项目');
  if (/调查|investigation|analysis|report/.test(text)) out.push('调查报告');
  if (/舆情核查/.test(text)) out.push('舆情核查');
  if (/tutorial|guide|入门|上手/.test(text)) out.push('教程 / 入门');
  if (/compare|comparison|对比/.test(text)) out.push('对比评测');
  if (/method|workflow|philosophy|方法论/.test(text)) out.push('方法论');
  if (/manual|handbook|reference|手册/.test(text)) out.push('技术手册');
  if (/tool|工具/.test(text)) out.push('工具介绍');
  if (/risk|安全|leak|漏洞/.test(text)) out.push('安全风险');
  if (/产品|product/.test(text)) out.push('产品分析');
  if (/科学|科普|voxel|theorem/.test(text)) out.push('科普解释');
  if (/观点|essay|coming loop/.test(text)) out.push('观点文章');
  return uniq(out).filter(v => contentTypeValues.has(v));
}

function inferRisk(data, tags, title, desc) {
  const text = [title, desc, ...tags, data.category || ''].join(' | ').toLowerCase();
  if (/red team|安全|漏洞|勒索|爆炸|风险|classifier|sandbox/.test(text)) return ['安全敏感'];
  if (/调查|舆情|政策|监管/.test(text)) return ['政策敏感'];
  return ['低风险'];
}

function migrateFile(file) {
  const data = readYaml(file);
  const oldTags = Array.isArray(data.tags) ? data.tags.map(canonicalTag).filter(Boolean) : [];
  const title = String(data.title || '');
  const desc = String(data.desc || data.note || '');
  const taxonomy = {
    domains: inferDomains(data, oldTags, title, desc),
    tool_types: inferToolTypes(data, oldTags, title, desc),
    stages: inferStages(data, oldTags, title, desc),
    interaction: inferInteraction(data, oldTags, title, desc),
    content_type: inferContentType(data, oldTags, title, desc),
    source: inferSource(data, oldTags),
    risk: inferRisk(data, oldTags, title, desc)
  };
  if (data.style) taxonomy.style = [String(data.style)];

  const cleanedTags = uniq(oldTags).filter(t => !styleSet.has(t) && !sourceSet.has(t));
  data.tags = cleanedTags;
  data.taxonomy = taxonomy;
  return data;
}

let changed = 0;
for (const file of walk(DOCS)) {
  const next = migrateFile(file);
  const yamlText = dumpYaml(next);
  if (WRITE) fs.writeFileSync(file, yamlText, 'utf8');
  changed += 1;
}

console.log(JSON.stringify({ scanned: changed, write: WRITE }, null, 2));
