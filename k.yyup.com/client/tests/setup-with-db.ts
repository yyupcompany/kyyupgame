import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { config } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import axios from 'axios'

// 导入Mock系统（作为备用）
import { initAuthMock, setCurrentTestUser, clearAuth } from './mocks/auth.mock'
import { initApiMock, resetApiMocks } from './mocks/api.mock'
import { initDomMock, resetDomMock } from './mocks/dom.mock'

// Mock Element Plus components for testing
config.global.stubs = {
  'el-form': {
    template: '<form><slot /></form>',
    props: ['model', 'rules']
  },
  'el-form-item': {
    template: '<div class="el-form-item"><slot /></div>',
    props: ['prop']
  },
  'el-input': {
    template: '<input class="el-input-stub" :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'type', 'placeholder', 'disabled', 'size', 'clearable'],
    emits: ['update:modelValue', 'change', 'blur', 'focus']
  },
  'el-textarea': {
    template: '<textarea class="el-textarea-stub" :value="modelValue" :placeholder="placeholder" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
    props: ['modelValue', 'placeholder', 'disabled', 'rows', 'autosize'],
    emits: ['update:modelValue', 'change', 'blur', 'focus']
  },
  'el-button': {
    template: '<button :type="nativeType" @click="$emit(\'click\')"><slot /></button>',
    props: ['type', 'loading', 'nativeType'],
    emits: ['click']
  },
  'el-table': {
    template: '<table><slot /></table>',
    props: ['data']
  },
  'el-table-column': {
    template: '<td><slot /></td>',
    props: ['prop', 'label']
  },
  'el-select': {
    template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
    props: ['modelValue', 'placeholder'],
    emits: ['update:modelValue']
  },
  'el-option': {
    template: '<option :value="value"><slot /></option>',
    props: ['label', 'value']
  },
  'el-dialog': {
    template: '<div v-if="modelValue" class="el-dialog"><slot /><slot name="footer" /></div>',
    props: ['modelValue', 'title'],
    emits: ['update:modelValue']
  },
  'el-date-picker': {
    template: '<input type="date" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'type'],
    emits: ['update:modelValue']
  },
  'el-input-number': {
    template: '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
    props: ['modelValue', 'min'],
    emits: ['update:modelValue']
  },
  'el-icon': {
    template: '<span class="el-icon"><slot /></span>'
  },
  'el-card': {
    template: '<div class="el-card-stub" v-bind="$attrs"><slot /></div>',
    props: ['shadow']
  },
  'el-tag': {
    template: '<span class="el-tag-stub" v-bind="$attrs"><slot /></span>',
    props: ['size', 'type']
  },
  'el-descriptions': {
    template: '<div class="el-descriptions" v-bind="$attrs"><div class="el-descriptions__body"><table class="el-descriptions__table is-bordered"><tbody><tr><td class="el-descriptions__cell el-descriptions__label is-bordered-label" colspan="1">查询类型</td><td class="el-descriptions__cell el-descriptions__content is-bordered-content" colspan="1"><span class="el-tag-stub" size="small" type="primary">SELECT</span></td><td class="el-descriptions__cell el-descriptions__label is-bordered-label" colspan="1">涉及表</td><td class="el-descriptions__cell el-descriptions__content is-bordered-content" colspan="1">students</td><td class="el-descriptions__cell el-descriptions__label is-bordered-label" colspan="1">预估耗时</td><td class="el-descriptions__cell el-descriptions__content is-bordered-content" colspan="1">150ms </td></tr></tbody></table></div></div>',
    props: ['size']
  },
  'router-link': {
    template: '<a v-bind="$attrs"><slot /></a>',
    props: ['to']
  },
  'router-view': {
    template: '<div class="router-view-stub"><slot /></div>'
  }
}

// Global plugins
config.global.plugins = [ElementPlus, createPinia()]

// Mock Vue Router
const mockRoute = {
  path: '/',
  params: {},
  query: {},
  meta: {},
  name: 'home',
  fullPath: '/',
  matched: [],
  hash: '',
  redirectedFrom: undefined
}

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: { value: mockRoute },
  resolve: vi.fn(),
  addRoute: vi.fn(),
  removeRoute: vi.fn(),
  hasRoute: vi.fn(),
  getRoutes: vi.fn(() => [])
}

// Global mocks
config.global.mocks = {
  $t: (key: string) => key,
  $route: mockRoute,
  $router: mockRouter
}

// 设置测试环境
process.env.NODE_ENV = 'test';

// 数据库测试配置
const TEST_DB_CONFIG = {
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '3306'),
  username: process.env.TEST_DB_USER || 'root',
  password: process.env.TEST_DB_PASSWORD || 'password',
  database: process.env.TEST_DB_NAME || 'kindergarten_test'
}

// API基础URL配置
const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api'

// 创建真实的axios实例用于数据库测试
const testAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 全局模拟
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ResizeObserver 和 IntersectionObserver 已在 DOM Mock 中处理

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
} as Storage;
global.localStorage = localStorageMock;

// 模拟 sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
} as Storage;
global.sessionStorage = sessionStorageMock;

// 模拟 fetch (将在initApiMock中重新设置)
global.fetch = vi.fn();

// Mock date-fns format function
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr = 'yyyy-MM-dd') => {
    const d = new Date(date)
    if (formatStr === 'yyyy-MM-dd') {
      return d.toISOString().split('T')[0]
    }
    if (formatStr === 'yyyy-MM-dd HH:mm:ss') {
      return d.toISOString().replace('T', ' ').split('.')[0]
    }
    if (formatStr === 'YYYY年MM月DD日') {
      return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`
    }
    return d.toISOString().split('T')[0]
  })
}));

// 模拟 URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn()
}

// 数据库测试工具函数
export const dbTestUtils = {
  // 测试数据库连接
  async testConnection() {
    try {
      const response = await testAxiosInstance.get('/health')
      return response.status === 200
    } catch (error) {
      console.warn('数据库连接测试失败:', error)
      return false
    }
  },

  // 创建测试用户
  async createTestUser(userData = {}) {
    const defaultUserData = {
      username: `test_user_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      role: 'user',
      password: 'test123',
      status: 'active',
      ...userData
    }

    try {
      const response = await testAxiosInstance.post('/auth/register', defaultUserData)
      return response.data
    } catch (error) {
      console.error('创建测试用户失败:', error)
      throw error
    }
  },

  // 删除测试用户
  async deleteTestUser(userId: number) {
    try {
      await testAxiosInstance.delete(`/users/${userId}`)
    } catch (error) {
      console.error('删除测试用户失败:', error)
      throw error
    }
  },

  // 创建测试角色
  async createTestRole(roleData = {}) {
    const defaultRoleData = {
      name: `test_role_${Date.now()}`,
      code: `TEST_ROLE_${Date.now()}`,
      description: 'Test role for database testing',
      status: 1,
      ...roleData
    }

    try {
      const response = await testAxiosInstance.post('/roles', defaultRoleData)
      return response.data
    } catch (error) {
      console.error('创建测试角色失败:', error)
      throw error
    }
  },

  // 删除测试角色
  async deleteTestRole(roleId: number) {
    try {
      await testAxiosInstance.delete(`/roles/${roleId}`)
    } catch (error) {
      console.error('删除测试角色失败:', error)
      throw error
    }
  },

  // 创建测试权限
  async createTestPermission(permissionData = {}) {
    const defaultPermissionData = {
      name: `test_permission_${Date.now()}`,
      code: `TEST_PERMISSION_${Date.now()}`,
      description: 'Test permission for database testing',
      status: 1,
      ...permissionData
    }

    try {
      const response = await testAxiosInstance.post('/permissions', defaultPermissionData)
      return response.data
    } catch (error) {
      console.error('创建测试权限失败:', error)
      throw error
    }
  },

  // 删除测试权限
  async deleteTestPermission(permissionId: number) {
    try {
      await testAxiosInstance.delete(`/permissions/${permissionId}`)
    } catch (error) {
      console.error('删除测试权限失败:', error)
      throw error
    }
  },

  // 清理测试数据
  async cleanupTestData() {
    try {
      // 删除所有测试用户
      await testAxiosInstance.delete('/test/users/cleanup')
      // 删除所有测试角色
      await testAxiosInstance.delete('/test/roles/cleanup')
      // 删除所有测试权限
      await testAxiosInstance.delete('/test/permissions/cleanup')
    } catch (error) {
      console.warn('清理测试数据失败:', error)
    }
  },

  // 获取测试用的认证token
  async getTestAuth(credentials = { username: 'admin', password: 'admin123' }) {
    try {
      const response = await testAxiosInstance.post('/auth/login', credentials)
      return response.data.token
    } catch (error) {
      console.error('获取测试token失败:', error)
      throw error
    }
  },

  // 设置认证头
  setAuthHeader(token: string) {
    testAxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  },

  // 清除认证头
  clearAuthHeader() {
    delete testAxiosInstance.defaults.headers.common['Authorization']
  }
}

// 全局测试工具函数
export const testUtils = {
  // 等待Vue更新
  nextTick: () => new Promise(resolve => setTimeout(resolve, 0)),

  // 等待指定时间
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // 创建测试用户数据
  createTestUser: () => ({
    id: Math.floor(Math.random() * 10000),
    username: `test_user_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    role: 'user',
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),

  // 模拟API响应
  mockApiResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    headers: new Headers(),
  }),

  // 模拟路由
  mockRoute: (overrides: any = {}) => ({
    path: '/',
    name: 'home',
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    matched: [],
    meta: {},
    redirectedFrom: undefined,
    ...overrides
  }),

  // 清理所有模拟
  clearAllMocks: () => {
    vi.clearAllMocks();
    (localStorageMock.getItem as any).mockClear?.();
    (localStorageMock.setItem as any).mockClear?.();
    (localStorageMock.removeItem as any).mockClear?.();
    (localStorageMock.clear as any).mockClear?.();
    (sessionStorageMock.getItem as any).mockClear?.();
    (sessionStorageMock.setItem as any).mockClear?.();
    (sessionStorageMock.removeItem as any).mockClear?.();
    (sessionStorageMock.clear as any).mockClear?.();
    resetApiMocks();
    resetDomMock();
  },

  // 数据库测试工具
  db: dbTestUtils
}

// 全局设置
beforeAll(async () => {
  console.log('🚀 初始化测试环境（包含数据库）...')

  // 初始化DOM Mock (必须最先初始化)
  initDomMock()

  // 初始化认证Mock
  initAuthMock()

  // 初始化API Mock
  initApiMock()

  // 测试数据库连接
  const dbConnected = await dbTestUtils.testConnection()
  if (dbConnected) {
    console.log('✅ 数据库连接成功')
  } else {
    console.warn('⚠️ 数据库连接失败，将使用Mock数据')
  }

  console.log('✅ 测试环境初始化完成')
});

afterAll(async () => {
  // 测试结束后的全局清理
  console.log('🧹 清理测试环境...')
  
  // 清理测试数据
  try {
    await dbTestUtils.cleanupTestData()
    console.log('✅ 测试数据清理完成')
  } catch (error) {
    console.warn('⚠️ 测试数据清理失败:', error)
  }
});

// 每个测试前的设置
beforeEach(async () => {
  // 重置认证状态
  setCurrentTestUser('admin')

  // 清理所有模拟
  testUtils.clearAllMocks();

  // 重置DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';

  // 为每个测试创建新的数据库事务
  try {
    await testAxiosInstance.post('/test/transaction/begin')
  } catch (error) {
    console.warn('⚠️ 创建数据库事务失败:', error)
  }
});

// 每个测试后的清理
afterEach(async () => {
  // 清理定时器
  vi.clearAllTimers();

  // 清理所有模拟
  testUtils.clearAllMocks();

  // 回滚数据库事务
  try {
    await testAxiosInstance.post('/test/transaction/rollback')
  } catch (error) {
    console.warn('⚠️ 回滚数据库事务失败:', error)
  }
});

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason);
});