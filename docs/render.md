## Render（免费层）Docker 部署指南（适配本仓库）

适用场景：你希望把本仓库某个子应用（`apps/*`）以 **Docker** 方式部署到 Render（Free），通过 Git 推送自动构建上线，并用 Render 分配的公网域名访问。

> 本仓库是 monorepo，建议先选一个子应用（例如 `main`）跑通，再复制到其它服务/仓库。

---

## 关键结论（先记住）

- **Render Web Service 会通过环境变量 `PORT` 指定监听端口**，容器内服务必须监听 `0.0.0.0:$PORT`。
- 你要部署的是前端静态产物时，最稳妥方式是：**构建阶段产出 `dist/<app>/` → 运行阶段用 nginx 托管**。
- 由于本仓库根目录默认 `pnpm build` 会构建多个 app，部署时建议**只构建一个 app**（降低时间与资源消耗）。

---

## 前置准备

- 一个 Render 账号（已绑定 GitHub/GitLab 仓库访问权限）。
- 确认要部署的子应用名：例如 `main`/`blog`/`resume`/`login`/`agent`/`skill`。
- 默认假设仓库构建产物在根目录：`dist/<app>/`（与 `docs/huggingface-space.md` 的假设一致）。

---

## 推荐方式：在仓库根目录增加 2 个文件（Render 直接用 Docker 构建）

需要你在仓库根目录新增：

- `Dockerfile`
- `nginx.conf.template`

下面是模板（默认部署 `apps/main`）。如果你要部署其它 app，只需要改一个参数（见后文）。

### `Dockerfile`（放仓库根目录）

```dockerfile
# -------- build stage --------
FROM node:20-bookworm-slim AS builder

WORKDIR /repo

# 安装 pnpm（与仓库 packageManager 对齐）
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# 先拷贝依赖元信息，利于缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# monorepo 内容
COPY apps ./apps
COPY packages ./packages
COPY api ./api

RUN pnpm install --frozen-lockfile

# 只构建一个 app（默认 main，可在 Render 里用 APP 覆盖）
ARG APP=main
ENV APP=$APP
RUN pnpm --filter ${APP} build

# -------- runtime stage --------
FROM nginx:alpine

# 用模板生成最终 nginx 配置（把 Render 注入的 PORT 写进去）
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# 拷贝构建产物
ARG APP=main
ENV APP=$APP
COPY --from=builder /repo/dist/${APP} /usr/share/nginx/html

# Render 会注入 PORT；这里用 envsubst 替换模板里的 ${PORT}
CMD ["/bin/sh", "-c", "envsubst '$$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
```

### `nginx.conf.template`（放仓库根目录）

```nginx
server {
  listen ${PORT};
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  # SPA fallback（前端路由刷新不 404）
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## Render 控制台操作步骤（Web Service + Docker）

### Step 1：创建 Web Service

在 Render 控制台选择：

- **New** → **Web Service**
- 选择你的代码仓库
- **Environment**：选择 **Docker**
- **Branch**：选择要部署的分支（通常 `main`）
- **Instance Type**：选择 **Free**

### Step 2：设置要部署哪个 app（可选，但强烈建议）

Render 的 Docker 构建可以传入 build args。建议在 Render 的设置里添加：

- **Build Arg**：`APP=main`

如果要部署 `blog`，改为：

- **Build Arg**：`APP=blog`

> 这样你可以在同一个仓库里复用一份 `Dockerfile`，分别创建多个 Render Service 来部署不同子应用。

### Step 3：部署与访问

- 保存后 Render 会自动开始 build & deploy
- 成功后会给一个公网域名（例如 `https://xxx.onrender.com`），直接访问即可

---

## 常见问题排查

### 1）部署成功但访问 502 / 无法访问

- 重点检查容器是否监听了 Render 注入的端口：
  - nginx 配置必须 `listen ${PORT};`
  - 容器必须监听 `0.0.0.0`（nginx 默认符合）

### 2）页面打开了，但刷新路由 404

- 确认 `nginx.conf.template` 含：
  - `try_files $uri $uri/ /index.html;`

### 3）构建失败：找不到 `dist/<app>`

- 确认该 app 的 `build` 会输出到仓库根 `dist/<app>/`
- 如果你的 app 输出目录不同，需要同步调整 Dockerfile 中：
  - `COPY --from=builder /repo/dist/${APP} /usr/share/nginx/html`

### 4）构建很慢 / 触发超时

- 优先确保只构建一个 app（使用 `APP=<name>` 的方式）
- 尽量不要在 Docker build 里跑不必要的全量任务（例如全仓 lint/typecheck）

---

## 何时不需要 Docker（可选建议）

如果你只是部署静态前端，并且 Render 的 **Static Site** 能满足需求（不需要自定义运行时/反代/复杂启动），那会更简单；但本仓库是 monorepo，Static Site 的构建/产物路径管理可能需要额外配置。当前文档以 **Docker Web Service** 为主线。

