import { vi } from 'vitest'
/**
 * Route Cache Service Test
 * 路由缓存服务测试
 * 
 * 测试覆盖范围：
 * - 路由缓存初始化功能
 * - 数据库路由数据加载
 * - 角色权限关系加载
 * - 路按角色分组功能
 * - 缓存数据获取
 * - 缓存刷新功能
 * - 缓存状态监控
 * - 性能指标收集
 * - 错误处理机制
 * - 缓存预热功能
 */

import { RouteCacheService } from '../../../src/services/route-cache.service'
import { Permission } from '../../../src/models/permission.model'
import { Role } from '../../../src/models/role.model'
import { RolePermission } from '../../../src/models/role-permission.model'

// Mock dependencies
jest.mock('../../../src/models/permission.model')
jest.mock('../../../src/models/role.model')
jest.mock('../../../src/models/role-permission.model')


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

describe('RouteCacheService', () => {
  let mockPermission: jest.Mocked<typeof Permission>
  let mockRole: jest.Mocked<typeof Role>
  let mockRolePermission: jest.Mocked<typeof RolePermission>

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Setup mock implementations
    mockPermission = Permission as jest.Mocked<typeof Permission>
    mockRole = Role as jest.Mocked<typeof Role>
    mockRolePermission = RolePermission as jest.Mocked<typeof RolePermission>

    // Reset service state
    RouteCacheService.clearCache()
  })

  describe('initializeRouteCache', () => {
    it('应该成功初始化路由缓存', async () => {
      // Mock database responses
      const mockRoutes = [
        { id: 1, name: 'Dashboard', code: 'dashboard', path: '/dashboard', type: 'menu', status: 1, parent_id: 0, sort: 1 },
        { id: 2, name: 'Users', code: 'users', path: '/users', type: 'menu', status: 1, parent_id: 0, sort: 2 }
      ]

      mockPermission.findAll.mockResolvedValue(mockRoutes as any)
      jest.spyOn(RouteCacheService as any, 'loadRolePermissions').mockResolvedValue({
        admin: ['dashboard', 'users', '*'],
        teacher: ['dashboard']
      })

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await RouteCacheService.initializeRouteCache()

      expect(mockPermission.findAll).toHaveBeenCalledWith({
        where: {
          status: 1,
          type: { in: ['category', 'menu', 'page', 'button'] }
        },
        order: [
          ['parent_id', 'ASC'],
          ['sort', 'ASC'],
          ['id', 'ASC']
        ],
        raw: true
      })

      expect(RouteCacheService.getCacheStatus().isHealthy).toBe(true)
      expect(RouteCacheService.getCacheStatus().routeCount).toBe(2)
      expect(consoleSpy).toHaveBeenCalledWith('🔄 正在初始化路由缓存系统...')
      expect(consoleSpy).toHaveBeenCalledWith('✅ 路由缓存初始化完成')

      consoleSpy.mockRestore()
    })

    it('初始化失败时应该重试指定次数', async () => {
      mockPermission.findAll.mockRejectedValue(new Error('Database connection failed'))
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const errorSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(RouteCacheService.initializeRouteCache(3)).rejects.toThrow('Database connection failed')

      expect(consoleSpy).toHaveBeenCalledWith('⚠️ 路由缓存初始化失败 (尝试 1/3):', expect.any(Error))
      expect(consoleSpy).toHaveBeenCalledWith('⚠️ 路由缓存初始化失败 (尝试 2/3):', expect.any(Error))
      expect(consoleSpy).toHaveBeenCalledWith('⚠️ 路由缓存初始化失败 (尝试 3/3):', expect.any(Error))
      expect(errorSpy).toHaveBeenCalledWith('❌ 路由缓存初始化最终失败:', expect.any(Error))

      consoleSpy.mockRestore()
      errorSpy.mockRestore()
    })

    it('重试之间应该有延迟', async () => {
      mockPermission.findAll
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValue([] as any)

      jest.spyOn(RouteCacheService as any, 'loadRolePermissions').mockResolvedValue({})

      const setTimeoutSpy = jest.spyOn(global, 'setTimeout')
      
      await RouteCacheService.initializeRouteCache(3)

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000) // First delay
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000) // Second delay

      setTimeoutSpy.mockRestore()
    })
  })

  describe('loadRoutesFromDatabase', () => {
    it('应该从数据库加载路由数据', async () => {
      const mockRoutes = [
        { id: 1, name: 'Dashboard', code: 'dashboard', path: '/dashboard', type: 'menu', status: 1, parent_id: 0, sort: 1 }
      ]

      mockPermission.findAll.mockResolvedValue(mockRoutes as any)
      jest.spyOn(RouteCacheService as any, 'loadRolePermissions').mockResolvedValue({})
      jest.spyOn(RouteCacheService as any, 'cacheRoutes').mockImplementation()

      await (RouteCacheService as any).loadRoutesFromDatabase()

      expect(mockPermission.findAll).toHaveBeenCalledWith({
        where: {
          status: 1,
          type: { in: ['category', 'menu', 'page', 'button'] }
        },
        order: [
          ['parent_id', 'ASC'],
          ['sort', 'ASC'],
          ['id', 'ASC']
        ],
        raw: true
      })

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      consoleSpy.mockRestore()
    })

    it('数据库查询失败时应该抛出错误', async () => {
      mockPermission.findAll.mockRejectedValue(new Error('Query failed'))
      jest.spyOn(RouteCacheService as any, 'loadRolePermissions').mockResolvedValue({})

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect((RouteCacheService as any).loadRoutesFromDatabase()).rejects.toThrow('Query failed')
      expect(consoleSpy).toHaveBeenCalledWith('❌ 数据库查询失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('loadRolePermissions', () => {
    it('应该加载角色权限关系', async () => {
      const mockRolePermissions = [
        {
          role: { id: 1, name: 'Admin', code: 'admin' },
          permission: { id: 1, code: 'dashboard', path: '/dashboard' }
        },
        {
          role: { id: 2, name: 'Teacher', code: 'teacher' },
          permission: { id: 2, code: 'students', path: '/students' }
        }
      ]

      mockRolePermission.findAll.mockResolvedValue(mockRolePermissions as any)

      const result = await (RouteCacheService as any).loadRolePermissions()

      expect(mockRolePermission.findAll).toHaveBeenCalledWith({
        include: [
          { model: Role, as: 'role', attributes: ['id', 'name', 'code'] },
          { model: Permission, as: 'permission', attributes: ['id', 'code', 'path'] }
        ],
        raw: false
      })

      expect(result).toEqual({
        admin: ['dashboard', '/dashboard'],
        teacher: ['students', '/students']
      })
    })

    it('加载失败时应该返回空对象并记录警告', async () => {
      mockRolePermission.findAll.mockRejectedValue(new Error('Association not found'))

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const result = await (RouteCacheService as any).loadRolePermissions()

      expect(result).toEqual({})
      expect(consoleSpy).toHaveBeenCalledWith('⚠️ 角色权限加载失败，将使用基础权限检查:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('应该处理关联数据缺失的情况', async () => {
      const mockRolePermissions = [
        {
          role: null, // Missing role
          permission: { id: 1, code: 'dashboard', path: '/dashboard' }
        },
        {
          role: { id: 2, name: 'Teacher', code: 'teacher' },
          permission: null // Missing permission
        }
      ]

      mockRolePermission.findAll.mockResolvedValue(mockRolePermissions as any)

      const result = await (RouteCacheService as any).loadRolePermissions()

      expect(result).toEqual({}) // Should be empty since both entries have missing data
    })
  })

  describe('cacheRoutes', () => {
    it('应该正确缓存路由数据', async () => {
      const mockRoutes = [
        { id: 1, name: 'Dashboard', code: 'dashboard', path: '/dashboard', type: 'menu', status: 1, parent_id: 0, sort: 1 },
        { id: 2, name: 'Users', code: 'users', path: '/users', type: 'menu', status: 1, parent_id: 0, sort: 2 }
      ]

      const mockRolePermissions = {
        admin: ['dashboard', 'users'],
        teacher: ['dashboard']
      }

      jest.spyOn(RouteCacheService as any, 'groupRoutesByRole').mockReturnValue({
        admin: mockRoutes,
        teacher: [mockRoutes[0]],
        default: []
      })

      await (RouteCacheService as any).cacheRoutes(mockRoutes, mockRolePermissions)

      const status = RouteCacheService.getCacheStatus()
      expect(status.allRoutes).toEqual(mockRoutes)
      expect(status.permissionsByRole).toEqual(mockRolePermissions)
      expect(status.routeCount).toBe(2)
      expect(status.isHealthy).toBe(true)
      expect(status.lastLoadTime).toBeGreaterThan(0)
    })
  })

  describe('groupRoutesByRole', () => {
    it('应该按角色正确分组路由', () => {
      const mockRoutes = [
        { id: 1, name: 'Dashboard', code: 'dashboard', path: '/dashboard', type: 'menu', permission: '' },
        { id: 2, name: 'Users', code: 'users', path: '/users', type: 'menu', permission: 'admin' },
        { id: 3, name: 'Students', code: 'students', path: '/students', type: 'menu', permission: 'teacher' }
      ]

      const mockRolePermissions = {
        admin: ['dashboard', 'users', '*'],
        teacher: ['dashboard', 'students']
      }

      const result = (RouteCacheService as any).groupRoutesByRole(mockRoutes, mockRolePermissions)

      expect(result.admin).toHaveLength(3) // Admin has all routes
      expect(result.teacher).toHaveLength(2) // Teacher has dashboard and students
      expect(result.default).toHaveLength(1) // Default has routes without permission
      expect(result['admin']).toEqual(mockRoutes) // Admin has access to everything
    })

    it('应该处理超级管理员权限', () => {
      const mockRoutes = [
        { id: 1, name: 'Dashboard', code: 'dashboard', path: '/dashboard', type: 'menu' },
        { id: 2, name: 'Users', code: 'users', path: '/users', type: 'menu' }
      ]

      const mockRolePermissions = {
        superadmin: ['*'] // Super admin has all permissions
      }

      const result = (RouteCacheService as any).groupRoutesByRole(mockRoutes, mockRolePermissions)

      expect(result.superadmin).toHaveLength(2) // Super admin has all routes
    })
  })

  describe('getCachedRoutes', () => {
    beforeEach(async () => {
      // Initialize cache with test data
      const mockRoutes = [
        { id: 1, name: 'Dashboard', code: 'dashboard', path: '/dashboard', type: 'menu', status: 1, parent_id: 0, sort: 1 },
        { id: 2, name: 'Users', code: 'users', path: '/users', type: 'menu', status: 1, parent_id: 0, sort: 2 }
      ]

      mockPermission.findAll.mockResolvedValue(mockRoutes as any)
      jest.spyOn(RouteCacheService as any, 'loadRolePermissions').mockResolvedValue({
        admin: ['dashboard', 'users'],
        teacher: ['dashboard']
      })

      await RouteCacheService.initializeRouteCache()
    })

    it('应该返回所有路由', () => {
      const routes = RouteCacheService.getCachedRoutes()
      expect(routes).toHaveLength(2)
      expect(routes[0].name).toBe('Dashboard')
    })

    it('应该返回特定角色的路由', () => {
      const adminRoutes = RouteCacheService.getCachedRoutes('admin')
      expect(adminRoutes).toHaveLength(2)

      const teacherRoutes = RouteCacheService.getCachedRoutes('teacher')
      expect(teacherRoutes).toHaveLength(1)
      expect(teacherRoutes[0].name).toBe('Dashboard')
    })

    it('缓存不健康时应该返回空数组', () => {
      // Mark cache as unhealthy
      RouteCacheService.clearCache()

      const routes = RouteCacheService.getCachedRoutes()
      expect(routes).toHaveLength(0)

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const routesWithRole = RouteCacheService.getCachedRoutes('admin')
      expect(routesWithRole).toHaveLength(0)
      expect(consoleSpy).toHaveBeenCalledWith('⚠️ 路由缓存状态异常，返回空数组')
      consoleSpy.mockRestore()
    })

    it('不存在的角色应该返回默认路由', () => {
      const unknownRoleRoutes = RouteCacheService.getCachedRoutes('unknown')
      expect(unknownRoleRoutes).toHaveLength(0) // Default routes are empty in our test setup
    })
  })

  describe('getUserPermissions', () => {
    beforeEach(async () => {
      const mockRoutes = [{ id: 1, name: 'Dashboard', code: 'dashboard', path: '/dashboard', type: 'menu', status: 1, parent_id: 0, sort: 1 }]
      mockPermission.findAll.mockResolvedValue(mockRoutes as any)
      jest.spyOn(RouteCacheService as any, 'loadRolePermissions').mockResolvedValue({
        admin: ['dashboard', 'users'],
        teacher: ['dashboard']
      })

      await RouteCacheService.initializeRouteCache()
    })

    it('应该返回用户权限列表', () => {
      const adminPermissions = RouteCacheService.getUserPermissions('admin')
      expect(adminPermissions).toEqual(['dashboard', 'users'])

      const teacherPermissions = RouteCacheService.getUserPermissions('teacher')
      expect(teacherPermissions).toEqual(['dashboard'])

      const unknownPermissions = RouteCacheService.getUserPermissions('unknown')
      expect(unknownPermissions).toEqual([])
    })
  })

  describe('refreshCache', () => {
    beforeEach(async () => {
      const mockRoutes = [
        { id: 1, name: 'Dashboard', code: 'dashboard', path: '/dashboard', type: 'menu', status: 1, parent_id: 0, sort: 1 }
      ]

      mockPermission.findAll.mockResolvedValue(mockRoutes as any)
      jest.spyOn(RouteCacheService as any, 'loadRolePermissions').mockResolvedValue({
        admin: ['dashboard']
      })

      await RouteCacheService.initializeRouteCache()
    })

    it('应该成功刷新缓存', async () => {
      const newRoutes = [
        { id: 1, name: 'Dashboard', code: 'dashboard', path: '/dashboard', type: 'menu', status: 1, parent_id: 0, sort: 1 },
        { id: 2, name: 'Users', code: 'users', path: '/users', type: 'menu', status: 1, parent_id: 0, sort: 2 }
      ]

      mockPermission.findAll.mockResolvedValue(newRoutes as any)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await RouteCacheService.refreshCache()

      expect(consoleSpy).toHaveBeenCalledWith('🔄 开始刷新路由缓存...')
      expect(consoleSpy).toHaveBeenCalledWith('✅ 路由缓存刷新完成: 1 → 2 条路由')

      const status = RouteCacheService.getCacheStatus()
      expect(status.routeCount).toBe(2)

      consoleSpy.mockRestore()
    })

    it('刷新失败时应该增加错误计数', async () => {
      mockPermission.findAll.mockRejectedValue(new Error('Refresh failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(RouteCacheService.refreshCache()).rejects.toThrow('Refresh failed')
      expect(consoleSpy).toHaveBeenCalledWith('❌ 路由缓存刷新失败:', expect.any(Error))

      const metrics = RouteCacheService.getMetrics()
      expect(metrics.errorCount).toBeGreaterThan(0)

      consoleSpy.mockRestore()
    })
  })

  describe('缓存状态和监控', () => {
    beforeEach(async () => {
      const mockRoutes = [
        { id: 1, name: 'Dashboard', code: 'dashboard', path: '/dashboard', type: 'menu', status: 1, parent_id: 0, sort: 1 }
      ]

      mockPermission.findAll.mockResolvedValue(mockRoutes as any)
      jest.spyOn(RouteCacheService as any, 'loadRolePermissions').mockResolvedValue({
        admin: ['dashboard']
      })

      await RouteCacheService.initializeRouteCache()
    })

    it('应该返回正确的缓存状态', () => {
      const status = RouteCacheService.getCacheStatus()

      expect(status).toHaveProperty('allRoutes')
      expect(status).toHaveProperty('routesByRole')
      expect(status).toHaveProperty('permissionsByRole')
      expect(status).toHaveProperty('lastLoadTime')
      expect(status).toHaveProperty('version')
      expect(status).toHaveProperty('routeCount')
      expect(status).toHaveProperty('isHealthy')
      expect(status).toHaveProperty('loadTime')
      expect(status).toHaveProperty('queryTime')
      expect(status).toHaveProperty('processingTime')
      expect(status).toHaveProperty('errorCount')
      expect(status).toHaveProperty('cacheAge')
    })

    it('应该返回最后加载时间', () => {
      const lastLoadTime = RouteCacheService.getLastLoadTime()
      expect(lastLoadTime).toBeGreaterThan(0)
    })

    it('应该正确检查缓存健康状态', () => {
      expect(RouteCacheService.isHealthy()).toBe(true)

      RouteCacheService.clearCache()
      expect(RouteCacheService.isHealthy()).toBe(false)
    })

    it('应该返回性能指标', () => {
      const metrics = RouteCacheService.getMetrics()

      expect(metrics).toHaveProperty('loadTime')
      expect(metrics).toHaveProperty('queryTime')
      expect(metrics).toHaveProperty('processingTime')
      expect(metrics).toHaveProperty('errorCount')
    })
  })

  describe('clearCache', () => {
    beforeEach(async () => {
      const mockRoutes = [
        { id: 1, name: 'Dashboard', code: 'dashboard', path: '/dashboard', type: 'menu', status: 1, parent_id: 0, sort: 1 }
      ]

      mockPermission.findAll.mockResolvedValue(mockRoutes as any)
      jest.spyOn(RouteCacheService as any, 'loadRolePermissions').mockResolvedValue({
        admin: ['dashboard']
      })

      await RouteCacheService.initializeRouteCache()
    })

    it('应该清空缓存', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      RouteCacheService.clearCache()

      const status = RouteCacheService.getCacheStatus()
      expect(status.allRoutes).toEqual([])
      expect(status.routesByRole).toEqual({})
      expect(status.permissionsByRole).toEqual({})
      expect(status.routeCount).toBe(0)
      expect(status.isHealthy).toBe(false)

      expect(consoleSpy).toHaveBeenCalledWith('🗑️ 清空路由缓存')

      consoleSpy.mockRestore()
    })
  })

  describe('warmupCache', () => {
    beforeEach(async () => {
      const mockRoutes = [
        { id: 1, name: 'Dashboard', code: 'dashboard', path: '/dashboard', type: 'menu', status: 1, parent_id: 0, sort: 1 },
        { id: 2, name: 'Users', code: 'users', path: '/users', type: 'menu', status: 1, parent_id: 0, sort: 2 }
      ]

      mockPermission.findAll.mockResolvedValue(mockRoutes as any)
      jest.spyOn(RouteCacheService as any, 'loadRolePermissions').mockResolvedValue({
        admin: ['dashboard', 'users'],
        teacher: ['dashboard'],
        principal: ['dashboard', 'users'],
        parent: ['dashboard']
      })

      await RouteCacheService.initializeRouteCache()
    })

    it('应该预热常用角色的路由数据', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      RouteCacheService.warmupCache()

      expect(consoleSpy).toHaveBeenCalledWith('🔥 开始缓存预热...')
      expect(consoleSpy).toHaveBeenCalledWith('🔥 预热角色 "admin": 2 条路由')
      expect(consoleSpy).toHaveBeenCalledWith('🔥 预热角色 "principal": 2 条路由')
      expect(consoleSpy).toHaveBeenCalledWith('🔥 预热角色 "teacher": 1 条路由')
      expect(consoleSpy).toHaveBeenCalledWith('🔥 预热角色 "parent": 1 条路由')
      expect(consoleSpy).toHaveBeenCalledWith('✅ 缓存预热完成')

      consoleSpy.mockRestore()
    })
  })
})