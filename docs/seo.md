# SEO 说明（张博 / zhangbo）

本文说明本仓库中与搜索引擎、社交分享相关的配置方式与代码位置。对外品牌文案统一为中文 **「张博」**，英文检索与账号类场景可并列 **「zhangbo」**（见各页 `keywords`）。

## 目标与范围

- **主应用**（`apps/main`）与各 **子应用**（`agent`、`blog`、`login`、`skill`、`resume`）在首屏 HTML 与 SPA 路由切换后，尽量提供一致的 `title`、`description`、Open Graph、Twitter Card 与规范链接（`canonical`）。
- **登录子应用** 使用 `noindex, nofollow`，避免登录页进入公开索引、稀释其他页面权重。

本方案面向 **浏览器内可执行的 SPA**：部分爬虫若不执行 JavaScript，仅能读到各应用构建产物中的 `index.html` 静态片段；执行 JS 后由运行时逻辑补全 `og:url` 等与当前 URL 一致的字段。

## 架构概要

| 层级 | 作用 |
| --- | --- |
| 各应用 `index.html` | 首屏与无 JS 场景下的默认 `title`、`meta`、`theme-color`、基础 OG/Twitter。 |
| `@packages/seo` | 运行时 `applyDocumentSeo`：写入/更新宿主 `document` 的元数据与 `link[rel=canonical]`。 |
| 主应用布局 | 访问 `/home` 时应用 `appSeoPresets.main`。 |
| 各子应用 `main.tsx` | 在 `render` 入口对 **当前文档** 调用 `applyDocumentSeo`，与 qiankun 嵌入时共用 **宿主页面** 的 `document`，保证嵌入主站时 SEO 仍指向真实访问 URL。 |

## 用法

### 在业务代码里怎么写

在任意已依赖 `@packages/seo` 的应用中：

```ts
import { applyDocumentSeo, appSeoPresets } from '@packages/seo';

// 使用内置预设（子应用 main.tsx 常用）
applyDocumentSeo(document, appSeoPresets.blog);

// 自定义一页的 title / 描述等（例如文章详情）
applyDocumentSeo(document, {
  title: '某篇文章标题 | 张博',
  description: '文章摘要……',
  keywords: 'zhangbo, 张博, React',
  pathname: '/blog/posts/foo', // 可选；省略则用当前 window.location.pathname
  robots: 'index, follow', // 可选；省略则默认为 index, follow
});
```

约定：`document` 在微前端嵌入场景下即为 **宿主页** 的 `document`（与地址栏 URL 一致），不要对子应用内 iframe 文档调用（本仓库未使用 iframe 挂载）。

### `applyDocumentSeo` 调用之后的运行流程（函数内部）

从一次 `applyDocumentSeo(doc, input)` 执行开始，**同步**完成下列步骤（无异步、无队列）：

1. **解析 URL 片段**：从 `doc.defaultView.location` 读取 `origin`；`pathname` 取 `input.pathname`，若未传则取当前页的 `location.pathname`，并规范为以 `/` 开头的路径。
2. **拼完整 URL**：`url = origin + pathname`（无 `origin` 时仅保留路径，用于极端环境）。
3. **文档语言**：`doc.documentElement.lang = 'zh-CN'`。
4. **窗口标题**：`doc.title = input.title`。
5. **标准 meta（按名）**：在 `doc.head` 中查找或创建对应 `<meta name="…">`，写入 `description`、`keywords`（若 `input.keywords` 有值）、`robots`（未传则 `index, follow`）。
6. **Open Graph**：查找或创建 `<meta property="og:*">`，依次写入 `og:title`、`og:description`、`og:url`（上一步的 `url`）、`og:type`（默认 `website`）、`og:locale`（`zh_CN`）。
7. **Twitter Card**：写入 `twitter:card`（当前固定为 `summary_large_image`）、`twitter:title`、`twitter:description`。
8. **规范链接**：查找或创建 `<link rel="canonical">`，`href` 设为第 2 步的 `url`。

以上对已有节点为 **就地更新 `content` / `href`**，没有则 **创建后追加到 `head` 末尾**。调用结束后，浏览器标签标题与开发者工具里看到的 `head` 内容立即与本次 `input` 一致；**不会**自动在路由离开时回滚标题（若需要回退，由路由或布局在 `useEffect` 清理函数里再次调用 `applyDocumentSeo` 写入目标页预设）。

### 与本仓库路由、qiankun 的配合顺序（谁何时调用）

- **主应用控制台 `/home`**：`Layouts` 中 `useEffect` 监听 `location.pathname`，当路径第一段为 `home` 时调用 `applyDocumentSeo(document, appSeoPresets.main)`。执行时机在 **该路径下布局提交到 DOM 之后**（`useEffect` 阶段），晚于首屏 paint；首屏仍依赖 `apps/main/index.html` 里的静态 meta。
- **进入子应用路径（如 `/agent/...`）**：主应用上述 effect **不会**写入 `main` 预设（避免与子应用抢写）。qiankun 拉子应用 bundle 并执行子应用 `mount` → `render()`，在 **`createRoot().render(...)` 之前** 已执行 `applyDocumentSeo(document, appSeoPresets.agent)`，因此子应用一旦开始渲染，宿主 `head` 即切换为 agent 文案。
- **从子应用切回 `/home`**：子应用 `unmount` 只卸载 React 树，**不**恢复 meta；随后主应用 `Layouts` 的 effect 因 pathname 变为 `home` 再次运行，重新写入 `appSeoPresets.main`。
- **子应用独立打开（非 qiankun）**：仅执行该子应用 `main.tsx` 的 `render`，同样在渲染前调用对应预设，逻辑与嵌入时相同，只是 `document` 为该子应用自己的 HTML 文档。

## 代码与配置位置

- **共享逻辑与预设**：`packages/seo/src/index.ts`
  - `applyDocumentSeo(doc, input)`：`title`、`description`、`keywords`、`robots`、`og:*`、`twitter:*`、`canonical`，并设置 `html[lang=zh-CN]`。
  - `appSeoPresets`：主控制台与各子应用的默认中文标题、描述、关键词；`main` 预设含固定 `pathname: '/home'` 用于控制台首页的 canonical。
- **主应用**：`apps/main/src/layouts/index.tsx` 中在路径第一段为 `home` 时应用 `appSeoPresets.main`。
- **子应用**：各 `apps/<name>/src/main.tsx` 在渲染前调用对应 `appSeoPresets.<name>`。
- **静态兜底**：各 `apps/<name>/index.html`，与 `appSeoPresets` 文案保持同步，修改品牌或描述时需 **两处一起改**（或后续可抽生成脚本，当前为手动双写）。

## 品牌用词约定

- **页面标题**：功能名 + ` | 张博`（例如 `技术博客 | 张博`）；控制台首页为 `张博 工作台 | 控制台`。
- **关键词**：建议以 `zhangbo, 张博` 开头，后接业务词（便于中英文检索）。
- **描述**：自然语言中优先用「张博」指代站点主体；技术栈名词（pnpm、qiankun 等）保留英文原词即可。

## qiankun 与 `document`

子应用作为微前端挂载到主应用 `#sub-app` 时，仍使用 **顶层页面的 `document`**。因此子应用在 `render` 里调用 `applyDocumentSeo(document, …)` 会更新整站可见的 `title` 与 `meta`，与用户在地址栏看到的同源 URL 一致，有利于分享链接与爬虫（在可执行 JS 的前提下）抓取到正确 canonical。

## 登录页为何 `noindex`

登录与注册页通常不需要被公开搜索收录；预设与 `apps/login/index.html` 中均为 `noindex, nofollow`。若将来需要「可收录的说明页」，应使用独立路径与新预设，勿改登录页为 `index`。

## 如何按路由细化 SEO

默认预设只覆盖「应用级」首页感知的文案。若某子应用内有 **文章详情、独立落地页** 等，可在对应路由组件 `useEffect` 中再次调用 `applyDocumentSeo`，传入该页的 `title`、`description`，并传入准确 `pathname`（或与 `location.pathname` 一致而省略，由工具从当前地址推导）。

## 生产域名与绝对 URL

`canonical` 与 `og:url` 使用 `location.origin + pathname` 拼接。部署到固定域名时，只要用户通过该域名访问，生成的绝对链接即正确。若存在多域名镜像，需在网关或构建期选定 **规范域名**，并在运行时通过环境变量传入 `origin` 覆盖逻辑（当前仓库未实现，可按需在 `applyDocumentSeo` 中扩展可选 `canonicalBase`）。

## 局限与后续可做

- 纯 SPA 的收录深度依赖爬虫是否执行 JS；对要求极高的场景可考虑 SSR/预渲染或边缘 HTML 改写。
- 未默认提供 `sitemap.xml` / `robots.txt`；若站点对公网开放且希望整站收录策略可配置，可在静态资源或 CDN 层补充。

## 相关文档

- 微前端本地与线上域名联调：[`docs/local-dev-whistle-qiankun.md`](./local-dev-whistle-qiankun.md)
- 文档索引：[`docs/README.md`](./README.md)
