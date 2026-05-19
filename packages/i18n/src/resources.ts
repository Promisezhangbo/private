import { agentEn } from './locales/en/agent.ts';
import { blogEn } from './locales/en/blog.ts';
import { commonEn } from './locales/en/common.ts';
import { loginEn } from './locales/en/login.ts';
import { resumeEn } from './locales/en/resume.ts';
import { skillEn } from './locales/en/skill.ts';
import { utilsEn } from './locales/en/utils.ts';
import { agentZhCN } from './locales/zh-CN/agent.ts';
import { blogZhCN } from './locales/zh-CN/blog.ts';
import { commonZhCN } from './locales/zh-CN/common.ts';
import { loginZhCN } from './locales/zh-CN/login.ts';
import { resumeZhCN } from './locales/zh-CN/resume.ts';
import { skillZhCN } from './locales/zh-CN/skill.ts';
import { utilsZhCN } from './locales/zh-CN/utils.ts';

/** 各语言 × 命名空间文案表 */
export const i18nResources = {
  'zh-CN': {
    common: commonZhCN,
    login: loginZhCN,
    agent: agentZhCN,
    blog: blogZhCN,
    skill: skillZhCN,
    resume: resumeZhCN,
    utils: utilsZhCN,
  },
  en: {
    common: commonEn,
    login: loginEn,
    agent: agentEn,
    blog: blogEn,
    skill: skillEn,
    resume: resumeEn,
    utils: utilsEn,
  },
} as const;

export type I18nNamespace = keyof (typeof i18nResources)['zh-CN'];
