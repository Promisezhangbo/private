## Turborepo 使用文档（当前仓库）

本仓库使用 **Turborepo** 做 monorepo 任务调度与缓存，核心目标是：

- **把 OpenAPI 生成变成标准任务**（`@packages/openapi#generate`），并且在 `api/*.yaml` 和模板无变化时 **命中缓存跳过**。
- 确保各子应用的 `dev/build/typecheck` 在需要时 **自动等待生成任务完成**（避免“类型找不到/生成文件缺失”）。

---

## 你会用到的命令

### 常用

- **启动开发（交互式选择 apps）**：

```bash
pnpm dev
```

- **构建全部 apps**：

```bash
pnpm build
```

- **类型检查 / Lint**：

```bash
pnpm typecheck
pnpm lint
```

- **仅执行 OpenAPI 生成**：

```bash
pnpm generate
```

### 只跑部分应用（Turbo filter）

> 适合你只想启动某个子应用，或者只构建某一部分包/应用。

- **只跑一个 app**（示例：resume）：

```bash
pnpm exec turbo run dev --filter=resume
```

- **跑多个 app**（示例：main + resume）：

```bash
pnpm exec turbo run dev --filter=main --filter=resume
```

- **按目录过滤**：

```bash
pnpm exec turbo run dev --filter=./apps/resume
```

- **包含依赖一起跑**（常用：带上依赖链上的包任务）：

```bash
pnpm exec turbo run dev --filter=resume...
```

- **排除某个 app**：

```bash
pnpm exec turbo run dev --filter=!blog
```

---

## 任务与依赖关系（约定）

### 任务列表（pipeline）

本仓库的 Turbo pipeline 主要包含：

- `generate`
- `typecheck`
- `lint`
- `build`
- `dev`

### OpenAPI 生成任务（关键）

`@packages/openapi#generate` 的职责是把 `api/*.yaml` 生成到：

- `packages/openapi/gen/**`

并在没有变化时尽量走缓存（Turbo cache 命中或脚本内缓存命中）。

### 本仓库 Turbo 配置要点（与 `turbo.json` 对齐）

- **全局依赖（globalDependencies）**：将 `api/**/*.yaml`、`packages/openapi/scripts/**`、`packages/openapi/src/**` 作为全局输入，确保任何应用任务在这些内容变化时，缓存能正确失效。
- **dev 不缓存**：`dev.cache=false` 且 `dev.persistent=true`，避免错误复用 dev 产物。

---

## 缓存生效的前提与验证方式

### 生成任务缓存（OpenAPI）

当下面输入未变化时，`generate` 应该不重复执行：

- `api/**/*.yaml`
- `packages/openapi/scripts/**`
- `packages/openapi/src/**`（如果它是 generate 的输入）

生成输出（outputs）通常至少包含：

- `packages/openapi/gen/**`

### 本地验证步骤

- **首次运行**：

```bash
pnpm dev
```

预期：会先执行 `@packages/openapi#generate`，再启动各 app 的 dev。

- **第二次运行（无改动）**：

```bash
pnpm dev
```

预期：生成任务命中缓存（Turbo 输出会显示 cache hit；或脚本打印“使用缓存”之类的信息）。

- **修改某个 YAML 后再跑**：
  - 预期：只会重新执行 `@packages/openapi#generate`，其他不相关任务尽量命中缓存。

---

## 接入/调整 Turbo 时的检查清单（维护用）

当你新增 app / 新增 package / 或者调整脚本后，建议检查：

- **根 `turbo.json`**
  - `generate` 的 `inputs/outputs` 是否覆盖正确
  - `build.outputs` 是否覆盖到根 `dist/**`（如果 build 产物在根目录）
  - `dev` 是否设置为不缓存（通常 `cache: false`）
- **各 workspace 的 `package.json`**
  - apps：是否有 `dev/build/lint/typecheck`（至少 `dev/build`）
  - `@packages/openapi`：是否有 `generate` 和（可选）`typecheck`
- **生成产物忽略**
  - `packages/openapi/gen/` 是否被忽略提交（`.gitignore`）

---

## FAQ

### 为什么我 `pnpm dev` 每次都会跑 generate？

通常只有以下几类原因：

- **inputs 变了**：比如你改了 `api/*.yaml`、`packages/openapi/scripts/**`、或模板文件。
- **outputs 没声明/没产出**：Turbo 找不到输出文件会导致缓存无法命中。
- **gen 目录被清理**：例如你手动删除 `packages/openapi/gen/`，则必须重新生成。

### 需要同时保留“脚本内缓存”和 Turbo cache 吗？

可以先保留作为“双保险”（尤其是 generate 本身就很重时）。当你确认 Turbo inputs/outputs 稳定可控后，再决定是否移除脚本内缓存以降低维护成本。

