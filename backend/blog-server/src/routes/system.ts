import { Hono } from "hono";
import { getDatabaseUrl } from "../db/env.ts";

function healthBody() {
  return {
    name: "blog-server",
    status: "ok",
    runtime: "deno",
    /** 有 DATABASE_URL 时走 Postgres，否则为内存占位数据（与线上条数会不一致）。 */
    dataSource: getDatabaseUrl() ? ("postgres" as const) : ("memory" as const),
    timestamp: new Date().toISOString(),
  };
}

/** 存活探针，供负载均衡或人工 curl。 */
export const systemRoutes = new Hono();

systemRoutes.get("/", (c) => c.json(healthBody()));

systemRoutes.get("/health", (c) => c.json(healthBody()));

/** 极简 robots.txt，可按需收紧规则。 */
systemRoutes.get("/robots.txt", (c) =>
  c.text("User-agent: *\nAllow: /\n", 200, {
    "cache-control": "no-store",
  }),
);
