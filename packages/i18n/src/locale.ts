import {
  LEGACY_LOCALE_STORAGE_KEYS,
  LOCALE_CHANGE_EVENT,
  SITE_LOCALE_STORAGE_KEY,
} from './constants.ts';
import { DEFAULT_LOCALE, type SupportedLocale } from './types.ts';

export function normalizeLocale(input?: string | null): SupportedLocale {
  if (!input) return DEFAULT_LOCALE;
  const lower = input.toLowerCase();
  if (lower === 'en' || lower.startsWith('en-')) return 'en';
  return 'zh-CN';
}

export function readStoredLocale(): SupportedLocale | undefined {
  if (typeof localStorage === 'undefined') return undefined;

  const current = localStorage.getItem(SITE_LOCALE_STORAGE_KEY);
  if (current) return normalizeLocale(current);

  for (const legacyKey of LEGACY_LOCALE_STORAGE_KEYS) {
    const legacy = localStorage.getItem(legacyKey);
    if (!legacy) continue;
    const locale = normalizeLocale(legacy);
    persistLocale(locale);
    localStorage.removeItem(legacyKey);
    return locale;
  }

  return undefined;
}

export function persistLocale(locale: SupportedLocale) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SITE_LOCALE_STORAGE_KEY, locale);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, { detail: locale }));
  }
}

export function syncDocumentLang(locale: SupportedLocale) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
}
