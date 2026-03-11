import type { ComponentType, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 导入页面组件
import Home from '@/pages/Home';
import Role from '@/pages/System/Role';
import BackUserPage from '@/pages/UserManage/Back';
import constantRoutes from '@/routes/constantRoutes';
import type { AppThunk } from '@/stores';
// 引入 BaseMenu
import type { BaseMenu } from '@/stores/slices/type';

// --- 1. 类型定义 ---

// 【删除】这里原本的 BackendRoute 接口已经不需要了，直接删除，避免混淆

/** 前端转换后的路由结构 (Output) - 继承 React Router 的 RouteObject 并扩展自定义字段 */
export interface AppRouteObject {
  path?: string;
  index?: boolean;
  element?: ReactNode;
  children?: AppRouteObject[];
  redirect?: string;
  menuPath?: string;
  title?: string;
  hidden?: boolean;
  icon?: string;
}

/** 权限 State 类型 */
export interface PermissionState {
  routes: AppRouteObject[];
  permissionRoutes: AppRouteObject[];
}

// --- 2. 映射表与工具 ---

// 组件映射表类型
type ComponentMap = Record<string, ComponentType<unknown> | null>;

const asyncComponents: ComponentMap = {
  Layout: null,
  '/home': Home,
  '/manage/role': Role,
  '/manage/user/back': BackUserPage,
};

// 路径映射表
const RoutePathMap: Record<string, string> = {
  systemLog: 'system',
  userLog: 'user',
  manageLog: 'manage',
};

/**
 * 递归过滤异步路由表
 * 参数已经正确使用了 BaseMenu[]
 */
function filterAsyncRoutes(routes: BaseMenu[]): AppRouteObject[] {
  const res: AppRouteObject[] = [];

  routes.forEach((route) => {
    let Component: ComponentType<unknown> | null = null;

    if (route.component === 'Layout') {
      Component = null;
    } else {
      const mappedComponent = asyncComponents[route.component];
      if (mappedComponent) {
        Component = mappedComponent;
      } else {
        // console.warn(`[filterAsyncRoutes] 未找到组件：${route.component}`);
      }
    }

    const tmp: AppRouteObject = {
      path: RoutePathMap[route.path] ?? route.path,
      menuPath: route.menuPath,
      element: Component ? <Component /> : null,
      redirect: route.redirect,
      title: route.title,
      // 兼容处理
      hidden: !!Number(route.hidden),
      icon: route.icon,
    };

    if (route.children && route.children.length > 0) {
      const childrenRoutes = filterAsyncRoutes(route.children);

      if (route.redirect) {
        tmp.children = [
          {
            path: '',
            index: true,
            element: (
              <Navigate
                to={route.redirect}
                replace
              />
            ),
          },
          ...childrenRoutes,
        ];
      } else {
        tmp.children = childrenRoutes;
      }
    }

    res.push(tmp);
  });

  return res;
}

// --- 3. Slice 定义 ---

const initialState: PermissionState = {
  routes: constantRoutes as AppRouteObject[],
  permissionRoutes: [],
};

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    setRoutes(state, action: PayloadAction<AppRouteObject[]>) {
      state.routes = state.routes.map((item) => {
        if (item.path === 'manage' || item.path === '/manage') {
          return {
            ...item,
            children: [...(item.children || []), ...action.payload],
          };
        }
        return item;
      });
    },
    setPermissionRoutes(state, action: PayloadAction<AppRouteObject[]>) {
      state.permissionRoutes = action.payload;
    },
  },
});

export const { setRoutes, setPermissionRoutes } = permissionSlice.actions;

// --- 4. Thunk Action (业务逻辑) ---

/**
 * 生成路由的 Thunk
 * 关键修改：将入参类型从 MenuItem[] 放宽为 BaseMenu[]
 */
export const generateRoutes =
  (payload: BaseMenu[]): AppThunk<AppRouteObject[]> =>
  // <--- 修改了这里
  (dispatch) => {
    // 1. 转换路由结构
    const accessedRoutes = filterAsyncRoutes(payload);

    // 2. 分发状态
    dispatch(setPermissionRoutes(accessedRoutes));
    dispatch(setRoutes(accessedRoutes));

    return accessedRoutes;
  };

export default permissionSlice.reducer;
