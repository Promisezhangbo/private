import i18n, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { i18nResources } from './resources.ts';
import { readStoredLocale, syncDocumentLang } from './locale.ts';
import { DEFAULT_LOCALE, type SupportedLocale } from './types.ts';

const COMMON_NS = 'common';

function resolveNamespaces(namespaces: string[]) {
  return [...new Set([COMMON_NS, ...namespaces])];
}

type CreateI18nOptions = {
  defaultLocale?: SupportedLocale;
  namespaces?: string[];
};

export function createI18nInstance({
  defaultLocale = DEFAULT_LOCALE,
  namespaces = [],
}: CreateI18nOptions = {}): I18nInstance {
  const initial = readStoredLocale() ?? defaultLocale;
  const ns = resolveNamespaces(namespaces);

  const instance = i18n.createInstance();
  instance.use(initReactI18next).init({
    resources: i18nResources,
    lng: initial,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: ['zh-CN', 'en'],
    ns,
    defaultNS: namespaces[0] ?? COMMON_NS,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

  syncDocumentLang(initial);
  return instance;
}
