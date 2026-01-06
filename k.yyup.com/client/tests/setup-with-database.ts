import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { config } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import axios from 'axios'

// 导入Mock系统（作为降级选项）
import { initAuthMock, setCurrentTestUser, clearAuth } from './mocks/auth.mock'
import { initApiMock, resetApiMocks } from './mocks/api.mock'
import { initDomMock, resetDomMock } from './mocks/dom.mock'

// 数据库测试配置
const TEST_DB_CONFIG = {
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '3306'),
  username: process.env.TEST_DB_USER || 'root',
  password: process.env.TEST_DB_PASSWORD || '',
  database: process.env.TEST_DB_NAME || 'kindergarten_test'
}

// API测试配置
const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api'

// 创建测试用的axios实例
export const testApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 测试数据库连接
export async function setupTestDatabase() {
  try {
    console.log('🔧 设置测试数据库...')
    
    // 检查数据库连接
    const response = await testApiClient.get('/health')
    if (response.data.status !== 'ok') {
      throw new Error('数据库连接失败')
    }
    
    console.log('✅ 测试数据库连接成功')
    return true
  } catch (error) {
    console.warn('⚠️ 无法连接到测试数据库，使用Mock数据:', error.message)
    return false
  }
}

// 清理测试数据
export async function cleanupTestData() {
  try {
    console.log('🧹 清理测试数据...')
    
    // 清理测试用户数据
    await testApiClient.delete('/test/cleanup-users')
    
    // 清理测试权限数据
    await testApiClient.delete('/test/cleanup-permissions')
    
    // 清理测试菜单数据
    await testApiClient.delete('/test/cleanup-menus')
    
    console.log('✅ 测试数据清理完成')
  } catch (error) {
    console.warn('⚠️ 清理测试数据失败:', error.message)
  }
}

// 创建测试用户
export async function createTestUser(userData = {}) {
  try {
    const defaultUserData = {
      username: `test_user_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'test123456',
      role: 'admin',
      permissions: ['*'],
      ...userData
    }
    
    const response = await testApiClient.post('/test/create-user', defaultUserData)
    return response.data
  } catch (error) {
    console.error('创建测试用户失败:', error)
    throw error
  }
}

// 创建测试权限数据
export async function createTestPermissions() {
  try {
    const permissions = [
      { code: 'DASHBOARD_VIEW', name: '查看仪表板', description: '允许查看仪表板页面' },
      { code: 'USER_VIEW', name: '查看用户', description: '允许查看用户列表' },
      { code: 'USER_CREATE', name: '创建用户', description: '允许创建新用户' },
      { code: 'USER_EDIT', name: '编辑用户', description: '允许编辑用户信息' },
      { code: 'USER_DELETE', name: '删除用户', description: '允许删除用户' }
    ]
    
    const response = await testApiClient.post('/test/create-permissions', { permissions })
    return response.data
  } catch (error) {
    console.error('创建测试权限失败:', error)
    throw error
  }
}

// 创建测试菜单数据
export async function createTestMenus() {
  try {
    const menus = [
      {
        name: 'Dashboard',
        chineseName: '仪表板',
        code: 'DASHBOARD',
        path: '/dashboard',
        icon: 'Dashboard',
        type: 'menu',
        sort: 1
      },
      {
        name: 'User Management',
        chineseName: '用户管理',
        code: 'USER_MANAGEMENT',
        path: '/users',
        icon: 'User',
        type: 'menu',
        sort: 2
      }
    ]
    
    const response = await testApiClient.post('/test/create-menus', { menus })
    return response.data
  } catch (error) {
    console.error('创建测试菜单失败:', error)
    throw error
  }
}

// Element Plus组件Stub（用于单元测试）
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
  'router-link': {
    template: '<a v-bind="$attrs"><slot /></a>',
    props: ['to']
  },
  'router-view': {
    template: '<div class="router-view-stub"><slot /></div>'
  }
}

// 全局插件
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

// 全局mocks
config.global.mocks = {
  $t: (key: string) => key,
  $route: mockRoute,
  $router: mockRouter
}

// 设置测试环境
process.env.NODE_ENV = 'test';

// 数据库连接状态
let dbConnected = false

// 全局设置
beforeAll(async () => {
  console.log('🚀 初始化测试环境...')
  
  // 初始化DOM Mock
  initDomMock()
  
  // 尝试连接数据库
  dbConnected = await setupTestDatabase()
  
  if (dbConnected) {
    console.log('✅ 使用真实数据库进行测试')
    
    // 创建测试数据
    await createTestPermissions()
    await createTestMenus()
  } else {
    console.log('⚠️ 使用Mock数据进行测试')
    
    // 初始化Mock系统
    initAuthMock()
    initApiMock()
  }
  
  console.log('✅ 测试环境初始化完成')
})

afterAll(async () => {
  console.log('🧹 清理测试环境...')
  
  if (dbConnected) {
    await cleanupTestData()
  }
  
  // 清理Mock系统
  if (!dbConnected) {
    clearAuth()
    resetApiMocks()
  }
  resetDomMock()
  
  console.log('✅ 测试环境清理完成')
})

// 每个测试前的设置
beforeEach(async () => {
  // 设置测试用户
  if (dbConnected) {
    try {
      // 创建测试用户并获取token
      const testUser = await createTestUser()
      testApiClient.defaults.headers.common['Authorization'] = `Bearer ${testUser.token}`
    } catch (error) {
      console.warn('创建测试用户失败，使用默认用户:', error.message)
    }
  } else {
    // 使用Mock用户
    setCurrentTestUser('admin')
  }
})

// 每个测试后的清理
afterEach(() => {
  // 清理定时器
  vi.clearAllTimers()
  
  // 清理所有mock
  vi.clearAllMocks()
  
  // 重置API客户端
  if (dbConnected) {
    delete testApiClient.defaults.headers.common['Authorization']
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
})

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
}))

// 模拟 URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn()
}

// 全局测试工具函数
export const testUtils = {
  // 等待Vue更新
  nextTick: () => new Promise(resolve => setTimeout(resolve, 0)),

  // 等待指定时间
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // 创建测试用户数据
  createTestUser: async (userData = {}) => {
    if (dbConnected) {
      return await createTestUser(userData)
    } else {
      return {
        id: Math.floor(Math.random() * 10000),
        username: `test_user_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        role: 'admin',
        permissions: ['*'],
        token: 'mock-token'
      }
    }
  },

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

  // 检查是否使用真实数据库
  isUsingRealDatabase: () => dbConnected,

  // 获取测试API客户端
  getTestApiClient: () => testApiClient
}

// 导出数据库配置供其他文件使用
export { TEST_DB_CONFIG, API_BASE_URL }