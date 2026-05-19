# @packages/micro-app-cli

微前端子应用脚手架：在 monorepo 中通过命令行 **创建** / **删除** 子应用，并自动同步 qiankun 注册、主应用菜单、SEO、控制台首页子应用表与 GitHub Actions 部署下拉选项。

## 模板与 TypeScript

`templates/` 内带占位符的源码使用 **`.ts.tpl` / `.tsx.tpl` / `.scss.tpl`** 等后缀，避免 TypeScript / Stylelint 把 `__NAME__` 当真实标识符检查；脚手架 `create` 时会去掉 `.tpl` 并写入 `apps/<name>/`。`tsconfig.scaffold.json` 同理，复制为 `tsconfig.json`。

根目录 `tsconfig.json` 的 `exclude` 无法屏蔽 `templates/`：根工程只 `include` 了 `scripts/**/*.js`。若模板仍是 `.tsx`，打开文件时会变成「无工程归属」的孤立文件，仍会报找不到 `react` 等模块。

## 数据源

`micro-apps.registry.json` 为子应用元数据唯一来源；`pnpm micro-app:sync` 会据此生成：

- `apps/main/src/utils/microAppsDev.ts`
- `apps/main/src/generated/micro-app-shell.generated.ts`
- `apps/main/src/pages/home/microApps.generated.ts`
- `packages/seo/src/micro-app-seo.generated.ts`

## 命令

在仓库根目录执行：

```bash
# 交互输入子应用名称（小写字母开头，可含数字与连字符）
pnpm micro-app:create

# 可选：直接传名称
pnpm micro-app:create my-demo

# 交互选择要删除的子应用（不可删 main）
pnpm micro-app:remove

# 仅根据 registry 重新生成上述文件并刷新 deploy.yml
pnpm micro-app:sync
```

创建后会：

1. 在 `apps/<name>/` 生成与现有子应用对齐的 Vite + qiankun + React Router 工程（含 `/name/home` 占位页）
2. 分配下一可用 dev 端口（当前最大端口 + 1）
3. 更新 registry 并执行 sync + `deploy:sync-workflow-options`
4. 提示在仓库根目录执行 `pnpm install`

## 命名规则

- 须匹配 `^[a-z][a-z0-9-]*$`
- 保留名：`main`、`packages`、`backend` 等

## 手动调整 registry

编辑 `micro-apps.registry.json` 后执行 `pnpm micro-app:sync`。常用字段：

| 字段 | 说明 |
|------|------|
| `menuOrder` | 主应用顶栏顺序（数字越小越靠前） |
| `entryPath` | `home` → `/app/home`；`list` → `/app/list`；`root` → `/app` |
| `blogSurface` | 是否在主壳使用 Blog 底纹 |
