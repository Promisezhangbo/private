import eslintConfig from '@packages/eslint-config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/** 根目录 scripts 为 Node ESM，与全局配置的 globals.browser 区分 */
const nodeScriptGlobals = {
  console: 'readonly',
  process: 'readonly',
  Buffer: 'readonly',
  __dirname: 'off',
  __filename: 'off',
};

export default [
  ...eslintConfig,
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: nodeScriptGlobals,
      parserOptions: {
        projectService: true,
        allowDefaultProject: ['tsconfig.json'],
        tsconfigRootDir: rootDir,
      },
    },
  },
  {
    files: ['packages/vite-build-utils/**/*.d.ts'],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: ['./packages/vite-build-utils/tsconfig.json'],
        tsconfigRootDir: rootDir,
      },
    },
  },
];
