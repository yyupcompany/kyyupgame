/**
 * Permission Watcher Service Test
 * 权限变更监听服务测试
 * 
 * 测试覆盖范围：
 * - 服务启动和停止功能
 * - 权限变更监听钩子
 * - 角色变更监听钩子
 * - 角色权限关系变更监听
 * - 缓存刷新机制
 * - 强制刷新功能
 * - 定期检查机制
 * - 变更事件管理
 * - 状态查询功能
 * - 错误处理机制
 */

import { PermissionWatcherService, ChangeEvent } from '../../../src/services/permission-watcher.service'
import { RouteCacheService } from '../../../src/services/route-cache.service'
import { Permission } from '../../../src/models/permission.model'
import { Role } from '../../../src/models/role.model'
import { RolePermission } from '../../../src/models/role-permission.model'
import sequelize from '../../../src/config/sequelize'

// Mock dependencies
jest.mock('../../../src/services/route-cache.service')
jest.mock('../../../src/models/permission.model')
jest.mock('../../../src/models/role.model')
jest.mock('../../../src/models/role-permission.model')
jest.mock('../../../src/config/sequelize')

describe('PermissionWatcherService', () => {
  let mockRouteCacheService: jest.Mocked<typeof RouteCacheService>
  let mockPermission: jest.Mocked<typeof Permission>
  let mockRole: jest.Mocked<typeof Role>
  let mockRolePermission: jest.Mocked<typeof RolePermission>
  let mockSequelize: jest.Mocked<typeof sequelize>

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Setup mock implementations
    mockRouteCacheService = RouteCacheService as jest.Mocked<typeof RouteCacheService>
    mockPermission = Permission as jest.Mocked<typeof Permission>
    mockRole = Role as jest.Mocked<typeof Role>
    mockRolePermission = RolePermission as jest.Mocked<typeof RolePermission>
    mockSequelize = sequelize as jest.Mocked<typeof sequelize>

    // Reset service state
    (PermissionWatcherService as any).isWatching = false
    (PermissionWatcherService as any).refreshTimeout = null
    (PermissionWatcherService as any).changeEvents = []

    // Setup default mock behaviors
    mockRouteCacheService.refreshCache = jest.fn().mockResolvedValue(undefined)
    mockRouteCacheService.getLastLoadTime = jest.fn().mockReturnValue(Date.now() - 10000)
    mockPermission.addHook = jest.fn()
    mockRole.addHook = jest.fn()
    mockRolePermission.addHook = jest.fn()
    mockSequelize.query = jest.fn().mockResolvedValue([{ lastModified: new Date().toISOString() }])
  })

  afterEach(() => {
    // Clean up any timeouts
    const timeout = (PermissionWatcherService as any).refreshTimeout
    if (timeout) {
      clearTimeout(timeout)
    }
  })

  describe('startWatching', () => {
    it('应该成功启动权限监听服务', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      PermissionWatcherService.startWatching()

      expect((PermissionWatcherService as any).isWatching).toBe(true)
      expect(mockPermission.addHook).toHaveBeenCalledTimes(6) // afterCreate, afterUpdate, afterDestroy, afterBulkCreate, afterBulkUpdate, afterBulkDestroy
      expect(mockRole.addHook).toHaveBeenCalledTimes(3) // afterCreate, afterUpdate, afterDestroy
      expect(mockRolePermission.addHook).toHaveBeenCalledTimes(2) // afterCreate, afterDestroy
      expect(consoleSpy).toHaveBeenCalledWith('👀 启动权限变更监听服务...')
      expect(consoleSpy).toHaveBeenCalledWith('✅ 权限变更监听服务已启动')

      consoleSpy.mockRestore()
    })

    it('不应该重复启动监听服务', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      // First start
      PermissionWatcherService.startWatching()
      expect((PermissionWatcherService as any).isWatching).toBe(true)

      // Second start
      PermissionWatcherService.startWatching()
      expect(consoleSpy).toHaveBeenCalledWith('⚠️ 权限监听服务已在运行')

      consoleSpy.mockRestore()
    })

    it('启动失败时应该正确处理错误', () => {
      mockPermission.addHook.mockImplementationOnce(() => {
        throw new Error('Hook setup failed')
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        PermissionWatcherService.startWatching()
      }).toThrow('Hook setup failed')

      expect((PermissionWatcherService as any).isWatching).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('❌ 启动权限监听服务失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('启动时应该记录变更事件', () => {
      PermissionWatcherService.startWatching()

      const events = PermissionWatcherService.getChangeEvents()
      expect(events).toHaveLength(1)
      expect(events[0]).toMatchObject({
        type: 'create',
        model: 'PermissionWatcher',
        instanceId: 'service',
        details: { message: '权限变更监听服务启动成功' }
      })
    })
  })

  describe('stopWatching', () => {
    beforeEach(() => {
      PermissionWatcherService.startWatching()
    })

    it('应该成功停止权限监听服务', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      // Set a timeout to test cleanup
      const timeout = setTimeout(() => {}, 1000)
      ;(PermissionWatcherService as any).refreshTimeout = timeout

      PermissionWatcherService.stopWatching()

      expect((PermissionWatcherService as any).isWatching).toBe(false)
      expect((PermissionWatcherService as any).refreshTimeout).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('🛑 停止权限变更监听服务...')
      expect(consoleSpy).toHaveBeenCalledWith('✅ 权限变更监听服务已停止')

      consoleSpy.mockRestore()
    })

    it('在未启动状态下停止应该什么都不做', () => {
      (PermissionWatcherService as any).isWatching = false

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      PermissionWatcherService.stopWatching()

      expect(consoleSpy).not.toHaveBeenCalledWith('🛑 停止权限变更监听服务...')

      consoleSpy.mockRestore()
    })
  })

  describe('权限变更监听钩子', () => {
    beforeEach(() => {
      PermissionWatcherService.startWatching()
    })

    it('应该正确监听权限创建事件', () => {
      const afterCreateHook = mockPermission.addHook.mock.calls.find(
        call => call[0] === 'afterCreate'
      )?.[1]

      expect(afterCreateHook).toBeDefined()

      if (afterCreateHook) {
        const mockInstance = {
          id: 1,
          name: 'Test Permission',
          code: 'test:permission',
          path: '/test',
          type: 'menu'
        }

        const scheduleRefreshSpy = jest.spyOn(PermissionWatcherService as any, 'scheduleRefresh')

        afterCreateHook(mockInstance, {})

        const events = PermissionWatcherService.getChangeEvents()
        expect(events[events.length - 1]).toMatchObject({
          type: 'create',
          model: 'Permission',
          instanceId: 1,
          details: {
            name: 'Test Permission',
            code: 'test:permission',
            path: '/test',
            type: 'menu'
          }
        })

        expect(scheduleRefreshSpy).toHaveBeenCalled()
      }
    })

    it('应该正确监听权限更新事件', () => {
      const afterUpdateHook = mockPermission.addHook.mock.calls.find(
        call => call[0] === 'afterUpdate'
      )?.[1]

      expect(afterUpdateHook).toBeDefined()

      if (afterUpdateHook) {
        const mockInstance = {
          id: 1,
          name: 'Updated Permission',
          code: 'updated:permission',
          path: '/updated',
          type: 'menu'
        }

        const mockOptions = { fields: ['name', 'path'] }

        afterUpdateHook(mockInstance, mockOptions)

        const events = PermissionWatcherService.getChangeEvents()
        expect(events[events.length - 1]).toMatchObject({
          type: 'update',
          model: 'Permission',
          instanceId: 1,
          details: {
            name: 'Updated Permission',
            code: 'updated:permission',
            path: '/updated',
            type: 'menu',
            changed: ['name', 'path']
          }
        })
      }
    })

    it('应该正确监听权限删除事件', () => {
      const afterDestroyHook = mockPermission.addHook.mock.calls.find(
        call => call[0] === 'afterDestroy'
      )?.[1]

      expect(afterDestroyHook).toBeDefined()

      if (afterDestroyHook) {
        const mockInstance = {
          id: 1,
          name: 'Deleted Permission',
          code: 'deleted:permission'
        }

        afterDestroyHook(mockInstance, {})

        const events = PermissionWatcherService.getChangeEvents()
        expect(events[events.length - 1]).toMatchObject({
          type: 'destroy',
          model: 'Permission',
          instanceId: 1,
          details: {
            name: 'Deleted Permission',
            code: 'deleted:permission'
          }
        })
      }
    })

    it('应该正确监听角色创建事件', () => {
      const afterCreateHook = mockRole.addHook.mock.calls.find(
        call => call[0] === 'afterCreate'
      )?.[1]

      expect(afterCreateHook).toBeDefined()

      if (afterCreateHook) {
        const mockInstance = {
          id: 1,
          name: 'Test Role',
          code: 'test:role'
        }

        afterCreateHook(mockInstance)

        const events = PermissionWatcherService.getChangeEvents()
        expect(events[events.length - 1]).toMatchObject({
          type: 'create',
          model: 'Role',
          instanceId: 1,
          details: {
            name: 'Test Role',
            code: 'test:role'
          }
        })
      }
    })

    it('应该正确监听角色权限关系创建事件', () => {
      const afterCreateHook = mockRolePermission.addHook.mock.calls.find(
        call => call[0] === 'afterCreate'
      )?.[1]

      expect(afterCreateHook).toBeDefined()

      if (afterCreateHook) {
        const mockInstance = {
          id: 1,
          roleId: 1,
          permissionId: 2
        }

        afterCreateHook(mockInstance)

        const events = PermissionWatcherService.getChangeEvents()
        expect(events[events.length - 1]).toMatchObject({
          type: 'create',
          model: 'RolePermission',
          instanceId: 1,
          details: {
            roleId: 1,
            permissionId: 2
          }
        })
      }
    })
  })

  describe('缓存刷新机制', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      PermissionWatcherService.startWatching()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('应该延迟刷新缓存', () => {
      const onPermissionChangedSpy = jest.spyOn(PermissionWatcherService as any, 'onPermissionChanged')

      // Trigger a permission change
      const afterCreateHook = mockPermission.addHook.mock.calls.find(
        call => call[0] === 'afterCreate'
      )?.[1]

      if (afterCreateHook) {
        afterCreateHook({ id: 1 }, {})

        expect((PermissionWatcherService as any).refreshTimeout).not.toBeNull()
        expect(mockRouteCacheService.refreshCache).not.toHaveBeenCalled() // Should not be called immediately

        // Fast-forward time
        jest.advanceTimersByTime(2000)

        expect(mockRouteCacheService.refreshCache).toHaveBeenCalled()
      }

      onPermissionChangedSpy.mockRestore()
    })

    it('应该取消之前的延迟刷新并重新调度', () => {
      const firstTimeout = setTimeout(() => {}, 1000)
      ;(PermissionWatcherService as any).refreshTimeout = firstTimeout

      // Trigger multiple changes quickly
      const afterCreateHook = mockPermission.addHook.mock.calls.find(
        call => call[0] === 'afterCreate'
      )?.[1]

      if (afterCreateHook) {
        afterCreateHook({ id: 1 }, {})
        afterCreateHook({ id: 2 }, {})

        expect((PermissionWatcherService as any).refreshTimeout).not.toBe(firstTimeout)
        expect(clearTimeout).toHaveBeenCalledWith(firstTimeout)
      }
    })

    it('刷新失败时应该记录错误', async () => {
      mockRouteCacheService.refreshCache.mockRejectedValue(new Error('Refresh failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Trigger a change and advance timers
      const afterCreateHook = mockPermission.addHook.mock.calls.find(
        call => call[0] === 'afterCreate'
      )?.[1]

      if (afterCreateHook) {
        afterCreateHook({ id: 1 }, {})
        jest.advanceTimersByTime(2000)

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(consoleSpy).toHaveBeenCalledWith('❌ 权限变更响应失败:', expect.any(Error))
      }

      consoleSpy.mockRestore()
    })
  })

  describe('forceRefresh', () => {
    it('应该立即刷新缓存', async () => {
      // Set up a pending timeout
      const timeout = setTimeout(() => {}, 1000)
      ;(PermissionWatcherService as any).refreshTimeout = timeout

      await PermissionWatcherService.forceRefresh()

      expect(clearTimeout).toHaveBeenCalledWith(timeout)
      expect((PermissionWatcherService as any).refreshTimeout).toBeNull()
      expect(mockRouteCacheService.refreshCache).toHaveBeenCalled()
    })

    it('刷新失败时应该抛出错误', async () => {
      mockRouteCacheService.refreshCache.mockRejectedValue(new Error('Force refresh failed'))

      await expect(PermissionWatcherService.forceRefresh()).rejects.toThrow('Force refresh failed')
    })
  })

  describe('定期检查机制', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      PermissionWatcherService.startWatching()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('应该启动定期检查', () => {
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 5 * 60 * 1000)
    })

    it('应该检测到权限变更并刷新缓存', async () => {
      // Mock the query to return an old timestamp
      mockSequelize.query.mockResolvedValue([{ lastModified: new Date(Date.now() - 120000).toISOString() }])
      mockRouteCacheService.getLastLoadTime.mockReturnValue(Date.now() - 180000)

      // Get the periodic check function
      const setIntervalCall = jest.spyOn(global, 'setInterval')
      const periodicCheck = setIntervalCall.mock.calls[0][0]

      await periodicCheck()

      expect(mockRouteCacheService.refreshCache).toHaveBeenCalled()
    })

    it('不应该在时间差异较小时刷新缓存', async () => {
      // Mock the query to return a recent timestamp
      mockSequelize.query.mockResolvedValue([{ lastModified: new Date().toISOString() }])
      mockRouteCacheService.getLastLoadTime.mockReturnValue(Date.now() - 30000)

      const setIntervalCall = jest.spyOn(global, 'setInterval')
      const periodicCheck = setIntervalCall.mock.calls[0][0]

      await periodicCheck()

      expect(mockRouteCacheService.refreshCache).not.toHaveBeenCalled()
    })

    it('Sequelize不可用时不应该抛出错误', async () => {
      mockSequelize.query = undefined

      const setIntervalCall = jest.spyOn(global, 'setInterval')
      const periodicCheck = setIntervalCall.mock.calls[0][0]

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      await periodicCheck()

      expect(consoleSpy).toHaveBeenCalledWith('⚠️ Sequelize未正确初始化，跳过权限表检查')

      consoleSpy.mockRestore()
    })
  })

  describe('变更事件管理', () => {
    it('应该记录变更事件', () => {
      const event: ChangeEvent = {
        type: 'create',
        model: 'Test',
        instanceId: 1,
        timestamp: Date.now(),
        details: { test: 'data' }
      }

      ;(PermissionWatcherService as any).recordChangeEvent(event)

      const events = PermissionWatcherService.getChangeEvents()
      expect(events).toContainEqual(event)
    })

    it('应该限制事件列表大小', () => {
      const maxEvents = (PermissionWatcherService as any).MAX_EVENTS

      // Add more events than the limit
      for (let i = 0; i < maxEvents + 10; i++) {
        ;(PermissionWatcherService as any).recordChangeEvent({
          type: 'create',
          model: 'Test',
          instanceId: i,
          timestamp: Date.now() + i
        })
      }

      const events = PermissionWatcherService.getChangeEvents()
      expect(events).toHaveLength(maxEvents)
      expect(events[0].instanceId).toBe(10) // Should start from the 10th event
    })

    it('应该按限制数量返回事件', () => {
      // Add multiple events
      for (let i = 0; i < 5; i++) {
        ;(PermissionWatcherService as any).recordChangeEvent({
          type: 'create',
          model: 'Test',
          instanceId: i,
          timestamp: Date.now() + i
        })
      }

      const events = PermissionWatcherService.getChangeEvents(3)
      expect(events).toHaveLength(3)
      expect(events[0].instanceId).toBe(4) // Should return the most recent 3
    })

    it('应该清空变更事件记录', () => {
      // Add some events
      for (let i = 0; i < 3; i++) {
        ;(PermissionWatcherService as any).recordChangeEvent({
          type: 'create',
          model: 'Test',
          instanceId: i,
          timestamp: Date.now() + i
        })
      }

      expect(PermissionWatcherService.getChangeEvents()).toHaveLength(3)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      PermissionWatcherService.clearChangeEvents()

      expect(PermissionWatcherService.getChangeEvents()).toHaveLength(0)
      expect(consoleSpy).toHaveBeenCalledWith('🗑️ 已清空权限变更事件记录')

      consoleSpy.mockRestore()
    })
  })

  describe('状态查询功能', () => {
    it('应该返回正确的监听状态', () => {
      (PermissionWatcherService as any).isWatching = true
      ;(PermissionWatcherService as any).changeEvents = [
        {
          type: 'create',
          model: 'Test',
          instanceId: 1,
          timestamp: Date.now(),
          details: {}
        }
      ]
      ;(PermissionWatcherService as any).refreshTimeout = setTimeout(() => {}, 1000)

      const status = PermissionWatcherService.getWatcherStatus()

      expect(status).toEqual({
        isWatching: true,
        eventCount: 1,
        lastEventTime: expect.any(Number),
        refreshScheduled: true
      })
    })

    it('应该处理无事件的情况', () => {
      (PermissionWatcherService as any).isWatching = false
      ;(PermissionWatcherService as any).changeEvents = []
      ;(PermissionWatcherService as any).refreshTimeout = null

      const status = PermissionWatcherService.getWatcherStatus()

      expect(status).toEqual({
        isWatching: false,
        eventCount: 0,
        lastEventTime: null,
        refreshScheduled: false
      })
    })
  })

  describe('getPermissionLastModified', () => {
    it('应该返回权限表最后修改时间', async () => {
      const mockDate = new Date('2023-01-01T12:00:00Z')
      mockSequelize.query.mockResolvedValue([{ lastModified: mockDate.toISOString() }])

      const result = await (PermissionWatcherService as any).getPermissionLastModified()

      expect(result).toBe(mockDate.getTime())
      expect(mockSequelize.query).toHaveBeenCalledWith(`
        SELECT MAX(updated_at) as lastModified
        FROM permissions
        WHERE status = 1
      `)
    })

    it('查询失败时应该返回0', async () => {
      mockSequelize.query.mockRejectedValue(new Error('Query failed'))

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const result = await (PermissionWatcherService as any).getPermissionLastModified()

      expect(result).toBe(0)
      expect(consoleSpy).toHaveBeenCalledWith('⚠️ 获取权限表更新时间失败:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('没有结果时应该返回0', async () => {
      mockSequelize.query.mockResolvedValue([{ lastModified: null }])

      const result = await (PermissionWatcherService as any).getPermissionLastModified()

      expect(result).toBe(0)
    })

    it('Sequelize不可用时不应该抛出错误', async () => {
      mockSequelize.query = undefined

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const result = await (PermissionWatcherService as any).getPermissionLastModified()

      expect(result).toBe(0)
      expect(consoleSpy).toHaveBeenCalledWith('⚠️ Sequelize未正确初始化，跳过权限表检查')

      consoleSpy.mockRestore()
    })
  })
})