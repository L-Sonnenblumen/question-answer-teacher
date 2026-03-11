import { combineReducers } from '@reduxjs/toolkit';

import fetchSignReduce from './slices/fetchDataSign';
import loginReducer from './slices/loginSlice';
import permissionReducer from './slices/permissionSlice';
import tabReducer from './slices/tabSlice';
import userReducer from './slices/userSlice';

const rootReducer = combineReducers({
  user: userReducer,
  permission: permissionReducer,
  tabs: tabReducer,
  login: loginReducer,
  fetchSign: fetchSignReduce,
});

export default rootReducer;
