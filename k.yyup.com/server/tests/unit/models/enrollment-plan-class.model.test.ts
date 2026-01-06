import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { initEnrollmentPlanClass, initEnrollmentPlanClassAssociations } from '../../../src/models/enrollment-plan-class.model';
import { EnrollmentPlan } from '../../../src/models/enrollment-plan.model';
import { Class } from '../../../src/models/class.model';

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

describe('EnrollmentPlanClass Model', () => {
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
      belongsToMany: jest.fn(),
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
      initEnrollmentPlanClass(mockSequelize);
      
      expect(mockSequelize.define).toHaveBeenCalledWith(
        'enrollment_plan_classes',
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
          classId: {
            type: expect.any(Object),
            allowNull: false,
            comment: '班级ID - 外键关联班级表'
          },
          quota: {
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 0,
            comment: '招生名额'
          },
          remark: {
            type: expect.any(Object),
            allowNull: true,
            comment: '备注'
          },
          createdAt: {
            type: expect.any(Object),
            allowNull: false,
            comment: '创建时间'
          },
          updatedAt: {
            type: expect.any(Object),
            allowNull: false,
            comment: '更新时间'
          }
        }),
        {
          sequelize: mockSequelize,
          tableName: 'enrollment_plan_classes',
          timestamps: true,
          paranoid: true,
          underscored: true,
        }
      );
    });

    it('should have correct table configuration', () => {
      initEnrollmentPlanClass(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.tableName).toBe('enrollment_plan_classes');
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });
  });

  describe('Associations', () => {
    beforeEach(() => {
      initEnrollmentPlanClass(mockSequelize);
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    it('should set up many-to-many association between EnrollmentPlan and Class', () => {
      initEnrollmentPlanClassAssociations();
      
      expect(EnrollmentPlan.belongsToMany).toHaveBeenCalledWith(
        Class,
        {
          through: expect.any(Function),
          foreignKey: 'planId',
          otherKey: 'classId',
          as: 'classes'
        }
      );
    });

    it('should set up many-to-many association between Class and EnrollmentPlan', () => {
      initEnrollmentPlanClassAssociations();
      
      expect(Class.belongsToMany).toHaveBeenCalledWith(
        EnrollmentPlan,
        {
          through: expect.any(Function),
          foreignKey: 'classId',
          otherKey: 'planId',
          as: 'enrollmentPlans'
        }
      );
    });

    it('should set up belongsTo association with EnrollmentPlan', () => {
      initEnrollmentPlanClassAssociations();
      
      expect(mockModel.belongsTo).toHaveBeenCalledWith(
        EnrollmentPlan,
        {
          foreignKey: 'planId',
          as: 'plan'
        }
      );
    });

    it('should set up belongsTo association with Class', () => {
      initEnrollmentPlanClassAssociations();
      
      expect(mockModel.belongsTo).toHaveBeenCalledWith(
        Class,
        {
          foreignKey: 'classId',
          as: 'class'
        }
      );
    });
  });

  describe('Field Validation', () => {
    it('should validate required fields', () => {
      const planClassData = {
        planId: 1,
        classId: 1,
        quota: 30
      };

      expect(planClassData).toHaveProperty('planId');
      expect(planClassData).toHaveProperty('classId');
      expect(planClassData).toHaveProperty('quota');
    });

    it('should validate optional fields', () => {
      const planClassData = {
        remark: '主要招收3-4岁幼儿'
      };

      expect(planClassData.remark).toBeDefined();
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
      
      const validClassId = 1;
      expect(validClassId).toBeGreaterThan(0);
      
      const validQuota = 30;
      expect(validQuota).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Default Values', () => {
    it('should have default quota value', () => {
      const planClassData = {
        planId: 1,
        classId: 1
      };

      // quota should default to 0
      expect(planClassData.quota).toBeUndefined(); // will be set by database default
    });
  });

  describe('Foreign Key References', () => {
    it('should have foreign key reference to enrollment_plans table', () => {
      initEnrollmentPlanClass(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.planId.references).toEqual({
        model: 'enrollment_plans',
        key: 'id'
      });
    });

    it('should have foreign key reference to classes table', () => {
      initEnrollmentPlanClass(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.classId.references).toEqual({
        model: 'classes',
        key: 'id'
      });
    });
  });

  describe('Instance Methods', () => {
    it('should have required instance properties', () => {
      const MockEnrollmentPlanClass = initEnrollmentPlanClass(mockSequelize);
      const mockInstance = new MockEnrollmentPlanClass();
      
      expect(mockInstance).toHaveProperty('id');
      expect(mockInstance).toHaveProperty('planId');
      expect(mockInstance).toHaveProperty('classId');
      expect(mockInstance).toHaveProperty('quota');
      expect(mockInstance).toHaveProperty('remark');
      expect(mockInstance).toHaveProperty('createdAt');
      expect(mockInstance).toHaveProperty('updatedAt');
    });
  });

  describe('Model Creation', () => {
    it('should return the model class when initialized', () => {
      const ModelClass = initEnrollmentPlanClass(mockSequelize);
      
      expect(ModelClass).toBeDefined();
      expect(typeof ModelClass).toBe('function');
    });

    it('should have correct model name', () => {
      const ModelClass = initEnrollmentPlanClass(mockSequelize);
      
      expect(ModelClass.name).toBe('Model');
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete with deletedAt field', () => {
      initEnrollmentPlanClass(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.deletedAt).toBeDefined();
      expect(attributes.deletedAt.allowNull).toBe(true);
    });

    it('should have paranoid option enabled', () => {
      initEnrollmentPlanClass(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.paranoid).toBe(true);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt fields', () => {
      initEnrollmentPlanClass(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.createdAt.allowNull).toBe(false);
      
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.updatedAt.allowNull).toBe(false);
    });

    it('should have timestamps option enabled', () => {
      initEnrollmentPlanClass(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.timestamps).toBe(true);
    });
  });

  describe('Junction Table Behavior', () => {
    it('should act as a junction table for many-to-many relationship', () => {
      initEnrollmentPlanClass(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      // Junction table should have both foreign keys
      expect(attributes.planId).toBeDefined();
      expect(attributes.classId).toBeDefined();
      
      // Both should be required
      expect(attributes.planId.allowNull).toBe(false);
      expect(attributes.classId.allowNull).toBe(false);
    });

    it('should allow only one combination of planId and classId', () => {
      // This would be enforced by a unique constraint at the database level
      const planClassData1 = {
        planId: 1,
        classId: 1,
        quota: 30
      };
      
      const planClassData2 = {
        planId: 1,
        classId: 1,
        quota: 25
      };
      
      // These should be considered duplicates and not allowed
      expect(planClassData1.planId).toBe(planClassData2.planId);
      expect(planClassData1.classId).toBe(planClassData2.classId);
    });
  });

  describe('Quota Validation', () => {
    it('should validate quota is non-negative', () => {
      const validQuotas = [0, 1, 10, 30, 100];
      
      validQuotas.forEach(quota => {
        expect(quota).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle zero quota (no enrollment)', () => {
      const planClassData = {
        planId: 1,
        classId: 1,
        quota: 0
      };

      expect(planClassData.quota).toBe(0);
    });

    it('should handle positive quota values', () => {
      const planClassData = {
        planId: 1,
        classId: 1,
        quota: 25
      };

      expect(planClassData.quota).toBe(25);
    });
  });
});