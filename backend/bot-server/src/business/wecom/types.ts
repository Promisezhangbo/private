/** 单个企业微信机器人的约定：路由 + 定时 + 健康信息。 */
import type { Hono } from "hono";

export interface WecomBotDefinition {
  /** Deno.cron 任务名，建议 `wecom-<id>`。 */
  readonly jobName: string;
  /** HTTP 路由（路径建议以 `/wecom/` 开头）。 */
  readonly routes: Hono;
  /** 注册 Deno.cron；未配置 webhook 时应跳过并打日志。 */
  registerJob(): void;
  /** 供 GET /wecom/health 汇总展示（勿返回密钥）。 */
  health(): Record<string, unknown>;
}
