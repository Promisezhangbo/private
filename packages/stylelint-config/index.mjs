/**
 * @type {import('stylelint').Config}
 * Standard SCSS；缩进/引号/分号等排版由 Prettier 负责（编辑器保存 + lint-staged）。
 * 未使用 stylelint-config-prettier：其 9.x 与 stylelint 16+ 不兼容（会报 Unknown rule）。
 */
export default {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: [
    '**/dist/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/*.min.css',
  ],
  rules: {
    'selector-class-pattern': null,
    'scss/load-no-partial-leading-underscore': null,
    /* 与现有设计 token / 渐变写法兼容 */
    'alpha-value-notation': null,
    'color-function-notation': null,
    'color-hex-length': null,
    'custom-property-empty-line-before': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'declaration-empty-line-before': null,
    /* mask / background-clip 等仍需 webkit 前缀 */
    'property-no-vendor-prefix': null,
  },
};
