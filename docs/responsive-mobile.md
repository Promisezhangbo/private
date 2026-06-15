# 移动端 / 响应式适配

本文档说明 Monorepo 各前端应用（`apps/*`）当前的**移动端与窄屏适配方案**，便于新页面开发与子应用脚手架对齐。

## 方案选型

采用 **SCSS + `@packages/style-config` 统一断点**，在现有样式体系上渐进增强：

- 不引入 Tailwind，不重写已有 SCSS 资产
- 复杂视觉（渐变、暗色语义变量、玻璃拟态等）仍由 SCSS + `--sc-*` 管理
- 主壳导航等**结构性变化**配合 Ant Design 组件（`Grid.useBreakpoint` + `Drawer`）
- 子应用内容区以 **流体布局 token + `@media` 断点** 为主

目标设备：手机（约 375–428px）与平板（768–1024px）；桌面宽屏保持原有版心限制。

---

## 架构分层

```
┌─────────────────────────────────────────┐
│  main（基座）                            │
│  · 顶栏：≥768px 横向 Menu；<768px Drawer │
│  · 内容区：100dvh 高度链 + #sub-app 容器   │
└─────────────────┬───────────────────────┘
                  │ qiankun
┌─────────────────▼───────────────────────┐
│  子应用（blog / agent / skill / …）       │
│  · #app-root：flex 高度链                │
│  · *-page：滚动容器（sub-app-page）       │
│  · *-page__inner：版心（sub-app-page-inner）│
│  · 页面级 @include respond-down(...)     │
└─────────────────────────────────────────┘
```

各应用 `index.html` 均已包含 `viewport` meta，无需重复添加。

---

## 共享基建（`packages/style-config`）

### 断点变量

定义于 `scss/_variables.scss`，与 Ant Design `Grid` 的 `md` / `lg` 对齐：

| 变量 | 值 | 典型用途 |
| --- | --- | --- |
| `$bp-xs` | 520px | 表单单列、工具卡片单列 |
| `$bp-sm` | 768px | 双栏 → 单栏、顶栏 Drawer 分界 |
| `$bp-md` | 1024px | 桌面窄屏（预留） |
| `$bp-lg` | 1280px | 版心上限参考 |

### 流体布局 token（默认已自适应）

无需写 `@media` 也会随视口缩放：

| 变量 | 含义 |
| --- | --- |
| `$sub-app-content-max-width` | `clamp(320px, 61.8vw, 1280px)` 内容最大宽度 |
| `$sub-app-shell-padding` | `clamp(20px, 4vw, 40px)` 左右内边距 |
| `$header-height-main` | `56px` 主应用顶栏高度 |

### 响应式 mixin

定义于 `scss/_mixins.scss`：

| Mixin | 作用 |
| --- | --- |
| `respond-down($bp)` | `@media (width <= $bp)` |
| `respond-up($bp)` | `@media (width > $bp)` |
| `sub-app-page` | 子应用页面滚动容器：`flex` + `min-width/min-height: 0` + 细滚动条 |
| `sub-app-page-inner` | 版心：`max-width` + 居中 + `$sub-app-shell-padding` |
| `sub-app-min-viewport` | 独立运行时的 `100vh` / `100dvh` 最小高度 |

### 在子应用中使用

```scss
@use '@style-config/variables' as *;
@use '@style-config/mixins' as m;

.my-page {
  @include m.sub-app-page;
  padding: 24px 0 48px;

  @include m.respond-down($bp-sm) {
    padding: 16px 0 32px;
  }
}

.my-page__inner {
  @include m.sub-app-page-inner;
}

.my-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;

  @include m.respond-down($bp-xs) {
    grid-template-columns: 1fr;
  }
}

@include m.respond-down($bp-sm) {
  .my-page__columns {
    grid-template-columns: 1fr;
  }
}
```

Vite 别名：`@style-config` → `packages/style-config/scss`（各 app 的 `vite.config.ts` 已配置）。

---

## 主应用（`apps/main`）

### 顶栏导航

- **≥ 768px（`md`）**：横向 `Menu`
- **< 768px**：汉堡按钮 + 左侧 `Drawer` 纵向菜单；语言切换与主题选择仍保留在顶栏右侧
- 判定：`Grid.useBreakpoint()`，`screens.md === false` 时启用紧凑导航（避免首屏 `undefined` 误判为移动端）

相关文件：

- `apps/main/src/layouts/index.tsx`
- `apps/main/src/layouts/index.scss`
- `apps/main/src/app.scss`

### 内容区高度

- `.main-content` 使用 `calc(100dvh - 56px)` 替代 `100vh`，减轻移动端地址栏伸缩导致的布局跳动
- 微前端路由下 `#sub-app` 仍参与 flex 高度链，子应用 `#root { height: 100% }` 才能撑满

### 控制台首页

- `Descriptions` 标签列在小屏改为 `width: auto`
- 代码块字号在窄屏略缩小

---

## 各子应用改造要点

| 应用 | 文件 / 区域 | 适配内容 |
| --- | --- | --- |
| **blog** | `_blog-shared.scss`、列表 / 详情 SCSS | 版心 padding 用 token；Tabs / 卡片小屏优化；Markdown 表格 `overflow-x: auto` |
| **utils** | `list`、`stock-cost`、`openapi` | 统一 `sub-app-page` / `sub-app-page-inner`；Grid 窄屏单列；Tabs 可横向滚动 |
| **agent** | `pages/home/index.scss` | masthead 小屏纵向堆叠；底部输入区 padding / 字号；对话气泡已有 `min-width: 0` |
| **skill** | `pages/home/index.scss` | 双栏 Grid 在 `$bp-sm` 以下变单列；统一 page shell |
| **resume** | `pages/home/index.scss` | intro 区与导出按钮小屏纵向布局；项目区内边距收紧；`@media print` 保持不变 |
| **login** | `AuthShell`、登录 / 注册页 | 表单宽度 `min(440px, 92vw)`；小屏减小卡片与 shell padding |

### Ant Design 表格

宽表格需显式横向滚动，避免撑破版心：

```tsx
<Table scroll={{ x: 640 }} /* 或 'max-content' */ />
```

`main/home`、`utils/openapi`、`utils/stock-cost` 等页面已按此处理。

### qiankun 嵌入注意

子应用 `#app-root` 在基座内应使用 `height/minHeight: 100%`，由 main 的 `.main-content--micro` + `#sub-app` 提供高度链。详见 [style-config README](../packages/style-config/README.md) 中「qiankun 嵌入主应用时」一节。

---

## 新子应用脚手架

`packages/micro-app-cli` 模板已内置响应式 page shell：

- `src/pages/home/index.scss.tpl`：`sub-app-page` + `sub-app-page-inner` + `$bp-sm` 下 padding 收紧
- `src/pages/home/index.tsx.tpl`：外层 `__NAME__-home` + 内层 `__NAME__-home__inner`

新建子应用后，新页面建议沿用 `*-page` / `*-page__inner` 命名与上述 mixin。

---

## 开发约定

1. **断点**：优先使用 `$bp-xs` / `$bp-sm`，勿在各 app 内硬编码 `720px`、`768px` 等魔法数字
2. **布局**：多列优先 `grid` + `auto-fill` / `auto-fit` + `minmax()`；确需跳变时用 `respond-down`
3. **flex 子项**：长文本、Markdown、气泡等容器加 `min-width: 0`，防止撑出可视区
4. **主壳改动**：导航级交互用 Ant Design TSX；内容区样式用 SCSS
5. **未采用**：整页 `vw/rem` 缩放（postcss-px-to-viewport）、全站 Tailwind 替代 SCSS

---

## 本地验证

1. 启动：`pnpm dev`，浏览器访问 `http://localhost:9000`
2. DevTools 设备模式：375px（iPhone SE）、390px（iPhone 14）、768px（iPad）
3. 重点检查：
   - 主壳 Drawer 能否打开并跳转各子应用
   - agent 对话区滚动 + 底部输入是否固定
   - blog / resume 长文是否可读、无横向溢出
   - utils 表格是否出现横向滚动而非撑破页面

---

## 相关文档

| 文档 | 说明 |
| --- | --- |
| [packages/style-config/README.md](../packages/style-config/README.md) | SCSS 变量、mixin、主题与 qiankun 高度约定 |
| [local-dev-whistle-qiankun.md](./local-dev-whistle-qiankun.md) | 本地联调与端口 |
| [packages/micro-app-cli/README.md](../packages/micro-app-cli/README.md) | 子应用 create / sync |
