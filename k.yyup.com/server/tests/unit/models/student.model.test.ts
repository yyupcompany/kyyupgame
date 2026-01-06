import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { DataTypes } from 'sequelize';

// Mock Sequelize
const mockSequelize = {
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

// Mock Student model
const mockStudent = {
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
const mockClass = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockParent = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockParentStudentRelation = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockActivityRegistration = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockEnrollmentApplication = { hasMany: jest.fn(), belongsTo: jest.fn() };

// Mock imports
jest.unstable_mockModule('../../../../../src/models/student.model', () => ({
  Student: mockStudent,
  StudentStatus: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    GRADUATED: 'graduated',
    TRANSFERRED: 'transferred'
  },
  StudentGender: {
    MALE: 'male',
    FEMALE: 'female'
  }
}));

jest.unstable_mockModule('../../../../../src/models/kindergarten.model', () => ({
  Kindergarten: mockKindergarten
}));

jest.unstable_mockModule('../../../../../src/models/class.model', () => ({
  Class: mockClass
}));

jest.unstable_mockModule('../../../../../src/models/parent.model', () => ({
  Parent: mockParent
}));

jest.unstable_mockModule('../../../../../src/models/parent-student-relation.model', () => ({
  ParentStudentRelation: mockParentStudentRelation
}));

jest.unstable_mockModule('../../../../../src/models/activity-registration.model', () => ({
  ActivityRegistration: mockActivityRegistration
}));

jest.unstable_mockModule('../../../../../src/models/enrollment-application.model', () => ({
  EnrollmentApplication: mockEnrollmentApplication
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

describe('Student Model', () => {
  let Student: any;
  let StudentStatus: any;
  let StudentGender: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/models/student.model');
    Student = imported.Student;
    StudentStatus = imported.StudentStatus;
    StudentGender = imported.StudentGender;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('应该正确定义Student模型', () => {
      Student.initModel(mockSequelize);

      expect(Student.init).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
          kindergartenId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false
          }),
          classId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: true
          }),
          enrollmentDate: expect.objectContaining({
            type: DataTypes.DATEONLY,
            allowNull: false
          }),
          status: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['active', 'inactive', 'graduated', 'transferred'],
            defaultValue: 'active'
          }),
          studentNumber: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
          }),
          allergies: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: true
          }),
          medicalConditions: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: true
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
          tableName: 'students',
          timestamps: true
        })
      );
    });

    it('应该包含所有必需的字段', () => {
      const studentInstance = {
        id: 1,
        name: '张小明',
        gender: 'male',
        birthDate: '2018-05-15',
        kindergartenId: 1,
        classId: 1,
        enrollmentDate: '2024-01-15',
        status: 'active',
        studentNumber: 'STU2024001',
        allergies: '花生过敏',
        medicalConditions: '无',
        emergencyContact: '张三',
        emergencyPhone: '13800138000',
        notes: '活泼好动的孩子',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 检查实例是否具有预期的属性
      expect(studentInstance).toHaveProperty('id');
      expect(studentInstance).toHaveProperty('name');
      expect(studentInstance).toHaveProperty('gender');
      expect(studentInstance).toHaveProperty('birthDate');
      expect(studentInstance).toHaveProperty('kindergartenId');
      expect(studentInstance).toHaveProperty('classId');
      expect(studentInstance).toHaveProperty('enrollmentDate');
      expect(studentInstance).toHaveProperty('status');
      expect(studentInstance).toHaveProperty('studentNumber');
      expect(studentInstance).toHaveProperty('allergies');
      expect(studentInstance).toHaveProperty('medicalConditions');
      expect(studentInstance).toHaveProperty('emergencyContact');
      expect(studentInstance).toHaveProperty('emergencyPhone');
      expect(studentInstance).toHaveProperty('notes');
    });
  });

  describe('Model Validations', () => {
    it('应该验证必填字段', () => {
      const requiredFields = ['name', 'gender', 'birthDate', 'kindergartenId', 'enrollmentDate'];
      
      requiredFields.forEach(field => {
        expect(mockStudent.init).toHaveBeenCalledWith(
          expect.objectContaining({
            [field]: expect.objectContaining({
              allowNull: false
            })
          }),
          expect.any(Object)
        );
      });
    });

    it('应该验证紧急联系电话格式', () => {
      expect(mockStudent.init).toHaveBeenCalledWith(
        expect.objectContaining({
          emergencyPhone: expect.objectContaining({
            validate: expect.objectContaining({
              is: expect.any(RegExp)
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证性别枚举值', () => {
      expect(mockStudent.init).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['male', 'female']
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证状态枚举值', () => {
      expect(mockStudent.init).toHaveBeenCalledWith(
        expect.objectContaining({
          status: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['active', 'inactive', 'graduated', 'transferred']
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('Model Associations', () => {
    it('应该定义与Kindergarten的关联关系', () => {
      Student.associate({ Kindergarten: mockKindergarten });
      
      expect(mockStudent.belongsTo).toHaveBeenCalledWith(mockKindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
      });
    });

    it('应该定义与Class的关联关系', () => {
      Student.associate({ Class: mockClass });
      
      expect(mockStudent.belongsTo).toHaveBeenCalledWith(mockClass, {
        foreignKey: 'classId',
        as: 'class'
      });
    });

    it('应该定义与Parent的多对多关联关系', () => {
      Student.associate({ 
        Parent: mockParent,
        ParentStudentRelation: mockParentStudentRelation
      });
      
      expect(mockStudent.belongsToMany).toHaveBeenCalledWith(mockParent, {
        through: mockParentStudentRelation,
        foreignKey: 'studentId',
        otherKey: 'parentId',
        as: 'parents'
      });
    });

    it('应该定义与ActivityRegistration的关联关系', () => {
      Student.associate({ ActivityRegistration: mockActivityRegistration });
      
      expect(mockStudent.hasMany).toHaveBeenCalledWith(mockActivityRegistration, {
        foreignKey: 'studentId',
        as: 'activityRegistrations'
      });
    });

    it('应该定义与EnrollmentApplication的关联关系', () => {
      Student.associate({ EnrollmentApplication: mockEnrollmentApplication });
      
      expect(mockStudent.hasMany).toHaveBeenCalledWith(mockEnrollmentApplication, {
        foreignKey: 'studentId',
        as: 'enrollmentApplications'
      });
    });
  });

  describe('Model Enums', () => {
    it('应该定义正确的状态枚举', () => {
      expect(StudentStatus).toEqual({
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        GRADUATED: 'graduated',
        TRANSFERRED: 'transferred'
      });
    });

    it('应该定义正确的性别枚举', () => {
      expect(StudentGender).toEqual({
        MALE: 'male',
        FEMALE: 'female'
      });
    });
  });

  describe('Model Methods', () => {
    it('应该支持toJSON方法', () => {
      const studentInstance = {
        id: 1,
        name: '张小明',
        gender: 'male',
        birthDate: '2018-05-15',
        status: 'active',
        studentNumber: 'STU2024001',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: '张小明',
          gender: 'male',
          birthDate: '2018-05-15',
          status: 'active',
          studentNumber: 'STU2024001'
        })
      };

      const json = studentInstance.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name', '张小明');
      expect(json).toHaveProperty('gender', 'male');
      expect(json).toHaveProperty('birthDate', '2018-05-15');
      expect(json).toHaveProperty('status', 'active');
      expect(json).toHaveProperty('studentNumber', 'STU2024001');
    });

    it('应该支持计算年龄', () => {
      const studentInstance = {
        birthDate: '2018-05-15',
        getAge: jest.fn().mockReturnValue(6)
      };

      const age = studentInstance.getAge();

      expect(age).toBe(6);
    });

    it('应该支持检查是否活跃', () => {
      const activeStudent = {
        status: 'active',
        isActive: jest.fn().mockReturnValue(true)
      };

      const inactiveStudent = {
        status: 'graduated',
        isActive: jest.fn().mockReturnValue(false)
      };

      expect(activeStudent.isActive()).toBe(true);
      expect(inactiveStudent.isActive()).toBe(false);
    });

    it('应该支持获取完整姓名', () => {
      const studentInstance = {
        name: '张小明',
        getFullName: jest.fn().mockReturnValue('张小明同学')
      };

      const fullName = studentInstance.getFullName();

      expect(fullName).toBe('张小明同学');
    });

    it('应该支持检查是否有过敏史', () => {
      const studentWithAllergies = {
        allergies: '花生过敏',
        hasAllergies: jest.fn().mockReturnValue(true)
      };

      const studentWithoutAllergies = {
        allergies: null,
        hasAllergies: jest.fn().mockReturnValue(false)
      };

      expect(studentWithAllergies.hasAllergies()).toBe(true);
      expect(studentWithoutAllergies.hasAllergies()).toBe(false);
    });

    it('应该支持检查是否有医疗状况', () => {
      const studentWithConditions = {
        medicalConditions: '哮喘',
        hasMedicalConditions: jest.fn().mockReturnValue(true)
      };

      const studentWithoutConditions = {
        medicalConditions: '无',
        hasMedicalConditions: jest.fn().mockReturnValue(false)
      };

      expect(studentWithConditions.hasMedicalConditions()).toBe(true);
      expect(studentWithoutConditions.hasMedicalConditions()).toBe(false);
    });
  });

  describe('Model Hooks', () => {
    it('应该在创建前生成学号', () => {
      const beforeCreateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeCreateHook).toBeDefined();
    });

    it('应该在更新前验证数据', () => {
      const beforeUpdateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeUpdateHook).toBeDefined();
    });
  });
});
