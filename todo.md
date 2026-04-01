## Turborepo 接入改造步骤（当前仓库）

### 目标

- 用 Turbo 做任务调度与缓存，让 `openapi generate` 在 **api/\*.yaml / 模板没变化时不再重复执行**，并保证 apps 的 `dev/build/typecheck` 依赖顺序正确。

### Step 0：准备与约定

- [ ] 确认本仓库用 `pnpm` workspace（已是）。
- [ ] 生成产物目录约定：`packages/openapi/gen/**`（已是）。
- [ ] 确认 `packages/openapi/gen/` 已被忽略提交（已在 `packages/openapi/.gitignore`）。

### Step 1：安装 Turbo

- [ ] 根目录添加 devDependency：`turbo`
  - `pnpm add -D turbo -w`

### Step 2：新增 Turbo 配置

- [ ] 根目录新增 `turbo.json`
  - pipeline 至少包含：`generate`、`typecheck`、`lint`、`build`、`dev`
  - 为 `@packages/openapi` 的 `generate` 配置 inputs/outputs（关键）：
    - inputs（建议）：`api/**/*.yaml`、`packages/openapi/scripts/**`、`packages/openapi/src/**`
    - outputs（必须）：`packages/openapi/gen/**`
  - `dev` 一般不缓存：`cache: false`（或只缓存 `generate/typecheck/build`）

### Step 3：改造脚本为 Turbo 调度

- [ ] 根 `package.json`：
  - [ ] 删除/替换 `predev` 与 `prebuild`（目前强制执行 `pnpm --filter @packages/openapi run generate`）
  - [ ] 将 `dev/build/lint` 改为 turbo：
    - 例：`dev`: `turbo run dev --parallel`
    - 例：`build`: `turbo run build`
    - 例：`lint`: `turbo run lint`
    - 例：`typecheck`: `turbo run typecheck`
  - [ ] 支持“只启动部分 app”（可选启动哪些子应用）
    - 例：只启动 resume：`turbo run dev --filter=resume`
    - 例：只启动 main + resume：`turbo run dev --filter=main --filter=resume`
    - 例：按目录过滤：`turbo run dev --filter=./apps/resume`
    - 例：包含依赖一起跑（常用）：`turbo run dev --filter=resume...`
      - 说明：`...` 会把依赖链（如 `@packages/openapi#generate`）一起带上
    - 例：排除某个 app：`turbo run dev --filter=!blog`

### Step 4：补齐各 package/app 的 scripts（Turbo 依赖它们存在）

- [ ] `packages/openapi/package.json`：确保有
  - [ ] `generate`: `node ./scripts/generate.mjs`
  - [ ] `typecheck`: `tsc -p tsconfig.json --noEmit`
- [ ] `apps/*/package.json`：确保有（如缺就补）
  - [ ] `dev` / `build` / `lint` / `typecheck`（或至少 `dev/build`）

### Step 5：声明任务依赖关系（让 apps 自动依赖 openapi 生成）

- [ ] 在 `turbo.json` 里配置：
  - [ ] apps 的 `dev/build/typecheck` 依赖 `^generate` 或显式依赖 `@packages/openapi#generate`
  - [ ] `build` 依赖 `^build`（按 monorepo 常规）

### Step 6：验证（本地）

- [ ] 首次运行：`pnpm dev`
  - 预期：Turbo 会先跑 `@packages/openapi#generate`（生成 `packages/openapi/gen/**`），再跑各 app dev
- [ ] 第二次运行（无改动）：`pnpm dev`
  - 预期：`openapi generate` 被 Turbo cache 命中而跳过（命令输出显示 cache hit）
- [ ] 修改 `api/blog.yaml` 后再跑：
  - 预期：仅 `@packages/openapi#generate` 重新执行，其他不相关任务尽量命中缓存

### Step 7：CI（可选但推荐）

- [ ] CI 中启用 Turbo remote cache（如需要跨机器复用缓存）
- [ ] 缓存目录：`.turbo/` 与 pnpm store（按 CI 平台配置）

### Step 8：是否保留脚本内缓存（可选）

- [ ] 目前 `packages/openapi/scripts/generate.mjs` 已实现 `.cache.json` 轻量缓存
  - [ ] 上 Turbo 后可先保留（双保险）
  - [ ] 稳定后可移除脚本内缓存，统一由 Turbo 管理（可降低维护成本）

# 待办

1. eslint 抽离配置 ==> 改用 oxlint ✅
2. ts 抽离配置 ✅
3. prettier 保存自动格式化 ==> 改用 oxfmt ✅
4. build及dev tubor
5. git 格式化 ✅
6. 基础页面搭建 ✅
7. 打包成docker 镜像
8. 各个子应用可以单独打包、单独部署 ✅
9. github Actions 配置 ✅
10. k8s 集群上线
11. tubor 化
12. 公共types抽包 ✅
13. 后端接口类型生成 ✅
14. 部署到github、netlify （现在是整体部署） ✅
15. 样式优化，可以使用less或sass ✅
16. 所有模块内容调整
    - main
    - login
    - resume
    - skill
    - blog
    - agent
