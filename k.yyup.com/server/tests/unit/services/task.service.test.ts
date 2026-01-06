import { vi } from 'vitest'
/**
 * Task Service Test
 * 任务服务测试
 * 
 * 测试覆盖范围：
 * - 任务列表获取
 * - 任务详情查询
 * - 任务创建功能
 * - 任务更新功能
 * - 任务删除功能
 * - 任务状态更新
 * - 任务进度更新
 * - 模板任务创建
 * - 子任务创建
 * - 任务统计功能
 * - 数据映射和转换
 * - 查询条件构建
 * - 分页功能
 * - 排序功能
 * - 错误处理机制
 */

import { TaskService } from '../../../src/services/task.service'
import { DatabaseService } from '../../../src/services/database.service'
import { TaskLogService } from '../../../src/services/task-log.service'
import { Todo, TodoStatus, TodoPriority } from '../../../src/models/todo.model'
import { User } from '../../../src/models/user.model'

// Mock dependencies
jest.mock('../../../src/services/database.service')
jest.mock('../../../src/services/task-log.service')
jest.mock('../../../src/models/todo.model')
jest.mock('../../../src/models/user.model')


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

describe('TaskService', () => {
  let taskService: TaskService
  let mockDatabaseService: jest.Mocked<DatabaseService>
  let mockTaskLogService: jest.Mocked<TaskLogService>
  let mockTodo: jest.Mocked<typeof Todo>
  let mockUser: jest.Mocked<typeof User>

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Setup mock implementations
    mockDatabaseService = DatabaseService as jest.Mocked<any>
    mockTaskLogService = TaskLogService as jest.Mocked<any>
    mockTodo = Todo as jest.Mocked<typeof Todo>
    mockUser = User as jest.Mocked<typeof User>

    // Create service instance
    taskService = new TaskService()
  })

  describe('getTasks', () => {
    it('应该成功获取任务列表', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          priority: TodoPriority.MEDIUM,
          status: TodoStatus.PENDING,
          user: { id: 1, username: 'creator', email: 'creator@test.com' },
          assignee: { id: 2, username: 'assignee', email: 'assignee@test.com' }
        }
      ]

      mockTodo.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockTasks as any
      })

      const options = {
        page: 1,
        limit: 10,
        filters: { status: 'pending', priority: 'medium' },
        sortBy: 'createdAt',
        sortOrder: 'DESC' as const
      }

      const result = await taskService.getTasks(options)

      expect(result).toEqual({
        data: mockTasks,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      })

      expect(mockTodo.findAndCountAll).toHaveBeenCalledWith({
        where: {
          status: 'pending',
          priority: TodoPriority.MEDIUM
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          },
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'username', 'email'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0,
        distinct: true
      })
    })

    it('应该正确处理关键词搜索', async () => {
      mockTodo.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      })

      const options = {
        page: 1,
        limit: 10,
        filters: { keyword: 'test' },
        sortBy: 'title',
        sortOrder: 'ASC' as const
      }

      await taskService.getTasks(options)

      expect(mockTodo.findAndCountAll).toHaveBeenCalledWith({
        where: {
          [expect.any(String)]: [
            { title: { [expect.any(String)]: '%test%' } },
            { description: { [expect.any(String)]: '%test%' } }
          ]
        },
        include: expect.any(Array),
        order: [['title', 'ASC']],
        limit: 10,
        offset: 0,
        distinct: true
      })
    })

    it('应该正确处理分页', async () => {
      mockTodo.findAndCountAll.mockResolvedValue({
        count: 25,
        rows: []
      })

      const options = {
        page: 2,
        limit: 10,
        filters: {},
        sortBy: 'id',
        sortOrder: 'ASC' as const
      }

      const result = await taskService.getTasks(options)

      expect(result.pagination.totalPages).toBe(3)
      expect(mockTodo.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Array),
        order: [['id', 'ASC']],
        limit: 10,
        offset: 10,
        distinct: true
      })
    })

    it('应该验证排序字段', async () => {
      mockTodo.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      })

      const options = {
        page: 1,
        limit: 10,
        filters: {},
        sortBy: 'invalid_field',
        sortOrder: 'DESC' as const
      }

      await taskService.getTasks(options)

      expect(mockTodo.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Array),
        order: [['createdAt', 'DESC']], // Should fall back to default
        limit: 10,
        offset: 0,
        distinct: true
      })
    })

    it('应该正确映射优先级', async () => {
      mockTodo.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      })

      const options = {
        page: 1,
        limit: 10,
        filters: { priority: 'urgent' },
        sortBy: 'id',
        sortOrder: 'ASC' as const
      }

      await taskService.getTasks(options)

      expect(mockTodo.findAndCountAll).toHaveBeenCalledWith({
        where: {
          priority: TodoPriority.HIGHEST
        },
        include: expect.any(Array),
        order: [['id', 'ASC']],
        limit: 10,
        offset: 0,
        distinct: true
      })
    })
  })

  describe('getTaskById', () => {
    it('应该成功获取任务详情', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        user: { id: 1, username: 'creator', email: 'creator@test.com' },
        assignee: { id: 2, username: 'assignee', email: 'assignee@test.com' }
      }

      mockTodo.findByPk.mockResolvedValue(mockTask as any)

      const result = await taskService.getTaskById(1)

      expect(result).toEqual(mockTask)
      expect(mockTodo.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          },
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'username', 'email'],
            required: false
          }
        ]
      })
    })

    it('任务不存在时应该返回null', async () => {
      mockTodo.findByPk.mockResolvedValue(null)

      const result = await taskService.getTaskById(999)

      expect(result).toBeNull()
    })
  })

  describe('createTask', () => {
    it('应该成功创建任务', async () => {
      const mockTask = {
        id: 1,
        title: 'New Task',
        description: 'Task Description',
        priority: TodoPriority.MEDIUM,
        status: TodoStatus.PENDING,
        userId: 1,
        assignedTo: 2,
        dueDate: new Date('2023-12-31'),
        relatedType: 'enrollment',
        relatedId: 123,
        tags: ['tag1', 'tag2']
      }

      mockTodo.create.mockResolvedValue(mockTask as any)
      mockTodo.findByPk.mockResolvedValue(mockTask as any)
      mockTodo.cleanUndefinedValues = jest.fn().mockReturnValue(mockTask)

      const taskData = {
        title: 'New Task',
        description: 'Task Description',
        priority: 'medium' as const,
        status: 'pending' as const,
        creator_id: 1,
        assignee_id: 2,
        due_date: new Date('2023-12-31'),
        related_type: 'enrollment',
        related_id: 123,
        tags: ['tag1', 'tag2']
      }

      const result = await taskService.createTask(taskData)

      expect(result).toEqual(mockTask)
      expect(mockTodo.create).toHaveBeenCalledWith(mockTask)
      expect(mockTaskLogService.logAction).toHaveBeenCalledWith(
        1,
        1,
        'create',
        null,
        taskData,
        '创建任务'
      )
    })

    it('应该使用默认值创建任务', async () => {
      const mockTask = {
        id: 1,
        title: 'Default Task',
        description: null,
        priority: TodoPriority.MEDIUM,
        status: TodoStatus.PENDING,
        userId: 1,
        assignedTo: null,
        dueDate: null,
        relatedType: null,
        relatedId: null,
        tags: null,
        notify: false
      }

      mockTodo.create.mockResolvedValue(mockTask as any)
      mockTodo.findByPk.mockResolvedValue(mockTask as any)
      mockTodo.cleanUndefinedValues = jest.fn().mockReturnValue(mockTask)

      const taskData = {
        title: 'Default Task'
      }

      await taskService.createTask(taskData)

      expect(mockTodo.create).toHaveBeenCalledWith(mockTask)
    })

    it('应该正确映射优先级和状态', async () => {
      const mockTask = {
        id: 1,
        title: 'Urgent Task',
        priority: TodoPriority.HIGHEST,
        status: TodoStatus.IN_PROGRESS
      }

      mockTodo.create.mockResolvedValue(mockTask as any)
      mockTodo.findByPk.mockResolvedValue(mockTask as any)
      mockTodo.cleanUndefinedValues = jest.fn().mockReturnValue(mockTask)

      const taskData = {
        title: 'Urgent Task',
        priority: 'urgent' as const,
        status: 'in_progress' as const,
        creator_id: 1
      }

      await taskService.createTask(taskData)

      expect(mockTodo.create).toHaveBeenCalledWith(mockTask)
    })

    it('创建任务失败时应该抛出错误', async () => {
      mockTodo.create.mockRejectedValue(new Error('Database error'))
      mockTodo.cleanUndefinedValues = jest.fn().mockReturnValue({})

      const taskData = {
        title: 'Test Task',
        creator_id: 1
      }

      await expect(taskService.createTask(taskData)).rejects.toThrow('Database error')
    })
  })

  describe('updateTask', () => {
    it('应该成功更新任务', async () => {
      const originalTask = {
        id: 1,
        title: 'Original Title',
        description: 'Original Description',
        priority: TodoPriority.MEDIUM,
        status: TodoStatus.PENDING,
        update: jest.fn().mockResolvedValue(undefined)
      }

      const updatedTask = {
        id: 1,
        title: 'Updated Title',
        description: 'Updated Description',
        priority: TodoPriority.HIGH,
        status: TodoStatus.IN_PROGRESS
      }

      mockTodo.findByPk.mockResolvedValue(originalTask as any)
      mockTodo.findByPk.mockResolvedValueOnce(updatedTask as any)

      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        priority: 'high' as const,
        status: 'in_progress' as const
      }

      const result = await taskService.updateTask(1, updateData, 1)

      expect(originalTask.update).toHaveBeenCalledWith({
        title: 'Updated Title',
        description: 'Updated Description',
        priority: TodoPriority.HIGH,
        status: TodoStatus.IN_PROGRESS
      })

      expect(mockTaskLogService.logAction).toHaveBeenCalledWith(
        1,
        1,
        'update',
        originalTask,
        updateData,
        '更新任务'
      )
    })

    it('任务不存在时应该抛出错误', async () => {
      mockTodo.findByPk.mockResolvedValue(null)

      await expect(taskService.updateTask(999, {}, 1)).rejects.toThrow('任务不存在')
    })

    it('状态改为完成时应该设置完成时间', async () => {
      const originalTask = {
        id: 1,
        title: 'Task',
        status: TodoStatus.PENDING,
        update: jest.fn().mockResolvedValue(undefined)
      }

      mockTodo.findByPk.mockResolvedValue(originalTask as any)
      mockTodo.findByPk.mockResolvedValueOnce(originalTask as any)

      const updateData = {
        status: 'completed' as const
      }

      await taskService.updateTask(1, updateData, 1)

      expect(originalTask.update).toHaveBeenCalledWith({
        status: TodoStatus.COMPLETED,
        completedDate: expect.any(Date)
      })
    })

    it('应该正确处理可选字段的null值', async () => {
      const originalTask = {
        id: 1,
        title: 'Task',
        assignedTo: 2,
        dueDate: new Date(),
        relatedType: 'enrollment',
        relatedId: 123,
        tags: ['tag1'],
        update: jest.fn().mockResolvedValue(undefined)
      }

      mockTodo.findByPk.mockResolvedValue(originalTask as any)
      mockTodo.findByPk.mockResolvedValueOnce(originalTask as any)

      const updateData = {
        assignee_id: null,
        due_date: null,
        related_type: null,
        related_id: null,
        tags: null
      }

      await taskService.updateTask(1, updateData, 1)

      expect(originalTask.update).toHaveBeenCalledWith({
        assignedTo: null,
        dueDate: null,
        relatedType: null,
        relatedId: null,
        tags: null
      })
    })
  })

  describe('deleteTask', () => {
    it('应该成功删除任务', async () => {
      const mockTask = {
        id: 1,
        title: 'Task to Delete',
        destroy: jest.fn().mockResolvedValue(undefined)
      }

      mockTodo.findByPk.mockResolvedValue(mockTask as any)

      await taskService.deleteTask(1, 1)

      expect(mockTask.destroy).toHaveBeenCalled()
      expect(mockTaskLogService.logAction).toHaveBeenCalledWith(
        1,
        1,
        'delete',
        mockTask,
        null,
        '删除任务'
      )
    })

    it('任务不存在时应该抛出错误', async () => {
      mockTodo.findByPk.mockResolvedValue(null)

      await expect(taskService.deleteTask(999, 1)).rejects.toThrow('任务不存在')
    })
  })

  describe('updateTaskStatus', () => {
    it('应该成功更新任务状态', async () => {
      const mockTask = {
        id: 1,
        title: 'Task',
        status: TodoStatus.PENDING
      }

      mockTodo.findByPk.mockResolvedValue(mockTask as any)
      mockTodo.findByPk.mockResolvedValueOnce(mockTask as any)

      jest.spyOn(taskService, 'updateTask').mockResolvedValue(mockTask as any)

      const result = await taskService.updateTaskStatus(1, 'completed', 1)

      expect(taskService.updateTask).toHaveBeenCalledWith(1, {
        status: 'completed',
        completed_at: expect.any(Date)
      }, 1)
    })
  })

  describe('updateTaskProgress', () => {
    it('进度100%时应该自动设置为完成状态', async () => {
      const mockTask = {
        id: 1,
        title: 'Task',
        status: TodoStatus.PENDING
      }

      mockTodo.findByPk.mockResolvedValue(mockTask as any)
      mockTodo.findByPk.mockResolvedValueOnce(mockTask as any)

      jest.spyOn(taskService, 'updateTask').mockResolvedValue(mockTask as any)

      await taskService.updateTaskProgress(1, 100, 1)

      expect(taskService.updateTask).toHaveBeenCalledWith(1, {
        status: 'completed',
        completed_at: expect.any(Date)
      }, 1)
    })

    it('进度未达到100%时不应该改变状态', async () => {
      const mockTask = {
        id: 1,
        title: 'Task',
        status: TodoStatus.PENDING
      }

      mockTodo.findByPk.mockResolvedValue(mockTask as any)
      mockTodo.findByPk.mockResolvedValueOnce(mockTask as any)

      jest.spyOn(taskService, 'updateTask').mockResolvedValue(mockTask as any)

      await taskService.updateTaskProgress(1, 50, 1)

      expect(taskService.updateTask).toHaveBeenCalledWith(1, {}, 1)
    })
  })

  describe('createTaskFromTemplate', () => {
    it('应该成功从模板创建任务', async () => {
      const mockTemplate = {
        id: 1,
        name: 'Template Task',
        description: 'Template Description',
        type: 'enrollment',
        default_priority: 'high',
        default_estimated_hours: 8,
        template_content: JSON.stringify({
          requirements: ['Req 1', 'Req 2'],
          acceptance_criteria: ['Crit 1', 'Crit 2'],
          subtasks: [
            { title: 'Subtask 1', description: 'Description 1' },
            { title: 'Subtask 2', description: 'Description 2' }
          ]
        })
      }

      const mockTask = {
        id: 1,
        title: 'Custom Title',
        description: 'Template Description'
      }

      mockDatabaseService.query.mockResolvedValue([mockTemplate])
      mockTodo.create.mockResolvedValue(mockTask as any)
      mockTodo.findByPk.mockResolvedValue(mockTask as any)
      mockTodo.cleanUndefinedValues = jest.fn().mockReturnValue(mockTask)

      jest.spyOn(taskService as any, 'createSubtask').mockResolvedValue({})

      const customData = {
        title: 'Custom Title',
        assignee_id: 2,
        due_date: new Date('2023-12-31')
      }

      const result = await taskService.createTaskFromTemplate(1, customData, 1)

      expect(result).toEqual(mockTask)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'SELECT * FROM task_templates WHERE id = ? AND is_active = 1',
        [1]
      )
      expect((taskService as any).createSubtask).toHaveBeenCalledTimes(2)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'UPDATE task_templates SET usage_count = usage_count + 1 WHERE id = ?',
        [1]
      )
    })

    it('模板不存在时应该抛出错误', async () => {
      mockDatabaseService.query.mockResolvedValue([])

      await expect(taskService.createTaskFromTemplate(999, {}, 1))
        .rejects.toThrow('模板不存在或已禁用')
    })
  })

  describe('createSubtask', () => {
    it('应该成功创建子任务', async () => {
      const mockResult = { insertId: 1 }

      mockDatabaseService.query.mockResolvedValue(mockResult)

      const subtaskData = {
        title: 'Subtask',
        description: 'Subtask Description',
        assignee_id: 1,
        due_date: new Date('2023-12-31'),
        sort_order: 0
      }

      const result = await (taskService as any).createSubtask(1, subtaskData)

      expect(result).toEqual({
        id: 1,
        ...subtaskData
      })

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO task_subtasks'),
        [1, 'Subtask', 'Subtask Description', 1, expect.any(Date), 0]
      )
    })
  })

  describe('getTaskStats', () => {
    it('应该成功获取任务统计数据', async () => {
      const mockBasicStats = {
        total_tasks: 10,
        pending_tasks: 3,
        in_progress_tasks: 2,
        completed_tasks: 4,
        cancelled_tasks: 1,
        avg_progress: 65.5,
        overdue_tasks: 1
      }

      const mockGroupStats = [
        { status: 'pending', count: 3, avg_progress: 0 },
        { status: 'in_progress', count: 2, avg_progress: 50 },
        { status: 'completed', count: 4, avg_progress: 100 },
        { status: 'cancelled', count: 1, avg_progress: 0 }
      ]

      mockDatabaseService.query.mockResolvedValueOnce([mockBasicStats])
      mockDatabaseService.query.mockResolvedValueOnce(mockGroupStats)

      const options = {
        userId: 1,
        dateRange: 30,
        groupBy: 'status'
      }

      const result = await taskService.getTaskStats(options)

      expect(result).toEqual({
        basic: mockBasicStats,
        groups: mockGroupStats
      })

      expect(mockDatabaseService.query).toHaveBeenCalledTimes(2)
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as total_tasks'),
        [1, 1, 30]
      )
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT status, COUNT(*) as count'),
        [1, 1, 30]
      )
    })

    it('应该处理无过滤条件的统计', async () => {
      const mockBasicStats = { total_tasks: 5 }
      const mockGroupStats = []

      mockDatabaseService.query.mockResolvedValueOnce([mockBasicStats])
      mockDatabaseService.query.mockResolvedValueOnce(mockGroupStats)

      const options = {
        userId: undefined,
        dateRange: 0,
        groupBy: 'priority'
      }

      await taskService.getTaskStats(options)

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1'),
        []
      )
    })
  })
})