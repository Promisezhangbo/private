/** Deno 入口：本地 `deno task dev` 与 Deploy `export default { fetch }`。 */
import { app } from "./app.ts";
import { getDatabaseUrl } from "./core/env.ts";

const u = getDatabaseUrl();
if (u) console.log(`[api-server] DATABASE_URL 已加载（${u.length}）`);
else console.warn("[api-server] 无 DATABASE_URL，使用内存数据；见 README / .env.local");

const handler = app.fetch;

export default {
  fetch: handler,
} satisfies { fetch: typeof handler };

if (import.meta.main) {
  Deno.serve(handler);
}
