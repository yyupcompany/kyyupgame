import { SequelizeMeta } from '../../../src/models/sequelizemeta.model';
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

describe('SequelizeMeta Model', () => {
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
      expect(SequelizeMeta).toBeDefined();
    });

    it('should have correct model name', () => {
      expect(SequelizeMeta.name).toBe('SequelizeMeta');
    });

    it('should have correct table name', () => {
      expect(SequelizeMeta.tableName).toBe('sequelize_meta');
    });

    it('should have timestamps disabled', () => {
      expect(SequelizeMeta.options.timestamps).toBe(false);
    });

    it('should not have paranoid enabled', () => {
      expect(SequelizeMeta.options.paranoid).toBeUndefined();
    });

    it('should not have underscored enabled', () => {
      expect(SequelizeMeta.options.underscored).toBeUndefined();
    });
  });

  describe('Model Attributes', () => {
    it('should have correct name attribute', () => {
      const nameAttribute = SequelizeMeta.getAttributes().name;
      expect(nameAttribute).toBeDefined();
      expect(nameAttribute.type.constructor.name).toBe('STRING');
      expect(nameAttribute.allowNull).toBe(false);
      expect(nameAttribute.primaryKey).toBe(true);
    });

    it('should only have name attribute', () => {
      const attributes = SequelizeMeta.getAttributes();
      const attributeNames = Object.keys(attributes);
      expect(attributeNames).toHaveLength(1);
      expect(attributeNames).toContain('name');
    });
  });

  describe('Model Creation', () => {
    it('should create a new sequelize meta record', async () => {
      const metaName = '20250115000000-create-initial-tables';
      
      const sequelizeMeta = await SequelizeMeta.create({
        name: metaName,
      });
      
      expect(sequelizeMeta).toBeDefined();
      expect(sequelizeMeta.name).toBe(metaName);
    });

    it('should create multiple sequelize meta records', async () => {
      const metaNames = [
        '20250115000001-create-users-table',
        '20250115000002-create-roles-table',
        '20250115000003-create-permissions-table',
      ];

      const createdMetas = await SequelizeMeta.bulkCreate(
        metaNames.map(name => ({ name }))
      );
      
      expect(createdMetas).toHaveLength(3);
      expect(createdMetas.map(meta => meta.name)).toEqual(metaNames);
    });
  });

  describe('Model Validation', () => {
    it('should require name field', async () => {
      await expect(SequelizeMeta.create({} as any)).rejects.toThrow();
    });

    it('should handle empty string name', async () => {
      const sequelizeMeta = await SequelizeMeta.create({
        name: '',
      });

      expect(sequelizeMeta.name).toBe('');
    });

    it('should handle very long names', async () => {
      const longName = 'a'.repeat(1000); // Very long migration name
      
      const sequelizeMeta = await SequelizeMeta.create({
        name: longName,
      });

      expect(sequelizeMeta.name).toBe(longName);
    });

    it('should handle special characters in name', async () => {
      const specialNames = [
        '20250115000000-create-initial-tables',
        '20250115000001-add-user-settings',
        '20250115000002_update-email-field',
        '20250115000003:drop-temp-column',
        '20250115000004.create.index.table',
      ];

      for (const name of specialNames) {
        const sequelizeMeta = await SequelizeMeta.create({
          name: name,
        });

        expect(sequelizeMeta.name).toBe(name);
      }
    });

    it('should handle unicode characters in name', async () => {
      const unicodeNames = [
        '20250115000000-创建初始表',
        '20250115000001-添加用户设置',
        '20250115000002-更新邮件字段',
        '20250115000003-删除临时列',
      ];

      for (const name of unicodeNames) {
        const sequelizeMeta = await SequelizeMeta.create({
          name: name,
        });

        expect(sequelizeMeta.name).toBe(name);
      }
    });
  });

  describe('Model Updates', () => {
    it('should update sequelize meta record', async () => {
      const originalName = '20250115000000-original-migration';
      const updatedName = '20250115000000-updated-migration';
      
      const sequelizeMeta = await SequelizeMeta.create({
        name: originalName,
      });

      await sequelizeMeta.update({
        name: updatedName,
      });

      const updatedSequelizeMeta = await SequelizeMeta.findByPk(updatedName);
      expect(updatedSequelizeMeta?.name).toBe(updatedName);
    });

    it('should handle partial updates', async () => {
      // Since there's only one field, partial updates don't make much sense
      // but we'll test the basic update functionality
      const sequelizeMeta = await SequelizeMeta.create({
        name: 'partial-update-test',
      });

      await sequelizeMeta.update({
        name: 'partial-update-test-updated',
      });

      const updatedSequelizeMeta = await SequelizeMeta.findByPk('partial-update-test-updated');
      expect(updatedSequelizeMeta?.name).toBe('partial-update-test-updated');
    });
  });

  describe('Model Queries', () => {
    it('should find sequelize meta by primary key (name)', async () => {
      const metaName = '20250115000000-find-by-pk-test';
      
      await SequelizeMeta.create({
        name: metaName,
      });

      const foundSequelizeMeta = await SequelizeMeta.findByPk(metaName);
      
      expect(foundSequelizeMeta).toBeDefined();
      expect(foundSequelizeMeta?.name).toBe(metaName);
    });

    it('should find all sequelize meta records', async () => {
      // Clear existing records for clean test
      await SequelizeMeta.destroy({ where: {} });
      
      const metaNames = [
        '20250115000000-migration-1',
        '20250115000001-migration-2',
        '20250115000002-migration-3',
      ];

      await SequelizeMeta.bulkCreate(
        metaNames.map(name => ({ name }))
      );

      const allMetas = await SequelizeMeta.findAll();
      
      expect(allMetas).toHaveLength(3);
      const foundNames = allMetas.map(meta => meta.name).sort();
      const expectedNames = metaNames.sort();
      expect(foundNames).toEqual(expectedNames);
    });

    it('should find sequelize meta by name using findOne', async () => {
      const metaName = '20250115000000-find-one-test';
      
      await SequelizeMeta.create({
        name: metaName,
      });

      const foundSequelizeMeta = await SequelizeMeta.findOne({
        where: { name: metaName },
      });
      
      expect(foundSequelizeMeta).toBeDefined();
      expect(foundSequelizeMeta?.name).toBe(metaName);
    });

    it('should find sequelize meta records with name pattern', async () => {
      const metaNames = [
        '20250115000000-create-users',
        '20250115000001-create-roles',
        '20250115000002-create-permissions',
        '20250115000003-add-constraints',
      ];

      await SequelizeMeta.bulkCreate(
        metaNames.map(name => ({ name }))
      );

      const createMetas = await SequelizeMeta.findAll({
        where: {
          name: {
            [Op.like]: '%create%',
          },
        },
        order: [['name', 'ASC']],
      });
      
      expect(createMetas).toHaveLength(3);
      expect(createMetas.map(meta => meta.name)).toContain('20250115000000-create-users');
      expect(createMetas.map(meta => meta.name)).toContain('20250115000001-create-roles');
      expect(createMetas.map(meta => meta.name)).toContain('20250115000002-create-permissions');
    });

    it('should find sequelize meta records ordered by name', async () => {
      const metaNames = [
        '20250115000003-migration-c',
        '20250115000001-migration-a',
        '20250115000002-migration-b',
      ];

      await SequelizeMeta.bulkCreate(
        metaNames.map(name => ({ name }))
      );

      const orderedMetas = await SequelizeMeta.findAll({
        order: [['name', 'ASC']],
      });
      
      expect(orderedMetas).toHaveLength(3);
      expect(orderedMetas[0].name).toBe('20250115000001-migration-a');
      expect(orderedMetas[1].name).toBe('20250115000002-migration-b');
      expect(orderedMetas[2].name).toBe('20250115000003-migration-c');
    });

    it('should count sequelize meta records', async () => {
      // Clear existing records for clean test
      await SequelizeMeta.destroy({ where: {} });
      
      const metaNames = [
        '20250115000000-migration-1',
        '20250115000001-migration-2',
        '20250115000002-migration-3',
        '20250115000003-migration-4',
      ];

      await SequelizeMeta.bulkCreate(
        metaNames.map(name => ({ name }))
      );

      const count = await SequelizeMeta.count();
      expect(count).toBe(4);
    });
  });

  describe('Model Deletion', () => {
    it('should hard delete sequelize meta record (no paranoid)', async () => {
      const metaName = '20250115000000-delete-test';
      
      const sequelizeMeta = await SequelizeMeta.create({
        name: metaName,
      });

      await sequelizeMeta.destroy();

      const deletedSequelizeMeta = await SequelizeMeta.findByPk(metaName);
      expect(deletedSequelizeMeta).toBeNull();

      // Check if it exists in paranoid mode (should still be null since no paranoid)
      const paranoidSequelizeMeta = await SequelizeMeta.findByPk(metaName, {
        paranoid: false,
      });
      expect(paranoidSequelizeMeta).toBeNull();
    });

    it('should bulk delete sequelize meta records', async () => {
      const metaNames = [
        '20250115000000-bulk-delete-1',
        '20250115000001-bulk-delete-2',
        '20250115000002-bulk-delete-3',
      ];

      const createdMetas = await SequelizeMeta.bulkCreate(
        metaNames.map(name => ({ name }))
      );

      await SequelizeMeta.destroy({
        where: {
          name: {
            [Op.in]: metaNames,
          },
        },
      });

      for (const metaName of metaNames) {
        const deletedMeta = await SequelizeMeta.findByPk(metaName);
        expect(deletedMeta).toBeNull();
      }
    });
  });

  describe('Business Logic Tests', () => {
    it('should handle migration tracking workflow', async () => {
      // Simulate migration execution tracking
      const migrations = [
        '20250115000000-create-initial-tables',
        '20250115000001-create-user-table',
        '20250115000002-create-role-table',
        '20250115000003-add-user-role-association',
      ];

      // Mark migrations as executed
      for (const migration of migrations) {
        await SequelizeMeta.create({ name: migration });
      }

      // Check which migrations have been executed
      const executedMigrations = await SequelizeMeta.findAll({
        order: [['name', 'ASC']],
      });

      expect(executedMigrations).toHaveLength(4);
      expect(executedMigrations.map(m => m.name)).toEqual(migrations);

      // Check if a specific migration has been executed
      const userTableMigration = await SequelizeMeta.findByPk('20250115000001-create-user-table');
      expect(userTableMigration).toBeDefined();
      expect(userTableMigration?.name).toBe('20250115000001-create-user-table');

      // Check if a non-executed migration exists
      const nonExecutedMigration = await SequelizeMeta.findByPk('20250115000099-non-existent-migration');
      expect(nonExecutedMigration).toBeNull();
    });

    it('should handle migration rollback simulation', async () => {
      const migrationName = '20250115000000-rollback-test-migration';
      
      // Mark migration as executed
      await SequelizeMeta.create({ name: migrationName });

      // Verify migration is marked as executed
      const executedMigration = await SequelizeMeta.findByPk(migrationName);
      expect(executedMigration).toBeDefined();

      // Simulate rollback by removing the record
      await SequelizeMeta.destroy({
        where: { name: migrationName },
      });

      // Verify migration is no longer marked as executed
      const rolledBackMigration = await SequelizeMeta.findByPk(migrationName);
      expect(rolledBackMigration).toBeNull();
    });

    it('should handle migration ordering and dependencies', async () => {
      const orderedMigrations = [
        '20250115000000-create-users-table',
        '20250115000001-create-roles-table',
        '20250115000002-create-permissions-table',
        '20250115000003-create-user-role-table',
        '20250115000004-create-role-permission-table',
      ];

      // Mark migrations as executed in order
      for (const migration of orderedMigrations) {
        await SequelizeMeta.create({ name: migration });
      }

      // Get all executed migrations in order
      const allMigrations = await SequelizeMeta.findAll({
        order: [['name', 'ASC']],
      });

      expect(allMigrations).toHaveLength(5);
      expect(allMigrations.map(m => m.name)).toEqual(orderedMigrations);

      // Find the latest executed migration
      const latestMigration = allMigrations[allMigrations.length - 1];
      expect(latestMigration.name).toBe('20250115000004-create-role-permission-table');

      // Find pending migrations (simulated)
      const allPossibleMigrations = [
        ...orderedMigrations,
        '20250115000005-add-user-settings',
        '20250115000006-create-audit-log',
      ];

      const executedNames = allMigrations.map(m => m.name);
      const pendingMigrations = allPossibleMigrations.filter(name => !executedNames.includes(name));

      expect(pendingMigrations).toHaveLength(2);
      expect(pendingMigrations).toContain('20250115000005-add-user-settings');
      expect(pendingMigrations).toContain('20250115000006-create-audit-log');
    });

    it('should handle migration name validation patterns', async () => {
      const validMigrationPatterns = [
        '20250115000000-create-table',
        '20250115000001-add-column',
        '20250115000002-remove-column',
        '20250115000003-add-index',
        '20250115000004-drop-index',
        '20250115000005-add-constraint',
        '20250115000006-drop-constraint',
        '20250115000007-rename-table',
        '20250115000008-rename-column',
        '20250115000009-alter-column',
      ];

      for (const pattern of validMigrationPatterns) {
        const sequelizeMeta = await SequelizeMeta.create({
          name: pattern,
        });

        expect(sequelizeMeta.name).toBe(pattern);
      }
    });

    it('should handle duplicate migration names (should allow in model)', async () => {
      const migrationName = '20250115000000-duplicate-test';
      
      // Create first migration record
      const firstMigration = await SequelizeMeta.create({
        name: migrationName,
      });

      // Create second migration record with same name
      // (In real scenarios, this should be prevented by unique constraint)
      const secondMigration = await SequelizeMeta.create({
        name: migrationName,
      });

      expect(firstMigration.name).toBe(migrationName);
      expect(secondMigration.name).toBe(migrationName);

      // Find all records with this name
      const duplicateMigrations = await SequelizeMeta.findAll({
        where: { name: migrationName },
      });

      expect(duplicateMigrations).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty table state', async () => {
      // Clear all records
      await SequelizeMeta.destroy({ where: {} });

      const count = await SequelizeMeta.count();
      expect(count).toBe(0);

      const allMetas = await SequelizeMeta.findAll();
      expect(allMetas).toHaveLength(0);
    });

    it('should handle case-sensitive names', async () => {
      const caseSensitiveNames = [
        '20250115000000-Migration-One',
        '20250115000001-migration-two',
        '20250115000002-MIGRATION-THREE',
      ];

      for (const name of caseSensitiveNames) {
        const sequelizeMeta = await SequelizeMeta.create({
          name: name,
        });

        expect(sequelizeMeta.name).toBe(name);
      }

      // Query with exact case
      const exactCaseMeta = await SequelizeMeta.findByPk('20250115000000-Migration-One');
      expect(exactCaseMeta).toBeDefined();
      expect(exactCaseMeta?.name).toBe('20250115000000-Migration-One');

      // Query with different case (should not find if database is case-sensitive)
      const differentCaseMeta = await SequelizeMeta.findByPk('20250115000000-migration-one');
      expect(differentCaseMeta).toBeNull();
    });

    it('should handle SQL injection attempts in names', async () => {
      const maliciousNames = [
        '20250115000000-drop-table-users;--',
        '20250115000001-union-select-*-from-users',
        "20250115000002'; DROP TABLE users; --",
        '20250115000003-or-1=1--',
      ];

      for (const name of maliciousNames) {
        // These should be treated as literal strings, not SQL commands
        const sequelizeMeta = await SequelizeMeta.create({
          name: name,
        });

        expect(sequelizeMeta.name).toBe(name);

        // Should be able to retrieve the record
        const foundMeta = await SequelizeMeta.findByPk(name);
        expect(foundMeta).toBeDefined();
        expect(foundMeta?.name).toBe(name);
      }
    });

    it('should handle very large number of records', async () => {
      // Create many records (limit to reasonable number for testing)
      const recordCount = 100;
      const migrations = [];

      for (let i = 0; i < recordCount; i++) {
        const migrationName = `202501150000${i.toString().padStart(2, '0')}-migration-${i}`;
        migrations.push({ name: migrationName });
      }

      await SequelizeMeta.bulkCreate(migrations);

      const count = await SequelizeMeta.count();
      expect(count).toBeGreaterThanOrEqual(recordCount);

      // Test pagination
      const page1 = await SequelizeMeta.findAll({
        limit: 10,
        offset: 0,
        order: [['name', 'ASC']],
      });

      const page2 = await SequelizeMeta.findAll({
        limit: 10,
        offset: 10,
        order: [['name', 'ASC']],
      });

      expect(page1).toHaveLength(10);
      expect(page2).toHaveLength(10);
      expect(page1[0].name).not.toBe(page2[0].name);
    });

    it('should handle concurrent operations simulation', async () => {
      const migrationName = '20250115000000-concurrent-test';
      
      // Simulate concurrent creation
      const promises = [
        SequelizeMeta.create({ name: `${migrationName}-1` }),
        SequelizeMeta.create({ name: `${migrationName}-2` }),
        SequelizeMeta.create({ name: `${migrationName}-3` }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0].name).toBe(`${migrationName}-1`);
      expect(results[1].name).toBe(`${migrationName}-2`);
      expect(results[2].name).toBe(`${migrationName}-3`);

      // Verify all records exist
      for (let i = 1; i <= 3; i++) {
        const foundMeta = await SequelizeMeta.findByPk(`${migrationName}-${i}`);
        expect(foundMeta).toBeDefined();
      }
    });
  });

  describe('Performance Considerations', () => {
    it('should handle efficient queries with large datasets', async () => {
      // Create test data
      const testData = [];
      for (let i = 0; i < 50; i++) {
        testData.push({ name: `202501150000${i.toString().padStart(2, '0')}-perf-test-${i}` });
      }
      await SequelizeMeta.bulkCreate(testData);

      // Test efficient count query
      const countStart = Date.now();
      const count = await SequelizeMeta.count();
      const countEnd = Date.now();
      
      expect(count).toBeGreaterThan(0);
      expect(countEnd - countStart).toBeLessThan(100); // Should be fast

      // Test efficient find with limit
      const findStart = Date.now();
      const limitedResults = await SequelizeMeta.findAll({
        limit: 10,
        order: [['name', 'ASC']],
      });
      const findEnd = Date.now();
      
      expect(limitedResults).toHaveLength(10);
      expect(findEnd - findStart).toBeLessThan(100); // Should be fast

      // Clean up
      await SequelizeMeta.destroy({
        where: {
          name: {
            [Op.like]: '%perf-test%',
          },
        },
      });
    });
  });
});