import { vi } from 'vitest'

/**
 * 统一的认证Mock系统
 * 解决测试环境中的认证问题
 */

// 标准测试Token
export const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjEiLCJuYW1lIjoiYWRtaW4iLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZXhwIjo5OTk5OTk5OTk5LCJkZXZNb2RlIjp0cnVlfQ.mockSignatureForDevAndTestingPurposesOnly'

// 测试用户数据
export const TEST_USERS = {
  admin: {
    id: 121,
    username: 'admin',
    role: 'admin',
    name: '系统管理员',
    email: 'admin@kindergarten.com',
    avatar: '/avatars/admin.png',
    status: 'active',
    isAdmin: true,
    kindergartenId: 1,
    permissions: ['*', 'admin:*', 'user:*', 'system:*']
  },
  teacher: {
    id: 122,
    username: 'teacher',
    role: 'teacher',
    name: '测试教师',
    email: 'teacher@kindergarten.com',
    avatar: '/avatars/teacher.png',
    status: 'active',
    isAdmin: false,
    kindergartenId: 1,
    permissions: ['class:read', 'student:read', 'attendance:write']
  },
  parent: {
    id: 123,
    username: 'parent',
    role: 'parent',
    name: '测试家长',
    email: 'parent@kindergarten.com',
    avatar: '/avatars/parent.png',
    status: 'active',
    isAdmin: false,
    kindergartenId: 1,
    permissions: ['child:read', 'notice:read']
  }
}

// 当前测试用户（默认为admin）
let currentTestUser = TEST_USERS.admin

/**
 * 设置当前测试用户
 */
export function setCurrentTestUser(role: keyof typeof TEST_USERS) {
  currentTestUser = TEST_USERS[role]
  
  // 更新localStorage中的用户信息
  if (typeof window !== 'undefined') {
    localStorage.setItem('kindergarten_token', TEST_TOKEN)
    localStorage.setItem('token', TEST_TOKEN)
    localStorage.setItem('auth_token', TEST_TOKEN)
    localStorage.setItem('kindergarten_user_info', JSON.stringify(currentTestUser))
    localStorage.setItem('user_info', JSON.stringify(currentTestUser))
  }
  
  return currentTestUser
}

/**
 * 获取当前测试用户
 */
export function getCurrentTestUser() {
  return currentTestUser
}

/**
 * 清除认证信息
 */
export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('kindergarten_token')
    localStorage.removeItem('token')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('kindergarten_user_info')
    localStorage.removeItem('user_info')
  }
}

/**
 * 初始化认证Mock
 */
export function initAuthMock() {
  // 设置默认用户
  setCurrentTestUser('admin')
  
  // Mock用户store相关方法
  const mockUserStore = {
    userInfo: currentTestUser,
    token: TEST_TOKEN,
    isLoggedIn: true,
    permissions: currentTestUser.permissions,
    
    // Mock方法
    login: vi.fn().mockResolvedValue({
      success: true,
      data: {
        token: TEST_TOKEN,
        user: currentTestUser
      }
    }),
    
    logout: vi.fn().mockResolvedValue({ success: true }),
    
    getUserInfo: vi.fn().mockResolvedValue({
      success: true,
      data: currentTestUser
    }),
    
    checkPermission: vi.fn().mockImplementation((permission: string) => {
      return currentTestUser.permissions.includes('*') || 
             currentTestUser.permissions.includes(permission)
    }),
    
    hasRole: vi.fn().mockImplementation((role: string) => {
      return currentTestUser.role === role || currentTestUser.role === 'admin'
    })
  }
  
  return mockUserStore
}

/**
 * Mock认证相关的API调用
 */
export const authApiMocks = {
  // 登录API
  '/auth/login': {
    method: 'POST',
    response: () => ({
      success: true,
      data: {
        token: TEST_TOKEN,
        user: currentTestUser,
        expiresIn: 86400
      },
      message: '登录成功'
    })
  },
  
  // 获取用户信息
  '/auth/profile': {
    method: 'GET',
    response: () => ({
      success: true,
      data: currentTestUser,
      message: '获取用户信息成功'
    })
  },
  
  // 验证Token
  '/auth/verify-token': {
    method: 'GET',
    response: () => ({
      success: true,
      data: { valid: true, user: currentTestUser },
      message: 'Token有效'
    })
  },
  
  // 刷新Token
  '/auth/refresh-token': {
    method: 'POST',
    response: () => ({
      success: true,
      data: {
        token: TEST_TOKEN,
        expiresIn: 86400
      },
      message: 'Token刷新成功'
    })
  },
  
  // 登出
  '/auth/logout': {
    method: 'POST',
    response: () => ({
      success: true,
      message: '登出成功'
    })
  }
}

/**
 * 创建认证头
 */
export function createAuthHeaders() {
  return {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  }
}

/**
 * 检查是否有权限
 */
export function hasPermission(permission: string): boolean {
  return currentTestUser.permissions.includes('*') || 
         currentTestUser.permissions.includes(permission)
}

/**
 * 检查是否有角色
 */
export function hasRole(role: string): boolean {
  return currentTestUser.role === role || currentTestUser.role === 'admin'
}

// 导出默认配置
export default {
  TEST_TOKEN,
  TEST_USERS,
  setCurrentTestUser,
  getCurrentTestUser,
  clearAuth,
  initAuthMock,
  authApiMocks,
  createAuthHeaders,
  hasPermission,
  hasRole
}
