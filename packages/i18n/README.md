# @packages/i18n

Monorepo 共享多语言（i18next + react-i18next），全站语言键 **`private_locale`**。

**完整说明见：[docs/i18n.md](../../docs/i18n.md)**

## 速查

```tsx
import {
  AntdLocaleProvider,
  I18nProvider,
  SiteLocaleSwitcher,
  useLocale,
  useT,
} from '@packages/i18n';

// 子应用根
<I18nProvider namespaces={['login']}>
  <AntdLocaleProvider theme={optionalTheme}>
    <SiteLocaleSwitcher className="..." />
    <YourApp />
  </AntdLocaleProvider>
</I18nProvider>

// 页面
const { t } = useT('login');
t('signin.welcome');
```

## 新增命名空间

1. `src/locales/zh-CN/<ns>.ts` + `en/<ns>.ts`
2. `src/resources.ts` 注册
3. 子应用 `I18nProvider namespaces={['<ns>']}`
