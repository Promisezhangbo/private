/** 网络层：系统路由。 */
import { Hono } from "hono";

const health = () => ({
  name: "bot-server",
  status: "ok" as const,
  runtime: "deno" as const,
  timestamp: new Date().toISOString(),
});

export const systemRoutes = new Hono();
systemRoutes.get("/", (c) => c.json(health()));
systemRoutes.get("/health", (c) => c.json(health()));
systemRoutes.get("/robots.txt", (c) =>
  c.text("User-agent: *\nDisallow: /\n", 200, { "cache-control": "no-store" }),
);
