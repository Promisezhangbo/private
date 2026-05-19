import { useEffect, useRef, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createI18nInstance } from './create-instance.ts';
import { bindLocaleSync } from './locale-sync.ts';
import type { I18nProviderProps } from './types.ts';

export function I18nProvider({ children, defaultLocale, namespaces }: I18nProviderProps) {
  const i18nRef = useRef(createI18nInstance({ defaultLocale, namespaces }));
  const i18n = i18nRef.current;

  useEffect(() => bindLocaleSync(i18n), [i18n]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
