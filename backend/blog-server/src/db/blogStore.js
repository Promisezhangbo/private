/**
 * 博客列表存储：有 `DATABASE_URL` 时用标准 Postgres TCP（兼容 Deno Deploy 注入的 Prisma Postgres 连接串），
 * 否则用内存（便于无库本地跑）。
 *
 * 说明：不要用 `@neondatabase/serverless`（neon）连 Prisma Postgres —— 协议不匹配会触发 HTTP 404（如 resource-not-found）。
 */
import postgres from "postgres";
import { getDatabaseUrl } from "./env.js";

/** 无 DATABASE_URL 时的内存数据（与初始种子一致）。 */
const memoryBlogs = [{ id: 1, name: "我是一个blog" }];

/** postgres.js 单例（有 DATABASE_URL 时懒创建）。 */
let sqlClient;
/** 建表 + 种子只跑一次。 */
let schemaReady;

function getSql() {
  const url = getDatabaseUrl();
  if (!url) return null;
  if (!sqlClient) {
    sqlClient = postgres(url, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 15
    });
  }
  return sqlClient;
}

async function ensureSchema(sql) {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS blogs (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL
        )
      `;
      await sql`
        INSERT INTO blogs (id, name)
        VALUES (1, '我是一个blog')
        ON CONFLICT (id) DO NOTHING
      `;
    })();
  }
  await schemaReady;
}

/** 返回 { id, name }[]，按 id 排序。 */
export async function listBlogs() {
  const sql = getSql();
  if (!sql) {
    return memoryBlogs.map((b) => ({ ...b }));
  }
  await ensureSchema(sql);
  const rows = await sql`SELECT id, name FROM blogs ORDER BY id`;
  return rows.map((r) => ({ id: Number(r.id), name: String(r.name) }));
}

/**
 * 按 id 更新 name；成功返回 { id, name }，无此行返回 null。
 * 无 DATABASE_URL 时改内存副本。
 */
export async function updateBlogById(id, name) {
  const sql = getSql();
  if (!sql) {
    const item = memoryBlogs.find((b) => b.id === id);
    if (!item) return null;
    item.name = name;
    return { id: item.id, name: item.name };
  }
  await ensureSchema(sql);
  const rows = await sql`
    UPDATE blogs SET name = ${name} WHERE id = ${id}
    RETURNING id, name
  `;
  const row = rows[0];
  return row ? { id: Number(row.id), name: String(row.name) } : null;
}
