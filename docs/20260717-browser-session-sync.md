# 双浏览器登录态同步：Cookie · Web Storage · CDP

> 面向浏览器自动化与开发者工具用户的完整技术报告。重点讨论：如何在两个独立浏览器实例之间迁移同一网站的 Cookies、localStorage 与 sessionStorage；CDP 能做什么；Playwright、扩展和 Profile 复制分别适合什么场景；以及如何在不泄露凭证的前提下验证结果。

## 核心结论

CDP 原生覆盖 Cookie 与 DOM Storage。最可控的工程方案是：为浏览器 A、B 暴露不同 CDP 端点，执行“读取 A → 按 origin/key 白名单过滤 → 写入 B → 刷新并验证”。

这不是一个绕过认证的方案，也不保证所有网站复制后都能登录。设备绑定、风控、IP、User-Agent、WebAuthn、IndexedDB、Service Worker、CSRF 和 token rotation 都可能使“状态已写入”与“登录已生效”分离。

## 数据模型

- Cookies：可携带 HttpOnly、Secure、SameSite、domain、path、expires、partitionKey 等属性；通常是服务端会话的重要部分。
- localStorage：按 origin 持久化的键值存储。
- sessionStorage：通常与当前 Tab / browsing context、frame 和 origin 相关；必须在目标页面上下文中操作，不能把它当成浏览器级全局状态。
- 其他状态：IndexedDB、Cache/Service Worker、WebAuthn、设备指纹与服务端风控可能共同参与登录判定。

## CDP 能力

`Network.getAllCookies` / `Network.setCookies` 用于 Cookie 快照与恢复。

`DOMStorage.getDOMStorageItems`、`setDOMStorageItem`、`removeDOMStorageItem` 用于 Web Storage；通过 `securityOrigin` 与 `isLocalStorage` 区分 localStorage 和 sessionStorage。

也可以通过 `Runtime.evaluate` 在目标页面上下文读取和写入：

```js
const snapshot = {
  localStorage: Object.fromEntries(Object.entries(localStorage)),
  sessionStorage: Object.fromEntries(Object.entries(sessionStorage))
};
```

不要在日志中输出快照 value。

## 推荐流程

1. 通过 CDP 连接浏览器 A，枚举并锁定目标网站 Tab/frame。
2. 确认 URL、origin、站点白名单与允许迁移的 key。
3. 读取 Cookies、localStorage、sessionStorage。
4. 在内存中生成经过过滤的快照。
5. 连接浏览器 B，打开相同 origin 的目标页面。
6. 恢复 Cookies 与 Web Storage。
7. reload 或执行站点允许的初始化动作。
8. 使用 DOM 登录标志、受保护 API 状态或导航结果验证。
9. 只报告数量、域名、key 名和 PASS/FAIL，不报告凭证值。

## 方案比较

| 方案 | 优点 | 局限 | 适用场景 |
|---|---|---|---|
| CDP 双端点 | 控制现有浏览器，覆盖三类目标状态 | 需要自行实现同步、过滤和验证 | 本机一次性或可审计工具 |
| Playwright storageState | Cookie + localStorage 固化成熟 | sessionStorage 需自定义；更适合新 Context | 测试和自动化 |
| Cookie Editor | 人工导入导出简单 | 主要解决 Cookie | 临时排障 |
| 自定义扩展 | 可做按钮、监听和产品化 | 权限、中继和适配成本较高 | 长期工具 |
| Profile 复制 | 看似覆盖面大 | 锁、加密、版本、并发和隐私风险 | 不建议 |

## 安全要求

登录态材料的敏感级别接近密码。使用 origin 白名单、key/domain 白名单、内存传输、短生命周期、0600 权限和本机受限通道。不要把 Cookie 或 token 写入 Git、普通日志、公开 HTTP 或长期明文 JSON。

先做 A→B 单向同步；需要覆盖写入时，先做 B 的状态检查或回滚策略。不要为了“提高成功率”无限扩大到 IndexedDB、全 Profile 或所有域名。

## 最小配置

```yaml
source: http://127.0.0.1:9222
target: http://127.0.0.1:9223
origins: ["https://example.com"]
storage: [cookies, localStorage, sessionStorage]
direction: A-to-B
mode: one-shot
log_values: false
verify: [logged_in_dom_marker, protected_api_status]
```

## 一手来源

- Chrome DevTools Protocol Network：<https://chromedevtools.github.io/devtools-protocol/tot/Network/>
- Chrome DevTools Protocol DOMStorage：<https://chromedevtools.github.io/devtools-protocol/tot/DOMStorage/>
- Chrome Extensions cookies API：<https://developer.chrome.com/docs/extensions/reference/api/cookies>
- Playwright Authentication：<https://playwright.dev/docs/auth>
- MDN Web Storage API：<https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API>

## 范围声明

本文讨论授权账户的本地状态迁移、自动化测试与开发调试。它不提供绕过站点认证、设备绑定、风控或访问控制的办法；实际使用必须遵守站点条款、组织安全政策和账户所有者授权。
