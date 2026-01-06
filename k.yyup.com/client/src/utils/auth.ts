// 身份验证工具函数

const TOKEN_KEY = 'kindergarten_token';
const USER_INFO_KEY = 'kindergarten_user_info';

/**
 * 获取token
 * @returns {string|null} 存储的token值
 */
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.warn('获取token失败:', error);
    return null;
  }
};

/**
 * 设置token
 * @param {string} token - 要存储的token值
 */
export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.warn('设置token失败:', error);
  }
};

/**
 * 移除token
 */
export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.warn('移除token失败:', error);
  }
};

/**
 * 保存用户信息
 * @param {object} userInfo - 用户信息对象
 */
export const setUserInfo = (userInfo: any): void => {
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  } catch (error) {
    console.warn('保存用户信息失败:', error);
  }
};

/**
 * 获取用户信息
 * @returns {object|null} 用户信息对象
 */
export const getUserInfo = (): any | null => {
  try {
    const userInfo = localStorage.getItem(USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.warn('获取用户信息失败:', error);
    return null;
  }
};

/**
 * 移除用户信息
 */
export const removeUserInfo = (): void => {
  try {
    localStorage.removeItem(USER_INFO_KEY);
  } catch (error) {
    console.warn('移除用户信息失败:', error);
  }
};

/**
 * 登出操作，清除所有认证相关数据
 */
export const logout = (): void => {
  try {
    removeToken();
    removeUserInfo();
  } catch (error) {
    console.warn('登出操作失败:', error);
  }
};

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export const isLoggedIn = (): boolean => {
  try {
    return !!getToken();
  } catch (error) {
    console.warn('检查登录状态失败:', error);
    return false;
  }
};