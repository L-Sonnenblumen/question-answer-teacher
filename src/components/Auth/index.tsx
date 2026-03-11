import { type ReactNode } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '@/stores';

interface AuthProps {
  permission: string; // 如 "user:admin:state"
  children: ReactNode;
}
// 决定组件是否渲染
const Auth = ({ permission, children }: AuthProps) => {
  const rolePermission = useSelector((state: RootState) => state.user.userinfo?.buttons ?? []);

  return rolePermission?.includes(permission) ? <>{children}</> : null;
};

export default Auth;
