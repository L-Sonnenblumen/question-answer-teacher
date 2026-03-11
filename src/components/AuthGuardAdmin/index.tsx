import { Navigate, useLocation } from 'react-router-dom';

import type { ChildrenType } from '@/components/type';
import { getLoginType, getToken } from '@/utils/auth';

export default function AuthGuardAdmin({ children }: ChildrenType) {
  const token = getToken(); // 唯一 token
  const loginType = (getLoginType() || 'user') as string; // 默认用户端
  const location = useLocation();
  const { pathname } = location;
  /*  已登录的管理员访问 /scholar-guard → 直接进后台 */
  if (token && loginType === 'admin' && pathname === '/scholar-guard') {
    return (
      <Navigate
        to="/manage"
        replace
      />
    );
  }
  return children;
}
