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

**本地与提交**：根目录 **`.husky/pre-commit`** 会执行 **`pnpm -w lint-staged`**。**`.lintstagedrc.mjs`** 约定：当本次提交**暂存区**包含 **`apps/**/package.json`** 或 **`scripts/deploy/sync_deploy_workflow_options.mjs`** 时，会跑 **`pnpm deploy:sync-workflow-options`**，与手动执行相同。lint-staged 通常会把脚本改动的 **`deploy.yml`** 一并重新暂存；若你发现它未进提交，请手动 **`git add .github/workflows/deploy.yml`\*\*。

**仍须把 `deploy.yml` 提交并推送**，GitHub 上「Run workflow」的下拉才会更新；CI 里单独跑构建**不会**把变更推回仓库。

**其它情况**（例如只改了文档、却需要与 `apps/*` 对齐下拉）：请手动执行一次 **`pnpm run deploy:sync-workflow-options`**。单应用 **`pnpm --filter <app> build`** 也不会更新 `deploy.yml`。

## 工作流步骤总览

| 顺序 | 步骤                   | 说明                                                                          |
| ---- | ---------------------- | ----------------------------------------------------------------------------- |
| 1    | Checkout               | 拉取指定 `branch`，`fetch-depth: 0` 便于读取 `gh-pages` 历史。                |
| 2    | Setup pnpm / Node      | 安装 pnpm 与 Node 20，并启用 pnpm 缓存。                                      |
| 3    | Install                | `pnpm install`(当前为 `-no-frozen-lockfile`)。                                |
| 4    | Validate deploy scope  | `validate_deploy_scope.mjs`：校验 `all` 或 `apps/*` 合法目录名。              |
| 5    | Build(全量)            | `scope == all`：`pnpm run build`（清空 `dist` 并 Turbo 构建全部子应用）。     |
| 6    | Post-build(全量)       | `scope == all`：`pnpm run postbuild`。                                        |
| 7    | Build(单应用)          | `scope != all`：`pnpm --filter <scope> build`。                               |
| 8    | Post-build(仅 main)    | `scope == main`：`postbuild`（根 `index.html` / `404.html` / `_redirects`）。 |
| 9    | 合并 gh-pages(单应用)  | `scope != all`：`merge_app_dist_to_deploy.sh` 合并线上站点与本次子目录。      |
| 10   | Generate deploy banner | `build_tag_info.js` 写入 `deploy-success.js`。                                |
| 11   | Verify dist            | 打印 `dist` 目录列表。                                                        |
| 12   | Deploy                 | `peaceiris/actions-gh-pages@v4` 发布 `./dist`。                               |

## 全量部署(scope = `all`)

1. **构建**：根目录 `package.json` 中 `build` 为  
   `rm -rf dist && turbo run build --filter=./apps/*`，各子应用产物落在仓库根下 **`dist/<应用名>/`**(与各应用 Vite `outDir` 配置一致)。
2. **Post-build**(`scripts/postbuild.sh`)：
   - `dist/404.html` ← 复制 `dist/main/index.html`(静态托管刷新子路由时的回退页)。
   - `dist/index.html` ← 复制 `dist/main/index.html`(站点根入口)。
   - `dist/_redirects` ← Netlify 风格重写：`/*` → `/main/index.html` `200`(按托管平台是否支持而定)。
3. **deploy-success.js**：由 `build_tag_info.js` 为 **`dist` 下存在的每个子应用目录** 生成 `dist/<app>/deploy-success.js`，并生成根目录 **`dist/deploy-success.js`**(供主应用 `index.html` 中 `/deploy-success.js` 引用)。同一次运行内时间戳一致。

## 单应用部署(scope ≠ `all`)

适用于只更新某一个子应用、缩短 CI 时间的场景。

1. **构建**：仅 `pnpm --filter <scope> build`，产物在 **`dist/<scope>/`**。
2. **Post-build**：仅当 **`scope == main`** 时执行 `postbuild`，以更新站点根 `index.html` / `404.html` / `_redirects`。
3. **合并**(`scripts/deploy/merge_app_dist_to_deploy.sh`)：
   - `git fetch` 远端 **`gh-pages`**，将当前线上站点内容解压到临时目录。
   - 用 **`rsync --delete`** 将本次 **`dist/<scope>/`** 覆盖到临时目录中的 **`<scope>/`**。
   - 若 **`scope == main`**，同时用本次 main 的 `index.html` 更新临时目录根部的 `index.html`、`404.html`，并复制 `dist/_redirects`(若存在)。
   - 删除原 **`dist`**，将临时目录重命名为 **`dist`**，得到「旧站 + 仅更新一个子应用」的完整发布目录。
4. **deploy-success.js**：`build_tag_info.js` **只重写**：
   - **`dist/<scope>/deploy-success.js`**
   - 若 **`scope == main`**，另写 **`dist/deploy-success.js`**  
     其它子应用目录中的 `deploy-success.js` **保持合并自 gh-pages 的旧文件**，因此**不会出现「只部署 skill 却把所有应用的部署时间都改成 skill 的时间」**。

> **建议**：仓库从未发布过整站时，**第一次请使用 `all` 全量部署**，否则单应用合并时可能没有完整的其它子应用目录。

## 与本地命令对照

```bash
# 全量(与 CI scope=all 核心一致)
pnpm run build
pnpm run postbuild
node scripts/deploy/build_tag_info.js all
# 再视需要将 dist 推到托管

# 单应用 skill(构建后需自行合并逻辑时，与 CI 类似)
pnpm --filter skill build
bash scripts/deploy/merge_app_dist_to_deploy.sh skill
BUILD_BRANCH=$(git branch --show-current) node scripts/deploy/build_tag_info.js skill
```

校验 scope(可选)：

```bash
node scripts/deploy/validate_deploy_scope.mjs all
node scripts/deploy/validate_deploy_scope.mjs login
```

## 部署标签 `deploy-success.js`

- 脚本：**`scripts/deploy/build_tag_info.js`**
- 环境变量：**`BUILD_BRANCH`**(工作流传入当前检出分支名)，可选。
- 各子应用展示样式、文案在脚本内 **`TAG_PRESETS`** 中配置；新增应用可增一项，未配置则走 **`default`**。
- **根路径** `dist/deploy-success.js`：主应用 `index.html` 通过 **`/deploy-success.js`** 引用。
- **子应用路径** `dist/<app>/deploy-success.js`：若需在单独打开子应用时也打印，需在对应 **`apps/<app>/index.html`** 中增加引用(例如 `./deploy-success.js`)；未引用则仅全站访问主应用时会执行根脚本。

## 新增子应用时的清单

| 项                                      | 说明                                                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `apps/<新应用>/package.json`            | 存在后即可参与 Turbo 全量 `pnpm run build`；`validate_deploy_scope` 亦会校验目录名。                             |
| `pnpm run deploy:sync-workflow-options` | 新增子应用后运行并提交，更新 `deploy.yml` 中 `scope` 下拉选项（勿手改 `# deploy-workflow-options:*` 之间内容）。 |
| Vite `base` / `outDir`                  | 生产环境应指向 **`/<新应用>/`** 等，与 GitHub Pages 路径一致。                                                   |
| 主应用 qiankun                          | 需在 **`apps/main`** 中注册微应用（`registerMicroApps`）、菜单与路由等。                                         |
| `build_tag_info.js`                     | 若需要独立 tag 样式，在 **`TAG_PRESETS`** 中增加该应用名。                                                       |

## 相关文件索引

| 路径                                              | 作用                                                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `.github/workflows/deploy.yml`                    | GitHub Actions 部署工作流                                                                     |
| `.github/workflows/deploy-options-sync.yml`       | PR 时校验 scope.options 与 apps 是否一致                                                      |
| `scripts/deploy/repo_apps.mjs`                    | 枚举 `apps/*` 子应用名（部署脚本共用）                                                        |
| `scripts/deploy/sync_deploy_workflow_options.mjs` | 生成/校验 deploy 下拉的 options 列表                                                          |
| `.lintstagedrc.mjs` / `.husky/pre-commit`         | 提交前 lint-staged；子应用 `package.json` 或同步脚本变更时跑 **deploy:sync-workflow-options** |
| `scripts/postbuild.sh`                            | 全量/ main 单应用后的根入口与 `_redirects`                                                    |
| `scripts/deploy/validate_deploy_scope.mjs`        | 校验 `scope` 参数                                                                             |
| `scripts/deploy/merge_app_dist_to_deploy.sh`      | 单应用部署时合并 gh-pages                                                                     |
| `scripts/deploy/build_tag_info.js`                | 生成各 `deploy-success.js`                                                                    |
| `package.json` → `build` / `postbuild`            | 全量构建与后处理入口                                                                          |

## 并发与权限

- **`concurrency.group: pages-deploy`**：避免多次部署互相踩踏(`cancel-in-progress: false` 表示排队执行而非取消)。
- **`permissions: contents: write`**：允许 `GITHUB_TOKEN` 推送 gh-pages(由 action 使用)。

如有变更工作流行为(例如改用环境变量注入版本号)，优先在 **`build_tag_info.js`** 读取 `process.env` 并在 **`deploy.yml`** 的对应 step 中 `env:` 注入，无需改动各子应用 Vite 配置，除非要把信息打进业务 bundle。

## 另见

- [Netlify 部署说明](./netlify-deploy.md)：使用 Netlify 托管同一 `dist` 产物时的配置与注意点。
