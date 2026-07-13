const test = require('node:test');
const assert = require('node:assert/strict');
const { buildTaxonomy, mergeTaxonomy, validateTaxonomy } = require('../taxonomy-lib');

test('将技术栈与主题领域分开，并生成主内容类型', () => {
  /**
   * Given：一张同时描述 Python、Windows 与 AI Agent 的 GitHub 工具卡
   * When：根据元数据生成 taxonomy
   * Then：技术栈、主题、主内容类型分别落入正确字段
   * 防回归：避免重新把语言、平台和主题混写进同一个 domains 字段
   */
  const taxonomy = buildTaxonomy({
    title: 'Python AI Agent CLI 工具',
    desc: '面向 Windows 的开源命令行工具',
    source_url: 'https://github.com/example/project',
    style: 'darkblue',
  });

  assert.deepEqual(taxonomy.tech_stack, ['Python', 'Windows']);
  assert.ok(taxonomy.topics.includes('AI / LLM'));
  assert.equal(taxonomy.primary_content_type, '开源项目');
  assert.deepEqual(validateTaxonomy(taxonomy), []);
});

test('历史缺失来源与风格使用受控兜底值', () => {
  /**
   * Given：一张没有来源地址和视觉风格的历史卡
   * When：生成并合并 taxonomy
   * Then：必填高级维度使用标准兜底值且通过校验
   * 防回归：防止全量迁移后 source 或 style 再次出现空数组
   */
  const inferred = buildTaxonomy({ title: '历史技术说明', desc: '无来源记录的存量内容' });
  const taxonomy = mergeTaxonomy({}, inferred);

  assert.deepEqual(taxonomy.source, ['Unknown / legacy']);
  assert.deepEqual(taxonomy.style, ['legacy / 未分类']);
  assert.deepEqual(validateTaxonomy(taxonomy), []);
});
