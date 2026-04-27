# blog-server

<!-- 说明：本目录为 monorepo 内独立后端；注释以源码内 JSDoc 为准，README 仅作索引。 -->

`blog-server` is a small Node.js backend for the blog app. The request handler is written against the standard Fetch API so the same logic can run locally with Node.js and on Deno Deploy.

## Scripts

```bash
pnpm --filter blog-server dev
pnpm --filter blog-server build
pnpm --filter blog-server start
```

For local Deno parity:

```bash
deno task dev
deno task check
```

## Source Layout

```text
src/
  deno.js          # Deno Deploy 入口
  node.js          # 本地 Node.js 调试入口
  handler.js       # 统一路由分发；新增接口先看这里
  routes/          # 具体接口逻辑
  utils/response.js # JSON/text/CORS 等响应工具
scripts/
  check-syntax.mjs # 递归检查 src 下所有 JS 文件语法
```

新增接口时，建议先在 `src/routes/` 下新增或复用业务文件，再到 `src/handler.js` 的 `routes` 数组里添加 `{ method, pathname, handler }`。

## Deno Deploy

Create or update the project from <https://console.deno.com/promisezhangbo> with these settings:

- Project name: `blog-server`
- Entry point: `backend/blog-server/src/deno.js`
- Install/build command: leave empty
- Environment variables: add only the variables required by future API integrations

Production URL: <https://blog-server.promisezhangbo.deno.net>

`src/deno.js` uses `Deno.serve(handleRequest)`, which is the runtime entry Deno Deploy expects. `src/node.js` is only for local Node.js execution.
