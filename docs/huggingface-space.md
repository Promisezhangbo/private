## Hugging Face Docker Space 部署指南（适配本仓库）

适用场景：你本机无法安装 Docker，但希望把本仓库的某个子应用（`apps/*`）以 **容器方式**部署到 Hugging Face Spaces，并且通过 Git 提交触发自动构建与上线。

---

## 关键结论（先记住）

- **Docker Space 必须监听 `7860` 端口**，否则部署成功也访问不到服务。
- 本仓库是 monorepo，建议先选一个子应用（比如 `main`）跑通，再复制到其它 Space。

---

## 前置准备

- 已创建 Hugging Face Space（类型选择 **Docker**）。
- Space 仓库当前若提示 `No application file`，说明需要你提交应用文件（至少要有 `Dockerfile`）。
- 准备一个 Hugging Face Access Token（用于 git push），可在设置页生成：`https://huggingface.co/settings/tokens`
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
---

## 推荐流程（不需要本地 Docker）

### Step 1：进入 Space 的 Files 页面新增 2 个文件

打开你的 Space，例如：`https://huggingface.co/spaces/promisezhangbo/space` → `Files` → `Add file`。

在 Space 仓库根目录新增：

- `Dockerfile`
- `nginx.conf`

### Step 2：复制粘贴模板（先部署 `apps/main`）

> 说明：该模板会在构建阶段执行 `pnpm --filter main build`，并把产物 `dist/main` 用 nginx 托管出来。

#### `Dockerfile`

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

# 只构建一个 app（这里选 main；替换成 blog/resume/login/agent/skill 即可）
RUN pnpm --filter main build

# -------- runtime stage --------
FROM nginx:alpine

# nginx 监听 7860（HF 要求）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 本仓库构建产物：仓库根 dist/<app>/
COPY --from=builder /repo/dist/main /usr/share/nginx/html

EXPOSE 7860
CMD ["nginx", "-g", "daemon off;"]
```

#### `nginx.conf`

```nginx
server {
  listen 7860;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### Step 3：提交后等待构建完成

提交文件后 Spaces 会自动开始 Build：

- 成功：Space 页面会从 `Building` 变为 `Running`，直接访问页面即可。
- 失败：点击 Build logs，复制报错信息回来即可定位（通常是依赖安装/构建失败/路径不一致）。

---

## 切换部署其它子应用

把 `main` 换成你想部署的 app 名：

- `RUN pnpm --filter <app> build`
- `COPY --from=builder /repo/dist/<app> /usr/share/nginx/html`

例如部署 `blog`：

- `RUN pnpm --filter blog build`
- `COPY --from=builder /repo/dist/blog /usr/share/nginx/html`

---

## 常见问题排查

### 1）构建成功但页面打不开

- 检查 nginx 是否监听 **7860**
  - `nginx.conf` 必须是 `listen 7860;`

### 2）页面 404 / 路由刷新 404

- 确认 `nginx.conf` 含 SPA fallback：
  - `try_files $uri $uri/ /index.html;`

### 3）构建失败：找不到 dist/<app>

- 确认该 app 的 build 脚本会输出到仓库根 `dist/<app>/`
- 若你改过输出结构，需要同步调整 Dockerfile 的 `COPY --from=builder ...` 路径

### 4）依赖安装失败

- 优先看日志里是网络问题还是 lockfile 不一致
- 如遇到 pnpm 版本问题，确保 Dockerfile 的 pnpm 版本与根 `packageManager` 一致

