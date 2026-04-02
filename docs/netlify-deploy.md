# Netlify 部署说明

本文说明如何将本仓库（pnpm monorepo + 多子应用静态产物）部署到 **Netlify**。与 GitHub Pages 类似，**发布目录均为仓库根目录下的 `dist/`**，内含 `main`、`login`、`agent` 等子目录。

更通用的构建与微前端目录约定，可对照 [GitHub Pages 部署说明](./github-pages-deploy.md)。

## 仓库内已有配置

| 文件 | 作用 |
|------|------|
| `netlify.toml` | 声明构建命令、`publish = "dist"`、建议的 Node 版本 |
| `scripts/postbuild.sh` | 生成 `dist/index.html`、`dist/404.html`、`dist/_redirects`（Netlify 会读取发布目录中的 `_redirects`） |

当前 `postbuild` 写入的 `_redirects` 规则为：

```text
/*  /main/index.html  200
```

含义：未命中真实静态文件的路径，由 **主应用** `main` 的 `index.html` 以 **200** 承接（便于前端路由与 qiankun 壳层）。各子应用自身静态资源仍在 `dist/<app>/` 下，由 Netlify 按路径直接返回。

## 在 Netlify 控制台关联仓库

1. 登录 [Netlify](https://www.netlify.com/) → **Add new site** → **Import an existing project**，授权并选择本 Git 仓库。
2. **Build settings**（若已识别根目录 `netlify.toml`，多数会自动填好）：
   - **Base directory**：留空（仓库根）。
   - **Build command**：`pnpm run build && pnpm run postbuild`（与 `netlify.toml` 中一致）。
   - **Publish directory**：`dist`。
3. **Environment**（按需）：
   - Node：建议在站点 **Environment variables** 中设置 `NODE_VERSION=20`，或与 `netlify.toml` 里 `[build.environment]` 保持一致。
   - 使用 **pnpm**：仓库根 `package.json` 的 `packageManager` 字段可被 Netlify/Corepack 识别；若构建报错，可在 Netlify 环境变量中开启 `ENABLE_PNPM` 或按 Netlify 文档启用 corepack（以平台当前文档为准）。

保存后触发首次部署即可。

## 本地验证（可选）

与线上一致的最小验证：

```bash
pnpm install
pnpm run build
pnpm run postbuild
# 检查 dist 下是否有 main、login 等子目录及 dist/_redirects、dist/index.html
npx netlify-cli deploy --dir=dist --dry-run
```

或使用 CLI 本地起预览（需安装 `netlify-cli`）：

```bash
netlify dev
# 若项目未配置 dev 端口映射，可直接静态预览：
npx serve dist
```

## 与 GitHub Pages 的差异（概念）

| 项目 | Netlify | GitHub Pages（本仓库 Actions） |
|------|---------|----------------------------------|
| 触发方式 | 推送分支 / PR / 手动；支持 Deploy Preview | 当前为 **手动 workflow_dispatch** |
| 发布目录 | `dist` | 同上 |
| 重写规则 | `dist/_redirects` 或 `netlify.toml` 的 `[[redirects]]` | 主要依赖 `dist/_redirects`（postbuild 生成） |
| 单应用热更新 | 需自行在 CI 中实现「合并旧产物」类逻辑；Netlify 无内置等价 gh-pages 合并脚本 | 见 `merge_app_dist_to_deploy.sh` |

若仅在 Netlify 上做**全量发布**，每次推送执行 **`pnpm run build && pnpm run postbuild`** 即可，无需合并脚本。

## 部署预览（Deploy Previews）

对 Pull Request 开启 **Deploy Previews** 时，Netlify 会对该提交执行相同 **Build command**，生成独立预览 URL。注意：

- 预览环境的 **站点根 URL** 与生产不同，各子应用 Vite **`base`** 若为绝对路径 `/xxx/`，需确认是否要在「分支预览」下使用 Netlify 的 **Deploy Preview URL** 做覆盖（通常生产与预览共用同一 `base` 时，预览子路径下微前端可能需额外配置，视实际域名策略而定）。

## 环境变量与子应用

- 构建期：若某子应用需要 `VITE_*` 等变量，在 Netlify **Site configuration → Environment variables** 中为 **Production / Deploy previews** 等上下文分别配置。
- **不要在文档或仓库中提交密钥**；敏感项仅放在 Netlify 后台或受保护的 CI Secret 中。

## `deploy-success.js`（控制台部署信息）

全量构建并执行 `postbuild` 后，可在本地或 Netlify **Build command** 末尾增加一步（与 GitHub Actions 对齐）：

```bash
node scripts/deploy/build_tag_info.js all
```

若不需要在 Netlify 构建中打印浏览器控制台信息，可省略；详见 [GitHub Pages 部署说明](./github-pages-deploy.md) 中的「部署标签」一节。

## 常见问题

**构建报找不到 pnpm 或 lockfile 不一致**  
检查 Netlify 使用的 Node 版本、是否启用 corepack，以及 `pnpm install` 是否在 Netlify 的 install 阶段正确执行。

**刷新子路由 404**  
确认 **`pnpm run postbuild` 已执行**，且 `dist/_redirects` 已随 `dist` 一起发布；不要在 Netlify 里把 **Publish directory** 错设为 `dist/main` 单独目录（除非你有意只发布主应用）。

**子应用资源 404**  
确认各应用生产环境 **`base`** 与 Netlify 站点路径一致（例如子应用挂在 `https://xxx.netlify.app/login/` 时，`base` 应为 `/login/`）。

## 相关文件

- `netlify.toml` — Netlify 构建与发布配置  
- `scripts/postbuild.sh` — `_redirects`、根 `index.html` / `404.html`  
- `package.json` — `build`、`postbuild`  
- [github-pages-deploy.md](./github-pages-deploy.md) — GitHub Actions 与单应用合并部署流程  
