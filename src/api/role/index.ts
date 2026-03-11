import type {
  BindRoleAndPermissionType,
  CreateRoleType,
  GetUserRoleType,
  ModifyUserRoleType,
  UpdateRoleType,
} from '@/api/role/type';
import request from '@/client';
export const roleApi = {
  getUserRole: (params: GetUserRoleType) =>
    request({
      url: '/role/roles/list',
      method: 'post',
      data: params,
    }),
  addUserRole: (params: ModifyUserRoleType) =>
    request({
      url: '/admin_manager/add_role_for_user',
      method: 'patch',
      data: params,
    }),
  deleteUserRole: (params: ModifyUserRoleType) =>
    request({
      url: '/admin_manager/delete_role_for_user',
      method: 'patch',
      data: params,
    }),
  createRole: (params: CreateRoleType) =>
    request({
      url: '/role/roles/create',
      method: 'post',
      data: params,
    }),
  getRole: (role_id: string) =>
    request({
      url: '/role/roles/get',
      method: 'post',
      data: { role_id },
    }),
  updateRole: (params: UpdateRoleType) =>
    request({
      url: 'role/roles/update',
      method: 'post',
      data: params,
    }),
  deleteRole: (role_id: string) =>
    request({
      url: 'role/roles/delete',
      method: 'post',
      data: { role_id },
    }),
  getRolePermission: (role_id: string) =>
    request({
      url: 'role/roles/role-permissions/list',
      method: 'post',
      data: { role_id },
    }),
  bindRoleAndPermission: (params: BindRoleAndPermissionType) =>
    request({
      url: 'role/roles/role-permissions/bind',
      method: 'post',
      data: params,
    }),
};
