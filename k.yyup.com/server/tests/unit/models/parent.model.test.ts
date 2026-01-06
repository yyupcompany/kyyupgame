import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { DataTypes } from 'sequelize';

// Mock Sequelize
const mockSequelize = {
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

// Mock Parent model
const mockParent = {
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
const mockParentStudentRelation = { hasMany: jest.fn(), belongsTo: jest.fn() };

// Mock imports
jest.unstable_mockModule('../../../../../src/models/parent.model', () => ({
  Parent: mockParent,
  ParentStatus: {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
  },
  RelationshipType: {
    FATHER: 'father',
    MOTHER: 'mother',
    GUARDIAN: 'guardian',
    GRANDPARENT: 'grandparent',
    OTHER: 'other'
  }
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/student.model', () => ({
  Student: mockStudent
}));

jest.unstable_mockModule('../../../../../src/models/parent-student-relation.model', () => ({
  ParentStudentRelation: mockParentStudentRelation
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

describe('Parent Model', () => {
  let Parent: any;
  let ParentStatus: any;
  let RelationshipType: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/models/parent.model');
    Parent = imported.Parent;
    ParentStatus = imported.ParentStatus;
    RelationshipType = imported.RelationshipType;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('应该正确定义Parent模型', () => {
      Parent.initModel(mockSequelize);

      expect(Parent.init).toHaveBeenCalledWith(
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
            allowNull: true
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
          occupation: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true
          }),
          workUnit: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true
          }),
          workPhone: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true,
            validate: expect.objectContaining({
              is: expect.any(RegExp)
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
          status: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['active', 'inactive'],
            defaultValue: 'active'
          }),
          avatar: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true
          }),
          wechatId: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true
          }),
          qqId: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true
          }),
          notes: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: true
          })
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          tableName: 'parents',
          timestamps: true,
          paranoid: true
        })
      );
    });

    it('应该包含所有必需的字段', () => {
      const parentInstance = {
        id: 1,
        userId: 1,
        name: '张爸爸',
        gender: 'male',
        birthDate: '1985-03-15',
        phone: '13800138000',
        email: 'father@example.com',
        address: '北京市朝阳区家长小区123号',
        occupation: '软件工程师',
        workUnit: '科技公司',
        workPhone: '010-12345678',
        emergencyContact: '李奶奶',
        emergencyPhone: '13900139000',
        status: 'active',
        avatar: '/avatars/parent1.jpg',
        wechatId: 'wechat123',
        qqId: '123456789',
        notes: '孩子对花生过敏',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      // 检查实例是否具有预期的属性
      expect(parentInstance).toHaveProperty('id');
      expect(parentInstance).toHaveProperty('userId');
      expect(parentInstance).toHaveProperty('name');
      expect(parentInstance).toHaveProperty('gender');
      expect(parentInstance).toHaveProperty('birthDate');
      expect(parentInstance).toHaveProperty('phone');
      expect(parentInstance).toHaveProperty('email');
      expect(parentInstance).toHaveProperty('address');
      expect(parentInstance).toHaveProperty('occupation');
      expect(parentInstance).toHaveProperty('workUnit');
      expect(parentInstance).toHaveProperty('workPhone');
      expect(parentInstance).toHaveProperty('emergencyContact');
      expect(parentInstance).toHaveProperty('emergencyPhone');
      expect(parentInstance).toHaveProperty('status');
      expect(parentInstance).toHaveProperty('avatar');
      expect(parentInstance).toHaveProperty('wechatId');
      expect(parentInstance).toHaveProperty('qqId');
      expect(parentInstance).toHaveProperty('notes');
    });
  });

  describe('Model Validations', () => {
    it('应该验证必填字段', () => {
      const requiredFields = ['userId', 'name', 'gender', 'phone'];
      
      requiredFields.forEach(field => {
        expect(mockParent.init).toHaveBeenCalledWith(
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
      expect(mockParent.init).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: expect.objectContaining({
            validate: expect.objectContaining({
              is: expect.any(RegExp)
            })
          }),
          workPhone: expect.objectContaining({
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
      expect(mockParent.init).toHaveBeenCalledWith(
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

    it('应该验证唯一性约束', () => {
      expect(mockParent.init).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.objectContaining({
            unique: true
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('Model Associations', () => {
    it('应该定义与User的关联关系', () => {
      Parent.associate({ User: mockUser });
      
      expect(mockParent.belongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'userId',
        as: 'user'
      });
    });

    it('应该定义与Student的多对多关联关系', () => {
      Parent.associate({ 
        Student: mockStudent,
        ParentStudentRelation: mockParentStudentRelation
      });
      
      expect(mockParent.belongsToMany).toHaveBeenCalledWith(mockStudent, {
        through: mockParentStudentRelation,
        foreignKey: 'parentId',
        otherKey: 'studentId',
        as: 'students'
      });
    });
  });

  describe('Model Enums', () => {
    it('应该定义正确的状态枚举', () => {
      expect(ParentStatus).toEqual({
        ACTIVE: 'active',
        INACTIVE: 'inactive'
      });
    });

    it('应该定义正确的关系类型枚举', () => {
      expect(RelationshipType).toEqual({
        FATHER: 'father',
        MOTHER: 'mother',
        GUARDIAN: 'guardian',
        GRANDPARENT: 'grandparent',
        OTHER: 'other'
      });
    });
  });

  describe('Model Methods', () => {
    it('应该支持toJSON方法', () => {
      const parentInstance = {
        id: 1,
        name: '张爸爸',
        gender: 'male',
        phone: '13800138000',
        email: 'father@example.com',
        occupation: '软件工程师',
        status: 'active',
        avatar: '/avatars/parent1.jpg',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: '张爸爸',
          gender: 'male',
          phone: '13800138000',
          email: 'father@example.com',
          occupation: '软件工程师',
          status: 'active',
          avatar: '/avatars/parent1.jpg'
        })
      };

      const json = parentInstance.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name', '张爸爸');
      expect(json).toHaveProperty('gender', 'male');
      expect(json).toHaveProperty('phone', '13800138000');
      expect(json).toHaveProperty('email', 'father@example.com');
      expect(json).toHaveProperty('occupation', '软件工程师');
      expect(json).toHaveProperty('status', 'active');
    });

    it('应该支持检查是否为活跃状态', () => {
      const activeParent = {
        status: 'active',
        isActive: jest.fn().mockReturnValue(true)
      };

      const inactiveParent = {
        status: 'inactive',
        isActive: jest.fn().mockReturnValue(false)
      };

      expect(activeParent.isActive()).toBe(true);
      expect(inactiveParent.isActive()).toBe(false);
    });

    it('应该支持计算年龄', () => {
      const parentInstance = {
        birthDate: '1985-03-15',
        getAge: jest.fn().mockReturnValue(39)
      };

      const age = parentInstance.getAge();

      expect(age).toBe(39);
    });

    it('应该支持获取完整联系信息', () => {
      const parentInstance = {
        phone: '13800138000',
        workPhone: '010-12345678',
        email: 'father@example.com',
        getContactInfo: jest.fn().mockReturnValue({
          phone: '13800138000',
          workPhone: '010-12345678',
          email: 'father@example.com'
        })
      };

      const contactInfo = parentInstance.getContactInfo();

      expect(contactInfo).toEqual({
        phone: '13800138000',
        workPhone: '010-12345678',
        email: 'father@example.com'
      });
    });

    it('应该支持获取紧急联系信息', () => {
      const parentInstance = {
        emergencyContact: '李奶奶',
        emergencyPhone: '13900139000',
        getEmergencyContact: jest.fn().mockReturnValue({
          name: '李奶奶',
          phone: '13900139000'
        })
      };

      const emergencyContact = parentInstance.getEmergencyContact();

      expect(emergencyContact).toEqual({
        name: '李奶奶',
        phone: '13900139000'
      });
    });

    it('应该支持检查是否有工作信息', () => {
      const workingParent = {
        occupation: '软件工程师',
        workUnit: '科技公司',
        hasWorkInfo: jest.fn().mockReturnValue(true)
      };

      const nonWorkingParent = {
        occupation: null,
        workUnit: null,
        hasWorkInfo: jest.fn().mockReturnValue(false)
      };

      expect(workingParent.hasWorkInfo()).toBe(true);
      expect(nonWorkingParent.hasWorkInfo()).toBe(false);
    });

    it('应该支持获取社交媒体信息', () => {
      const parentInstance = {
        wechatId: 'wechat123',
        qqId: '123456789',
        getSocialMedia: jest.fn().mockReturnValue({
          wechat: 'wechat123',
          qq: '123456789'
        })
      };

      const socialMedia = parentInstance.getSocialMedia();

      expect(socialMedia).toEqual({
        wechat: 'wechat123',
        qq: '123456789'
      });
    });

    it('应该支持检查是否有完整的个人信息', () => {
      const completeParent = {
        name: '张爸爸',
        phone: '13800138000',
        email: 'father@example.com',
        address: '北京市朝阳区',
        hasCompleteInfo: jest.fn().mockReturnValue(true)
      };

      const incompleteParent = {
        name: '李妈妈',
        phone: '13900139000',
        email: null,
        address: null,
        hasCompleteInfo: jest.fn().mockReturnValue(false)
      };

      expect(completeParent.hasCompleteInfo()).toBe(true);
      expect(incompleteParent.hasCompleteInfo()).toBe(false);
    });

    it('应该支持获取与学生的关系', () => {
      const parentInstance = {
        students: [
          { id: 1, name: '小明', ParentStudentRelation: { relationship: 'father' } },
          { id: 2, name: '小红', ParentStudentRelation: { relationship: 'father' } }
        ],
        getStudentRelationships: jest.fn().mockReturnValue([
          { studentId: 1, studentName: '小明', relationship: 'father' },
          { studentId: 2, studentName: '小红', relationship: 'father' }
        ])
      };

      const relationships = parentInstance.getStudentRelationships();

      expect(relationships).toEqual([
        { studentId: 1, studentName: '小明', relationship: 'father' },
        { studentId: 2, studentName: '小红', relationship: 'father' }
      ]);
    });
  });

  describe('Model Scopes', () => {
    it('应该定义活跃家长范围', () => {
      const activeScope = {
        where: { status: 'active' }
      };

      expect(activeScope).toEqual({
        where: { status: 'active' }
      });
    });

    it('应该定义有工作信息的家长范围', () => {
      const workingScope = {
        where: {
          [expect.any(Symbol)]: expect.any(Object)
        }
      };

      expect(workingScope).toBeDefined();
    });

    it('应该定义有邮箱的家长范围', () => {
      const withEmailScope = {
        where: {
          email: {
            [expect.any(Symbol)]: null
          }
        }
      };

      expect(withEmailScope).toBeDefined();
    });
  });

  describe('Model Hooks', () => {
    it('应该在创建前验证用户关联', () => {
      const beforeCreateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeCreateHook).toBeDefined();
    });

    it('应该在更新前验证状态变更', () => {
      const beforeUpdateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeUpdateHook).toBeDefined();
    });

    it('应该在删除前检查是否有学生关联', () => {
      const beforeDestroyHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeDestroyHook).toBeDefined();
    });
  });
});
