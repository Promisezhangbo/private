/**
 * 读取数据库连接串。Deno Deploy 挂载 SQL 后会把 `DATABASE_URL` 注入运行时；
 * Node 本地可用 `export DATABASE_URL=...` 或 shell 前加载 `.env`（自行配置）。
 */
export function getDatabaseUrl() {
  const fromDeno =
    typeof Deno !== "undefined" && typeof Deno.env?.get === "function" ? Deno.env.get("DATABASE_URL") : undefined;
  const fromProcess = typeof process !== "undefined" ? process.env.DATABASE_URL : undefined;
  const raw = fromDeno ?? fromProcess ?? "";
  const trimmed = String(raw).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
