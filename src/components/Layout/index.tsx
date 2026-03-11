import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  DashboardFilled,
  FileTextOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Analysis,
  ArrowRight,
  BachelorCap,
  Block,
  Coupon,
  DataFile,
  FileSearch,
  FolderOpen,
  Home,
  Layers,
  Plus,
  Radar,
  Ruler,
  UploadOne,
} from '@icon-park/react';
import { Breadcrumb, Button, Layout, Menu, type MenuProps, theme } from 'antd';

import SchoolLogo from '@/assets/images/SchoolLogo/footer_logo.png';
import TabsView from '@/components/Layout/components/TabsView';
// import BackUserPage from "@/pages/UserManage/Back";
import BackUserPage from '@/pages/UserManage/Back';
import type { RootState } from '@/stores';
import type { AppRouteObject } from '@/stores/slices/permissionSlice';

import ClassManage from '../../pages/ClassManage';
import Exercise from '../../pages/Exercise';
import OverView from '../../pages/OverView';
import Quiz from '../../pages/Quiz';
import QuizAnalysis from '../../pages/QuizAnalysis';

import UserCenterModal from './components/UserCenterForm';

import './Layout.css';
import CreateQuizModal from './components/CreatQuizModal';

const { Header, Sider, Content } = Layout;

// 定义用于Tabs格式化的路由类型
interface FormattedRoute {
  title: string;
  menuPath: string;
  element: React.ReactNode;
}

// 提取底层路由方法
const getMenus = (routes: AppRouteObject[]): FormattedRoute[] => {
  const menus: FormattedRoute[] = [];
  function getMenuItem(routeList: AppRouteObject[]) {
    routeList.forEach((item) => {
      if (item.children && item.children.length) {
        getMenuItem(item.children);
      } else {
        // 排除无path或无title的路由
        if (item.path && item.menuPath && item.title) {
          menus.push({
            title: item.title,
            menuPath: item.menuPath,
            element: item.element,
          });
        }
      }
    });
  }
  getMenuItem(routes);
  return menus;
};

const iconMapping: Record<string, React.ReactNode> = {
  user: <UserOutlined />,
  peoples: <TeamOutlined />,
  log: <FileTextOutlined />,
  system: <SettingOutlined />,
  safety: <SafetyCertificateOutlined />,
  setting: <SettingOutlined />,
  dashboard: <DashboardFilled />,
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
  document: <FolderOutlined />,
  documents: <FolderOpenOutlined />,
  warning: <Radar theme="outline" />,
  home: <Home theme="outline" />,
  checkResult: <ArrowRight theme="outline" />,
  checkDocManagement: <UnorderedListOutlined />,
};
// TODO 修改图标和路由
const LayoutApp = () => {
  /** 通用hook */
  const navigate = useNavigate();
  const [quizVisible, setQuizVisible] = useState(false); // 控制测验Modal
  // 侧边栏伸缩
  const [collapsed] = useState(false);
  const [show, setShow] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 侧边栏主题模式
  const [themeVari] = useState<'light' | 'dark'>('light');

  /** 侧边栏菜单 */
  const { pathname } = useLocation();
  const permissionRoutes = useSelector((state: RootState) => state.permission.permissionRoutes);

  // 获取当前路径数组片段
  const pathSnippets = pathname.split('/').filter((i) => i);
  const [subMenuKeys, setSubMenuKeys] = useState<string[]>(
    pathSnippets.slice(0, -1).map((item) => '/' + item),
  );

  /** 重新实现菜单生成逻辑 */
  const menuItems = useMemo<MenuProps['items']>(() => {
    const loop = (routes: AppRouteObject[]): MenuProps['items'] => {
      const items: MenuProps['items'] = [];

      routes.forEach((route) => {
        if (route.hidden) return;

        const key = route.menuPath || route.path;
        if (!key) return;

        const label = route.title || '未命名菜单';

        let iconNode: React.ReactNode = null;
        if (typeof route.icon === 'string') {
          iconNode = iconMapping[route.icon] || null;
        } else {
          iconNode = route.icon as React.ReactNode;
        }

        let children: MenuProps['items'] | undefined;
        if (route.children && route.children.length > 0) {
          children = loop(route.children);
          if (children && children.length === 0) children = undefined;
        }

        items.push({
          key,
          label,
          icon: iconNode,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          children: children as any,
        });
      });

      return items;
    };

    return loop(permissionRoutes);
  }, [permissionRoutes]);

  // 设置菜单展开收缩
  const handleMenuOpen = (openKeys: string[]) => {
    setSubMenuKeys(openKeys);
  };

  // 点击菜单
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const target = String(key);

    // ✅ 关键：同一个菜单（同 pathname）不再触发 navigate
    if (target === pathname) return;

    if (formatRoutes.some((item) => item.menuPath === target)) {
      navigate(target);
    }
  };

  /** 重新实现面包屑映射逻辑 */
  const breadcrumbNameMap = useMemo(() => {
    const map: Record<string, string> = {};

    const loop = (routes: AppRouteObject[]) => {
      routes.forEach((route) => {
        const path = route.menuPath || route.path;
        if (path && route.title) {
          map[path] = route.title;
        }
        if (route.children) {
          loop(route.children);
        }
      });
    };

    loop(permissionRoutes);
    return map;
  }, [permissionRoutes]);

  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    if (index + 1 === pathSnippets.length)
      return {
        key: url,
        title: breadcrumbNameMap[url] || '答题系统',
      };
    return {
      key: url,
      title: breadcrumbNameMap[url] || '答题系统',
    };
  });

  /** tabs栏 */
  const selectTab = useCallback(
    (key: string) => {
      if (key === pathname) return;
      navigate(key);
    },
    [navigate, pathname],
  );

  // 格式化路由数组
  const formatRoutes = useMemo<FormattedRoute[]>(() => {
    return [
      // { title: "首页", menuPath: "/manage/home", element: <HomePage /> },
      {
        title: '用户管理',
        menuPath: '/manage/user',
        element: <BackUserPage />,
      },
      {
        title: '总览',
        menuPath: '/manage/overview',
        element: <OverView />,
      },
      {
        title: '班级管理',
        menuPath: '/manage/class',
        element: <ClassManage />,
      },
      {
        title: '习题管理',
        menuPath: '/manage/exercise',
        element: <Exercise />,
      },
      {
        title: '测验管理',
        menuPath: '/manage/quiz',
        element: <Quiz />,
      },
      {
        title: '测验分析',
        menuPath: '/manage/quiz-analysis',
        element: <QuizAnalysis />,
      },
      ...getMenus(permissionRoutes),
    ];
  }, [permissionRoutes]);

  return (
    <Layout className="layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme={themeVari}
        style={{ height: '100vh', backgroundColor: 'var(--school-theme)' }}
      >
        <div
          className="layout-logo-vertical"
          style={{ color: themeVari === 'dark' ? '#404c8bff' : '#000' }}
        >
          {/* <span className="layout-logo">
            <DashboardFilled />
          </span> */}
          {/* {!collapsed && <span>答题系统</span>} */}
          {!collapsed && (
            <div style={{ padding: '16px' }}>
              <img
                src={SchoolLogo}
                alt="学校Logo"
                style={{
                  width: '170px',
                  overflowY: 'auto',
                }}
              />
            </div>
          )}
        </div>
        <div style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
          <Menu
            theme={themeVari}
            mode="inline"
            selectedKeys={[pathname]}
            openKeys={subMenuKeys}
            onOpenChange={handleMenuOpen}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ backgroundColor: 'var(--school-theme)' }}
          />
          {/* <img
            src={SchoolLogo}
            alt="学校Logo"
            style={{
              width: "170px",
              overflowY: "auto",
              position: "absolute",
              top: "85%",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          /> */}
        </div>
      </Sider>
      <Layout className="layout-home-page">
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          /> */}
          <div className="header-breadcrumb">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div className="header-right">
            <Button
              type="primary"
              style={{ borderRadius: 8, fontSize: 14 }}
              onClick={() => setQuizVisible(true)} // ✅ 点击触发显示
            >
              <Plus
                theme="outline"
                size="12"
                fill="#ffffff"
              />
              发起测验
            </Button>
          </div>
        </Header>
        <Content
          style={{
            minHeight: 280,
            overflow: 'hidden',
            height: 'calc(100vh - 64px)',
          }}
        >
          <TabsView
            pathname={pathname}
            formatRoutes={formatRoutes}
            selectTab={selectTab}
          />
        </Content>
      </Layout>
      <CreateQuizModal
        visible={quizVisible}
        onClose={() => setQuizVisible(false)}
      />
      <UserCenterModal
        visible={show}
        onClose={() => setShow(false)}
      />
    </Layout>
  );
};

export default LayoutApp;
