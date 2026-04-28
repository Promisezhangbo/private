/**
 * 读取数据库连接串。Deno Deploy 挂载 SQL 后会把 `DATABASE_URL` 注入运行时。
 */
export function getDatabaseUrl(): string | undefined {
  const raw = Deno.env.get("DATABASE_URL")?.trim() ?? "";
  return raw.length > 0 ? raw : undefined;
}

/**
 * 业务表名（不含 schema），默认 **`blogs`**。
 * 可通过环境变量 `BLOG_TABLE` 覆盖（须与库里真实表一致；仅允许字母、数字、下划线、连字符）。
 */
export function getBlogTableName(): string {
  const raw = Deno.env.get("BLOG_TABLE")?.trim() ?? "blogs";
  return raw.length > 0 ? raw : "blogs";
}
