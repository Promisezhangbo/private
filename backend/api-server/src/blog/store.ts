/**
 * Blog 数据访问：`BLOG_TABLE`（默认 `blogs`）。
 * 无 `DATABASE_URL` 时使用内存占位数据，便于本地无库开发。
 */
import { getSql, quoteTable } from "../core/db.ts";
import { getBlogTableName } from "../core/env.ts";
import { clampPagination } from "../core/pagination.ts";

export type BlogRow = {
  id: number;
  name: string;
  content: string | null;
  created_at: string | null;
};

export type BlogListPageResult = {
  items: BlogRow[];
  total: number;
  page: number;
  pageSize: number;
};

type PgRow = { id: unknown; name: unknown; content: unknown; created_at: unknown };

const memoryBlogs: BlogRow[] = [{ id: 1, name: "我是一个blog", content: null, created_at: null }];

function tableIdent(): string {
  return quoteTable(getBlogTableName());
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

export async function listBlogsPaged(
  page: number,
  pageSize: number,
  nameSearch?: string,
): Promise<BlogListPageResult> {
  const { page: p, pageSize: ps, offset } = clampPagination(page, pageSize);
  const needle = nameSearch?.trim() || undefined;
  const sql = getSql();

  if (!sql) {
    let list = memoryBlogs.map((b) => ({ ...b }));
    if (needle) {
      const q = needle.toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(q));
    }
    return { items: list.slice(offset, offset + ps), total: list.length, page: p, pageSize: ps };
  }

  const rel = tableIdent();
  const filter = needle ? sql`WHERE strpos(lower(name), lower(${needle})) > 0` : sql``;
  const countRows = await sql`
    SELECT COUNT(*)::bigint AS c FROM ${sql.unsafe(rel)} ${filter}
  `;
  const total = Number((countRows[0] as { c?: unknown })?.c ?? 0);
  const rows = await sql`
    SELECT * FROM ${sql.unsafe(rel)} ${filter}
    ORDER BY id LIMIT ${ps} OFFSET ${offset}
  `;
  return {
    items: rows.map((r) => normalizeRow(r as PgRow)),
    total,
    page: p,
    pageSize: ps,
  };
}

export async function getBlogById(id: number): Promise<BlogRow | null> {
  const sql = getSql();
  if (!sql) {
    const item = memoryBlogs.find((b) => b.id === id);
    return item ? { ...item } : null;
  }
  const rel = tableIdent();
  const rows = await sql`SELECT * FROM ${sql.unsafe(rel)} WHERE id = ${id} LIMIT 1`;
  const row = rows[0] as PgRow | undefined;
  return row ? normalizeRow(row) : null;
}

export async function updateBlogById(id: number, name: string): Promise<BlogRow | null> {
  const sql = getSql();
  if (!sql) {
    const item = memoryBlogs.find((b) => b.id === id);
    if (!item) return null;
    item.name = name;
    return { ...item };
  }
  const rel = tableIdent();
  const rows = await sql`
    UPDATE ${sql.unsafe(rel)} SET name = ${name} WHERE id = ${id} RETURNING *
  `;
  const row = rows[0] as PgRow | undefined;
  return row ? normalizeRow(row) : null;
}
