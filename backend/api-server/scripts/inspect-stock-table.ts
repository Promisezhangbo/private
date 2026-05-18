import postgres from "postgres";

const url = Deno.env.get("DATABASE_URL")?.trim();
if (!url) {
  console.error("DATABASE_URL is not set");
  Deno.exit(1);
}

const table = Deno.env.get("STOCK_TABLE")?.trim() || "stock";
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

  const rel = `"${table}"`;
  const sample = await sql.unsafe(`SELECT * FROM ${rel} ORDER BY id DESC LIMIT 3`);
  console.log("=== sample rows ===");
  console.log(JSON.stringify(sample, null, 2));
} finally {
  await sql.end();
}
