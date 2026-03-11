import { memo, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ConfigProvider, Tabs, type TabsProps } from 'antd';

import type { RootState } from '@/stores';
import { addTab, removeTab } from '@/stores/slices/tabSlice';

interface TabsViewProps {
  pathname: string;
  formatRoutes: {
    menuPath: string;
    title: string;
    element: React.ReactNode;
  }[];
  selectTab: (key: string) => void;
}

const TabsView = memo<TabsViewProps>(({ pathname, formatRoutes, selectTab }) => {
  // 获取全局tabs
  const tabs = useSelector((state: RootState) => state.tabs.tabs);
  const dispatch = useDispatch();
  // 当前选中tab
  const [activeKey, setActiveKey] = useState<string>();

  // 添加方法
  const onAddTab = (path: string) => {
    // 找到对应路径的菜单信息
    const menu = formatRoutes.find((item) => item.menuPath === path);
    if (menu)
      dispatch(
        addTab({
          label: menu.title,
          key: menu.menuPath,
          children: menu.element,
        })
      );
  };

  // Tabs 点击添加配置
  useEffect(() => {
    if (pathname !== '/') {
      setActiveKey(pathname);
      // 数组中无此项，进行添加
      if (!tabs.some((item) => item.key === pathname)) {
        onAddTab(pathname);
      }
    }
  }, [pathname]);

  // Tabs渲染所用数组，当长度为1时Tab项不显示关闭
  const tabItems = useMemo(() => {
    return tabs.map((item) => ({
      ...item,
      children: (
        <div
          style={{
            padding: 24,
            backgroundColor: '#f5f5f5',
            height: 'calc(100vh - 103px)', // 100vh - Header高度 - Tabs高度
            overflow: 'auto', // 添加滚动条
          }}
          key={item.key}
        >
          {item.children}
        </div>
      ),
      closable: tabs.length > 1,
    }));
  }, [tabs]);

  /** tab操作方法 */
  // tab切换事件
  const handleTabChange = (key: string) => {
    selectTab(key);
  };

  // 点击选项卡关闭
  const closeTab = (targetKey: string) => {
    // 如果当前关闭的是当前正在看的tab，那么执行以下操作
    if (targetKey === activeKey) {
      // 获取删除后的数组
      const afterRemoveTabs = tabs.filter((item) => item.key !== targetKey);
      // 获取选中跳转的数组下标
      const selectIndex = tabs.findIndex((item) => item.key === targetKey);

      let nextKey = '';
      if (afterRemoveTabs.length === 0) {
        // No tabs left handling (optional)
      } else if (selectIndex >= afterRemoveTabs.length) {
        // If we closed the last tab, switch to the previous one (which is now the last)
        nextKey = afterRemoveTabs[afterRemoveTabs.length - 1].key;
      } else {
        // Otherwise switch to the previous one at the same index (which was effectively the one before the closed one?
        // Logic in original code: afterRemoveTabs[selectIndex - 1] might be risky if selectIndex is 0.
        // Safer approach typically:
        nextKey = afterRemoveTabs[Math.max(0, selectIndex - 1)].key;
      }

      if (nextKey) selectTab(nextKey);
    }
    dispatch(removeTab(targetKey));
  };

  const handleEdit: TabsProps['onEdit'] = (targetKey, action) => {
    if (action === 'remove' && typeof targetKey === 'string') {
      closeTab(targetKey);
    }
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            horizontalMargin: '0',
          },
        },
      }}
    >
      <div style={{ backgroundColor: '#fff' }}>
        <Tabs
          type="editable-card"
          onChange={handleTabChange}
          activeKey={activeKey}
          onEdit={handleEdit}
          items={tabItems}
          hideAdd
        />
      </div>
    </ConfigProvider>
  );
});
export default TabsView;
