# blog-server

<!-- 说明：本目录为 monorepo 内独立后端；注释以源码为准，README 仅作索引。 -->

`blog-server` 使用 **Deno + TypeScript**，路由层采用 **[Hono](https://hono.dev/)**（`app.get` / `app.post`、中间件链式写法，语义接近 Express），由 `Deno.serve` 提供 HTTP。

## Scripts

```bash
pnpm --filter blog-server dev
pnpm --filter blog-server build
pnpm --filter blog-server start
```

或在 `backend/blog-server` 目录下：

```bash
deno task dev
deno task check
```

## Source Layout

```text
src/
  main.ts        # Deno 入口：Deno.serve(app.fetch)
  app.ts         # Hono 实例：CORS + 子路由挂载
  routes/        # 按路径拆分的 Hono 子应用（blog / system）
  db/            # Postgres（postgres.js）与无库时的内存回退
scripts/
  check-syntax.mjs # CI：调用 deno check
```

新增接口时，在 `src/routes/` 下对应文件中为 Hono 子应用增加 `*.get` / `*.post` 等，并在 `src/app.ts` 里 `app.route("/", …)` 挂载（若新建子文件）。

## Database（PostgreSQL）

在 Deno Deploy 控制台 **Attach Prisma Postgres / SQL** 后，生产环境会自动注入 **`DATABASE_URL`**（标准 `postgresql://…` TCP 连接串）。本服务使用 **`postgres`（postgres.js）** 连接。

业务表默认 **`blogs`**（至少包含 `id`、`name`；若有 `content`、`created_at` 会一并返回）。请先在数据库中建表；**不会**在运行时自动 `CREATE TABLE`。若表名不是 `blogs`，可通过环境变量 **`BLOG_TABLE`** 覆盖（仅允许字母、数字、下划线、连字符）。

本地调试示例：

```bash
export DATABASE_URL="postgresql://..."
# 可选：export BLOG_TABLE=my_blogs
pnpm --filter blog-server dev
```

## Deno Deploy

Create or update the project from <https://console.deno.com/promisezhangbo> with these settings:

- Project name: `blog-server`
- Entry point: `backend/blog-server/src/main.ts`
- Install/build command: leave empty
- Environment variables: **`DATABASE_URL`** 在挂载 SQL 后由平台注入，一般无需手填；其它密钥再按需添加

Production URL: <https://blog-server.promisezhangbo.deno.net>

`src/main.ts` 使用 `Deno.serve(app.fetch)`，为 Deno Deploy 期望的运行时入口。
