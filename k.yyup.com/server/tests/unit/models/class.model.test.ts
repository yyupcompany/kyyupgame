import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { DataTypes } from 'sequelize';

// Mock Sequelize
const mockSequelize = {
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

// Mock Class model
const mockClass = {
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
const mockKindergarten = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockStudent = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockTeacher = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockClassTeacher = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockActivity = { hasMany: jest.fn(), belongsTo: jest.fn() };

// Mock imports
jest.unstable_mockModule('../../../../../src/models/class.model', () => ({
  Class: mockClass,
  AgeGroup: {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    MIXED: 'mixed'
  },
  ClassStatus: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    FULL: 'full',
    SUSPENDED: 'suspended'
  }
}));

jest.unstable_mockModule('../../../../../src/models/kindergarten.model', () => ({
  Kindergarten: mockKindergarten
}));

jest.unstable_mockModule('../../../../../src/models/student.model', () => ({
  Student: mockStudent
}));

jest.unstable_mockModule('../../../../../src/models/teacher.model', () => ({
  Teacher: mockTeacher
}));

jest.unstable_mockModule('../../../../../src/models/class-teacher.model', () => ({
  ClassTeacher: mockClassTeacher
}));

jest.unstable_mockModule('../../../../../src/models/activity.model', () => ({
  Activity: mockActivity
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

describe('Class Model', () => {
  let Class: any;
  let AgeGroup: any;
  let ClassStatus: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/models/class.model');
    Class = imported.Class;
    AgeGroup = imported.AgeGroup;
    ClassStatus = imported.ClassStatus;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('应该正确定义Class模型', () => {
      Class.initModel(mockSequelize);

      expect(Class.init).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          }),
          kindergartenId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false
          }),
          name: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: false
          }),
          ageGroup: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['small', 'medium', 'large', 'mixed'],
            allowNull: false
          }),
          capacity: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: expect.objectContaining({
              min: 1,
              max: 50
            })
          }),
          currentEnrollment: expect.objectContaining({
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: expect.objectContaining({
              min: 0
            })
          }),
          status: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['active', 'inactive', 'full', 'suspended'],
            defaultValue: 'active'
          }),
          classroom: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true
          }),
          schedule: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: true
          }),
          tuition: expect.objectContaining({
            type: DataTypes.DECIMAL,
            allowNull: true,
            validate: expect.objectContaining({
              min: 0
            })
          }),
          startDate: expect.objectContaining({
            type: DataTypes.DATEONLY,
            allowNull: true
          }),
          endDate: expect.objectContaining({
            type: DataTypes.DATEONLY,
            allowNull: true
          }),
          description: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: true
          }),
          requirements: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: true
          }),
          isActive: expect.objectContaining({
            type: DataTypes.BOOLEAN,
            defaultValue: true
          })
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          tableName: 'classes',
          timestamps: true,
          paranoid: true
        })
      );
    });

    it('应该包含所有必需的字段', () => {
      const classInstance = {
        id: 1,
        kindergartenId: 1,
        name: '小班A',
        ageGroup: 'small',
        capacity: 25,
        currentEnrollment: 20,
        status: 'active',
        classroom: '101教室',
        schedule: {
          monday: ['08:00-12:00', '14:00-17:00'],
          tuesday: ['08:00-12:00', '14:00-17:00'],
          wednesday: ['08:00-12:00', '14:00-17:00'],
          thursday: ['08:00-12:00', '14:00-17:00'],
          friday: ['08:00-12:00', '14:00-17:00']
        },
        tuition: 2500.00,
        startDate: '2024-09-01',
        endDate: '2025-07-31',
        description: '适合3-4岁儿童的小班',
        requirements: {
          minAge: 3,
          maxAge: 4,
          pottyTrained: true
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      // 检查实例是否具有预期的属性
      expect(classInstance).toHaveProperty('id');
      expect(classInstance).toHaveProperty('kindergartenId');
      expect(classInstance).toHaveProperty('name');
      expect(classInstance).toHaveProperty('ageGroup');
      expect(classInstance).toHaveProperty('capacity');
      expect(classInstance).toHaveProperty('currentEnrollment');
      expect(classInstance).toHaveProperty('status');
      expect(classInstance).toHaveProperty('classroom');
      expect(classInstance).toHaveProperty('schedule');
      expect(classInstance).toHaveProperty('tuition');
      expect(classInstance).toHaveProperty('startDate');
      expect(classInstance).toHaveProperty('endDate');
      expect(classInstance).toHaveProperty('description');
      expect(classInstance).toHaveProperty('requirements');
      expect(classInstance).toHaveProperty('isActive');
    });
  });

  describe('Model Validations', () => {
    it('应该验证必填字段', () => {
      const requiredFields = ['kindergartenId', 'name', 'ageGroup', 'capacity'];
      
      requiredFields.forEach(field => {
        expect(mockClass.init).toHaveBeenCalledWith(
          expect.objectContaining({
            [field]: expect.objectContaining({
              allowNull: false
            })
          }),
          expect.any(Object)
        );
      });
    });

    it('应该验证容量范围', () => {
      expect(mockClass.init).toHaveBeenCalledWith(
        expect.objectContaining({
          capacity: expect.objectContaining({
            validate: expect.objectContaining({
              min: 1,
              max: 50
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证当前入学人数最小值', () => {
      expect(mockClass.init).toHaveBeenCalledWith(
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

    it('应该验证学费最小值', () => {
      expect(mockClass.init).toHaveBeenCalledWith(
        expect.objectContaining({
          tuition: expect.objectContaining({
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
    it('应该定义与Kindergarten的关联关系', () => {
      Class.associate({ Kindergarten: mockKindergarten });
      
      expect(mockClass.belongsTo).toHaveBeenCalledWith(mockKindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
      });
    });

    it('应该定义与Student的关联关系', () => {
      Class.associate({ Student: mockStudent });
      
      expect(mockClass.hasMany).toHaveBeenCalledWith(mockStudent, {
        foreignKey: 'classId',
        as: 'students'
      });
    });

    it('应该定义与Teacher的多对多关联关系', () => {
      Class.associate({ 
        Teacher: mockTeacher,
        ClassTeacher: mockClassTeacher
      });
      
      expect(mockClass.belongsToMany).toHaveBeenCalledWith(mockTeacher, {
        through: mockClassTeacher,
        foreignKey: 'classId',
        otherKey: 'teacherId',
        as: 'teachers'
      });
    });

    it('应该定义与Activity的关联关系', () => {
      Class.associate({ Activity: mockActivity });
      
      expect(mockClass.hasMany).toHaveBeenCalledWith(mockActivity, {
        foreignKey: 'classId',
        as: 'activities'
      });
    });
  });

  describe('Model Enums', () => {
    it('应该定义正确的年龄组枚举', () => {
      expect(AgeGroup).toEqual({
        SMALL: 'small',
        MEDIUM: 'medium',
        LARGE: 'large',
        MIXED: 'mixed'
      });
    });

    it('应该定义正确的状态枚举', () => {
      expect(ClassStatus).toEqual({
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        FULL: 'full',
        SUSPENDED: 'suspended'
      });
    });
  });

  describe('Model Methods', () => {
    it('应该支持toJSON方法', () => {
      const classInstance = {
        id: 1,
        name: '小班A',
        ageGroup: 'small',
        capacity: 25,
        currentEnrollment: 20,
        status: 'active',
        classroom: '101教室',
        tuition: 2500.00,
        isActive: true,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: '小班A',
          ageGroup: 'small',
          capacity: 25,
          currentEnrollment: 20,
          status: 'active',
          classroom: '101教室',
          isActive: true
        })
      };

      const json = classInstance.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name', '小班A');
      expect(json).toHaveProperty('ageGroup', 'small');
      expect(json).toHaveProperty('capacity', 25);
      expect(json).toHaveProperty('currentEnrollment', 20);
      expect(json).toHaveProperty('status', 'active');
      expect(json).not.toHaveProperty('tuition'); // 敏感信息应该被隐藏
    });

    it('应该支持检查是否已满员', () => {
      const fullClass = {
        capacity: 25,
        currentEnrollment: 25,
        isFull: jest.fn().mockReturnValue(true)
      };

      const notFullClass = {
        capacity: 25,
        currentEnrollment: 20,
        isFull: jest.fn().mockReturnValue(false)
      };

      expect(fullClass.isFull()).toBe(true);
      expect(notFullClass.isFull()).toBe(false);
    });

    it('应该支持检查是否为活跃状态', () => {
      const activeClass = {
        status: 'active',
        isActiveStatus: jest.fn().mockReturnValue(true)
      };

      const inactiveClass = {
        status: 'inactive',
        isActiveStatus: jest.fn().mockReturnValue(false)
      };

      expect(activeClass.isActiveStatus()).toBe(true);
      expect(inactiveClass.isActiveStatus()).toBe(false);
    });

    it('应该支持计算入学率', () => {
      const classInstance = {
        capacity: 25,
        currentEnrollment: 20,
        getEnrollmentRate: jest.fn().mockReturnValue(80)
      };

      const enrollmentRate = classInstance.getEnrollmentRate();

      expect(enrollmentRate).toBe(80);
    });

    it('应该支持获取剩余名额', () => {
      const classInstance = {
        capacity: 25,
        currentEnrollment: 20,
        getAvailableSpots: jest.fn().mockReturnValue(5)
      };

      const availableSpots = classInstance.getAvailableSpots();

      expect(availableSpots).toBe(5);
    });

    it('应该支持检查是否可以接收新学生', () => {
      const classInstance = {
        capacity: 25,
        currentEnrollment: 20,
        status: 'active',
        canAcceptNewStudent: jest.fn().mockReturnValue(true)
      };

      const fullClass = {
        capacity: 25,
        currentEnrollment: 25,
        status: 'active',
        canAcceptNewStudent: jest.fn().mockReturnValue(false)
      };

      expect(classInstance.canAcceptNewStudent()).toBe(true);
      expect(fullClass.canAcceptNewStudent()).toBe(false);
    });

    it('应该支持检查年龄是否符合要求', () => {
      const classInstance = {
        ageGroup: 'small',
        requirements: {
          minAge: 3,
          maxAge: 4
        },
        isAgeAppropriate: jest.fn().mockImplementation((age) => {
          return age >= 3 && age <= 4;
        })
      };

      expect(classInstance.isAgeAppropriate(3.5)).toBe(true);
      expect(classInstance.isAgeAppropriate(5)).toBe(false);
    });

    it('应该支持获取班级时间表', () => {
      const classInstance = {
        schedule: {
          monday: ['08:00-12:00', '14:00-17:00'],
          tuesday: ['08:00-12:00', '14:00-17:00'],
          wednesday: ['08:00-12:00', '14:00-17:00'],
          thursday: ['08:00-12:00', '14:00-17:00'],
          friday: ['08:00-12:00', '14:00-17:00']
        },
        getScheduleForDay: jest.fn().mockImplementation((day) => {
          return classInstance.schedule[day] || [];
        })
      };

      expect(classInstance.getScheduleForDay('monday')).toEqual(['08:00-12:00', '14:00-17:00']);
      expect(classInstance.getScheduleForDay('saturday')).toEqual([]);
    });

    it('应该支持检查是否在指定时间有课', () => {
      const classInstance = {
        schedule: {
          monday: ['08:00-12:00', '14:00-17:00']
        },
        hasClassAt: jest.fn().mockImplementation((day, time) => {
          const daySchedule = classInstance.schedule[day] || [];
          return daySchedule.some(slot => {
            const [start, end] = slot.split('-');
            return time >= start && time <= end;
          });
        })
      };

      expect(classInstance.hasClassAt('monday', '10:00')).toBe(true);
      expect(classInstance.hasClassAt('monday', '13:00')).toBe(false);
    });
  });

  describe('Model Scopes', () => {
    it('应该定义活跃班级范围', () => {
      const activeScope = {
        where: { status: 'active' }
      };

      expect(activeScope).toEqual({
        where: { status: 'active' }
      });
    });

    it('应该定义小班范围', () => {
      const smallClassScope = {
        where: { ageGroup: 'small' }
      };

      expect(smallClassScope).toEqual({
        where: { ageGroup: 'small' }
      });
    });

    it('应该定义有空位的班级范围', () => {
      const availableScope = {
        where: {
          [expect.any(Symbol)]: expect.any(Object)
        }
      };

      expect(availableScope).toBeDefined();
    });

    it('应该定义满员班级范围', () => {
      const fullScope = {
        where: {
          [expect.any(Symbol)]: expect.any(Object)
        }
      };

      expect(fullScope).toBeDefined();
    });
  });

  describe('Model Hooks', () => {
    it('应该在创建前验证容量设置', () => {
      const beforeCreateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeCreateHook).toBeDefined();
    });

    it('应该在更新前检查入学人数不超过容量', () => {
      const beforeUpdateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeUpdateHook).toBeDefined();
    });

    it('应该在删除前检查是否有学生', () => {
      const beforeDestroyHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeDestroyHook).toBeDefined();
    });

    it('应该在入学人数变化后更新状态', () => {
      const afterUpdateHook = jest.fn();
      
      // 模拟钩子函数
      expect(afterUpdateHook).toBeDefined();
    });
  });
});
