export interface ApiResponse<T = unknown> {
  res: boolean;
  code: number;
  message: string;
  data: T[];
  total?: number;
  limit?: number;
  skip?: number;
}
// src/types/user.ts

// 角色类型
export interface RoleItem {
  id: string;
  role_name: string;
  description: string;
}

// 用户数据类型 (根据你的表格列推断)
export interface UserItem {
  id: string;
  username: string;
  phone: string;
  status: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  is_online: boolean;
  bound_roles?: RoleItem[];
}

// 搜索参数类型
export interface UserSearchParams {
  phone_substring?: string;
  user_status?: number | null;
  pageSize?: number;
  current?: number;
  [key: string]: unknown; // 允许其他可能的动态键
}

// 接口响应结构
export interface TableResponse<T> {
  data: T[];
  total: number;
}
