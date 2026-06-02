/** 根据静态配置创建企业微信机器人（路由 + 定时 + health）。 */
import { Hono } from 'hono';
import { jsonBad, jsonUpstreamErr } from '../../../utils/http.ts';
import { requireWecomTriggerToken } from './auth.ts';
import { sendWecomText, type WecomSendResult } from './client.ts';
import { getSupportedCalendarYears } from './holidays-calendar.ts';
import { isWorkdayInShanghai } from './workday.ts';
import type { WecomBotDefinition } from '../types.ts';

export interface WecomBotSettings {
  readonly jobName: string;
  readonly path: string;
  readonly webhookEnv: string;
  readonly cron: string;
  readonly text: string;
  readonly mentionedMobiles?: readonly string[];
}

interface ResolvedConfig {
  readonly webhookUrl: string | undefined;
  readonly cron: string;
  readonly text: string;
  readonly mentionedMobiles: readonly string[];
}

function getConfig(settings: WecomBotSettings): ResolvedConfig {
  const webhookUrl = Deno.env.get(settings.webhookEnv)?.trim() || undefined;
  return {
    webhookUrl,
    cron: settings.cron,
    text: settings.text,
    mentionedMobiles: settings.mentionedMobiles ?? [],
  };
}

function createSendNotice(settings: WecomBotSettings) {
  return async (overrideText?: string): Promise<WecomSendResult> => {
    const cfg = getConfig(settings);
    if (!cfg.webhookUrl) throw new Error(`${settings.webhookEnv} 未配置`);
    return await sendWecomText(cfg.webhookUrl, {
      content: overrideText?.trim() || cfg.text,
      mentionedMobiles: cfg.mentionedMobiles,
    });
  };
}

export function createWecomBot(settings: WecomBotSettings): WecomBotDefinition {
  const sendNotice = createSendNotice(settings);
  const routes = new Hono();

  routes.post(settings.path, async (c) => {
    const auth = requireWecomTriggerToken(c);
    if (auth !== true) return auth;

    const cfg = getConfig(settings);
    if (!cfg.webhookUrl) return jsonBad(c, 400, `${settings.webhookEnv} 未配置`);

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

  return {
    jobName: settings.jobName,
    routes,
    registerJob() {
      const cfg = getConfig(settings);
      if (!cfg.webhookUrl) {
        console.warn(`[wecom/${settings.jobName}] 跳过：未配置 ${settings.webhookEnv}`);
        return;
      }

      Deno.cron(settings.jobName, cfg.cron, async () => {
        if (!isWorkdayInShanghai(new Date())) {
          console.log(`[wecom/${settings.jobName}] 非工作日，跳过发送`);
          return;
        }

        try {
          const result = await sendNotice();
          if (!result.ok) {
            console.error(
              `[wecom/${settings.jobName}] 发送失败 status=${result.status} errcode=${result.errcode ?? '-'} errmsg=${result.errmsg ?? '-'}`,
            );
            return;
          }
          console.log(`[wecom/${settings.jobName}] 已发送：${cfg.text}`);
        } catch (e) {
          console.error(`[wecom/${settings.jobName}] 异常`, e);
        }
      });

      console.log(
        `[wecom/${settings.jobName}] 已注册 cron="${cfg.cron}"（UTC），内置节假日 ${getSupportedCalendarYears().join('/')}，仅工作日发送`,
      );
    },
    health() {
      const cfg = getConfig(settings);
      return {
        webhookEnv: settings.webhookEnv,
        webhookConfigured: Boolean(cfg.webhookUrl),
        cron: cfg.cron,
        text: cfg.text,
        mentionedCount: cfg.mentionedMobiles.length,
        workdayOnly: true,
        holidayCalendarYears: getSupportedCalendarYears(),
      };
    },
  };
}
