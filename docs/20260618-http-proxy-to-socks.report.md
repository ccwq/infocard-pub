# hpts / http-proxy-to-socks 调研记录

- 源仓库：<https://github.com/oyyd/http-proxy-to-socks>
- 核心定位：把 SOCKS 代理转换成 HTTP 代理入口的 Node.js CLI / API 工具。
- 发布版本：package.json 显示 `1.1.5`。

## 直接证据

### README / READMECN
- 安装：`npm install -g http-proxy-to-socks`
- 最小命令：`hpts -s 127.0.0.1:1080 -p 8080`
- CLI 参数：`--socks` / `--port` / `--host` / `--config` / `--level` / `--version` / `--help`
- 配置文件格式：JSON

### package.json
- `bin.hpts = bin/hpts.js`
- `main = lib/server.js`
- 关键词：`socks` / `http proxy` / `converting proxy`

### 源码补充
- `src/cli.js` 明确支持 `-l, --host`
- `src/server.js` 默认值：
  - `host: 127.0.0.1`
  - `socks: 127.0.0.1:1080`
  - `port: 8080`
  - `proxyListReloadTimeout: 60`
- `src/proxy_server.js`：
  - 普通 HTTP 请求通过 `requestListener` + `socks-proxy-agent`
  - HTTPS CONNECT 通过 `connectListener` + `Socks.SocksClient.createConnection`
  - 代理行解析支持 `host:port` 和 `host:port:user:pass`
  - `socksList` + `proxyListReloadTimeout` 是库模式能力，CLI 未直接暴露
- `src/cli.js` 中 `Object.assign(options, fileConfig)` 说明配置文件会覆盖同名命令行值

## 内容取舍
- 卡片重点补了“各种使用方法”和“参数说明”，并把 README 未强调的源码能力补出来：
  - HTTPS CONNECT 路径
  - 程序化 API
  - 隐藏的代理列表加载能力
  - 配置覆盖顺序
  - 局域网暴露风险

## 未过度声称的部分
- 未把它描述成完整代理平台
- 未把 `socksList` 写成官方 CLI 参数，因为源码里只在库模式上可见
- 未总结 README 没明写的公网安全能力，因为仓库没有提供 ACL/鉴权设计
