'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  normalizeThemeSlug,
  parseThemeDecision,
  readThemeDecision,
  selectTheme,
  validateThemeDecision,
  evaluateBatchDiversity,
  validateAuthorDelegationContext,
} = require('../../.agents/skills/infocard/infocard-theme-assignment/scripts/theme-decision');

const ROOT = path.resolve(__dirname, '../..');
const skill = (...parts) => fs.readFileSync(path.join(ROOT, '.agents', 'skills', ...parts, 'SKILL.md'), 'utf8');
const assignment = skill('infocard', 'infocard-theme-assignment');
const topic = skill('productivity', 'infocard-topic-selection');
const content = skill('infocard', 'infocard-content-types');
const authoring = skill('infocard', 'infocard-authoring-workflow');
const publish = skill('productivity', 'infocard-publish-sop');
const pipeline = fs.readFileSync(path.join(ROOT, '.agents', 'skills', 'productivity', 'infocard-three-stage-pipeline', 'SKILL.md'), 'utf8');
const styleManager = fs.readFileSync(path.join(ROOT, '.agents', 'skills', 'infocard-styles', 'infocard-style-man-skill', 'SKILL.md'), 'utf8');

test('theme routing references one executable owner', () => {
  /**
   * Given：三阶段流水线和 style manager 都可能接触主题。
   * When：检查其主题决策声明。
   * Then：两者都指向 theme-assignment 的 JSON；style manager 不再自行路由。
   * 防回归：防止旧 txt 记录或内容到主题映射恢复为第二入口。
   */
  assert.match(pipeline, /theme-decision\.json/);
  assert.doesNotMatch(pipeline, /theme-decision\.txt/);
  assert.match(pipeline, /infocard-theme-assignment.*唯一决定/);
  assert.match(styleManager, /infocard-theme-assignment/);
  assert.match(styleManager, /不得按内容类型自行选择/);
});

test('theme decision architecture has one owner and one record format', () => {
  /**
   * Given：信息卡流程由主题分配、内容、选题、authoring 和 publish 多个 skill 组成。
   * When：扫描其职责契约与决策记录引用。
   * Then：只有 theme-assignment 拥有内容到主题的选择；authoring/publish 只消费或验证 JSON。
   * 防回归：防止固定映射和第二个 content-theme router 重新出现。
   */
  assert.match(assignment, /唯一的内容—主题关联入口/);
  assert.match(assignment, /theme-decision\.json/);
  assert.match(assignment, /bounded weighted random/);
  assert.match(assignment, /user.*指定|用户指定/);
  assert.match(assignment, /能力.*过滤|capability filtering/);
  assert.doesNotMatch(topic, /theme_primary\s*[:：].*\n.*theme_fallback/);
  assert.doesNotMatch(content, /theme_primary\s*[:：]/);
  assert.doesNotMatch(authoring, /infocard-publish-sop.*single source of truth for theme assignment/);
  assert.match(authoring, /theme-decision\.json/);
  assert.match(publish, /theme-decision\.json/);
  assert.match(publish, /never generates candidates, ranks themes, or makes a second theme decision/);
});

test('theme-decision.json contract exposes reproducibility and bounded variation', () => {
  /**
   * Given：主题决策需要支持小范围随机波动且可复现。
   * When：读取 canonical schema reference。
   * Then：记录包含候选、排除原因、权重、seed、最终选择和用户 override。
   * 防回归：防止随机选择没有证据，或把用户主题当作无条件覆盖。
   */
  const schema = fs.readFileSync(path.join(ROOT, '.agents', 'skills', 'infocard', 'infocard-theme-assignment', 'references', 'theme-decision-schema.md'), 'utf8');
  for (const field of ['content_type', 'content_shape', 'candidate_themes', 'excluded_themes', 'selection_weights', 'seed', 'selected_theme', 'user_override']) {
    assert.match(schema, new RegExp(`"${field}"`), field);
  }
  assert.match(schema, /selected_theme.*candidate_themes/);
  assert.match(schema, /请求主题注册且能力校验通过/);
  assert.match(schema, /HTML.*data-theme.*sidecar/);
});

test('ordinary single-card route does not inherit batch diversity requirements', () => {
  /**
   * Given：普通单卡不需要批量级 diversity 和重复审核。
   * When：检查主题分配的批量边界。
   * Then：单卡只执行能力校验与决策记录，批量检查按条件启用。
   * 防回归：防止过渡期审核成本再次成为所有卡片的强制前置流程。
   */
  assert.match(assignment, /普通单卡只执行候选能力校验和记录/);
  assert.match(assignment, /批量复用或主题重建才增加重复主题检查/);
});

test('theme decision module parses and validates a real decision record', () => {
  /**
   * Given：项目 theme 目录存在 blue/hardblue，决策记录来自 JSON 文本。
   * When：执行真实 JSON.parse，并校验候选、权重、seed、override 和三方主题声明。
   * Then：合法记录通过，非法记录被拒绝。
   * 防回归：防止仅靠 Markdown/正则声称契约可执行。
   */
  const record = {
    version: 1,
    content_type: 'tool',
    content_shape: 'single technical tool',
    required_capabilities: ['code_blocks', 'mobile_layout'],
    candidate_themes: ['hardblue', 'blue'],
    excluded_themes: [{ theme: 'q', reason: 'dense code is unsupported' }],
    selection_weights: { hardblue: 2, blue: 1 },
    seed: 'fixed-seed',
    selected_theme: 'hardblue',
    user_override: { requested: null, accepted: false, reason: null },
  };
  const parsed = parseThemeDecision(JSON.stringify(record), { projectRoot: ROOT });
  assert.equal(parsed.valid, true);
  assert.equal(parsed.decision.selected_theme, 'hardblue');
  const file = path.join(os.tmpdir(), `theme-decision-${process.pid}.json`);
  fs.writeFileSync(file, JSON.stringify(record));
  assert.equal(readThemeDecision(file, { projectRoot: ROOT }).valid, true);
  fs.rmSync(file, { force: true });
  assert.equal(parseThemeDecision('{bad json', { projectRoot: ROOT }).valid, false);
  const invalid = validateThemeDecision({ ...record, candidate_themes: ['blue-technical-manual'], selected_theme: 'blue-technical-manual' }, { projectRoot: ROOT });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some((item) => item.field === 'candidate_themes'));
});

test('theme selection filters capabilities, exclusions, weights and reproduces by seed', () => {
  /**
   * Given：候选池含可用、能力不足、显式排除和未注册主题。
   * When：按固定 seed 选择主题。
   * Then：结果只来自过滤后的候选，且相同 seed 得到相同结果；排除原因被记录。
   * 防回归：防止无界随机、静默丢弃候选或用未注册主题。
   */
  const input = {
    projectRoot: ROOT,
    contentType: 'tool',
    contentShape: 'single technical tool',
    requiredCapabilities: ['tables'],
    candidateThemes: ['hardblue', 'q', 'blue', 'not-registered'],
    selectionWeights: { hardblue: 3 },
    excludedThemes: [{ theme: 'blue', reason: 'recently used' }],
    seed: 'same-seed',
  };
  const first = selectTheme(input);
  const second = selectTheme(input);
  assert.deepEqual(first, second);
  assert.deepEqual(first.candidate_themes, ['hardblue']);
  assert.equal(first.selected_theme, 'hardblue');
  assert.ok(first.excluded_themes.some((item) => item.theme === 'q'));
  assert.ok(first.excluded_themes.some((item) => item.theme === 'not-registered'));
});

test('user override is accepted only after registration and capability gates', () => {
  /**
   * Given：用户分别请求已注册可用主题、能力不足主题和未注册主题。
   * When：执行主题选择。
   * Then：只有通过能力门禁的已注册主题可 override；其余回退到合格候选并记录原因。
   * 防回归：防止用户主题绕过主题能力或把 style skill 名称误当注册 slug。
   */
  const base = {
    projectRoot: ROOT,
    contentType: 'tool',
    contentShape: 'tool',
    requiredCapabilities: ['tables'],
    candidateThemes: ['hardblue', 'q', 'blue'],
    seed: 'override-seed',
  };
  const accepted = selectTheme({ ...base, userOverride: 'hardblue' });
  assert.equal(accepted.selected_theme, 'hardblue');
  assert.equal(accepted.user_override.accepted, true);
  const rejected = selectTheme({ ...base, userOverride: 'q' });
  assert.equal(rejected.user_override.accepted, false);
  assert.notEqual(rejected.selected_theme, 'q');
  const unknown = selectTheme({ ...base, userOverride: 'blue-technical-manual' });
  assert.equal(unknown.user_override.accepted, false);
});

test('decision validation binds selected theme to HTML and sidecar declarations', () => {
  /**
   * Given：决策记录选定 hardblue，并有 HTML data-theme 与 sidecar style。
   * When：验证三方主题声明。
   * Then：一致时通过，任一不一致时阻塞。
   * 防回归：防止决策文件、HTML 和元数据各自漂移。
   */
  const decision = selectTheme({
    projectRoot: ROOT,
    contentType: 'tool',
    contentShape: 'tool',
    requiredCapabilities: [],
    candidateThemes: ['hardblue'],
    seed: 'binding-seed',
    userOverride: 'hardblue',
  });
  assert.equal(validateThemeDecision(decision, {
    projectRoot: ROOT,
    html: '<html data-theme="hardblue">',
    sidecarStyle: 'hardblue',
  }).valid, true);
  assert.equal(validateThemeDecision(decision, {
    projectRoot: ROOT,
    html: '<html data-theme="blue">',
    sidecarStyle: 'hardblue',
  }).valid, false);
  assert.equal(normalizeThemeSlug('infocard-hardblue-style', ROOT), 'hardblue');
  assert.equal(validateThemeDecision(decision, {
    projectRoot: ROOT,
    html: '<html data-theme="hardblue">',
    sidecarStyle: 'infocard-hardblue-style',
  }).valid, true);
});

test('explicit invalid selection weights fail instead of silently becoming one', () => {
  /**
   * Given：候选主题带有非法的负数、NaN 或 Infinity 权重。
   * When：执行主题选择。
   * Then：立即抛出权重错误，不把非法值静默归一为 1。
   * 防回归：防止错误配置伪装成可复现的合法主题决策。
   */
  const base = {
    projectRoot: ROOT,
    contentType: 'tool',
    contentShape: 'tool',
    candidateThemes: ['hardblue'],
    seed: 'invalid-weight',
  };
  for (const weight of [-1, Number.NaN, Number.POSITIVE_INFINITY, '1']) {
    assert.throws(
      () => selectTheme({ ...base, selectionWeights: { hardblue: weight } }),
      /selection weight for hardblue must be a finite non-negative number/,
    );
  }
});

test('selection weights reject unregistered and excluded themes', () => {
  /**
   * Given：selectionWeights 含有未注册主题或已被排除的主题。
   * When：执行主题选择。
   * Then：两类显式旁路配置都被拒绝，而不是被静默忽略。
   * 防回归：防止权重配置绕过最终候选池和排除规则。
   */
  const base = {
    projectRoot: ROOT,
    contentType: 'tool',
    contentShape: 'tool',
    candidateThemes: ['hardblue', 'blue'],
    excludedThemes: [{ theme: 'blue', reason: 'recently used' }],
    seed: 'invalid-target',
  };
  assert.throws(
    () => selectTheme({ ...base, selectionWeights: { ghost: 1 } }),
    /selection weight for ghost must target a final candidate theme/,
  );
  assert.throws(
    () => selectTheme({ ...base, selectionWeights: { blue: 1 } }),
    /selection weight for blue must target a final candidate theme/,
  );
});

test('batch diversity gate flags concentration and consecutive reuse', () => {
  const result = evaluateBatchDiversity(['blue', 'hardblue', 'hardblue', 'hardblue', 'hardblue', 'redswiss']);
  assert.equal(result.dominant_theme, 'hardblue');
  assert.equal(result.dominant_count, 4);
  assert.equal(result.review_required, true);
  assert.equal(result.thresholds.recent_limit, 6);
});

test('author delegation rejects hard-coded themes and requires frozen decision consumer', () => {
  const valid = validateAuthorDelegationContext(
    'Read .docs/run/card/theme-decision.json and consume selected_theme exactly.',
    '.docs/run/card/theme-decision.json',
  );
  assert.equal(valid.valid, true);
  const invalid = validateAuthorDelegationContext(
    'Theme: hardblue. Create a hardblue information card.',
    null,
  );
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some((item) => item.includes('hard-codes')));
});
