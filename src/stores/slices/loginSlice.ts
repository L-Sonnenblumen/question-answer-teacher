import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  loginIsHidden: true,
  aduitPass: false,
  isAdminFindPassword: false,
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setLoginIsHidden: (state, action: PayloadAction<boolean>) => {
      state.loginIsHidden = action.payload;
    },
    setIsAdminFindPassword: (state, action: PayloadAction<boolean>) => {
      state.isAdminFindPassword = action.payload;
    },
  },
});

export const { setLoginIsHidden, setIsAdminFindPassword } = loginSlice.actions;
export default loginSlice.reducer;
