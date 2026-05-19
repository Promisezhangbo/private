import type { ReactNode } from 'react';

/** 当前内置语言；主语言为简体中文 */
export type SupportedLocale = 'zh-CN' | 'en';

export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN';

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['zh-CN', 'en'] as const;

export type I18nProviderProps = {
  children: ReactNode;
  defaultLocale?: SupportedLocale;
  /** 本子应用用到的命名空间（语言偏好仍用全站 `private_locale`） */
  namespaces?: string[];
};
