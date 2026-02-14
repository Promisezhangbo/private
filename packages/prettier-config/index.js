export default {
  // 基础规则
  printWidth: 120, // 单行最大字符数
  tabWidth: 2, // 缩进空格数
  useTabs: false, // 使用空格而非 tab
  singleQuote: false, // 单引号
  semi: true, // 句末加分号
  trailingComma: "none", // 尾逗号（ES5 兼容模式）
  bracketSpacing: true, // 对象字面量括号间加空格（{ a: 1 } 而非 {a:1}）
  arrowParens: "avoid", // 箭头函数单个参数省略括号
  endOfLine: "lf", // 换行符（LF，兼容 Linux/Mac）
  // React/JSX 规则
  jsxSingleQuote: true, // JSX 中使用单引号
  bracketSameLine: false, // JSX 标签闭合括号不换行
  // 忽略文件（可选，也可在子应用单独配置 .prettierignore）
  ignorePath: ".prettierignore"
};
