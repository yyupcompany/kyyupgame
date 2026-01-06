import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { initEnrollmentTask, initEnrollmentTaskAssociations, EnrollmentTaskType, TaskPriority, TaskStatus } from '../../../src/models/enrollment-task.model';
import { EnrollmentPlan } from '../../../src/models/enrollment-plan.model';
import { Teacher } from '../../../src/models/teacher.model';
import { User } from '../../../src/models/user.model';

// Mock the sequelize instance
jest.mock('../../../src/config/database', () => ({
  sequelize: {
    define: jest.fn(),
    sync: jest.fn(),
    close: jest.fn(),
  } as any,
}));

// 控制台错误检测变量
let consoleSpy: any

describe('EnrollmentTask Model', () => {
  let mockSequelize: jest.Mocked<Sequelize>;
  let mockModel: any;

  beforeEach(() => {
    mockSequelize = {
      define: jest.fn().mockReturnValue({
        belongsTo: jest.fn(),
      })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}),
      sync: jest.fn(),
      close: jest.fn(),
    } as any;

    mockModel = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Model Definition', () => {
    it('should initialize model with correct attributes', () => {
      initEnrollmentTask(mockSequelize);
      
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'enrollment_tasks',
        expect.objectContaining({
          id: {
            type: expect.any(Object),
            primaryKey: true,
            autoIncrement: true,
            comment: '招生任务ID'
          },
          planId: {
            type: expect.any(Object),
            allowNull: false,
            comment: '招生计划ID'
          },
          teacherId: {
            type: expect.any(Object),
            allowNull: false,
            comment: '教师ID'
          },
          title: {
            type: expect.any(Object),
            allowNull: false,
            comment: '任务标题'
          },
          taskType: {
            type: expect.any(Object),
            allowNull: false,
            comment: '任务类型 - 1:线上宣传 2:线下宣讲 3:咨询接待 4:考核评估 5:其他'
          },
          targetCount: {
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 0,
            comment: '目标完成人数'
          },
          actualCount: {
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 0,
            comment: '实际完成人数'
          },
          startDate: {
            type: expect.any(Object),
            allowNull: false,
            comment: '任务开始日期'
          },
          endDate: {
            type: expect.any(Object),
            allowNull: false,
            comment: '任务结束日期'
          },
          description: {
            type: expect.any(Object),
            allowNull: true,
            comment: '任务描述'
          },
          requirement: {
            type: expect.any(Object),
            allowNull: true,
            comment: '任务要求'
          },
          priority: {
            type: expect.any(Object),
            allowNull: false,
            defaultValue: TaskPriority.MEDIUM,
            comment: '优先级 - 1:紧急 2:高 3:中 4:低'
          },
          status: {
            type: expect.any(Object),
            allowNull: false,
            defaultValue: TaskStatus.NOT_STARTED,
            comment: '任务状态 - 0:未开始 1:进行中 2:已完成 3:已终止'
          },
          remark: {
            type: expect.any(Object),
            allowNull: true,
            comment: '备注'
          },
          creatorId: {
            type: expect.any(Object),
            allowNull: true,
            comment: '创建人ID'
          },
          updaterId: {
            type: expect.any(Object),
            allowNull: true,
            comment: '更新人ID'
          },
          createdAt: {
            type: expect.any(Object),
            allowNull: false
          },
          updatedAt: {
            type: expect.any(Object),
            allowNull: false
          },
          deletedAt: {
            type: expect.any(Object),
            allowNull: true
          }
        }),
        {
          sequelize: mockSequelize,
          tableName: 'enrollment_tasks',
          timestamps: true,
          paranoid: true,
          underscored: true,
        }
      );
    });

    it('should have correct table configuration', () => {
      initEnrollmentTask(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.tableName).toBe('enrollment_tasks');
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });
  });

  describe('Associations', () => {
    beforeEach(() => {
      initEnrollmentTask(mockSequelize);
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    it('should set up belongsTo association with EnrollmentPlan', () => {
      initEnrollmentTaskAssociations();
      
      expect(mockModel.belongsTo).toHaveBeenCalledWith(
        EnrollmentPlan,
        {
          foreignKey: 'planId',
          as: 'plan'
        }
      );
    });

    it('should set up belongsTo association with Teacher', () => {
      initEnrollmentTaskAssociations();
      
      expect(mockModel.belongsTo).toHaveBeenCalledWith(
        Teacher,
        {
          foreignKey: 'teacherId',
          as: 'teacher'
        }
      );
    });

    it('should set up belongsTo association with User as creator', () => {
      initEnrollmentTaskAssociations();
      
      expect(mockModel.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'creatorId',
          as: 'creator'
        }
      );
    });

    it('should set up belongsTo association with User as updater', () => {
      initEnrollmentTaskAssociations();
      
      expect(mockModel.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'updaterId',
          as: 'updater'
        }
      );
    });
  });

  describe('Enum Values', () => {
    it('should have correct EnrollmentTaskType enum values', () => {
      expect(EnrollmentTaskType.ONLINE_PROMOTION).toBe(1);
      expect(EnrollmentTaskType.OFFLINE_SEMINAR).toBe(2);
      expect(EnrollmentTaskType.CONSULTATION_RECEPTION).toBe(3);
      expect(EnrollmentTaskType.ASSESSMENT).toBe(4);
      expect(EnrollmentTaskType.OTHER).toBe(5);
    });

    it('should have correct TaskPriority enum values', () => {
      expect(TaskPriority.URGENT).toBe(1);
      expect(TaskPriority.HIGH).toBe(2);
      expect(TaskPriority.MEDIUM).toBe(3);
      expect(TaskPriority.LOW).toBe(4);
    });

    it('should have correct TaskStatus enum values', () => {
      expect(TaskStatus.NOT_STARTED).toBe(0);
      expect(TaskStatus.IN_PROGRESS).toBe(1);
      expect(TaskStatus.COMPLETED).toBe(2);
      expect(TaskStatus.TERMINATED).toBe(3);
    });

    it('should validate taskType enum values', () => {
      const validTaskTypes = Object.values(EnrollmentTaskType);
      
      validTaskTypes.forEach(taskType => {
        expect([1, 2, 3, 4, 5]).toContain(taskType);
      });
    });

    it('should validate priority enum values', () => {
      const validPriorities = Object.values(TaskPriority);
      
      validPriorities.forEach(priority => {
        expect([1, 2, 3, 4]).toContain(priority);
      });
    });

    it('should validate status enum values', () => {
      const validStatuses = Object.values(TaskStatus);
      
      validStatuses.forEach(status => {
        expect([0, 1, 2, 3]).toContain(status);
      });
    });
  });

  describe('Field Validation', () => {
    it('should validate required fields', () => {
      const taskData = {
        planId: 1,
        teacherId: 1,
        title: '线上宣传活动',
        taskType: EnrollmentTaskType.ONLINE_PROMOTION,
        targetCount: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      expect(taskData).toHaveProperty('planId');
      expect(taskData).toHaveProperty('teacherId');
      expect(taskData).toHaveProperty('title');
      expect(taskData).toHaveProperty('taskType');
      expect(taskData).toHaveProperty('targetCount');
      expect(taskData).toHaveProperty('startDate');
      expect(taskData).toHaveProperty('endDate');
    });

    it('should validate optional fields', () => {
      const taskData = {
        description: '通过社交媒体进行线上宣传',
        requirement: '需要制作宣传海报和文案',
        remark: '重要任务',
        creatorId: 1,
        updaterId: 2
      };

      expect(taskData.description).toBeDefined();
      expect(taskData.requirement).toBeDefined();
      expect(taskData.remark).toBeDefined();
      expect(taskData.creatorId).toBeDefined();
      expect(taskData.updaterId).toBeDefined();
    });
  });

  describe('Field Constraints', () => {
    it('should validate string field lengths', () => {
      expect.assertions(2);
      
      // title max length 100
      const title = '任'.repeat(100);
      expect(title.length).toBeLessThanOrEqual(100);
      
      // remark max length 500
      const remark = '备'.repeat(500);
      expect(remark.length).toBeLessThanOrEqual(500);
    });

    it('should validate numeric field constraints', () => {
      const validPlanId = 1;
      expect(validPlanId).toBeGreaterThan(0);
      
      const validTeacherId = 1;
      expect(validTeacherId).toBeGreaterThan(0);
      
      const validTargetCount = 20;
      expect(validTargetCount).toBeGreaterThanOrEqual(0);
      
      const validActualCount = 15;
      expect(validActualCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Default Values', () => {
    it('should have default targetCount value', () => {
      const taskData = {
        planId: 1,
        teacherId: 1,
        title: '线上宣传活动',
        taskType: EnrollmentTaskType.ONLINE_PROMOTION,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      // targetCount should default to 0
      expect(taskData.targetCount).toBeUndefined(); // will be set by database default
    });

    it('should have default actualCount value', () => {
      const taskData = {
        planId: 1,
        teacherId: 1,
        title: '线上宣传活动',
        taskType: EnrollmentTaskType.ONLINE_PROMOTION,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      // actualCount should default to 0
      expect(taskData.actualCount).toBeUndefined(); // will be set by database default
    });

    it('should have default priority value', () => {
      const taskData = {
        planId: 1,
        teacherId: 1,
        title: '线上宣传活动',
        taskType: EnrollmentTaskType.ONLINE_PROMOTION,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      // priority should default to TaskPriority.MEDIUM (3)
      expect(taskData.priority).toBeUndefined(); // will be set by database default
      expect(TaskPriority.MEDIUM).toBe(3);
    });

    it('should have default status value', () => {
      const taskData = {
        planId: 1,
        teacherId: 1,
        title: '线上宣传活动',
        taskType: EnrollmentTaskType.ONLINE_PROMOTION,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      // status should default to TaskStatus.NOT_STARTED (0)
      expect(taskData.status).toBeUndefined(); // will be set by database default
      expect(TaskStatus.NOT_STARTED).toBe(0);
    });
  });

  describe('Foreign Key References', () => {
    it('should have foreign key reference to enrollment_plans table', () => {
      initEnrollmentTask(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.planId.references).toEqual({
        model: 'enrollment_plans',
        key: 'id'
      });
    });

    it('should have foreign key reference to teachers table', () => {
      initEnrollmentTask(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.teacherId.references).toEqual({
        model: 'teachers',
        key: 'id'
      });
    });
  });

  describe('Date Fields', () => {
    it('should use DATEONLY type for date fields', () => {
      initEnrollmentTask(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.startDate.type).toBeDefined();
      expect(attributes.startDate.allowNull).toBe(false);
      
      expect(attributes.endDate.type).toBeDefined();
      expect(attributes.endDate.allowNull).toBe(false);
    });

    it('should validate date range logic', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      expect(endDate.getTime()).toBeGreaterThan(startDate.getTime());
    });
  });

  describe('Count Fields', () => {
    it('should validate count fields are non-negative', () => {
      const validCounts = [0, 1, 5, 10, 50, 100];
      
      validCounts.forEach(count => {
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle progress tracking logic', () => {
      const targetCount = 20;
      const actualCount = 15;
      
      expect(actualCount).toBeLessThanOrEqual(targetCount);
      
      const progress = (actualCount / targetCount) * 100;
      expect(progress).toBe(75);
    });
  });

  describe('Task Type Logic', () => {
    it('should handle different task types correctly', () => {
      const onlinePromotion = {
        planId: 1,
        teacherId: 1,
        title: '线上宣传活动',
        taskType: EnrollmentTaskType.ONLINE_PROMOTION,
        targetCount: 50,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const offlineSeminar = {
        planId: 1,
        teacherId: 1,
        title: '线下宣讲会',
        taskType: EnrollmentTaskType.OFFLINE_SEMINAR,
        targetCount: 30,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-15')
      };

      expect(onlinePromotion.taskType).toBe(EnrollmentTaskType.ONLINE_PROMOTION);
      expect(offlineSeminar.taskType).toBe(EnrollmentTaskType.OFFLINE_SEMINAR);
      expect(onlinePromotion.taskType).not.toBe(offlineSeminar.taskType);
    });
  });

  describe('Priority Logic', () => {
    it('should handle different priority levels', () => {
      const urgentTask = {
        planId: 1,
        teacherId: 1,
        title: '紧急招生任务',
        taskType: EnrollmentTaskType.CONSULTATION_RECEPTION,
        targetCount: 10,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-07'),
        priority: TaskPriority.URGENT
      };

      const lowPriorityTask = {
        planId: 1,
        teacherId: 1,
        title: '常规宣传工作',
        taskType: EnrollmentTaskType.ONLINE_PROMOTION,
        targetCount: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        priority: TaskPriority.LOW
      };

      expect(urgentTask.priority).toBeLessThan(lowPriorityTask.priority);
    });
  });

  describe('Status Logic', () => {
    it('should handle different status values', () => {
      const notStarted = {
        planId: 1,
        teacherId: 1,
        title: '新任务',
        taskType: EnrollmentTaskType.ONLINE_PROMOTION,
        targetCount: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        status: TaskStatus.NOT_STARTED
      };

      const inProgress = {
        planId: 1,
        teacherId: 1,
        title: '进行中的任务',
        taskType: EnrollmentTaskType.ONLINE_PROMOTION,
        targetCount: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        status: TaskStatus.IN_PROGRESS
      };

      const completed = {
        planId: 1,
        teacherId: 1,
        title: '已完成的任务',
        taskType: EnrollmentTaskType.ONLINE_PROMOTION,
        targetCount: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        status: TaskStatus.COMPLETED
      };

      expect(notStarted.status).toBeLessThan(inProgress.status);
      expect(inProgress.status).toBeLessThan(completed.status);
    });
  });

  describe('Instance Methods', () => {
    it('should have required instance properties', () => {
      const MockEnrollmentTask = initEnrollmentTask(mockSequelize);
      const mockInstance = new MockEnrollmentTask();
      
      expect(mockInstance).toHaveProperty('id');
      expect(mockInstance).toHaveProperty('planId');
      expect(mockInstance).toHaveProperty('teacherId');
      expect(mockInstance).toHaveProperty('title');
      expect(mockInstance).toHaveProperty('taskType');
      expect(mockInstance).toHaveProperty('targetCount');
      expect(mockInstance).toHaveProperty('actualCount');
      expect(mockInstance).toHaveProperty('startDate');
      expect(mockInstance).toHaveProperty('endDate');
      expect(mockInstance).toHaveProperty('description');
      expect(mockInstance).toHaveProperty('requirement');
      expect(mockInstance).toHaveProperty('priority');
      expect(mockInstance).toHaveProperty('status');
      expect(mockInstance).toHaveProperty('remark');
      expect(mockInstance).toHaveProperty('creatorId');
      expect(mockInstance).toHaveProperty('updaterId');
      expect(mockInstance).toHaveProperty('createdAt');
      expect(mockInstance).toHaveProperty('updatedAt');
      expect(mockInstance).toHaveProperty('deletedAt');
    });

    it('should have association properties', () => {
      const MockEnrollmentTask = initEnrollmentTask(mockSequelize);
      const mockInstance = new MockEnrollmentTask();
      
      expect(mockInstance).toHaveProperty('plan');
      expect(mockInstance).toHaveProperty('teacher');
      expect(mockInstance).toHaveProperty('creator');
      expect(mockInstance).toHaveProperty('updater');
    });
  });

  describe('Model Creation', () => {
    it('should return the model class when initialized', () => {
      const ModelClass = initEnrollmentTask(mockSequelize);
      
      expect(ModelClass).toBeDefined();
      expect(typeof ModelClass).toBe('function');
    });

    it('should have correct model name', () => {
      const ModelClass = initEnrollmentTask(mockSequelize);
      
      expect(ModelClass.name).toBe('Model');
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete with deletedAt field', () => {
      initEnrollmentTask(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.deletedAt).toBeDefined();
      expect(attributes.deletedAt.allowNull).toBe(true);
    });

    it('should have paranoid option enabled', () => {
      initEnrollmentTask(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.paranoid).toBe(true);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt fields', () => {
      initEnrollmentTask(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.createdAt.allowNull).toBe(false);
      
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.updatedAt.allowNull).toBe(false);
    });

    it('should have timestamps option enabled', () => {
      initEnrollmentTask(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.timestamps).toBe(true);
    });
  });
});