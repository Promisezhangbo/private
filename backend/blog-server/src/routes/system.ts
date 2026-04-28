import { Hono } from "hono";

/** 存活探针，供负载均衡或人工 curl。 */
export const systemRoutes = new Hono();

systemRoutes.get("/", (c) =>
  c.json({
    name: "blog-server",
    status: "ok",
    runtime: "deno",
    timestamp: new Date().toISOString(),
  }),
);

systemRoutes.get("/health", (c) =>
  c.json({
    name: "blog-server",
    status: "ok",
    runtime: "deno",
    timestamp: new Date().toISOString(),
  }),
);

/** 极简 robots.txt，可按需收紧规则。 */
systemRoutes.get("/robots.txt", (c) =>
  c.text("User-agent: *\nAllow: /\n", 200, {
    "cache-control": "no-store",
  }),
);
