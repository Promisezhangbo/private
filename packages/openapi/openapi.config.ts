import { defineConfig } from 'openapi-axios-sdk/config';

/** 在 `packages/openapi` 下执行 `pnpm run generate` 时 cwd 为本目录，路径相对此处解析。 */
export default defineConfig({
  apiDir: '../../api',
  outDir: 'gen',
  gitignore: false,
  verbose: false,
});
