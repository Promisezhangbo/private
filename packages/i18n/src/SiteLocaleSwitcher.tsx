import { Select } from 'antd';
import { useLocale, useT } from './hooks.ts';
import type { SupportedLocale } from './types.ts';

type SiteLocaleSwitcherProps = {
  className?: string;
};

/** 全站语言切换（读写 `private_locale`），主应用顶栏与子应用均可复用 */
export function SiteLocaleSwitcher({ className }: SiteLocaleSwitcherProps) {
  const { locale, setLocale } = useLocale();
  const { t } = useT('common');

  return (
    <Select
      className={className}
      size="small"
      variant="borderless"
      value={locale}
      aria-label={t('locale.label')}
      onChange={(v) => setLocale(v as SupportedLocale)}
      options={[
        { value: 'zh-CN', label: t('locale.zhCN') },
        { value: 'en', label: t('locale.en') },
      ]}
    />
  );
}
