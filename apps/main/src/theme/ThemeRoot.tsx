import { ConfigProvider, theme as antTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { THEME_STORAGE_KEY, ThemeCtx, type AppThemeMode } from './context';
function readStoredMode(): AppThemeMode {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}
/** 主应用主题：CSS 变量（html data-theme）+ Ant Design algorithm */
export function ThemeRoot({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppThemeMode>(readStoredMode);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);
  const ctx = useMemo(() => ({ mode, setMode }), [mode]);
  return (
    <ThemeCtx.Provider value={ctx}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#14b8a6',
            // 与 @packages/style-config $radius-sm / $radius-md（8px / 12px）一致
            borderRadius: 8,
            borderRadiusLG: 12,
            borderRadiusSM: 8,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeCtx.Provider>
  );
}
