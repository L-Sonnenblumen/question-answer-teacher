import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  fetchLevelsData: false,
  fetchLevelDetail: false,
  fetchCategoryData: false,
  fetchCategoryDetail: false,
  fetchRuleData: false,
  fetchRuleDetail: false,
};

const fetchSignSlice = createSlice({
  name: 'fetch',
  initialState,
  reducers: {
    setFetchLevelsData: (state, action: PayloadAction<boolean>) => {
      state.fetchLevelsData = action.payload;
    },
    setFetchLevelDetail: (state, action: PayloadAction<boolean>) => {
      state.fetchLevelDetail = action.payload;
    },
    setFetchCategoryData: (state, action: PayloadAction<boolean>) => {
      state.fetchCategoryData = action.payload;
    },
    setFetchCategoryDetail: (state, action: PayloadAction<boolean>) => {
      state.fetchCategoryDetail = action.payload;
    },
    setFetchRuleData: (state, action: PayloadAction<boolean>) => {
      state.fetchRuleData = action.payload;
    },
    setFetchRuleDetail: (state, action: PayloadAction<boolean>) => {
      state.fetchRuleDetail = action.payload;
    },
  },
});

export const {
  setFetchLevelsData,
  setFetchLevelDetail,
  setFetchCategoryData,
  setFetchCategoryDetail,
  setFetchRuleData,
  setFetchRuleDetail,
} = fetchSignSlice.actions;
export default fetchSignSlice.reducer;
