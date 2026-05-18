/** Stock（持仓成本）HTTP 路由；OpenAPI 见 `api/api-server.yaml`。 */
import { Hono } from "hono";
import { jsonBad, jsonDbErr, parsePageQuery, readJsonBody } from "../core/http.ts";
import {
  parseNonNegInt,
  parseNonNegNum,
  parsePositiveIntBody,
  parsePositiveIntQuery,
} from "../core/validate.ts";
import { calcEndCost } from "./price.ts";
import * as stockStore from "./store.ts";

export const stockRoutes = new Hono();

stockRoutes.get("/getStockList", async (c) => {
  const { page, pageSize, error } = parsePageQuery(c);
  const stockCode = c.req.query("stock_code");
  if (error) return jsonBad(c, 400, error);
  if (stockCode != null && stockCode.length > 32) {
    return jsonBad(c, 400, "Query stock_code must be at most 32 characters");
  }
  try {
    return c.json(await stockStore.listStocksPaged(page, pageSize, stockCode ?? undefined));
  } catch (e) {
    return jsonDbErr(c, e, "database query failed");
  }
});

stockRoutes.get("/getStock", async (c) => {
  const id = parsePositiveIntQuery(c.req.query("id"));
  if (id === "missing") return jsonBad(c, 400, "Query id is required");
  if (id === "invalid") return jsonBad(c, 400, "Query id must be a positive integer");
  try {
    const row = await stockStore.getStockById(id);
    if (!row) return jsonBad(c, 404, `No stock record with id ${id}`);
    return c.json(row);
  } catch (e) {
    return jsonDbErr(c, e, "database query failed");
  }
});

stockRoutes.post("/createStock", async (c) => {
  const body = await readJsonBody(c);
  if (body instanceof Response) return body;

  const stockCode = typeof body.stock_code === "string" ? body.stock_code.trim() : "";
  const stockName = typeof body.stock_name === "string" ? body.stock_name.trim() : "";
  const initCost = parseNonNegNum(body.init_cost);
  const initNum = parseNonNegInt(body.init_num);
  const addCost = parseNonNegNum(body.add_cost);
  const addNum = parseNonNegInt(body.add_num);
  const commission = parseNonNegNum(body.commission);

  if (!stockCode || stockCode.length > 32) {
    return jsonBad(c, 400, "Body stock_code must be a non-empty string (max 32 chars)");
  }
  if (!stockName || stockName.length > 128) {
    return jsonBad(c, 400, "Body stock_name must be a non-empty string (max 128 chars)");
  }
  if (
    initCost === "invalid" ||
    initNum === "invalid" ||
    addCost === "invalid" ||
    addNum === "invalid" ||
    commission === "invalid"
  ) {
    return jsonBad(c, 400, "Body must include valid non-negative numeric fields");
  }

  const endCost = calcEndCost(initCost, initNum, addCost, addNum, commission);
  if (endCost === null) {
    return jsonBad(c, 400, "Total shares (init_num + add_num) must be greater than 0");
  }

  try {
    return c.json(
      await stockStore.createStock({
        stock_code: stockCode,
        stock_name: stockName,
        init_cost: initCost,
        init_num: initNum,
        add_cost: addCost,
        add_num: addNum,
        commission,
        end_cost: endCost,
      }),
    );
  } catch (e) {
    return jsonDbErr(c, e, "database insert failed");
  }
});

stockRoutes.post("/deleteStock", async (c) => {
  const body = await readJsonBody(c);
  if (body instanceof Response) return body;
  const id = parsePositiveIntBody(body.id);
  if (id === "invalid") return jsonBad(c, 400, "Body id must be a positive integer");
  try {
    const deleted = await stockStore.deleteStockById(id);
    if (!deleted) return jsonBad(c, 404, `No stock record with id ${id}`);
    return c.json({ ok: true as const, id });
  } catch (e) {
    return jsonDbErr(c, e, "database delete failed");
  }
});
