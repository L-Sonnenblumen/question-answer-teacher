import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { TabItem, TabsType } from '@/stores/slices/type';

const initialState: TabsType = { tabs: [] };
const tabSlice = createSlice({
  name: 'tabs',
  initialState,

  reducers: {
    // 新增tab
    addTab: (state, action: PayloadAction<TabItem>) => {
      // 已存在就激活，不再新增
      const { key } = action.payload;
      if (state.tabs.some((tab) => tab.key === key)) return; // 已存在直接忽略
      state.tabs.push(action.payload);

      // sessionStorage.setItem('tabs', JSON.stringify(state.tabs))
    },
    // 删除tab
    removeTab: (state, action: PayloadAction<string>) => {
      //string=key
      state.tabs = state.tabs.filter((tab) => tab.key !== action.payload);
      // sessionStorage.setItem('tabs', JSON.stringify(state.tabs))
    },
    emptyTabs: (state) => {
      state.tabs = []; // 直接置空
    },
  },
});

export const { addTab, removeTab, emptyTabs } = tabSlice.actions;
export default tabSlice.reducer;
