import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockTask = {
  create: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  bulkCreate: jest.fn()
};

const mockTaskTemplate = {
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const mockTaskComment = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const mockTaskLog = {
  create: jest.fn(),
  findAll: jest.fn()
};

const mockUser = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockKindergarten = {
  findByPk: jest.fn()
};

// Mock services
const mockNotificationService = {
  sendNotification: jest.fn(),
  createNotification: jest.fn()
};

const mockEmailService = {
  sendEmail: jest.fn(),
  sendTaskReminder: jest.fn()
};

const mockCalendarService = {
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Mock cron scheduler
const mockCron = {
  schedule: jest.fn(),
  destroy: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/task.model', () => ({
  default: mockTask
}));

jest.unstable_mockModule('../../../../../src/models/task-template.model', () => ({
  default: mockTaskTemplate
}));

jest.unstable_mockModule('../../../../../src/models/task-comment.model', () => ({
  default: mockTaskComment
}));

jest.unstable_mockModule('../../../../../src/models/task-log.model', () => ({
  default: mockTaskLog
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  default: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/kindergarten.model', () => ({
  default: mockKindergarten
}));

jest.unstable_mockModule('../../../../../src/services/notification/notification.service', () => ({
  default: mockNotificationService
}));

jest.unstable_mockModule('../../../../../src/services/email/email.service', () => ({
  default: mockEmailService
}));

jest.unstable_mockModule('../../../../../src/services/calendar/calendar.service', () => ({
  default: mockCalendarService
}));

jest.unstable_mockModule('../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('node-cron', () => ({
  default: mockCron
}));


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

describe('Task Service', () => {
  let taskService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/task.service');
    taskService = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockTask.create.mockResolvedValue({
      id: 1,
      title: '测试任务',
      status: 'pending',
      createdAt: new Date()
    });
  });

  describe('createTask', () => {
    it('应该创建新任务', async () => {
      const taskData = {
        title: '准备家长会材料',
        description: '整理本学期学生表现报告',
        assigneeId: 1,
        creatorId: 2,
        kindergartenId: 1,
        priority: 'high',
        dueDate: new Date('2024-04-01T10:00:00Z'),
        category: 'administrative',
        tags: ['家长会', '报告']
      };

      const mockCreatedTask = {
        id: 1,
        ...taskData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockTask.create.mockResolvedValue(mockCreatedTask);
      mockUser.findByPk.mockResolvedValue({ id: 1, name: '张老师' });

      const result = await taskService.createTask(taskData);

      expect(mockTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '准备家长会材料',
          assigneeId: 1,
          priority: 'high',
          status: 'pending'
        })
      );
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        userId: 1,
        type: 'task_assigned',
        title: '新任务分配',
        message: expect.stringContaining('准备家长会材料')
      });
      expect(result).toEqual(mockCreatedTask);
    });

    it('应该处理重复任务创建', async () => {
      const taskData = {
        title: '每日晨检',
        assigneeId: 1,
        creatorId: 2,
        recurrence: {
          type: 'daily',
          interval: 1,
          endDate: new Date('2024-12-31')
        }
      };

      const result = await taskService.createTask(taskData);

      expect(mockTask.bulkCreate).toHaveBeenCalled();
      expect(result.recurring).toBe(true);
      expect(result.tasksCreated).toBeGreaterThan(1);
    });

    it('应该验证任务数据', async () => {
      const invalidTaskData = {
        title: '', // 空标题
        assigneeId: 999, // 不存在的用户
        dueDate: new Date('2020-01-01') // 过期日期
      };

      mockUser.findByPk.mockResolvedValue(null);

      await expect(taskService.createTask(invalidTaskData))
        .rejects.toThrow('任务数据验证失败');
    });

    it('应该处理模板任务创建', async () => {
      const templateId = 1;
      const taskData = {
        templateId: templateId,
        assigneeId: 1,
        dueDate: new Date('2024-04-01')
      };

      const mockTemplate = {
        id: 1,
        title: '模板任务',
        description: '模板描述',
        category: 'template',
        estimatedHours: 2
      };

      mockTaskTemplate.findByPk.mockResolvedValue(mockTemplate);

      const result = await taskService.createTask(taskData);

      expect(mockTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '模板任务',
          description: '模板描述',
          templateId: templateId
        })
      );
    });

    it('应该创建子任务', async () => {
      const taskData = {
        title: '子任务',
        parentTaskId: 1,
        assigneeId: 1,
        creatorId: 2
      };

      const mockParentTask = {
        id: 1,
        title: '父任务',
        status: 'in_progress'
      };

      mockTask.findByPk.mockResolvedValue(mockParentTask);

      const result = await taskService.createTask(taskData);

      expect(mockTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parentTaskId: 1,
          level: 1 // 子任务级别
        })
      );
    });
  });

  describe('updateTask', () => {
    it('应该更新任务信息', async () => {
      const taskId = 1;
      const updateData = {
        title: '更新后的任务标题',
        status: 'in_progress',
        progress: 50,
        notes: '任务进展顺利'
      };

      const mockExistingTask = {
        id: 1,
        title: '原任务标题',
        status: 'pending',
        assigneeId: 1,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockTask.findByPk.mockResolvedValue(mockExistingTask);

      const result = await taskService.updateTask(taskId, updateData);

      expect(mockExistingTask.update).toHaveBeenCalledWith(updateData);
      expect(mockTaskLog.create).toHaveBeenCalledWith({
        taskId: taskId,
        action: 'updated',
        changes: expect.objectContaining({
          title: { from: '原任务标题', to: '更新后的任务标题' },
          status: { from: 'pending', to: 'in_progress' }
        }),
        userId: expect.any(Number)
      });
      expect(result.updated).toBe(true);
    });

    it('应该处理任务状态变更', async () => {
      const taskId = 1;
      const updateData = {
        status: 'completed',
        completedAt: new Date()
      };

      const mockTask = {
        id: 1,
        status: 'in_progress',
        assigneeId: 1,
        parentTaskId: null,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockTask.findByPk.mockResolvedValue(mockTask);

      const result = await taskService.updateTask(taskId, updateData);

      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        userId: 1,
        type: 'task_completed',
        title: '任务完成',
        message: expect.stringContaining('任务已完成')
      });
    });

    it('应该处理任务重新分配', async () => {
      const taskId = 1;
      const updateData = {
        assigneeId: 2 // 新的负责人
      };

      const mockTask = {
        id: 1,
        assigneeId: 1, // 原负责人
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockTask.findByPk.mockResolvedValue(mockTask);
      mockUser.findByPk.mockResolvedValue({ id: 2, name: '李老师' });

      const result = await taskService.updateTask(taskId, updateData);

      expect(mockNotificationService.createNotification).toHaveBeenCalledTimes(2);
      // 通知原负责人
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        userId: 1,
        type: 'task_reassigned',
        message: expect.stringContaining('任务已重新分配')
      });
      // 通知新负责人
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        userId: 2,
        type: 'task_assigned',
        message: expect.stringContaining('新任务分配')
      });
    });

    it('应该处理任务不存在', async () => {
      const taskId = 999;
      const updateData = { title: '更新标题' };

      mockTask.findByPk.mockResolvedValue(null);

      await expect(taskService.updateTask(taskId, updateData))
        .rejects.toThrow('任务不存在');
    });

    it('应该处理权限验证', async () => {
      const taskId = 1;
      const updateData = { title: '更新标题' };
      const userId = 3; // 非任务相关人员

      const mockTask = {
        id: 1,
        assigneeId: 1,
        creatorId: 2
      };

      mockTask.findByPk.mockResolvedValue(mockTask);

      await expect(taskService.updateTask(taskId, updateData, userId))
        .rejects.toThrow('无权限修改此任务');
    });
  });

  describe('deleteTask', () => {
    it('应该删除任务', async () => {
      const taskId = 1;
      const userId = 2;

      const mockTask = {
        id: 1,
        title: '待删除任务',
        creatorId: 2,
        assigneeId: 1,
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockTask.findByPk.mockResolvedValue(mockTask);

      const result = await taskService.deleteTask(taskId, userId);

      expect(mockTask.destroy).toHaveBeenCalled();
      expect(mockTaskLog.create).toHaveBeenCalledWith({
        taskId: taskId,
        action: 'deleted',
        userId: userId
      });
      expect(result.deleted).toBe(true);
    });

    it('应该删除子任务', async () => {
      const taskId = 1;
      const userId = 2;

      const mockParentTask = {
        id: 1,
        creatorId: 2,
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      const mockSubTasks = [
        { id: 2, parentTaskId: 1, destroy: jest.fn().mockResolvedValue(undefined) },
        { id: 3, parentTaskId: 1, destroy: jest.fn().mockResolvedValue(undefined) }
      ];

      mockTask.findByPk.mockResolvedValue(mockParentTask);
      mockTask.findAll.mockResolvedValue(mockSubTasks);

      const result = await taskService.deleteTask(taskId, userId);

      expect(mockSubTasks[0].destroy).toHaveBeenCalled();
      expect(mockSubTasks[1].destroy).toHaveBeenCalled();
      expect(result.deletedSubTasks).toBe(2);
    });

    it('应该处理删除权限验证', async () => {
      const taskId = 1;
      const userId = 3; // 非创建者

      const mockTask = {
        id: 1,
        creatorId: 2 // 不同的创建者
      };

      mockTask.findByPk.mockResolvedValue(mockTask);

      await expect(taskService.deleteTask(taskId, userId))
        .rejects.toThrow('无权限删除此任务');
    });
  });

  describe('getTaskList', () => {
    it('应该获取任务列表', async () => {
      const queryOptions = {
        assigneeId: 1,
        status: 'pending',
        priority: 'high',
        page: 1,
        pageSize: 10,
        sortBy: 'dueDate',
        sortOrder: 'asc'
      };

      const mockTasks = {
        rows: [
          {
            id: 1,
            title: '任务1',
            status: 'pending',
            priority: 'high',
            dueDate: new Date('2024-04-01')
          },
          {
            id: 2,
            title: '任务2',
            status: 'pending',
            priority: 'high',
            dueDate: new Date('2024-04-02')
          }
        ],
        count: 2
      };

      mockTask.findAndCountAll.mockResolvedValue(mockTasks);

      const result = await taskService.getTaskList(queryOptions);

      expect(mockTask.findAndCountAll).toHaveBeenCalledWith({
        where: {
          assigneeId: 1,
          status: 'pending',
          priority: 'high'
        },
        limit: 10,
        offset: 0,
        order: [['dueDate', 'ASC']],
        include: expect.any(Array)
      });
      expect(result).toEqual({
        tasks: mockTasks.rows,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1
        }
      });
    });

    it('应该支持日期范围筛选', async () => {
      const queryOptions = {
        dueDateRange: {
          start: new Date('2024-04-01'),
          end: new Date('2024-04-30')
        }
      };

      await taskService.getTaskList(queryOptions);

      expect(mockTask.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dueDate: expect.objectContaining({
              [Symbol.for('gte')]: new Date('2024-04-01'),
              [Symbol.for('lte')]: new Date('2024-04-30')
            })
          })
        })
      );
    });

    it('应该支持关键词搜索', async () => {
      const queryOptions = {
        search: '家长会'
      };

      await taskService.getTaskList(queryOptions);

      expect(mockTask.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Symbol.for('or')]: [
              { title: expect.objectContaining({ [Symbol.for('like')]: '%家长会%' }) },
              { description: expect.objectContaining({ [Symbol.for('like')]: '%家长会%' }) }
            ]
          })
        })
      );
    });

    it('应该支持标签筛选', async () => {
      const queryOptions = {
        tags: ['紧急', '重要']
      };

      await taskService.getTaskList(queryOptions);

      expect(mockTask.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tags: expect.objectContaining({
              [Symbol.for('overlap')]: ['紧急', '重要']
            })
          })
        })
      );
    });
  });

  describe('getTaskStatistics', () => {
    it('应该获取任务统计信息', async () => {
      const userId = 1;
      const timeRange = {
        start: new Date('2024-03-01'),
        end: new Date('2024-03-31')
      };

      const mockStatistics = [
        { status: 'pending', count: 5 },
        { status: 'in_progress', count: 3 },
        { status: 'completed', count: 12 },
        { status: 'overdue', count: 2 }
      ];

      mockTask.findAll.mockResolvedValue(mockStatistics);

      const result = await taskService.getTaskStatistics(userId, timeRange);

      expect(result.total).toBe(22);
      expect(result.byStatus.pending).toBe(5);
      expect(result.byStatus.completed).toBe(12);
      expect(result.completionRate).toBe(54.55); // 12/22 * 100
      expect(result.overdueRate).toBe(9.09); // 2/22 * 100
    });

    it('应该计算优先级分布', async () => {
      const userId = 1;

      const mockPriorityStats = [
        { priority: 'low', count: 8 },
        { priority: 'medium', count: 10 },
        { priority: 'high', count: 4 }
      ];

      mockTask.findAll.mockResolvedValue(mockPriorityStats);

      const result = await taskService.getTaskStatistics(userId);

      expect(result.byPriority.low).toBe(8);
      expect(result.byPriority.medium).toBe(10);
      expect(result.byPriority.high).toBe(4);
    });

    it('应该计算平均完成时间', async () => {
      const userId = 1;

      const mockCompletedTasks = [
        {
          createdAt: new Date('2024-03-01T10:00:00Z'),
          completedAt: new Date('2024-03-02T10:00:00Z') // 1天
        },
        {
          createdAt: new Date('2024-03-05T10:00:00Z'),
          completedAt: new Date('2024-03-08T10:00:00Z') // 3天
        }
      ];

      mockTask.findAll.mockResolvedValue(mockCompletedTasks);

      const result = await taskService.getTaskStatistics(userId);

      expect(result.averageCompletionTime).toBe(2); // (1+3)/2 = 2天
    });
  });

  describe('addTaskComment', () => {
    it('应该添加任务评论', async () => {
      const taskId = 1;
      const commentData = {
        content: '任务进展更新：已完成50%',
        userId: 2,
        type: 'progress_update'
      };

      const mockTask = {
        id: 1,
        assigneeId: 1,
        creatorId: 2
      };

      const mockComment = {
        id: 1,
        taskId: taskId,
        ...commentData,
        createdAt: new Date()
      };

      mockTask.findByPk.mockResolvedValue(mockTask);
      mockTaskComment.create.mockResolvedValue(mockComment);

      const result = await taskService.addTaskComment(taskId, commentData);

      expect(mockTaskComment.create).toHaveBeenCalledWith({
        taskId: taskId,
        content: '任务进展更新：已完成50%',
        userId: 2,
        type: 'progress_update'
      });
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        userId: 1, // 通知任务负责人
        type: 'task_comment',
        message: expect.stringContaining('添加了评论')
      });
      expect(result).toEqual(mockComment);
    });

    it('应该处理@提及功能', async () => {
      const taskId = 1;
      const commentData = {
        content: '@张老师 请查看任务进展',
        userId: 2,
        mentions: [3] // 张老师的用户ID
      };

      mockTask.findByPk.mockResolvedValue({ id: 1 });
      mockTaskComment.create.mockResolvedValue({ id: 1 });

      await taskService.addTaskComment(taskId, commentData);

      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        userId: 3,
        type: 'task_mention',
        message: expect.stringContaining('在任务中提及了您')
      });
    });
  });

  describe('scheduleTaskReminder', () => {
    it('应该设置任务提醒', async () => {
      const taskId = 1;
      const reminderOptions = {
        type: 'due_date',
        advanceTime: 24 * 60 * 60 * 1000, // 提前24小时
        methods: ['email', 'notification']
      };

      const mockTask = {
        id: 1,
        title: '重要任务',
        dueDate: new Date('2024-04-01T10:00:00Z'),
        assigneeId: 1
      };

      mockTask.findByPk.mockResolvedValue(mockTask);

      const result = await taskService.scheduleTaskReminder(taskId, reminderOptions);

      const reminderTime = new Date(mockTask.dueDate.getTime() - reminderOptions.advanceTime);

      expect(mockCron.schedule).toHaveBeenCalledWith(
        expect.stringContaining('0 10 31 3 *'), // cron表达式
        expect.any(Function)
      );
      expect(result.scheduled).toBe(true);
      expect(result.reminderTime).toEqual(reminderTime);
    });

    it('应该处理重复提醒', async () => {
      const taskId = 1;
      const reminderOptions = {
        type: 'recurring',
        interval: 'daily',
        times: ['09:00', '17:00']
      };

      const result = await taskService.scheduleTaskReminder(taskId, reminderOptions);

      expect(mockCron.schedule).toHaveBeenCalledTimes(2); // 每天两次提醒
      expect(result.recurringReminders).toBe(2);
    });
  });

  describe('createTaskTemplate', () => {
    it('应该创建任务模板', async () => {
      const templateData = {
        name: '家长会准备模板',
        description: '家长会相关任务的标准模板',
        category: 'event_planning',
        tasks: [
          {
            title: '准备会议材料',
            description: '整理学生表现报告',
            estimatedHours: 4,
            priority: 'high'
          },
          {
            title: '布置会议室',
            description: '安排座椅和投影设备',
            estimatedHours: 2,
            priority: 'medium'
          }
        ],
        defaultAssigneeRole: 'teacher'
      };

      const mockTemplate = {
        id: 1,
        ...templateData,
        createdAt: new Date()
      };

      mockTaskTemplate.create.mockResolvedValue(mockTemplate);

      const result = await taskService.createTaskTemplate(templateData);

      expect(mockTaskTemplate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '家长会准备模板',
          tasks: expect.arrayContaining([
            expect.objectContaining({
              title: '准备会议材料'
            })
          ])
        })
      );
      expect(result).toEqual(mockTemplate);
    });

    it('应该验证模板数据', async () => {
      const invalidTemplateData = {
        name: '', // 空名称
        tasks: [] // 空任务列表
      };

      await expect(taskService.createTaskTemplate(invalidTemplateData))
        .rejects.toThrow('模板数据验证失败');
    });
  });

  describe('bulkUpdateTasks', () => {
    it('应该批量更新任务', async () => {
      const taskIds = [1, 2, 3];
      const updateData = {
        status: 'in_progress',
        assigneeId: 2
      };

      const mockTasks = [
        { id: 1, status: 'pending', update: jest.fn().mockResolvedValue(undefined) },
        { id: 2, status: 'pending', update: jest.fn().mockResolvedValue(undefined) },
        { id: 3, status: 'pending', update: jest.fn().mockResolvedValue(undefined) }
      ];

      mockTask.findAll.mockResolvedValue(mockTasks);

      const result = await taskService.bulkUpdateTasks(taskIds, updateData);

      expect(result.updated).toBe(3);
      expect(result.failed).toBe(0);
      mockTasks.forEach(task => {
        expect(task.update).toHaveBeenCalledWith(updateData);
      });
    });

    it('应该处理部分更新失败', async () => {
      const taskIds = [1, 2, 3];
      const updateData = { status: 'completed' };

      const mockTasks = [
        { id: 1, update: jest.fn().mockResolvedValue(undefined) },
        { id: 2, update: jest.fn().mockRejectedValue(new Error('更新失败')) },
        { id: 3, update: jest.fn().mockResolvedValue(undefined) }
      ];

      mockTask.findAll.mockResolvedValue(mockTasks);

      const result = await taskService.bulkUpdateTasks(taskIds, updateData);

      expect(result.updated).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('应该处理数据库连接错误', async () => {
      const taskData = {
        title: '测试任务',
        assigneeId: 1,
        creatorId: 2
      };

      mockTask.create.mockRejectedValue(new Error('数据库连接失败'));

      await expect(taskService.createTask(taskData))
        .rejects.toThrow('数据库连接失败');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('任务创建失败'),
        expect.objectContaining({
          error: '数据库连接失败'
        })
      );
    });

    it('应该处理通知服务失败', async () => {
      const taskData = {
        title: '测试任务',
        assigneeId: 1,
        creatorId: 2
      };

      mockTask.create.mockResolvedValue({ id: 1 });
      mockNotificationService.createNotification.mockRejectedValue(new Error('通知服务不可用'));

      const result = await taskService.createTask(taskData);

      expect(result.id).toBe(1);
      expect(result.notificationSent).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('通知发送失败')
      );
    });

    it('应该处理定时任务调度失败', async () => {
      const taskId = 1;
      const reminderOptions = {
        type: 'due_date',
        advanceTime: 24 * 60 * 60 * 1000
      };

      mockTask.findByPk.mockResolvedValue({
        id: 1,
        dueDate: new Date('2024-04-01T10:00:00Z')
      });
      mockCron.schedule.mockImplementation(() => {
        throw new Error('定时任务调度失败');
      });

      const result = await taskService.scheduleTaskReminder(taskId, reminderOptions);

      expect(result.scheduled).toBe(false);
      expect(result.error).toBe('定时任务调度失败');
    });
  });

  describe('Performance Optimization', () => {
    it('应该批量创建任务', async () => {
      const tasksData = Array.from({ length: 100 }, (_, i) => ({
        title: `批量任务 ${i + 1}`,
        assigneeId: 1,
        creatorId: 2
      }));

      const result = await taskService.bulkCreateTasks(tasksData);

      expect(mockTask.bulkCreate).toHaveBeenCalledWith(
        tasksData,
        { batch: true }
      );
      expect(result.created).toBe(100);
    });

    it('应该缓存任务统计', async () => {
      const userId = 1;
      const cacheKey = `task_stats:${userId}`;

      // 第一次调用
      const result1 = await taskService.getTaskStatistics(userId, { useCache: true });

      // 第二次调用应该使用缓存
      const result2 = await taskService.getTaskStatistics(userId, { useCache: true });

      expect(mockTask.findAll).toHaveBeenCalledTimes(1); // 只查询一次数据库
    });

    it('应该分页处理大量任务', async () => {
      const queryOptions = {
        assigneeId: 1,
        page: 1,
        pageSize: 50
      };

      await taskService.getTaskList(queryOptions);

      expect(mockTask.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 50,
          offset: 0
        })
      );
    });
  });

  describe('Integration Tests', () => {
    it('应该集成任务创建和日历事件', async () => {
      const taskData = {
        title: '重要会议',
        assigneeId: 1,
        creatorId: 2,
        dueDate: new Date('2024-04-01T14:00:00Z'),
        createCalendarEvent: true
      };

      mockTask.create.mockResolvedValue({ id: 1, ...taskData });

      const result = await taskService.createTask(taskData);

      expect(mockCalendarService.createEvent).toHaveBeenCalledWith({
        title: '重要会议',
        startTime: taskData.dueDate,
        attendees: [1], // assigneeId
        type: 'task'
      });
      expect(result.calendarEventCreated).toBe(true);
    });

    it('应该集成任务完成和统计更新', async () => {
      const taskId = 1;
      const updateData = {
        status: 'completed',
        completedAt: new Date()
      };

      const mockTask = {
        id: 1,
        assigneeId: 1,
        kindergartenId: 1,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockTask.findByPk.mockResolvedValue(mockTask);

      await taskService.updateTask(taskId, updateData);

      // 验证统计信息更新
      expect(mockTaskLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'completed',
          taskId: taskId
        })
      );
    });
  });
});
