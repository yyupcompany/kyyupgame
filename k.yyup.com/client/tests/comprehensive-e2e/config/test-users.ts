/**
 * 测试用户配置
 * 定义四个角色的测试账号和预期行为
 */

export type UserRole = 'admin' | 'principal' | 'teacher' | 'parent'

export interface TestUser {
  username: string
  password: string
  role: UserRole
  realName: string
  expectedHomePage: string
  expectedMobileHomePage: string
}

/**
 * 测试用户配置
 *
 * 注意：这些用户需要在测试数据中存在
 * 可以通过 npm run seed-data:complete 初始化
 */
export const TEST_USERS: Record<UserRole, TestUser> = {
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    realName: '系统管理员',
    expectedHomePage: '/dashboard',
    expectedMobileHomePage: '/mobile/centers'
  },
  principal: {
    username: 'principal',
    password: 'principal123',
    role: 'principal',
    realName: '园长',
    expectedHomePage: '/dashboard',
    expectedMobileHomePage: '/mobile/centers'
  },
  teacher: {
    username: 'teacher',
    password: 'teacher123',
    role: 'teacher',
    realName: '测试教师',
    expectedHomePage: '/teacher-center/dashboard',
    expectedMobileHomePage: '/mobile/teacher-center/dashboard'
  },
  parent: {
    username: 'parent',
    password: 'parent123',
    role: 'parent',
    realName: '测试家长',
    expectedHomePage: '/parent-center/dashboard',
    expectedMobileHomePage: '/mobile/parent-center/dashboard'
  }
}

/**
 * 角色权限配置
 */
export const ROLE_PERMISSIONS = {
  admin: ['*'], // 全部权限
  principal: [
    'dashboard:view',
    'centers:view',
    'teacher-center:view',
    'student:view',
    'class:view',
    'activity:view',
    'parent-center:view',
    'enrollment:view',
    'marketing:view',
    'finance:view',
    'assessment-analytics:view'
  ],
  teacher: [
    'dashboard:view',
    'teacher-center:view',
    'class:view',
    'student:view',
    'activity:view',
    'attendance:view',
    'teaching:view',
    'student-assessment:view'
  ],
  parent: [
    'dashboard:view',
    'parent-center:view',
    'student:view',
    'activity:view',
    'communication:view',
    'payment:view'
  ]
}

/**
 * 角色描述
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: '系统管理员 - 拥有所有权限，可访问所有功能',
  principal: '园长 - 管理层权限，可访问大部分管理功能',
  teacher: '教师 - 教学权限，专注于教学相关功能',
  parent: '家长 - 基础权限，查看孩子相关信息和参与活动'
}
