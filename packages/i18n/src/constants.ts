/**
 * 全站统一语言偏好 localStorage 键（与 `private-main-theme` 等同域共享）。
 * 各子应用接入 @packages/i18n 时勿再使用应用级键名。
 */
export const SITE_LOCALE_STORAGE_KEY = 'private_locale';

/** 历史键，读取时自动迁移到 SITE_LOCALE_STORAGE_KEY */
export const LEGACY_LOCALE_STORAGE_KEYS = ['private:locale', 'login:locale', 'app:locale'] as const;

/** 同页内多实例（主应用 + 子应用）切换语言时广播 */
export const LOCALE_CHANGE_EVENT = 'private_locale-change';
