import { useContext } from 'react';
import { ThemeCtx, type AppThemeMode } from './context';

export type { AppThemeMode };

export function useAppTheme(): {
  mode: AppThemeMode;
  setMode: (m: AppThemeMode) => void;
} {
  const v = useContext(ThemeCtx);
  if (!v) throw new Error('useAppTheme must be used under ThemeRoot');
  return v;
}
