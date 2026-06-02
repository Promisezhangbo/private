/**
 * 业务层总入口：各渠道（企业微信、飞书…）在此注册。
 *
 * 新增渠道：新建 `business/<channel>/`，在此文件 import 并挂到下方函数。
 * 新增企业微信机器人：只需改 `business/wecom/bots/`，无需动本文件。
 */
import { Hono } from "hono";
import { createWecomRouter, registerWecomJobs } from "./wecom/index.ts";

/** 注册全部定时任务（main.ts 启动时调用）。 */
export function registerAllBusinessJobs(): void {
  registerWecomJobs();
  // registerFeishuJobs();
}

/** 全部业务 HTTP 路由。 */
export function createBusinessRouter(): Hono {
  const router = new Hono();
  router.route("/", createWecomRouter());
  // router.route("/", createFeishuRouter());
  return router;
}
