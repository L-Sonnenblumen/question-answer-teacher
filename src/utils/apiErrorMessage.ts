import { message } from 'antd';

import type { ApiErrorResponse } from '@/types/global';
import type { ErrorNetType } from '@/utils/type';

// 使用防抖来避免重复显示
let lastErrorTime = 0;
const ERROR_THROTTLE_TIME = 2000; // 2秒内只显示一次

export const apiErrorMessage = (error: unknown) => {
  console.log('error', error);

  // 检查是否为401错误
  if ((error as ApiErrorResponse).code === 401) return;

  // 节流控制
  const now = Date.now();
  if (now - lastErrorTime < ERROR_THROTTLE_TIME) {
    return;
  }
  lastErrorTime = now;

  // 显示错误
  if ((error as ErrorNetType).code === 'ERR_NETWORK') {
    message.error('网络错误');
  } else {
    message.error((error as ApiErrorResponse).message || '请求失败');
  }
};
