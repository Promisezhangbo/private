/** 全局环境变量（与各业务机器人无关的配置）。 */

const DEFAULT_SERVER_PORT = 8787;

/** 本地 HTTP 端口；默认 8787，避免与常见 8000（uvicorn 等）冲突。 */
export function getServerPort(): number {
  const raw = Deno.env.get("BOT_SERVER_PORT")?.trim() ?? "";
  if (!raw.length) return DEFAULT_SERVER_PORT;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`BOT_SERVER_PORT 无效: ${raw}`);
  }
  return port;
}

export function getCorsAllowedOriginsExtra(): readonly string[] {
  const raw = Deno.env.get("CORS_ALLOWED_ORIGINS")?.trim() ?? "";
  if (!raw.length) return [];
  return raw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
}
