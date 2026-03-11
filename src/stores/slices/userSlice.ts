import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import api from '@/api';
import type { LoginType } from '@/api/login/type';
import type { ApiErrorResponse } from '@/types/global';

// import { apiErrorMessage } from "@/utils/apiErrorMessage";
import { getLoginType, getToken, removeToken, setToken } from '../../utils/auth';

import type { LoginRes, MenuItem, UserInfoPayload, UserState } from './type'; // 引入上面定义的类型

// --- 1. 常量与工具函数 (保持不变) ---

interface IconMap {
  [key: string]: string;
}

// Icon映射常量
const ICON_MAP: IconMap = {
  user: 'user',
  role: 'peoples',
  log: 'log',
  charge: 'discount',
  safe: 'safety',
  accounts: 'safety',
  system: 'system',
  setting: 'setting',
  rules: 'rules',
};

// 账号安全路由常量
const ACCOUNT_SAFE_ROUTE: MenuItem = {
  menu_id: 'accounts',
  parent_id: 'root',
  title: '账号安全',
  sort: 16,
  component: 'Layout',
  path: 'accounts',
  permission: null,
  menuPath: '/manage/safe',
  is_leaf: false,
  hidden: '1',
  children: [
    {
      menu_id: 'account-safe',
      parent_id: 'accounts',
      title: '账户安全',
      sort: 1,
      component: '/manage/accounts',
      path: 'changePwd',
      permission: null,
      menuPath: '/manage/accounts',
      is_leaf: true,
      hidden: '1',
      children: null,
    },
    {
      menu_id: 'change-pwd',
      parent_id: 'accounts',
      title: '修改密码',
      sort: 2,
      component: '/manage/accounts/changePwd',
      path: 'changePwd',
      permission: null,
      menuPath: '/manage/accounts/changePwd',
      is_leaf: true,
      hidden: '1',
      children: null,
    },
    {
      menu_id: 'verify-phone',
      parent_id: 'accounts',
      title: '修改绑定手机号',
      sort: 3,
      component: '/manage/accounts/verify-phone',
      path: 'verify-phone',
      permission: null,
      menuPath: '/manage/accounts/verify-phone',
      is_leaf: true,
      hidden: '1',
      children: null,
    },
  ],
};

interface BuildTreeParams {
  list: MenuItem[];
  iconMap: IconMap;
}

const buildTree = ({ list, iconMap }: BuildTreeParams): MenuItem[] => {
  const walk = (arr: MenuItem[], parentIcon: string): void => {
    arr.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    arr.forEach((node) => {
      const path = node.menuPath || node.path || '';
      const pathSegments = path.split('/');
      const firstPath = pathSegments.length > 2 ? pathSegments[2] : '';
      node.icon = iconMap[firstPath] || parentIcon;

      if (node.children && node.children.length > 0) {
        walk(node.children, node.icon);
      }
    });
  };
  const clonedList = JSON.parse(JSON.stringify(list));
  walk(clonedList, '');
  return clonedList;
};

// --- 2. 异步 Thunks (核心修改) ---

/**
 * 管理端登录
 * 返回 Promise<LoginRes>
 */
export const adminLoginAsync = createAsyncThunk<
  LoginRes, // 返回值类型
  LoginType, // 参数类型
  { rejectValue: string } // 错误处理类型
>('user/adminLogin', async (payload, { rejectWithValue }) => {
  try {
    // 假设 api.login.login 返回的就是 LoginRes
    const res = await api.login.login(payload);
    return res as unknown as LoginRes;
  } catch (error: unknown) {
    return rejectWithValue((error as ApiErrorResponse).message);
  }
});

interface MenuApiResponse {
  data: {
    menus: MenuItem[];
    // 其他接口返回的用户字段
    [key: string]: unknown;
  };
}

/**
 * 获取用户信息及菜单
 * 返回 Promise<UserInfoPayload>
 */
export const getUserInfoAsync = createAsyncThunk<
  UserInfoPayload, // 返回值类型
  undefined, // 参数类型 (无)
  { rejectValue: string }
>('user/getUserInfo', async (_, { rejectWithValue }) => {
  try {
    // const response = await api.menu.getMenu();
    // // 强制转换类型以匹配接口定义
    // const { data } = response as unknown as MenuApiResponse;

    let menus = [];

    // 补充账号安全路由逻辑
    const hasAccountRoute = menus.some((menu) => menu.menuPath === '/manage/safe');

    if (!hasAccountRoute) {
      menus = [...menus, ACCOUNT_SAFE_ROUTE];
      menus.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    }

    // 构建树形菜单
    const menusSorted = buildTree({
      list: menus,
      iconMap: ICON_MAP,
    });

    // 组装最终 Payload
    const userInfoPayload: UserInfoPayload = {
      avatar: (data.avatar as string) || null,
      buttons: (data.buttons as string[]) || [],
      permissions: (data.permissions as string[]) || [],
      roles: (data.roles as string[]) || [], // 确保这里获取了 roles
      user_id: (data.user_id as string) || null,
      menus: menusSorted,
    };

    return userInfoPayload;
  } catch (error: unknown) {
    console.error('获取用户菜单失败:', error);
    // 返回默认空结构防止崩溃，或者 reject
    // apiErrorMessage(error);
    return rejectWithValue((error as ApiErrorResponse).message);
  }
});

// --- 3. Slice 定义 ---

const initialState: UserState = {
  token: getToken() || null,
  login_type: getLoginType() || null,
  userinfo: {
    avatar: null,
    buttons: [],
    permissions: [],
    roles: [],
    user_id: null,
    menus: [],
  },
  user_id: localStorage.getItem('USER_ID') || null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 保留 login reducer 以备不时之需，但主要逻辑已移至 extraReducers
    login(state, action: PayloadAction<{ token: string }>) {
      state.token = action.payload.token;
      setToken(state.token);
    },
    // 手动设置用户信息 (如果需要)
    setUserinfo(state, action: PayloadAction<UserInfoPayload>) {
      state.userinfo = { ...state.userinfo, ...action.payload };
    },
    logout(state) {
      state.token = null;
      state.login_type = null;
      state.userinfo = {
        avatar: null,
        buttons: [],
        permissions: [],
        roles: [],
        user_id: null,
        menus: [],
      };
      removeToken();
    },
  },
  // 处理 createAsyncThunk 的状态
  extraReducers: (builder) => {
    // 处理登录成功
    builder.addCase(adminLoginAsync.fulfilled, (state, action) => {
      state.token = action.payload.token;
      // 持久化 Token
      if (state.token) {
        setToken(state.token);
      }
    });

    // 处理获取用户信息成功
    builder.addCase(getUserInfoAsync.fulfilled, (state, action) => {
      // action.payload 即为 thunk 返回的 UserInfoPayload
      state.userinfo = {
        ...state.userinfo,
        ...action.payload,
      };
      state.user_id = action.payload.user_id;
      if (state.user_id) localStorage.setItem('USER_ID', state.user_id);
    });

    // 如果需要处理失败的情况
    builder.addCase(getUserInfoAsync.rejected, (_, action) => {
      // 可以处理错误状态，例如清空数据或设置错误标志
      console.error('获取用户信息失败');
      throw action.payload; // ✅ 同步抛，TS 通过
    });
  },
});

export const { login, setUserinfo, logout } = userSlice.actions;

export default userSlice.reducer;
