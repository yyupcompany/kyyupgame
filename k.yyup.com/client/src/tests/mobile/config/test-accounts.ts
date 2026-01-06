/**
 * 移动端测试账号配置
 * 用于移动端自动化测试的账号配置
 */

export interface TestAccount {
  username: string
  password: string
  role: string
  displayName?: string
}

export const mobileTestAccounts = {
  parent: {
    username: 'test_mobile_parent',
    password: 'Test@123',
    role: 'parent',
    displayName: '测试家长账号'
  },
  teacher: {
    username: 'test_mobile_teacher',
    password: 'Test@123',
    role: 'teacher',
    displayName: '测试教师账号'
  },
  principal: {
    username: 'test_mobile_principal',
    password: 'Test@123',
    role: 'principal',
    displayName: '测试园长账号'
  },
  admin: {
    username: 'test_mobile_admin',
    password: 'Test@123',
    role: 'admin',
    displayName: '测试管理员账号'
  }
}

/**
 * 移动端测试环境配置
 */
export const mobileTestConfig = {
  baseUrl: process.env.MOBILE_TEST_BASE_URL || 'http://localhost:3000',
  viewport: {
    width: 375,
    height: 667
  },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  timeout: 30000,
  retries: 2
}

/**
 * 获取指定角色的测试账号
 */
export function getTestAccount(role: keyof typeof mobileTestAccounts): TestAccount {
  return mobileTestAccounts[role]
}

/**
 * 获取所有测试账号
 */
export function getAllTestAccounts(): TestAccount[] {
  return Object.values(mobileTestAccounts)
}
