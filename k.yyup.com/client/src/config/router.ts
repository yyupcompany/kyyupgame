/**
 * 路由配置文件
 * 解决路由守卫中的硬编码问题
 */

import { currentEnvironment, environmentConfig } from './environment';

// 路由配置接口
export interface RouterConfig {
  // 白名单路由（无需登录）
  whiteList: string[];
  
  // 模拟用户配置
  mockUser: {
    enabled: boolean;
    userData: any;
    token: string;
  };
  
  // 权限配置
  permissions: {
    adminRoles: string[];
    adminUsernames: string[];
    adminPermissions: string[];
  };
  
  // 重定向配置
  redirects: {
    loginPath: string;
    homePath: string;
    noPermissionPath: string;
    notFoundPath: string;
  };
}

// 默认路由配置
const defaultRouterConfig: RouterConfig = {
  whiteList: [
    '/login',
    '/register',
    '/forget-password',
    '/no-permission',
    '/404',
    '/403',
    '/debug'
  ],
  
  mockUser: {
    enabled: false,
    userData: {
      id: 121,
      username: 'admin',
      role: 'admin',
      name: '系统管理员',
      email: 'admin@kindergarten.com',
      avatar: '/avatars/admin.png',
      status: 'active',
      isAdmin: true,
      kindergartenId: 1,
      permissions: ['*']
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjEiLCJuYW1lIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZXhwIjo5OTk5OTk5OTk5LCJkZXZNb2RlIjp0cnVlfQ.mockSignatureForDevAndTestingPurposesOnly'
  },
  
  permissions: {
    adminRoles: ['admin', 'super_admin'],
    adminUsernames: ['admin', 'administrator'],
    adminPermissions: ['*', 'admin:*']
  },
  
  redirects: {
    loginPath: '/login',
    homePath: '/dashboard',
    noPermissionPath: '/403',
    notFoundPath: '/404'
  }
};

// 生成动态路由配置
export function generateRouterConfig(): RouterConfig {
  const config = { ...defaultRouterConfig };
  
  // 环境特定配置
  switch (currentEnvironment) {
    case 'development':
      // 开发环境启用模拟用户
      config.mockUser.enabled = environmentConfig.enableMockData;
      break;
      
    case 'test':
      // 测试环境可能需要不同的配置
      config.mockUser.enabled = true;
      // 可以添加测试专用的白名单路由
      config.whiteList.push('/test', '/debug');
      break;
      
    case 'staging':
      // 预发布环境配置
      config.mockUser.enabled = false;
      break;
      
    case 'production':
      // 生产环境配置
      config.mockUser.enabled = false;
      break;
  }
  
  // 从环境变量读取自定义配置
  if (import.meta.env.VITE_ROUTER_WHITE_LIST) {
    const customWhiteList = import.meta.env.VITE_ROUTER_WHITE_LIST.split(',').map((path: string) => path.trim());
    config.whiteList = [...config.whiteList, ...customWhiteList];
  }
  
  if (import.meta.env.VITE_ADMIN_ROLES) {
    config.permissions.adminRoles = import.meta.env.VITE_ADMIN_ROLES.split(',').map((role: string) => role.trim());
  }
  
  if (import.meta.env.VITE_LOGIN_PATH) {
    config.redirects.loginPath = import.meta.env.VITE_LOGIN_PATH;
  }
  
  if (import.meta.env.VITE_HOME_PATH) {
    config.redirects.homePath = import.meta.env.VITE_HOME_PATH;
  }
  
  return config;
}

// 权限检查函数
export function isAdminUser(userInfo: any, config: RouterConfig): boolean {
  if (!userInfo) return false;
  
  // 检查isAdmin标志
  if (userInfo.isAdmin === true) return true;
  
  // 检查角色
  if (userInfo.role && config.permissions.adminRoles.includes(userInfo.role)) {
    return true;
  }
  
  // 检查用户名
  if (userInfo.username && config.permissions.adminUsernames.includes(userInfo.username)) {
    return true;
  }
  
  // 检查权限
  if (userInfo.permissions && Array.isArray(userInfo.permissions)) {
    return userInfo.permissions.some((permission: any) =>
      config.permissions.adminPermissions.includes(permission)
    );
  }
  
  return false;
}

// 检查路由是否在白名单中
export function isWhiteListRoute(path: string, config: RouterConfig): boolean {
  return config.whiteList.includes(path);
}

// 获取模拟用户数据
export function getMockUserData(config: RouterConfig) {
  if (!config.mockUser.enabled) {
    return null;
  }
  
  return {
    token: config.mockUser.token,
    userInfo: config.mockUser.userData
  };
}

// 导出当前路由配置
export const routerConfig = generateRouterConfig();

// 开发环境日志
if (environmentConfig.enableDebug) {
  console.log('🔧 路由配置:', routerConfig);
}
