'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { audit, REQUIRED_ROUTES } = require('../lib/infocard-skill-architecture');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const MANIFEST = path.join(ROOT, '.scratch/infocard-skill-architecture/migration-manifest.md');

test('migration manifest and project tree pass deterministic integrity audit', () => {
  /**
   * Given：迁移 manifest 声明了全局候选、项目目的地和分类。
   * When：审计项目本地 SKILL.md、目的地与 manifest 分类。
   * Then：所有迁移项可定位且 canonical name 唯一。
   * 防回归：避免支持文件迁移后留下空壳或重复 frontmatter。
   */
  const report = audit({ projectRoot: ROOT, manifest: MANIFEST, globalRoot: path.join(ROOT, '.missing-global') });
  assert.deepEqual(report.errors, []);
});

test('router declares every required route target and safety boundary', () => {
  /**
   * Given：全局入口只能做薄路由，项目流程必须由本地 canonical skill 承担。
   * When：读取 router 文本并审计八类目标及不可用/授权状态。
   * Then：每个 route family 都指向预期项目 skill，并声明 PROJECT_SKILL_UNAVAILABLE 与授权边界。
   * 防回归：避免入口退化成重复 SOP 或把查询升级为发布。
   */
  const router = path.join(os.tmpdir(), `infocard-router-${process.pid}.md`);
  const text = ['PROJECT_SKILL_UNAVAILABLE', 'authorization', ...Object.values(REQUIRED_ROUTES).flat()].join('\n');
  fs.writeFileSync(router, text);
  const report = audit({ projectRoot: ROOT, manifest: MANIFEST, globalRoot: path.join(ROOT, '.missing-global'), router });
  assert.deepEqual(report.errors, []);
  fs.rmSync(router, { force: true });
});

test('router audit rejects a router that only reports project unavailability', () => {
  /**
   * Given：Hermes 从非 infocard-pub 目录启动且项目 skill 不可发现。
   * When：审计入口声明的 unavailable 状态。
   * Then：必须保留 PROJECT_SKILL_UNAVAILABLE，不得静默回退到全局发布流程。
   * 防回归：避免外部工作目录伪造项目能力并产生副作用。
   */
  const router = path.join(os.tmpdir(), `infocard-router-unavailable-${process.pid}.md`);
  fs.writeFileSync(router, 'PROJECT_SKILL_UNAVAILABLE authorization');
  const report = audit({ projectRoot: ROOT, manifest: MANIFEST, globalRoot: path.join(ROOT, '.missing-global'), router });
  assert.ok(report.errors.some((error) => error.includes('router create missing')));
  fs.rmSync(router, { force: true });
});

test('mobile verification has one canonical entry and legacy skill directories are removed', () => {
  /**
   * Given：移动端能力已强合并，旧 skill 已删除。
   * When：检查 canonical skill、旧目录和创建预览 skill。
   * Then：只有 canonical 提供移动验收，旧目录不存在，preview skill 不含移动验收/截图/发布旁路。
   * 防回归：避免移动端入口重新分裂或删除后又留下可执行尾巴。
   */
  const canonicalPath = path.join(ROOT, '.agents/skills/productivity/infocard-mobile-verifier/SKILL.md');
  const legacyDirs = [
    '.agents/skills/productivity/infocard-mobile-rendering-verification',
    '.agents/skills/productivity/infocard-responsive-layout',
    '.agents/skills/infocard/infocard-css-recovery',
    '.agents/skills/infocard/infocard-html-structure-debug',
    '.agents/skills/infocard/infocard-grid-stripe-collapse',
  ].map((file) => path.join(ROOT, file));
  const previewPath = path.join(ROOT, '.agents/skills/productivity/infocard-creation-preview-standards/SKILL.md');
  const canonical = fs.readFileSync(canonicalPath, 'utf8');
  assert.match(canonical, /唯一正式入口/);
  assert.match(canonical, /有序决策循环/);
  assert.match(canonical, /disposition/);
  assert.match(canonical, /VISUAL_PENDING/);
  assert.match(canonical, /不取得整卡发布权限/);
  assert.doesNotMatch(canonical, /npm run build|git push|git commit|git worktree/);
  for (const dir of legacyDirs) assert.equal(fs.existsSync(dir), false, `legacy directory remains: ${dir}`);
  const preview = fs.readFileSync(previewPath, 'utf8');
  assert.match(preview, /创建阶段|Creation-stage checklist/);
  assert.match(preview, /infocard-mobile-verifier/);
  assert.doesNotMatch(preview, /移动端验收流程|移动截图流程|Standard Workflow|Verification Checklist|git worktree|isolated worktree|git push|git commit|npm run build/);
});

test('mobile migration manifest and references contain no deleted entry or publish bypass', () => {
  /**
   * Given：五个旧移动端 skill 已删除，能力已合并到唯一 canonical skill。
   * When：检查迁移清单、canonical mobile references、路由与授权执行引用。
   * Then：清单反映 59/50 的真实结构，references 不再主动执行 worktree/push/发布流程，正式引用只指向 canonical skill。
   * 防回归：避免删除目录后在清单或历史 recipe 中留下可执行尾巴。
   */
  const manifest = fs.readFileSync(MANIFEST, 'utf8');
  assert.match(manifest, /Final project-local skills: 57 unique canonical names/);
  assert.match(manifest, /48 migration records/);
  const retainedSection = manifest.split('## Merge details', 1)[0];
  for (const deleted of ['infocard-mobile-rendering-verification', 'infocard-responsive-layout', 'infocard-css-recovery', 'infocard-html-structure-debug', 'infocard-grid-stripe-collapse']) {
    assert.doesNotMatch(retainedSection, new RegExp('\\`' + deleted + '\\`'));
  }
  const referenceRoot = path.join(ROOT, '.agents/skills/productivity/infocard-mobile-verifier/references');
  const referenceText = fs.readdirSync(referenceRoot)
    .filter((entry) => entry.endsWith('.md'))
    .map((entry) => fs.readFileSync(path.join(referenceRoot, entry), 'utf8'))
    .join('\n');
  assert.doesNotMatch(referenceText, /git push|push origin|git worktree|isolated worktree/);
  const router = fs.readFileSync(path.join(ROOT, 'scripts/lib/infocard-skill-architecture.js'), 'utf8');
  assert.doesNotMatch(router, /mobile-rendering-verification|responsive-layout|css-recovery|html-structure-debug|grid-stripe-collapse/);
  const authorized = fs.readFileSync(path.join(ROOT, '.agents/skills/publishing/authorized-infocard-execution/SKILL.md'), 'utf8');
  assert.match(authorized, /infocard-mobile-verifier/);
  assert.doesNotMatch(authorized, /mobile-rendering-verification|responsive-layout|css-recovery|html-structure-debug|grid-stripe-collapse/);
});

test('routing and recovery references keep current work in the main checkout', () => {
  /**
   * Given：source routing、事故恢复和主题 reference 都可能被后续 agent 读取。
   * When：审计这些文档的 active 指令与示例路径。
   * Then：routing 明确禁止 worktree，recovery 仅作 historical 资料并回指 publish-sop，darkblue 不含禁用临时路径。
   * 防回归：避免旧事故文档重新成为 worktree、push 或临时 clone 的执行入口。
   */
  const routing = fs.readFileSync(path.join(ROOT, '.agents/skills/infocard/infocard-source-routing-decision-tree/SKILL.md'), 'utf8');
  assert.match(routing, /明确禁止|never creates|never .*worktree/i);
  assert.doesNotMatch(routing, /before any worktree creation/);

  const recovery = fs.readFileSync(path.join(ROOT, '.agents/skills/publishing/authorized-infocard-execution/references/authorized-run-resource-recovery-20260809.md'), 'utf8');
  assert.match(recovery, /Historical incident|Historical case study/i);
  assert.match(recovery, /infocard-publish-sop/);
  assert.doesNotMatch(recovery, /git push origin|git worktree|git clone/);

  const darkblue = fs.readFileSync(path.join(ROOT, '.agents/skills/productivity/infocard-creation-preview-standards/references/darkblue-theme-classes.md'), 'utf8');
  assert.doesNotMatch(darkblue, /\/tmp\/infocard/);
  assert.match(darkblue, /`theme\/darkblue\.html`/);
});

test('theme lifecycle has one manager and explicit preview ownership', () => {
  /**
   * Given：主题创建、改造与精炼已合并到 infocard-styles 下的唯一管理入口。
   * When：检查主题管理 skill、旧入口、职责边界与迁移记录。
   * Then：统一入口覆盖完整生命周期，预览资产责任明确，旧入口不存在。
   * 防回归：避免主题流程再次分裂并重新引入发布或 worktree 旁路。
   */
  const managerPath = path.join(ROOT, '.agents/skills/infocard-styles/infocard-style-man-skill/SKILL.md');
  const manager = fs.readFileSync(managerPath, 'utf8');
  assert.match(manager, /主题生命周期统一决策树/);
  for (const term of ['创建', '注册', '维护', '审查', '改造', '重设计', '精炼', '合并', '废弃']) assert.match(manager, new RegExp(term));
  assert.match(manager, /theme\/<slug>\.html/);
  assert.match(manager, /fixture/);
  assert.match(manager, /_themes\.yaml/);
  assert.match(manager, /themes\.html/);
  assert.doesNotMatch(manager, /git worktree|git clone/);
  assert.equal(fs.existsSync(path.join(ROOT, '.agents/skills/content/infocard-style-man-skill')), false);
  assert.equal(fs.existsSync(path.join(ROOT, '.agents/skills/design/infocard-theme-redesign')), false);
  assert.equal(fs.existsSync(path.join(ROOT, '.agents/skills/design/infocard-archival-theme-refinement')), false);
  const manifest = fs.readFileSync(MANIFEST, 'utf8');
  assert.match(manifest, /`.agents\/skills\/infocard-styles\/infocard-style-man-skill`/);
  assert.doesNotMatch(manifest, /infocard-theme-redesign|infocard-archival-theme-refinement/);
});
