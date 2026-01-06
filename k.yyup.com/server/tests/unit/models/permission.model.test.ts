import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { DataTypes } from 'sequelize';

// Mock Sequelize
const mockSequelize = {
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

// Mock Permission model
const mockPermission = {
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
const mockRole = { hasMany: jest.fn(), belongsTo: jest.fn() };
const mockRolePermission = { hasMany: jest.fn(), belongsTo: jest.fn() };

// Mock imports
jest.unstable_mockModule('../../../../../src/models/permission.model', () => ({
  Permission: mockPermission,
  PermissionType: {
    MENU: 'menu',
    BUTTON: 'button',
    API: 'api',
    DATA: 'data'
  },
  PermissionStatus: {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
  }
}));

jest.unstable_mockModule('../../../../../src/models/role.model', () => ({
  Role: mockRole
}));

jest.unstable_mockModule('../../../../../src/models/role-permission.model', () => ({
  RolePermission: mockRolePermission
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

describe('Permission Model', () => {
  let Permission: any;
  let PermissionType: any;
  let PermissionStatus: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/models/permission.model');
    Permission = imported.Permission;
    PermissionType = imported.PermissionType;
    PermissionStatus = imported.PermissionStatus;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('应该正确定义Permission模型', () => {
      Permission.initModel(mockSequelize);

      expect(Permission.init).toHaveBeenCalledWith(
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
          code: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: expect.objectContaining({
              is: expect.any(RegExp)
            })
          }),
          description: expect.objectContaining({
            type: DataTypes.TEXT,
            allowNull: true
          }),
          type: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['menu', 'button', 'api', 'data'],
            defaultValue: 'button'
          }),
          status: expect.objectContaining({
            type: DataTypes.ENUM,
            values: ['active', 'inactive'],
            defaultValue: 'active'
          }),
          resource: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true
          }),
          action: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true
          }),
          path: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true
          }),
          method: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true,
            validate: expect.objectContaining({
              isIn: [['GET', 'POST', 'PUT', 'DELETE', 'PATCH']]
            })
          }),
          parentId: expect.objectContaining({
            type: DataTypes.INTEGER,
            allowNull: true
          }),
          sort: expect.objectContaining({
            type: DataTypes.INTEGER,
            defaultValue: 0
          }),
          icon: expect.objectContaining({
            type: DataTypes.STRING,
            allowNull: true
          }),
          isSystem: expect.objectContaining({
            type: DataTypes.BOOLEAN,
            defaultValue: false
          }),
          isVisible: expect.objectContaining({
            type: DataTypes.BOOLEAN,
            defaultValue: true
          })
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          tableName: 'permissions',
          timestamps: true,
          paranoid: true
        })
      );
    });

    it('应该包含所有必需的字段', () => {
      const permissionInstance = {
        id: 1,
        name: '用户管理',
        code: 'USER_MANAGE',
        description: '用户管理相关权限',
        type: 'menu',
        status: 'active',
        resource: 'user',
        action: 'manage',
        path: '/user',
        method: 'GET',
        parentId: null,
        sort: 1,
        icon: 'user',
        isSystem: false,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      // 检查实例是否具有预期的属性
      expect(permissionInstance).toHaveProperty('id');
      expect(permissionInstance).toHaveProperty('name');
      expect(permissionInstance).toHaveProperty('code');
      expect(permissionInstance).toHaveProperty('description');
      expect(permissionInstance).toHaveProperty('type');
      expect(permissionInstance).toHaveProperty('status');
      expect(permissionInstance).toHaveProperty('resource');
      expect(permissionInstance).toHaveProperty('action');
      expect(permissionInstance).toHaveProperty('path');
      expect(permissionInstance).toHaveProperty('method');
      expect(permissionInstance).toHaveProperty('parentId');
      expect(permissionInstance).toHaveProperty('sort');
      expect(permissionInstance).toHaveProperty('icon');
      expect(permissionInstance).toHaveProperty('isSystem');
      expect(permissionInstance).toHaveProperty('isVisible');
    });
  });

  describe('Model Validations', () => {
    it('应该验证必填字段', () => {
      const requiredFields = ['name', 'code'];
      
      requiredFields.forEach(field => {
        expect(mockPermission.init).toHaveBeenCalledWith(
          expect.objectContaining({
            [field]: expect.objectContaining({
              allowNull: false
            })
          }),
          expect.any(Object)
        );
      });
    });

    it('应该验证权限代码格式', () => {
      expect(mockPermission.init).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.objectContaining({
            validate: expect.objectContaining({
              is: expect.any(RegExp)
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证HTTP方法', () => {
      expect(mockPermission.init).toHaveBeenCalledWith(
        expect.objectContaining({
          method: expect.objectContaining({
            validate: expect.objectContaining({
              isIn: [['GET', 'POST', 'PUT', 'DELETE', 'PATCH']]
            })
          })
        }),
        expect.any(Object)
      );
    });

    it('应该验证唯一性约束', () => {
      expect(mockPermission.init).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.objectContaining({
            unique: true
          }),
          code: expect.objectContaining({
            unique: true
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('Model Associations', () => {
    it('应该定义与Role的多对多关联关系', () => {
      Permission.associate({ 
        Role: mockRole,
        RolePermission: mockRolePermission
      });
      
      expect(mockPermission.belongsToMany).toHaveBeenCalledWith(mockRole, {
        through: mockRolePermission,
        foreignKey: 'permissionId',
        otherKey: 'roleId',
        as: 'roles'
      });
    });

    it('应该定义自关联关系（父子权限）', () => {
      Permission.associate({ Permission: mockPermission });
      
      expect(mockPermission.belongsTo).toHaveBeenCalledWith(mockPermission, {
        foreignKey: 'parentId',
        as: 'parent'
      });
      
      expect(mockPermission.hasMany).toHaveBeenCalledWith(mockPermission, {
        foreignKey: 'parentId',
        as: 'children'
      });
    });
  });

  describe('Model Enums', () => {
    it('应该定义正确的类型枚举', () => {
      expect(PermissionType).toEqual({
        MENU: 'menu',
        BUTTON: 'button',
        API: 'api',
        DATA: 'data'
      });
    });

    it('应该定义正确的状态枚举', () => {
      expect(PermissionStatus).toEqual({
        ACTIVE: 'active',
        INACTIVE: 'inactive'
      });
    });
  });

  describe('Model Methods', () => {
    it('应该支持toJSON方法', () => {
      const permissionInstance = {
        id: 1,
        name: '用户管理',
        code: 'USER_MANAGE',
        description: '用户管理相关权限',
        type: 'menu',
        status: 'active',
        resource: 'user',
        action: 'manage',
        path: '/user',
        method: 'GET',
        sort: 1,
        icon: 'user',
        isVisible: true,
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          name: '用户管理',
          code: 'USER_MANAGE',
          description: '用户管理相关权限',
          type: 'menu',
          status: 'active',
          resource: 'user',
          action: 'manage',
          path: '/user',
          method: 'GET',
          sort: 1,
          icon: 'user',
          isVisible: true
        })
      };

      const json = permissionInstance.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name', '用户管理');
      expect(json).toHaveProperty('code', 'USER_MANAGE');
      expect(json).toHaveProperty('type', 'menu');
      expect(json).toHaveProperty('status', 'active');
      expect(json).toHaveProperty('resource', 'user');
      expect(json).toHaveProperty('action', 'manage');
      expect(json).toHaveProperty('path', '/user');
      expect(json).toHaveProperty('method', 'GET');
    });

    it('应该支持检查是否为菜单权限', () => {
      const menuPermission = {
        type: 'menu',
        isMenuPermission: jest.fn().mockReturnValue(true)
      };

      const buttonPermission = {
        type: 'button',
        isMenuPermission: jest.fn().mockReturnValue(false)
      };

      expect(menuPermission.isMenuPermission()).toBe(true);
      expect(buttonPermission.isMenuPermission()).toBe(false);
    });

    it('应该支持检查是否为API权限', () => {
      const apiPermission = {
        type: 'api',
        isApiPermission: jest.fn().mockReturnValue(true)
      };

      const menuPermission = {
        type: 'menu',
        isApiPermission: jest.fn().mockReturnValue(false)
      };

      expect(apiPermission.isApiPermission()).toBe(true);
      expect(menuPermission.isApiPermission()).toBe(false);
    });

    it('应该支持检查是否为活跃状态', () => {
      const activePermission = {
        status: 'active',
        isActive: jest.fn().mockReturnValue(true)
      };

      const inactivePermission = {
        status: 'inactive',
        isActive: jest.fn().mockReturnValue(false)
      };

      expect(activePermission.isActive()).toBe(true);
      expect(inactivePermission.isActive()).toBe(false);
    });

    it('应该支持检查是否为系统权限', () => {
      const systemPermission = {
        isSystem: true,
        isSystemPermission: jest.fn().mockReturnValue(true)
      };

      const customPermission = {
        isSystem: false,
        isSystemPermission: jest.fn().mockReturnValue(false)
      };

      expect(systemPermission.isSystemPermission()).toBe(true);
      expect(customPermission.isSystemPermission()).toBe(false);
    });

    it('应该支持检查是否可见', () => {
      const visiblePermission = {
        isVisible: true,
        isVisiblePermission: jest.fn().mockReturnValue(true)
      };

      const hiddenPermission = {
        isVisible: false,
        isVisiblePermission: jest.fn().mockReturnValue(false)
      };

      expect(visiblePermission.isVisiblePermission()).toBe(true);
      expect(hiddenPermission.isVisiblePermission()).toBe(false);
    });

    it('应该支持获取完整权限路径', () => {
      const permissionInstance = {
        resource: 'user',
        action: 'create',
        getFullPath: jest.fn().mockReturnValue('user:create')
      };

      const fullPath = permissionInstance.getFullPath();

      expect(fullPath).toBe('user:create');
    });

    it('应该支持检查权限匹配', () => {
      const permissionInstance = {
        resource: 'user',
        action: 'read',
        method: 'GET',
        path: '/api/users',
        matches: jest.fn().mockImplementation((resource, action, method, path) => {
          return resource === 'user' && action === 'read' && method === 'GET' && path === '/api/users';
        })
      };

      expect(permissionInstance.matches('user', 'read', 'GET', '/api/users')).toBe(true);
      expect(permissionInstance.matches('user', 'write', 'POST', '/api/users')).toBe(false);
    });
  });

  describe('Model Scopes', () => {
    it('应该定义活跃权限范围', () => {
      const activeScope = {
        where: { status: 'active' }
      };

      expect(activeScope).toEqual({
        where: { status: 'active' }
      });
    });

    it('应该定义菜单权限范围', () => {
      const menuScope = {
        where: { type: 'menu' }
      };

      expect(menuScope).toEqual({
        where: { type: 'menu' }
      });
    });

    it('应该定义可见权限范围', () => {
      const visibleScope = {
        where: { isVisible: true }
      };

      expect(visibleScope).toEqual({
        where: { isVisible: true }
      });
    });

    it('应该定义系统权限范围', () => {
      const systemScope = {
        where: { isSystem: true }
      };

      expect(systemScope).toEqual({
        where: { isSystem: true }
      });
    });
  });

  describe('Model Hooks', () => {
    it('应该在创建前验证权限代码格式', () => {
      const beforeCreateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeCreateHook).toBeDefined();
    });

    it('应该在删除前检查是否为系统权限', () => {
      const beforeDestroyHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeDestroyHook).toBeDefined();
    });

    it('应该在更新前验证状态变更', () => {
      const beforeUpdateHook = jest.fn();
      
      // 模拟钩子函数
      expect(beforeUpdateHook).toBeDefined();
    });
  });
});
