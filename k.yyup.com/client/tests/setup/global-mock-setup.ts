import { vi } from 'vitest'
import { setupRequestMock } from '../mocks/request.mock'
import { initAuthMock } from '../mocks/auth.mock'

/**
 * 全局Mock配置
 * 在所有测试开始前设置
 */

// 设置全局环境变量
process.env.NODE_ENV = 'test'

// 设置request模块Mock
setupRequestMock()

// 设置认证Mock
initAuthMock()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
})

// Mock console.log（减少测试输出噪音）
const originalConsole = { ...console }
global.console = {
  ...originalConsole,
  log: vi.fn((...args) => {
    if (process.env.VERBOSE_TESTS === 'true') {
      originalConsole.log(...args)
    }
  }),
  warn: vi.fn((...args) => {
    if (process.env.VERBOSE_TESTS === 'true') {
      originalConsole.warn(...args)
    }
  }),
  error: vi.fn((...args) => {
    if (process.env.VERBOSE_TESTS === 'true') {
      originalConsole.error(...args)
    }
  }),
}

// Mock window.open
Object.defineProperty(window, 'open', {
  value: vi.fn(),
  writable: true,
})

// Mock fetch（如果不使用axios的话）
global.fetch = vi.fn()

console.log('✅ 全局Mock配置已加载')

export {
  localStorageMock,
  sessionStorageMock
}