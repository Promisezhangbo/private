/**
 * 博客数据：有 `DATABASE_URL` 时用 postgres.js 连标准 Postgres（含 Deno Deploy 注入的 Prisma Postgres）。
 * 表名默认 **`blogs`**，可用环境变量 `BLOG_TABLE` 覆盖。
 */
import postgres from "postgres";
import { getBlogTableName, getDatabaseUrl } from "./env.ts";

export type BlogRow = {
  id: number;
  name: string;
  content: string | null;
  created_at: string | null;
};

type PgRow = {
  id: unknown;
  name: unknown;
  content: unknown;
  created_at: unknown;
};

type SqlClient = ReturnType<typeof postgres>;

/** 无 DATABASE_URL 时的内存数据。 */
const memoryBlogs: BlogRow[] = [{ id: 1, name: "我是一个blog", content: null, created_at: null }];

let sqlClient: SqlClient | null = null;

function getSql(): SqlClient | null {
  const url = getDatabaseUrl();
  if (!url) return null;
  if (!sqlClient) {
    sqlClient = postgres(url, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 15,
    });
  }
  return sqlClient;
}

/** 将 BLOG_TABLE 转为带双引号的 SQL 标识符（支持连字符表名）。 */
function quotedTableIdent(): string {
  const name = getBlogTableName();
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new Error(`Invalid BLOG_TABLE: ${name}`);
  }
  return `"${name}"`;
}

function normalizeRow(r: PgRow): BlogRow {
  const created =
    r.created_at == null
      ? null
      : r.created_at instanceof Date
        ? r.created_at.toISOString()
        : String(r.created_at);
  return {
    id: Number(r.id),
    name: String(r.name ?? ""),
    content: r.content == null ? null : String(r.content),
    created_at: created,
  };
}

/** 返回 { id, name, content, created_at }[]，按 id 排序。 */
export async function listBlogs(): Promise<BlogRow[]> {
  const sql = getSql();
  if (!sql) {
    return memoryBlogs.map((b) => ({ ...b }));
  }
  const rel = quotedTableIdent();
  const rows = await sql`SELECT * FROM ${sql.unsafe(rel)} ORDER BY id`;
  return rows.map((r) => normalizeRow(r as PgRow));
}

/**
 * 按 id 更新 name；成功返回整行；无此行返回 null。
 * 无 DATABASE_URL 时改内存副本。
 */
export async function updateBlogById(id: number, name: string): Promise<BlogRow | null> {
  const sql = getSql();
  if (!sql) {
    const item = memoryBlogs.find((b) => b.id === id);
    if (!item) return null;
    item.name = name;
    return { ...item };
  }
  const rel = quotedTableIdent();
  const rows = await sql`
    UPDATE ${sql.unsafe(rel)} SET name = ${name} WHERE id = ${id}
    RETURNING *
  `;
  const row = rows[0] as PgRow | undefined;
  return row ? normalizeRow(row) : null;
}
