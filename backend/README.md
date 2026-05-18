# backend

Monorepo 后端根目录，当前仅包含 **`api-server`**（Deno + Hono + PostgreSQL）。

开发与部署说明见 **[api-server/README.md](./api-server/README.md)**。

```text
backend/api-server/
  src/core/       # 环境变量、数据库、HTTP 公用逻辑
  src/blog/       # 博客 API
  src/stock/      # 持仓成本 API
  src/system/     # 健康检查
  sql/console/    # 在 SQL 控制台手动执行的 DDL 迁移
  tools/          # 本地调试脚本（非 Deploy 入口）
```
