import { app } from "./app";
import { getDatabaseUrl } from "./db/env";

const u = getDatabaseUrl();
if (u) console.log(`[blog-server] DATABASE_URL 已加载（${u.length}）`);
else console.warn("[blog-server] 无 DATABASE_URL，使用内存数据；见 README / .env.local");

const handler = app.fetch;

// 新 Deno Deploy Dynamic 运行时通过默认 export 的 fetch 挂载服务；仅用 Deno.serve 时 Warm up 可能无法完成。
// 使用「仅含 fetch」的本地形状，避免编辑器里手写 `Deno` 声明缺 `ServeDefaultExport` 成员。
export default {
  fetch: handler,
} satisfies { fetch: typeof handler };

if (import.meta.main) {
  Deno.serve(handler);
}
