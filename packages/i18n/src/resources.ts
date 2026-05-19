import { commonEn } from './locales/en/common.ts';
import { loginEn } from './locales/en/login.ts';
import { commonZhCN } from './locales/zh-CN/common.ts';
import { loginZhCN } from './locales/zh-CN/login.ts';

/** 各语言 × 命名空间文案表，新增子应用时在此扩展 */
export const i18nResources = {
  'zh-CN': {
    common: commonZhCN,
    login: loginZhCN,
  },
  en: {
    common: commonEn,
    login: loginEn,
  },
} as const;

export type I18nNamespace = keyof (typeof i18nResources)['zh-CN'];
