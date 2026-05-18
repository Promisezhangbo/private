/** 环境变量：数据库连接、CORS 扩展、各业务表名。 */

export function getCorsAllowedOriginsExtra(): readonly string[] {
  const raw = Deno.env.get("CORS_ALLOWED_ORIGINS")?.trim() ?? "";
  if (!raw.length) return [];
  return raw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
}

/** 非空则连 PostgreSQL；Deno Deploy 由平台注入。 */
export function getDatabaseUrl(): string | undefined {
  const raw = Deno.env.get("DATABASE_URL")?.trim() ?? "";
  return raw.length > 0 ? raw : undefined;
}

export function getBlogTableName(): string {
  const raw = Deno.env.get("BLOG_TABLE")?.trim() ?? "blogs";
  return raw.length > 0 ? raw : "blogs";
}

export function getStockTableName(): string {
  const raw = Deno.env.get("STOCK_TABLE")?.trim() ?? "stock";
  return raw.length > 0 ? raw : "stock";
}
