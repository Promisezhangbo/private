# private — Monorepo 说明

基于 **pnpm workspaces**、**Vite** 与 **qiankun** 的微前端仓库：主应用作为基座，多个子应用可独立开发，也可被统一挂载。

## 技术栈（摘要）

| 领域              | 选型                                                                             |
| ----------------- | -------------------------------------------------------------------------------- |
| 包管理 / Monorepo | pnpm workspaces                                                                  |
| 构建与开发        | Vite 8、TypeScript、React 19                                                     |
| 微前端            | qiankun、`vite-plugin-qiankun`                                                   |
| 静态检查          | 各应用内 **oxlint**（`.oxlintrc.json`）                                          |
| 格式化            | 根目录 **oxfmt**（与各应用 `oxfmt` 版本对齐使用）                                |
| 样式              | **Stylelint**（根 `stylelint.config.mjs` + `@packages/stylelint-config`）        |
| Git               | Husky：**pre-commit** 跑 lint-staged；**commit-msg** 跑 commitlint（约定式提交） |

## 环境要求

- **Node.js**：建议与 CI 一致，使用 **20**（见 `.github/workflows`）。
- **pnpm**：安装依赖与运行脚本均使用 pnpm（子包中部分 `package.json` 标注了推荐版本，可与之一致）。

## 快速开始

```bash
pnpm install

# 并行启动全部 apps/* 的 dev
pnpm dev

# 并行构建全部子应用，产物在仓库根 dist/
pnpm build
```

单个应用：

```bash
pnpm --filter main dev
# 或
cd apps/main && pnpm dev
```

## 仓库结构

```
/
├── apps/                      # 子应用（宿主 + 微应用）
│   ├── main/                  # 基座：路由、布局、qiankun 注册与全局状态
│   ├── agent/ blog/ login/    # 微应用示例
│   └── skill/                 # 微应用（示例 / 实验）
├── packages/                  #  workspace 共享包
│   ├── ts-config/             # @packages/ts-config — TS 基础配置
│   ├── style-config/          # @packages/style-config — 公共 SCSS 变量与主题
│   ├── stylelint-config/      # @packages/stylelint-config — Stylelint 预设
│   └── vite-build-utils/      # @packages/vite-build-utils — 构建分包等工具
├── dist/                      # 构建输出（根脚本 build + postbuild）
├── scripts/                   # 部署辅助脚本等
├── .github/workflows/         # CI（如 GitHub Pages 手动部署）
├── .husky/                    # Git hooks
├── .vscode/                   # 推荐扩展与编辑器默认格式化等
├── stylelint.config.mjs       # 根 Stylelint 入口
├── pnpm-workspace.yaml
└── package.json               # 根脚本、lint-staged、共享 devDependencies
```

## 根目录常用脚本

| 命令              | 说明                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `pnpm dev`        | 所有 `apps/*` 并行 `dev`                                                                  |
| `pnpm build`      | 所有 `apps/*` 并行 `build`，并清理后写入根 `dist/`                                        |
| `pnpm postbuild`  | 复制主应用 `index.html` 为根 `index.html` / `404.html`，生成 `_redirects`（适配静态托管） |
| `pnpm lint`       | 所有子应用并行执行各自的 `lint`（当前为 `oxlint --fix`）                                  |
| `pnpm lint:style` | 对仓库内 `css`/`scss` 执行 Stylelint 并尝试修复                                           |
| `pnpm format`     | 根目录执行 `oxfmt --fix`（建议在 monorepo 根运行）                                        |
| `pnpm reinit`     | 清理各包与根的 `node_modules` 与锁文件后重新 `pnpm install`（慎用）                       |

## 代码规范与 Git 钩子

- **Oxlint**：规则写在各应用的 `.oxlintrc.json`（按应用可不同）。提交前 lint-staged 会触发 `pnpm lint`。
- **Oxfmt**：格式化风格以各应用下的 `.oxfmtrc.json` 为准（若存在）；根 `pnpm format` 使用根安装的 oxfmt。注意：**oxfmt 的 `endOfLine` 需为 `lf` / `crlf` / `cr` 之一**，不支持 `auto`。
- **Stylelint**：校验/修复 CSS、SCSS；与格式化工具分工，避免重复冲突。
- **lint-staged**（见根 `package.json`）：对暂存区中的 `js/ts/tsx/vue`、`css/scss`、`json/md` 等执行上述检查。
- **commitlint**：提交信息需符合 [Conventional Commits](https://www.conventionalcommits.org/)（`@commitlint/config-conventional`）。若提交被拒，一般是**说明文案格式**问题，与某条 oxlint 规则无直接关系。

## 编辑器建议

推荐安装仓库 `.vscode/extensions.json` 中的扩展（当前推荐 **Oxc**、**Stylelint**）。工作区已配置对部分语言使用 **Oxc** 作为默认格式化器并 **保存时格式化**；若与终端 lint 结果不一致，可尝试重载窗口或重启 TS 服务。

修改 `packages/*` 后若子应用未感知，可执行 `pnpm install` 并重启编辑器/TS Server。

## qiankun 与联调

- 主应用在路由对应位置需提供子应用挂载容器（具体以 `apps/main` 内 qiankun 注册逻辑为准）。
- 各微应用在 `vite.config` 中通过 `vite-plugin-qiankun` 声明应用名；**本地 dev 端口须与主应用里配置的 entry 一致**，否则无法加载子应用。
- 常见问题：**Target container not existed** — 先确认容器 DOM 已渲染，再执行注册/挂载；必要时将注册时机延后到布局/路由就绪之后。

## 部署（GitHub Pages）

`.github/workflows` 中提供**手动触发**的部署流程：可选择构建全部子应用或仅构建某一个（选项以 workflow 文件为准；新增子应用后若需单独部署，需在 workflow 的 `scope` 中补充）。

---

若需把某一段落拆成「贡献者指南」或补充各 `apps/<name>` 的端口表，可在对应应用 README 或此处按需追加。
