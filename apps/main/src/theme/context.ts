import { createContext } from 'react';

export type AppThemeMode = 'light' | 'dark';

export const ThemeCtx = createContext<{
  mode: AppThemeMode;
  setMode: (m: AppThemeMode) => void;
} | null>(null);

export const THEME_STORAGE_KEY = 'private-main-theme';
