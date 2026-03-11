import { Navigate, useLocation } from 'react-router-dom';

import type { ChildrenType } from '@/components/type';
import { getLoginType, getToken } from '@/utils/auth';

type LoginType = 'admin' | 'user';

export default function AuthGuard({ children }: ChildrenType) {
  const token = getToken(); // 唯一 token
  const loginType = (getLoginType() || 'user') as LoginType; // 默认用户端
  const location = useLocation();
  const { pathname } = location;

  /* ---------- 1. 没 token ---------- */
  if (!token) {
    const target = pathname.startsWith('/manage')
      ? '/scholar-guard' // 管理端登录页
      : '/custom'; // 用户端登录页
    return <Navigate to={target} replace state={{ preLocation: pathname }} />;
  }

  /* ---------- 2. 有 token 但越权 ---------- */
  const isAdminRoute = pathname.startsWith('/manage');
  if (loginType === 'admin' && !isAdminRoute) {
    // 管理员却访问用户端
    return <Navigate to="/custom" replace />;
  }
  if (loginType === 'user' && isAdminRoute) {
    // 用户却访问管理端 → 踢到用户端首页
    return <Navigate to="/consumer" replace />;
  }

  /* ---------- 3. 权限匹配 ---------- */
  return children;
}
