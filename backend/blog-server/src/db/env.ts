/** `DATABASE_URL` 非空则连库；Deploy 由平台注入。 */
export function getDatabaseUrl(): string | undefined {
  const raw = Deno.env.get("DATABASE_URL")?.trim() ?? "";
  return raw.length > 0 ? raw : undefined;
}

/** 表名，默认 `blogs`；仅字母数字下划线连字符。 */
export function getBlogTableName(): string {
  const raw = Deno.env.get("BLOG_TABLE")?.trim() ?? "blogs";
  return raw.length > 0 ? raw : "blogs";
}
