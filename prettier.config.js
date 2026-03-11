/** @type {import("prettier").Config} */
export default {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',

  // ⬇️ 新增：对象属性引号策略
  quoteProps: 'as-needed', // 仅在需要时添加引号

  // ⬇️ 新增：JSX 闭合标签位置
  bracketSameLine: false, // 多行 JSX 时 > 放在新行

  // ⬇️ 新增：多行时强制尾随逗号
  trailingComma: 'all', // 全部加上，减少 diff

  // ⬇️ 新增：HTML 空白敏感度
  htmlWhitespaceSensitivity: 'css', // 遵循 CSS display 属性

  // ⬇️ 新增：Vue 文件脚本和样式缩进
  vueIndentScriptAndStyle: true,

  // ⬇️ 新增：文件结束换行
  insertFinalNewline: true,

  // ⬇️ 新增：每行单个属性（多行时）
  singleAttributePerLine: true, // 强制每个属性一行

  // ⬇️ 新增：插件（如需要）
  plugins: [
    'prettier-plugin-tailwindcss', // 如使用 Tailwind
  ],

  // ⬇️ 新增：覆盖特定文件类型的配置
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always', // Markdown 自动换行
      },
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        tabWidth: 2,
        useTabs: false,
      },
    },
  ],
};
