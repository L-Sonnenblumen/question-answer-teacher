// 全局类型声明

// 声明 .less 文件模块
declare module '*.less' {
  const classes: { [key: string]: string };
  export default classes;
}

// 声明图片文件模块
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  import React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export { ReactComponent };
  export default src;
}

// 接口response返回类型
export interface ResponseType<T> {
  res: boolean;
  code: number;
  message: string;
  data: T;
}

// 全局环境变量类型
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// src/types/defaultRouter.ts
export interface RouteItem {
  title: string;
  icon?: string; // 部分节点无图标
  component: string; // "Layout" 或页面路径
  path: string;
  menuPath: string;
  hidden?: string; // 0 显示 1 隐藏
  children: RouteItem[];
}

export interface ApiErrorResponse {
  res: boolean;
  code: number;
  message: string;
  data?: null;
}
/**
 * 全局接口返回泛型
 */
export interface ApiResponse<T = unknown> {
  res: boolean;
  code: number;
  message: string;
  data: T; // 泛型位置
  total: number;
  limit?: number;
  skip?: number;
}

export interface PaginationType {
  current: number;
  pageSize: number;
}
