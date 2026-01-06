/**
 * 统一的Mock配置
 * 自动为所有测试配置所需的Mock
 */

import { vi } from 'vitest'
import { setupRequestMock, resetRequestMocks } from '../mocks/request.mock'
import { setupEndpointsMock, resetEndpointsMock } from '../mocks/endpoints.mock'

/**
 * 设置所有Mock配置
 * 在测试文件开始前调用
 */
export function setupAllMocks() {
  console.log('🚀 初始化测试Mock系统...')

  // 设置Request Mock
  const requestMock = setupRequestMock()

  // 设置Endpoints Mock
  const endpointsMock = setupEndpointsMock()

  // Mock Element Plus（如果需要）
  vi.mock('element-plus', async () => {
    const actual = await vi.importActual('element-plus')
    return {
      ...actual,
      ElMessage: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn()
      },
      ElMessageBox: {
        alert: vi.fn().mockResolvedValue('confirm'),
        confirm: vi.fn().mockResolvedValue('confirm'),
        prompt: vi.fn().mockResolvedValue({ value: 'test' })
      },
      ElNotification: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn()
      }
    }
  })

  // Mock Pinia
  vi.mock('pinia', async () => {
    const actual = await vi.importActual('pinia')
    return {
      ...actual,
      createPinia: vi.fn(() => ({
        install: vi.fn()
      }))
    }
  })

  // Mock Vue Router
  vi.mock('vue-router', async () => {
    const actual = await vi.importActual('vue-router')
    return {
      ...actual,
      useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        go: vi.fn(),
        back: vi.fn(),
        forward: vi.fn()
      })),
      useRoute: vi.fn(() => ({
        path: '/',
        params: {},
        query: {},
        meta: {}
      }))
    }
  })

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString() },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { store = {} }
    }
  })()

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })

  // Mock sessionStorage
  const sessionStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString() },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { store = {} }
    }
  })()

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock
  })

  // Mock window.scrollTo
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true
  })

  // Mock window.location (部分)
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:5173',
      origin: 'http://localhost:5173',
      pathname: '/',
      search: '',
      hash: '',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn()
    },
    writable: true
  })

  console.log('✅ DOM Mock系统已初始化')
  console.log('✅ API Mock系统已初始化')
  console.log('✅ 测试Mock系统初始化完成')

  return {
    requestMock,
    endpointsMock,
    localStorageMock,
    sessionStorageMock
  }
}

/**
 * 重置所有Mock配置
 * 在测试文件结束后调用
 */
export function resetAllMocks() {
  console.log('🔄 API Mock已重置')
  console.log('🔄 AsyncStorage Mock已重置')
  console.log('🔄 DOM Mock已重置')

  // 重置Vitest mocks
  vi.clearAllMocks()

  // 重置自定义Mock
  resetRequestMocks()
  resetEndpointsMock()
}

/**
 * Vitest测试前的全局设置
 */
export function beforeTestSetup() {
  setupAllMocks()
}

/**
 * Vitest测试后的全局清理
 */
export function afterTestCleanup() {
  resetAllMocks()
}

/**
 * 为特定测试设置Mock的便捷函数
 */
export function setupTestMocks(testType: 'unit' | 'integration' | 'e2e' = 'unit') {
  switch (testType) {
    case 'unit':
      // 单元测试 - 最小化的Mock
      setupRequestMock()
      setupEndpointsMock()
      break

    case 'integration':
      // 集成测试 - 完整的Mock
      setupAllMocks()
      break

    case 'e2e':
      // 端到端测试 - 最少的Mock，使用真实环境
      console.log('🌐 E2E测试模式 - 使用真实环境')
      break

    default:
      setupAllMocks()
  }
}

// 默认导出
export default {
  setupAllMocks,
  resetAllMocks,
  setupTestMocks,
  beforeTestSetup,
  afterTestCleanup
}

// 在模块加载时自动设置（可选）
// if (typeof window !== 'undefined') {
//   setupAllMocks()
// }