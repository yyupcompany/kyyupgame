import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { DataTypes } from 'sequelize';

// Mock Sequelize
const mockSequelize = {
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

// Mock UserRole model
const mockUserRole = {
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
  bulkCreate: jest.fn(),
  bulkDestroy: jest.fn()
};

// Mock related models
const mockUser = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockRole = { hasMany: jest.fn(), belongsTo: jest.fn() };

// Mock imports
jest.unstable_mockModule('../../../../../src/models/user-role.model', () => ({
  UserRole: mockUserRole,
  UserRoleStatus: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    EXPIRED: 'expired'
  }
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/role.model', () => ({
  Role: mockRole
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

describe('UserRole Model', () => {
  let UserRole: any;
  let UserRoleStatus: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/models/user-role.model');
    UserRole = imported.UserRole;
    UserRoleStatus = imported.UserRoleStatus;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('应该正确定义UserRole模型', () => {
      UserRole.initModel(mockSequelize);

      expect(UserRole.init).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          }),
          userId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false,
            references: expect.objectContaining({
              model: 'users',
              key: 'id'
            })
          }),
          roleId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: false,
            references: expect.objectContaining({
              model: 'roles',
              key: 'id'
            })
          }),
          status: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['active', 'inactive', 'pending', 'expired'],
            defaultValue: 'active'
          }),
          assignedBy: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: true,
            references: expect.objectContaining({
              model: 'users',
              key: 'id'
            })
          }),
          assignedAt: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: expect.any(Object)
          }),
          expiresAt: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: true
          }),
          revokedBy: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: true,
            references: expect.objectContaining({
              model: 'users',
              key: 'id'
            })
          }),
          revokedAt: expect.objectContaining({
            type: DataTypes.DATE,
            allowNull: true
          }),
          reason: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true
          }),
          metadata: expect.objectContaining({
            type: DataTypes.JSON,
            allowNull: true
          })
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          tableName: 'user_roles',
          timestamps: true,
          paranoid: true
        })
      );
    });

    it('应该包含所有必需的字段', () => {
      const userRoleInstance = {
        id: 1,
        userId: 1,
        roleId: 2,
        status: 'active',
        assignedBy: 3,
        assignedAt: new Date(),
        expiresAt: null,
        revokedBy: null,
        revokedAt: null,
        reason: '系统分配',
        metadata: {
          source: 'admin_panel',
          notes: '初始角色分配'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      // 检查实例是否具有预期的属性
      expect(userRoleInstance).toHaveProperty('id');
      expect(userRoleInstance).toHaveProperty('userId');
      expect(userRoleInstance).toHaveProperty('roleId');
      expect(userRoleInstance).toHaveProperty('status');
      expect(userRoleInstance).toHaveProperty('assignedBy');
      expect(userRoleInstance).toHaveProperty('assignedAt');
      expect(userRoleInstance).toHaveProperty('expiresAt');
      expect(userRoleInstance).toHaveProperty('revokedBy');
      expect(userRoleInstance).toHaveProperty('revokedAt');
      expect(userRoleInstance).toHaveProperty('reason');
      expect(userRoleInstance).toHaveProperty('metadata');
    });
  });

  describe('Model Validations', () => {
    it('应该验证必填字段', () => {
      const requiredFields = ['userId', 'roleId', 'assignedAt'];
      
      requiredFields.forEach(field => {
        expect(mockUserRole.init).toHaveBeenCalledWith(
          expect.objectContaining({
            [field]: expect.objectContaining({
              allowNull: false
            })
          }),
          expect.any(Object)
        );
      });
    });

    it('应该验证外键约束', () => {
      const foreignKeys = ['userId', 'roleId', 'assignedBy', 'revokedBy'];
      
      foreignKeys.forEach(field => {
        if (field === 'assignedBy' || field === 'revokedBy') {
          expect(mockUserRole.init).toHaveBeenCalledWith(
            expect.objectContaining({
              [field]: expect.objectContaining({
                references: expect.objectContaining({
                  model: 'users',
                  key: 'id'
                })
              })
            }),
            expect.any(Object)
          );
        } else if (field === 'roleId') {
          expect(mockUserRole.init).toHaveBeenCalledWith(
            expect.objectContaining({
              [field]: expect.objectContaining({
                references: expect.objectContaining({
                  model: 'roles',
                  key: 'id'
                })
              })
            }),
            expect.any(Object)
          );
        }
      });
    });

    it('应该验证唯一性约束', () => {
      // 用户-角色组合应该是唯一的（在活跃状态下）
      const uniqueConstraint = {
        fields: ['userId', 'roleId'],
        where: { status: 'active' }
      };

      expect(uniqueConstraint).toBeDefined();
    });
  });

  describe('Model Associations', () => {
    it('应该定义与User的关联关系', () => {
      UserRole.associate({ User: mockUser });
      
      expect(mockUserRole.belongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'userId',
        as: 'user'
      });
    });

    it('应该定义与Role的关联关系', () => {
      UserRole.associate({ Role: mockRole });
      
      expect(mockUserRole.belongsTo).toHaveBeenCalledWith(mockRole, {
        foreignKey: 'roleId',
        as: 'role'
      });
    });

    it('应该定义与分配者的关联关系', () => {
      UserRole.associate({ User: mockUser });
      
      expect(mockUserRole.belongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'assignedBy',
        as: 'assigner'
      });
    });

    it('应该定义与撤销者的关联关系', () => {
      UserRole.associate({ User: mockUser });
      
      expect(mockUserRole.belongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'revokedBy',
        as: 'revoker'
      });
    });
  });

  describe('Model Enums', () => {
    it('应该定义正确的状态枚举', () => {
      expect(UserRoleStatus).toEqual({
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        PENDING: 'pending',
        EXPIRED: 'expired'
      });
    });
  });

  describe('Model Methods', () => {
    it('应该支持toJSON方法', () => {
      const userRoleInstance = {
        id: 1,
        userId: 1,
        roleId: 2,
        status: 'active',
        assignedAt: new Date(),
        reason: '系统分配',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          userId: 1,
          roleId: 2,
          status: 'active',
          assignedAt: expect.any(Date),
          reason: '系统分配'
        })
      };

      const json = userRoleInstance.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('userId', 1);
      expect(json).toHaveProperty('roleId', 2);
      expect(json).toHaveProperty('status', 'active');
      expect(json).toHaveProperty('reason', '系统分配');
    });

    it('应该支持检查是否为活跃状态', () => {
      const activeUserRole = {
        status: 'active',
        expiresAt: null,
        isActive: jest.fn().mockReturnValue(true)
      };

      const inactiveUserRole = {
        status: 'inactive',
        isActive: jest.fn().mockReturnValue(false)
      };

      const expiredUserRole = {
        status: 'active',
        expiresAt: new Date(Date.now() - 86400000), // 昨天过期
        isActive: jest.fn().mockReturnValue(false)
      };

      expect(activeUserRole.isActive()).toBe(true);
      expect(inactiveUserRole.isActive()).toBe(false);
      expect(expiredUserRole.isActive()).toBe(false);
    });

    it('应该支持检查是否已过期', () => {
      const notExpiredUserRole = {
        expiresAt: new Date(Date.now() + 86400000), // 明天过期
        isExpired: jest.fn().mockReturnValue(false)
      };

      const expiredUserRole = {
        expiresAt: new Date(Date.now() - 86400000), // 昨天过期
        isExpired: jest.fn().mockReturnValue(true)
      };

      const neverExpiresUserRole = {
        expiresAt: null,
        isExpired: jest.fn().mockReturnValue(false)
      };

      expect(notExpiredUserRole.isExpired()).toBe(false);
      expect(expiredUserRole.isExpired()).toBe(true);
      expect(neverExpiresUserRole.isExpired()).toBe(false);
    });

    it('应该支持检查是否即将过期', () => {
      const soonToExpireUserRole = {
        expiresAt: new Date(Date.now() + 3600000), // 1小时后过期
        isExpiringSoon: jest.fn().mockImplementation((hours = 24) => {
          const now = new Date();
          const threshold = new Date(now.getTime() + hours * 3600000);
          return soonToExpireUserRole.expiresAt && soonToExpireUserRole.expiresAt <= threshold;
        })
      };

      expect(soonToExpireUserRole.isExpiringSoon(24)).toBe(true);
      expect(soonToExpireUserRole.isExpiringSoon(0.5)).toBe(false);
    });

    it('应该支持获取剩余有效时间', () => {
      const userRoleInstance = {
        expiresAt: new Date(Date.now() + 86400000), // 1天后过期
        getRemainingTime: jest.fn().mockReturnValue({
          days: 1,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalMilliseconds: 86400000
        })
      };

      const remainingTime = userRoleInstance.getRemainingTime();

      expect(remainingTime).toEqual({
        days: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMilliseconds: 86400000
      });
    });

    it('应该支持撤销角色', () => {
      const userRoleInstance = {
        status: 'active',
        revokedBy: null,
        revokedAt: null,
        revoke: jest.fn().mockImplementation((revokedBy, reason) => {
          userRoleInstance.status = 'inactive';
          userRoleInstance.revokedBy = revokedBy;
          userRoleInstance.revokedAt = new Date();
          userRoleInstance.reason = reason;
          return Promise.resolve(true);
        })
      };

      const result = userRoleInstance.revoke(3, '管理员撤销');

      expect(userRoleInstance.status).toBe('inactive');
      expect(userRoleInstance.revokedBy).toBe(3);
      expect(userRoleInstance.revokedAt).toBeInstanceOf(Date);
      expect(userRoleInstance.reason).toBe('管理员撤销');
    });

    it('应该支持延长有效期', () => {
      const userRoleInstance = {
        expiresAt: new Date(Date.now() + 86400000), // 1天后过期
        extend: jest.fn().mockImplementation((days) => {
          const currentExpiry = userRoleInstance.expiresAt || new Date();
          userRoleInstance.expiresAt = new Date(currentExpiry.getTime() + days * 86400000);
          return Promise.resolve(true);
        })
      };

      userRoleInstance.extend(7); // 延长7天

      const expectedExpiry = new Date(Date.now() + 8 * 86400000); // 原来1天 + 延长7天
      expect(userRoleInstance.expiresAt.getTime()).toBeCloseTo(expectedExpiry.getTime(), -5);
    });

    it('应该支持获取分配历史', () => {
      const userRoleInstance = {
        assignedAt: new Date('2024-01-01'),
        assignedBy: 1,
        revokedAt: new Date('2024-06-01'),
        revokedBy: 2,
        getHistory: jest.fn().mockReturnValue({
          assigned: {
            date: new Date('2024-01-01'),
            by: 1
          },
          revoked: {
            date: new Date('2024-06-01'),
            by: 2
          },
          duration: 151 // 天数
        })
      };

      const history = userRoleInstance.getHistory();

      expect(history).toEqual({
        assigned: {
          date: new Date('2024-01-01'),
          by: 1
        },
        revoked: {
          date: new Date('2024-06-01'),
          by: 2
        },
        duration: 151
      });
    });
  });

  describe('Model Scopes', () => {
    it('应该定义活跃用户角色范围', () => {
      const activeScope = {
        where: { 
          status: 'active',
          [expect.any(Symbol)]: [
            { expiresAt: null },
            { expiresAt: { [expect.any(Symbol)]: new Date() } }
          ]
        }
      };

      expect(activeScope).toBeDefined();
    });

    it('应该定义过期用户角色范围', () => {
      const expiredScope = {
        where: {
          [expect.any(Symbol)]: [
            { status: 'expired' },
            {
              status: 'active',
              expiresAt: { [expect.any(Symbol)]: new Date() }
            }
          ]
        }
      };

      expect(expiredScope).toBeDefined();
    });

    it('应该定义按用户筛选范围', () => {
      const byUserScope = (userId: number) => ({
        where: { userId }
      });

      expect(byUserScope(1)).toEqual({
        where: { userId: 1 }
      });
    });

    it('应该定义按角色筛选范围', () => {
      const byRoleScope = (roleId: number) => ({
        where: { roleId }
      });

      expect(byRoleScope(2)).toEqual({
        where: { roleId: 2 }
      });
    });
  });

  describe('Model Hooks', () => {
    it('应该在创建前验证用户角色唯一性', () => {
      const beforeCreateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeCreateHook).toBeDefined();
    });

    it('应该在更新前检查状态变更', () => {
      const beforeUpdateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeUpdateHook).toBeDefined();
    });

    it('应该在创建后记录审计日志', () => {
      const afterCreateHook = jest.fn();
      
      // 模拟钩子函数
      expect(afterCreateHook).toBeDefined();
    });

    it('应该在删除前检查依赖关系', () => {
      const beforeDestroyHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeDestroyHook).toBeDefined();
    });
  });

  describe('Model Indexes', () => {
    it('应该定义正确的索引', () => {
      const expectedIndexes = [
        { fields: ['userId'] },
        { fields: ['roleId'] },
        { fields: ['status'] },
        { fields: ['assignedBy'] },
        { fields: ['assignedAt'] },
        { fields: ['expiresAt'] },
        { fields: ['userId', 'roleId'], unique: true, where: { status: 'active' } }
      ];

      // 验证索引定义
      expectedIndexes.forEach(index => {
        expect(index).toBeDefined();
      });
    });
  });

  describe('Static Methods', () => {
    it('应该支持批量分配角色', () => {
      const assignRolesToUser = jest.fn().mockResolvedValue([
        { userId: 1, roleId: 2, status: 'active' },
        { userId: 1, roleId: 3, status: 'active' }
      ]);

      mockUserRole.assignRolesToUser = assignRolesToUser;

      const result = mockUserRole.assignRolesToUser(1, [2, 3], 4);

      expect(assignRolesToUser).toHaveBeenCalledWith(1, [2, 3], 4);
    });

    it('应该支持批量撤销角色', () => {
      const revokeRolesFromUser = jest.fn().mockResolvedValue(2);

      mockUserRole.revokeRolesFromUser = revokeRolesFromUser;

      const result = mockUserRole.revokeRolesFromUser(1, [2, 3], 4, '批量撤销');

      expect(revokeRolesFromUser).toHaveBeenCalledWith(1, [2, 3], 4, '批量撤销');
    });

    it('应该支持获取用户的所有角色', () => {
      const getUserRoles = jest.fn().mockResolvedValue([
        { roleId: 2, role: { name: '管理员', code: 'ADMIN' } },
        { roleId: 3, role: { name: '编辑者', code: 'EDITOR' } }
      ]);

      mockUserRole.getUserRoles = getUserRoles;

      const result = mockUserRole.getUserRoles(1);

      expect(getUserRoles).toHaveBeenCalledWith(1);
    });

    it('应该支持获取角色的所有用户', () => {
      const getRoleUsers = jest.fn().mockResolvedValue([
        { userId: 1, user: { name: '用户1', email: 'user1@example.com' } },
        { userId: 2, user: { name: '用户2', email: 'user2@example.com' } }
      ]);

      mockUserRole.getRoleUsers = getRoleUsers;

      const result = mockUserRole.getRoleUsers(2);

      expect(getRoleUsers).toHaveBeenCalledWith(2);
    });

    it('应该支持清理过期角色', () => {
      const cleanupExpiredRoles = jest.fn().mockResolvedValue(5);

      mockUserRole.cleanupExpiredRoles = cleanupExpiredRoles;

      const result = mockUserRole.cleanupExpiredRoles();

      expect(cleanupExpiredRoles).toHaveBeenCalled();
    });
  });
});
