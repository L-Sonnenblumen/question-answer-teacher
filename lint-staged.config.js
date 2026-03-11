export default {
  // 1. 拦截 TS/TSX 文件，提交前不仅格式化，还必须通过严格的 TypeScript 全局类型校验
  '*.{ts,tsx}': [
    // () => 'tsc --noEmit --project tsconfig.app.json', // ⬅️ 魔鬼严格：拦截任何 TS 类型报错
    'eslint --fix',
    'prettier --write',
  ],
  // 2. JS 文件只需 ESLint 和 格式化
  '*.{js,jsx}': ['eslint --fix', 'prettier --write'],
  // 3. 样式和文档单纯格式化
  '*.{less,css,json,md,html}': ['prettier --write'],
};
