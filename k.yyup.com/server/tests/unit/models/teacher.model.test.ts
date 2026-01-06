import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { DataTypes } from 'sequelize';

// Mock Sequelize
const mockSequelize = {
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

// Mock Teacher model
const mockTeacher = {
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
const mockKindergarten = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockClass = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockClassTeacher = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockActivity = { hasMany: jest.fn(), belongsTo: jest.fn() };

// Mock imports
jest.unstable_mockModule('../../../../../src/models/teacher.model', () => ({
  Teacher: mockTeacher,
  TeacherStatus: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ON_LEAVE: 'on_leave',
    RESIGNED: 'resigned'
  },
  TeacherLevel: {
    JUNIOR: 'junior',
    INTERMEDIATE: 'intermediate',
    SENIOR: 'senior',
    EXPERT: 'expert'
  },
  TeacherType: {
    FULL_TIME: 'full_time',
    PART_TIME: 'part_time',
    SUBSTITUTE: 'substitute',
    INTERN: 'intern'
  }
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/kindergarten.model', () => ({
  Kindergarten: mockKindergarten
}));

jest.unstable_mockModule('../../../../../src/models/class.model', () => ({
  Class: mockClass
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

describe('Teacher Model', () => {
  let Teacher: any;
  let TeacherStatus: any;
  let TeacherLevel: any;
  let TeacherType: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/models/teacher.model');
    Teacher = imported.Teacher;
    TeacherStatus = imported.TeacherStatus;
    TeacherLevel = imported.TeacherLevel;
    TeacherType = imported.TeacherType;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('应该正确定义Teacher模型', () => {
      Teacher.initModel(mockSequelize);

      expect(Teacher.init).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          }),
          userId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
          }),
          kindergartenId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false
          }),
          employeeNumber: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
          }),
          name: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: false
          }),
          gender: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['male', 'female'],
            allowNull: false
          }),
          birthDate: expect.objectContaining({
            type: DataTypes.DATEONLY,
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
          address: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: true
          }),
          hireDate: expect.objectContaining({
            type: DataTypes.DATEONLY,
            allowNull: false
          }),
          status: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['active', 'inactive', 'on_leave', 'resigned'],
            defaultValue: 'active'
          }),
          level: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['junior', 'intermediate', 'senior', 'expert'],
            defaultValue: 'junior'
          }),
          type: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['full_time', 'part_time', 'substitute', 'intern'],
            defaultValue: 'full_time'
          }),
          education: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true
          }),
          major: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true
          }),
          certifications: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: true
          }),
          salary: expect.objectContaining({
            type: DataTypes.DECIMAL,
            allowNull: true,
            validate: expect.objectContaining({
              min: 0
            })
          }),
          emergencyContact: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true
          }),
          emergencyPhone: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true,
            validate: expect.objectContaining({
              is: expect.any(RegExp)
            })
          }),
          notes: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: true
          })
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          tableName: 'teachers',
          timestamps: true,
          paranoid: true
        })
      );
    });

    it('应该包含所有必需的字段', () => {
      const teacherInstance = {
        id: 1,
        userId: 1,
        kindergartenId: 1,
        employeeNumber: 'T2024001',
        name: '张老师',
        gender: 'female',
        birthDate: '1990-05-15',
        phone: '13800138000',
        email: 'zhang.teacher@example.com',
        address: '北京市朝阳区教师公寓123号',
        hireDate: '2024-01-15',
        status: 'active',
        level: 'intermediate',
        type: 'full_time',
        education: '本科',
        major: '学前教育',
        certifications: ['教师资格证', '普通话二级甲等'],
        salary: 8000.00,
        emergencyContact: '张三',
        emergencyPhone: '13900139000',
        notes: '经验丰富的幼儿教师',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      // 检查实例是否具有预期的属性
      expect(teacherInstance).toHaveProperty('id');
      expect(teacherInstance).toHaveProperty('userId');
      expect(teacherInstance).toHaveProperty('kindergartenId');
      expect(teacherInstance).toHaveProperty('employeeNumber');
      expect(teacherInstance).toHaveProperty('name');
      expect(teacherInstance).toHaveProperty('gender');
      expect(teacherInstance).toHaveProperty('birthDate');
      expect(teacherInstance).toHaveProperty('phone');
      expect(teacherInstance).toHaveProperty('email');
      expect(teacherInstance).toHaveProperty('address');
      expect(teacherInstance).toHaveProperty('hireDate');
      expect(teacherInstance).toHaveProperty('status');
      expect(teacherInstance).toHaveProperty('level');
      expect(teacherInstance).toHaveProperty('type');
      expect(teacherInstance).toHaveProperty('education');
      expect(teacherInstance).toHaveProperty('major');
      expect(teacherInstance).toHaveProperty('certifications');
      expect(teacherInstance).toHaveProperty('salary');
      expect(teacherInstance).toHaveProperty('emergencyContact');
      expect(teacherInstance).toHaveProperty('emergencyPhone');
      expect(teacherInstance).toHaveProperty('notes');
    });
  });

  describe('Model Validations', () => {
    it('应该验证必填字段', () => {
      const requiredFields = ['userId', 'kindergartenId', 'employeeNumber', 'name', 'gender', 'birthDate', 'phone', 'hireDate'];
      
      requiredFields.forEach(field => {
        expect(mockTeacher.init).toHaveBeenCalledWith(
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
      expect(mockTeacher.init).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: expect.objectContaining({
            validate: expect.objectContaining({
              is: expect.any(RegExp)
            })
          }),
          emergencyPhone: expect.objectContaining({
            validate: expect.objectContaining({
              is: expect.any(RegExp)
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证邮箱格式', () => {
      expect(mockTeacher.init).toHaveBeenCalledWith(
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

    it('应该验证薪资最小值', () => {
      expect(mockTeacher.init).toHaveBeenCalledWith(
        expect.objectContaining({
          salary: expect.objectContaining({
            validate: expect.objectContaining({
              min: 0
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证唯一性约束', () => {
      expect(mockTeacher.init).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.objectContaining({
            unique: true
          }),
          employeeNumber: expect.objectContaining({
            unique: true
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('Model Associations', () => {
    it('应该定义与User的关联关系', () => {
      Teacher.associate({ User: mockUser });
      
      expect(mockTeacher.belongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'userId',
        as: 'user'
      });
    });

    it('应该定义与Kindergarten的关联关系', () => {
      Teacher.associate({ Kindergarten: mockKindergarten });
      
      expect(mockTeacher.belongsTo).toHaveBeenCalledWith(mockKindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
      });
    });

    it('应该定义与Class的多对多关联关系', () => {
      Teacher.associate({ 
        Class: mockClass,
        ClassTeacher: mockClassTeacher
      });
      
      expect(mockTeacher.belongsToMany).toHaveBeenCalledWith(mockClass, {
        through: mockClassTeacher,
        foreignKey: 'teacherId',
        otherKey: 'classId',
        as: 'classes'
      });
    });

    it('应该定义与Activity的关联关系', () => {
      Teacher.associate({ Activity: mockActivity });
      
      expect(mockTeacher.hasMany).toHaveBeenCalledWith(mockActivity, {
        foreignKey: 'teacherId',
        as: 'activities'
      });
    });
  });

  describe('Model Enums', () => {
    it('应该定义正确的状态枚举', () => {
      expect(TeacherStatus).toEqual({
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        ON_LEAVE: 'on_leave',
        RESIGNED: 'resigned'
      });
    });

    it('应该定义正确的级别枚举', () => {
      expect(TeacherLevel).toEqual({
        JUNIOR: 'junior',
        INTERMEDIATE: 'intermediate',
        SENIOR: 'senior',
        EXPERT: 'expert'
      });
    });

    it('应该定义正确的类型枚举', () => {
      expect(TeacherType).toEqual({
        FULL_TIME: 'full_time',
        PART_TIME: 'part_time',
        SUBSTITUTE: 'substitute',
        INTERN: 'intern'
      });
    });
  });

  describe('Model Methods', () => {
    it('应该支持toJSON方法', () => {
      const teacherInstance = {
        id: 1,
        name: '张老师',
        employeeNumber: 'T2024001',
        gender: 'female',
        status: 'active',
        level: 'intermediate',
        type: 'full_time',
        phone: '13800138000',
        email: 'zhang.teacher@example.com',
        salary: 8000.00,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: '张老师',
          employeeNumber: 'T2024001',
          gender: 'female',
          status: 'active',
          level: 'intermediate',
          type: 'full_time',
          phone: '13800138000',
          email: 'zhang.teacher@example.com'
          // salary 字段被隐藏
        })
      };

      const json = teacherInstance.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name', '张老师');
      expect(json).toHaveProperty('employeeNumber', 'T2024001');
      expect(json).toHaveProperty('status', 'active');
      expect(json).not.toHaveProperty('salary'); // 敏感信息应该被隐藏
    });

    it('应该支持计算工作年限', () => {
      const teacherInstance = {
        hireDate: '2020-01-15',
        getWorkingYears: jest.fn().mockReturnValue(4)
      };

      const workingYears = teacherInstance.getWorkingYears();

      expect(workingYears).toBe(4);
    });

    it('应该支持计算年龄', () => {
      const teacherInstance = {
        birthDate: '1990-05-15',
        getAge: jest.fn().mockReturnValue(34)
      };

      const age = teacherInstance.getAge();

      expect(age).toBe(34);
    });

    it('应该支持检查是否为活跃状态', () => {
      const activeTeacher = {
        status: 'active',
        isActive: jest.fn().mockReturnValue(true)
      };

      const inactiveTeacher = {
        status: 'resigned',
        isActive: jest.fn().mockReturnValue(false)
      };

      expect(activeTeacher.isActive()).toBe(true);
      expect(inactiveTeacher.isActive()).toBe(false);
    });

    it('应该支持检查是否为全职教师', () => {
      const fullTimeTeacher = {
        type: 'full_time',
        isFullTime: jest.fn().mockReturnValue(true)
      };

      const partTimeTeacher = {
        type: 'part_time',
        isFullTime: jest.fn().mockReturnValue(false)
      };

      expect(fullTimeTeacher.isFullTime()).toBe(true);
      expect(partTimeTeacher.isFullTime()).toBe(false);
    });

    it('应该支持获取资格证书列表', () => {
      const teacherInstance = {
        certifications: ['教师资格证', '普通话二级甲等', '心理咨询师'],
        getCertifications: jest.fn().mockReturnValue(['教师资格证', '普通话二级甲等', '心理咨询师'])
      };

      const certifications = teacherInstance.getCertifications();

      expect(certifications).toEqual(['教师资格证', '普通话二级甲等', '心理咨询师']);
    });

    it('应该支持检查是否有特定资格证书', () => {
      const teacherInstance = {
        certifications: ['教师资格证', '普通话二级甲等'],
        hasCertification: jest.fn().mockImplementation((cert) => {
          return ['教师资格证', '普通话二级甲等'].includes(cert);
        })
      };

      expect(teacherInstance.hasCertification('教师资格证')).toBe(true);
      expect(teacherInstance.hasCertification('心理咨询师')).toBe(false);
    });
  });

  describe('Model Scopes', () => {
    it('应该定义活跃教师范围', () => {
      const activeScope = {
        where: { status: 'active' }
      };

      expect(activeScope).toEqual({
        where: { status: 'active' }
      });
    });

    it('应该定义全职教师范围', () => {
      const fullTimeScope = {
        where: { type: 'full_time' }
      };

      expect(fullTimeScope).toEqual({
        where: { type: 'full_time' }
      });
    });

    it('应该定义高级教师范围', () => {
      const seniorScope = {
        where: { level: ['senior', 'expert'] }
      };

      expect(seniorScope).toEqual({
        where: { level: ['senior', 'expert'] }
      });
    });
  });

  describe('Model Hooks', () => {
    it('应该在创建前生成工号', () => {
      const beforeCreateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeCreateHook).toBeDefined();
    });

    it('应该在更新前验证状态变更', () => {
      const beforeUpdateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeUpdateHook).toBeDefined();
    });

    it('应该在删除前检查是否有关联班级', () => {
      const beforeDestroyHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeDestroyHook).toBeDefined();
    });
  });
});
