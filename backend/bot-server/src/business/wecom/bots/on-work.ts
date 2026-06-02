/** 企业微信：上班提醒 */
import { createWecomBot } from '../shared/create-bot.ts';
import { ON_WORK_BOT } from './settings.ts';

export const onWorkBot = createWecomBot(ON_WORK_BOT);
