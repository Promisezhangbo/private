/**
 * 博客列表存储：有 `DATABASE_URL` 时用 Postgres（Neon serverless），否则用内存（便于无库本地跑）。
 */
import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "./env.js";

/** 无 DATABASE_URL 时的内存数据（与初始种子一致）。 */
const memoryBlogs = [{ id: 1, name: "我是一个blog" }];

let sqlClient;
/** 建表 + 种子只跑一次。 */
let schemaReady;

function getSql() {
  const url = getDatabaseUrl();
  if (!url) return null;
  if (!sqlClient) sqlClient = neon(url);
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
  return rows;
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
  return rows[0] ?? null;
}
