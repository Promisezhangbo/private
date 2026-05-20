# @packages/i18n

Monorepo 共享多语言（i18next + react-i18next），全站语言键 **`private_locale`**。

**完整说明：[docs/i18n.md](../../docs/i18n.md)**

## 现状（一句话）

- **7 个应用**（main + 6 子应用）均已挂 `I18nProvider` + `AntdLocaleProvider`。
- **页面词条**：仅 `login` 命名空间有内容；`agent` / `blog` / `skill` / `resume` / `utils` 为空占位。

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
    <YourApp />
  </AntdLocaleProvider>
</I18nProvider>

// 页面
const { t } = useT('login');
t('signin.welcome');
```

主应用顶栏或 login 壳层使用 `<SiteLocaleSwitcher />`；其它子应用默认依赖 main 顶栏（`/login` 除外）。

## 新增命名空间

1. `src/locales/zh-CN/<ns>.ts` + `en/<ns>.ts`
2. `src/resources.ts` 注册
3. 子应用 `I18nProvider namespaces={['<ns>']}`

通过 `pnpm micro-app:create` 创建的应用已含第 3 步，仍需完成 1、2。
