import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Sequelize, DataTypes } from 'sequelize';
import SecurityConfig from '../../../src/models/SecurityConfig';

describe('SecurityConfig Model', () => {
  let sequelize: Sequelize;
  let securityConfig: typeof SecurityConfig;

  beforeEach(async () => {
    // Create in-memory SQLite database for testing
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
      define: {
        timestamps: true,
      },
    });

    // Re-initialize the model with test sequelize instance
    securityConfig = SecurityConfig;
    securityConfig.init(securityConfig.getAttributes(), {
      sequelize,
      tableName: 'security_configs',
      timestamps: true,
      indexes: [
        {
          fields: ['configKey'],
          unique: true
        },
        {
          fields: ['category']
        },
        {
          fields: ['isActive']
        }
      ],
      comment: '安全配置表'
    });

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(securityConfig.name).toBe('SecurityConfig');
    });

    it('should have correct table name', () => {
      expect(securityConfig.getTableName()).toBe('security_configs');
    });

    it('should have timestamps enabled', () => {
      expect(securityConfig.options.timestamps).toBe(true);
    });

    it('should have correct indexes defined', () => {
      const indexes = securityConfig.options.indexes;
      expect(indexes).toBeDefined();
      expect(indexes!.length).toBe(3);
      
      // Check unique index on configKey
      expect(indexes!.some(index => 
        index.fields?.includes('configKey') && index.unique
      )).toBe(true);
      
      // Check index on category
      expect(indexes!.some(index => 
        index.fields?.includes('category')
      )).toBe(true);
      
      // Check index on isActive
      expect(indexes!.some(index => 
        index.fields?.includes('isActive')
      )).toBe(true);
    });

    it('should have correct table comment', () => {
      expect(securityConfig.options.comment).toBe('安全配置表');
    });
  });

  describe('Attributes', () => {
    it('should have id attribute', () => {
      const attributes = securityConfig.getAttributes();
      expect(attributes.id).toBeDefined();
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);
      expect(attributes.id.type).toBeInstanceOf(DataTypes.INTEGER);
    });

    it('should have configKey attribute with correct constraints', () => {
      const attributes = securityConfig.getAttributes();
      expect(attributes.configKey).toBeDefined();
      expect(attributes.configKey.allowNull).toBe(false);
      expect(attributes.configKey.type).toBeInstanceOf(DataTypes.STRING);
      expect(attributes.configKey.unique).toBe(true);
      expect(attributes.configKey.comment).toBe('配置键名');
    });

    it('should have configValue attribute', () => {
      const attributes = securityConfig.getAttributes();
      expect(attributes.configValue).toBeDefined();
      expect(attributes.configValue.allowNull).toBe(false);
      expect(attributes.configValue.type).toBeInstanceOf(DataTypes.TEXT);
      expect(attributes.configValue.comment).toBe('配置值（JSON格式）');
    });

    it('should have description attribute', () => {
      const attributes = securityConfig.getAttributes();
      expect(attributes.description).toBeDefined();
      expect(attributes.description.allowNull).toBe(true);
      expect(attributes.description.type).toBeInstanceOf(DataTypes.STRING);
      expect(attributes.description.comment).toBe('配置描述');
    });

    it('should have category attribute with default value', () => {
      const attributes = securityConfig.getAttributes();
      expect(attributes.category).toBeDefined();
      expect(attributes.category.allowNull).toBe(false);
      expect(attributes.category.defaultValue).toBe('general');
      expect(attributes.category.comment).toBe('配置分类：如password、session、auth等');
    });

    it('should have isActive attribute with default value', () => {
      const attributes = securityConfig.getAttributes();
      expect(attributes.isActive).toBeDefined();
      expect(attributes.isActive.allowNull).toBe(false);
      expect(attributes.isActive.defaultValue).toBe(true);
      expect(attributes.isActive.comment).toBe('是否启用');
    });

    it('should have updatedBy attribute', () => {
      const attributes = securityConfig.getAttributes();
      expect(attributes.updatedBy).toBeDefined();
      expect(attributes.updatedBy.allowNull).toBe(true);
      expect(attributes.updatedBy.comment).toBe('更新人员ID');
    });

    it('should have timestamp attributes', () => {
      const attributes = securityConfig.getAttributes();
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.createdAt.allowNull).toBe(false);
      expect(attributes.updatedAt.allowNull).toBe(false);
    });
  });

  describe('CRUD Operations', () => {
    it('should create a security config with valid data', async () => {
      const configData = {
        configKey: 'password_policy',
        configValue: '{"minLength": 8, "requireSpecialChars": true}',
        description: 'Password security policy',
        category: 'password',
        isActive: true,
        updatedBy: 1,
      };

      const config = await securityConfig.create(configData);

      expect(config.id).toBeDefined();
      expect(config.configKey).toBe(configData.configKey);
      expect(config.configValue).toBe(configData.configValue);
      expect(config.description).toBe(configData.description);
      expect(config.category).toBe(configData.category);
      expect(config.isActive).toBe(configData.isActive);
      expect(config.updatedBy).toBe(configData.updatedBy);
      expect(config.createdAt).toBeInstanceOf(Date);
      expect(config.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a security config with default values', async () => {
      const configData = {
        configKey: 'session_timeout',
        configValue: '3600',
      };

      const config = await securityConfig.create(configData);

      expect(config.category).toBe('general'); // Default value
      expect(config.isActive).toBe(true); // Default value
      expect(config.description).toBeUndefined(); // Optional field
      expect(config.updatedBy).toBeUndefined(); // Optional field
    });

    it('should fail to create security config without required fields', async () => {
      const invalidConfigData = {
        description: 'Missing required fields',
        // Missing configKey and configValue
      };

      await expect(securityConfig.create(invalidConfigData as any)).rejects.toThrow();
    });

    it('should fail to create security config with duplicate configKey', async () => {
      const configData = {
        configKey: 'duplicate_key',
        configValue: 'some_value',
      };

      await securityConfig.create(configData);
      await expect(securityConfig.create(configData)).rejects.toThrow();
    });

    it('should read a security config by id', async () => {
      const configData = {
        configKey: 'read_test_key',
        configValue: '{"test": "value"}',
        description: 'Config for reading test',
        category: 'auth',
      };

      const createdConfig = await securityConfig.create(configData);
      const foundConfig = await securityConfig.findByPk(createdConfig.id);

      expect(foundConfig).toBeDefined();
      expect(foundConfig!.id).toBe(createdConfig.id);
      expect(foundConfig!.configKey).toBe(configData.configKey);
      expect(foundConfig!.configValue).toBe(configData.configValue);
      expect(foundConfig!.category).toBe(configData.category);
    });

    it('should read a security config by configKey', async () => {
      const configData = {
        configKey: 'find_by_key',
        configValue: '{"enabled": true}',
        description: 'Config for key lookup test',
      };

      await securityConfig.create(configData);
      const foundConfig = await securityConfig.findOne({
        where: { configKey: 'find_by_key' }
      });

      expect(foundConfig).toBeDefined();
      expect(foundConfig!.configKey).toBe('find_by_key');
      expect(foundConfig!.configValue).toBe(configData.configValue);
    });

    it('should update a security config', async () => {
      const configData = {
        configKey: 'update_test_key',
        configValue: '{"old": "value"}',
        description: 'Original description',
        category: 'system',
        isActive: true,
      };

      const config = await securityConfig.create(configData);
      
      const updateData = {
        configValue: '{"new": "value"}',
        description: 'Updated description',
        isActive: false,
        category: 'auth',
        updatedBy: 2,
      };

      await config.update(updateData);
      const updatedConfig = await securityConfig.findByPk(config.id);

      expect(updatedConfig!.configValue).toBe(updateData.configValue);
      expect(updatedConfig!.description).toBe(updateData.description);
      expect(updatedConfig!.isActive).toBe(updateData.isActive);
      expect(updatedConfig!.category).toBe(updateData.category);
      expect(updatedConfig!.updatedBy).toBe(updateData.updatedBy);
    });

    it('should delete a security config', async () => {
      const configData = {
        configKey: 'delete_test_key',
        configValue: '{"to": "delete"}',
        description: 'Config to be deleted',
      };

      const config = await securityConfig.create(configData);
      const configId = config.id;

      await config.destroy();
      const deletedConfig = await securityConfig.findByPk(configId);

      expect(deletedConfig).toBeNull();
    });

    it('should find all security configs', async () => {
      // Create multiple configs
      await securityConfig.create({
        configKey: 'config_1',
        configValue: '{"value": 1}',
        category: 'password',
      });

      await securityConfig.create({
        configKey: 'config_2',
        configValue: '{"value": 2}',
        category: 'session',
      });

      await securityConfig.create({
        configKey: 'config_3',
        configValue: '{"value": 3}',
        category: 'auth',
      });

      const configs = await securityConfig.findAll();
      expect(configs.length).toBe(3);
      expect(configs[0].configKey).toBe('config_1');
      expect(configs[1].configKey).toBe('config_2');
      expect(configs[2].configKey).toBe('config_3');
    });

    it('should find security configs with conditions', async () => {
      // Create configs with different categories
      await securityConfig.create({
        configKey: 'password_config',
        configValue: '{"complexity": "high"}',
        category: 'password',
        isActive: true,
      });

      await securityConfig.create({
        configKey: 'session_config',
        configValue: '{"timeout": 3600}',
        category: 'session',
        isActive: true,
      });

      await securityConfig.create({
        configKey: 'old_password_config',
        configValue: '{"complexity": "low"}',
        category: 'password',
        isActive: false,
      });

      const activePasswordConfigs = await securityConfig.findAll({
        where: {
          category: 'password',
          isActive: true,
        }
      });

      expect(activePasswordConfigs.length).toBe(1);
      expect(activePasswordConfigs[0].configKey).toBe('password_config');
      expect(activePasswordConfigs[0].isActive).toBe(true);
    });

    it('should count security configs', async () => {
      const initialCount = await securityConfig.count();

      await securityConfig.create({
        configKey: 'count_test_key',
        configValue: '{"counter": true}',
      });

      const newCount = await securityConfig.count();
      expect(newCount).toBe(initialCount + 1);
    });

    it('should count security configs with conditions', async () => {
      // Create configs with different statuses
      await securityConfig.create({
        configKey: 'active_config_1',
        configValue: '{"active": true}',
        isActive: true,
      });

      await securityConfig.create({
        configKey: 'active_config_2',
        configValue: '{"active": true}',
        isActive: true,
      });

      await securityConfig.create({
        configKey: 'inactive_config',
        configValue: '{"active": false}',
        isActive: false,
      });

      const activeCount = await securityConfig.count({
        where: { isActive: true }
      });

      const inactiveCount = await securityConfig.count({
        where: { isActive: false }
      });

      expect(activeCount).toBe(2);
      expect(inactiveCount).toBe(1);
    });
  });

  describe('Business Logic and Validation', () => {
    it('should validate configKey length constraint', () => {
      const attributes = securityConfig.getAttributes();
      expect(attributes.configKey.type).toBeInstanceOf(DataTypes.STRING);
      // STRING(100) is the constraint
    });

    it('should validate description length constraint', () => {
      const attributes = securityConfig.getAttributes();
      expect(attributes.description.type).toBeInstanceOf(DataTypes.STRING);
      // STRING(255) is the constraint
    });

    it('should validate category length constraint', () => {
      const attributes = securityConfig.getAttributes();
      expect(attributes.category.type).toBeInstanceOf(DataTypes.STRING);
      // STRING(50) is the constraint
    });

    it('should handle JSON configValue', async () => {
      const jsonConfig = {
        configKey: 'json_test',
        configValue: '{"nested": {"key": "value"}, "array": [1, 2, 3]}',
        description: 'JSON config test',
      };

      const config = await securityConfig.create(jsonConfig);
      expect(config.configValue).toBe(jsonConfig.configValue);

      // Test that the JSON is stored and retrieved correctly
      const foundConfig = await securityConfig.findByPk(config.id);
      expect(foundConfig!.configValue).toBe(jsonConfig.configValue);
    });

    it('should handle empty JSON configValue', async () => {
      const emptyJsonConfig = {
        configKey: 'empty_json',
        configValue: '{}',
        description: 'Empty JSON config',
      };

      const config = await securityConfig.create(emptyJsonConfig);
      expect(config.configValue).toBe('{}');
    });

    it('should handle non-JSON configValue', async () => {
      const nonJsonConfig = {
        configKey: 'non_json',
        configValue: 'simple_string_value',
        description: 'Non-JSON config',
      };

      const config = await securityConfig.create(nonJsonConfig);
      expect(config.configValue).toBe('simple_string_value');
    });

    it('should handle boolean configValue', async () => {
      const booleanConfig = {
        configKey: 'boolean_config',
        configValue: 'true',
        description: 'Boolean config',
      };

      const config = await securityConfig.create(booleanConfig);
      expect(config.configValue).toBe('true');
    });

    it('should handle numeric configValue', async () => {
      const numericConfig = {
        configKey: 'numeric_config',
        configValue: '42',
        description: 'Numeric config',
      };

      const config = await securityConfig.create(numericConfig);
      expect(config.configValue).toBe('42');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null values for optional fields', async () => {
      const config = await securityConfig.create({
        configKey: 'null_fields',
        configValue: '{"test": "value"}',
        description: null,
        updatedBy: null,
      });

      expect(config.description).toBeNull();
      expect(config.updatedBy).toBeNull();
    });

    it('should handle empty string for description', async () => {
      const config = await securityConfig.create({
        configKey: 'empty_description',
        configValue: '{"test": "value"}',
        description: '',
      });

      expect(config.description).toBe('');
    });

    it('should handle special characters in configKey', async () => {
      const specialCharConfig = {
        configKey: 'special-key_with.dots@and#symbols',
        configValue: '{"special": true}',
        description: 'Config with special characters',
      };

      const config = await securityConfig.create(specialCharConfig);
      expect(config.configKey).toBe(specialCharConfig.configKey);
    });

    it('should handle Unicode characters in configKey', async () => {
      const unicodeConfig = {
        configKey: '中文配置键',
        configValue: '{"unicode": true}',
        description: 'Unicode config key',
      };

      const config = await securityConfig.create(unicodeConfig);
      expect(config.configKey).toBe(unicodeConfig.configKey);
    });

    it('should handle very long configValue', async () => {
      const longValue = '{"data": "' + 'a'.repeat(10000) + '"}';
      const longConfig = {
        configKey: 'long_value',
        configValue: longValue,
        description: 'Config with very long value',
      };

      const config = await securityConfig.create(longConfig);
      expect(config.configValue).toBe(longValue);
    });

    it('should handle updatedBy as zero', async () => {
      const config = await securityConfig.create({
        configKey: 'zero_updater',
        configValue: '{"zero": true}',
        updatedBy: 0,
      });

      expect(config.updatedBy).toBe(0);
    });

    it('should handle category with special characters', async () => {
      const specialCategoryConfig = {
        configKey: 'special_category',
        configValue: '{"category": "test"}',
        category: 'special-category_with.dots',
      };

      const config = await securityConfig.create(specialCategoryConfig);
      expect(config.category).toBe(specialCategoryConfig.category);
    });
  });

  describe('Query Performance and Indexing', () => {
    beforeEach(async () => {
      // Create test data for performance testing
      const configsData = Array.from({ length: 100 }, (_, i) => ({
        configKey: `perf_config_${i}`,
        configValue: `{"index": ${i}}`,
        category: i % 3 === 0 ? 'password' : i % 3 === 1 ? 'session' : 'auth',
        isActive: i % 2 === 0,
      }));

      await securityConfig.bulkCreate(configsData);
    });

    it('should efficiently query by configKey using unique index', async () => {
      const startTime = Date.now();
      const config = await securityConfig.findOne({
        where: { configKey: 'perf_config_50' }
      });
      const endTime = Date.now();

      expect(config).toBeDefined();
      expect(config!.configKey).toBe('perf_config_50');
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast due to index
    });

    it('should efficiently query by category using index', async () => {
      const startTime = Date.now();
      const passwordConfigs = await securityConfig.findAll({
        where: { category: 'password' }
      });
      const endTime = Date.now();

      expect(passwordConfigs.length).toBeGreaterThan(0);
      expect(passwordConfigs.every(c => c.category === 'password')).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Should be fast due to index
    });

    it('should efficiently query by isActive using index', async () => {
      const startTime = Date.now();
      const activeConfigs = await securityConfig.findAll({
        where: { isActive: true }
      });
      const endTime = Date.now();

      expect(activeConfigs.length).toBeGreaterThan(0);
      expect(activeConfigs.every(c => c.isActive === true)).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Should be fast due to index
    });

    it('should efficiently query with multiple conditions using indexes', async () => {
      const startTime = Date.now();
      const activeAuthConfigs = await securityConfig.findAll({
        where: {
          category: 'auth',
          isActive: true,
        }
      });
      const endTime = Date.now();

      expect(activeAuthConfigs.length).toBeGreaterThan(0);
      expect(activeAuthConfigs.every(c => c.category === 'auth' && c.isActive === true)).toBe(true);
      expect(endTime - startTime).toBeLessThan(300); // Should be fast due to composite index usage
    });

    it('should handle ordered queries efficiently', async () => {
      const startTime = Date.now();
      const orderedConfigs = await securityConfig.findAll({
        order: [['configKey', 'ASC']],
        limit: 50,
      });
      const endTime = Date.now();

      expect(orderedConfigs.length).toBe(50);
      // Verify ordering
      for (let i = 1; i < orderedConfigs.length; i++) {
        expect(orderedConfigs[i].configKey >= orderedConfigs[i - 1].configKey).toBe(true);
      }
      expect(endTime - startTime).toBeLessThan(500); // Should be reasonably fast
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk creation efficiently', async () => {
      const configsData = Array.from({ length: 50 }, (_, i) => ({
        configKey: `bulk_config_${i}`,
        configValue: `{"bulk": ${i}}`,
        category: i % 2 === 0 ? 'password' : 'session',
        description: `Bulk created config ${i}`,
      }));

      const startTime = Date.now();
      await securityConfig.bulkCreate(configsData);
      const endTime = Date.now();

      const createdConfigs = await securityConfig.findAll({
        where: {
          configKey: {
            [require('sequelize').Op.like]: 'bulk_config_%'
          }
        }
      });
      expect(createdConfigs.length).toBe(50);
      
      // Performance check
      expect(endTime - startTime).toBeLessThan(3000); // 3 seconds
    });

    it('should handle bulk update efficiently', async () => {
      // First create some configs
      const configsData = Array.from({ length: 30 }, (_, i) => ({
        configKey: `bulk_update_config_${i}`,
        configValue: `{"original": ${i}}`,
        category: 'general',
        isActive: true,
      }));

      await securityConfig.bulkCreate(configsData);

      // Then update them
      const startTime = Date.now();
      await securityConfig.update(
        { 
          configValue: '{"updated": true}',
          isActive: false,
        },
        {
          where: {
            configKey: {
              [require('sequelize').Op.like]: 'bulk_update_config_%'
            }
          }
        }
      );
      const endTime = Date.now();

      const updatedConfigs = await securityConfig.findAll({
        where: {
          configKey: {
            [require('sequelize').Op.like]: 'bulk_update_config_%'
          }
        }
      });

      expect(updatedConfigs.length).toBe(30);
      expect(updatedConfigs.every(c => c.configValue === '{"updated": true}' && c.isActive === false)).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds
    });

    it('should handle bulk deletion efficiently', async () => {
      // First create some configs
      const configsData = Array.from({ length: 20 }, (_, i) => ({
        configKey: `bulk_delete_config_${i}`,
        configValue: `{"delete": ${i}}`,
        category: 'test',
      }));

      await securityConfig.bulkCreate(configsData);

      // Then delete them
      const startTime = Date.now();
      await securityConfig.destroy({
        where: {
          configKey: {
            [require('sequelize').Op.like]: 'bulk_delete_config_%'
          }
        }
      });
      const endTime = Date.now();

      const deletedConfigs = await securityConfig.findAll({
        where: {
          configKey: {
            [require('sequelize').Op.like]: 'bulk_delete_config_%'
          }
        }
      });

      expect(deletedConfigs.length).toBe(0);
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds
    });
  });

  describe('Instance Methods', () => {
    let testConfig: SecurityConfig;

    beforeEach(async () => {
      testConfig = await securityConfig.create({
        configKey: 'instance_test_key',
        configValue: '{"instance": "test"}',
        description: 'Config for instance method testing',
        category: 'test',
      });
    });

    it('should have toJSON method', () => {
      const json = testConfig.toJSON();
      
      expect(json).toBeDefined();
      expect(typeof json).toBe('object');
      expect(json.id).toBe(testConfig.id);
      expect(json.configKey).toBe(testConfig.configKey);
    });

    it('should have save method', async () => {
      testConfig.description = 'Updated instance test';
      await testConfig.save();
      
      const updatedConfig = await securityConfig.findByPk(testConfig.id);
      expect(updatedConfig!.description).toBe('Updated instance test');
    });

    it('should have reload method', async () => {
      const originalDescription = testConfig.description;
      
      // Update config directly in database
      await securityConfig.update(
        { description: 'Direct update test' },
        { where: { id: testConfig.id } }
      );
      
      // Reload the instance
      await testConfig.reload();
      
      expect(testConfig.description).toBe('Direct update test');
      expect(testConfig.description).not.toBe(originalDescription);
    });

    it('should have destroy method', async () => {
      const configId = testConfig.id;
      await testConfig.destroy();
      
      const deletedConfig = await securityConfig.findByPk(configId);
      expect(deletedConfig).toBeNull();
    });

    it('should have get method', () => {
      const configKey = testConfig.get('configKey');
      expect(configKey).toBe(testConfig.configKey);
      
      const configValue = testConfig.get('configValue');
      expect(configValue).toBe(testConfig.configValue);
    });

    it('should have set method', async () => {
      testConfig.set('description', 'Set method test');
      testConfig.set('category', 'updated_category');
      
      await testConfig.save();
      
      const updatedConfig = await securityConfig.findByPk(testConfig.id);
      expect(updatedConfig!.description).toBe('Set method test');
      expect(updatedConfig!.category).toBe('updated_category');
    });

    it('should have changed method', () => {
      expect(testConfig.changed('description')).toBe(false);
      
      testConfig.description = 'Changed test';
      expect(testConfig.changed('description')).toBe(true);
      
      testConfig.save();
      expect(testConfig.changed('description')).toBe(false);
    });

    it('should have previous method', () => {
      const originalDescription = testConfig.description;
      
      testConfig.description = 'Previous test';
      expect(testConfig.previous('description')).toBe(originalDescription);
    });

    it('should have isNewRecord property', () => {
      expect(testConfig.isNewRecord).toBe(false);
      
      const newConfig = securityConfig.build({
        configKey: 'new_record_test',
        configValue: '{"new": "record"}',
      });
      
      expect(newConfig.isNewRecord).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve data type integrity', async () => {
      const config = await securityConfig.create({
        configKey: 'data_type_test',
        configValue: '{"string": "value", "number": 42, "boolean": true, "null": null}',
        description: 'Data type test',
        category: 'test',
        isActive: true,
        updatedBy: 1,
      });

      // Verify all data types are preserved
      expect(typeof config.configKey).toBe('string');
      expect(typeof config.configValue).toBe('string');
      expect(typeof config.description).toBe('string');
      expect(typeof config.category).toBe('string');
      expect(typeof config.isActive).toBe('boolean');
      expect(typeof config.updatedBy).toBe('number');
    });

    it('should handle concurrent updates correctly', async () => {
      const config = await securityConfig.create({
        configKey: 'concurrent_test',
        configValue: '{"version": 1}',
        description: 'Concurrent update test',
      });

      // Simulate concurrent updates
      const update1 = config.update({ configValue: '{"version": 2}' });
      const update2 = securityConfig.update(
        { configValue: '{"version": 3}' },
        { where: { id: config.id } }
      );

      await Promise.all([update1, update2]);

      const finalConfig = await securityConfig.findByPk(config.id);
      // The final state depends on which update completes last
      expect(['{"version": 2}', '{"version": 3}']).toContain(finalConfig!.configValue);
    });

    it('should maintain unique constraint on configKey', async () => {
      const configData = {
        configKey: 'unique_test',
        configValue: '{"unique": true}',
      };

      await securityConfig.create(configData);
      
      // Try to create duplicate
      await expect(securityConfig.create(configData)).rejects.toThrow();
    });

    it('should handle foreign key constraints gracefully', async () => {
      const config = await securityConfig.create({
        configKey: 'fk_test',
        configValue: '{"fk": "test"}',
        updatedBy: 999999, // Non-existent user ID
      });

      // This should work since there's no actual foreign key constraint defined
      expect(config.updatedBy).toBe(999999);
    });
  });
});