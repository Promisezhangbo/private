# @packages/ts-config

Monorepo 内共用的 **TypeScript 编译选项**，按场景拆成多个 JSON，通过 `extends` 引用。

## 文件说明

| 文件 | 作用 |
|------|------|
| **`tsconfig.base.json`** | 公共基础：严格模式、`moduleResolution: bundler`、`verbatimModuleSyntax`、`noEmit` 等。**不要**直接给应用 `extends`（不含 `lib` / `types` / `jsx`），只作为其它预设的父配置。 |
| **`tsconfig.frontend.json`** | **前端（Vite / React）**：在 base 上增加 `lib`（ESNext + DOM）、`types: vite/client`、`jsx: react-jsx`。 |
| **`tsconfig.backend.json`** | **Deno / Fetch 系后端**：在 base 上增加 `lib`（ESNext + DOM）、`types: []`，避免默认注入 Node 类型；适合 Hono、标准 `Request`/`Response`。 |
| **`tsconfig.backend-node.json`** | **纯 Node 后端**：在 base 上使用 `lib: ESNext`、`types: node`、`module` / `moduleResolution: NodeNext`。 |

包入口 **`@packages/ts-config`**（`package.json` 的 `exports["."]`）与 **`@packages/ts-config/frontend`** 指向同一份 **`tsconfig.frontend.json`**，便于沿用 `"extends": "@packages/ts-config"` 的写法。

## 使用示例

**前端应用**（与原先一致）：

```json
{
  "extends": "@packages/ts-config",
  "compilerOptions": {
    "baseUrl": "."
  },
  "include": ["src"]
}
```

或显式写：

```json
{ "extends": "@packages/ts-config/frontend" }
```

**Deno / Fetch 后端**（例如 `backend/blog-server`）：

```json
{ "extends": "@packages/ts-config/backend", "include": ["src/**/*.ts"] }
```

**Node 后端**：

```json
{ "extends": "@packages/ts-config/backend-node", "include": ["src/**/*.ts"] }
```

需在对应包的 `devDependencies` 中声明 `@packages/ts-config`；使用 **`backend-node`** 时还应安装 **`@types/node`**。

## 其它

- **`common.d.ts`**：部分应用通过 `import '@packages/ts-config/common'` 引入的全局类型（如 Vite 环境变量），不是 `tsconfig` 预设的一部分。
