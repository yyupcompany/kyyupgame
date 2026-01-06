import { RolePermission } from '../../../src/models/role-permission.model';
import { vi } from 'vitest'
import { Role } from '../../../src/models/role.model';
import { Permission } from '../../../src/models/permission.model';
import { User } from '../../../src/models/user.model';
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

describe('RolePermission Model', () => {
  beforeAll(async () => {
    // 确保数据库连接正常
    await sequelize.authenticate();
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should be defined', () => {
      expect(RolePermission).toBeDefined();
    });

    it('should have correct model name', () => {
      expect(RolePermission.name).toBe('RolePermission');
    });

    it('should have correct table name', () => {
      expect(RolePermission.tableName).toBe('role_permissions');
    });

    it('should have timestamps enabled', () => {
      expect(RolePermission.options.timestamps).toBe(true);
    });

    it('should have underscored enabled', () => {
      expect(RolePermission.options.underscored).toBe(true);
    });

    it('should not have paranoid enabled', () => {
      expect(RolePermission.options.paranoid).toBe(false);
    });
  });

  describe('Model Attributes', () => {
    it('should have correct id attribute', () => {
      const idAttribute = RolePermission.getAttributes().id;
      expect(idAttribute).toBeDefined();
      expect(idAttribute.type.constructor.name).toBe('INTEGER');
      expect(idAttribute.allowNull).toBe(false);
      expect(idAttribute.primaryKey).toBe(true);
      expect(idAttribute.autoIncrement).toBe(true);
      expect(idAttribute.comment).toBe('主键ID');
    });

    it('should have correct roleId attribute', () => {
      const roleIdAttribute = RolePermission.getAttributes().roleId;
      expect(roleIdAttribute).toBeDefined();
      expect(roleIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(roleIdAttribute.allowNull).toBe(false);
      expect(roleIdAttribute.comment).toBe('角色ID');
    });

    it('should have correct permissionId attribute', () => {
      const permissionIdAttribute = RolePermission.getAttributes().permissionId;
      expect(permissionIdAttribute).toBeDefined();
      expect(permissionIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(permissionIdAttribute.allowNull).toBe(false);
      expect(permissionIdAttribute.comment).toBe('权限ID');
    });

    it('should have correct grantorId attribute', () => {
      const grantorIdAttribute = RolePermission.getAttributes().grantorId;
      expect(grantorIdAttribute).toBeDefined();
      expect(grantorIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(grantorIdAttribute.allowNull).toBe(true);
      expect(grantorIdAttribute.comment).toBe('授权人ID');
    });

    it('should have correct createdAt attribute', () => {
      const createdAtAttribute = RolePermission.getAttributes().createdAt;
      expect(createdAtAttribute).toBeDefined();
      expect(createdAtAttribute.type.constructor.name).toBe('DATE');
      expect(createdAtAttribute.allowNull).toBe(false);
    });

    it('should have correct updatedAt attribute', () => {
      const updatedAtAttribute = RolePermission.getAttributes().updatedAt;
      expect(updatedAtAttribute).toBeDefined();
      expect(updatedAtAttribute.type.constructor.name).toBe('DATE');
      expect(updatedAtAttribute.allowNull).toBe(false);
    });
  });

  describe('Model Creation', () => {
    it('should create a new role permission', async () => {
      const rolePermissionData = {
        roleId: 1,
        permissionId: 1,
        grantorId: 1,
      };

      const rolePermission = await RolePermission.create(rolePermissionData);
      
      expect(rolePermission).toBeDefined();
      expect(rolePermission.id).toBeDefined();
      expect(rolePermission.roleId).toBe(rolePermissionData.roleId);
      expect(rolePermission.permissionId).toBe(rolePermissionData.permissionId);
      expect(rolePermission.grantorId).toBe(rolePermissionData.grantorId);
      expect(rolePermission.createdAt).toBeDefined();
      expect(rolePermission.updatedAt).toBeDefined();
    });

    it('should create a role permission without grantor', async () => {
      const rolePermissionData = {
        roleId: 2,
        permissionId: 2,
      };

      const rolePermission = await RolePermission.create(rolePermissionData);
      
      expect(rolePermission).toBeDefined();
      expect(rolePermission.id).toBeDefined();
      expect(rolePermission.roleId).toBe(rolePermissionData.roleId);
      expect(rolePermission.permissionId).toBe(rolePermissionData.permissionId);
      expect(rolePermission.grantorId).toBeNull();
    });

    it('should fail to create role permission without required fields', async () => {
      await expect(RolePermission.create({
        grantorId: 1,
      } as any)).rejects.toThrow();
    });
  });

  describe('Model Validation', () => {
    it('should allow null grantorId', async () => {
      const rolePermission = await RolePermission.create({
        roleId: 3,
        permissionId: 3,
      });

      expect(rolePermission.grantorId).toBeNull();
    });

    it('should handle valid foreign key values', async () => {
      const rolePermission = await RolePermission.create({
        roleId: 4,
        permissionId: 4,
        grantorId: 2,
      });

      expect(rolePermission.roleId).toBe(4);
      expect(rolePermission.permissionId).toBe(4);
      expect(rolePermission.grantorId).toBe(2);
    });
  });

  describe('Model Updates', () => {
    it('should update role permission attributes', async () => {
      const rolePermission = await RolePermission.create({
        roleId: 5,
        permissionId: 5,
        grantorId: 1,
      });

      await rolePermission.update({
        grantorId: 2,
      });

      const updatedRolePermission = await RolePermission.findByPk(rolePermission.id);
      expect(updatedRolePermission?.grantorId).toBe(2);
      expect(updatedRolePermission?.roleId).toBe(5); // Should remain unchanged
      expect(updatedRolePermission?.permissionId).toBe(5); // Should remain unchanged
    });

    it('should handle setting grantorId to null', async () => {
      const rolePermission = await RolePermission.create({
        roleId: 6,
        permissionId: 6,
        grantorId: 1,
      });

      await rolePermission.update({
        grantorId: null,
      });

      const updatedRolePermission = await RolePermission.findByPk(rolePermission.id);
      expect(updatedRolePermission?.grantorId).toBeNull();
    });
  });

  describe('Model Queries', () => {
    it('should find role permission by id', async () => {
      const createdRolePermission = await RolePermission.create({
        roleId: 7,
        permissionId: 7,
      });

      const foundRolePermission = await RolePermission.findByPk(createdRolePermission.id);
      
      expect(foundRolePermission).toBeDefined();
      expect(foundRolePermission?.id).toBe(createdRolePermission.id);
      expect(foundRolePermission?.roleId).toBe(7);
      expect(foundRolePermission?.permissionId).toBe(7);
    });

    it('should find role permissions by role id', async () => {
      await RolePermission.bulkCreate([
        { roleId: 8, permissionId: 1 },
        { roleId: 8, permissionId: 2 },
        { roleId: 9, permissionId: 1 },
      ]);

      const role8Permissions = await RolePermission.findAll({
        where: { roleId: 8 },
      });
      
      expect(role8Permissions).toHaveLength(2);
      expect(role8Permissions.map(rp => rp.permissionId)).toContain(1);
      expect(role8Permissions.map(rp => rp.permissionId)).toContain(2);
    });

    it('should find role permissions by permission id', async () => {
      await RolePermission.bulkCreate([
        { roleId: 10, permissionId: 3 },
        { roleId: 11, permissionId: 3 },
        { roleId: 10, permissionId: 4 },
      ]);

      const permission3Roles = await RolePermission.findAll({
        where: { permissionId: 3 },
      });
      
      expect(permission3Roles).toHaveLength(2);
      expect(permission3Roles.map(rp => rp.roleId)).toContain(10);
      expect(permission3Roles.map(rp => rp.roleId)).toContain(11);
    });

    it('should find role permissions by grantor id', async () => {
      await RolePermission.bulkCreate([
        { roleId: 12, permissionId: 5, grantorId: 1 },
        { roleId: 13, permissionId: 6, grantorId: 1 },
        { roleId: 12, permissionId: 7, grantorId: 2 },
      ]);

      const grantor1Permissions = await RolePermission.findAll({
        where: { grantorId: 1 },
      });
      
      expect(grantor1Permissions).toHaveLength(2);
      expect(grantor1Permissions.map(rp => rp.roleId)).toContain(12);
      expect(grantor1Permissions.map(rp => rp.roleId)).toContain(13);
    });
  });

  describe('Model Deletion', () => {
    it('should hard delete role permission (not paranoid)', async () => {
      const rolePermission = await RolePermission.create({
        roleId: 14,
        permissionId: 8,
      });

      await rolePermission.destroy();

      const deletedRolePermission = await RolePermission.findByPk(rolePermission.id);
      expect(deletedRolePermission).toBeNull();

      // Check if it exists in paranoid mode (should still be null)
      const paranoidRolePermission = await RolePermission.findByPk(rolePermission.id, {
        paranoid: false,
      });
      expect(paranoidRolePermission).toBeNull();
    });
  });

  describe('Model Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const rolePermission = await RolePermission.create({
        roleId: 15,
        permissionId: 9,
      });

      expect(rolePermission.createdAt).toBeDefined();
      expect(rolePermission.updatedAt).toBeDefined();
      expect(rolePermission.createdAt).toBeInstanceOf(Date);
      expect(rolePermission.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on update', async () => {
      const rolePermission = await RolePermission.create({
        roleId: 16,
        permissionId: 10,
      });

      const originalUpdatedAt = rolePermission.updatedAt;
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await rolePermission.update({ grantorId: 1 });
      
      expect(rolePermission.updatedAt).toBeInstanceOf(Date);
      expect(rolePermission.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Associations', () => {
    it('should have role association defined', () => {
      const associations = RolePermission.associations;
      expect(associations.role).toBeDefined();
      expect(associations.role.associationType).toBe('BelongsTo');
    });

    it('should have permission association defined', () => {
      const associations = RolePermission.associations;
      expect(associations.permission).toBeDefined();
      expect(associations.permission.associationType).toBe('BelongsTo');
    });

    it('should have grantor association defined', () => {
      const associations = RolePermission.associations;
      expect(associations.grantor).toBeDefined();
      expect(associations.grantor.associationType).toBe('BelongsTo');
    });
  });

  describe('Business Logic Tests', () => {
    it('should handle unique role-permission combinations', async () => {
      // Create first role-permission
      await RolePermission.create({
        roleId: 17,
        permissionId: 11,
      });

      // Try to create duplicate (should work as there's no unique constraint in the model definition)
      const duplicateRolePermission = await RolePermission.create({
        roleId: 17,
        permissionId: 11,
      });

      expect(duplicateRolePermission).toBeDefined();
      expect(duplicateRolePermission.id).toBeDefined();
    });

    it('should handle permission assignment to multiple roles', async () => {
      // Assign same permission to different roles
      const rolePermission1 = await RolePermission.create({
        roleId: 18,
        permissionId: 12,
      });

      const rolePermission2 = await RolePermission.create({
        roleId: 19,
        permissionId: 12,
      });

      expect(rolePermission1.roleId).toBe(18);
      expect(rolePermission2.roleId).toBe(19);
      expect(rolePermission1.permissionId).toBe(rolePermission2.permissionId);
    });

    it('should handle multiple permissions for single role', async () => {
      // Assign multiple permissions to same role
      const rolePermission1 = await RolePermission.create({
        roleId: 20,
        permissionId: 13,
      });

      const rolePermission2 = await RolePermission.create({
        roleId: 20,
        permissionId: 14,
      });

      const rolePermission3 = await RolePermission.create({
        roleId: 20,
        permissionId: 15,
      });

      expect(rolePermission1.roleId).toBe(20);
      expect(rolePermission2.roleId).toBe(20);
      expect(rolePermission3.roleId).toBe(20);
      expect(rolePermission1.permissionId).toBe(13);
      expect(rolePermission2.permissionId).toBe(14);
      expect(rolePermission3.permissionId).toBe(15);
    });

    it('should handle grantor tracking', async () => {
      // Create role permissions with different grantors
      const grantedByUser1 = await RolePermission.create({
        roleId: 21,
        permissionId: 16,
        grantorId: 1,
      });

      const grantedByUser2 = await RolePermission.create({
        roleId: 22,
        permissionId: 17,
        grantorId: 2,
      });

      const noGrantor = await RolePermission.create({
        roleId: 23,
        permissionId: 18,
      });

      expect(grantedByUser1.grantorId).toBe(1);
      expect(grantedByUser2.grantorId).toBe(2);
      expect(noGrantor.grantorId).toBeNull();
    });

    it('should handle role permission lifecycle', async () => {
      // Create role permission
      const rolePermission = await RolePermission.create({
        roleId: 24,
        permissionId: 19,
        grantorId: 1,
      });

      const originalId = rolePermission.id;

      // Update grantor
      await rolePermission.update({ grantorId: 2 });

      const updatedRolePermission = await RolePermission.findByPk(originalId);
      expect(updatedRolePermission?.grantorId).toBe(2);

      // Delete role permission
      await rolePermission.destroy();

      const deletedRolePermission = await RolePermission.findByPk(originalId);
      expect(deletedRolePermission).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values for foreign keys', async () => {
      const rolePermission = await RolePermission.create({
        roleId: 0,
        permissionId: 0,
        grantorId: 0,
      });

      expect(rolePermission.roleId).toBe(0);
      expect(rolePermission.permissionId).toBe(0);
      expect(rolePermission.grantorId).toBe(0);
    });

    it('should handle negative values for foreign keys', async () => {
      const rolePermission = await RolePermission.create({
        roleId: -1,
        permissionId: -1,
        grantorId: -1,
      });

      expect(rolePermission.roleId).toBe(-1);
      expect(rolePermission.permissionId).toBe(-1);
      expect(rolePermission.grantorId).toBe(-1);
    });
  });
});