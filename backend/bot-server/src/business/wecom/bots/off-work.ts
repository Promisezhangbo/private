/** 企业微信：下班提醒 */
import { createWecomBot } from '../shared/create-bot.ts';
import { OFF_WORK_BOT } from './settings.ts';

export const offWorkBot = createWecomBot(OFF_WORK_BOT);
