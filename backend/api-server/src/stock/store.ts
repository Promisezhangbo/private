/**
 * Stock 持仓成本数据访问：`STOCK_TABLE`（默认 `stock`）。
 * 列类型建议：价格 NUMERIC(18,3)、股数 integer、佣金 NUMERIC(10,2)。
 */
import { getSql, quoteTable } from "../core/db.ts";
import { getStockTableName } from "../core/env.ts";
import { clampPagination } from "../core/pagination.ts";
import { ceilStockPrice, formatStockCommission } from "./price.ts";

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

const STOCK_COLUMNS =
  "id, stock_code, stock_name, init_cost, init_num, add_cost, add_num, end_cost, commission";

const memoryStocks: StockRow[] = [];
let memoryNextId = 1;

function tableIdent(): string {
  return quoteTable(getStockTableName());
}

function normalizeRow(r: PgRow): StockRow {
  const n = (v: unknown) => Number(v);
  return {
    id: n(r.id),
    stock_code: String(r.stock_code ?? "").trim(),
    stock_name: String(r.stock_name ?? ""),
    init_cost: ceilStockPrice(n(r.init_cost)),
    init_num: Math.floor(n(r.init_num)),
    add_cost: ceilStockPrice(n(r.add_cost)),
    add_num: Math.floor(n(r.add_num)),
    end_cost: ceilStockPrice(n(r.end_cost)),
    commission: formatStockCommission(n(r.commission ?? 5)),
  };
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

  const rel = tableIdent();
  const filter = needle
    ? sql`WHERE strpos(lower(trim(stock_code)), lower(${needle})) > 0`
    : sql``;
  const countRows = await sql`
    SELECT COUNT(*)::bigint AS c FROM ${sql.unsafe(rel)} ${filter}
  `;
  const total = Number((countRows[0] as { c?: unknown })?.c ?? 0);
  const listRows = await sql`
    SELECT ${sql.unsafe(STOCK_COLUMNS)} FROM ${sql.unsafe(rel)} ${filter}
    ORDER BY id DESC LIMIT ${ps} OFFSET ${offset}
  `;
  return {
    items: listRows.map((r) => normalizeRow(r as PgRow)),
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
  const rel = tableIdent();
  const rows = await sql`
    SELECT ${sql.unsafe(STOCK_COLUMNS)} FROM ${sql.unsafe(rel)}
    WHERE id = ${id}
    LIMIT 1
  `;
  const row = rows[0] as PgRow | undefined;
  return row ? normalizeRow(row) : null;
}

export async function createStock(input: CreateStockInput): Promise<StockRow> {
  const sql = getSql();
  const code = input.stock_code.trim();
  const initCost = ceilStockPrice(input.init_cost);
  const addCost = ceilStockPrice(input.add_cost);
  const endCost = ceilStockPrice(input.end_cost);
  const commission = formatStockCommission(input.commission);

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

  const rel = tableIdent();
  const rows = await sql`
    INSERT INTO ${sql.unsafe(rel)} (
      stock_code, stock_name, init_cost, init_num, add_cost, add_num, end_cost, commission
    ) VALUES (
      ${code}, ${input.stock_name}, ${initCost}, ${input.init_num},
      ${addCost}, ${input.add_num}, ${endCost}, ${commission}
    )
    RETURNING ${sql.unsafe(STOCK_COLUMNS)}
  `;
  return normalizeRow(rows[0] as PgRow);
}

export async function deleteStockById(id: number): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    const idx = memoryStocks.findIndex((s) => s.id === id);
    if (idx < 0) return false;
    memoryStocks.splice(idx, 1);
    return true;
  }
  const rel = tableIdent();
  const rows = await sql`
    DELETE FROM ${sql.unsafe(rel)}
    WHERE id = ${id}
    RETURNING id
  `;
  return rows.length > 0;
}
