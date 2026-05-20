# 常见问题（Q&A）

> 专题说明以 `docs/` 为准；本文仅记录零散排障笔记。过时条目会标注 **[已过时]**。

## 1. 切换子应用后 Ant Design 样式/语言异常

**现象**：子应用表单、日期等组件样式或内置文案与主应用不一致。

**当前做法**（2025 起）：

- 主应用：`ThemeRoot` 内使用 `@packages/i18n` 的 `<AntdLocaleProvider>`（含主题 algorithm），不再在根上写死 `locale={zhCN}`。
- 各子应用：根组件同样包裹 `<I18nProvider>` + `<AntdLocaleProvider>`，与全站 `private_locale` 同步。

详见 [docs/i18n.md](docs/i18n.md)。

---

## 2. [已过时] 主应用 ConfigProvider 写死 zhCN

早期曾在主应用根节点写：

```tsx
<ConfigProvider theme={{}} locale={zhCN}>
```

已由 `AntdLocaleProvider` 替代，请勿再按此方式修改。

---

## 3. qiankun：Target container not existed

先确认 `#sub-app`（或当前注册的容器选择器）已在 DOM 中渲染，再执行子应用注册/挂载；必要时将注册延后到布局或路由 `useEffect` 之后。见 [docs/local-dev-whistle-qiankun.md](docs/local-dev-whistle-qiankun.md)。

---

## 4. 本地 HTTPS 页访问子应用报 ERR_SSL_PROTOCOL_ERROR

开发态子应用 entry 须使用显式 **`http://127.0.0.1:<port>`**，勿用 `//127.0.0.1`（在 HTTPS 页会变成 https）。见 [docs/local-dev-whistle-qiankun.md](docs/local-dev-whistle-qiankun.md)。
