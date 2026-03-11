// 导入图标组件
import type { ReactNode } from 'react';

import { AppstoreFilled, SettingOutlined } from '@ant-design/icons';
import {
  Analysis,
  BachelorCap,
  Block,
  Coupon,
  DataFile,
  FileSearch,
  FolderOpen,
  Layers,
  ListOne,
  Log,
  People,
  Peoples,
  Radar,
  Ruler,
  UploadOne,
} from '@icon-park/react';

import type { RouteItemType } from './type';

const iconsMap = {
  system: <SettingOutlined />,
  setting: <SettingOutlined />,
  user: <People theme="outline" />,
  peoples: <Peoples theme="outline" />,
  list: <ListOne theme="outline" />,
  log: <Log theme="outline" />,
  discount: <Coupon theme="outline" />,
  rules: <Ruler theme="outline" />,
  teacher: <BachelorCap theme="outline" />,
  level: <Layers theme="outline" />,
  checkDocument: <FileSearch theme="outline" />,
  projectDocument: <FolderOpen theme="outline" />,
  upload: <UploadOne theme="outline" />,
  database: <DataFile theme="outline" />,
  task: <Analysis theme="outline" />,
  block: <Block theme="outline" />,
  warning: <Radar theme="outline" />,
};

/**
 * 面包屑获取路由平铺对象 ,
 * @param {*} routes
 * @returns object, 例:{"/home":"首页"}
 */
export const getBreadcrumbNameMap = <T extends RouteItemType>(routes: T[]) => {
  //首先拼接上首页
  const list = [{ path: 'home', menuPath: '/manage/home', title: '首页' }, ...routes];
  const breadcrumbNameObj: Record<string, string> = {};
  const getItems = (list: RouteItemType[]) => {
    //先遍历数组
    list.forEach((item: RouteItemType) => {
      //遍历数组项的对象
      if (item.children && item.children.length) {
        const menuPath = item.menuPath ? item.menuPath : '/' + item.path;
        breadcrumbNameObj[menuPath] = item.title;
        getItems(item.children);
      } else {
        breadcrumbNameObj[item.menuPath as string] = item.title;
      }
    });
  };
  //调用一下递归函数
  getItems(list);
  //返回新数组
  return breadcrumbNameObj;
};

/** 获取菜单项 */
export function getItem(
  label: ReactNode, // 显示文字
  key: string, // 唯一标识
  icon?: ReactNode, // 图标
  children?: RouteItemType[], // 子菜单
  type?: 'group' | 'divider' | undefined
): RouteItemType {
  return {
    key,
    icon,
    children,
    label,
    type,
    tittle: label,
  } as unknown as RouteItemType;
}
/**
 * 获取侧边栏菜单项
 * @param {*} menuData 嵌套的路由数组
 * @returns
 */
export const getTreeMenu = <T extends RouteItemType>(menuData: T[]) => {
  if (!menuData || !menuData.length) return;
  // 安全的取图标函数
  const getIcon = (iconKey?: string) => {
    if (!iconKey) return <AppstoreFilled />; // 未传 icon
    return iconKey in iconsMap ? ( // key 存在
      iconsMap[iconKey as keyof typeof iconsMap]
    ) : (
      <AppstoreFilled />
    );
  };

  const menuItems: RouteItemType[] = [];
  menuData.forEach((item) => {
    if (!item.hidden) {
      // 如果有子菜单
      if (item.children && item.children.length > 0) {
        menuItems.push(
          getItem(
            item.title,
            '/' + item.path,
            getIcon(item.icon),
            getTreeMenu(item.children),
            undefined
          )
        );
      } else {
        if (item.path) {
          menuItems.push(
            getItem(item.title, item.menuPath, getIcon(item.icon), undefined, undefined)
          );
        }
      }
    }
  });
  return menuItems;
};
