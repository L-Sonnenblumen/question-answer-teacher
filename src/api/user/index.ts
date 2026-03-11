import request from '@/client';

import type { AddUserType, GetUsersType, UpdateUserStatusType, UpdateUserType } from './type';

export const userApi = {
  // 获取自己的账号信息
  getMeInfo: () =>
    request({
      url: '/admin_manager/me',
      method: 'get',
    }),
  getUser: (params: GetUsersType) =>
    request({
      url: '/admin_manager/admins',
      method: 'post',
      data: params,
    }),
  addUser: (params: AddUserType) =>
    request({
      url: '/admin_manager/add_admin',
      method: 'post',
      data: params,
    }),
  updateUser: (params: UpdateUserType) =>
    request({
      url: '/admin_manager/update_admin',
      method: 'patch',
      data: params,
    }),
  updateUserStatus: (params: UpdateUserStatusType) =>
    request({
      url: '/admin_manager/change_admin_status',
      method: 'patch',
      data: params,
    }),
  deleteUser: (user_id: string) =>
    request({
      url: '/admin_manager/delete_admin',
      method: 'delete',
      data: { user_id },
    }),
  forceUserLogout: (user_id: string) =>
    request({
      url: '/admin_manager/force_logout_admin',
      method: 'post',
      data: { user_id },
    }),
  getSuperAdminId: () =>
    request({
      url: '/admin_manager/admin_user_id',
      method: 'get',
      data: null,
    }),
};
