# api-server

Deno + TypeScript + [Hono](https://hono.dev/)，对接 PostgreSQL（Prisma Postgres / Deno Deploy）。OpenAPI：`api/api-server.yaml`。

## 命令

```bash
pnpm --filter api-server dev       # 无库：内存占位数据
pnpm --filter api-server dev:db    # 读 .env.local 中的 DATABASE_URL
pnpm --filter api-server build     # deno check
```

```bash
# 在 backend/api-server 目录
deno task dev
deno task dev:db
```

本地查看 stock 表结构（需 `DATABASE_URL`）：

```bash
deno run --allow-net --allow-env --env-file=.env.local tools/inspect-stock-table.ts
```

## 目录

| 路径 | 说明 |
|------|------|
| `src/main.ts` | Deno / Deploy 入口 |
| `src/app.ts` | CORS、日志、挂载子路由 |
| `src/core/` | `env` `db` `pagination` `http` `validate` |
| `src/blog/` | `routes.ts` + `store.ts` |
| `src/stock/` | `routes.ts` + `store.ts` + `price.ts`（公式与舍入） |
| `src/system/` | `/`、`/health`、`/robots.txt` |
| `sql/console/` | 在 Prisma / Deno Deploy **SQL 控制台**手动执行的迁移 |
| `tools/` | 本地辅助脚本 |

## API

| 模块 | 路由 | 表（环境变量） |
|------|------|----------------|
| Blog | `GET /getBlogList` `GET /getBlog` `POST /updateBlogName` | `blogs`（`BLOG_TABLE`） |
| Stock | `GET /getStockList` `GET /getStock` `POST /createStock` `POST /deleteStock` | `stock`（`STOCK_TABLE`） |

前端通过 `VITE_API_SERVER_BASE` 指向本服务（生产默认 `https://api-server.promisezhangbo.deno.net`）。

### stock 表字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `init_cost` / `add_cost` / `end_cost` | NUMERIC(18,3) | 价格，写入时向上取整到 3 位小数 |
| `init_num` / `add_num` | integer | 股数 |
| `commission` | NUMERIC(10,2) | 佣金 |

列类型仍为 **smallint** / **integer** 时，需在 `sql/console/` 执行对应迁移脚本（**不必改旧行数据**）：

1. `migrate-stock-price-to-numeric.sql`
2. 若曾为 4 位小数：`migrate-stock-price-numeric-4-to-3.sql`
3. 佣金改小数：`migrate-stock-commission-to-numeric.sql`

## 环境变量

复制 `.env.example` → `.env.local`：

- `DATABASE_URL` — PostgreSQL 连接串（必填才连库）
- `BLOG_TABLE` / `STOCK_TABLE` — 可选，覆盖默认表名
- `CORS_ALLOWED_ORIGINS` — 额外允许的浏览器 Origin

## Deno Deploy

- **App directory**：`backend/api-server`
- **Entry point**：`src/main.ts`
