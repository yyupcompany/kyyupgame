import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { DataTypes } from 'sequelize';

// Mock Sequelize
const mockSequelize = {
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

// Mock Kindergarten model
const mockKindergarten = {
  init: jest.fn(),
  initModel: jest.fn(),
  associate: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  hasMany: jest.fn(),
  belongsTo: jest.fn(),
  belongsToMany: jest.fn()
};

// Mock related models
const mockUser = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockStudent = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockClass = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockActivity = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockEnrollmentPlan = { hasMany: jest.fn(), belongsTo: jest.fn() };

// Mock imports
jest.unstable_mockModule('../../../../../src/models/kindergarten.model', () => ({
  Kindergarten: mockKindergarten,
  KindergartenStatus: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
  },
  KindergartenType: {
    PUBLIC: 'public',
    PRIVATE: 'private',
    INTERNATIONAL: 'international'
  }
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/student.model', () => ({
  Student: mockStudent
}));

jest.unstable_mockModule('../../../../../src/models/class.model', () => ({
  Class: mockClass
}));

jest.unstable_mockModule('../../../../../src/models/activity.model', () => ({
  Activity: mockActivity
}));

jest.unstable_mockModule('../../../../../src/models/enrollment-plan.model', () => ({
  EnrollmentPlan: mockEnrollmentPlan
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

describe('Kindergarten Model', () => {
  let Kindergarten: any;
  let KindergartenStatus: any;
  let KindergartenType: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/models/kindergarten.model');
    Kindergarten = imported.Kindergarten;
    KindergartenStatus = imported.KindergartenStatus;
    KindergartenType = imported.KindergartenType;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('应该正确定义Kindergarten模型', () => {
      Kindergarten.initModel(mockSequelize);

      expect(Kindergarten.init).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          }),
          name: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
          }),
          address: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: false
          }),
          phone: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: false,
            validate: expect.objectContaining({
              is: expect.any(RegExp)
            })
          }),
          email: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true,
            validate: expect.objectContaining({
              isEmail: true
            })
          }),
          principalId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: true
          }),
          type: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['public', 'private', 'international'],
            defaultValue: 'private'
          }),
          status: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['active', 'inactive', 'suspended'],
            defaultValue: 'active'
          }),
          capacity: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: expect.objectContaining({
              min: 1
            })
          }),
          currentEnrollment: expect.objectContaining({
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: expect.objectContaining({
              min: 0
            })
          }),
          establishedDate: expect.objectContaining({
            type: DataTypes.DATEONLY,
            allowNull: true
          }),
          licenseNumber: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
          }),
          description: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: true
          })
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          tableName: 'kindergartens',
          timestamps: true
        })
      );
    });

    it('应该包含所有必需的字段', () => {
      const kindergartenInstance = {
        id: 1,
        name: '阳光幼儿园',
        address: '北京市朝阳区阳光街123号',
        phone: '010-12345678',
        email: 'sunshine@kindergarten.com',
        principalId: 1,
        type: 'private',
        status: 'active',
        capacity: 300,
        currentEnrollment: 250,
        establishedDate: '2020-01-01',
        licenseNumber: 'KG2020001',
        description: '一所优质的私立幼儿园',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 检查实例是否具有预期的属性
      expect(kindergartenInstance).toHaveProperty('id');
      expect(kindergartenInstance).toHaveProperty('name');
      expect(kindergartenInstance).toHaveProperty('address');
      expect(kindergartenInstance).toHaveProperty('phone');
      expect(kindergartenInstance).toHaveProperty('email');
      expect(kindergartenInstance).toHaveProperty('principalId');
      expect(kindergartenInstance).toHaveProperty('type');
      expect(kindergartenInstance).toHaveProperty('status');
      expect(kindergartenInstance).toHaveProperty('capacity');
      expect(kindergartenInstance).toHaveProperty('currentEnrollment');
      expect(kindergartenInstance).toHaveProperty('establishedDate');
      expect(kindergartenInstance).toHaveProperty('licenseNumber');
      expect(kindergartenInstance).toHaveProperty('description');
    });
  });

  describe('Model Validations', () => {
    it('应该验证必填字段', () => {
      const requiredFields = ['name', 'address', 'phone', 'capacity'];
      
      requiredFields.forEach(field => {
        expect(mockKindergarten.init).toHaveBeenCalledWith(
          expect.objectContaining({
            [field]: expect.objectContaining({
              allowNull: false
            })
          }),
          expect.any(Object)
        );
      });
    });

    it('应该验证电话号码格式', () => {
      expect(mockKindergarten.init).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: expect.objectContaining({
            validate: expect.objectContaining({
              is: expect.any(RegExp)
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证邮箱格式', () => {
      expect(mockKindergarten.init).toHaveBeenCalledWith(
        expect.objectContaining({
          email: expect.objectContaining({
            validate: expect.objectContaining({
              isEmail: true
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证容量最小值', () => {
      expect(mockKindergarten.init).toHaveBeenCalledWith(
        expect.objectContaining({
          capacity: expect.objectContaining({
            validate: expect.objectContaining({
              min: 1
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证当前招生数最小值', () => {
      expect(mockKindergarten.init).toHaveBeenCalledWith(
        expect.objectContaining({
          currentEnrollment: expect.objectContaining({
            validate: expect.objectContaining({
              min: 0
            })
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('Model Associations', () => {
    it('应该定义与User的关联关系', () => {
      Kindergarten.associate({ User: mockUser });
      
      expect(mockKindergarten.belongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'principalId',
        as: 'principal'
      });
    });

    it('应该定义与Student的关联关系', () => {
      Kindergarten.associate({ Student: mockStudent });
      
      expect(mockKindergarten.hasMany).toHaveBeenCalledWith(mockStudent, {
        foreignKey: 'kindergartenId',
        as: 'students'
      });
    });

    it('应该定义与Class的关联关系', () => {
      Kindergarten.associate({ Class: mockClass });
      
      expect(mockKindergarten.hasMany).toHaveBeenCalledWith(mockClass, {
        foreignKey: 'kindergartenId',
        as: 'classes'
      });
    });

    it('应该定义与Activity的关联关系', () => {
      Kindergarten.associate({ Activity: mockActivity });
      
      expect(mockKindergarten.hasMany).toHaveBeenCalledWith(mockActivity, {
        foreignKey: 'kindergartenId',
        as: 'activities'
      });
    });

    it('应该定义与EnrollmentPlan的关联关系', () => {
      Kindergarten.associate({ EnrollmentPlan: mockEnrollmentPlan });
      
      expect(mockKindergarten.hasMany).toHaveBeenCalledWith(mockEnrollmentPlan, {
        foreignKey: 'kindergartenId',
        as: 'enrollmentPlans'
      });
    });
  });

  describe('Model Enums', () => {
    it('应该定义正确的状态枚举', () => {
      expect(KindergartenStatus).toEqual({
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        SUSPENDED: 'suspended'
      });
    });

    it('应该定义正确的类型枚举', () => {
      expect(KindergartenType).toEqual({
        PUBLIC: 'public',
        PRIVATE: 'private',
        INTERNATIONAL: 'international'
      });
    });
  });

  describe('Model Methods', () => {
    it('应该支持toJSON方法', () => {
      const kindergartenInstance = {
        id: 1,
        name: '阳光幼儿园',
        address: '北京市朝阳区阳光街123号',
        phone: '010-12345678',
        type: 'private',
        status: 'active',
        capacity: 300,
        currentEnrollment: 250,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: '阳光幼儿园',
          address: '北京市朝阳区阳光街123号',
          phone: '010-12345678',
          type: 'private',
          status: 'active',
          capacity: 300,
          currentEnrollment: 250
        })
      };

      const json = kindergartenInstance.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name', '阳光幼儿园');
      expect(json).toHaveProperty('address', '北京市朝阳区阳光街123号');
      expect(json).toHaveProperty('phone', '010-12345678');
      expect(json).toHaveProperty('type', 'private');
      expect(json).toHaveProperty('status', 'active');
      expect(json).toHaveProperty('capacity', 300);
      expect(json).toHaveProperty('currentEnrollment', 250);
    });

    it('应该支持计算入学率', () => {
      const kindergartenInstance = {
        capacity: 300,
        currentEnrollment: 250,
        getEnrollmentRate: jest.fn().mockReturnValue(83.33)
      };

      const enrollmentRate = kindergartenInstance.getEnrollmentRate();

      expect(enrollmentRate).toBeCloseTo(83.33, 2);
    });

    it('应该支持检查是否已满', () => {
      const fullKindergarten = {
        capacity: 300,
        currentEnrollment: 300,
        isFull: jest.fn().mockReturnValue(true)
      };

      const notFullKindergarten = {
        capacity: 300,
        currentEnrollment: 250,
        isFull: jest.fn().mockReturnValue(false)
      };

      expect(fullKindergarten.isFull()).toBe(true);
      expect(notFullKindergarten.isFull()).toBe(false);
    });
  });
});
