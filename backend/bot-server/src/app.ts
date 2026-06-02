/** 网络层：组装 Hono（中间件 + 路由），不含业务逻辑。 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { routes } from "./routes/index.ts";
import { getCorsAllowedOriginsExtra } from "./utils/env.ts";

const corsExtraOriginSet = new Set(getCorsAllowedOriginsExtra());

function corsReflectOrigin(origin: string): string | undefined {
  if (!origin?.trim()) return undefined;
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
  } catch {
    /* ignore malformed origin */
  }
  return undefined;
}

const app = new Hono();
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => corsReflectOrigin(origin) ?? "",
    credentials: true,
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);
app.route("/", routes);

export { app };
