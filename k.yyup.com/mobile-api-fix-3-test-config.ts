/**
 * Mobile Test Configuration API 硬编码修复
 *
 * 问题：测试配置中存在硬编码的localhost地址和不完整的端点配置
 * 修复：使用环境变量配置和完整的mobile端点映射
 */

// === 问题代码 ===
// 文件: /client/src/tests/mobile/security/TC-032-CSRF-token-validation.test.ts
// 行: 374, 402, 429

// 原始代码 (环境依赖问题):
/*
const response = await fetch('http://localhost:3000/api/user/profile', {
const response = await fetch('http://localhost:3000/api/user/delete', {
const response = await fetch('http://localhost:3000/api/admin/users', {
*/

// 文件: /client/src/tests/mobile/setup/mobile-test-setup.ts
// 原始配置 (不完整):
/*
API_ENDPOINTS: {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  // 缺少mobile特定端点
}
*/

// === 修复方案 ===

// 1. 环境配置接口
export interface TestEnvironment {
  API_BASE_URL: string
  WEB_BASE_URL: string
  IS_CI: boolean
  IS_HEADLESS: boolean
  TIMEOUT: number
  RETRY_ATTEMPTS: number
}

// 2. 环境配置获取
export function getTestEnvironment(): TestEnvironment {
  return {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
    WEB_BASE_URL: process.env.WEB_BASE_URL || 'http://localhost:5173',
    IS_CI: process.env.CI === 'true',
    IS_HEADLESS: process.env.HEADLESS !== 'false',
    TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '30000'),
    RETRY_ATTEMPTS: parseInt(process.env.RETRY_ATTEMPTS || '3')
  }
}

// 3. 环境特定的URL生成器
export class TestUrlGenerator {
  private static env = getTestEnvironment()

  static apiUrl(path: string): string {
    return `${this.env.API_BASE_URL}${path}`
  }

  static webUrl(path: string = ''): string {
    return `${this.env.WEB_BASE_URL}${path}`
  }

  static get isLocal(): boolean {
    return this.env.API_BASE_URL.includes('localhost')
  }

  static get isCI(): boolean {
    return this.env.IS_CI
  }
}

// 4. 完整的Mobile API端点配置
import {
  MOBILE_AUTH_ENDPOINTS,
  MOBILE_PARENT_ENDPOINTS,
  MOBILE_TEACHER_ENDPOINTS,
  MOBILE_CENTER_ENDPOINTS,
  MOBILE_AI_ENDPOINTS,
  MOBILE_UPLOAD_ENDPOINTS
} from '@/api/endpoints/mobile'

export const MOBILE_TEST_ENDPOINTS = {
  // 认证相关
  AUTH: MOBILE_AUTH_ENDPOINTS,

  // 家长中心
  PARENT: MOBILE_PARENT_ENDPOINTS,

  // 教师中心
  TEACHER: MOBILE_TEACHER_ENDPOINTS,

  // 管理中心
  CENTER: MOBILE_CENTER_ENDPOINTS,

  // AI功能
  AI: MOBILE_AI_ENDPOINTS,

  // 文件上传
  UPLOAD: MOBILE_UPLOAD_ENDPOINTS,

  // 通用API (向后兼容)
  COMMON: {
    USER_PROFILE: '/api/user/profile',
    USER_DELETE: '/api/user/delete',
    ADMIN_USERS: '/api/admin/users',
    AUTH_LOGIN: '/api/auth/login',
    USER_PERMISSIONS: '/api/dynamic-permissions/user-permissions',
    PERMISSION_CHECK: '/api/dynamic-permissions/check-permission'
  }
} as const

// 5. 测试配置类
export class MobileTestConfig {
  private static env = getTestEnvironment()

  // 基础配置
  static get BASE_URL() {
    return TestUrlGenerator.webUrl()
  }

  static get API_BASE_URL() {
    return this.env.API_BASE_URL
  }

  // API端点
  static get ENDPOINTS() {
    return MOBILE_TEST_ENDPOINTS
  }

  // 请求配置
  static get REQUEST_CONFIG() {
    return {
      timeout: this.env.TIMEOUT,
      retryAttempts: this.env.RETRY_ATTEMPTS,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MobileTestAgent/1.0'
      }
    }
  }

  // 认证配置
  static get AUTH_CONFIG() {
    return {
      defaultUser: {
        username: process.env.TEST_USER || 'test_parent',
        password: process.env.TEST_PASSWORD || 'test123456',
        role: 'parent'
      },
      adminUser: {
        username: process.env.TEST_ADMIN || 'admin',
        password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
        role: 'admin'
      }
    }
  }
}

// 6. HTTP请求工具类
export class TestHttpClient {
  private static config = MobileTestConfig.REQUEST_CONFIG

  static async get(url: string, options?: RequestInit): Promise<Response> {
    return this.request(url, { method: 'GET', ...options })
  }

  static async post(url: string, data?: any, options?: RequestInit): Promise<Response> {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    })
  }

  static async put(url: string, data?: any, options?: RequestInit): Promise<Response> {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    })
  }

  static async delete(url: string, options?: RequestInit): Promise<Response> {
    return this.request(url, { method: 'DELETE', ...options })
  }

  private static async request(url: string, options?: RequestInit): Promise<Response> {
    const fullUrl = TestUrlGenerator.apiUrl(url)
    const finalOptions = {
      ...this.config,
      ...options,
      headers: {
        ...this.config.headers,
        ...options?.headers
      }
    }

    return fetch(fullUrl, finalOptions)
  }
}

// 7. 修复后的测试配置
export const TEST_CONFIG = {
  // 环境配置
  ENVIRONMENT: getTestEnvironment(),

  // URL配置
  URLS: {
    BASE: TestUrlGenerator.webUrl(),
    API_BASE: TestUrlGenerator.apiUrl(''),
    API_LOGIN: TestUrlGenerator.apiUrl(MobileTestConfig.ENDPOINTS.AUTH.LOGIN),
    API_USER_PROFILE: TestUrlGenerator.apiUrl(MobileTestConfig.ENDPOINTS.COMMON.USER_PROFILE),
    API_USER_DELETE: TestUrlGenerator.apiUrl(MobileTestConfig.ENDPOINTS.COMMON.USER_DELETE),
    API_ADMIN_USERS: TestUrlGenerator.apiUrl(MobileTestConfig.ENDPOINTS.COMMON.ADMIN_USERS)
  },

  // 认证配置
  AUTH: MobileTestConfig.AUTH_CONFIG,

  // API端点
  ENDPOINTS: MobileTestConfig.ENDPOINTS,

  // HTTP客户端
  HTTP: TestHttpClient
} as const

// 8. 修复后的测试用例示例
export async function exampleTestUsage() {
  console.log('🧪 测试配置示例...')

  // 使用配置的URL
  const profileResponse = await TEST_CONFIG.HTTP.get('/user/profile')

  // 使用端点配置
  const loginResponse = await TEST_CONFIG.HTTP.post(
    TEST_CONFIG.ENDPOINTS.AUTH.LOGIN,
    {
      username: TEST_CONFIG.AUTH.defaultUser.username,
      password: TEST_CONFIG.AUTH.defaultUser.password
    }
  )

  // 使用mobile特定端点
  const parentDashboardResponse = await TEST_CONFIG.HTTP.get(
    TEST_CONFIG.ENDPOINTS.PARENT.DASHBOARD
  )

  console.log('✅ 测试配置示例完成')

  return {
    profile: profileResponse.status,
    login: loginResponse.status,
    dashboard: parentDashboardResponse.status
  }
}

// === 修复效果 ===
// 1. ✅ 消除了硬编码的localhost地址
// 2. ✅ 支持多环境配置 (CI/CD, 本地开发)
// 3. ✅ 提供了完整的mobile端点配置
// 4. ✅ 实现了类型安全的HTTP客户端
// 5. ✅ 支持环境变量配置
// 6. ✅ 向后兼容现有测试代码
// 7. ✅ 提供了统一的配置管理

// === 环境变量配置示例 ===
/*
// .env.test
API_BASE_URL=http://localhost:3000
WEB_BASE_URL=http://localhost:5173
CI=false
HEADLESS=true
TEST_TIMEOUT=30000
RETRY_ATTEMPTS=3
TEST_USER=test_parent
TEST_PASSWORD=test123456
TEST_ADMIN=admin
TEST_ADMIN_PASSWORD=admin123
*/

// .env.ci
/*
API_BASE_URL=http://api-server:3000
WEB_BASE_URL=http://frontend:5173
CI=true
HEADLESS=true
TEST_TIMEOUT=60000
RETRY_ATTEMPTS=5
*/