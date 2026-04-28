import { Hono } from "hono";
import { getDatabaseUrl } from "../db/env";

const health = () => ({
  name: "blog-server",
  status: "ok" as const,
  runtime: "deno" as const,
  dataSource: getDatabaseUrl() ? ("postgres" as const) : ("memory" as const),
  timestamp: new Date().toISOString(),
});

export const systemRoutes = new Hono();
systemRoutes.get("/", (c) => c.json(health()));
systemRoutes.get("/health", (c) => c.json(health()));
systemRoutes.get("/robots.txt", (c) =>
  c.text("User-agent: *\nAllow: /\n", 200, { "cache-control": "no-store" }),
);
