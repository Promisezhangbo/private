import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { blogRoutes } from "./routes/blog";
import { systemRoutes } from "./routes/system";

const app = new Hono();
// 内置 logger：请求 `<-- METHOD path`，响应 `--> METHOD path STATUS 耗时`
app.use("*", logger());
// 不显式收窄 allowHeaders：否则 OPTIONS 只会返回 Content-Type，
// 而浏览器/Ajax 常在预检里带上 accept 等请求头 → 被拒（仅线上跨域更明显）。
app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "OPTIONS"] }));
app.route("/", systemRoutes);
app.route("/", blogRoutes);

export { app };
