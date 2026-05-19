import type { i18n as I18nInstance } from 'i18next';
import { LOCALE_CHANGE_EVENT, SITE_LOCALE_STORAGE_KEY } from './constants.ts';
import { normalizeLocale, syncDocumentLang } from './locale.ts';
import type { SupportedLocale } from './types.ts';

/** 主应用与子应用多实例间同步 private_locale（storage + 同页 CustomEvent） */
export function bindLocaleSync(i18n: I18nInstance) {
  const apply = (lng: SupportedLocale) => {
    if (normalizeLocale(i18n.language) === lng) return;
    void i18n.changeLanguage(lng);
    syncDocumentLang(lng);
  };

  const onStorage = (e: StorageEvent) => {
    if (e.key === SITE_LOCALE_STORAGE_KEY && e.newValue) {
      apply(normalizeLocale(e.newValue));
    }
  };

  const onLocaleChange = (e: Event) => {
    apply(normalizeLocale((e as CustomEvent<SupportedLocale>).detail));
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
  };
}
