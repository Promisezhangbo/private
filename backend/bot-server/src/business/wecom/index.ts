/** 企业微信业务入口：汇总所有机器人的路由与定时任务。 */
import { Hono } from "hono";
import { wecomBots } from "./bots/index.ts";

/** 注册本渠道下全部 Deno.cron。 */
export function registerWecomJobs(): void {
  for (const bot of wecomBots) bot.registerJob();
}

/** 本渠道 HTTP 路由（含各 bot 子路由 + 渠道级 health）。 */
export function createWecomRouter(): Hono {
  const router = new Hono();
  router.get("/wecom/health", (c) =>
    c.json({
      name: "wecom",
      status: "ok" as const,
      bots: wecomBots.map((bot) => ({ name: bot.jobName, ...bot.health() })),
    }),
  );
  for (const bot of wecomBots) router.route("/", bot.routes);
  return router;
}
