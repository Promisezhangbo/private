import type { Context } from "hono";
import { Hono } from "hono";
import * as stockStore from "../db/stockStore";

export const stockRoutes = new Hono();

function bad(c: Context, status: 400 | 404, message: string) {
  return c.json({ error: status === 404 ? "not_found" : "validation_error", message }, status);
}

function dbErr(c: Context, error: unknown, fallback: string) {
  console.error(error);
  return c.json(
    { error: "database_error", message: error instanceof Error ? error.message : fallback },
    503,
  );
}

function intQ(raw: string | undefined, def: number): number {
  if (raw === undefined || raw === "") return def;
  const n = Number(raw);
  return !Number.isFinite(n) || n < 1 ? NaN : Math.floor(n);
}

/** [(init_cost×init_num) + (add_cost×add_num + commission)] / (init_num + add_num) */
function calcEndCost(
  initCost: number,
  initNum: number,
  addCost: number,
  addNum: number,
  commission: number,
): number | null {
  const total = initNum + addNum;
  if (total <= 0) return null;
  const raw = (initCost * initNum + (addCost * addNum + commission)) / total;
  return Math.round(raw * 1000) / 1000;
}

function parseNonNegNum(v: unknown): number | "invalid" {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return "invalid";
  return v;
}

function parseNonNegInt(v: unknown): number | "invalid" {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || !Number.isInteger(v)) return "invalid";
  return v;
}

stockRoutes.get("/getStockList", async (c) => {
  const page = intQ(c.req.query("page"), 1);
  const pageSize = intQ(c.req.query("pageSize"), 10);
  if (Number.isNaN(page) || Number.isNaN(pageSize)) {
    return bad(c, 400, "Query page and pageSize must be positive integers");
  }
  if (pageSize > 100) return bad(c, 400, "Query pageSize must be at most 100");
  try {
    return c.json(await stockStore.listStocksPaged(page, pageSize));
  } catch (e) {
    return dbErr(c, e, "database query failed");
  }
});

stockRoutes.get("/getStock", async (c) => {
  const raw = c.req.query("id");
  if (raw === undefined || raw === "") return bad(c, 400, "Query id is required");
  const id = Number(raw);
  if (!Number.isFinite(id) || id < 1 || !Number.isInteger(id)) {
    return bad(c, 400, "Query id must be a positive integer");
  }
  try {
    const row = await stockStore.getStockById(id);
    if (!row) return bad(c, 404, `No stock record with id ${id}`);
    return c.json(row);
  } catch (e) {
    return dbErr(c, e, "database query failed");
  }
});

stockRoutes.post("/createStock", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid_json", message: "Request body must be JSON" }, 400);
  }
  const rec = body as Record<string, unknown> | null;
  const stockCode = typeof rec?.stock_code === "string" ? rec.stock_code.trim() : "";
  const stockName = typeof rec?.stock_name === "string" ? rec.stock_name.trim() : "";
  const initCost = parseNonNegNum(rec?.init_cost);
  const initNum = parseNonNegInt(rec?.init_num);
  const addCost = parseNonNegNum(rec?.add_cost);
  const addNum = parseNonNegInt(rec?.add_num);
  const commission = parseNonNegInt(rec?.commission);

  if (!stockCode || stockCode.length > 32) {
    return bad(c, 400, "Body stock_code must be a non-empty string (max 32 chars)");
  }
  if (!stockName || stockName.length > 128) {
    return bad(c, 400, "Body stock_name must be a non-empty string (max 128 chars)");
  }
  if (
    initCost === "invalid" ||
    initNum === "invalid" ||
    addCost === "invalid" ||
    addNum === "invalid" ||
    commission === "invalid"
  ) {
    return bad(c, 400, "Body must include valid non-negative numeric fields");
  }

  const endCost = calcEndCost(initCost, initNum, addCost, addNum, commission);
  if (endCost === null) {
    return bad(c, 400, "Total shares (init_num + add_num) must be greater than 0");
  }

  try {
    const created = await stockStore.createStock({
      stock_code: stockCode,
      stock_name: stockName,
      init_cost: initCost,
      init_num: initNum,
      add_cost: addCost,
      add_num: addNum,
      commission,
      end_cost: endCost,
    });
    return c.json(created);
  } catch (e) {
    return dbErr(c, e, "database insert failed");
  }
});
