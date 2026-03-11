// src/stores/slices/type.ts
type TabItem = {
  key: string;
  label: string;
  children: React.ReactNode;
};
export interface TabsType {
  tabs: TabItem[];
}
/** * 1. 定义基础路由配置接口
 * 包含 filterAsyncRoutes 函数真正用到的字段
 */
export interface BaseMenu {
  title: string;
  path: string;
  component: string; // "Layout" 或 组件路径
  menuPath?: string;
  icon?: string;
  // 兼容 hidden 可能是 "0"/"1" 或 boolean 或 number
  hidden: string | number | boolean;
  redirect?: string;
  // 递归定义：子级也是 BaseMenu
  children?: BaseMenu[] | null;
}

/** * 2. 完整的后端菜单接口
 * 继承 BaseMenu，并加上数据库特有的字段
 */
export interface MenuItem extends BaseMenu {
  menu_id: string;
  parent_id: string | 'root';
  sort: number;
  permission: string | null;
  is_leaf: boolean;
  // 覆写 children 类型为 MenuItem[] (如果需要严格类型)
  // 但为了兼容性，通常保持 BaseMenu[] 即可，或者用交叉类型
  children: MenuItem[] | null;
}

export interface UserInfoType {
  avatar: string | null;
  buttons: string[];
  permissions: string[];
  // 补充 App.tsx 中用到的 roles
  roles: string[];
  user_id: string | null;
  menus?: MenuItem[];
}

export interface LoginRes {
  token: string;
  // 如果后端返回包含用户信息，可以在这里定义，这里仅保留 token
  [key: string]: unknown;
}

export interface UserState {
  token: string | null;
  login_type: string | null;
  userinfo: UserInfoType;
  user_id: string | null;
}

// 专门为 Payload 定义一个类型，合并了 UserInfoType 和 menus
export interface UserInfoPayload extends UserInfoType {
  menus: MenuItem[];
}

// export interface ApiErrorResponse<T = unknown> {
//   res: string;
//   code: string;
//   message: string;
//   data?: T;
// }
