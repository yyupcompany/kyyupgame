import { RoleBackup } from '../../../src/models/rolebackup.model';
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

describe('RoleBackup Model', () => {
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
      expect(RoleBackup).toBeDefined();
    });

    it('should have correct model name', () => {
      expect(RoleBackup.name).toBe('RoleBackup');
    });

    it('should have correct table name', () => {
      expect(RoleBackup.tableName).toBe('roles_backup');
    });

    it('should have timestamps enabled', () => {
      expect(RoleBackup.options.timestamps).toBe(true);
    });

    it('should have underscored enabled', () => {
      expect(RoleBackup.options.underscored).toBe(true);
    });

    it('should have paranoid enabled', () => {
      expect(RoleBackup.options.paranoid).toBe(true);
    });
  });

  describe('Model Attributes', () => {
    it('should have correct id attribute', () => {
      const idAttribute = RoleBackup.getAttributes().id;
      expect(idAttribute).toBeDefined();
      expect(idAttribute.type.constructor.name).toBe('INTEGER');
      expect(idAttribute.allowNull).toBe(false);
      expect(idAttribute.primaryKey).toBe(true);
      expect(idAttribute.autoIncrement).toBe(true);
    });

    it('should have correct name attribute', () => {
      const nameAttribute = RoleBackup.getAttributes().name;
      expect(nameAttribute).toBeDefined();
      expect(nameAttribute.type.constructor.name).toBe('STRING');
      expect(nameAttribute.allowNull).toBe(true);
    });

    it('should have correct code attribute', () => {
      const codeAttribute = RoleBackup.getAttributes().code;
      expect(codeAttribute).toBeDefined();
      expect(codeAttribute.type.constructor.name).toBe('STRING');
      expect(codeAttribute.allowNull).toBe(true);
    });

    it('should have correct description attribute', () => {
      const descriptionAttribute = RoleBackup.getAttributes().description;
      expect(descriptionAttribute).toBeDefined();
      expect(descriptionAttribute.type.constructor.name).toBe('STRING');
      expect(descriptionAttribute.allowNull).toBe(true);
    });

    it('should have correct status attribute', () => {
      const statusAttribute = RoleBackup.getAttributes().status;
      expect(statusAttribute).toBeDefined();
      expect(statusAttribute.type.constructor.name).toBe('STRING');
      expect(statusAttribute.allowNull).toBe(true);
    });

    it('should have correct created_at attribute', () => {
      const createdAtAttribute = RoleBackup.getAttributes().created_at;
      expect(createdAtAttribute).toBeDefined();
      expect(createdAtAttribute.type.constructor.name).toBe('DATE');
      expect(createdAtAttribute.allowNull).toBe(true);
    });

    it('should have correct updated_at attribute', () => {
      const updatedAtAttribute = RoleBackup.getAttributes().updated_at;
      expect(updatedAtAttribute).toBeDefined();
      expect(updatedAtAttribute.type.constructor.name).toBe('DATE');
      expect(updatedAtAttribute.allowNull).toBe(true);
    });
  });

  describe('Model Creation', () => {
    it('should create a new role backup', async () => {
      const roleBackupData = {
        name: 'Admin Backup',
        code: 'admin_backup',
        description: 'Backup of admin role',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const roleBackup = await RoleBackup.create(roleBackupData);
      
      expect(roleBackup).toBeDefined();
      expect(roleBackup.id).toBeDefined();
      expect(roleBackup.name).toBe(roleBackupData.name);
      expect(roleBackup.code).toBe(roleBackupData.code);
      expect(roleBackup.description).toBe(roleBackupData.description);
      expect(roleBackup.status).toBe(roleBackupData.status);
    });

    it('should create a role backup with minimal data', async () => {
      const minimalData = {
        name: 'Minimal Role',
      };

      const roleBackup = await RoleBackup.create(minimalData);
      
      expect(roleBackup).toBeDefined();
      expect(roleBackup.id).toBeDefined();
      expect(roleBackup.name).toBe(minimalData.name);
    });
  });

  describe('Model Validation', () => {
    it('should allow null values for optional fields', async () => {
      const roleBackup = await RoleBackup.create({
        name: 'Null Test Role',
      });

      expect(roleBackup.code).toBeNull();
      expect(roleBackup.description).toBeNull();
      expect(roleBackup.status).toBeNull();
      expect(roleBackup.created_at).toBeNull();
      expect(roleBackup.updated_at).toBeNull();
    });

    it('should handle empty string values', async () => {
      const roleBackup = await RoleBackup.create({
        name: 'Empty String Role',
        code: '',
        description: '',
        status: '',
      });

      expect(roleBackup.code).toBe('');
      expect(roleBackup.description).toBe('');
      expect(roleBackup.status).toBe('');
    });

    it('should handle different status values', async () => {
      const statuses = ['active', 'inactive', 'pending', 'deleted'];
      
      for (const status of statuses) {
        const roleBackup = await RoleBackup.create({
          name: `Status ${status} Role`,
          status: status,
        });
        
        expect(roleBackup.status).toBe(status);
      }
    });

    it('should handle unique codes', async () => {
      const roleBackup1 = await RoleBackup.create({
        name: 'First Role',
        code: 'unique_code_1',
      });

      const roleBackup2 = await RoleBackup.create({
        name: 'Second Role',
        code: 'unique_code_2',
      });

      expect(roleBackup1.code).toBe('unique_code_1');
      expect(roleBackup2.code).toBe('unique_code_2');
    });
  });

  describe('Model Updates', () => {
    it('should update role backup attributes', async () => {
      const roleBackup = await RoleBackup.create({
        name: 'Update Test Role',
        code: 'update_test',
        status: 'active',
      });

      await roleBackup.update({
        name: 'Updated Role Name',
        description: 'Updated description',
        status: 'inactive',
      });

      const updatedRoleBackup = await RoleBackup.findByPk(roleBackup.id);
      expect(updatedRoleBackup?.name).toBe('Updated Role Name');
      expect(updatedRoleBackup?.description).toBe('Updated description');
      expect(updatedRoleBackup?.status).toBe('inactive');
      expect(updatedRoleBackup?.code).toBe('update_test'); // Should remain unchanged
    });

    it('should handle partial updates', async () => {
      const roleBackup = await RoleBackup.create({
        name: 'Partial Update Role',
        code: 'partial_test',
        description: 'Original description',
        status: 'active',
      });

      await roleBackup.update({
        status: 'inactive',
      });

      const updatedRoleBackup = await RoleBackup.findByPk(roleBackup.id);
      expect(updatedRoleBackup?.status).toBe('inactive');
      expect(updatedRoleBackup?.name).toBe('Partial Update Role'); // Should remain unchanged
      expect(updatedRoleBackup?.code).toBe('partial_test'); // Should remain unchanged
      expect(updatedRoleBackup?.description).toBe('Original description'); // Should remain unchanged
    });
  });

  describe('Model Queries', () => {
    it('should find role backup by id', async () => {
      const createdRoleBackup = await RoleBackup.create({
        name: 'Find By ID Role',
      });

      const foundRoleBackup = await RoleBackup.findByPk(createdRoleBackup.id);
      
      expect(foundRoleBackup).toBeDefined();
      expect(foundRoleBackup?.id).toBe(createdRoleBackup.id);
      expect(foundRoleBackup?.name).toBe('Find By ID Role');
    });

    it('should find role backup by name', async () => {
      await RoleBackup.create({
        name: 'Find By Name Role',
      });

      const foundRoleBackup = await RoleBackup.findOne({
        where: { name: 'Find By Name Role' },
      });
      
      expect(foundRoleBackup).toBeDefined();
      expect(foundRoleBackup?.name).toBe('Find By Name Role');
    });

    it('should find role backup by code', async () => {
      await RoleBackup.create({
        name: 'Code Test Role',
        code: 'test_code_123',
      });

      const foundRoleBackup = await RoleBackup.findOne({
        where: { code: 'test_code_123' },
      });
      
      expect(foundRoleBackup).toBeDefined();
      expect(foundRoleBackup?.code).toBe('test_code_123');
    });

    it('should find role backups by status', async () => {
      await RoleBackup.bulkCreate([
        { name: 'Active Role 1', status: 'active' },
        { name: 'Active Role 2', status: 'active' },
        { name: 'Inactive Role', status: 'inactive' },
      ]);

      const activeRoles = await RoleBackup.findAll({
        where: { status: 'active' },
      });
      
      expect(activeRoles).toHaveLength(2);
      expect(activeRoles.map(rb => rb.name)).toContain('Active Role 1');
      expect(activeRoles.map(rb => rb.name)).toContain('Active Role 2');
    });

    it('should find role backups with name containing specific text', async () => {
      await RoleBackup.bulkCreate([
        { name: 'Admin Backup Role' },
        { name: 'User Backup Role' },
        { name: 'Manager Backup Role' },
      ]);

      const adminRoles = await RoleBackup.findAll({
        where: {
          name: {
            [Op.like]: '%Admin%',
          },
        },
      });
      
      expect(adminRoles).toHaveLength(1);
      expect(adminRoles[0].name).toBe('Admin Backup Role');
    });
  });

  describe('Model Deletion', () => {
    it('should soft delete role backup', async () => {
      const roleBackup = await RoleBackup.create({
        name: 'Soft Delete Role',
      });

      await roleBackup.destroy();

      const deletedRoleBackup = await RoleBackup.findByPk(roleBackup.id);
      expect(deletedRoleBackup).toBeNull();

      // Check if it exists in paranoid mode
      const paranoidRoleBackup = await RoleBackup.findByPk(roleBackup.id, {
        paranoid: false,
      });
      expect(paranoidRoleBackup).toBeDefined();
    });

    it('should restore soft deleted role backup', async () => {
      const roleBackup = await RoleBackup.create({
        name: 'Restore Role',
      });

      await roleBackup.destroy();
      await roleBackup.restore();

      const restoredRoleBackup = await RoleBackup.findByPk(roleBackup.id);
      expect(restoredRoleBackup).toBeDefined();
      expect(restoredRoleBackup?.name).toBe('Restore Role');
    });
  });

  describe('Model Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const roleBackup = await RoleBackup.create({
        name: 'Timestamp Test Role',
      });

      expect(roleBackup.createdAt).toBeDefined();
      expect(roleBackup.updatedAt).toBeDefined();
      expect(roleBackup.createdAt).toBeInstanceOf(Date);
      expect(roleBackup.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on update', async () => {
      const roleBackup = await RoleBackup.create({
        name: 'Timestamp Update Role',
      });

      const originalUpdatedAt = roleBackup.updatedAt;
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await roleBackup.update({ status: 'inactive' });
      
      expect(roleBackup.updatedAt).toBeInstanceOf(Date);
      expect(roleBackup.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Business Logic Tests', () => {
    it('should handle role backup lifecycle', async () => {
      // Create role backup
      const roleBackup = await RoleBackup.create({
        name: 'Lifecycle Role',
        code: 'lifecycle_code',
        status: 'active',
        description: 'Role for lifecycle testing',
      });

      const originalId = roleBackup.id;

      // Update role backup
      await roleBackup.update({
        name: 'Updated Lifecycle Role',
        status: 'inactive',
      });

      const updatedRoleBackup = await RoleBackup.findByPk(originalId);
      expect(updatedRoleBackup?.name).toBe('Updated Lifecycle Role');
      expect(updatedRoleBackup?.status).toBe('inactive');

      // Soft delete role backup
      await roleBackup.destroy();

      const deletedRoleBackup = await RoleBackup.findByPk(originalId);
      expect(deletedRoleBackup).toBeNull();

      // Restore role backup
      await roleBackup.restore();

      const restoredRoleBackup = await RoleBackup.findByPk(originalId);
      expect(restoredRoleBackup).toBeDefined();
      expect(restoredRoleBackup?.name).toBe('Updated Lifecycle Role');
    });

    it('should handle date fields correctly', async () => {
      const testDate = new Date();
      const roleBackup = await RoleBackup.create({
        name: 'Date Test Role',
        created_at: testDate,
        updated_at: testDate,
      });

      expect(roleBackup.created_at).toBeInstanceOf(Date);
      expect(roleBackup.updated_at).toBeInstanceOf(Date);
      expect(roleBackup.created_at?.getTime()).toBe(testDate.getTime());
      expect(roleBackup.updated_at?.getTime()).toBe(testDate.getTime());
    });

    it('should handle role backup search scenarios', async () => {
      await RoleBackup.bulkCreate([
        { name: 'System Admin Backup', code: 'sys_admin_backup', status: 'active' },
        { name: 'User Manager Backup', code: 'user_mgr_backup', status: 'inactive' },
        { name: 'Content Editor Backup', code: 'content_editor_backup', status: 'active' },
      ]);

      // Find active roles
      const activeRoles = await RoleBackup.findAll({
        where: { status: 'active' },
      });
      expect(activeRoles).toHaveLength(2);

      // Find roles with specific code pattern
      const adminRoles = await RoleBackup.findAll({
        where: {
          code: {
            [Op.like]: '%admin%',
          },
        },
      });
      expect(adminRoles).toHaveLength(1);
      expect(adminRoles[0].name).toBe('System Admin Backup');

      // Find roles ordered by name
      const orderedRoles = await RoleBackup.findAll({
        order: [['name', 'ASC']],
      });
      expect(orderedRoles[0].name).toBe('Content Editor Backup');
      expect(orderedRoles[1].name).toBe('System Admin Backup');
      expect(orderedRoles[2].name).toBe('User Manager Backup');
    });

    it('should handle role backup with long descriptions', async () => {
      const longDescription = 'This is a very long description for a role backup that contains multiple sentences and provides detailed information about the role purpose and responsibilities.';
      
      const roleBackup = await RoleBackup.create({
        name: 'Long Description Role',
        description: longDescription,
      });

      expect(roleBackup.description).toBe(longDescription);
    });

    it('should handle role backup with special characters in name and code', async () => {
      const roleBackup = await RoleBackup.create({
        name: 'Special Role @#$%',
        code: 'special_code_@#$%',
        description: 'Role with special characters',
      });

      expect(roleBackup.name).toBe('Special Role @#$%');
      expect(roleBackup.code).toBe('special_code_@#$%');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long names', async () => {
      const longName = 'a'.repeat(255); // Maximum string length
      
      const roleBackup = await RoleBackup.create({
        name: longName,
      });

      expect(roleBackup.name).toBe(longName);
    });

    it('should handle unicode characters', async () => {
      const roleBackup = await RoleBackup.create({
        name: '中文角色',
        code: 'chinese_role',
        description: '角色描述',
        status: '活跃',
      });

      expect(roleBackup.name).toBe('中文角色');
      expect(roleBackup.description).toBe('角色描述');
      expect(roleBackup.status).toBe('活跃');
    });

    it('should handle numeric strings in fields', async () => {
      const roleBackup = await RoleBackup.create({
        name: '12345',
        code: 'code_123',
        description: 'Description 123',
        status: '123',
      });

      expect(roleBackup.name).toBe('12345');
      expect(roleBackup.code).toBe('code_123');
      expect(roleBackup.description).toBe('Description 123');
      expect(roleBackup.status).toBe('123');
    });
  });
});