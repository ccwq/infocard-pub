# 过程文件模板

## 必须包含的章节

```markdown
# 过程文件：<项目名称>

## 主体
- GitHub URL: ...
- 推荐标题: ...
- 推荐 slug: ...

## 用户原始内容
<粘贴用户提供的文本>

## 调查内容
### 来源 1
- URL: ...
- 引用片段: ...

## 事实核验结果
| 陈述 | 结论 | 依据 |
|------|------|------|
| ... | ✅/❌/⚠️ | ... |

## 存疑项
- ❌ 未核实：...
- ⚠️ 存疑：...

## 禁止混淆对象
1. <对象名>：<区分理由>

## 调查时间
<执行 TZ=Asia/Shanghai date 的输出>
```

## GitHub Stars 提取方法

当 GitHub 页面无法直接提取 Stars 数时，按以下优先级尝试：

1. **GitHub API**（首选）
   ```bash
   curl -sL "https://api.github.com/repos/OWNER/REPO" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('stargazers_count', 'N/A'))"
   ```
   - 注意：未认证请求有 rate limit（60次/小时），高频任务可能触发

2. **gitstarclub.com**（备选）
   - URL pattern: `https://gitstarclub.com/o/OWNER`
   - 提取字段: `AGGREGATE TRACKED STARS` / `TOTAL STARS`
   - 快照日期: `DATA AS OF`
   - 示例值格式: "32.7k", "14.2k"
   - 页面截取法: 浏览器访问 → 提取数字 + "k" → 标注【存疑：需核实】

3. **页面 HTML grep**（兜底）
   ```bash
   curl -sL "https://github.com/OWNER/REPO" | grep -i "star"
   ```
   - 不太可靠，GitHub 大量非 stars 相关的 "star" 字符串

4. **browser_vision**（最后手段）
   - 若所有方法失败，使用截图人工读取

**本 session 案例**: GitHub API 触发 rate limit，gitstarclub.com 获取 ~32.7k Stars

## 存疑标注规则
- ✅ 已核实：多个独立来源一致确认
- ❌ 未核实：无证据支持，公开资料矛盾
- ⚠️ 存疑：单来源或证据不足，存在混淆可能
