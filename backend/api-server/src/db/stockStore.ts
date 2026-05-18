/**
 * `stock` 表字段（与库一致）：
 * id, stock_code, stock_name, init_cost, init_num, add_cost, add_num, end_cost, commission
 * 价格列建议 NUMERIC(18,4)；股数 integer；佣金 integer。
 */
import postgres from "postgres";
import { getDatabaseUrl, getStockTableName } from "./env";
import { roundStockPrice } from "./stockPrice";

export type StockRow = {
  id: number;
  stock_code: string;
  stock_name: string;
  init_cost: number;
  init_num: number;
  add_cost: number;
  add_num: number;
  end_cost: number;
  commission: number;
};

export type StockListPageResult = {
  items: StockRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateStockInput = {
  stock_code: string;
  stock_name: string;
  init_cost: number;
  init_num: number;
  add_cost: number;
  add_num: number;
  commission: number;
  end_cost: number;
};

type PgRow = {
  id: unknown;
  stock_code: unknown;
  stock_name: unknown;
  init_cost: unknown;
  init_num: unknown;
  add_cost: unknown;
  add_num: unknown;
  end_cost: unknown;
  commission: unknown;
};

type SqlClient = ReturnType<typeof postgres>;

const memoryStocks: StockRow[] = [];
let memoryNextId = 1;
let sqlClient: SqlClient | null = null;

function getSql(): SqlClient | null {
  const url = getDatabaseUrl();
  if (!url) return null;
  if (!sqlClient) {
    sqlClient = postgres(url, { max: 1, idle_timeout: 20, connect_timeout: 15 });
  }
  return sqlClient;
}

function quotedTableIdent(): string {
  const name = getStockTableName();
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) throw new Error(`Invalid STOCK_TABLE: ${name}`);
  return `"${name}"`;
}

function num(v: unknown): number {
  return Number(v);
}

function trimCode(v: unknown): string {
  return String(v ?? "").trim();
}

function normalizeRow(r: PgRow): StockRow {
  return {
    id: Number(r.id),
    stock_code: trimCode(r.stock_code),
    stock_name: String(r.stock_name ?? ""),
    init_cost: roundStockPrice(num(r.init_cost)),
    init_num: Math.floor(num(r.init_num)),
    add_cost: roundStockPrice(num(r.add_cost)),
    add_num: Math.floor(num(r.add_num)),
    end_cost: roundStockPrice(num(r.end_cost)),
    commission: Math.floor(num(r.commission ?? 5)),
  };
}

function clampPagination(page: number, pageSize: number) {
  const p = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const raw = Number.isFinite(pageSize) && pageSize >= 1 ? Math.floor(pageSize) : 10;
  const ps = Math.min(100, Math.max(1, raw));
  return { page: p, pageSize: ps, offset: (p - 1) * ps };
}

export async function listStocksPaged(
  page: number,
  pageSize: number,
  stockCodeSearch?: string,
): Promise<StockListPageResult> {
  const { page: p, pageSize: ps, offset } = clampPagination(page, pageSize);
  const needle = stockCodeSearch?.trim() || undefined;
  const sql = getSql();

  if (!sql) {
    let sorted = [...memoryStocks].sort((a, b) => b.id - a.id);
    if (needle) {
      const q = needle.toLowerCase();
      sorted = sorted.filter((r) => r.stock_code.toLowerCase().includes(q));
    }
    return {
      items: sorted.slice(offset, offset + ps).map((r) => ({ ...r })),
      total: sorted.length,
      page: p,
      pageSize: ps,
    };
  }

  const rel = quotedTableIdent();
  const filter = needle
    ? sql`WHERE strpos(lower(trim(stock_code)), lower(${needle})) > 0`
    : sql``;
  const countRows = await sql`
    SELECT COUNT(*)::bigint AS c FROM ${sql.unsafe(rel)} ${filter}
  `;
  const total = Number((countRows[0] as { c?: unknown })?.c ?? 0);
  const rows = await sql`
    SELECT id, stock_code, stock_name, init_cost, init_num, add_cost, add_num, end_cost, commission
    FROM ${sql.unsafe(rel)} ${filter}
    ORDER BY id DESC
    LIMIT ${ps} OFFSET ${offset}
  `;
  return {
    items: rows.map((r) => normalizeRow(r as PgRow)),
    total,
    page: p,
    pageSize: ps,
  };
}

export async function getStockById(id: number): Promise<StockRow | null> {
  const sql = getSql();
  if (!sql) {
    const item = memoryStocks.find((s) => s.id === id);
    return item ? { ...item } : null;
  }
  const rel = quotedTableIdent();
  const rows = await sql`
    SELECT id, stock_code, stock_name, init_cost, init_num, add_cost, add_num, end_cost, commission
    FROM ${sql.unsafe(rel)}
    WHERE id = ${id}
    LIMIT 1
  `;
  const row = rows[0] as PgRow | undefined;
  return row ? normalizeRow(row) : null;
}

export async function createStock(input: CreateStockInput): Promise<StockRow> {
  const sql = getSql();
  const code = input.stock_code.trim();
  const initCost = roundStockPrice(input.init_cost);
  const addCost = roundStockPrice(input.add_cost);
  const endCost = roundStockPrice(input.end_cost);
  const commission = Math.floor(input.commission);

  if (!sql) {
    const row: StockRow = {
      id: memoryNextId++,
      stock_code: code,
      stock_name: input.stock_name,
      init_cost: initCost,
      init_num: input.init_num,
      add_cost: addCost,
      add_num: input.add_num,
      end_cost: endCost,
      commission,
    };
    memoryStocks.push(row);
    return { ...row };
  }

  const rel = quotedTableIdent();
  const rows = await sql`
    INSERT INTO ${sql.unsafe(rel)} (
      stock_code, stock_name, init_cost, init_num, add_cost, add_num, end_cost, commission
    ) VALUES (
      ${code}, ${input.stock_name}, ${initCost}, ${input.init_num},
      ${addCost}, ${input.add_num}, ${endCost}, ${commission}
    )
    RETURNING id, stock_code, stock_name, init_cost, init_num, add_cost, add_num, end_cost, commission
  `;
  return normalizeRow(rows[0] as PgRow);
}
