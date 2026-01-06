import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePermissionsStore } from '@/stores/permissions-simple'
import { createStoreTestHelper, createPermissionMockHelper, createApiMockHelper } from '../../utils/component-test-helper'

// 创建测试辅助工具
const storeHelper = createStoreTestHelper()
const permissionHelper = createPermissionMockHelper()
const apiHelper = createApiMockHelper()

// Mock API functions
const mockGetUserMenu = vi.fn()
const mockGetUserRoles = vi.fn()
const mockPost = vi.fn()

vi.mock('@/api/modules/auth-permissions', () => ({
  getUserMenu: () => mockGetUserMenu(),
  getUserRoles: () => mockGetUserRoles()
}))

vi.mock('@/utils/request', () => ({
  post: () => mockPost()
}))

// 控制台错误检测变量
let consoleSpy: any

describe('Permissions Store (Simple)', () => {
  let permissionsStore: ReturnType<typeof usePermissionsStore>
  let pinia: any

  beforeEach(() => {
    vi.clearAllMocks()

    // 使用测试辅助工具创建Store
    permissionsStore = storeHelper.getStore(usePermissionsStore)

    // 重置权限Mock数据
    permissionHelper.resetPermissions()

    // 设置默认的API Mock响应
    mockGetUserMenu.mockResolvedValue(apiHelper.createSuccessResponse([
      { id: 1, name: 'Dashboard', path: '/dashboard' }
    ]))

    mockGetUserRoles.mockResolvedValue(apiHelper.createSuccessResponse([
      'Administrator'
    ]))

    mockPost.mockResolvedValue(apiHelper.createSuccessResponse({
      hasPermission: true
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}))
  })

  afterEach(() => {
    vi.resetAllMocks()
    storeHelper.resetStores()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('State Initialization', () => {
    it('should initialize with default state', () => {
      expect(permissionsStore.menuItems.value).toEqual([])
      expect(permissionsStore.roles.value).toEqual([])
      expect(permissionsStore.loading.value).toBe(false)
      expect(permissionsStore.error.value).toBe(null)
      expect(permissionsStore.permissionCache.value.size).toBe(0)
    })
  })

  describe('Computed Properties', () => {
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

  describe('fetchMenuItems', () => {
    it('should fetch menu items successfully', async () => {
      const mockMenuData = [
        { id: 1, name: 'Dashboard', path: '/dashboard' },
        { id: 2, name: 'Users', path: '/users' }
      ]

      mockGetUserMenu.mockResolvedValue({
        success: true,
        data: mockMenuData
      })

      await permissionsStore.fetchMenuItems()

      expect(permissionsStore.loading.value).toBe(false)
      expect(permissionsStore.error.value).toBe(null)
      expect(permissionsStore.menuItems.value).toEqual(mockMenuData)
      expect(mockGetUserMenu).toHaveBeenCalledTimes(1)
    })

    it('should handle empty menu data', async () => {
      mockGetUserMenu.mockResolvedValue({
        success: true,
        data: []
      })

      await permissionsStore.fetchMenuItems()

      expect(permissionsStore.menuItems.value).toEqual([])
      expect(permissionsStore.hasMenuItems.value).toBe(false)
    })

    it('should handle API error', async () => {
      const errorMessage = 'Network error'
      mockGetUserMenu.mockRejectedValue(new Error(errorMessage))

      await permissionsStore.fetchMenuItems()

      expect(permissionsStore.loading.value).toBe(false)
      expect(permissionsStore.error.value).toBe(errorMessage)
      expect(permissionsStore.menuItems.value).toEqual([])
      expect(permissionsStore.hasMenuItems.value).toBe(false)
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
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    it('should return true for admin user', async () => {
      // 设置用户为管理员
      permissionsStore.roles.value = [
        { id: 1, code: 'admin', name: 'Administrator' }
      ]

      const result = await permissionsStore.hasPermission('ANY_PERMISSION')
      expect(result).toBe(true)
      expect(mockPost).not.toHaveBeenCalled()
    })

    it('should check permission cache', async () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]
      
      // Set up cache
      permissionsStore.permissionCache.value.set('TEST_PERMISSION', {
        result: true,
        timestamp: Date.now()
      })

      const result = await permissionsStore.hasPermission('TEST_PERMISSION')
      expect(result).toBe(true)
      expect(mockPost).not.toHaveBeenCalled()
    })

    it('should make API call for uncached permission', async () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      mockPost.mockResolvedValue({
        success: true,
        data: { hasPermission: true }
      })

      const result = await permissionsStore.hasPermission('TEST_PERMISSION')

      expect(result).toBe(true)
      expect(mockPost).toHaveBeenCalledWith('/permissions/check', {
        permission: 'TEST_PERMISSION'
      })
      expect(permissionsStore.permissionCache.value.has('TEST_PERMISSION')).toBe(true)
    })

    it('should handle API error gracefully', async () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      mockPost.mockRejectedValue(new Error('API Error'))

      const result = await permissionsStore.hasPermission('TEST_PERMISSION')

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

      const result = await permissionsStore.hasPermission('TEST_PERMISSION')

      expect(result).toBe(false)
    })
  })

  describe('hasPermissions', () => {
    beforeEach(() => {
      permissionsStore.roles.value = [
        { id: 1, code: 'admin', name: 'Administrator' }
      ]
    })

    it('should return all true for admin user', async () => {
      const permissions = ['PERM_1', 'PERM_2', 'PERM_3']
      const result = await permissionsStore.hasPermissions(permissions)

      expect(result).toEqual({
        PERM_1: true,
        PERM_2: true,
        PERM_3: true
      })
      expect(mockPost).not.toHaveBeenCalled()
    })

    it('should use cached permissions when available', async () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      // Set up cache for some permissions
      permissionsStore.permissionCache.value.set('PERM_1', {
        result: true,
        timestamp: Date.now()
      })
      permissionsStore.permissionCache.value.set('PERM_2', {
        result: false,
        timestamp: Date.now()
      })

      mockPost.mockResolvedValue({
        success: true,
        data: { results: { PERM_3: true } }
      })

      const result = await permissionsStore.hasPermissions(['PERM_1', 'PERM_2', 'PERM_3'])

      expect(result).toEqual({
        PERM_1: true,
        PERM_2: false,
        PERM_3: true
      })
      expect(mockPost).toHaveBeenCalledWith('/permissions/batch-check', {
        permissions: ['PERM_3']
      })
    })

    it('should handle API error in batch check', async () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      mockPost.mockRejectedValue(new Error('API Error'))

      const result = await permissionsStore.hasPermissions(['PERM_1', 'PERM_2'])

      expect(result).toEqual({
        PERM_1: false,
        PERM_2: false
      })
    })
  })

  describe('hasPermissionSync', () => {
    beforeEach(() => {
      permissionsStore.roles.value = [
        { id: 1, code: 'admin', name: 'Administrator' }
      ]
    })

    it('should return true for admin user', () => {
      const result = permissionsStore.hasPermissionSync('ANY_PERMISSION')
      expect(result).toBe(true)
    })

    it('should return cached permission value', () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      permissionsStore.permissionCache.value.set('TEST_PERMISSION', {
        result: true,
        timestamp: Date.now()
      })

      const result = permissionsStore.hasPermissionSync('TEST_PERMISSION')
      expect(result).toBe(true)
    })

    it('should return false for uncached permission', () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      const result = permissionsStore.hasPermissionSync('TEST_PERMISSION')
      expect(result).toBe(false)
    })

    it('should return false for expired cache', () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      permissionsStore.permissionCache.value.set('TEST_PERMISSION', {
        result: true,
        timestamp: Date.now() - 6 * 60 * 1000 // 6 minutes ago (expired)
      })

      const result = permissionsStore.hasPermissionSync('TEST_PERMISSION')
      expect(result).toBe(false)
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

      expect(result).toBe(true)
      expect(permissionsStore.menuItems.value).toEqual(mockMenuData)
      expect(permissionsStore.roles.value).toEqual(mockRolesData.roles)
      expect(permissionsStore.error.value).toBe(null)
    })

    it('should handle initialization errors', async () => {
      mockGetUserMenu.mockRejectedValue(new Error('Network error'))

      const result = await permissionsStore.initializePermissions()

      expect(result).toBe(false)
      expect(permissionsStore.error.value).toBe('Network error')
    })
  })

  describe('clearPermissionCache', () => {
    it('should clear permission cache', () => {
      permissionsStore.permissionCache.value.set('TEST_PERMISSION', {
        result: true,
        timestamp: Date.now()
      })

      permissionsStore.clearPermissionCache()

      expect(permissionsStore.permissionCache.value.size).toBe(0)
    })
  })

  describe('clearPermissions', () => {
    it('should clear all permission data', () => {
      permissionsStore.menuItems.value = [{ id: 1, name: 'Test' }]
      permissionsStore.roles.value = [{ id: 1, code: 'admin', name: 'Admin' }]
      permissionsStore.permissionCache.value.set('TEST', { result: true, timestamp: Date.now() })
      permissionsStore.error.value = 'Some error'

      permissionsStore.clearPermissions()

      expect(permissionsStore.menuItems.value).toEqual([])
      expect(permissionsStore.roles.value).toEqual([])
      expect(permissionsStore.permissionCache.value.size).toBe(0)
      expect(permissionsStore.error.value).toBe(null)
    })
  })

  describe('Cache Behavior', () => {
    it('should respect cache duration', async () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      // Set expired cache
      permissionsStore.permissionCache.value.set('TEST_PERMISSION', {
        result: true,
        timestamp: Date.now() - 6 * 60 * 1000 // 6 minutes ago
      })

      mockPost.mockResolvedValue({
        success: true,
        data: { hasPermission: false }
      })

      const result = await permissionsStore.hasPermission('TEST_PERMISSION')

      expect(result).toBe(false)
      expect(mockPost).toHaveBeenCalled()
    })

    it('should use valid cache', async () => {
      permissionsStore.roles.value = [
        { id: 1, code: 'user', name: 'User' }
      ]

      // Set valid cache
      permissionsStore.permissionCache.value.set('TEST_PERMISSION', {
        result: true,
        timestamp: Date.now() - 2 * 60 * 1000 // 2 minutes ago
      })

      const result = await permissionsStore.hasPermission('TEST_PERMISSION')

      expect(result).toBe(true)
      expect(mockPost).not.toHaveBeenCalled()
    })
  })
})