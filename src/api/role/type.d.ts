import type React from 'react';

import type { QueryBaseParams } from '@/api/type';

// 修改用户角色 删除和添加
export interface ModifyUserRoleType {
  user_id?: string;
  role_id: string;
}

export interface GetUserRoleType extends QueryBaseParams {
  keyword: string;
}

export interface CreateRoleType {
  role_name: string;
  role_description: string;
}

export interface UpdateRoleType {
  role_id: string;
  role_name: string;
  role_description: string;
}

export interface BindRoleAndPermissionType {
  role_id: string;
  permissions: React.Key[];
}
