# AgentKey / MCP Gateway Content Pattern

> 来源：AgentKey（chainbase-labs/Agentkey）信息卡写作会话，2026-07-09。
> 适用：Agent 应用层数据网关、MCP 服务、开发者工具类 GitHub 仓库信息卡。

## 典型章节顺序

```
1. Hero          — 品牌词 + tagline + 关键数字 + 警示 pill
2. Shell         — 能力导航(左) + 平台覆盖(中) + 计费状态(右)
3. Install/Config — 安装命令 + MCP endpoint + 配置前提
4. Not-混淆      — 本项目 ≠ X（显式区分，易混淆项目直接点名）
5. Doubt/存疑    — 所有不确定项保留「存疑」标记，黄色警告框
6. Feature Row   — 6 列以内图标化能力卡
7. Footer       — 项目名 + Stars + License + 接口类型
```

## Hero 区块写作要点

- 标题使用渐变色 `linear-gradient(135deg, #58c3ff, #8459ff, #4a78ff)` 作为 title 背景
- `kicker` 行放技术标签：`MCP · Agent Gateway · chainbase-labs`
- `subtitle` 写英文 tagline，`subcn` 写中文补充
- **警示 pill 必须有**：如果 credits 计费，写"⚠ 非完全免费，需注册充值"；如果免费也要写
- hero-note 用黄色边框突出重要前提（如注册地址、API Key 格式）

## Shell / Workbench 写作要点

### 左列：能力导航
- 列出核心功能，用 nav-dot 状态指示活动项
- active 项用 `.nav-item.active` + `.dot-cyan`

### 中列：平台覆盖
- 用 `.cap-tag` chips，按 `cyan/purple/green/yellow` 染色
- 支持的 agent 单独一 panel
- 支持的平台单独一 panel

### 右列：计费 / 状态
- 计费方式（Credits / Free / Subscription）
- 注册地址
- API Key 格式
- 免费额度（若未核实，标「存疑」）
- 遥测说明

## Install / Config 写作要点

- 两条安装命令（macOS + Windows）
- MCP endpoint 单独一 `.code-block`
- **必须写注册前提**：AgentKey 不是零配置，需要 console.agentkey.app 注册 + 充值
- 遥测关闭命令可选

## Not-混淆 写作要点

每个混淆项写一个 `.not-item`，格式：
```
<span class="not-name">本项目 ≠ 混淆对象</span>
说明二者区别（组织 / 功能 / 计费模式）
```

AgentKey 这类卡必写的混淆项：
- ≠ AgentKit（Coinbase）
- ≠ Agent-Reach（免费 vs 商业）
- ≠ OneKey
- ≠ agentgateway（网络代理层 vs 应用层）
- ≠ 同组织其他明星项目（如 manuscript-core）

## Doubt / 存疑 写作要点

- 用黄色警告框 `.doubt-section`
- 每项用 `.doubt-tag`「存疑」标记
- 常见保留项：许可证双声明、价格未核实、中文文档抓取失败、平台覆盖数量未核实

## 自检清单

- [ ] 标题对应正确项目（不是 AgentKit / Agent-Reach / OneKey）
- [ ] slug 唯一，不与其他项目混淆
- [ ] 许可证正确（以仓库 license 为准，不套用同组织其他仓库）
- [ ] Stars 正确（每个仓库单独核实，不套用）
- [ ] 无"免费"误导（若 credits 计费必须标注）
- [ ] 接口描述是 MCP（不是 REST/OpenAPI）
- [ ] 所有存疑项保留「存疑」标记
- [ ] 390px 无横向溢出
