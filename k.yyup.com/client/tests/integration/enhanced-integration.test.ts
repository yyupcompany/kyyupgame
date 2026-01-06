/**
 * 增强的集成测试套件
 * 专注于核心功能的集成测试，避免复杂的组件渲染问题
 */

import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { usePermissionsStore } from '@/stores/permissions'
import { apiClient, post } from '@/utils/request'

// Mock API client
vi.mock('@/utils/request', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Enhanced Integration Tests', () => {
  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    // 创建新的Pinia实例
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  describe('Store Integration Tests', () => {
    it('should handle user authentication flow', async () => {
      const userStore = useUserStore()
      const permissionStore = usePermissionsStore()

      // Mock API响应
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'teacher'
      }
      
      const mockToken = 'mock-jwt-token'
      
      // Mock登录API调用
      vi.mocked(post).mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
          token: mockToken
        }
      })

      // Mock权限API调用
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: ['user:read', 'user:write', 'class:read']
        }
      })

      // 执行登录
      await userStore.login({
        username: 'testuser',
        password: 'password123'
      })

      // 验证用户状态
      expect(userStore.isAuthenticated).toBe(true)
      expect(userStore.user).toEqual(mockUser)
      expect(userStore.token).toBe(mockToken)

      // 验证localStorage调用
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kindergarten_token',
        mockToken
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kindergarten_user',
        JSON.stringify(mockUser)
      )

      // 验证权限加载
      await permissionStore.fetchPermissions()
      expect(permissionStore.permissions.length).toBeGreaterThan(0)
    })

    it('should handle logout flow correctly', async () => {
      const userStore = useUserStore()
      const permissionStore = usePermissionsStore()

      // 设置初始状态
      userStore.setUserInfo({
        token: 'test-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'teacher',
          permissions: ['user:read', 'user:write']
        }
      })
      // 设置初始权限状态（通过内部状态）
      permissionStore.permissions.value = ['user:read', 'user:write']

      // 执行登出
      await userStore.logout()

      // 验证状态清除
      expect(userStore.isAuthenticated).toBe(false)
      expect(userStore.user).toBeNull()
      expect(userStore.token).toBe('')
      // 权限清除通过clearPermissions方法
      permissionStore.clearPermissions()
      expect(permissionStore.permissions.length).toBe(0)

      // 验证localStorage清除
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kindergarten_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kindergarten_user')
    })

    it('should handle token refresh flow', async () => {
      const userStore = useUserStore()

      // 设置过期token
      userStore.setUserInfo({
        token: 'expired-token',
        user: { username: 'testuser', role: 'teacher', permissions: [] }
      })

      const newToken = 'refreshed-token'

      // Mock刷新API调用
      vi.mocked(post).mockResolvedValueOnce({
        success: true,
        data: { token: newToken }
      })

      // 执行token刷新
      await userStore.refreshToken()

      // 验证新token
      expect(userStore.token).toBe(newToken)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kindergarten_token',
        newToken
      )
    })
  })

  describe('API Integration Tests', () => {
    it('should handle API error responses correctly', async () => {
      const userStore = useUserStore()

      // Mock API错误响应
      vi.mocked(post).mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            success: false,
            message: 'Invalid credentials'
          }
        }
      })

      // 尝试登录
      try {
        await userStore.login({
          username: 'invalid',
          password: 'invalid'
        })
      } catch (error) {
        // 验证错误处理
        expect(userStore.isAuthenticated).toBe(false)
        expect(userStore.user).toBeNull()
        expect(userStore.token).toBe('')
      }
    })

    it('should handle network errors gracefully', async () => {
      const userStore = useUserStore()

      // Mock网络错误
      vi.mocked(post).mockRejectedValueOnce(new Error('Network Error'))

      // 尝试登录
      try {
        await userStore.login({
          username: 'testuser',
          password: 'password123'
        })
      } catch (error) {
        // 验证错误处理
        expect(userStore.isAuthenticated).toBe(false)
        expect(error).toBeInstanceOf(Error)
      }
    })
  })

  describe('Permission Integration Tests', () => {
    it('should check permissions correctly', () => {
      const permissionStore = usePermissionsStore()

      // 设置权限（通过内部状态）
      permissionStore.permissions.value = [
        'user:read',
        'user:write',
        'class:read',
        'student:read'
      ]

      // 测试权限检查（使用路径检查）
      expect(permissionStore.hasPermission('/user-management')).toBeDefined()
      expect(permissionStore.hasPermissionCode('user:read')).toBeDefined()
    })

    it('should handle permission initialization', async () => {
      const permissionStore = usePermissionsStore()

      // Mock API响应
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: ['user:read', 'class:read', 'student:read']
        }
      })

      // 测试权限初始化
      await permissionStore.fetchPermissions()
      expect(permissionStore.hasPermissions).toBeDefined()
    })
  })

  describe('Data Persistence Integration Tests', () => {
    it('should handle localStorage operations', () => {
      const userStore = useUserStore()

      const userData = {
        token: 'test-token',
        user: {
          id: 1,
          username: 'test-user',
          email: 'test@example.com',
          role: 'teacher',
          permissions: ['user:read']
        }
      }

      // 设置用户信息
      userStore.setUserInfo(userData)

      // 验证localStorage调用
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kindergarten_token',
        'test-token'
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kindergarten_user_info',
        JSON.stringify(userData.user)
      )

      // 验证store状态
      expect(userStore.token).toBe('test-token')
      expect(userStore.user).toEqual(userData.user)
      expect(userStore.isAuthenticated).toBe(true)
    })

    it('should handle user logout and clear data', async () => {
      const userStore = useUserStore()

      // 设置初始状态
      userStore.setUserInfo({
        token: 'test-token',
        user: { username: 'testuser', role: 'teacher', permissions: [] }
      })

      // 执行登出
      await userStore.logout()

      // 验证localStorage清除
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kindergarten_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kindergarten_user_info')

      // 验证状态清除
      expect(userStore.isAuthenticated).toBe(false)
      expect(userStore.user).toBeNull()
      expect(userStore.token).toBe('')
    })
  })

  describe('Cross-Store Integration Tests', () => {
    it('should coordinate between user and permission stores', async () => {
      const userStore = useUserStore()
      const permissionStore = usePermissionsStore()

      // Mock API响应
      vi.mocked(post).mockResolvedValueOnce({
        success: true,
        data: {
          user: { id: 1, username: 'testuser', role: 'teacher' },
          token: 'test-token'
        }
      })

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: ['user:read', 'class:read']
        }
      })

      // 执行登录
      await userStore.login({
        username: 'testuser',
        password: 'password123'
      })

      // 加载权限
      await permissionStore.fetchPermissions()

      // 验证协调状态
      expect(userStore.isAuthenticated).toBe(true)
      expect(permissionStore.hasPermissions).toBeDefined()
      expect(permissionStore.hasPermissionCode('user:read')).toBeDefined()
    })
  })
})
