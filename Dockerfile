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