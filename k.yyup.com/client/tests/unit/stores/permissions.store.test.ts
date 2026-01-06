import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePermissionsStore } from '@/stores/permissions'
import type { MenuItem } from '@/api/modules/auth-permissions'

// Mock API functions
const mockGetUserMenu = vi.fn()
const mockGetUserRoles = vi.fn()
const mockGetUserPermissions = vi.fn()
const mockPost = vi.fn()

vi.mock('@/api/modules/auth-permissions', () => ({
  getUserMenu: () => mockGetUserMenu(),
  getUserRoles: () => mockGetUserRoles(),
  getUserPermissions: () => mockGetUserPermissions()
}))

vi.mock('@/utils/request', () => ({
  post: () => mockPost()
}))

// 控制台错误检测变量
let consoleSpy: any

describe('Permissions Store', () => {
  let permissionsStore: ReturnType<typeof usePermissionsStore>
  let pinia: any

  beforeEach(() => {
    vi.clearAllMocks()
    pinia = createPinia()
    setActivePinia(pinia)
    permissionsStore = usePermissionsStore()
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
    it('should initialize with default state', () => {
      expect(permissionsStore.permissions.value).toEqual([])
      expect(permissionsStore.menuItems.value).toEqual([])
      expect(permissionsStore.roles.value).toEqual([])
      expect(permissionsStore.loading.value).toBe(false)
      expect(permissionsStore.error.value).toBe(null)
      expect(permissionsStore.verificationCache.value.size).toBe(0)
    })
  })

  describe('Computed Properties', () => {
    it('should compute hasPermissions correctly', () => {
      expect(permissionsStore.hasPermissions.value).toBe(false)

      permissionsStore.permissions.value = [{ id: 1, code: 'TEST_PERMISSION' }]
      expect(permissionsStore.hasPermissions.value).toBe(true)
    })

    it('should compute hasMenuItems correctly', () => {
      expect(permissionsStore.hasMenuItems.value).toBe(false)

      permissionsStore.menuItems.value = [{ id: 1, name: 'Test Menu' }]
      expect(permissionsStore.hasMenuItems.value).toBe(true)
    })

    it('should compute userRoles correctly', () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'admin', name: 'Administrator' },
        { id: 2, code: 'user', name: 'User' }
      ]

      expect(permissionsStore.userRoles.value).toEqual(['admin', 'user'])
    })

    it('should compute isAdmin correctly', () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'admin', name: 'Administrator' }
      ]
      expect(permissionsStore.isAdmin.value).toBe(true)

      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]
      expect(permissionsStore.isAdmin.value).toBe(false)

      permissionsStore.roles.value = []
      expect(permissionsStore.isAdmin.value).toBe(false)
    })
  })

  describe('fetchPermissions', () => {
    it('should fetch permissions successfully', async () => {
      const mockPermissionsData = [
        { id: 1, code: 'DASHBOARD_VIEW', name: 'View Dashboard' },
        { id: 2, code: 'USER_VIEW', name: 'View Users' }
      ]

      mockGetUserPermissions.mockResolvedValue({
        success: true,
        data: mockPermissionsData
      })

      await permissionsStore.fetchPermissions()

      expect(permissionsStore.loading.value).toBe(false)
      expect(permissionsStore.error.value).toBe(null)
      expect(permissionsStore.permissions.value).toEqual(mockPermissionsData)
      expect(mockGetUserPermissions).toHaveBeenCalledTimes(1)
    })

    it('should handle empty permissions data', async () => {
      mockGetUserPermissions.mockResolvedValue({
        success: true,
        data: []
      })

      await permissionsStore.fetchPermissions()

      expect(permissionsStore.permissions.value).toEqual([])
      expect(permissionsStore.hasPermissions.value).toBe(false)
    })

    it('should handle API error', async () => {
      const errorMessage = 'Network error'
      mockGetUserPermissions.mockRejectedValue(new Error(errorMessage))

      await permissionsStore.fetchPermissions()

      expect(permissionsStore.loading.value).toBe(false)
      expect(permissionsStore.error.value).toBe(errorMessage)
      expect(permissionsStore.permissions.value).toEqual([])
    })

    it('should handle API response with success: false', async () => {
      const errorMessage = 'Failed to fetch permissions'
      mockGetUserPermissions.mockResolvedValue({
        success: false,
        message: errorMessage
      })

      await permissionsStore.fetchPermissions()

      expect(permissionsStore.loading.value).toBe(false)
      expect(permissionsStore.error.value).toBe(errorMessage)
      expect(permissionsStore.permissions.value).toEqual([])
    })
  })

  describe('fetchMenuItems', () => {
    it('should fetch menu items successfully', async () => {
      const mockMenuData = [
        { 
          id: 1, 
          name: 'Dashboard', 
          path: '/dashboard',
          chineseName: '仪表板'
        },
        { 
          id: 2, 
          name: 'Users', 
          path: '/users',
          chineseName: '用户管理'
        }
      ]

      mockGetUserMenu.mockResolvedValue({
        success: true,
        data: mockMenuData
      })

      await permissionsStore.fetchMenuItems()

      expect(permissionsStore.loading.value).toBe(false)
      expect(permissionsStore.error.value).toBe(null)
      expect(permissionsStore.menuItems.value.length).toBeGreaterThan(2) // Should include script and media centers
      expect(permissionsStore.menuItems.value[0]).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Dashboard',
          chineseName: '仪表板'
        })
      )
      expect(mockGetUserMenu).toHaveBeenCalledTimes(1)
    })

    it('should add script and media centers to menu', async () => {
      mockGetUserMenu.mockResolvedValue({
        success: true,
        data: []
      })

      await permissionsStore.fetchMenuItems()

      expect(permissionsStore.menuItems.value.length).toBe(2)
      expect(permissionsStore.menuItems.value[0]).toEqual(
        expect.objectContaining({
          name: '话术中心',
          chineseName: '话术中心'
        })
      )
      expect(permissionsStore.menuItems.value[1]).toEqual(
        expect.objectContaining({
          name: 'Media Center',
          chineseName: '新媒体中心'
        })
      )
    })

    it('should handle API error in development mode', async () => {
      const errorMessage = 'Network error'
      mockGetUserMenu.mockRejectedValue(new Error(errorMessage))

      await permissionsStore.fetchMenuItems()

      expect(permissionsStore.loading.value).toBe(false)
      expect(permissionsStore.error.value).toBe(errorMessage)
      expect(permissionsStore.menuItems.value).toEqual([])
    })

    it('should handle API response with success: false', async () => {
      const errorMessage = 'Failed to fetch menu'
      mockGetUserMenu.mockResolvedValue({
        success: false,
        message: errorMessage
      })

      await permissionsStore.fetchMenuItems()

      expect(permissionsStore.loading.value).toBe(false)
      expect(permissionsStore.error.value).toBe(errorMessage)
      expect(permissionsStore.menuItems.value).toEqual([])
    })
  })

  describe('fetchRoles', () => {
    it('should fetch roles successfully', async () => {
      const mockRolesData = {
        roles: [
          { id: 1, code: 'admin', name: 'Administrator' },
          { id: 2, code: 'user', name: 'User' }
        ]
      }

      mockGetUserRoles.mockResolvedValue({
        success: true,
        data: mockRolesData
      })

      await permissionsStore.fetchRoles()

      expect(permissionsStore.loading.value).toBe(false)
      expect(permissionsStore.error.value).toBe(null)
      expect(permissionsStore.roles.value).toEqual(mockRolesData.roles)
      expect(mockGetUserRoles).toHaveBeenCalledTimes(1)
    })

    it('should handle empty roles data', async () => {
      mockGetUserRoles.mockResolvedValue({
        success: true,
        data: { roles: [] }
      })

      await permissionsStore.fetchRoles()

      expect(permissionsStore.roles.value).toEqual([])
      expect(permissionsStore.userRoles.value).toEqual([])
    })

    it('should handle API error', async () => {
      const errorMessage = 'Network error'
      mockGetUserRoles.mockRejectedValue(new Error(errorMessage))

      await permissionsStore.fetchRoles()

      expect(permissionsStore.loading.value).toBe(false)
      expect(permissionsStore.error.value).toBe(errorMessage)
      expect(permissionsStore.roles.value).toEqual([])
    })

    it('should handle API response with success: false', async () => {
      const errorMessage = 'Failed to fetch roles'
      mockGetUserRoles.mockResolvedValue({
        success: false,
        message: errorMessage
      })

      await permissionsStore.fetchRoles()

      expect(permissionsStore.loading.value).toBe(false)
      expect(permissionsStore.error.value).toBe(errorMessage)
      expect(permissionsStore.roles.value).toEqual([])
    })
  })

  describe('hasPermission', () => {
    beforeEach(() => {
      permissionsStore.roles.value = [
        { id: 1, code: 'admin', name: 'Administrator' }
      ]
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    it('should return true for admin user', () => {
      const result = permissionsStore.hasPermission('/dashboard')
      expect(result).toBe(true)
    })

    it('should check menu items for permission', () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      permissionsStore.menuItems.value = [
        { id: 1, name: 'Dashboard', path: '/dashboard' } as MenuItem
      ]

      expect(permissionsStore.hasPermission('/dashboard')).toBe(true)
      expect(permissionsStore.hasPermission('/users')).toBe(false)
    })

    it('should check nested menu items', () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      permissionsStore.menuItems.value = [
        {
          id: 1,
          name: 'System',
          path: '/system',
          children: [
            { id: 2, name: 'Users', path: '/system/users' } as MenuItem
          ]
        } as MenuItem
      ]

      expect(permissionsStore.hasPermission('/system/users')).toBe(true)
      expect(permissionsStore.hasPermission('/system/settings')).toBe(false)
    })
  })

  describe('hasPermissionCode', () => {
    beforeEach(() => {
      permissionsStore.roles.value = [
        { id: 1, code: 'admin', name: 'Administrator' }
      ]
    })

    it('should return true for admin user', () => {
      const result = permissionsStore.hasPermissionCode('ANY_CODE')
      expect(result).toBe(true)
    })

    it('should check permission codes in permissions array', () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      permissionsStore.permissions.value = [
        { code: 'DASHBOARD_VIEW' },
        { permission: 'USER_VIEW' },
        { path: '/settings' }
      ]

      expect(permissionsStore.hasPermissionCode('DASHBOARD_VIEW')).toBe(true)
      expect(permissionsStore.hasPermissionCode('USER_VIEW')).toBe(true)
      expect(permissionsStore.hasPermissionCode('/settings')).toBe(true)
      expect(permissionsStore.hasPermissionCode('NONEXISTENT')).toBe(false)
    })
  })

  describe('hasRole', () => {
    beforeEach(() => {
      permissionsStore.roles.value = [
        { id: 1, code: 'admin', name: 'Administrator' },
        { id: 2, code: 'user', name: 'User' }
      ]
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    it('should return true for existing role', () => {
      expect(permissionsStore.hasRole('admin')).toBe(true)
      expect(permissionsStore.hasRole('user')).toBe(true)
    })

    it('should return false for non-existing role', () => {
      expect(permissionsStore.hasRole('super_admin')).toBe(false)
      expect(permissionsStore.hasRole('guest')).toBe(false)
    })
  })

  describe('initializePermissions', () => {
    it('should initialize permissions successfully', async () => {
      const mockMenuData = [{ id: 1, name: 'Dashboard', path: '/dashboard' }]
      const mockRolesData = { roles: [{ id: 1, code: 'admin', name: 'Administrator' }] }

      mockGetUserMenu.mockResolvedValue({
        success: true,
        data: mockMenuData
      })

      mockGetUserRoles.mockResolvedValue({
        success: true,
        data: mockRolesData
      })

      const result = await permissionsStore.initializePermissions()

      expect(result).toEqual({
        menuItems: expect.arrayContaining([
          expect.objectContaining({ id: 1, name: 'Dashboard' })
        ]),
        roles: mockRolesData.roles,
        level: 1,
        description: '侧边栏菜单权限'
      })
      expect(permissionsStore.error.value).toBe(null)
    })

    it('should handle initialization errors', async () => {
      mockGetUserMenu.mockRejectedValue(new Error('Network error'))

      const result = await permissionsStore.initializePermissions()

      expect(result).toBe(null)
      expect(permissionsStore.error.value).toBe('Network error')
    })
  })

  describe('clearPermissions', () => {
    it('should clear all permission data', () => {
      permissionsStore.permissions.value = [{ id: 1, code: 'TEST' }]
      permissionsStore.menuItems.value = [{ id: 1, name: 'Test' }]
      permissionsStore.roles.value = [{ id: 1, code: 'admin', name: 'Admin' }]
      permissionsStore.error.value = 'Some error'

      permissionsStore.clearPermissions()

      expect(permissionsStore.permissions.value).toEqual([])
      expect(permissionsStore.menuItems.value).toEqual([])
      expect(permissionsStore.roles.value).toEqual([])
      expect(permissionsStore.error.value).toBe(null)
    })
  })

  describe('refreshPermissions', () => {
    it('should refresh permissions by calling initializePermissions', async () => {
      const mockMenuData = [{ id: 1, name: 'Dashboard', path: '/dashboard' }]
      const mockRolesData = { roles: [{ id: 1, code: 'admin', name: 'Administrator' }] }

      mockGetUserMenu.mockResolvedValue({
        success: true,
        data: mockMenuData
      })

      mockGetUserRoles.mockResolvedValue({
        success: true,
        data: mockRolesData
      })

      await permissionsStore.refreshPermissions()

      expect(permissionsStore.menuItems.value).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 1, name: 'Dashboard' })
      ]))
      expect(permissionsStore.roles.value).toEqual(mockRolesData.roles)
    })
  })

  describe('checkPagePermission', () => {
    it('should return true for admin user', async () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'admin', name: 'Administrator' }
      ]

      const result = await permissionsStore.checkPagePermission('/dashboard', 'DASHBOARD_VIEW')
      expect(result).toBe(true)
      expect(mockPost).not.toHaveBeenCalled()
    })

    it('should use cached verification result', async () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      // Set up cache
      permissionsStore.verificationCache.value.set('/dashboard:DASHBOARD_VIEW', {
        result: true,
        timestamp: Date.now()
      })

      const result = await permissionsStore.checkPagePermission('/dashboard', 'DASHBOARD_VIEW')

      expect(result).toBe(true)
      expect(mockPost).not.toHaveBeenCalled()
    })

    it('should make API call for uncached verification', async () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      mockPost.mockResolvedValue({
        success: true,
        data: { hasPermission: true }
      })

      const result = await permissionsStore.checkPagePermission('/dashboard', 'DASHBOARD_VIEW')

      expect(result).toBe(true)
      expect(mockPost).toHaveBeenCalledWith('/dynamic-permissions/check-permission', {
        path: '/dashboard',
        permission: 'DASHBOARD_VIEW'
      })
      expect(permissionsStore.verificationCache.value.has('/dashboard:DASHBOARD_VIEW')).toBe(true)
    })

    it('should handle API error gracefully', async () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      mockPost.mockRejectedValue(new Error('API Error'))

      const result = await permissionsStore.checkPagePermission('/dashboard', 'DASHBOARD_VIEW')

      expect(result).toBe(false)
    })

    it('should handle API response with no permission', async () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      mockPost.mockResolvedValue({
        success: true,
        data: { hasPermission: false }
      })

      const result = await permissionsStore.checkPagePermission('/dashboard', 'DASHBOARD_VIEW')

      expect(result).toBe(false)
    })
  })

  describe('clearVerificationCache', () => {
    it('should clear verification cache', () => {
      permissionsStore.verificationCache.value.set('/dashboard', {
        result: true,
        timestamp: Date.now()
      })

      permissionsStore.clearVerificationCache()

      expect(permissionsStore.verificationCache.value.size).toBe(0)
    })
  })

  describe('Cache Behavior', () => {
    it('should respect cache duration for verification cache', async () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      // Set expired cache
      permissionsStore.verificationCache.value.set('/dashboard:DASHBOARD_VIEW', {
        result: true,
        timestamp: Date.now() - 6 * 60 * 1000 // 6 minutes ago
      })

      mockPost.mockResolvedValue({
        success: true,
        data: { hasPermission: false }
      })

      const result = await permissionsStore.checkPagePermission('/dashboard', 'DASHBOARD_VIEW')

      expect(result).toBe(false)
      expect(mockPost).toHaveBeenCalled()
    })

    it('should use valid verification cache', async () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      // Set valid cache
      permissionsStore.verificationCache.value.set('/dashboard:DASHBOARD_VIEW', {
        result: true,
        timestamp: Date.now() - 2 * 60 * 1000 // 2 minutes ago
      })

      const result = await permissionsStore.checkPagePermission('/dashboard', 'DASHBOARD_VIEW')

      expect(result).toBe(true)
      expect(mockPost).not.toHaveBeenCalled()
    })
  })
})