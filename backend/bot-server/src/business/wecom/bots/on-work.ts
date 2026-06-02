/** 企业微信机器人：下班提醒（18:30）。 */
import { Hono } from 'hono';
import { jsonBad, jsonUpstreamErr } from '../../../utils/http.ts';
import { requireWecomTriggerToken } from '../shared/auth.ts';
import { sendWecomText, type WecomSendResult } from '../shared/client.ts';
import { getSupportedCalendarYears } from '../shared/holidays-calendar.ts';
import { isWorkdayInShanghai, parseDateList } from '../shared/workday.ts';
import type { WecomBotDefinition } from '../types.ts';

const JOB_NAME = 'wecom-on-work';

interface OffWorkConfig {
  readonly webhookUrl: string | undefined;
  readonly cron: string;
  readonly text: string;
  readonly mentionedMobiles: readonly string[];
  readonly extraHolidays: ReadonlySet<string>;
  readonly extraWorkdays: ReadonlySet<string>;
}

/** 每天 10:30 UTC 触发，是否发送由工作日逻辑决定（含调休）。 */
const DEFAULT_CRON = '30 10 * * *';
const DEFAULT_TEXT = '鸡啊, 8:30 上班了';

function getConfig(): OffWorkConfig {
  const webhookUrl = Deno.env.get('WECOM_OFF_WORK_WEBHOOK_URL')?.trim() || undefined;
  const cron = Deno.env.get('WECOM_OFF_WORK_CRON')?.trim() || DEFAULT_CRON;
  const text = Deno.env.get('WECOM_OFF_WORK_TEXT')?.trim() || DEFAULT_TEXT;
  const mentionedRaw = Deno.env.get('WECOM_OFF_WORK_MENTIONED_MOBILES')?.trim() ?? '';
  const mentionedMobiles = mentionedRaw.length
    ? mentionedRaw
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const extraHolidays = parseDateList(Deno.env.get('WECOM_OFF_WORK_EXTRA_HOLIDAYS')?.trim() ?? '');
  const extraWorkdays = parseDateList(Deno.env.get('WECOM_OFF_WORK_EXTRA_WORKDAYS')?.trim() ?? '');
  return { webhookUrl, cron, text, mentionedMobiles, extraHolidays, extraWorkdays };
}

async function sendNotice(overrideText?: string): Promise<WecomSendResult> {
  const cfg = getConfig();
  if (!cfg.webhookUrl) throw new Error('WECOM_OFF_WORK_WEBHOOK_URL 未配置');
  return await sendWecomText(cfg.webhookUrl, {
    content: overrideText?.trim() || cfg.text,
    mentionedMobiles: cfg.mentionedMobiles,
  });
}

const routes = new Hono();
routes.post('/wecom/on-work', async (c) => {
  const auth = requireWecomTriggerToken(c);
  if (!auth) return auth;

  const cfg = getConfig();
  if (!cfg.webhookUrl) return jsonBad(c, 400, 'WECOM_OFF_WORK_WEBHOOK_URL 未配置');

  let overrideText: string | undefined;
  const body = (await c.req.json().catch(() => undefined)) as { text?: unknown } | undefined;
  if (body && typeof body.text === 'string') overrideText = body.text;

  try {
    const result = await sendNotice(overrideText);
    if (!result.ok) {
      return c.json(
        {
          error: 'wecom_send_failed',
          status: result.status,
          errcode: result.errcode ?? null,
          errmsg: result.errmsg ?? null,
        },
        502,
      );
    }
    return c.json({ ok: true, sent: overrideText?.trim() || cfg.text });
  } catch (e) {
    return jsonUpstreamErr(c, e, 'wecom send failed');
  }
});

function registerJob(): void {
  const cfg = getConfig();
  if (!cfg.webhookUrl) {
    console.warn(`[wecom/${JOB_NAME}] 跳过：未配置 WECOM_OFF_WORK_WEBHOOK_URL`);
    return;
  }

  Deno.cron(JOB_NAME, cfg.cron, async () => {
    if (
      !isWorkdayInShanghai(new Date(), {
        extraHolidays: cfg.extraHolidays,
        extraWorkdays: cfg.extraWorkdays,
      })
    ) {
      console.log(`[wecom/${JOB_NAME}] 非工作日，跳过发送`);
      return;
    }

    try {
      const result = await sendNotice();
      if (!result.ok) {
        console.error(
          `[wecom/${JOB_NAME}] 发送失败 status=${result.status} errcode=${result.errcode ?? '-'} errmsg=${result.errmsg ?? '-'}`,
        );
        return;
      }
      console.log(`[wecom/${JOB_NAME}] 已发送：${cfg.text}`);
    } catch (e) {
      console.error(`[wecom/${JOB_NAME}] 异常`, e);
    }
  });

  console.log(
    `[wecom/${JOB_NAME}] 已注册 cron="${cfg.cron}"（UTC），内置节假日 ${getSupportedCalendarYears().join('/')}，仅工作日发送`,
  );
}

function health(): Record<string, unknown> {
  const cfg = getConfig();
  return {
    webhookConfigured: Boolean(cfg.webhookUrl),
    cron: cfg.cron,
    text: cfg.text,
    mentionedCount: cfg.mentionedMobiles.length,
    workdayOnly: true,
    holidayCalendarYears: getSupportedCalendarYears(),
    extraHolidayCount: cfg.extraHolidays.size,
    extraWorkdayCount: cfg.extraWorkdays.size,
  };
}

export const onWorkBot: WecomBotDefinition = {
  jobName: JOB_NAME,
  routes,
  registerJob,
  health,
};
