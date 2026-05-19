import { ConfigProvider, type ThemeConfig } from 'antd';
import type { ReactNode } from 'react';
import { getAntdLocale } from './antdLocale.ts';
import { useLocale } from './hooks.ts';

type AntdLocaleProviderProps = {
  children: ReactNode;
  theme?: ThemeConfig;
};

/** 根据当前全站语言同步 Ant Design ConfigProvider locale */
export function AntdLocaleProvider({ children, theme }: AntdLocaleProviderProps) {
  const { locale } = useLocale();
  return (
    <ConfigProvider locale={getAntdLocale(locale)} theme={theme}>
      {children}
    </ConfigProvider>
  );
}
