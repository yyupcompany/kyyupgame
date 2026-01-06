/**
 * PermissionBackup 模型测试用例
 * 对应模型文件: permissionbackup.model.ts
 */

import { PermissionBackup } from '../../../src/models/permissionbackup.model';
import { vi } from 'vitest'
import { sequelize } from '../../../src/init';


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

describe('PermissionBackup Model', () => {
  beforeAll(async () => {
    // 确保数据库连接已建立
    await sequelize.authenticate();
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sequelize.close();
  });

  beforeEach(async () => {
    // 在每个测试前清理表数据
    await PermissionBackup.destroy({ where: {} });
  });

  describe('模型定义测试', () => {
    test('PermissionBackup 模型应该正确定义', () => {
      expect(PermissionBackup).toBeDefined();
      expect(PermissionBackup.tableName).toBe('permissions_backup');
    });

    test('应该包含所有必需的属性', () => {
      const attributes = Object.keys(PermissionBackup.rawAttributes);
      const requiredAttributes = [
        'id', 'name', 'code', 'type', 'parent_id', 'path', 'component',
        'permission', 'icon', 'sort', 'status', 'created_at', 'updated_at'
      ];
      
      requiredAttributes.forEach(attr => {
        expect(attributes).toContain(attr);
      });
    });
  });

  describe('字段类型和约束测试', () => {
    test('id 字段应该正确配置', () => {
      const idField = PermissionBackup.rawAttributes.id;
      expect(idField.type).toEqual(expect.objectContaining({ key: 'INTEGER' }));
      expect(idField.primaryKey).toBe(true);
      expect(idField.autoIncrement).toBe(true);
      expect(idField.allowNull).toBe(false);
    });

    test('name 字段应该正确配置', () => {
      const nameField = PermissionBackup.rawAttributes.name;
      expect(nameField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(nameField.allowNull).toBe(true);
    });

    test('code 字段应该正确配置', () => {
      const codeField = PermissionBackup.rawAttributes.code;
      expect(codeField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(codeField.allowNull).toBe(true);
    });

    test('type 字段应该正确配置', () => {
      const typeField = PermissionBackup.rawAttributes.type;
      expect(typeField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(typeField.allowNull).toBe(true);
    });

    test('parent_id 字段应该正确配置', () => {
      const parentIdField = PermissionBackup.rawAttributes.parent_id;
      expect(parentIdField.type).toEqual(expect.objectContaining({ key: 'INTEGER' }));
      expect(parentIdField.allowNull).toBe(true);
    });

    test('path 字段应该正确配置', () => {
      const pathField = PermissionBackup.rawAttributes.path;
      expect(pathField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(pathField.allowNull).toBe(true);
    });

    test('component 字段应该正确配置', () => {
      const componentField = PermissionBackup.rawAttributes.component;
      expect(componentField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(componentField.allowNull).toBe(true);
    });

    test('permission 字段应该正确配置', () => {
      const permissionField = PermissionBackup.rawAttributes.permission;
      expect(permissionField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(permissionField.allowNull).toBe(true);
    });

    test('icon 字段应该正确配置', () => {
      const iconField = PermissionBackup.rawAttributes.icon;
      expect(iconField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(iconField.allowNull).toBe(true);
    });

    test('sort 字段应该正确配置', () => {
      const sortField = PermissionBackup.rawAttributes.sort;
      expect(sortField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(sortField.allowNull).toBe(true);
    });

    test('status 字段应该正确配置', () => {
      const statusField = PermissionBackup.rawAttributes.status;
      expect(statusField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(statusField.allowNull).toBe(true);
    });

    test('created_at 字段应该正确配置', () => {
      const createdAtField = PermissionBackup.rawAttributes.created_at;
      expect(createdAtField.type).toEqual(expect.objectContaining({ key: 'DATE' }));
      expect(createdAtField.allowNull).toBe(true);
    });

    test('updated_at 字段应该正确配置', () => {
      const updatedAtField = PermissionBackup.rawAttributes.updated_at;
      expect(updatedAtField.type).toEqual(expect.objectContaining({ key: 'DATE' }));
      expect(updatedAtField.allowNull).toBe(true);
    });
  });

  describe('模型配置测试', () => {
    test('应该启用时间戳', () => {
      expect(PermissionBackup.options.timestamps).toBe(true);
    });

    test('应该启用下划线命名', () => {
      expect(PermissionBackup.options.underscored).toBe(true);
    });

    test('应该启用软删除', () => {
      expect(PermissionBackup.options.paranoid).toBe(true);
    });
  });

  describe('CRUD 操作测试', () => {
    test('应该能够创建 PermissionBackup 记录', async () => {
      const permissionData = {
        name: '测试权限',
        code: 'test:permission',
        type: 'menu',
        parent_id: 1,
        path: '/test',
        component: 'TestComponent',
        permission: 'test:read',
        icon: 'test-icon',
        sort: '1',
        status: '1'
      };

      const permission = await PermissionBackup.create(permissionData);
      
      expect(permission.id).toBeDefined();
      expect(permission.name).toBe(permissionData.name);
      expect(permission.code).toBe(permissionData.code);
      expect(permission.type).toBe(permissionData.type);
      expect(permission.parent_id).toBe(permissionData.parent_id);
      expect(permission.path).toBe(permissionData.path);
      expect(permission.component).toBe(permissionData.component);
      expect(permission.permission).toBe(permissionData.permission);
      expect(permission.icon).toBe(permissionData.icon);
      expect(permission.sort).toBe(permissionData.sort);
      expect(permission.status).toBe(permissionData.status);
    });

    test('应该能够读取 PermissionBackup 记录', async () => {
      const permissionData = {
        name: '测试权限',
        code: 'test:permission',
        type: 'menu',
        parent_id: 1,
        path: '/test',
        component: 'TestComponent',
        permission: 'test:read',
        icon: 'test-icon',
        sort: '1',
        status: '1'
      };

      const createdPermission = await PermissionBackup.create(permissionData);
      const foundPermission = await PermissionBackup.findByPk(createdPermission.id);
      
      expect(foundPermission).toBeDefined();
      expect(foundPermission!.id).toBe(createdPermission.id);
      expect(foundPermission!.name).toBe(permissionData.name);
    });

    test('应该能够更新 PermissionBackup 记录', async () => {
      const permissionData = {
        name: '测试权限',
        code: 'test:permission',
        type: 'menu',
        parent_id: 1,
        path: '/test',
        component: 'TestComponent',
        permission: 'test:read',
        icon: 'test-icon',
        sort: '1',
        status: '1'
      };

      const permission = await PermissionBackup.create(permissionData);
      
      const updateData = {
        name: '更新的权限',
        code: 'updated:permission',
        path: '/updated',
        status: '0'
      };

      await permission.update(updateData);
      const updatedPermission = await PermissionBackup.findByPk(permission.id);
      
      expect(updatedPermission!.name).toBe(updateData.name);
      expect(updatedPermission!.code).toBe(updateData.code);
      expect(updatedPermission!.path).toBe(updateData.path);
      expect(updatedPermission!.status).toBe(updateData.status);
    });

    test('应该能够删除 PermissionBackup 记录（软删除）', async () => {
      const permissionData = {
        name: '测试权限',
        code: 'test:permission',
        type: 'menu',
        parent_id: 1,
        path: '/test',
        component: 'TestComponent',
        permission: 'test:read',
        icon: 'test-icon',
        sort: '1',
        status: '1'
      };

      const permission = await PermissionBackup.create(permissionData);
      const permissionId = permission.id;
      
      await permission.destroy();
      
      const foundPermission = await PermissionBackup.findByPk(permissionId);
      expect(foundPermission).toBeNull();
      
      // 检查软删除的记录
      const deletedPermission = await PermissionBackup.findByPk(permissionId, { paranoid: false });
      expect(deletedPermission).toBeDefined();
      expect(deletedPermission!.deletedAt).toBeDefined();
    });
  });

  describe('查询操作测试', () => {
    beforeEach(async () => {
      // 创建测试数据
      await PermissionBackup.bulkCreate([
        {
          name: '系统管理',
          code: 'system:management',
          type: 'menu',
          parent_id: null,
          path: '/system',
          component: 'SystemLayout',
          permission: 'system:access',
          icon: 'system-icon',
          sort: '1',
          status: '1'
        },
        {
          name: '用户管理',
          code: 'user:management',
          type: 'menu',
          parent_id: 1,
          path: '/system/users',
          component: 'UserManagement',
          permission: 'user:access',
          icon: 'user-icon',
          sort: '2',
          status: '1'
        },
        {
          name: '权限管理',
          code: 'permission:management',
          type: 'menu',
          parent_id: 1,
          path: '/system/permissions',
          component: 'PermissionManagement',
          permission: 'permission:access',
          icon: 'permission-icon',
          sort: '3',
          status: '0'
        }
      ]);
    });

    test('应该能够查询所有 PermissionBackup 记录', async () => {
      const permissions = await PermissionBackup.findAll();
      expect(permissions.length).toBe(3);
    });

    test('应该能够按类型查询 PermissionBackup 记录', async () => {
      const menuPermissions = await PermissionBackup.findAll({
        where: { type: 'menu' }
      });
      expect(menuPermissions.length).toBe(3);
    });

    test('应该能够按状态查询 PermissionBackup 记录', async () => {
      const activePermissions = await PermissionBackup.findAll({
        where: { status: '1' }
      });
      expect(activePermissions.length).toBe(2);
    });

    test('应该能够按父ID查询 PermissionBackup 记录', async () => {
      const childPermissions = await PermissionBackup.findAll({
        where: { parent_id: 1 }
      });
      expect(childPermissions.length).toBe(2);
    });

    test('应该能够按路径查询 PermissionBackup 记录', async () => {
      const pathPermissions = await PermissionBackup.findAll({
        where: { path: '/system' }
      });
      expect(pathPermissions.length).toBe(1);
      expect(pathPermissions[0].name).toBe('系统管理');
    });
  });

  describe('数据验证测试', () => {
    test('应该允许所有字段为空（根据模型定义）', async () => {
      const permission = await PermissionBackup.create({});
      expect(permission.id).toBeDefined();
    });

    test('应该能够处理各种数据类型', async () => {
      const permissionData = {
        name: '测试权限',
        code: 'test:permission',
        type: 'menu',
        parent_id: 1,
        path: '/test',
        component: 'TestComponent',
        permission: 'test:read',
        icon: 'test-icon',
        sort: '10',
        status: '1'
      };

      const permission = await PermissionBackup.create(permissionData);
      expect(permission.name).toBe('string');
      expect(permission.code).toBe('string');
      expect(permission.type).toBe('string');
      expect(permission.parent_id).toBe('number');
      expect(permission.path).toBe('string');
      expect(permission.component).toBe('string');
      expect(permission.permission).toBe('string');
      expect(permission.icon).toBe('string');
      expect(permission.sort).toBe('string');
      expect(permission.status).toBe('string');
    });

    test('应该能够处理null值', async () => {
      const permissionData = {
        name: '测试权限',
        parent_id: null,
        icon: null,
        sort: null
      };

      const permission = await PermissionBackup.create(permissionData);
      expect(permission.parent_id).toBeNull();
      expect(permission.icon).toBeNull();
      expect(permission.sort).toBeNull();
    });
  });

  describe('权限结构测试', () => {
    beforeEach(async () => {
      // 创建层级权限结构
      await PermissionBackup.bulkCreate([
        {
          name: '根权限',
          code: 'root',
          type: 'menu',
          parent_id: null,
          path: '/',
          component: 'RootLayout',
          permission: 'root:access',
          icon: 'root-icon',
          sort: '0',
          status: '1'
        },
        {
          name: '子权限1',
          code: 'child1',
          type: 'menu',
          parent_id: 1,
          path: '/child1',
          component: 'Child1Component',
          permission: 'child1:access',
          icon: 'child1-icon',
          sort: '1',
          status: '1'
        },
        {
          name: '子权限2',
          code: 'child2',
          type: 'menu',
          parent_id: 1,
          path: '/child2',
          component: 'Child2Component',
          permission: 'child2:access',
          icon: 'child2-icon',
          sort: '2',
          status: '1'
        },
        {
          name: '孙权限',
          code: 'grandchild',
          type: 'menu',
          parent_id: 2,
          path: '/child1/grandchild',
          component: 'GrandchildComponent',
          permission: 'grandchild:access',
          icon: 'grandchild-icon',
          sort: '1',
          status: '1'
        }
      ]);
    });

    test('应该能够构建权限层级结构', async () => {
      const rootPermissions = await PermissionBackup.findAll({
        where: { parent_id: null }
      });
      expect(rootPermissions.length).toBe(1);
      expect(rootPermissions[0].name).toBe('根权限');

      const childPermissions = await PermissionBackup.findAll({
        where: { parent_id: 1 }
      });
      expect(childPermissions.length).toBe(2);

      const grandchildPermissions = await PermissionBackup.findAll({
        where: { parent_id: 2 }
      });
      expect(grandchildPermissions.length).toBe(1);
    });

    test('应该能够按排序字段查询', async () => {
      const sortedPermissions = await PermissionBackup.findAll({
        where: { parent_id: 1 },
        order: [['sort', 'ASC']]
      });
      
      expect(sortedPermissions.length).toBe(2);
      expect(sortedPermissions[0].name).toBe('子权限1');
      expect(sortedPermissions[1].name).toBe('子权限2');
    });
  });

  describe('时间戳测试', () => {
    test('创建记录时应该自动设置时间戳', async () => {
      const permission = await PermissionBackup.create({
        name: '测试权限',
        code: 'test:permission'
      });

      expect(permission.createdAt).toBeDefined();
      expect(permission.updatedAt).toBeDefined();
      expect(permission.createdAt).toBeInstanceOf(Date);
      expect(permission.updatedAt).toBeInstanceOf(Date);
    });

    test('更新记录时应该自动更新 updated_at 时间戳', async () => {
      const permission = await PermissionBackup.create({
        name: '测试权限',
        code: 'test:permission'
      });

      const originalUpdatedAt = permission.updatedAt;
      
      // 等待1秒以确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await permission.update({ name: '更新的权限' });
      
      expect(permission.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });

  describe('枚举值测试', () => {
    test('应该支持不同的权限类型', async () => {
      const permissionTypes = ['menu', 'button', 'api', 'data'];
      
      for (const type of permissionTypes) {
        const permission = await PermissionBackup.create({
          name: `测试${type}权限`,
          code: `test:${type}`,
          type: type
        });
        
        expect(permission.type).toBe(type);
      }
    });

    test('应该支持不同的状态值', async () => {
      const statusValues = ['0', '1', '2'];
      
      for (const status of statusValues) {
        const permission = await PermissionBackup.create({
          name: `测试状态${status}`,
          code: `test:status:${status}`,
          status: status
        });
        
        expect(permission.status).toBe(status);
      }
    });
  });
});