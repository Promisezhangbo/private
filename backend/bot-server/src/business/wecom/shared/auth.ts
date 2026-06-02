/** 企业微信渠道的手动触发鉴权。 */
import type { Context } from "hono";
import { jsonBad } from "../../../utils/http.ts";

function getTriggerToken(): string | undefined {
  const raw = Deno.env.get("BOT_TRIGGER_TOKEN")?.trim() ?? "";
  return raw.length > 0 ? raw : undefined;
}

/**
 * 校验手动触发 token；未配置 `BOT_TRIGGER_TOKEN` 时直接放行。
 * 优先级：query `?token=` > `x-bot-token` > `Authorization: Bearer`。
 */
export function requireWecomTriggerToken(c: Context): true | Response {
  const expected = getTriggerToken();
  if (!expected) return true;
  const fromQuery = c.req.query("token")?.trim();
  const fromHeader = c.req.header("x-bot-token")?.trim();
  const auth = c.req.header("authorization")?.trim();
  const fromBearer = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : undefined;
  const got = fromQuery || fromHeader || fromBearer || "";
  if (got !== expected) return jsonBad(c, 401, "Invalid or missing trigger token");
  return true;
}
