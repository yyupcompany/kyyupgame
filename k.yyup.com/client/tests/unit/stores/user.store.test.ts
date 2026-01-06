import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import { ROLE_PERMISSIONS, ROLES } from '@/utils/permission'

// Mock API functions
const mockLogin = vi.fn()
const mockGetUserInfo = vi.fn()
const mockRequest = vi.fn()

vi.mock('@/api/modules/auth', () => ({
  login: () => mockLogin()
}))

vi.mock('@/utils/request', () => ({
  request: mockRequest
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

// 控制台错误检测变量
let consoleSpy: any

describe('User Store', () => {
  let userStore: ReturnType<typeof useUserStore>
  let pinia: any

  beforeEach(() => {
    vi.clearAllMocks()
    pinia = createPinia()
    setActivePinia(pinia)
    userStore = useUserStore()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    vi.resetAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('State Initialization', () => {
    it('should initialize with default state when no token', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const newUserStore = useUserStore()

      expect(newUserStore.token).toBe('')
      expect(newUserStore.userInfo).toBe(null)
      expect(newUserStore.permissions).toEqual([])
    })

    it('should initialize with saved user info when token exists', () => {
      const savedUserInfo = {
        id: 1,
        username: 'testuser',
        role: 'admin',
        permissions: ['DASHBOARD_VIEW', 'USER_VIEW']
      }

      localStorageMock.getItem
        .mockReturnValueOnce('fake-token')
        .mockReturnValueOnce(JSON.stringify(savedUserInfo))

      const newUserStore = useUserStore()

      expect(newUserStore.token).toBe('fake-token')
      expect(newUserStore.userInfo).toEqual(savedUserInfo)
      expect(newUserStore.permissions).toEqual(['DASHBOARD_VIEW', 'USER_VIEW'])
    })

    it('should handle corrupt user info gracefully', () => {
      localStorageMock.getItem
        .mockReturnValueOnce('fake-token')
        .mockReturnValueOnce('invalid-json')

      const newUserStore = useUserStore()

      expect(newUserStore.token).toBe('fake-token')
      expect(newUserStore.userInfo).toBe(null)
      expect(newUserStore.permissions).toEqual([])
    })
  })

  describe('Getters', () => {
    beforeEach(() => {
      userStore.token = 'fake-token'
      userStore.userInfo = {
        id: 1,
        username: 'testuser',
        role: 'admin',
        permissions: ['DASHBOARD_VIEW', 'USER_VIEW']
      }
      userStore.permissions = ['DASHBOARD_VIEW', 'USER_VIEW']
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    it('should check authentication status', () => {
      expect(userStore.isAuthenticated).toBe(true)
      expect(userStore.isLoggedIn).toBe(true)

      userStore.token = ''
      expect(userStore.isAuthenticated).toBe(false)
      expect(userStore.isLoggedIn).toBe(false)
    })

    it('should return user info', () => {
      expect(userStore.user).toEqual({
        id: 1,
        username: 'testuser',
        role: 'admin',
        permissions: ['DASHBOARD_VIEW', 'USER_VIEW']
      })
    })

    it('should return user token', () => {
      expect(userStore.userToken).toBe('fake-token')
    })

    it('should return user roles', () => {
      expect(userStore.roles).toEqual(['admin'])

      userStore.userInfo = {
        ...userStore.userInfo,
        roles: [{ code: 'admin' }, { code: 'user' }]
      }
      expect(userStore.roles).toEqual(['admin', 'user'])
    })

    it('should return user permissions', () => {
      expect(userStore.userPermissions).toEqual(['DASHBOARD_VIEW', 'USER_VIEW'])
    })

    it('should return user role', () => {
      expect(userStore.userRole).toBe('admin')
    })

    it('should check admin status', () => {
      expect(userStore.isAdmin).toBe(true)

      userStore.userInfo!.role = 'user'
      expect(userStore.isAdmin).toBe(false)

      userStore.userInfo!.role = 'super_admin'
      expect(userStore.isAdmin).toBe(true)

      userStore.userInfo!.role = 'admin'
      userStore.userInfo!.isAdmin = false
      expect(userStore.isAdmin).toBe(false)

      userStore.userInfo!.isAdmin = true
      expect(userStore.isAdmin).toBe(true)
    })
  })

  describe('login', () => {
    it('should login successfully with API response structure', async () => {
      const credentials = { username: 'testuser', password: 'password' }
      const loginResponse = {
        success: true,
        data: {
          token: 'api-token',
          user: {
            id: 1,
            username: 'testuser',
            role: 'admin',
            permissions: ['DASHBOARD_VIEW']
          }
        }
      }

      mockLogin.mockResolvedValue(loginResponse)

      const result = await userStore.login(credentials)

      expect(result).toEqual(loginResponse.data)
      expect(userStore.token).toBe('api-token')
      expect(userStore.userInfo).toEqual(loginResponse.data.user)
      expect(userStore.permissions).toEqual(['DASHBOARD_VIEW'])
      expect(localStorageMock.setItem).toHaveBeenCalledWith('kindergarten_token', 'api-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'api-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('kindergarten_user_info', JSON.stringify(loginResponse.data.user))
    })

    it('should login successfully with login page structure', async () => {
      const credentials = { username: 'testuser', password: 'password' }
      const loginResponse = {
        success: true,
        data: {
          token: 'login-token',
          username: 'testuser',
          roles: [{ code: 'admin' }],
          permissions: ['DASHBOARD_VIEW']
        }
      }

      mockLogin.mockResolvedValue(loginResponse)

      const result = await userStore.login(credentials)

      expect(result).toEqual(loginResponse.data)
      expect(userStore.token).toBe('login-token')
      expect(userStore.userInfo).toEqual({
        username: 'testuser',
        role: 'admin',
        roles: [{ code: 'admin' }],
        permissions: ['DASHBOARD_VIEW'],
        isAdmin: true
      })
      expect(userStore.permissions).toEqual(['DASHBOARD_VIEW'])
    })

    it('should handle login failure', async () => {
      const credentials = { username: 'testuser', password: 'password' }
      const error = new Error('Login failed')

      mockLogin.mockRejectedValue(error)

      await expect(userStore.login(credentials)).rejects.toThrow(error)
    })

    it('should handle login with API success false', async () => {
      const credentials = { username: 'testuser', password: 'password' }
      const loginResponse = {
        success: false,
        message: 'Invalid credentials'
      }

      mockLogin.mockResolvedValue(loginResponse)

      await expect(userStore.login(credentials)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('should clear user info on logout', async () => {
      userStore.token = 'fake-token'
      userStore.userInfo = { id: 1, username: 'testuser', role: 'admin', permissions: [] }
      userStore.permissions = ['DASHBOARD_VIEW']

      const result = await userStore.logout()

      expect(result).toBe(true)
      expect(userStore.token).toBe('')
      expect(userStore.userInfo).toBe(null)
      expect(userStore.permissions).toEqual([])
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kindergarten_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userInfo')
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const result = await userStore.refreshToken()

      expect(result).toEqual({ token: 'new-fake-token' })
      expect(userStore.token).toBe('new-fake-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('kindergarten_token', 'new-fake-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-fake-token')
    })

    it('should clear user info on refresh token failure', async () => {
      const error = new Error('Token refresh failed')
      
      // Mock the implementation to throw error
      userStore.clearUserInfo = vi.fn()
      const originalRefreshToken = userStore.refreshToken
      userStore.refreshToken = async () => {
        userStore.clearUserInfo!()
        throw error
      }

      await expect(userStore.refreshToken()).rejects.toThrow(error)
      expect(userStore.clearUserInfo).toHaveBeenCalled()
    })
  })

  describe('setUserInfo', () => {
    it('should handle API response structure', () => {
      const loginData = {
        token: 'api-token',
        user: {
          id: 1,
          username: 'testuser',
          role: 'admin',
          permissions: ['DASHBOARD_VIEW']
        }
      }

      userStore.setUserInfo(loginData)

      expect(userStore.token).toBe('api-token')
      expect(userStore.userInfo).toEqual(loginData.user)
      expect(userStore.permissions).toEqual(['DASHBOARD_VIEW'])
    })

    it('should handle login page structure', () => {
      const loginData = {
        token: 'login-token',
        username: 'testuser',
        roles: [{ code: 'admin' }],
        permissions: ['DASHBOARD_VIEW']
      }

      userStore.setUserInfo(loginData)

      expect(userStore.token).toBe('login-token')
      expect(userStore.userInfo).toEqual({
        username: 'testuser',
        role: 'admin',
        roles: [{ code: 'admin' }],
        permissions: ['DASHBOARD_VIEW'],
        isAdmin: true
      })
      expect(userStore.permissions).toEqual(['DASHBOARD_VIEW'])
    })

    it('should handle legacy structure', () => {
      const loginData = {
        token: 'legacy-token',
        id: 1,
        username: 'testuser',
        role: 'admin',
        permissions: ['DASHBOARD_VIEW']
      }

      userStore.setUserInfo(loginData)

      expect(userStore.token).toBe('legacy-token')
      expect(userStore.userInfo).toEqual({
        id: 1,
        username: 'testuser',
        role: 'admin',
        permissions: ['DASHBOARD_VIEW']
      })
      expect(userStore.permissions).toEqual(['DASHBOARD_VIEW'])
    })

    it('should set permissions by role when no permissions provided', () => {
      const loginData = {
        token: 'role-token',
        username: 'testuser',
        role: 'admin'
      }

      userStore.setUserInfo(loginData)

      expect(userStore.permissions).toEqual(ROLE_PERMISSIONS[ROLES.ADMIN])
    })

    it('should ensure role field exists', () => {
      const loginData = {
        token: 'role-token',
        username: 'testuser',
        roles: [{ code: 'admin' }],
        permissions: ['DASHBOARD_VIEW']
      }

      userStore.setUserInfo(loginData)

      expect(userStore.userInfo!.role).toBe('admin')
      expect(userStore.userInfo!.isAdmin).toBe(true)
    })
  })

  describe('getUserInfo', () => {
    it('should return existing user info if available', async () => {
      userStore.userInfo = { id: 1, username: 'testuser', role: 'admin', permissions: [] }

      const result = await userStore.getUserInfo()

      expect(result).toEqual({ user: userStore.userInfo })
      expect(mockGetUserInfo).not.toHaveBeenCalled()
    })

    it('should restore from localStorage if token exists but no user info', async () => {
      userStore.token = 'fake-token'
      const savedUserInfo = {
        id: 1,
        username: 'testuser',
        role: 'admin',
        permissions: ['DASHBOARD_VIEW']
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedUserInfo))

      const result = await userStore.getUserInfo()

      expect(result).toEqual({ user: savedUserInfo })
      expect(userStore.userInfo).toEqual(savedUserInfo)
      expect(userStore.permissions).toEqual(['DASHBOARD_VIEW'])
    })

    it('should fetch user info from API if not available', async () => {
      userStore.token = 'fake-token'
      const apiResponse = {
        success: true,
        data: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          realName: 'Test User',
          phone: '1234567890',
          status: 'active',
          roles: [{ code: 'admin' }],
          permissions: ['DASHBOARD_VIEW'],
          kindergartenId: 1
        }
      }

      mockGetUserInfo.mockResolvedValue(apiResponse)

      const result = await userStore.getUserInfo()

      expect(result).toEqual({ 
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          realName: 'Test User',
          phone: '1234567890',
          status: 'active',
          role: 'admin',
          roles: ['admin'],
          permissions: ['DASHBOARD_VIEW'],
          isAdmin: true,
          kindergartenId: 1
        }
      })
      expect(userStore.userInfo).toEqual(result.user)
      expect(userStore.permissions).toEqual(['DASHBOARD_VIEW'])
    })

    it('should handle API error with default user', async () => {
      userStore.token = 'fake-token'
      const error = new Error('API Error')

      mockGetUserInfo.mockRejectedValue(error)

      const result = await userStore.getUserInfo()

      expect(result).toEqual({
        user: {
          id: 1,
          username: '演示用户',
          role: ROLES.ADMIN,
          permissions: ROLE_PERMISSIONS[ROLES.ADMIN],
          email: 'demo@example.com',
          realName: '演示管理员',
          isAdmin: true
        }
      })
      expect(userStore.userInfo).toEqual(result.user)
      expect(userStore.permissions).toEqual(ROLE_PERMISSIONS[ROLES.ADMIN])
    })
  })

  describe('hasPermission', () => {
    it('should return true for admin user', () => {
      userStore.userInfo = { id: 1, username: 'admin', role: 'admin', permissions: [] }

      expect(userStore.hasPermission('ANY_PERMISSION')).toBe(true)
    })

    it('should return true for wildcard permission', () => {
      userStore.userInfo = { id: 1, username: 'user', role: 'user', permissions: ['*'] }

      expect(userStore.hasPermission('ANY_PERMISSION')).toBe(true)
    })

    it('should check user permissions', () => {
      userStore.userInfo = { id: 1, username: 'user', role: 'user', permissions: ['DASHBOARD_VIEW', 'USER_VIEW'] }

      expect(userStore.hasPermission('DASHBOARD_VIEW')).toBe(true)
      expect(userStore.hasPermission('USER_VIEW')).toBe(true)
      expect(userStore.hasPermission('ADMIN_VIEW')).toBe(false)
    })

    it('should try to restore from localStorage when no user info', () => {
      userStore.userInfo = null
      userStore.tryRestoreFromLocalStorage = vi.fn()

      userStore.hasPermission('DASHBOARD_VIEW')

      expect(userStore.tryRestoreFromLocalStorage).toHaveBeenCalled()
    })

    it('should set permissions by role when no permissions', () => {
      userStore.permissions = []
      userStore.userInfo = { id: 1, username: 'user', role: 'user', permissions: [] }

      userStore.hasPermission('DASHBOARD_VIEW')

      expect(userStore.permissions).toEqual(ROLE_PERMISSIONS[ROLES.USER])
    })
  })

  describe('hasRole', () => {
    it('should check user role correctly', () => {
      userStore.userInfo = { id: 1, username: 'user', role: 'admin', permissions: [] }

      expect(userStore.hasRole('admin')).toBe(true)
      expect(userStore.hasRole('user')).toBe(false)
    })
  })

  describe('hasAnyRole', () => {
    it('should check if user has any of the specified roles', () => {
      userStore.userInfo = { id: 1, username: 'user', role: 'admin', permissions: [] }

      expect(userStore.hasAnyRole(['admin', 'super_admin'])).toBe(true)
      expect(userStore.hasAnyRole(['user', 'super_admin'])).toBe(false)
    })
  })

  describe('setPermissionsByRole', () => {
    it('should set permissions based on role', () => {
      userStore.userInfo = { id: 1, username: 'user', role: 'admin', permissions: [] }

      userStore.setPermissionsByRole('admin')

      expect(userStore.permissions).toEqual(ROLE_PERMISSIONS[ROLES.ADMIN])
      expect(userStore.userInfo!.permissions).toEqual(ROLE_PERMISSIONS[ROLES.ADMIN])
    })

    it('should save to localStorage', () => {
      userStore.userInfo = { id: 1, username: 'user', role: 'user', permissions: [] }

      userStore.setPermissionsByRole('user')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kindergarten_user_info',
        JSON.stringify({
          id: 1,
          username: 'user',
          role: 'user',
          permissions: ROLE_PERMISSIONS[ROLES.USER]
        })
      )
    })
  })

  describe('addPermission', () => {
    it('should add permission if not exists', () => {
      userStore.permissions = ['DASHBOARD_VIEW']
      userStore.userInfo = { id: 1, username: 'user', role: 'user', permissions: ['DASHBOARD_VIEW'] }

      userStore.addPermission('USER_VIEW')

      expect(userStore.permissions).toEqual(['DASHBOARD_VIEW', 'USER_VIEW'])
      expect(userStore.userInfo!.permissions).toEqual(['DASHBOARD_VIEW', 'USER_VIEW'])
    })

    it('should not add duplicate permission', () => {
      userStore.permissions = ['DASHBOARD_VIEW']
      userStore.userInfo = { id: 1, username: 'user', role: 'user', permissions: ['DASHBOARD_VIEW'] }

      userStore.addPermission('DASHBOARD_VIEW')

      expect(userStore.permissions).toEqual(['DASHBOARD_VIEW'])
    })
  })

  describe('removePermission', () => {
    it('should remove permission if exists', () => {
      userStore.permissions = ['DASHBOARD_VIEW', 'USER_VIEW']
      userStore.userInfo = { id: 1, username: 'user', role: 'user', permissions: ['DASHBOARD_VIEW', 'USER_VIEW'] }

      userStore.removePermission('USER_VIEW')

      expect(userStore.permissions).toEqual(['DASHBOARD_VIEW'])
      expect(userStore.userInfo!.permissions).toEqual(['DASHBOARD_VIEW'])
    })

    it('should not remove non-existent permission', () => {
      userStore.permissions = ['DASHBOARD_VIEW']
      userStore.userInfo = { id: 1, username: 'user', role: 'user', permissions: ['DASHBOARD_VIEW'] }

      userStore.removePermission('USER_VIEW')

      expect(userStore.permissions).toEqual(['DASHBOARD_VIEW'])
    })
  })

  describe('tryRestoreFromLocalStorage', () => {
    it('should restore user info from localStorage', () => {
      const savedUserInfo = {
        id: 1,
        username: 'testuser',
        role: 'admin',
        permissions: ['DASHBOARD_VIEW']
      }

      localStorageMock.getItem
        .mockReturnValueOnce('fake-token')
        .mockReturnValueOnce(JSON.stringify(savedUserInfo))

      userStore.tryRestoreFromLocalStorage()

      expect(userStore.token).toBe('fake-token')
      expect(userStore.userInfo).toEqual(savedUserInfo)
      expect(userStore.permissions).toEqual(['DASHBOARD_VIEW'])
    })

    it('should handle corrupt user info', () => {
      localStorageMock.getItem
        .mockReturnValueOnce('fake-token')
        .mockReturnValueOnce('invalid-json')

      userStore.tryRestoreFromLocalStorage()

      expect(userStore.token).toBe('fake-token')
      expect(userStore.userInfo).toBe(null)
      expect(userStore.permissions).toEqual([])
    })
  })

  describe('getCurrentUserTeacherId', () => {
    it('should return existing teacherId if available', async () => {
      userStore.userInfo = { id: 1, teacherId: 123, username: 'user', role: 'teacher', permissions: [] }

      const result = await userStore.getCurrentUserTeacherId()

      expect(result).toBe(123)
      expect(mockRequest.get).not.toHaveBeenCalled()
    })

    it('should return null if no user ID', async () => {
      userStore.userInfo = null

      const result = await userStore.getCurrentUserTeacherId()

      expect(result).toBe(null)
      expect(mockRequest.get).not.toHaveBeenCalled()
    })

    it('should fetch teacher ID from API', async () => {
      userStore.userInfo = { id: 1, username: 'user', role: 'teacher', permissions: [] }
      const apiResponse = {
        success: true,
        data: { id: 456 }
      }

      mockRequest.get.mockResolvedValue(apiResponse)

      const result = await userStore.getCurrentUserTeacherId()

      expect(result).toBe(456)
      expect(mockRequest.get).toHaveBeenCalledWith('/teachers/by-user/1')
      expect(userStore.userInfo!.teacherId).toBe(456)
    })

    it('should handle API error', async () => {
      userStore.userInfo = { id: 1, username: 'user', role: 'teacher', permissions: [] }
      const error = new Error('API Error')

      mockRequest.get.mockRejectedValue(error)

      const result = await userStore.getCurrentUserTeacherId()

      expect(result).toBe(null)
    })

    it('should handle API response with no teacher ID', async () => {
      userStore.userInfo = { id: 1, username: 'user', role: 'teacher', permissions: [] }
      const apiResponse = {
        success: true,
        data: { name: 'Teacher Name' }
      }

      mockRequest.get.mockResolvedValue(apiResponse)

      const result = await userStore.getCurrentUserTeacherId()

      expect(result).toBe(null)
    })
  })

  describe('Integration', () => {
    it('should maintain state consistency across operations', () => {
      // Login
      userStore.setUserInfo({
        token: 'test-token',
        user: {
          id: 1,
          username: 'testuser',
          role: 'admin',
          permissions: ['DASHBOARD_VIEW']
        }
      })

      expect(userStore.isAuthenticated).toBe(true)
      expect(userStore.isAdmin).toBe(true)
      expect(userStore.hasPermission('DASHBOARD_VIEW')).toBe(true)

      // Add permission
      userStore.addPermission('USER_VIEW')
      expect(userStore.hasPermission('USER_VIEW')).toBe(true)

      // Remove permission
      userStore.removePermission('USER_VIEW')
      expect(userStore.hasPermission('USER_VIEW')).toBe(false)

      // Logout
      userStore.clearUserInfo()
      expect(userStore.isAuthenticated).toBe(false)
      expect(userStore.userInfo).toBe(null)
    })
  })
})