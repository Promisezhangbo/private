import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "dist",
    "node_modules",
    "**/commitlint.config.js", // 忽略所有目录下的 commitlint 配置
    "**/eslint.config.js", // 忽略所有目录下的 eslint 配置
    "packages/*/eslint-config.js", // 忽略公共包内的 eslint 配置
    "packages/prettier-config/*.js" // 忽略公共包内的 eslint 配置
  ]),
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettierConfig
    ],

    plugins: { prettier: prettierPlugin },

    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        allowDefaultProject: true
      }
    },
    rules: {
      "arrow-parens": ["off"],
      "prettier/prettier": [
        "error",
        {
          arrowParens: "always" // 这里也可配置，和.prettierrc保持一致
        }
      ],
      // quotes: "error",
      // "no-console": "off",
      // semi: "error",
      // "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
]);
