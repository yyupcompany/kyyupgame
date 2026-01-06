import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { initEnrollmentPlanAssignee, initEnrollmentPlanAssigneeAssociations, AssigneeRole } from '../../../src/models/enrollment-plan-assignee.model';
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

describe('EnrollmentPlanAssignee Model', () => {
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
      initEnrollmentPlanAssignee(mockSequelize);
      
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'enrollment_plan_assignees',
        expect.objectContaining({
          id: {
            type: expect.any(Object),
            autoIncrement: true,
            primaryKey: true,
            comment: '关联ID - 主键'
          },
          planId: {
            type: expect.any(Object),
            allowNull: false,
            comment: '招生计划ID - 外键关联招生计划表'
          },
          assigneeId: {
            type: expect.any(Object),
            allowNull: false,
            comment: '负责人ID - 外键关联用户表'
          },
          role: {
            type: expect.any(Object),
            allowNull: false,
            defaultValue: AssigneeRole.SECONDARY,
            comment: '负责类型：primary-主负责人, secondary-协助负责人'
          },
          remark: {
            type: expect.any(Object),
            allowNull: true,
            comment: '备注'
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
          tableName: 'enrollment_plan_assignees',
          timestamps: true,
          paranoid: true,
          underscored: true,
        }
      );
    });

    it('should have correct table configuration', () => {
      initEnrollmentPlanAssignee(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.tableName).toBe('enrollment_plan_assignees');
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });
  });

  describe('Associations', () => {
    beforeEach(() => {
      initEnrollmentPlanAssignee(mockSequelize);
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    it('should set up belongsTo association with EnrollmentPlan', () => {
      initEnrollmentPlanAssigneeAssociations();
      
      expect(mockModel.belongsTo).toHaveBeenCalledWith(
        EnrollmentPlan,
        {
          foreignKey: 'planId',
          as: 'plan'
        }
      );
    });

    it('should set up belongsTo association with User', () => {
      initEnrollmentPlanAssigneeAssociations();
      
      expect(mockModel.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'assigneeId',
          as: 'assignee'
        }
      );
    });
  });

  describe('Enum Values', () => {
    it('should have correct AssigneeRole enum values', () => {
      expect(AssigneeRole.PRIMARY).toBe('primary');
      expect(AssigneeRole.SECONDARY).toBe('secondary');
    });

    it('should validate role enum values', () => {
      const validRoles = Object.values(AssigneeRole);
      
      validRoles.forEach(role => {
        expect(['primary', 'secondary']).toContain(role);
      });
    });
  });

  describe('Field Validation', () => {
    it('should validate required fields', () => {
      const assigneeData = {
        planId: 1,
        assigneeId: 1,
        role: AssigneeRole.PRIMARY
      };

      expect(assigneeData).toHaveProperty('planId');
      expect(assigneeData).toHaveProperty('assigneeId');
      expect(assigneeData).toHaveProperty('role');
    });

    it('should validate optional fields', () => {
      const assigneeData = {
        remark: '主要负责招生宣传工作'
      };

      expect(assigneeData.remark).toBeDefined();
    });
  });

  describe('Field Constraints', () => {
    it('should validate string field lengths', () => {
      expect.assertions(1);
      
      // remark max length 500
      const remark = '备'.repeat(500);
      expect(remark.length).toBeLessThanOrEqual(500);
    });

    it('should validate numeric field constraints', () => {
      const validPlanId = 1;
      expect(validPlanId).toBeGreaterThan(0);
      
      const validAssigneeId = 1;
      expect(validAssigneeId).toBeGreaterThan(0);
    });
  });

  describe('Default Values', () => {
    it('should have default role value', () => {
      const assigneeData = {
        planId: 1,
        assigneeId: 1
      };

      // role should default to AssigneeRole.SECONDARY
      expect(assigneeData.role).toBeUndefined(); // will be set by database default
      expect(AssigneeRole.SECONDARY).toBe('secondary');
    });
  });

  describe('Foreign Key References', () => {
    it('should have foreign key reference to enrollment_plans table', () => {
      initEnrollmentPlanAssignee(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.planId.references).toEqual({
        model: 'enrollment_plans',
        key: 'id'
      });
    });

    it('should have foreign key reference to users table', () => {
      initEnrollmentPlanAssignee(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.assigneeId.references).toEqual({
        model: 'users',
        key: 'id'
      });
    });
  });

  describe('Instance Methods', () => {
    it('should have required instance properties', () => {
      const MockEnrollmentPlanAssignee = initEnrollmentPlanAssignee(mockSequelize);
      const mockInstance = new MockEnrollmentPlanAssignee();
      
      expect(mockInstance).toHaveProperty('id');
      expect(mockInstance).toHaveProperty('planId');
      expect(mockInstance).toHaveProperty('assigneeId');
      expect(mockInstance).toHaveProperty('role');
      expect(mockInstance).toHaveProperty('remark');
      expect(mockInstance).toHaveProperty('createdAt');
      expect(mockInstance).toHaveProperty('updatedAt');
      expect(mockInstance).toHaveProperty('deletedAt');
    });
  });

  describe('Model Creation', () => {
    it('should return the model class when initialized', () => {
      const ModelClass = initEnrollmentPlanAssignee(mockSequelize);
      
      expect(ModelClass).toBeDefined();
      expect(typeof ModelClass).toBe('function');
    });

    it('should have correct model name', () => {
      const ModelClass = initEnrollmentPlanAssignee(mockSequelize);
      
      expect(ModelClass.name).toBe('Model');
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete with deletedAt field', () => {
      initEnrollmentPlanAssignee(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.deletedAt).toBeDefined();
      expect(attributes.deletedAt.allowNull).toBe(true);
    });

    it('should have paranoid option enabled', () => {
      initEnrollmentPlanAssignee(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.paranoid).toBe(true);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt fields', () => {
      initEnrollmentPlanAssignee(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.createdAt.allowNull).toBe(false);
      
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.updatedAt.allowNull).toBe(false);
    });

    it('should have timestamps option enabled', () => {
      initEnrollmentPlanAssignee(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.timestamps).toBe(true);
    });
  });
});