/**
 * 应用入口：Hono 路由风格接近 Express（app.get / app.post、链式中间件）。
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { blogRoutes } from "./routes/blog.ts";
import { systemRoutes } from "./routes/system.ts";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.route("/", systemRoutes);
app.route("/", blogRoutes);

export { app };
