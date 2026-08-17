# HAR-derived API Client 研究报告

## 事实边界
- 来源：NousResearch/hermes-agent 的 official optional skill `optional-skills/web-development/har-derived-api-client`。
- 版本：0.1.0；许可证 MIT；支持 Linux、macOS、Windows；分类 web-development。
- 官方定位：在真实浏览器中捕获 HAR，再提炼并验证私有 JSON API，通过普通 HTTP 直接调用。
- 脚本：`har_capture.py`、`har_capture_cdp.py`、`har_to_client.py`。
- 安装：`hermes skills install official/web-development/har-derived-api-client`。

## 工作流
1. 在用户有权访问的真实浏览器会话中完成动作并捕获 HAR。
2. 从 HAR 中筛选目标 JSON/XHR/fetch 请求，排除埋点、静态资源和登录跳转。
3. 用转换脚本生成普通 HTTP 客户端草稿。
4. 删除无关 headers，保留必要参数，使用最小请求验证 JSON 形状、状态码和错误路径。
5. 认证材料过期或站点改变时，回到浏览器重新捕获，而不是绕过认证。

## 安全与不确定性
该技能不绕过认证、CAPTCHA、bot detection，不伪造登录。HAR 中的 cookies、headers 和 token 可能过期，不应提交或分享。私有 JSON API 没有稳定契约，生成客户端是经验证快照，不等同于官方 SDK。

## 主题记录
- content_shape: single technical tool / implementation workflow
- theme_primary: hardblue
- theme_fallback: redswiss
- theme_reject: redswiss 更适合多工具目录或生态比较；darkblue 更适合架构/范式叙事；本卡核心是单工具的可执行技术工作流。
- token signature: `--bg:#f6f4ef`, `--paper:#fffdf8`, `--ink:#111`, `--red:#d80018`, `--blue:#1f63ff`, 42px grid.
- structural signatures: `.hero-bar` 三色条、`.section-no` 编号块、`.risk` 顶部色带、硬边 `.card` 模块。

## 验证说明
本卡仅使用官方事实包，不在主机上安装或运行被介绍的目标 skill，也不捕获任何第三方站点流量。
