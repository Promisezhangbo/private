/**
 * 入口：
 *   1. registerAllJobs() — 各业务目录注册 Deno.cron（见 business/wecom/bots/）
 *   2. Deno.serve        — HTTP（routes → business）
 */
import { app } from "./app.ts";
import { registerAllJobs } from "./jobs/index.ts";
import { getServerPort } from "./utils/env.ts";

registerAllJobs();

const handler = app.fetch;

export default {
  fetch: handler,
} satisfies { fetch: typeof handler };

if (import.meta.main) {
  const port = getServerPort();
  Deno.serve({ port }, handler);
  console.log(`[bot-server] HTTP http://localhost:${port}/`);
}
