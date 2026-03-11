import { Suspense, useEffect } from 'react';
// 导入路由及react-redux钩子
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { type RouteObject, useLocation, useNavigate, useRoutes } from 'react-router-dom';

import { ConfigProvider, message } from 'antd';
import locale from 'antd/locale/zh_CN';
import dayjs from 'dayjs';

// 导入类型与 Hook
import type { RootState } from '@/stores';
// 注意：这里需要导入 useAppDispatch 而不是普通的 useDispatch，以获得更好的类型提示
// 如果你没有封装 useAppDispatch，请暂时使用 useDispatch 并配合 AppDispatch 类型
import { type AppDispatch } from '@/stores'; // 假设你有导出 AppDispatch 类型
import { generateRoutes } from '@/stores/slices/permissionSlice';
import { getUserInfoAsync } from '@/stores/slices/userSlice';
import { apiErrorMessage } from '@/utils/apiErrorMessage';
import DefaultRouter from '@/utils/defaultRouter';
import useKick from '@/utils/useKick.ts';

import Loading from './components/Loading';
import { getLoginType, getToken } from './utils/auth';

import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

const WHITE_LIST = ['/scholar-guard', '/custom', '/404'];

export default function App() {
  // 使用 AppDispatch 获得 Thunk 的类型支持
  const dispatch = useDispatch<AppDispatch>();
  const routes = useSelector((state: RootState) => state.permission.routes);
  useKick();

  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();

  message.config({
    maxCount: 1,
    duration: 3,
  });
  //

  useEffect(() => {
    const fetchData = async () => {
      if (WHITE_LIST.some((path) => location.pathname.startsWith(path))) {
        return;
      }

      if (!token) {
        if (location.pathname.startsWith('/manage')) {
          navigate('/scholar-guard', { replace: true });
        }
      } else {
        if (location.pathname.startsWith('/manage') && getLoginType() === 'admin') {
          try {
            // 关键修改：
            // 1. dispatch(getUserInfoAsync()) 返回一个 Promise<Action>
            // 2. .unwrap() 会返回 thunk 中 return 的数据 (UserInfoPayload)，如果出错则抛出异常
            // const userInfo = await dispatch(getUserInfoAsync()).unwrap();

            // 现在 userInfo 就是准确的 UserInfoPayload 类型，可以直接访问 roles
            // if (userInfo.roles && userInfo.roles.length === 0) {
            // message.warning('该账号未绑定任何角色，没有权限操作答题系统，请联系超级管理员', 3);
            // }

            // 确保 menus 存在
            // if (userInfo.menus) {
            // dispatch(generateRoutes(userInfo.menus));

            // 开发阶段使用默认路由
            dispatch(generateRoutes(DefaultRouter));
            // }
          } catch (error: unknown) {
            console.log('这是中间节点App.tsx');
            if (error === 'Network Error') message.error('网络错误');
            else apiErrorMessage(error);
          }
        }
      }
    };
    fetchData();
  }, [token, dispatch, location.pathname, navigate]);

  const element = useRoutes(routes as RouteObject[]);

  return (
    <ConfigProvider locale={locale}>
      <Suspense fallback={<Loading />}>{routes && element}</Suspense>
    </ConfigProvider>
  );
}
