/** 路由层公用：JSON 错误响应、分页查询解析、请求体读取。 */
import type { Context } from "hono";

export function jsonBad(c: Context, status: 400 | 404, message: string) {
  return c.json({ error: status === 404 ? "not_found" : "validation_error", message }, status);
}

export function jsonDbErr(c: Context, error: unknown, fallback: string) {
  console.error(error);
  return c.json(
    { error: "database_error", message: error instanceof Error ? error.message : fallback },
    503,
  );
}

const MAX_PAGE_SIZE = 100;

function intQuery(raw: string | undefined, def: number): number {
  if (raw === undefined || raw === "") return def;
  const n = Number(raw);
  return !Number.isFinite(n) || n < 1 ? NaN : Math.floor(n);
}

/** 解析 `page` / `pageSize`；非法时返回 `error` 文案。 */
export function parsePageQuery(
  c: Context,
  defaults: { page?: number; pageSize?: number } = {},
): { page: number; pageSize: number; error?: string } {
  const page = intQuery(c.req.query("page"), defaults.page ?? 1);
  const pageSize = intQuery(c.req.query("pageSize"), defaults.pageSize ?? 10);
  if (Number.isNaN(page) || Number.isNaN(pageSize)) {
    return { page: 1, pageSize: 10, error: "Query page and pageSize must be positive integers" };
  }
  if (pageSize > MAX_PAGE_SIZE) {
    return { page, pageSize, error: `Query pageSize must be at most ${MAX_PAGE_SIZE}` };
  }
  return { page, pageSize };
}

/** 成功为对象；失败为已构造的 400 Response。 */
export async function readJsonBody(c: Context): Promise<Record<string, unknown> | Response> {
  try {
    const body: unknown = await c.req.json();
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return c.json({ error: "invalid_json", message: "Request body must be a JSON object" }, 400);
    }
    return body as Record<string, unknown>;
  } catch {
    return c.json({ error: "invalid_json", message: "Request body must be JSON" }, 400);
  }
}
