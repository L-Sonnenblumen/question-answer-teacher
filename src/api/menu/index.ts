import request from '@/client';

export const menuApi = {
  getMenu: () =>
    request({
      url: '/role/roles/menu-permissions',
      method: 'get',
    }),
  getSysPermission: () =>
    request({
      url: 'role/roles/sys-permissions/list',
      method: 'get',
      data: null,
    }),
};
