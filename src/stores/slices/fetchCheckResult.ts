import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  file_id: '',
  task_id: '',
};

const fetchCheckResultSlice = createSlice({
  name: 'fetchCheckResult',
  initialState,
  reducers: {
    setFileID: (state, action: PayloadAction<string>) => {
      state.file_id = action.payload;
    },
    setTaskID: (state, action: PayloadAction<string>) => {
      state.task_id = action.payload;
    },
  },
});
export const { setFileID, setTaskID } = fetchCheckResultSlice.actions;
export default fetchCheckResultSlice.reducer;
