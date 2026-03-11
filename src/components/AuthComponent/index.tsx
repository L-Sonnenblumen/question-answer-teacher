import { Button } from 'antd';

import type { RootState } from '@/stores';
import { useAppSelector } from '@/stores/hooks';

interface AuthComponentProps {
  permission: string;
  children: React.ReactNode;
  type?: 'primary' | 'dashed' | 'default' | 'text' | 'link';
  [key: string]: unknown;
}

const AuthComponent = ({
  permission,
  children,
  type = 'primary',
  ...props
}: AuthComponentProps) => {
  // 获取权限标识数组
  const rolePermission = useAppSelector((state: RootState) => state.user.userinfo?.buttons);

  // 遍历数组判断是否存在此权限标识
  if (rolePermission?.includes(permission)) {
    return (
      <Button type={type} {...props}>
        {children}
      </Button>
    );
  }
  return null;
};
export default AuthComponent;
