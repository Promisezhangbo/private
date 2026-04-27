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
  db/              # Postgres（Neon）与无库时的内存回退
  utils/response.js # JSON/text/CORS 等响应工具
scripts/
  check-syntax.mjs # 递归检查 src 下所有 JS 文件语法
```

新增接口时，建议先在 `src/routes/` 下新增或复用业务文件，再到 `src/handler.js` 的 `routes` 数组里添加 `{ method, pathname, handler }`。

## Database（PostgreSQL）

在 Deno Deploy 控制台 **Attach SQL Database** 后，生产环境会自动注入 **`DATABASE_URL`**，本服务通过 `@neondatabase/serverless` 连接；首次请求会执行 `CREATE TABLE IF NOT EXISTS blogs` 并插入种子行 `id=1`。

本地 Node / Deno 调试时，自行设置同一变量即可连库（不设则仍走内存，不报错）：

```bash
export DATABASE_URL="postgresql://..."
pnpm --filter blog-server dev
```

## Deno Deploy

Create or update the project from <https://console.deno.com/promisezhangbo> with these settings:

- Project name: `blog-server`
- Entry point: `backend/blog-server/src/deno.js`
- Install/build command: leave empty
- Environment variables: **`DATABASE_URL`** 在挂载 SQL 后由平台注入，一般无需手填；其它密钥再按需添加

Production URL: <https://blog-server.promisezhangbo.deno.net>

`src/deno.js` uses `Deno.serve(handleRequest)`, which is the runtime entry Deno Deploy expects. `src/node.js` is only for local Node.js execution.
