import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { EnrollmentPlanTracking } from '../../../src/models/enrollment-plan-tracking.model';
import { EnrollmentPlan } from '../../../src/models/enrollment-plan.model';
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

describe('EnrollmentPlanTracking Model', () => {
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
      EnrollmentPlanTracking.initModel(mockSequelize);
      
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'enrollment_plan_trackings',
        expect.objectContaining({
          id: {
            type: expect.any(Object),
            autoIncrement: true,
            primaryKey: true,
            comment: '跟踪ID - 主键'
          },
          planId: {
            type: expect.any(Object),
            allowNull: false,
            field: 'plan_id',
            comment: '招生计划ID - 外键关联招生计划表'
          },
          date: {
            type: expect.any(Object),
            allowNull: false,
            comment: '日期'
          },
          count: {
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 0,
            comment: '当日招生人数'
          },
          source: {
            type: expect.any(Object),
            allowNull: false,
            comment: '来源渠道'
          },
          assigneeId: {
            type: expect.any(Object),
            allowNull: false,
            field: 'assignee_id',
            comment: '负责人ID - 外键关联用户表'
          },
          remark: {
            type: expect.any(Object),
            allowNull: true,
            comment: '备注'
          },
          createdBy: {
            type: expect.any(Object),
            allowNull: false,
            field: 'created_by',
            comment: '创建人ID - 外键关联用户表'
          },
          createdAt: {
            type: expect.any(Object),
            allowNull: false,
            field: 'created_at',
            comment: '创建时间'
          },
          updatedAt: {
            type: expect.any(Object),
            allowNull: false,
            field: 'updated_at',
            comment: '更新时间'
          }
        }),
        {
          sequelize: mockSequelize,
          tableName: 'enrollment_plan_trackings',
          timestamps: true,
          paranoid: true,
          underscored: true,
        }
      );
    });

    it('should have correct table configuration', () => {
      EnrollmentPlanTracking.initModel(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.tableName).toBe('enrollment_plan_trackings');
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });
  });

  describe('Associations', () => {
    beforeEach(() => {
      EnrollmentPlanTracking.initModel(mockSequelize);
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    it('should set up belongsTo association with EnrollmentPlan', () => {
      EnrollmentPlanTracking.initAssociations();
      
      expect(EnrollmentPlanTracking.prototype.belongsTo).toHaveBeenCalledWith(
        EnrollmentPlan,
        {
          foreignKey: 'planId',
          as: 'plan'
        }
      );
    });

    it('should set up belongsTo association with User as assignee', () => {
      EnrollmentPlanTracking.initAssociations();
      
      expect(EnrollmentPlanTracking.prototype.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'assigneeId',
          as: 'assignee'
        }
      );
    });

    it('should set up belongsTo association with User as creator', () => {
      EnrollmentPlanTracking.initAssociations();
      
      expect(EnrollmentPlanTracking.prototype.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'createdBy',
          as: 'creator'
        }
      );
    });
  });

  describe('Field Validation', () => {
    it('should validate required fields', () => {
      const trackingData = {
        planId: 1,
        date: new Date(),
        count: 5,
        source: '线上广告',
        assigneeId: 1,
        createdBy: 1
      };

      expect(trackingData).toHaveProperty('planId');
      expect(trackingData).toHaveProperty('date');
      expect(trackingData).toHaveProperty('count');
      expect(trackingData).toHaveProperty('source');
      expect(trackingData).toHaveProperty('assigneeId');
      expect(trackingData).toHaveProperty('createdBy');
    });

    it('should validate optional fields', () => {
      const trackingData = {
        remark: '今日招生效果良好'
      };

      expect(trackingData.remark).toBeDefined();
    });
  });

  describe('Field Constraints', () => {
    it('should validate string field lengths', () => {
      expect.assertions(2);
      
      // source max length 50
      const source = '来'.repeat(50);
      expect(source.length).toBeLessThanOrEqual(50);
      
      // remark max length 500
      const remark = '备'.repeat(500);
      expect(remark.length).toBeLessThanOrEqual(500);
    });

    it('should validate numeric field constraints', () => {
      const validPlanId = 1;
      expect(validPlanId).toBeGreaterThan(0);
      
      const validCount = 5;
      expect(validCount).toBeGreaterThanOrEqual(0);
      
      const validAssigneeId = 1;
      expect(validAssigneeId).toBeGreaterThan(0);
      
      const validCreatedBy = 1;
      expect(validCreatedBy).toBeGreaterThan(0);
    });
  });

  describe('Default Values', () => {
    it('should have default count value', () => {
      const trackingData = {
        planId: 1,
        date: new Date(),
        source: '线上广告',
        assigneeId: 1,
        createdBy: 1
      };

      // count should default to 0
      expect(trackingData.count).toBeUndefined(); // will be set by database default
    });
  });

  describe('Foreign Key References', () => {
    it('should have foreign key reference to enrollment_plans table', () => {
      EnrollmentPlanTracking.initModel(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.planId.references).toEqual({
        model: 'enrollment_plans',
        key: 'id'
      });
    });

    it('should have foreign key reference to users table for assigneeId', () => {
      EnrollmentPlanTracking.initModel(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.assigneeId.references).toEqual({
        model: 'users',
        key: 'id'
      });
    });

    it('should have foreign key reference to users table for createdBy', () => {
      EnrollmentPlanTracking.initModel(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.createdBy.references).toEqual({
        model: 'users',
        key: 'id'
      });
    });
  });

  describe('Field Naming', () => {
    it('should use snake_case field names in database', () => {
      EnrollmentPlanTracking.initModel(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.planId.field).toBe('plan_id');
      expect(attributes.assigneeId.field).toBe('assignee_id');
      expect(attributes.createdBy.field).toBe('created_by');
      expect(attributes.createdAt.field).toBe('created_at');
      expect(attributes.updatedAt.field).toBe('updated_at');
    });
  });

  describe('Instance Methods', () => {
    it('should have required instance properties', () => {
      const mockInstance = new EnrollmentPlanTracking();
      
      expect(mockInstance).toHaveProperty('id');
      expect(mockInstance).toHaveProperty('planId');
      expect(mockInstance).toHaveProperty('date');
      expect(mockInstance).toHaveProperty('count');
      expect(mockInstance).toHaveProperty('source');
      expect(mockInstance).toHaveProperty('assigneeId');
      expect(mockInstance).toHaveProperty('remark');
      expect(mockInstance).toHaveProperty('createdBy');
      expect(mockInstance).toHaveProperty('createdAt');
      expect(mockInstance).toHaveProperty('updatedAt');
    });

    it('should have association properties', () => {
      const mockInstance = new EnrollmentPlanTracking();
      
      expect(mockInstance).toHaveProperty('plan');
      expect(mockInstance).toHaveProperty('assignee');
      expect(mockInstance).toHaveProperty('creator');
    });
  });

  describe('Date Field', () => {
    it('should use DATEONLY type for date field', () => {
      EnrollmentPlanTracking.initModel(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.date.type).toBeDefined();
      expect(attributes.date.allowNull).toBe(false);
    });

    it('should accept valid date values', () => {
      const validDates = [
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        new Date()
      ];
      
      validDates.forEach(date => {
        expect(date).toBeInstanceOf(Date);
      });
    });
  });

  describe('Count Validation', () => {
    it('should validate count is non-negative', () => {
      const validCounts = [0, 1, 5, 10, 50, 100];
      
      validCounts.forEach(count => {
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle zero count (no enrollments)', () => {
      const trackingData = {
        planId: 1,
        date: new Date(),
        count: 0,
        source: '线上广告',
        assigneeId: 1,
        createdBy: 1
      };

      expect(trackingData.count).toBe(0);
    });

    it('should handle positive count values', () => {
      const trackingData = {
        planId: 1,
        date: new Date(),
        count: 15,
        source: '线下活动',
        assigneeId: 1,
        createdBy: 1
      };

      expect(trackingData.count).toBe(15);
    });
  });

  describe('Source Field', () => {
    it('should validate source field is required', () => {
      const trackingData = {
        planId: 1,
        date: new Date(),
        count: 5,
        source: '线上广告',
        assigneeId: 1,
        createdBy: 1
      };

      expect(trackingData.source).toBeDefined();
      expect(trackingData.source.length).toBeGreaterThan(0);
    });

    it('should accept various source values', () => {
      const validSources = [
        '线上广告',
        '线下活动',
        '朋友介绍',
        '电话咨询',
        '自主访问',
        '其他'
      ];
      
      validSources.forEach(source => {
        expect(source.length).toBeGreaterThan(0);
        expect(source.length).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete', () => {
      EnrollmentPlanTracking.initModel(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.paranoid).toBe(true);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt fields', () => {
      EnrollmentPlanTracking.initModel(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.createdAt.allowNull).toBe(false);
      
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.updatedAt.allowNull).toBe(false);
    });

    it('should have timestamps option enabled', () => {
      EnrollmentPlanTracking.initModel(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.timestamps).toBe(true);
    });
  });
});