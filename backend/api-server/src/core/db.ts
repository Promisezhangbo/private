/** PostgreSQL 单例连接；无 `DATABASE_URL` 时业务 store 使用内存数据。 */
import postgres from "postgres";
import { getDatabaseUrl } from "./env.ts";

export type SqlClient = ReturnType<typeof postgres>;

let sqlClient: SqlClient | null = null;

export function getSql(): SqlClient | null {
  const url = getDatabaseUrl();
  if (!url) return null;
  if (!sqlClient) {
    sqlClient = postgres(url, { max: 1, idle_timeout: 20, connect_timeout: 15 });
  }
  return sqlClient;
}

/** 引用已校验的表名（仅 `[a-zA-Z0-9_-]+`）。 */
export function quoteTable(name: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) throw new Error(`Invalid table name: ${name}`);
  return `"${name}"`;
}
