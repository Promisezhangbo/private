/** HTTP 路由层通用工具：JSON 错误响应。 */
import type { Context } from "hono";

export function jsonBad(c: Context, status: 400 | 401 | 404, message: string) {
  const errorMap = { 400: "validation_error", 401: "unauthorized", 404: "not_found" } as const;
  return c.json({ error: errorMap[status], message }, status);
}

export function jsonUpstreamErr(c: Context, error: unknown, fallback: string) {
  console.error(error);
  return c.json(
    { error: "upstream_error", message: error instanceof Error ? error.message : fallback },
    502,
  );
}
