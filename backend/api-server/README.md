# api-server

<!-- 本目录为 monorepo 内唯一 Deno 后端：blog、stock 等多表、多路由均在此服务。 -->

`api-server` 使用 **Deno + TypeScript**，路由层采用 **[Hono](https://hono.dev/)**，由 `Deno.serve` 提供 HTTP。

## Scripts

```bash
pnpm --filter api-server dev          # 无 DATABASE_URL 时用内存占位数据
pnpm --filter api-server dev:db       # 从 .env.local 读 DATABASE_URL，连真实库
pnpm --filter api-server build
pnpm --filter api-server start
```

或在 `backend/api-server` 目录下：

```bash
deno task dev
deno task dev:db
deno task check
```

## Source Layout

```text
src/
  main.ts        # Deno 入口
  app.ts         # Hono：CORS + 子路由
  routes/        # blog / stock / system
  db/            # Postgres + 内存回退
```

OpenAPI：`api/api-server.yaml`。前端通过 `VITE_API_SERVER_BASE` 指向本服务。

**Blog**：`GET /getBlogList`、`GET /getBlog`、`POST /updateBlogName`（表默认 `blogs`，环境变量 `BLOG_TABLE`）。

**Stock**：`GET /getStockList`、`GET /getStock`、`POST /createStock`（表默认 `stock`，环境变量 `STOCK_TABLE`）。

**`stock` 表字段**（API 与库表同名）：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 主键 |
| `stock_code` | char | 读写 trim |
| `stock_name` | text | |
| `init_cost` | smallint | 当前成本 a |
| `init_num` | integer | 当前股数 b |
| `add_cost` | smallint | 加仓成本 c |
| `add_num` | integer | 加仓股数 d |
| `end_cost` | smallint | 摊薄成本（服务端公式计算后写入） |
| `commission` | integer | 佣金，默认 5 |

## Database（PostgreSQL）

挂载 SQL 后平台注入 **`DATABASE_URL`**。表须事先建好，运行时不会 `CREATE TABLE`。

### 本地连库

1. 在 Deno Deploy 复制 **`DATABASE_URL`**（控制台项目名可与仓库目录名不同，见下文部署说明）。
2. 在 **`backend/api-server/`** 放置 **`.env.local`**（`cp .env.example .env.local`），写入连接串；可选 `BLOG_TABLE` / `STOCK_TABLE`。
3. 启动：`pnpm --filter api-server dev` 或 **`dev:db`**。
4. 前端 `VITE_API_SERVER_BASE=http://localhost:8000`（Deno 默认端口以本地为准）。

```bash
export DATABASE_URL="postgresql://..."
pnpm --filter api-server dev
```

## Deno Deploy

- **App directory（推荐）**：`backend/api-server`
- **Entry point**：`src/main.ts`
- 生产 URL：<https://api-server.promisezhangbo.deno.net>
- **App directory**：`backend/api-server`

运行时 **`export default { fetch }`** 以符合 Deno Deploy Dynamic；详见 `deno.json` 的 `deploy.runtime`。
