import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'commitlint.config.js',
      'src/components/CustomTable/**',
      'src/pages/LogManage/**',
      'src/pages/System/**',
      'src/pages/UserManage/**',
    ],
  },
  {
    extends: [
      js.configs.recommended,
      // ⬇️ 升级为 strict 严格模式，而不是原来的 recommended
      ...tseslint.configs.strict,
      eslintConfigPrettier,
    ],
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // --- React 严格规范 ---
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/self-closing-comp': 'error', // 没有子节点的组件必须自闭合 <div />
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }], // 禁止给普通的字符串 prop 加无用的大括号 className={"text"}

      // --- TypeScript 严格规范 ---
      '@typescript-eslint/no-explicit-any': 'error', // ⬅️ 魔鬼严格：彻底封杀 any，逼迫写出完美类型
      '@typescript-eslint/ban-ts-comment': 'error', // 禁止使用 @ts-ignore 掩耳盗铃
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
      // --- 变量与基础逻辑严格规范 ---

      eqeqeq: ['error', 'always'], // 必须使用 === 和 !==，彻底消灭 ==
      'prefer-const': 'error', // 如果变量没被重新赋值，必须用 const
      'no-unused-vars': 'off', // 关掉原生
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // --- 导入排序规范 (保持你的设置) ---
      // 1. 强制区分类型导入与值导入 (对 Vite 打包极度友好)
      // ❌ import { UserType } from './type';
      // ✅ import type { UserType } from './type';
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // 3. 严禁使用毫无意义的 null / undefined 断言
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react', '^node:'],
            ['^@?\\w'],
            ['^@/'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.?(css|less|scss|sass)$'],
          ],
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
);
