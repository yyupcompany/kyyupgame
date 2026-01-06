import { vi } from 'vitest'
/**
 * Task Log Service Test
 * 任务日志服务测试
 * 
 * 测试覆盖范围：
 * - 任务操作日志记录
 * - 任务日志获取
 * - 用户操作日志获取
 * - 操作统计获取
 * - 旧日志清理
 * - 最近操作日志获取
 * - 任务日志导出
 * - CSV格式转换
 * - 批量日志记录
 * - 分页功能
 * - 数据处理
 * - JSON序列化和反序列化
 * - 错误处理机制
 */

import { TaskLogService } from '../../../src/services/task-log.service'
import { DatabaseService } from '../../../src/services/database.service'

// Mock dependencies
jest.mock('../../../src/services/database.service')


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

describe('TaskLogService', () => {
  let taskLogService: TaskLogService
  let mockDatabaseService: jest.Mocked<DatabaseService>

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Setup mock implementations
    mockDatabaseService = DatabaseService as jest.Mocked<any>

    // Create service instance
    taskLogService = new TaskLogService()
  })

  describe('logAction', () => {
    it('应该成功记录任务操作日志', async () => {
      const taskId = 1
      const userId = 1
      const action = 'create'
      const oldValue = { title: 'Old Title' }
      const newValue = { title: 'New Title' }
      const description = '创建任务'
      const ipAddress = '192.168.1.1'
      const userAgent = 'Mozilla/5.0'

      await taskLogService.logAction(
        taskId,
        userId,
        action,
        oldValue,
        newValue,
        description,
        ipAddress,
        userAgent
      )

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO task_logs'),
        [
          taskId,
          userId,
          action,
          JSON.stringify(oldValue),
          JSON.stringify(newValue),
          description,
          ipAddress,
          userAgent
        ]
      )
    })

    it('应该使用默认值记录日志', async () => {
      const taskId = 1
      const userId = 1
      const action = 'update'

      await taskLogService.logAction(taskId, userId, action)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO task_logs'),
        [
          taskId,
          userId,
          action,
          null,
          null,
          undefined,
          undefined,
          undefined
        ]
      )
    })

    it('应该正确处理null值', async () => {
      const taskId = 1
      const userId = 1
      const action = 'delete'
      const oldValue = null
      const newValue = null

      await taskLogService.logAction(taskId, userId, action, oldValue, newValue)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO task_logs'),
        [
          taskId,
          userId,
          action,
          null,
          null,
          undefined,
          undefined,
          undefined
        ]
      )
    })
  })

  describe('getTaskLogs', () => {
    it('应该成功获取任务操作日志', async () => {
      const mockLogs = [
        {
          id: 1,
          task_id: 1,
          user_id: 1,
          action: 'create',
          old_value: '{"title": "Old"}',
          new_value: '{"title": "New"}',
          description: '创建任务',
          user_name: 'Test User',
          user_avatar: 'avatar.jpg'
        },
        {
          id: 2,
          task_id: 1,
          user_id: 2,
          action: 'update',
          old_value: null,
          new_value: '{"status": "completed"}',
          description: '更新任务',
          user_name: 'Update User',
          user_avatar: 'update.jpg'
        }
      ]

      const mockCountResult = { total: 2 }

      mockDatabaseService.query.mockResolvedValueOnce(mockLogs)
      mockDatabaseService.query.mockResolvedValueOnce([mockCountResult])

      const result = await taskLogService.getTaskLogs(1, { page: 1, limit: 10 })

      expect(result).toEqual({
        data: [
          {
            id: 1,
            task_id: 1,
            user_id: 1,
            action: 'create',
            old_value: { title: 'Old' },
            new_value: { title: 'New' },
            description: '创建任务',
            user_name: 'Test User',
            user_avatar: 'avatar.jpg'
          },
          {
            id: 2,
            task_id: 1,
            user_id: 2,
            action: 'update',
            old_value: null,
            new_value: { status: 'completed' },
            description: '更新任务',
            user_name: 'Update User',
            user_avatar: 'update.jpg'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      })

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT tl.*, u.name as user_name'),
        [1, 10, 0]
      )
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'SELECT COUNT(*) as total FROM task_logs WHERE task_id = ?',
        [1]
      )
    })

    it('应该使用默认分页参数', async () => {
      const mockLogs = []
      const mockCountResult = { total: 0 }

      mockDatabaseService.query.mockResolvedValueOnce(mockLogs)
      mockDatabaseService.query.mockResolvedValueOnce([mockCountResult])

      await taskLogService.getTaskLogs(1)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ? OFFSET ?'),
        [1, 50, 0]
      )
    })

    it('应该正确处理空值日志数据', async () => {
      const mockLogs = [
        {
          id: 1,
          task_id: 1,
          user_id: 1,
          action: 'create',
          old_value: null,
          new_value: null,
          user_name: 'Test User'
        }
      ]

      const mockCountResult = { total: 1 }

      mockDatabaseService.query.mockResolvedValueOnce(mockLogs)
      mockDatabaseService.query.mockResolvedValueOnce([mockCountResult])

      const result = await taskLogService.getTaskLogs(1)

      expect(result.data[0].old_value).toBeNull()
      expect(result.data[0].new_value).toBeNull()
    })
  })

  describe('getUserLogs', () => {
    it('应该成功获取用户操作日志', async () => {
      const mockLogs = [
        {
          id: 1,
          task_id: 1,
          user_id: 1,
          action: 'create',
          old_value: '{"title": "Task 1"}',
          new_value: null,
          task_title: 'Task 1',
          user_name: 'Test User'
        }
      ]

      const mockCountResult = { total: 1 }

      mockDatabaseService.query.mockResolvedValueOnce(mockLogs)
      mockDatabaseService.query.mockResolvedValueOnce([mockCountResult])

      const result = await taskLogService.getUserLogs(1, { page: 1, limit: 10 })

      expect(result).toEqual({
        data: [
          {
            id: 1,
            task_id: 1,
            user_id: 1,
            action: 'create',
            old_value: { title: 'Task 1' },
            new_value: null,
            task_title: 'Task 1',
            user_name: 'Test User'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      })

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT tl.*, t.title as task_title'),
        [1, 10, 0]
      )
    })
  })

  describe('getActionStats', () => {
    it('应该成功获取操作统计', async () => {
      const mockStats = [
        { action: 'create', count: 5, date: '2023-12-01' },
        { action: 'update', count: 3, date: '2023-12-01' },
        { action: 'create', count: 2, date: '2023-12-02' }
      ]

      mockDatabaseService.query.mockResolvedValue(mockStats)

      const result = await taskLogService.getActionStats(1, 1, 30)

      expect(result).toEqual(mockStats)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT action, COUNT(*) as count'),
        [1, 1, 30]
      )
    })

    it('应该处理无过滤条件的统计', async () => {
      const mockStats = []

      mockDatabaseService.query.mockResolvedValue(mockStats)

      const result = await taskLogService.getActionStats()

      expect(result).toEqual(mockStats)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1'),
        []
      )
    })

    it('应该只按任务ID过滤', async () => {
      const mockStats = []

      mockDatabaseService.query.mockResolvedValue(mockStats)

      await taskLogService.getActionStats(1)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1 AND task_id = ?'),
        [1]
      )
    })

    it('应该只按用户ID过滤', async () => {
      const mockStats = []

      mockDatabaseService.query.mockResolvedValue(mockStats)

      await taskLogService.getActionStats(undefined, 1)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1 AND user_id = ?'),
        [1]
      )
    })

    it('应该只按日期范围过滤', async () => {
      const mockStats = []

      mockDatabaseService.query.mockResolvedValue(mockStats)

      await taskLogService.getActionStats(undefined, undefined, 30)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1 AND created_at >= DATE_SUB'),
        [30]
      )
    })
  })

  describe('cleanupOldLogs', () => {
    it('应该成功清理旧日志', async () => {
      const mockResult = { affectedRows: 100 }

      mockDatabaseService.query.mockResolvedValue(mockResult)

      const result = await taskLogService.cleanupOldLogs(90)

      expect(result).toBe(100)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM task_logs'),
        [90]
      )
    })

    it('应该使用默认天数清理日志', async () => {
      const mockResult = { affectedRows: 50 }

      mockDatabaseService.query.mockResolvedValue(mockResult)

      const result = await taskLogService.cleanupOldLogs()

      expect(result).toBe(50)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM task_logs'),
        [90]
      )
    })
  })

  describe('getRecentLogs', () => {
    it('应该成功获取最近的操作日志', async () => {
      const mockLogs = [
        {
          id: 1,
          task_id: 1,
          user_id: 1,
          action: 'create',
          old_value: '{"title": "Recent Task"}',
          new_value: null,
          task_title: 'Recent Task',
          user_name: 'Recent User',
          user_avatar: 'recent.jpg'
        }
      ]

      mockDatabaseService.query.mockResolvedValue(mockLogs)

      const result = await taskLogService.getRecentLogs(10)

      expect(result).toEqual([
        {
          id: 1,
          task_id: 1,
          user_id: 1,
          action: 'create',
          old_value: { title: 'Recent Task' },
          new_value: null,
          task_title: 'Recent Task',
          user_name: 'Recent User',
          user_avatar: 'recent.jpg'
        }
      ])

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY tl.created_at DESC'),
        [10]
      )
    })

    it('应该使用默认限制数量', async () => {
      mockDatabaseService.query.mockResolvedValue([])

      await taskLogService.getRecentLogs()

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ?'),
        [20]
      )
    })
  })

  describe('exportTaskLogs', () => {
    it('应该成功导出JSON格式的任务日志', async () => {
      const mockLogs = [
        {
          id: 1,
          task_id: 1,
          user_id: 1,
          action: 'create',
          old_value: '{"title": "Export Task"}',
          new_value: null,
          user_name: 'Export User'
        }
      ]

      mockDatabaseService.query.mockResolvedValue(mockLogs)

      const result = await taskLogService.exportTaskLogs(1, 'json')

      expect(result).toEqual([
        {
          id: 1,
          task_id: 1,
          user_id: 1,
          action: 'create',
          old_value: { title: 'Export Task' },
          new_value: null,
          user_name: 'Export User'
        }
      ])

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY tl.created_at ASC'),
        [1]
      )
    })

    it('应该成功导出CSV格式的任务日志', async () => {
      const mockLogs = [
        {
          id: 1,
          task_id: 1,
          user_id: 1,
          action: 'create',
          old_value: '{"title": "CSV Task"}',
          new_value: null,
          user_name: 'CSV User',
          created_at: '2023-12-01T10:00:00Z',
          description: '创建任务',
          ip_address: '192.168.1.1'
        }
      ]

      mockDatabaseService.query.mockResolvedValue(mockLogs)

      const result = await taskLogService.exportTaskLogs(1, 'csv')

      expect(result).toContain('时间,用户,操作,描述,IP地址')
      expect(result).toContain('"2023-12-01T10:00:00Z","CSV User","create","创建任务","192.168.1.1"')
    })

    it('应该处理空日志的CSV导出', async () => {
      mockDatabaseService.query.mockResolvedValue([])

      const result = await taskLogService.exportTaskLogs(1, 'csv')

      expect(result).toBe('')
    })

    it('应该使用默认格式导出', async () => {
      const mockLogs = []
      mockDatabaseService.query.mockResolvedValue(mockLogs)

      await taskLogService.exportTaskLogs(1)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY tl.created_at ASC'),
        [1]
      )
    })
  })

  describe('logBatchActions', () => {
    it('应该成功批量记录日志', async () => {
      const logs = [
        {
          task_id: 1,
          user_id: 1,
          action: 'create',
          old_value: { title: 'Batch 1' },
          new_value: null,
          description: '批量创建1'
        },
        {
          task_id: 2,
          user_id: 2,
          action: 'update',
          old_value: null,
          new_value: { status: 'completed' },
          description: '批量更新1'
        }
      ]

      await taskLogService.logBatchActions(logs)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO task_logs VALUES ?'),
        [[
          1, 1, 'create', '{"title":"Batch 1"}', null, '批量创建1', undefined, undefined
        ], [
          2, 2, 'update', null, '{"status":"completed"}', '批量更新1', undefined, undefined
        ]]
      )
    })

    it('空日志数组时不应该执行查询', async () => {
      await taskLogService.logBatchActions([])

      expect(mockDatabaseService.query).not.toHaveBeenCalled()
    })

    it('应该正确处理null值', async () => {
      const logs = [
        {
          task_id: 1,
          user_id: 1,
          action: 'delete',
          old_value: null,
          new_value: null
        }
      ]

      await taskLogService.logBatchActions(logs)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO task_logs VALUES ?'),
        [[1, 1, 'delete', null, null, undefined, undefined, undefined]]
      )
    })
  })
})