/**
 * 企业微信机器人列表。
 *
 * 新增机器人：
 * 1. 在 `bots/` 下新建模块（可参考 `off-work.ts`），导出 `WecomBotDefinition`
 * 2. 在本文件 `wecomBots` 数组中追加一行
 * 3. 配置对应环境变量后重新部署
 */
import type { WecomBotDefinition } from '../types.ts';
import { offWorkBot } from './off-work.ts';
import { onWorkBot } from './on-work.ts';

export const wecomBots: readonly WecomBotDefinition[] = [offWorkBot, onWorkBot];
