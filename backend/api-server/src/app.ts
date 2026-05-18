import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getCorsAllowedOriginsExtra } from "./db/env";
import { blogRoutes } from "./routes/blog";
import { stockRoutes } from "./routes/stock";
import { systemRoutes } from "./routes/system";

const corsExtraOriginSet = new Set(getCorsAllowedOriginsExtra());

/** 允许带凭证（axios `withCredentials`）的 Origin；须为具体 URL，不能依赖 `*` + `Allow-Credentials`。 */
function corsReflectOrigin(origin: string): string | undefined {
  if (!origin || origin.trim() === "") return undefined;
  try {
    const u = new URL(origin);
    if (corsExtraOriginSet.has(origin)) return origin;
    if (u.protocol === "https:") {
      if (u.hostname === "promisezhangbo.github.io") return origin;
      if (u.hostname.endsWith(".netlify.app") || u.hostname === "netlify.app") return origin;
    }
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
      if (u.protocol === "http:" || u.protocol === "https:") return origin;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

const app = new Hono();
// 内置 logger：请求 `<-- METHOD path`，响应 `--> METHOD path STATUS 耗时`
app.use("*", logger());
// 不显式收窄 allowHeaders：否则 OPTIONS 只会返回 Content-Type，
// 而浏览器/Ajax 常在预检里带上 accept 等请求头 → 被拒（仅线上跨域更明显）。
// `credentials: true`：配合前端 `WITH_CREDENTIALS`；此时 ACAO 必须为具体 Origin（见 corsReflectOrigin）。
app.use(
  "*",
  cors({
    origin: (origin) => corsReflectOrigin(origin) ?? "",
    credentials: true,
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);
app.route("/", systemRoutes);
app.route("/", blogRoutes);
app.route("/", stockRoutes);

export { app };
