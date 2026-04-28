/**
 * Deno Deploy / 本地 Deno 入口：`Deno.serve` + Hono 的 Fetch 适配器。
 */
import { app } from "./app.ts";
import { getDatabaseUrl } from "./db/env.ts";

const dbUrl = getDatabaseUrl();
if (dbUrl) {
  console.log(`[blog-server] DATABASE_URL 已加载（长度 ${dbUrl.length}）`);
} else {
  console.warn(
    "[blog-server] 未检测到 DATABASE_URL，使用内存占位数据。请使用 `pnpm dev:db` 并在 backend/blog-server/.env.local 中配置（勿只改 .env.example）。",
  );
}

Deno.serve(app.fetch);
