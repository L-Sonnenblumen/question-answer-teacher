// 设置token键值
const TokenKey = 'ACCESS-TOKEN';
/**
 * 获取token
 */
const getToken = () => {
  return window.localStorage.getItem(TokenKey);
};
/**
 * 设置token
 * @param token
 */
const setToken = (token: string) => {
  return window.localStorage.setItem(TokenKey, token);
};
/**
 * 获取用户ID
 */
const getUserID = () => {
  return window.localStorage.getItem('USER_ID');
};
/**
 * 移除token
 */
const removeToken = () => {
  return window.localStorage.removeItem(TokenKey);
};
/**
 * 刷新token,不确定需不需要使用
 * @param refreshToken
 */
// refreshToken键值
// const RefreshTokenKey = 'REFRESH-TOKEN';

// const getRefreshToken = () => {
//   return window.localStorage.getItem(RefreshTokenKey);
// };

// const setRefreshToken = (token:string) => {
//   return window.localStorage.setItem(RefreshTokenKey, token, { expires: 2 });
// };

// const removeRefreshToken = () => {
//   return window.localStorage.removeItem(RefreshTokenKey);
// };
const LoginType = 'LOGIN-TYPE';
const setLoginType = (type: string) => localStorage.setItem(LoginType, type);
const getLoginType = () => localStorage.getItem(LoginType);
const removeLoginType = () => localStorage.removeItem(LoginType);
export {
  getLoginType,
  getToken,
  getUserID,
  removeLoginType,
  removeToken,
  // getRefreshToken,
  // setRefreshToken,
  // removeRefreshToken,
  setLoginType,
  setToken,
};
