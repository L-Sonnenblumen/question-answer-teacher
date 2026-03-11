import './index.less';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import api from '@/api';
import NoViewAuthComponent from '@/components/NoViewAuthComponent';
import type { RootState } from '@/stores';

import AdminMangementPage from './components/AdminManagementPage';

const BackUserPage = () => {
  const [adminId, setAdminId] = useState<string>('');

  const rolePermission = useSelector((state: RootState) => state.user.userinfo?.buttons);

  useEffect(() => {
    api.user.getMeInfo().then(({ data }) => {
      setAdminId(data.id);
    });
    // setAdminId("11111");
  }, []);

  const hasAuth = rolePermission?.includes('user:admin:query');
  const ready = hasAuth && adminId; // 关键：等 adminId 到位

  return (
    <>
      {ready ? (
        <div className="usermanagement-page">
          <AdminMangementPage adminId={adminId} />
        </div>
      ) : hasAuth ? null : (
        <NoViewAuthComponent />
      )}
    </>
  );
};

export default BackUserPage;
