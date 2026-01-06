import { SystemConfig, ConfigValueType, initSystemConfig, initSystemConfigAssociations } from '../../../src/models/system-config.model';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';
import { sequelize } from '../../../src/init';
import { Op } from 'sequelize';


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

describe('SystemConfig Model', () => {
  beforeAll(async () => {
    // 确保数据库连接正常
    await sequelize.authenticate();
    
    // 初始化模型
    initSystemConfig(sequelize);
    initSystemConfigAssociations();
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should be defined', () => {
      expect(SystemConfig).toBeDefined();
    });

    it('should have correct model name', () => {
      expect(SystemConfig.name).toBe('SystemConfig');
    });

    it('should have correct table name', () => {
      expect(SystemConfig.tableName).toBe('system_configs');
    });

    it('should have timestamps enabled', () => {
      expect(SystemConfig.options.timestamps).toBe(true);
    });

    it('should have underscored enabled', () => {
      expect(SystemConfig.options.underscored).toBe(true);
    });

    it('should have paranoid enabled', () => {
      expect(SystemConfig.options.paranoid).toBe(true);
    });
  });

  describe('Model Attributes', () => {
    it('should have correct id attribute', () => {
      const idAttribute = SystemConfig.getAttributes().id;
      expect(idAttribute).toBeDefined();
      expect(idAttribute.type.constructor.name).toBe('INTEGER');
      expect(idAttribute.primaryKey).toBe(true);
      expect(idAttribute.autoIncrement).toBe(true);
      expect(idAttribute.comment).toBe('配置ID');
    });

    it('should have correct groupKey attribute', () => {
      const groupKeyAttribute = SystemConfig.getAttributes().groupKey;
      expect(groupKeyAttribute).toBeDefined();
      expect(groupKeyAttribute.type.constructor.name).toBe('VARCHAR');
      expect(groupKeyAttribute.allowNull).toBe(false);
      expect(groupKeyAttribute.comment).toBe('配置分组键名');
    });

    it('should have correct configKey attribute', () => {
      const configKeyAttribute = SystemConfig.getAttributes().configKey;
      expect(configKeyAttribute).toBeDefined();
      expect(configKeyAttribute.type.constructor.name).toBe('VARCHAR');
      expect(configKeyAttribute.allowNull).toBe(false);
      expect(configKeyAttribute.comment).toBe('配置项键名');
    });

    it('should have correct configValue attribute', () => {
      const configValueAttribute = SystemConfig.getAttributes().configValue;
      expect(configValueAttribute).toBeDefined();
      expect(configValueAttribute.type.constructor.name).toBe('TEXT');
      expect(configValueAttribute.allowNull).toBe(false);
      expect(configValueAttribute.comment).toBe('配置项值');
    });

    it('should have correct valueType attribute', () => {
      const valueTypeAttribute = SystemConfig.getAttributes().valueType;
      expect(valueTypeAttribute).toBeDefined();
      expect(valueTypeAttribute.type.constructor.name).toBe('VARCHAR');
      expect(valueTypeAttribute.allowNull).toBe(false);
      expect(valueTypeAttribute.comment).toBe('值类型: string, number, boolean, json');
    });

    it('should have correct description attribute', () => {
      const descriptionAttribute = SystemConfig.getAttributes().description;
      expect(descriptionAttribute).toBeDefined();
      expect(descriptionAttribute.type.constructor.name).toBe('VARCHAR');
      expect(descriptionAttribute.allowNull).toBe(false);
      expect(descriptionAttribute.comment).toBe('配置描述');
    });

    it('should have correct isSystem attribute', () => {
      const isSystemAttribute = SystemConfig.getAttributes().isSystem;
      expect(isSystemAttribute).toBeDefined();
      expect(isSystemAttribute.type.constructor.name).toBe('BOOLEAN');
      expect(isSystemAttribute.allowNull).toBe(false);
      expect(isSystemAttribute.defaultValue).toBe(false);
      expect(isSystemAttribute.comment).toBe('是否系统配置');
    });

    it('should have correct isReadonly attribute', () => {
      const isReadonlyAttribute = SystemConfig.getAttributes().isReadonly;
      expect(isReadonlyAttribute).toBeDefined();
      expect(isReadonlyAttribute.type.constructor.name).toBe('BOOLEAN');
      expect(isReadonlyAttribute.allowNull).toBe(false);
      expect(isReadonlyAttribute.defaultValue).toBe(false);
      expect(isReadonlyAttribute.comment).toBe('是否只读配置');
    });

    it('should have correct sortOrder attribute', () => {
      const sortOrderAttribute = SystemConfig.getAttributes().sortOrder;
      expect(sortOrderAttribute).toBeDefined();
      expect(sortOrderAttribute.type.constructor.name).toBe('INTEGER');
      expect(sortOrderAttribute.allowNull).toBe(false);
      expect(sortOrderAttribute.defaultValue).toBe(0);
      expect(sortOrderAttribute.comment).toBe('排序顺序');
    });

    it('should have correct creatorId attribute', () => {
      const creatorIdAttribute = SystemConfig.getAttributes().creatorId;
      expect(creatorIdAttribute).toBeDefined();
      expect(creatorIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(creatorIdAttribute.allowNull).toBe(true);
      expect(creatorIdAttribute.comment).toBe('创建人ID');
    });

    it('should have correct updaterId attribute', () => {
      const updaterIdAttribute = SystemConfig.getAttributes().updaterId;
      expect(updaterIdAttribute).toBeDefined();
      expect(updaterIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(updaterIdAttribute.allowNull).toBe(true);
      expect(updaterIdAttribute.comment).toBe('更新人ID');
    });

    it('should have correct createdAt attribute', () => {
      const createdAtAttribute = SystemConfig.getAttributes().createdAt;
      expect(createdAtAttribute).toBeDefined();
      expect(createdAtAttribute.type.constructor.name).toBe('DATE');
      expect(createdAtAttribute.allowNull).toBe(false);
      expect(createdAtAttribute.comment).toBe('创建时间');
    });

    it('should have correct updatedAt attribute', () => {
      const updatedAtAttribute = SystemConfig.getAttributes().updatedAt;
      expect(updatedAtAttribute).toBeDefined();
      expect(updatedAtAttribute.type.constructor.name).toBe('DATE');
      expect(updatedAtAttribute.allowNull).toBe(false);
      expect(updatedAtAttribute.comment).toBe('更新时间');
    });

    it('should have correct deletedAt attribute', () => {
      const deletedAtAttribute = SystemConfig.getAttributes().deletedAt;
      expect(deletedAtAttribute).toBeDefined();
      expect(deletedAtAttribute.type.constructor.name).toBe('DATE');
      expect(deletedAtAttribute.allowNull).toBe(true);
      expect(deletedAtAttribute.comment).toBe('删除时间');
    });
  });

  describe('Model Creation', () => {
    it('should create a new system config with all fields', async () => {
      const configData = {
        groupKey: 'email',
        configKey: 'smtp_host',
        configValue: 'smtp.example.com',
        valueType: ConfigValueType.STRING,
        description: 'SMTP服务器地址',
        isSystem: true,
        isReadonly: false,
        sortOrder: 1,
        creatorId: 1,
        updaterId: 1,
      };

      const config = await SystemConfig.create(configData);
      
      expect(config).toBeDefined();
      expect(config.id).toBeDefined();
      expect(config.groupKey).toBe(configData.groupKey);
      expect(config.configKey).toBe(configData.configKey);
      expect(config.configValue).toBe(configData.configValue);
      expect(config.valueType).toBe(configData.valueType);
      expect(config.description).toBe(configData.description);
      expect(config.isSystem).toBe(configData.isSystem);
      expect(config.isReadonly).toBe(configData.isReadonly);
      expect(config.sortOrder).toBe(configData.sortOrder);
      expect(config.creatorId).toBe(configData.creatorId);
      expect(config.updaterId).toBe(configData.updaterId);
    });

    it('should create a system config with minimal required fields', async () => {
      const minimalData = {
        groupKey: 'general',
        configKey: 'site_name',
        configValue: 'My Site',
        valueType: ConfigValueType.STRING,
        description: '网站名称',
      };

      const config = await SystemConfig.create(minimalData);
      
      expect(config).toBeDefined();
      expect(config.id).toBeDefined();
      expect(config.groupKey).toBe(minimalData.groupKey);
      expect(config.configKey).toBe(minimalData.configKey);
      expect(config.configValue).toBe(minimalData.configValue);
      expect(config.valueType).toBe(minimalData.valueType);
      expect(config.description).toBe(minimalData.description);
      
      // Check default values
      expect(config.isSystem).toBe(false);
      expect(config.isReadonly).toBe(false);
      expect(config.sortOrder).toBe(0);
    });

    it('should create configs with different value types', async () => {
      const configs = [
        {
          groupKey: 'general',
          configKey: 'site_name',
          configValue: 'My Website',
          valueType: ConfigValueType.STRING,
          description: '网站名称',
        },
        {
          groupKey: 'general',
          configKey: 'items_per_page',
          configValue: '20',
          valueType: ConfigValueType.NUMBER,
          description: '每页显示条数',
        },
        {
          groupKey: 'general',
          configKey: 'enable_registration',
          configValue: 'true',
          valueType: ConfigValueType.BOOLEAN,
          description: '是否启用注册',
        },
        {
          groupKey: 'general',
          configKey: 'site_settings',
          configValue: '{"theme": "default", "language": "zh-CN"}',
          valueType: ConfigValueType.JSON,
          description: '网站设置',
        },
      ];

      const createdConfigs = await SystemConfig.bulkCreate(configs);
      
      expect(createdConfigs).toHaveLength(4);
      
      for (let i = 0; i < createdConfigs.length; i++) {
        expect(createdConfigs[i].valueType).toBe(configs[i].valueType);
        expect(createdConfigs[i].configValue).toBe(configs[i].configValue);
      }
    });
  });

  describe('Model Validation', () => {
    it('should allow null values for optional fields', async () => {
      const config = await SystemConfig.create({
        groupKey: 'test',
        configKey: 'test_key',
        configValue: 'test_value',
        valueType: ConfigValueType.STRING,
        description: 'Test configuration',
      });

      expect(config.creatorId).toBeNull();
      expect(config.updaterId).toBeNull();
      expect(config.deletedAt).toBeNull();
    });

    it('should handle empty string values', async () => {
      const config = await SystemConfig.create({
        groupKey: 'test',
        configKey: 'empty_key',
        configValue: '',
        valueType: ConfigValueType.STRING,
        description: '',
      });

      expect(config.configValue).toBe('');
      expect(config.description).toBe('');
    });

    it('should handle different value types', async () => {
      const valueTypes = Object.values(ConfigValueType);
      
      for (const valueType of valueTypes) {
        const config = await SystemConfig.create({
          groupKey: 'test',
          configKey: `key_${valueType}`,
          configValue: 'test_value',
          valueType: valueType,
          description: `Test ${valueType} configuration`,
        });
        
        expect(config.valueType).toBe(valueType);
      }
    });

    it('should handle boolean config values', async () => {
      const booleanConfigs = [
        { configValue: 'true', expected: true },
        { configValue: 'false', expected: false },
        { configValue: '1', expected: true },
        { configValue: '0', expected: false },
      ];

      for (const { configValue, expected } of booleanConfigs) {
        const config = await SystemConfig.create({
          groupKey: 'test',
          configKey: `bool_${configValue}`,
          configValue: configValue,
          valueType: ConfigValueType.BOOLEAN,
          description: `Boolean test ${configValue}`,
        });

        expect(config.configValue).toBe(configValue);
      }
    });

    it('should handle numeric config values', async () => {
      const numericConfigs = [
        { configValue: '0', expected: 0 },
        { configValue: '42', expected: 42 },
        { configValue: '-100', expected: -100 },
        { configValue: '3.14', expected: 3.14 },
        { configValue: '1000000', expected: 1000000 },
      ];

      for (const { configValue, expected } of numericConfigs) {
        const config = await SystemConfig.create({
          groupKey: 'test',
          configKey: `num_${configValue}`,
          configValue: configValue,
          valueType: ConfigValueType.NUMBER,
          description: `Number test ${configValue}`,
        });

        expect(config.configValue).toBe(configValue);
      }
    });

    it('should handle JSON config values', async () => {
      const jsonConfigs = [
        { configValue: '{}', expected: {} },
        { configValue: '{"key": "value"}', expected: { key: 'value' } },
        { configValue: '{"array": [1, 2, 3]}', expected: { array: [1, 2, 3] } },
        { configValue: '{"nested": {"inner": "value"}}', expected: { nested: { inner: 'value' } } },
      ];

      for (const { configValue, expected } of jsonConfigs) {
        const config = await SystemConfig.create({
          groupKey: 'test',
          configKey: `json_${Date.now()}`, // Use timestamp to ensure uniqueness
          configValue: configValue,
          valueType: ConfigValueType.JSON,
          description: `JSON test ${configValue}`,
        });

        expect(config.configValue).toBe(configValue);
      }
    });
  });

  describe('Model Updates', () => {
    it('should update system config attributes', async () => {
      const config = await SystemConfig.create({
        groupKey: 'test',
        configKey: 'update_test',
        configValue: 'original_value',
        valueType: ConfigValueType.STRING,
        description: 'Original description',
        isSystem: false,
        isReadonly: false,
        sortOrder: 5,
      });

      await config.update({
        configValue: 'updated_value',
        description: 'Updated description',
        isSystem: true,
        sortOrder: 10,
      });

      const updatedConfig = await SystemConfig.findByPk(config.id);
      expect(updatedConfig?.configValue).toBe('updated_value');
      expect(updatedConfig?.description).toBe('Updated description');
      expect(updatedConfig?.isSystem).toBe(true);
      expect(updatedConfig?.sortOrder).toBe(10);
      expect(updatedConfig?.isReadonly).toBe(false); // Should remain unchanged
    });

    it('should handle partial updates', async () => {
      const config = await SystemConfig.create({
        groupKey: 'test',
        configKey: 'partial_update',
        configValue: 'original',
        valueType: ConfigValueType.STRING,
        description: 'Original description',
        sortOrder: 1,
      });

      await config.update({
        configValue: 'updated',
      });

      const updatedConfig = await SystemConfig.findByPk(config.id);
      expect(updatedConfig?.configValue).toBe('updated');
      expect(updatedConfig?.description).toBe('Original description'); // Should remain unchanged
      expect(updatedConfig?.sortOrder).toBe(1); // Should remain unchanged
    });

    it('should update updaterId on modification', async () => {
      const config = await SystemConfig.create({
        groupKey: 'test',
        configKey: 'updater_test',
        configValue: 'test_value',
        valueType: ConfigValueType.STRING,
        description: 'Test config',
        creatorId: 1,
        updaterId: 1,
      });

      await config.update({
        updaterId: 2,
      });

      const updatedConfig = await SystemConfig.findByPk(config.id);
      expect(updatedConfig?.creatorId).toBe(1); // Should remain unchanged
      expect(updatedConfig?.updaterId).toBe(2);
    });
  });

  describe('Model Queries', () => {
    it('should find system config by id', async () => {
      const createdConfig = await SystemConfig.create({
        groupKey: 'test',
        configKey: 'find_by_id',
        configValue: 'test_value',
        valueType: ConfigValueType.STRING,
        description: 'Find by ID test',
      });

      const foundConfig = await SystemConfig.findByPk(createdConfig.id);
      
      expect(foundConfig).toBeDefined();
      expect(foundConfig?.id).toBe(createdConfig.id);
      expect(foundConfig?.configKey).toBe('find_by_id');
    });

    it('should find configs by group key', async () => {
      await SystemConfig.bulkCreate([
        { groupKey: 'email', configKey: 'smtp_host', configValue: 'smtp1.com', valueType: ConfigValueType.STRING, description: 'SMTP Host' },
        { groupKey: 'email', configKey: 'smtp_port', configValue: '587', valueType: ConfigValueType.STRING, description: 'SMTP Port' },
        { groupKey: 'email', configKey: 'smtp_user', configValue: 'user@example.com', valueType: ConfigValueType.STRING, description: 'SMTP User' },
        { groupKey: 'general', configKey: 'site_name', configValue: 'My Site', valueType: ConfigValueType.STRING, description: 'Site Name' },
      ]);

      const emailConfigs = await SystemConfig.findAll({
        where: { groupKey: 'email' },
        order: [['sortOrder', 'ASC']],
      });
      
      expect(emailConfigs).toHaveLength(3);
      expect(emailConfigs.map(c => c.configKey)).toContain('smtp_host');
      expect(emailConfigs.map(c => c.configKey)).toContain('smtp_port');
      expect(emailConfigs.map(c => c.configKey)).toContain('smtp_user');
    });

    it('should find configs by config key', async () => {
      await SystemConfig.bulkCreate([
        { groupKey: 'general', configKey: 'site_name', configValue: 'Site 1', valueType: ConfigValueType.STRING, description: 'Site Name 1' },
        { groupKey: 'general', configKey: 'site_url', configValue: 'https://site1.com', valueType: ConfigValueType.STRING, description: 'Site URL 1' },
        { groupKey: 'email', configKey: 'site_name', configValue: 'Email Site', valueType: ConfigValueType.STRING, description: 'Email Site Name' },
      ]);

      const siteNameConfigs = await SystemConfig.findAll({
        where: { configKey: 'site_name' },
      });
      
      expect(siteNameConfigs).toHaveLength(2);
      expect(siteNameConfigs.map(c => c.groupKey)).toContain('general');
      expect(siteNameConfigs.map(c => c.groupKey)).toContain('email');
    });

    it('should find configs by group and config key combination', async () => {
      await SystemConfig.create({
        groupKey: 'email',
        configKey: 'smtp_host',
        configValue: 'smtp.example.com',
        valueType: ConfigValueType.STRING,
        description: 'SMTP Host',
      });

      const specificConfig = await SystemConfig.findOne({
        where: {
          groupKey: 'email',
          configKey: 'smtp_host',
        },
      });
      
      expect(specificConfig).toBeDefined();
      expect(specificConfig?.groupKey).toBe('email');
      expect(specificConfig?.configKey).toBe('smtp_host');
      expect(specificConfig?.configValue).toBe('smtp.example.com');
    });

    it('should find system configs', async () => {
      await SystemConfig.bulkCreate([
        { groupKey: 'system', configKey: 'log_level', configValue: 'info', valueType: ConfigValueType.STRING, description: 'Log Level', isSystem: true },
        { groupKey: 'system', configKey: 'debug_mode', configValue: 'false', valueType: ConfigValueType.BOOLEAN, description: 'Debug Mode', isSystem: true },
        { groupKey: 'user', configKey: 'default_theme', configValue: 'default', valueType: ConfigValueType.STRING, description: 'Default Theme', isSystem: false },
      ]);

      const systemConfigs = await SystemConfig.findAll({
        where: { isSystem: true },
      });
      
      expect(systemConfigs).toHaveLength(2);
      expect(systemConfigs.map(c => c.configKey)).toContain('log_level');
      expect(systemConfigs.map(c => c.configKey)).toContain('debug_mode');
    });

    it('should find readonly configs', async () => {
      await SystemConfig.bulkCreate([
        { groupKey: 'system', configKey: 'version', configValue: '1.0.0', valueType: ConfigValueType.STRING, description: 'Version', isReadonly: true },
        { groupKey: 'system', configKey: 'build_date', configValue: '2025-01-15', valueType: ConfigValueType.STRING, description: 'Build Date', isReadonly: true },
        { groupKey: 'general', configKey: 'site_title', configValue: 'My Site', valueType: ConfigValueType.STRING, description: 'Site Title', isReadonly: false },
      ]);

      const readonlyConfigs = await SystemConfig.findAll({
        where: { isReadonly: true },
      });
      
      expect(readonlyConfigs).toHaveLength(2);
      expect(readonlyConfigs.map(c => c.configKey)).toContain('version');
      expect(readonlyConfigs.map(c => c.configKey)).toContain('build_date');
    });

    it('should find configs by value type', async () => {
      await SystemConfig.bulkCreate([
        { groupKey: 'general', configKey: 'site_name', configValue: 'My Site', valueType: ConfigValueType.STRING, description: 'Site Name' },
        { groupKey: 'general', configKey: 'items_per_page', configValue: '20', valueType: ConfigValueType.NUMBER, description: 'Items Per Page' },
        { groupKey: 'general', configKey: 'enable_registration', configValue: 'true', valueType: ConfigValueType.BOOLEAN, description: 'Enable Registration' },
        { groupKey: 'general', configKey: 'site_settings', configValue: '{"theme": "default"}', valueType: ConfigValueType.JSON, description: 'Site Settings' },
      ]);

      const stringConfigs = await SystemConfig.findAll({
        where: { valueType: ConfigValueType.STRING },
      });
      
      expect(stringConfigs).toHaveLength(1);
      expect(stringConfigs[0].configKey).toBe('site_name');

      const booleanConfigs = await SystemConfig.findAll({
        where: { valueType: ConfigValueType.BOOLEAN },
      });
      
      expect(booleanConfigs).toHaveLength(1);
      expect(booleanConfigs[0].configKey).toBe('enable_registration');
    });

    it('should find configs ordered by sort order', async () => {
      await SystemConfig.bulkCreate([
        { groupKey: 'general', configKey: 'config_3', configValue: 'value3', valueType: ConfigValueType.STRING, description: 'Config 3', sortOrder: 3 },
        { groupKey: 'general', configKey: 'config_1', configValue: 'value1', valueType: ConfigValueType.STRING, description: 'Config 1', sortOrder: 1 },
        { groupKey: 'general', configKey: 'config_2', configValue: 'value2', valueType: ConfigValueType.STRING, description: 'Config 2', sortOrder: 2 },
      ]);

      const orderedConfigs = await SystemConfig.findAll({
        where: { groupKey: 'general' },
        order: [['sortOrder', 'ASC']],
      });
      
      expect(orderedConfigs).toHaveLength(3);
      expect(orderedConfigs[0].configKey).toBe('config_1');
      expect(orderedConfigs[1].configKey).toBe('config_2');
      expect(orderedConfigs[2].configKey).toBe('config_3');
    });
  });

  describe('Model Deletion', () => {
    it('should soft delete system config', async () => {
      const config = await SystemConfig.create({
        groupKey: 'test',
        configKey: 'soft_delete',
        configValue: 'test_value',
        valueType: ConfigValueType.STRING,
        description: 'Soft delete test',
      });

      await config.destroy();

      const deletedConfig = await SystemConfig.findByPk(config.id);
      expect(deletedConfig).toBeNull();

      // Check if it exists in paranoid mode
      const paranoidConfig = await SystemConfig.findByPk(config.id, {
        paranoid: false,
      });
      expect(paranoidConfig).toBeDefined();
      expect(paranoidConfig?.deletedAt).toBeDefined();
    });

    it('should restore soft deleted system config', async () => {
      const config = await SystemConfig.create({
        groupKey: 'test',
        configKey: 'restore',
        configValue: 'test_value',
        valueType: ConfigValueType.STRING,
        description: 'Restore test',
      });

      await config.destroy();
      await config.restore();

      const restoredConfig = await SystemConfig.findByPk(config.id);
      expect(restoredConfig).toBeDefined();
      expect(restoredConfig?.configKey).toBe('restore');
      expect(restoredConfig?.deletedAt).toBeNull();
    });
  });

  describe('Model Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const config = await SystemConfig.create({
        groupKey: 'test',
        configKey: 'timestamp_test',
        configValue: 'test_value',
        valueType: ConfigValueType.STRING,
        description: 'Timestamp test',
      });

      expect(config.createdAt).toBeDefined();
      expect(config.updatedAt).toBeDefined();
      expect(config.createdAt).toBeInstanceOf(Date);
      expect(config.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on update', async () => {
      const config = await SystemConfig.create({
        groupKey: 'test',
        configKey: 'timestamp_update',
        configValue: 'original',
        valueType: ConfigValueType.STRING,
        description: 'Timestamp update test',
      });

      const originalUpdatedAt = config.updatedAt;
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await config.update({ configValue: 'updated' });
      
      expect(config.updatedAt).toBeInstanceOf(Date);
      expect(config.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should set deletedAt on soft delete', async () => {
      const config = await SystemConfig.create({
        groupKey: 'test',
        configKey: 'delete_timestamp',
        configValue: 'test_value',
        valueType: ConfigValueType.STRING,
        description: 'Delete timestamp test',
      });

      await config.destroy();

      const paranoidConfig = await SystemConfig.findByPk(config.id, {
        paranoid: false,
      });
      
      expect(paranoidConfig?.deletedAt).toBeDefined();
      expect(paranoidConfig?.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('Associations', () => {
    it('should have creator association defined', () => {
      const associations = SystemConfig.associations;
      expect(associations.creator).toBeDefined();
      expect(associations.creator.associationType).toBe('BelongsTo');
    });

    it('should have updater association defined', () => {
      const associations = SystemConfig.associations;
      expect(associations.updater).toBeDefined();
      expect(associations.updater.associationType).toBe('BelongsTo');
    });
  });

  describe('Business Logic Tests', () => {
    it('should handle configuration management workflow', async () => {
      // Create configuration group
      const emailConfigs = await SystemConfig.bulkCreate([
        {
          groupKey: 'email',
          configKey: 'smtp_host',
          configValue: 'smtp.gmail.com',
          valueType: ConfigValueType.STRING,
          description: 'SMTP服务器地址',
          isSystem: true,
          sortOrder: 1,
        },
        {
          groupKey: 'email',
          configKey: 'smtp_port',
          configValue: '587',
          valueType: ConfigValueType.STRING,
          description: 'SMTP端口',
          isSystem: true,
          sortOrder: 2,
        },
        {
          groupKey: 'email',
          configKey: 'smtp_username',
          configValue: 'noreply@gmail.com',
          valueType: ConfigValueType.STRING,
          description: 'SMTP用户名',
          isSystem: false,
          sortOrder: 3,
        },
        {
          groupKey: 'email',
          configKey: 'enable_ssl',
          configValue: 'true',
          valueType: ConfigValueType.BOOLEAN,
          description: '启用SSL',
          isSystem: true,
          sortOrder: 4,
        },
      ]);

      expect(emailConfigs).toHaveLength(4);

      // Retrieve all email configurations
      const allEmailConfigs = await SystemConfig.findAll({
        where: { groupKey: 'email' },
        order: [['sortOrder', 'ASC']],
      });

      expect(allEmailConfigs).toHaveLength(4);
      expect(allEmailConfigs[0].configKey).toBe('smtp_host');
      expect(allEmailConfigs[1].configKey).toBe('smtp_port');
      expect(allEmailConfigs[2].configKey).toBe('smtp_username');
      expect(allEmailConfigs[3].configKey).toBe('enable_ssl');

      // Update specific configuration
      const smtpConfig = await SystemConfig.findOne({
        where: {
          groupKey: 'email',
          configKey: 'smtp_host',
        },
      });

      await smtpConfig?.update({
        configValue: 'smtp.office365.com',
        updaterId: 1,
      });

      const updatedSmtpConfig = await SystemConfig.findOne({
        where: {
          groupKey: 'email',
          configKey: 'smtp_host',
        },
      });

      expect(updatedSmtpConfig?.configValue).toBe('smtp.office365.com');
    });

    it('should handle system vs user configurations', async () => {
      // Create system configurations
      await SystemConfig.bulkCreate([
        {
          groupKey: 'system',
          configKey: 'app_version',
          configValue: '1.0.0',
          valueType: ConfigValueType.STRING,
          description: '应用版本',
          isSystem: true,
          isReadonly: true,
          sortOrder: 1,
        },
        {
          groupKey: 'system',
          configKey: 'maintenance_mode',
          configValue: 'false',
          valueType: ConfigValueType.BOOLEAN,
          description: '维护模式',
          isSystem: true,
          isReadonly: false,
          sortOrder: 2,
        },
      ]);

      // Create user configurations
      await SystemConfig.bulkCreate([
        {
          groupKey: 'user',
          configKey: 'default_language',
          configValue: 'zh-CN',
          valueType: ConfigValueType.STRING,
          description: '默认语言',
          isSystem: false,
          isReadonly: false,
          sortOrder: 1,
        },
        {
          groupKey: 'user',
          configKey: 'items_per_page',
          configValue: '20',
          valueType: ConfigValueType.NUMBER,
          description: '每页条数',
          isSystem: false,
          isReadonly: false,
          sortOrder: 2,
        },
      ]);

      // Test filtering
      const systemConfigs = await SystemConfig.findAll({
        where: { isSystem: true },
      });
      expect(systemConfigs).toHaveLength(2);

      const userConfigs = await SystemConfig.findAll({
        where: { isSystem: false },
      });
      expect(userConfigs).toHaveLength(2);

      const readonlyConfigs = await SystemConfig.findAll({
        where: { isReadonly: true },
      });
      expect(readonlyConfigs).toHaveLength(1);
      expect(readonlyConfigs[0].configKey).toBe('app_version');
    });

    it('should handle configuration value type conversion', async () => {
      const configs = await SystemConfig.bulkCreate([
        {
          groupKey: 'conversion',
          configKey: 'string_value',
          configValue: 'Hello World',
          valueType: ConfigValueType.STRING,
          description: '字符串值',
        },
        {
          groupKey: 'conversion',
          configKey: 'number_value',
          configValue: '42',
          valueType: ConfigValueType.NUMBER,
          description: '数值',
        },
        {
          groupKey: 'conversion',
          configKey: 'boolean_value',
          configValue: 'true',
          valueType: ConfigValueType.BOOLEAN,
          description: '布尔值',
        },
        {
          groupKey: 'conversion',
          configKey: 'json_value',
          configValue: '{"key": "value", "number": 123}',
          valueType: ConfigValueType.JSON,
          description: 'JSON值',
        },
      ]);

      // Test value type handling
      const stringConfig = configs.find(c => c.configKey === 'string_value');
      expect(stringConfig?.valueType).toBe(ConfigValueType.STRING);
      expect(stringConfig?.configValue).toBe('Hello World');

      const numberConfig = configs.find(c => c.configKey === 'number_value');
      expect(numberConfig?.valueType).toBe(ConfigValueType.NUMBER);
      expect(numberConfig?.configValue).toBe('42');

      const booleanConfig = configs.find(c => c.configKey === 'boolean_value');
      expect(booleanConfig?.valueType).toBe(ConfigValueType.BOOLEAN);
      expect(booleanConfig?.configValue).toBe('true');

      const jsonConfig = configs.find(c => c.configKey === 'json_value');
      expect(jsonConfig?.valueType).toBe(ConfigValueType.JSON);
      expect(jsonConfig?.configValue).toBe('{"key": "value", "number": 123}');
    });

    it('should handle configuration groups management', async () => {
      const groups = ['email', 'general', 'security', 'appearance'];
      
      // Create configurations for different groups
      for (const group of groups) {
        await SystemConfig.create({
          groupKey: group,
          configKey: `${group}_setting`,
          configValue: `${group}_value`,
          valueType: ConfigValueType.STRING,
          description: `${group} setting`,
        });
      }

      // Get all unique groups
      const allConfigs = await SystemConfig.findAll({
        attributes: ['groupKey'],
        group: ['groupKey'],
        order: [['groupKey', 'ASC']],
      });

      expect(allConfigs).toHaveLength(4);
      const foundGroups = allConfigs.map(c => c.groupKey);
      expect(foundGroups).toEqual(groups);

      // Get configurations for specific group
      const emailConfigs = await SystemConfig.findAll({
        where: { groupKey: 'email' },
      });
      expect(emailConfigs).toHaveLength(1);
      expect(emailConfigs[0].configKey).toBe('email_setting');
    });

    it('should handle configuration search and filtering', async () => {
      await SystemConfig.bulkCreate([
        {
          groupKey: 'email',
          configKey: 'smtp_host',
          configValue: 'smtp.gmail.com',
          valueType: ConfigValueType.STRING,
          description: 'SMTP host configuration',
        },
        {
          groupKey: 'email',
          configKey: 'smtp_port',
          configValue: '587',
          valueType: ConfigValueType.STRING,
          description: 'SMTP port configuration',
        },
        {
          groupKey: 'general',
          configKey: 'site_name',
          configValue: 'My Website',
          valueType: ConfigValueType.STRING,
          description: 'Website name',
        },
        {
          groupKey: 'general',
          configKey: 'admin_email',
          configValue: 'admin@example.com',
          valueType: ConfigValueType.STRING,
          description: 'Administrator email',
        },
      ]);

      // Search by description
      const smtpConfigs = await SystemConfig.findAll({
        where: {
          description: {
            [Op.like]: '%SMTP%',
          },
        },
      });

      expect(smtpConfigs).toHaveLength(2);
      expect(smtpConfigs.map(c => c.configKey)).toContain('smtp_host');
      expect(smtpConfigs.map(c => c.configKey)).toContain('smtp_port');

      // Search by config value pattern
      const emailConfigs = await SystemConfig.findAll({
        where: {
          configValue: {
            [Op.like]: '%@%',
          },
        },
      });

      expect(emailConfigs).toHaveLength(2);
      expect(emailConfigs.map(c => c.configKey)).toContain('smtp_host');
      expect(emailConfigs.map(c => c.configKey)).toContain('admin_email');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long config values', async () => {
      const longValue = 'a'.repeat(10000); // Very long text value
      
      const config = await SystemConfig.create({
        groupKey: 'test',
        configKey: 'long_value',
        configValue: longValue,
        valueType: ConfigValueType.STRING,
        description: 'Long value test',
      });

      expect(config.configValue).toBe(longValue);
    });

    it('should handle very long JSON config values', async () => {
      const largeJsonObject = {
        data: Array(100).fill(null).map((_, i) => ({ id: i, name: `Item ${i}`, value: Math.random() })),
        metadata: {
          created: new Date().toISOString(),
          version: '1.0.0',
          description: 'Large JSON object for testing',
        },
      };
      
      const largeJsonValue = JSON.stringify(largeJsonObject);
      
      const config = await SystemConfig.create({
        groupKey: 'test',
        configKey: 'large_json',
        configValue: largeJsonValue,
        valueType: ConfigValueType.JSON,
        description: 'Large JSON test',
      });

      expect(config.configValue).toBe(largeJsonValue);
    });

    it('should handle unicode characters in all fields', async () => {
      const config = await SystemConfig.create({
        groupKey: '系统',
        configKey: '网站名称',
        configValue: '我的网站',
        valueType: ConfigValueType.STRING,
        description: '网站名称配置',
      });

      expect(config.groupKey).toBe('系统');
      expect(config.configKey).toBe('网站名称');
      expect(config.configValue).toBe('我的网站');
      expect(config.description).toBe('网站名称配置');
    });

    it('should handle special characters in config values', async () => {
      const specialValues = [
        'Value with spaces',
        'Value-with-dashes',
        'Value_with_underscores',
        'Value@with#special$chars%',
        'Value"with"quotes',
        "Value'with'single'quotes",
        'Value\nwith\nnewlines',
        'Value\twith\ttabs',
      ];

      for (const value of specialValues) {
        const config = await SystemConfig.create({
          groupKey: 'test',
          configKey: `special_${Date.now()}`, // Use timestamp for uniqueness
          configValue: value,
          valueType: ConfigValueType.STRING,
          description: 'Special characters test',
        });

        expect(config.configValue).toBe(value);
      }
    });

    it('should handle duplicate groupKey and configKey combinations', async () => {
      // Create first config
      const firstConfig = await SystemConfig.create({
        groupKey: 'duplicate',
        configKey: 'test_key',
        configValue: 'first_value',
        valueType: ConfigValueType.STRING,
        description: 'First config',
      });

      // Create second config with same groupKey and configKey
      // (In real scenarios, this should be prevented by unique constraint)
      const secondConfig = await SystemConfig.create({
        groupKey: 'duplicate',
        configKey: 'test_key',
        configValue: 'second_value',
        valueType: ConfigValueType.STRING,
        description: 'Second config',
      });

      expect(firstConfig.groupKey).toBe('duplicate');
      expect(firstConfig.configKey).toBe('test_key');
      expect(firstConfig.configValue).toBe('first_value');

      expect(secondConfig.groupKey).toBe('duplicate');
      expect(secondConfig.configKey).toBe('test_key');
      expect(secondConfig.configValue).toBe('second_value');

      // Find all configs with this combination
      const duplicateConfigs = await SystemConfig.findAll({
        where: {
          groupKey: 'duplicate',
          configKey: 'test_key',
        },
      });

      expect(duplicateConfigs).toHaveLength(2);
    });

    it('should handle invalid JSON values gracefully', async () => {
      const invalidJsonValues = [
        'invalid json',
        '{broken json}',
        '{"key": "value",}',
        '{"key": undefined}',
        'null',
        'undefined',
      ];

      for (const jsonValue of invalidJsonValues) {
        const config = await SystemConfig.create({
          groupKey: 'test',
          configKey: `invalid_json_${Date.now()}`, // Use timestamp for uniqueness
          configValue: jsonValue,
          valueType: ConfigValueType.JSON,
          description: 'Invalid JSON test',
        });

        // The model should store the value as-is, even if it's not valid JSON
        expect(config.configValue).toBe(jsonValue);
      }
    });
  });

  describe('Configuration Management Scenarios', () => {
    it('should handle application settings management', async () => {
      // Simulate application settings
      const appSettings = [
        {
          groupKey: 'app',
          configKey: 'name',
          configValue: 'Kindergarten Management System',
          valueType: ConfigValueType.STRING,
          description: 'Application name',
          isSystem: true,
          isReadonly: true,
          sortOrder: 1,
        },
        {
          groupKey: 'app',
          configKey: 'version',
          configValue: '2.1.0',
          valueType: ConfigValueType.STRING,
          description: 'Application version',
          isSystem: true,
          isReadonly: true,
          sortOrder: 2,
        },
        {
          groupKey: 'app',
          configKey: 'debug_mode',
          configValue: 'false',
          valueType: ConfigValueType.BOOLEAN,
          description: 'Debug mode enabled',
          isSystem: true,
          isReadonly: false,
          sortOrder: 3,
        },
        {
          groupKey: 'app',
          configKey: 'maintenance_mode',
          configValue: 'false',
          valueType: ConfigValueType.BOOLEAN,
          description: 'Maintenance mode enabled',
          isSystem: true,
          isReadonly: false,
          sortOrder: 4,
        },
      ];

      await SystemConfig.bulkCreate(appSettings);

      // Get all app settings
      const settings = await SystemConfig.findAll({
        where: { groupKey: 'app' },
        order: [['sortOrder', 'ASC']],
      });

      expect(settings).toHaveLength(4);
      expect(settings[0].configKey).toBe('name');
      expect(settings[1].configKey).toBe('version');
      expect(settings[2].configKey).toBe('debug_mode');
      expect(settings[3].configKey).toBe('maintenance_mode');

      // Toggle maintenance mode
      const maintenanceConfig = settings.find(s => s.configKey === 'maintenance_mode');
      await maintenanceConfig?.update({
        configValue: 'true',
        updaterId: 1,
      });

      const updatedMaintenanceConfig = await SystemConfig.findOne({
        where: {
          groupKey: 'app',
          configKey: 'maintenance_mode',
        },
      });

      expect(updatedMaintenanceConfig?.configValue).toBe('true');
    });

    it('should handle feature flags management', async () => {
      const featureFlags = [
        {
          groupKey: 'features',
          configKey: 'enable_registration',
          configValue: 'true',
          valueType: ConfigValueType.BOOLEAN,
          description: 'Enable user registration',
          isSystem: false,
          sortOrder: 1,
        },
        {
          groupKey: 'features',
          configKey: 'enable_social_login',
          configValue: 'false',
          valueType: ConfigValueType.BOOLEAN,
          description: 'Enable social media login',
          isSystem: false,
          sortOrder: 2,
        },
        {
          groupKey: 'features',
          configKey: 'enable_email_verification',
          configValue: 'true',
          valueType: ConfigValueType.BOOLEAN,
          description: 'Enable email verification',
          isSystem: false,
          sortOrder: 3,
        },
        {
          groupKey: 'features',
          configKey: 'max_login_attempts',
          configValue: '5',
          valueType: ConfigValueType.NUMBER,
          description: 'Maximum login attempts',
          isSystem: false,
          sortOrder: 4,
        },
      ];

      await SystemConfig.bulkCreate(featureFlags);

      // Get enabled features
      const enabledFeatures = await SystemConfig.findAll({
        where: {
          groupKey: 'features',
          configValue: 'true',
        },
      });

      expect(enabledFeatures).toHaveLength(2);
      expect(enabledFeatures.map(f => f.configKey)).toContain('enable_registration');
      expect(enabledFeatures.map(f => f.configKey)).toContain('enable_email_verification');

      // Get disabled features
      const disabledFeatures = await SystemConfig.findAll({
        where: {
          groupKey: 'features',
          configValue: 'false',
        },
      });

      expect(disabledFeatures).toHaveLength(1);
      expect(disabledFeatures[0].configKey).toBe('enable_social_login');
    });
  });
});