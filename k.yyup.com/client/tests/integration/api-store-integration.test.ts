import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock API modules
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// 控制台错误检测变量
let consoleSpy: any

describe('API Store Integration Tests', () => {
  let pinia: any

  beforeEach(() => {
    // Setup pinia
    pinia = createPinia()
    setActivePinia(pinia)

    // Reset all mocks
    vi.clearAllMocks()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    vi.restoreAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('User Store Integration', () => {
    it('should successfully login and update store state', async () => {
      const { default: request } = await import('@/utils/request')
      
      // Mock successful login response
      const mockLoginResponse = {
        data: {
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@school.com',
            role: 'admin'
          }
        }
      }
      request.post.mockResolvedValue(mockLoginResponse)

      // Import and use the user store
      const { useUserStore } = await import('@/stores/user')
      const userStore = useUserStore()

      // Perform login
      const loginData = {
        username: 'admin',
        password: 'password123',
        role: 'admin'
      }

      const result = await userStore.login(loginData)

      // Verify API was called correctly
      expect(request.post).toHaveBeenCalledWith('/auth/login', loginData)

      // Verify store state was updated
      expect(result).toBe(true)
      expect(userStore.isAuthenticated).toBe(true)
      expect(userStore.user).toEqual(mockLoginResponse.data.user)
      expect(userStore.token).toBe(mockLoginResponse.data.token)
    })

    it('should handle login failure and update store state', async () => {
      const { default: request } = await import('@/utils/request')
      
      // Mock failed login response
      const mockErrorResponse = {
        response: {
          data: {
            success: false,
            message: 'Invalid credentials'
          }
        }
      }
      request.post.mockRejectedValue(mockErrorResponse)

      // Import and use the user store
      const { useUserStore } = await import('@/stores/user')
      const userStore = useUserStore()

      // Perform login
      const loginData = {
        username: 'invalid',
        password: 'wrongpassword',
        role: 'admin'
      }

      const result = await userStore.login(loginData)

      // Verify API was called correctly
      expect(request.post).toHaveBeenCalledWith('/auth/login', loginData)

      // Verify store state reflects failure
      expect(result).toBe(false)
      expect(userStore.isAuthenticated).toBe(false)
      expect(userStore.user).toBeNull()
      expect(userStore.error).toBe('Invalid credentials')
    })

    it('should successfully logout and clear store state', async () => {
      const { default: request } = await import('@/utils/request')
      const { useUserStore } = await import('@/stores/user')
      
      // Setup authenticated state
      const userStore = useUserStore()
      userStore.user = { id: 1, username: 'admin' }
      userStore.token = 'mock-token'
      userStore.isAuthenticated = true

      // Mock successful logout response
      request.post.mockResolvedValue({ data: { success: true } })

      // Perform logout
      await userStore.logout()

      // Verify API was called
      expect(request.post).toHaveBeenCalledWith('/auth/logout')

      // Verify store state was cleared
      expect(userStore.isAuthenticated).toBe(false)
      expect(userStore.user).toBeNull()
      expect(userStore.token).toBeNull()
    })
  })

  describe('App Store Integration', () => {
    it('should update app theme and persist state', async () => {
      // Import and use the app store
      const { useAppStore } = await import('@/stores/app')
      const appStore = useAppStore()

      // Test theme switching
      appStore.setTheme('dark')
      expect(appStore.theme).toBe('dark')

      appStore.setTheme('light')
      expect(appStore.theme).toBe('light')
    })

    it('should handle sidebar state changes', async () => {
      // Import and use the app store
      const { useAppStore } = await import('@/stores/app')
      const appStore = useAppStore()

      // Test sidebar toggle
      const initialState = appStore.sidebarCollapsed
      appStore.toggleSidebar()
      expect(appStore.sidebarCollapsed).toBe(!initialState)

      appStore.toggleSidebar()
      expect(appStore.sidebarCollapsed).toBe(initialState)
    })
  })

  describe('Permission Store Integration', () => {
    it('should check permission correctly', async () => {
      const { usePermissionsStore } = await import('@/stores/permissions')
      const permissionStore = usePermissionsStore()

      // Set up permissions
      permissionStore.permissions = ['user.read', 'user.write', 'dashboard.read']

      // Test permission checks
      expect(permissionStore.hasPermission('user.read')).toBe(true)
      expect(permissionStore.hasPermission('user.write')).toBe(true)
      expect(permissionStore.hasPermission('user.delete')).toBe(false)
      expect(permissionStore.hasPermission('admin.all')).toBe(false)
    })

    it('should handle permission updates', async () => {
      const { usePermissionsStore } = await import('@/stores/permissions')
      const permissionStore = usePermissionsStore()

      // Test permission updates
      permissionStore.setPermissions(['admin.all', 'user.all'])
      expect(permissionStore.hasPermission('admin.all')).toBe(true)
      expect(permissionStore.hasPermission('user.all')).toBe(true)
      expect(permissionStore.hasPermission('guest.read')).toBe(false)
    })
  })

  describe('Cross-Store Integration', () => {
    it('should handle authentication flow across multiple stores', async () => {
      const { default: request } = await import('@/utils/request')

      // Mock login response
      const mockLoginResponse = {
        data: {
          success: true,
          token: 'mock-jwt-token',
          user: { id: 1, username: 'admin', role: 'admin' }
        }
      }
      request.post.mockResolvedValue(mockLoginResponse)

      // Import stores
      const { useUserStore } = await import('@/stores/user')
      const { usePermissionsStore } = await import('@/stores/permissions')
      const { useAppStore } = await import('@/stores/app')

      const userStore = useUserStore()
      const permissionStore = usePermissionsStore()
      const appStore = useAppStore()

      // Perform login
      await userStore.login({
        username: 'admin',
        password: 'password123',
        role: 'admin'
      })

      // Set permissions after login
      permissionStore.setPermissions(['admin.all'])

      // Update app state
      appStore.setTheme('dark')

      // Verify all stores are updated correctly
      expect(userStore.isAuthenticated).toBe(true)
      expect(userStore.user.role).toBe('admin')
      expect(permissionStore.hasPermission('admin.all')).toBe(true)
      expect(appStore.theme).toBe('dark')
    })
  })
})
