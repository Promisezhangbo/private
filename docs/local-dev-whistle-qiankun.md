# 本地联调线上域名（Whistle + qiankun）

本文说明如何在 **本地跑 Vite 开发服务** 的同时，让浏览器地址栏保持 **线上域名**（例如 `https://<user>.github.io/...`），以便与 **qiankun 微前端**、**HTTPS 页**、**同源策略** 等行为一致。实现上依赖 **Whistle**（或同类反向代理）把线上域名指到本机，并由 **主应用** 统一转发各子应用路径。

## 目标与约束

| 目标                                           | 做法                                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 地址栏为 `https://*.github.io/...`，与生产同源 | Whistle 将对应 host 指到本机主应用端口                                                                                    |
| qiankun 拉子应用 HTML 不报混合内容 / 错误协议  | 开发态 entry 使用 **`window.location.origin + '/子应用base/'`**（见 `apps/main/src/utils/qiankun.ts` 中 `devMicroEntry`） |
| 子应用 Vite 的 `base` 与生产一致               | 各子应用 `vite.config` 中 **`base: '/xxx/'`**，开发与生产相同                                                             |
| Whistle 规则尽量少                             | **整站一条** 指到主应用；子路径由主应用 **Vite `server.proxy`** 转发到各子应用端口                                        |
| 端口与路径只维护一处                           | **`apps/main/src/utils/microAppsDev.ts`**：`qiankun` 注册与 `main/vite.config` 的 proxy 均由此生成                        |

## 架构示意

```text
浏览器  https://promisezhangbo.github.io/agent/home 或 https://promise-zhangbo.netlify.app
    │
    ▼ Whistle（整条 host 指到 9000）
    │
本机  http://127.0.0.1:9000/agent/home   ← 主应用 Vite
    │
    ▼ server.proxy：/agent → 9001（路径前缀保留）
    │
本机  http://127.0.0.1:9001/agent/home   ← agent 子应用 Vite
```

要点：**不要**在 Whistle 里把 `/agent` 剥掉再转发到 `9001/`，否则子应用收到的是 `/home` 等与 `base: '/agent/'` 不一致的路径，易出现 404、资源路径错误或与主应用 `/src` 冲突。

## 前置条件

1. 安装并启用 [Whistle](https://wproxy.org/)（或等效：能把指定域名转发到本机端口的工具）。
2. 仓库根执行 `pnpm install`。
3. 本地同时启动 **主应用 `main`** 以及你需要调试的 **子应用**（端口见下）。可用根目录 `pnpm dev` 按提示多选 app，或 `turbo run dev --filter=...`。

## 端口约定（与代码一致）

定义位置：**`apps/main/src/utils/microAppsDev.ts`**（新增子应用时只改此文件，并保证子应用 `vite.config` 的 `server.port` / `base` 与之一致）。

| 应用   | 开发端口 | 路径前缀（`activeRule` / `base`） |
| ------ | -------- | --------------------------------- |
| main   | 9000     | `/`（开发）或生产 `/main/`        |
| agent  | 9001     | `/agent/`                         |
| blog   | 9002     | `/blog/`                          |
| login  | 9003     | `/login/`                         |
| skill  | 9004     | `/skill/`                         |
| resume | 9005     | `/resume/`                        |

主应用开发代理逻辑：**`apps/main/vite.config.ts`** 在 `NODE_ENV === 'development'` 时根据 `microAppsDev` 生成 `server.proxy`（含 `ws: true`，便于子应用 HMR）。

## Whistle 配置示例

将 **你的** GitHub Pages 域名换成实际值；目标统一为 **主应用** `9000`：

```text
promisezhangbo.github.io/ http://127.0.0.1:9000/
promise-zhangbo.netlify.app/ http://127.0.0.1:9000/
```

- 使用 **`http://127.0.0.1`** 而非 `localhost`，避免本机解析或 IPv6 差异。
- **不需要**再为 `/blog/`、`/agent/` 等分别写多条指向 9002、9001 的规则；子路径由主应用 Vite 代理到对应端口。
- 若 Whistle 中另有更具体的规则，注意 **更具体的规则应写在合适顺序**，避免覆盖整站规则导致异常。

## qiankun 开发态 entry 行为（摘要）

实现文件：**`apps/main/src/utils/qiankun.ts`**。

- **非开发构建**：entry 为各子应用生产路径（如 `/agent/`），由部署平台提供静态资源。
- **开发 + 浏览器 host 为 `*.github.io`**：`entry = origin + prodBase`（例如 `https://your-user.github.io/agent/`），请求经 Whistle → 主应用 → proxy → 子应用，**与子应用 `base` 一致**。
- **开发 + 本地直接访问（非 github.io）**：entry 为 `http://127.0.0.1:<port><prodBase>`，便于只起子应用时直连调试。

**协议说明**：子应用资源 URL 必须使用 **`http://` 显式协议**。若使用 `//127.0.0.1:9002/...`，在 **HTTPS** 页面下会变成 `https://127.0.0.1:...`，本地 Vite 通常为 HTTP，易出现 **`ERR_SSL_PROTOCOL_ERROR`**。

## 本地操作步骤（推荐）

1. 启动 Whistle 并启用上述规则（或临时 Rules 中粘贴）。
2. 在仓库根执行 `pnpm dev`，至少勾选 **`main`** 以及本次要调试的子应用（否则对应路径代理会连不上）。
3. 浏览器访问：`https://<你的 github.io 域名>/` 及子路径（如 `/agent/home`），按需在 Whistle 中信任本地证书（若工具提示）。

## 仅调试单个子应用（不经主应用）

可直接打开 **`http://127.0.0.1:<子应用端口>/<前缀>/`**，例如 agent：`http://127.0.0.1:9001/agent/`。  
子应用路由均挂在 **`/agent`、`/login`** 等前缀下；**不要**只打开 `http://127.0.0.1:9001/`（无前缀），否则可能没有匹配路由。

## 新增子应用时的检查清单

1. **`apps/main/src/utils/microAppsDev.ts`**：增加一行 `{ name, port, prodBase, activeRule }`。
2. **子应用 `vite.config.ts`**：`base: '/<name>/'`、`server.port` 与上表一致；`vite-plugin-qiankun` 的 name 与 `name` 字段一致。
3. **子应用路由**：`createBrowserRouter` 的根路径为 `/<name>`（与 `activeRule`、`base` 一致）。
4. 重新执行根目录 `pnpm dev`，确认 Whistle 仍只需 **一条** 指向 `9000` 的规则。

## 常见问题

| 现象                                            | 可能原因                                                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 控制台报 Vite「与 base URL 不一致」或子应用 404 | Whistle 或某层代理 **剥掉了** `/blog`、`/agent` 等前缀；目标应保留前缀转发到主应用 `9000`，由主应用再 proxy 到子端口。   |
| `ERR_SSL_PROTOCOL_ERROR` 访问 localhost         | 在 HTTPS 页中错误使用了 `//localhost` 或未写协议的 URL；开发态应使用 **`http://127.0.0.1`** 或同源 **`origin + path`**。 |
| 子应用 HMR 不工作                               | 确认 **`main` 的 `server.proxy` 对对应前缀开启了 `ws: true`**（已在 `vite.config` 中配置）。                             |
| 改了端口但代理仍连旧端口                        | 端口以 **`microAppsDev.ts`** 为准；修改后需重启主应用 Vite。                                                             |

## 相关文件

| 文件                                  | 作用                                                  |
| ------------------------------------- | ----------------------------------------------------- |
| `apps/main/src/utils/microAppsDev.ts` | 子应用 name / port / prodBase / activeRule 唯一数据源 |
| `apps/main/src/utils/qiankun.ts`      | qiankun 注册、`devMicroEntry` 逻辑                    |
| `apps/main/vite.config.ts`            | 开发态 `server.proxy`（由 `microAppsDev` 生成）       |
| 各 `apps/<子应用>/vite.config.ts`     | `base`、`server.port`、qiankun 插件名                 |
| `scripts/dev.mjs`                     | 交互式选择要启动的 app                                |

部署到 GitHub Pages / Netlify 的目录与路由约定，另见 [github-pages-deploy.md](./github-pages-deploy.md)、[netlify-deploy.md](./netlify-deploy.md)。
