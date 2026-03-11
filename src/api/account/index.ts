import request from '@/client';

import type { ChangePasswordType, ModifyMeType, ModifyPhoneType } from './type';

// 个人账户api--修改个人信息、绑定手机号、密码
export const accountApi = {
  changePassword: (params: ChangePasswordType) =>
    request({
      url: '/user/change_password',
      method: 'patch',
      data: params,
    }),
  modifyPhone: (params: ModifyPhoneType) =>
    request({
      url: '/user/change_binded_phone',
      method: 'patch',
      data: params,
    }),
  // 修改个人信息，目前只可以修改用户名，后续可以添加其他个人信息
  modifyMe: (params: ModifyMeType) =>
    request({
      url: '/user/modify_info',
      method: 'patch',
      data: params,
    }),
};
