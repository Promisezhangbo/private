import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { blogRoutes } from "./routes/blog";
import { systemRoutes } from "./routes/system";

const app = new Hono();
// 内置 logger：请求 `<-- METHOD path`，响应 `--> METHOD path STATUS 耗时`
app.use("*", logger());
app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "OPTIONS"], allowHeaders: ["Content-Type"] }));
app.route("/", systemRoutes);
app.route("/", blogRoutes);

export { app };
