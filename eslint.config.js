import eslintConfig from '@packages/eslint-config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default [
  ...eslintConfig,
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
