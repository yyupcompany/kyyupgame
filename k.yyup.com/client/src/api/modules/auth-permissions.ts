/**
 * 权限相关API模块
 */

import { get, post } from '@/utils/request';

export interface Permission {
  id: number;
  name: string;
  code: string;
  type: string;
  path: string;
  component: string;
  icon: string;
  sort: number;
  status: number;
}

export interface MenuItem {
  id: number;
  name: string;
  path: string;
  component: string;
  icon: string;
  sort: number;
  children: MenuItem[];
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
}

export interface PermissionCheckResult {
  hasPermission: boolean;
  path: string;
  userId: number;
}

/**
 * 获取用户权限列表
 */
export const getUserPermissions = () => {
  return get('/auth-permissions/permissions');
};

/**
 * 获取用户菜单
 */
export const getUserMenu = () => {
  return get('/auth-permissions/menu');
};

/**
 * 检查用户是否有访问某个路径的权限
 */
export const checkPermission = (path: string) => {
  return post('/auth-permissions/check-permission', { path });
};

/**
 * 获取用户角色
 */
export const getUserRoles = () => {
  return get('/auth-permissions/roles');
};

export default {
  getUserPermissions,
  getUserMenu,
  checkPermission,
  getUserRoles
};