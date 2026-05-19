import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeLocale, persistLocale, syncDocumentLang } from './locale.ts';
import type { SupportedLocale } from './types.ts';

/** @param ns 命名空间，如 `'login'`、`'common'`（须已在 resources 注册） */
export function useT(ns: string | string[]) {
  return useTranslation(ns);
}

export function useLocale() {
  const { i18n } = useTranslation();
  const locale = normalizeLocale(i18n.language);

  const setLocale = useCallback(
    (next: SupportedLocale) => {
      void i18n.changeLanguage(next);
      persistLocale(next);
      syncDocumentLang(next);
    },
    [i18n],
  );

  return { locale, setLocale } as const;
}
