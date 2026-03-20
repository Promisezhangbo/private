# @packages/style-config

工作区公共样式包（Sass/SCSS）。

## 内容

- `scss/_variables.scss`：颜色、圆角、层级、动效等设计 token
- `scss/_mixins.scss`：玻璃面板、网格底纹、细滚动条、渐变文字、卡片悬停等
- `scss/_themes.scss`：可选的 `:root` CSS 变量注入（`@include root-tokens`）
- `scss/index.scss`：`@forward` 以上模块

## 在子应用中使用

各应用 Vite 已配置别名 `@style-config` → `packages/style-config/scss`。

```scss
@use '@style-config/variables' as *;
@use '@style-config/mixins' as m;
@use '@style-config/themes' as t;

@include t.root-tokens;

.foo {
  color: $slate-700;
  @include m.thin-scrollbar(6px);
}
```

依赖：`devDependencies` 中需包含 `sass` 与本包 `workspace:*`。

## qiankun 嵌入主应用时

子应用 `#app-root` 在独立运行时用 `100vh` 铺满视口；嵌入主应用时应使用 `height/minHeight: 100%`，由主应用 `.main-content--flush` + `#sub-app` 提供高度链，避免四周露主应用底色、出现双滚动条。

## 浅色 / 暗色语义变量（`scss/_semantic-palette.scss`）

在 `html` 上切换 `data-theme="light" | "dark"` 后，提供：

- 主应用：`--sc-bg-body`、`--sc-header-*`、`--sc-dash-*` 等
- **Agent**：`--sc-agent-*`（页背景、输入区、气泡、网格线等）
- **Blog**：`--sc-blog-*`（纸张渐变、卡片、详情、标题渐变断点等）

语义对齐 [Ant Design 色彩](https://ant-design.antgroup.com/docs/spec/colors-cn) 与 [暗色模式](https://ant-design.antgroup.com/docs/spec/dark-cn)。主应用 Ant 组件请配合 `ConfigProvider` 的 `defaultAlgorithm` / `darkAlgorithm`。子应用独立运行时可在 `index.html` 用与主应用相同的 `localStorage` 键 `private-main-theme` 预置 `data-theme`。
