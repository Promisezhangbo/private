import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import type { SupportedLocale } from './types.ts';

/** 与当前 i18n 语言对齐的 Ant Design ConfigProvider locale */
export function getAntdLocale(locale: SupportedLocale) {
  return locale === 'en' ? enUS : zhCN;
}
