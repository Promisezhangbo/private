import { app } from "./app";
import { getDatabaseUrl } from "./db/env";

const u = getDatabaseUrl();
if (u) console.log(`[blog-server] DATABASE_URL 已加载（${u.length}）`);
else console.warn("[blog-server] 无 DATABASE_URL，使用内存数据；见 README / .env.local");

Deno.serve(app.fetch);
