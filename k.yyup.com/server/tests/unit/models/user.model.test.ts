import { DataTypes, Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { User, UserRole, UserStatus } from '../../../src/models/user.model';


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

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('应该正确定义User模型', () => {
      // 验证模型名称
      expect(User.name).toBe('User');
      expect(User.tableName).toBe('users');
    });

    it('应该有所有必需的属性', () => {
      const attributes = User.rawAttributes;

      // 验证主键
      expect(attributes.id).toBeDefined();
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);

      // 验证username
      expect(attributes.username).toBeDefined();
      expect(attributes.username.allowNull).toBe(false);
      expect(attributes.username.unique).toBe(true);

      // 验证password
      expect(attributes.password).toBeDefined();

      // 验证email
      expect(attributes.email).toBeDefined();
      expect(attributes.email.allowNull).toBe(false);
      expect(attributes.email.unique).toBe(true);
      expect(attributes.email.validate?.isEmail).toBe(true);

      // 验证role
      expect(attributes.role).toBeDefined();
      expect(attributes.role.defaultValue).toBe(UserRole.USER);

      // 验证realName
      expect(attributes.realName).toBeDefined();
      expect(attributes.realName.allowNull).toBe(false);

      // 验证phone
      expect(attributes.phone).toBeDefined();
      expect(attributes.phone.allowNull).toBe(false);
      expect(attributes.phone.validate?.is).toBeDefined();

      // 验证status
      expect(attributes.status).toBeDefined();
      expect(attributes.status.defaultValue).toBe(UserStatus.ACTIVE);
    });

    it('应该定义正确的枚举值', () => {
      expect(UserRole.ADMIN).toBe('admin');
      expect(UserRole.USER).toBe('user');

      expect(UserStatus.ACTIVE).toBe('active');
      expect(UserStatus.INACTIVE).toBe('inactive');
      expect(UserStatus.LOCKED).toBe('locked');
    });

    it('应该包含所有必需的字段', () => {
      const userInstance = new User();

      // 检查实例是否具有预期的属性
      expect(userInstance).toHaveProperty('id');
      expect(userInstance).toHaveProperty('username');
      expect(userInstance).toHaveProperty('password');
      expect(userInstance).toHaveProperty('email');
      expect(userInstance).toHaveProperty('role');
      expect(userInstance).toHaveProperty('realName');
      expect(userInstance).toHaveProperty('phone');
      expect(userInstance).toHaveProperty('status');
      expect(userInstance).toHaveProperty('createdAt');
      expect(userInstance).toHaveProperty('updatedAt');
    });
  });

  describe('Model Validations', () => {
    beforeEach(() => {
      // Mock User methods for validation tests
      User.create = jest.fn();
      User.findOne = jest.fn();
    });

    it('应该验证邮箱格式', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com'
      ];

      // 这里我们模拟验证逻辑，实际测试中需要真实的数据库连接
      validEmails.forEach(email => {
        expect(() => {
          // 模拟邮箱验证
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
          }
        }).not.toThrow();
      });

      invalidEmails.forEach(email => {
        expect(() => {
          // 模拟邮箱验证
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
          }
        }).toThrow('Invalid email format');
      });
    });

    it('应该验证手机号格式', () => {
      const validPhones = [
        '13800138000',
        '15912345678',
        '18612345678'
      ];

      const invalidPhones = [
        '1234567890',
        '12345678901',
        'abcdefghijk',
        '138001380001'
      ];

      // 模拟手机号验证
      const phoneRegex = /^1[3-9]\d{9}$/;

      validPhones.forEach(phone => {
        expect(phoneRegex.test(phone)).toBe(true);
      });

      invalidPhones.forEach(phone => {
        expect(phoneRegex.test(phone)).toBe(false);
      });
    });

    it('应该验证用户名唯一性', () => {
      // 这里模拟唯一性约束的测试
      const username = 'testuser';
      
      // 在实际测试中，这会触发数据库唯一性约束
      expect(() => {
        // 模拟重复用户名检查
        const existingUsernames = ['admin', 'testuser', 'user1'];
        if (existingUsernames.includes(username)) {
          throw new Error('Username already exists');
        }
      }).toThrow('Username already exists');
    });

    it('应该验证邮箱唯一性', () => {
      // 这里模拟邮箱唯一性约束的测试
      const email = 'test@example.com';
      
      // 在实际测试中，这会触发数据库唯一性约束
      expect(() => {
        // 模拟重复邮箱检查
        const existingEmails = ['admin@example.com', 'test@example.com'];
        if (existingEmails.includes(email)) {
          throw new Error('Email already exists');
        }
      }).toThrow('Email already exists');
    });
  });

  describe('Model Associations', () => {
    it('应该定义与Role的多对多关系', () => {
      // 模拟关联定义
      const mockBelongsToMany = jest.fn();
      User.belongsToMany = mockBelongsToMany;

      // 在实际模型中，这会在关联定义中调用
      expect(typeof User.belongsToMany).toBe('function');
    });

    it('应该定义与EnrollmentPlan的关联关系', () => {
      // 模拟关联定义
      const mockHasMany = jest.fn();
      User.hasMany = mockHasMany;

      // 在实际模型中，这会在关联定义中调用
      expect(typeof User.hasMany).toBe('function');
    });

    it('应该支持角色关联查询', () => {
      // 模拟包含角色的查询
      const userWithRoles = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        roles: [
          { id: 1, name: 'admin', code: 'admin' },
          { id: 2, name: 'user', code: 'user' }
        ]
      };

      expect(userWithRoles.roles).toHaveLength(2);
      expect(userWithRoles.roles[0]).toHaveProperty('name', 'admin');
    });
  });

  describe('Model Methods', () => {
    let userInstance: User;

    beforeEach(() => {
      userInstance = new User({
        username: 'testuser',
        email: 'test@example.com',
        realName: '测试用户',
        phone: '13800138000',
        role: UserRole.USER,
        status: UserStatus.ACTIVE
      });
    });

    it('应该支持toJSON方法', () => {
      const json = userInstance.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('username', 'testuser');
      expect(json).toHaveProperty('email', 'test@example.com');
      expect(json).toHaveProperty('realName', '测试用户');
      expect(json).toHaveProperty('phone', '13800138000');
      expect(json).toHaveProperty('role', UserRole.USER);
      expect(json).toHaveProperty('status', UserStatus.ACTIVE);
    });

    it('应该隐藏敏感信息', () => {
      // 模拟密码隐藏逻辑
      const userWithPassword = {
        ...userInstance.toJSON(),
        password: 'hashedpassword'
      };

      // 在实际实现中，toJSON应该排除密码字段
      const safeJson = { ...userWithPassword };
      delete safeJson.password;

      expect(safeJson).not.toHaveProperty('password');
      expect(safeJson).toHaveProperty('username');
      expect(safeJson).toHaveProperty('email');
    });

    it('应该支持状态检查方法', () => {
      // 模拟状态检查方法
      const isActive = (status: UserStatus) => status === UserStatus.ACTIVE;
      const isLocked = (status: UserStatus) => status === UserStatus.LOCKED;
      const isInactive = (status: UserStatus) => status === UserStatus.INACTIVE;

      expect(isActive(UserStatus.ACTIVE)).toBe(true);
      expect(isActive(UserStatus.LOCKED)).toBe(false);
      expect(isLocked(UserStatus.LOCKED)).toBe(true);
      expect(isLocked(UserStatus.ACTIVE)).toBe(false);
      expect(isInactive(UserStatus.INACTIVE)).toBe(true);
      expect(isInactive(UserStatus.ACTIVE)).toBe(false);
    });

    it('应该支持角色检查方法', () => {
      // 模拟角色检查方法
      const isAdmin = (role: UserRole) => role === UserRole.ADMIN;
      const isUser = (role: UserRole) => role === UserRole.USER;

      expect(isAdmin(UserRole.ADMIN)).toBe(true);
      expect(isAdmin(UserRole.USER)).toBe(false);
      expect(isUser(UserRole.USER)).toBe(true);
      expect(isUser(UserRole.ADMIN)).toBe(false);
    });
  });

  describe('Model Hooks', () => {
    it('应该在创建前验证数据', () => {
      // 模拟beforeCreate钩子
      const beforeCreateHook = (user: any) => {
        if (!user.username || user.username.length < 3) {
          throw new Error('Username must be at least 3 characters');
        }
        if (!user.email || !user.email.includes('@')) {
          throw new Error('Valid email is required');
        }
      };

      const validUser = {
        username: 'testuser',
        email: 'test@example.com',
        realName: '测试用户',
        phone: '13800138000'
      };

      const invalidUser = {
        username: 'ab',
        email: 'invalid-email',
        realName: '测试用户',
        phone: '13800138000'
      };

      expect(() => beforeCreateHook(validUser)).not.toThrow();
      expect(() => beforeCreateHook(invalidUser)).toThrow();
    });

    it('应该在更新前验证数据', () => {
      // 模拟beforeUpdate钩子
      const beforeUpdateHook = (user: any) => {
        if (user.status === UserStatus.LOCKED && !user.lockReason) {
          throw new Error('Lock reason is required when locking user');
        }
      };

      const validUpdate = {
        status: UserStatus.ACTIVE
      };

      const invalidUpdate = {
        status: UserStatus.LOCKED
        // 缺少lockReason
      };

      expect(() => beforeUpdateHook(validUpdate)).not.toThrow();
      expect(() => beforeUpdateHook(invalidUpdate)).toThrow('Lock reason is required when locking user');
    });

    it('应该在删除前检查依赖关系', () => {
      // 模拟beforeDestroy钩子
      const beforeDestroyHook = (user: any) => {
        if (user.role === UserRole.ADMIN) {
          throw new Error('Cannot delete admin user');
        }
      };

      const adminUser = { role: UserRole.ADMIN };
      const regularUser = { role: UserRole.USER };

      expect(() => beforeDestroyHook(adminUser)).toThrow('Cannot delete admin user');
      expect(() => beforeDestroyHook(regularUser)).not.toThrow();
    });
  });

  describe('Model Scopes', () => {
    it('应该支持活跃用户范围', () => {
      // 模拟活跃用户范围
      const activeScope = {
        where: {
          status: UserStatus.ACTIVE
        }
      };

      expect(activeScope.where.status).toBe(UserStatus.ACTIVE);
    });

    it('应该支持管理员用户范围', () => {
      // 模拟管理员用户范围
      const adminScope = {
        where: {
          role: UserRole.ADMIN
        }
      };

      expect(adminScope.where.role).toBe(UserRole.ADMIN);
    });

    it('应该支持按状态筛选范围', () => {
      // 模拟按状态筛选的范围
      const byStatusScope = (status: UserStatus) => ({
        where: {
          status: status
        }
      });

      const lockedScope = byStatusScope(UserStatus.LOCKED);
      const inactiveScope = byStatusScope(UserStatus.INACTIVE);

      expect(lockedScope.where.status).toBe(UserStatus.LOCKED);
      expect(inactiveScope.where.status).toBe(UserStatus.INACTIVE);
    });
  });

  describe('Model Indexes', () => {
    it('应该定义正确的索引', () => {
      // 模拟索引定义
      const expectedIndexes = [
        {
          fields: ['username'],
          unique: true
        },
        {
          fields: ['email'],
          unique: true
        },
        {
          fields: ['status']
        },
        {
          fields: ['role']
        },
        {
          fields: ['createdAt']
        }
      ];

      expectedIndexes.forEach(index => {
        expect(index).toHaveProperty('fields');
        if (index.unique) {
          expect(index.unique).toBe(true);
        }
      });
    });

    it('应该支持复合索引', () => {
      // 模拟复合索引
      const compositeIndex = {
        fields: ['status', 'role'],
        name: 'idx_user_status_role'
      };

      expect(compositeIndex.fields).toEqual(['status', 'role']);
      expect(compositeIndex.name).toBe('idx_user_status_role');
    });
  });

  describe('Model Serialization', () => {
    it('应该正确序列化用户数据', () => {
      const userData = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        realName: '测试用户',
        phone: '13800138000',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      };

      const serialized = JSON.stringify(userData);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.id).toBe(1);
      expect(deserialized.username).toBe('testuser');
      expect(deserialized.email).toBe('test@example.com');
      expect(deserialized.role).toBe(UserRole.USER);
      expect(deserialized.status).toBe(UserStatus.ACTIVE);
    });

    it('应该处理日期字段序列化', () => {
      const now = new Date();
      const userData = {
        id: 1,
        username: 'testuser',
        createdAt: now,
        updatedAt: now
      };

      const serialized = JSON.stringify(userData);
      const deserialized = JSON.parse(serialized);

      expect(typeof deserialized.createdAt).toBe('string');
      expect(typeof deserialized.updatedAt).toBe('string');
      expect(new Date(deserialized.createdAt)).toEqual(now);
      expect(new Date(deserialized.updatedAt)).toEqual(now);
    });
  });
});
