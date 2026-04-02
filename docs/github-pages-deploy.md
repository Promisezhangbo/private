# GitHub Pages 部署说明

本文描述本仓库通过 **GitHub Actions** 将微前端整站发布到 **GitHub Pages** 的完整流程、相关脚本与常见注意点。

## 前置条件

- 仓库 **Settings → Pages**：Source 指向 **GitHub Actions**(或由 `peaceiris/actions-gh-pages` 写入的 `gh-pages` 分支，与当前工作流配置一致即可)。
- 工作流文件位于默认分支时，才能在 **Actions** 里看到 **Run workflow** 手动触发入口。
- 本地与 CI 均使用 **pnpm**(版本与工作流中 `pnpm/action-setup` 保持一致，当前为 `10.13.1`)。

## 如何触发部署

1. 打开 GitHub 仓库 → **Actions** → 选择工作流 **「GitHub 部署」**(文件：`.github/workflows/deploy.yml`)。
2. **Run workflow** 填写参数：
   - **branch**：要检出并构建的分支（须已推送到远端）。
   - **scope**：**下拉选择**（选项来自 `deploy.yml` 中的静态列表；内容由脚本根据 `apps/*` 生成，见下节）。
     - **`all`**：构建 `apps/*` 全部子应用，等价于本地 `pnpm run build` + `pnpm run postbuild`。
     - **某一子应用**：仅构建并（合并后）更新该应用对应目录。

### 为何不能「运行时再拉子应用列表」？

GitHub Actions 在展示 **Run workflow** 表单时**不会执行**仓库里的脚本；`workflow_dispatch` 的 `choice.options` **必须是提交在 YAML 里的固定列表**。因此采用脚本维护 `deploy.yml` 中 **`# deploy-workflow-options:begin`**～**`end`** 之间的列表。

**`deploy.yml` 里的下拉列表**由 **`pnpm run deploy:sync-workflow-options`**（脚本 `sync_deploy_workflow_options.mjs`）写入 `# deploy-workflow-options:begin`～`end` 之间；有变化才写文件，无变化则很快退出。

**本地与提交**：根目录 **`.husky/pre-commit`** 会执行 **`pnpm -w lint-staged`**。**`.lintstagedrc.mjs`** 约定：当本次提交**暂存区**包含 **`apps/**/package.json`** 或 **`scripts/deploy/sync_deploy_workflow_options.mjs`** 时，会跑 **`pnpm deploy:sync-workflow-options`**，与手动执行相同。lint-staged 通常会把脚本改动的 **`deploy.yml`** 一并重新暂存；若你发现它未进提交，请手动 **`git add .github/workflows/deploy.yml`**。

**仍须把 `deploy.yml` 提交并推送**，GitHub 上「Run workflow」的下拉才会更新；CI 里单独跑构建**不会**把变更推回仓库。

**其它情况**（例如只改了文档、却需要与 `apps/*` 对齐下拉）：请手动执行一次 **`pnpm run deploy:sync-workflow-options`**。单应用 **`pnpm --filter <app> build`** 也不会更新 `deploy.yml`。

## 工作流步骤总览

| 顺序 | 步骤                  | 说明                                                                          |
| ---- | --------------------- | ----------------------------------------------------------------------------- |
| 1    | Checkout              | 拉取指定 `branch`，`fetch-depth: 0` 便于读取 `gh-pages` 历史。                |
| 2    | Setup pnpm / Node     | 安装 pnpm 与 Node 20，并启用 pnpm 缓存。                                      |
| 3    | Install               | `pnpm install`(当前为 `-no-frozen-lockfile`)。                                |
| 4    | Build(全量)           | `scope == all`：`pnpm run build`；step 注入 **`BUILD_BRANCH`**、**`DEPLOY_SCOPE`**；各应用 **`build`** 内 **`emit_deploy_tag_env.mjs`** 会校验 scope 并写入 **`.env.deploy.local`**。 |
| 5    | Post-build(全量)      | `scope == all`：`pnpm run postbuild`。                                        |
| 6    | Build(单应用)         | `scope != all`：`pnpm --filter <scope> build`（同上 env；非法 scope 在 emit 阶段失败）。 |
| 7    | Post-build(仅 main)   | `scope == main`：`postbuild`（根 `index.html` / `404.html` / `_redirects`）。 |
| 8    | 合并 gh-pages(单应用) | `scope != all`：`merge_app_dist_to_deploy.sh` 合并线上站点与本次子目录。      |
| 9    | Deploy                | `peaceiris/actions-gh-pages@v4` 发布 `./dist`。                               |

## 全量部署(scope = `all`)

1. **构建**：根目录 `package.json` 中 `build` 为  
   `rm -rf dist && turbo run build --filter=./apps/*`，各子应用 **`package.json` → `build`** 会先执行 **`emit_deploy_tag_env.mjs`**，再 `tsc` + `vite build`。产物落在 **`dist/<应用名>/`**。
2. **Post-build**(`scripts/postbuild.sh`)：
   - `dist/404.html` ← 复制 `dist/main/index.html`(静态托管刷新子路由时的回退页)。
   - `dist/index.html` ← 复制 `dist/main/index.html`(站点根入口)。
   - `dist/_redirects` ← Netlify 风格重写：`/*` → `/main/index.html` `200`(按托管平台是否支持而定)。

## 单应用部署(scope ≠ `all`)

适用于只更新某一个子应用、缩短 CI 时间的场景。

1. **构建**：仅 `pnpm --filter <scope> build`，产物在 **`dist/<scope>/`**；**`emit_deploy_tag_env.mjs`** 使用与 workflow 一致的 **`DEPLOY_SCOPE`** / **`BUILD_BRANCH`** 生成 tag 并打入该应用 bundle。
2. **Post-build**：仅当 **`scope == main`** 时执行 `postbuild`，以更新站点根 `index.html` / `404.html` / `_redirects`。
3. **合并**(`scripts/deploy/merge_app_dist_to_deploy.sh`)：与此前一致（拉取 gh-pages、rsync 子目录、必要时更新根入口）。

> **建议**：仓库从未发布过整站时，**第一次请使用 `all` 全量部署**，否则单应用合并时可能没有完整的其它子应用目录。

## 与本地命令对照

```bash
# 全量(与 CI scope=all 核心一致)
pnpm run build
pnpm run postbuild

# 单应用 skill（与 CI 类似；合并需自行执行脚本）
DEPLOY_SCOPE=skill BUILD_BRANCH=$(git branch --show-current) pnpm --filter skill build
bash scripts/deploy/merge_app_dist_to_deploy.sh skill
```

## 部署标签（`VITE_DEPLOY_TAG`）

- **生成与校验 scope**：**`scripts/deploy/emit_deploy_tag_env.mjs`**（根目录 **`pnpm run deploy:emit-tag-env`**）。当 **`DEPLOY_SCOPE`** 为子应用名时，须存在 **`apps/<name>/package.json`**，否则退出码 1。
- **写入**：仓库根 **`.env.deploy.local`**（已 **gitignore**），键为 **`VITE_DEPLOY_TAG`**（JSON 转义字符串）。
- **注入**：各应用 **`vite.config`** 通过 **`@packages/vite-build-utils/loadDeployEnv`** 读取该文件，并用 **`define`** 映射到 **`import.meta.env.VITE_DEPLOY_TAG`**。
- **打印**：各应用入口调用 **`@packages/vite-build-utils/logDeployTag`**；**`pnpm dev`** 若未先执行 emit，则无 tag（静默跳过）。
- **CI**：**`deploy.yml`** 在 Build 步骤上设置 **`BUILD_BRANCH`**、**`DEPLOY_SCOPE`**，与手动触发的分支、范围一致。

## 新增子应用时的清单

| 项                                      | 说明                                                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `apps/<新应用>/package.json`            | **`build`** 需以 **`emit_deploy_tag_env.mjs`** 开头（可复制现有子应用）；存在后即可参与 Turbo 全量构建。         |
| `apps/<新应用>/vite.config.ts`          | 与其它应用一致：`loadDeployEnv` + **`define: deployTagDefine()`**。                                              |
| `apps/<新应用>/src/main.tsx`            | 在 **`render`** 开头调用 **`logDeployTag(...)`**（样式字符串可选）。                                              |
| `emit_deploy_tag_env.mjs` 内 **`PRESETS`** | 若需要与控制台 emoji/标题一致，可为新应用增一项。                                                                |
| `pnpm run deploy:sync-workflow-options` | 新增子应用后运行并提交，更新 `deploy.yml` 中 `scope` 下拉选项。                                                  |
| Vite `base` / `outDir`                  | 生产环境应指向 **`/<新应用>/`** 等，与 GitHub Pages 路径一致。                                                   |
| 主应用 qiankun                          | 需在 **`apps/main`** 中注册微应用、菜单与路由等。                                                                |

## 相关文件索引

| 路径                                              | 作用                                                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `.github/workflows/deploy.yml`                    | GitHub Actions 部署工作流                                                                     |
| `.github/workflows/deploy-options-sync.yml`       | PR 时校验 scope.options 与 apps 是否一致                                                      |
| `scripts/deploy/emit_deploy_tag_env.mjs`          | 写入 `.env.deploy.local` / `VITE_DEPLOY_TAG`                                                  |
| `scripts/deploy/repo_apps.mjs`                    | 枚举 `apps/*` 子应用名                                                                        |
| `scripts/deploy/sync_deploy_workflow_options.mjs` | 生成/校验 deploy 下拉的 options 列表                                                        |
| `packages/vite-build-utils/loadDeployEnv.mjs`     | 读取 `.env.deploy.local` 并生成 Vite `define`                                                 |
| `packages/vite-build-utils/logDeployTag.ts`       | 运行时打印 tag                                                                                |
| `.lintstagedrc.mjs` / `.husky/pre-commit`         | 提交前 lint-staged；相关路径变更时同步 **deploy.yml**                                         |
| `scripts/postbuild.sh`                            | 全量/ main 单应用后的根入口与 `_redirects`                                                    |
| `scripts/deploy/merge_app_dist_to_deploy.sh`      | 单应用部署时合并 gh-pages                                                                     |
| `package.json` → `build` / `postbuild`            | 全量构建与后处理入口                                                                          |

## 并发与权限

- **`concurrency.group: pages-deploy`**：避免多次部署互相踩踏(`cancel-in-progress: false` 表示排队执行而非取消)。
- **`permissions: contents: write`**：允许 `GITHUB_TOKEN` 推送 gh-pages(由 action 使用)。

## 另见

- [Netlify 部署说明](./netlify-deploy.md)：使用 Netlify 托管同一 `dist` 产物时的配置与注意点。
