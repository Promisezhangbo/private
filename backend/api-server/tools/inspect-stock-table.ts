/** 本地调试：打印 stock 表列信息与最近 3 条记录。需 DATABASE_URL。 */
import postgres from "postgres";
import { getStockTableName } from "../src/core/env.ts";

const url = Deno.env.get("DATABASE_URL")?.trim();
if (!url) {
  console.error("DATABASE_URL is not set");
  Deno.exit(1);
}

const table = getStockTableName();
if (!/^[a-zA-Z0-9_-]+$/.test(table)) {
  console.error(`Invalid STOCK_TABLE: ${table}`);
  Deno.exit(1);
}

const sql = postgres(url, { max: 1, connect_timeout: 20 });

try {
  const cols = await sql`
    SELECT column_name, data_type, udt_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${table}
    ORDER BY ordinal_position
  `;
  console.log("=== columns ===");
  console.log(JSON.stringify(cols, null, 2));

  const sample = await sql.unsafe(`SELECT * FROM "${table}" ORDER BY id DESC LIMIT 3`);
  console.log("=== sample rows ===");
  console.log(JSON.stringify(sample, null, 2));
} finally {
  await sql.end();
}
