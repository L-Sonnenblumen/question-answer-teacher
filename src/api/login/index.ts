import type { FindPasswordType, LoginType } from '@/api/login/type';
import request from '@/client';

export const loginApi = {
  login: (data: LoginType) =>
    request({
      url: '/admin_base/login',
      method: 'post',
      data,
    }),
  logout: () =>
    request({
      url: '/admin_base/logout',
      method: 'get',
    }),
  // 获取图形验证码
  getCheckCode: () =>
    request({
      url: '/admin_base/code_image',
      method: 'post',
    }),
  // 发送短信验证码
  sendSms: (phone: string) =>
    request({
      url: '/user/phone_verification_code',
      method: 'post',
      data: phone,
    }),
  findPassword: (params: FindPasswordType) =>
    request({
      url: '/user/forgot_password',
      method: 'patch',
      data: params,
    }),
};
