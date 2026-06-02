/**
 * 企业微信机器人静态配置（改时间 / 文案请改此文件）。
 * 环境变量仅配置各 bot 的 webhook，见 `.env.example`。
 */

export const OFF_WORK_BOT = {
  jobName: 'wecom-off-work',
  path: '/wecom/off-work',
  webhookEnv: 'WECOM_OFF_WORK_WEBHOOK_URL',
  /** Deno.cron（UTC）。`30 10 * * *` = 北京时间 18:30，每天检查，工作日才发 */
  cron: '30 10 * * *',
  text: '鸡啊, 18:30 下班了',
  /** 需要 @ 全员时填 `['@all']` */
  mentionedMobiles: [] as const,
} as const;

export const ON_WORK_BOT = {
  jobName: 'wecom-on-work',
  path: '/wecom/on-work',
  webhookEnv: 'WECOM_ON_WORK_WEBHOOK_URL',
  /** Deno.cron（UTC）。`30 0 * * *` = 北京时间 8:30，每天检查，工作日才发 */
  cron: '30 0 * * *',
  text: '鸡啊, 8:30 上班了',
  mentionedMobiles: [] as const,
} as const;
