/**
 * 企业微信机器人列表。
 *
 * 新增机器人：
 * 1. 在 `settings.ts` 增加静态配置
 * 2. 新建 `xxx.ts`：`export const xxxBot = createWecomBot(XXX_BOT)`
 * 3. 在本文件 `wecomBots` 追加；`.env` 只配 webhook
 */
import type { WecomBotDefinition } from '../types.ts';
import { offWorkBot } from './off-work.ts';
import { onWorkBot } from './on-work.ts';

export const wecomBots: readonly WecomBotDefinition[] = [offWorkBot, onWorkBot];
