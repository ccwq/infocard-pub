# LLM 隐私网关 / 安全前置层卡片模式

适用对象：`LLM privacy gateway`、`data redaction`、`PII masking`、`secret scrubber`、`gateway middleware`、`compliance prefilter` 类 GitHub 仓库。

## 这类卡的主叙事

不要把它写成“又一个中间件”。更合适的叙事是：

- 它解决的是 **LLM 入口前的敏感信息边界**
- 核心价值是 **低延迟、无模型依赖、可预测**
- 关键取舍是 **是否做 NER / 是否保留可逆性 / 是否引入 GPU**

## 推荐结构

1. 一句话定位：纯 Go / Rust / Java 之类的静态网关，做什么敏感信息拦截
2. 两层或多层检测：
   - 结构化 PII：邮箱、电话、身份证、银行卡、IP
   - 凭据 / 秘密：API key、token、private key、password、高熵字符串
3. 延迟与架构取舍：
   - 明确写“不做 NER”或“不引入额外模型”
   - 说明 regex / ruleset / entropy / keyword prefilter 的组合
   - 如果语言是 Go，强调 RE2 线性时间与无回溯风险
4. 接入方式：core package / HTTP / gRPC / middleware
5. 生产性：是否已在生产使用、是否静态二进制、是否可嵌入现有 gateway
6. 风险与边界：
   - 不解决所有隐私问题
   - 不做语义实体识别
   - 只做不可逆脱敏时，需明确不可回填

## 主题建议

- `redswiss`：开源安全工具、CLI、网关、边界控制
- `darkgreen`：偏监控 / 内网 / 本地运行的安全面板
- `hardblue`：如果更像技术手册而非工具图鉴

## 文案要点

- 用“入口前”“前置层”“边界”“可预测延迟”这类词
- 不要写成“高级 AI 能力”，要写成“安全工程 / 生产可用 / 延迟预算”
- 如果仓库明确写了生产在用，把这句放在 hero 或元信息旁边
- 如果仓库没有模型，也不要硬凑模型栈；强调“无需额外模型 / GPU”就是亮点

## 验收关注点

- 桌面与 390px 移动端都要保证表格与代码块不溢出
- 两层检测表格要能在窄屏下保持可读
- 结构图最好用 SVG / 原生图形表达“检测 → span merge → 重建”的流水线
