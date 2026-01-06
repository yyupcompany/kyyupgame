import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Sequelize
const mockSequelize = {
  transaction: jest.fn(),
  query: jest.fn(),
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
  finished: 'pending'
};

// Mock models
const mockSystemConfig = {
  create: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  bulkCreate: jest.fn(),
  bulkUpdate: jest.fn()
};

const mockUser = {
  findByPk: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../../src/init', () => ({
  sequelize: mockSequelize
}));

jest.unstable_mockModule('../../../../../../src/services/system/system-config.service', () => ({
  SystemConfigService: jest.fn().mockImplementation(() => ({
    getConfig: jest.fn(),
    getConfigs: jest.fn(),
    setConfig: jest.fn(),
    updateConfig: jest.fn(),
    deleteConfig: jest.fn(),
    getConfigsByGroup: jest.fn(),
    updateConfigsByGroup: jest.fn(),
    resetConfigsToDefault: jest.fn(),
    exportConfigs: jest.fn(),
    importConfigs: jest.fn(),
    validateConfig: jest.fn()
  }))
}));

jest.unstable_mockModule('../../../../../../src/models/system-config.model', () => ({
  SystemConfig: mockSystemConfig
}));

jest.unstable_mockModule('../../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../../src/utils/apiError', () => ({
  ApiError: jest.fn().mockImplementation((message, statusCode) => {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  })
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

describe('System Config Service', () => {
  let systemConfigService: any;
  let SystemConfigService: any;

  beforeAll(async () => {
    const { SystemConfigService: ImportedSystemConfigService } = await import('../../../../../../src/services/system/system-config.service');
    SystemConfigService = ImportedSystemConfigService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    systemConfigService = new SystemConfigService();
  });

  describe('getConfig', () => {
    it('应该成功获取单个配置项', async () => {
      const configKey = 'system.maintenance_mode';
      const mockConfig = {
        id: 1,
        key: 'system.maintenance_mode',
        value: 'false',
        type: 'boolean',
        group: 'system',
        description: '系统维护模式',
        isPublic: false
      };

      mockSystemConfig.findOne.mockResolvedValue(mockConfig);

      const result = await systemConfigService.getConfig(configKey);

      expect(result).toEqual(mockConfig);
      expect(mockSystemConfig.findOne).toHaveBeenCalledWith({
        where: { key: configKey }
      });
    });

    it('应该处理配置项不存在的情况', async () => {
      const configKey = 'non.existent.key';
      mockSystemConfig.findOne.mockResolvedValue(null);

      await expect(systemConfigService.getConfig(configKey)).rejects.toThrow('配置项不存在');
    });

    it('应该支持获取默认值', async () => {
      const configKey = 'non.existent.key';
      const defaultValue = 'default_value';
      
      mockSystemConfig.findOne.mockResolvedValue(null);

      const result = await systemConfigService.getConfig(configKey, defaultValue);

      expect(result).toBe(defaultValue);
    });
  });

  describe('getConfigs', () => {
    it('应该成功获取配置列表', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10,
        group: 'system',
        isPublic: true
      };

      const mockConfigs = [
        {
          id: 1,
          key: 'system.site_name',
          value: '幼儿园管理系统',
          type: 'string',
          group: 'system',
          isPublic: true
        },
        {
          id: 2,
          key: 'system.site_logo',
          value: '/images/logo.png',
          type: 'string',
          group: 'system',
          isPublic: true
        }
      ];

      mockSystemConfig.findAll.mockResolvedValue(mockConfigs);
      mockSystemConfig.count.mockResolvedValue(2);

      const result = await systemConfigService.getConfigs(queryParams);

      expect(result).toEqual({
        configs: mockConfigs,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });

      expect(mockSystemConfig.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          group: 'system',
          isPublic: true
        }),
        limit: 10,
        offset: 0,
        order: [['group', 'ASC'], ['key', 'ASC']]
      });
    });

    it('应该支持搜索功能', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10,
        search: 'site'
      };

      mockSystemConfig.findAll.mockResolvedValue([]);
      mockSystemConfig.count.mockResolvedValue(0);

      await systemConfigService.getConfigs(queryParams);

      expect(mockSystemConfig.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          [expect.any(Symbol)]: expect.arrayContaining([
            expect.objectContaining({
              key: expect.objectContaining({
                [expect.any(Symbol)]: '%site%'
              })
            })
          ])
        }),
        limit: 10,
        offset: 0,
        order: [['group', 'ASC'], ['key', 'ASC']]
      });
    });
  });

  describe('setConfig', () => {
    it('应该成功创建新配置项', async () => {
      const configData = {
        key: 'system.new_feature',
        value: 'enabled',
        type: 'string',
        group: 'system',
        description: '新功能开关',
        isPublic: false,
        updatedBy: 1
      };

      const mockCreatedConfig = {
        id: 1,
        ...configData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockSystemConfig.findOne.mockResolvedValue(null); // 配置不存在
      mockUser.findByPk.mockResolvedValue({ id: 1, realName: '管理员' });
      mockSystemConfig.create.mockResolvedValue(mockCreatedConfig);

      const result = await systemConfigService.setConfig(configData);

      expect(result).toEqual(mockCreatedConfig);
      expect(mockSystemConfig.findOne).toHaveBeenCalledWith({
        where: { key: configData.key },
        transaction: mockTransaction
      });
      expect(mockSystemConfig.create).toHaveBeenCalledWith(configData, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该成功更新已存在的配置项', async () => {
      const configData = {
        key: 'system.existing_feature',
        value: 'disabled',
        updatedBy: 1
      };

      const mockExistingConfig = {
        id: 1,
        key: 'system.existing_feature',
        value: 'enabled',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockSystemConfig.findOne.mockResolvedValue(mockExistingConfig);
      mockUser.findByPk.mockResolvedValue({ id: 1, realName: '管理员' });

      const result = await systemConfigService.setConfig(configData);

      expect(result).toBe(true);
      expect(mockExistingConfig.update).toHaveBeenCalledWith({
        value: 'disabled',
        updatedBy: 1,
        updatedAt: expect.any(Date)
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理更新者不存在的情况', async () => {
      const configData = {
        key: 'system.test',
        value: 'test',
        updatedBy: 999
      };

      mockUser.findByPk.mockResolvedValue(null);

      await expect(systemConfigService.setConfig(configData)).rejects.toThrow('更新者不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getConfigsByGroup', () => {
    it('应该成功获取指定分组的配置', async () => {
      const group = 'email';
      const mockConfigs = [
        {
          key: 'email.smtp_host',
          value: 'smtp.example.com',
          type: 'string'
        },
        {
          key: 'email.smtp_port',
          value: '587',
          type: 'integer'
        },
        {
          key: 'email.smtp_username',
          value: 'user@example.com',
          type: 'string'
        }
      ];

      mockSystemConfig.findAll.mockResolvedValue(mockConfigs);

      const result = await systemConfigService.getConfigsByGroup(group);

      expect(result).toEqual(mockConfigs);
      expect(mockSystemConfig.findAll).toHaveBeenCalledWith({
        where: { group },
        order: [['key', 'ASC']]
      });
    });

    it('应该支持只获取公开配置', async () => {
      const group = 'system';
      const publicOnly = true;

      mockSystemConfig.findAll.mockResolvedValue([]);

      await systemConfigService.getConfigsByGroup(group, publicOnly);

      expect(mockSystemConfig.findAll).toHaveBeenCalledWith({
        where: {
          group,
          isPublic: true
        },
        order: [['key', 'ASC']]
      });
    });
  });

  describe('updateConfigsByGroup', () => {
    it('应该成功批量更新分组配置', async () => {
      const group = 'email';
      const configs = {
        'email.smtp_host': 'new-smtp.example.com',
        'email.smtp_port': '465',
        'email.enable_ssl': 'true'
      };
      const updatedBy = 1;

      const mockExistingConfigs = [
        { key: 'email.smtp_host', value: 'old-smtp.example.com', update: jest.fn().mockResolvedValue(undefined) },
        { key: 'email.smtp_port', value: '587', update: jest.fn().mockResolvedValue(undefined) }
      ];

      mockUser.findByPk.mockResolvedValue({ id: 1, realName: '管理员' });
      mockSystemConfig.findAll.mockResolvedValue(mockExistingConfigs);
      mockSystemConfig.create.mockResolvedValue({ id: 3, key: 'email.enable_ssl', value: 'true' });

      const result = await systemConfigService.updateConfigsByGroup(group, configs, updatedBy);

      expect(result).toBe(true);
      expect(mockSystemConfig.findAll).toHaveBeenCalledWith({
        where: {
          group,
          key: Object.keys(configs)
        },
        transaction: mockTransaction
      });

      // 验证更新操作
      expect(mockExistingConfigs[0].update).toHaveBeenCalledWith({
        value: 'new-smtp.example.com',
        updatedBy,
        updatedAt: expect.any(Date)
      }, { transaction: mockTransaction });

      // 验证创建操作
      expect(mockSystemConfig.create).toHaveBeenCalledWith({
        key: 'email.enable_ssl',
        value: 'true',
        group,
        type: 'string',
        updatedBy
      }, { transaction: mockTransaction });

      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe('resetConfigsToDefault', () => {
    it('应该成功重置配置到默认值', async () => {
      const group = 'system';
      const updatedBy = 1;

      const defaultConfigs = [
        { key: 'system.maintenance_mode', value: 'false', type: 'boolean' },
        { key: 'system.site_name', value: '幼儿园管理系统', type: 'string' }
      ];

      const mockExistingConfigs = [
        { key: 'system.maintenance_mode', value: 'true', update: jest.fn().mockResolvedValue(undefined) },
        { key: 'system.site_name', value: '自定义名称', update: jest.fn().mockResolvedValue(undefined) }
      ];

      mockUser.findByPk.mockResolvedValue({ id: 1, realName: '管理员' });
      mockSystemConfig.findAll.mockResolvedValue(mockExistingConfigs);

      // Mock 默认配置获取
      jest.spyOn(systemConfigService, 'getDefaultConfigs').mockReturnValue(defaultConfigs);

      const result = await systemConfigService.resetConfigsToDefault(group, updatedBy);

      expect(result).toBe(true);
      expect(mockExistingConfigs[0].update).toHaveBeenCalledWith({
        value: 'false',
        updatedBy,
        updatedAt: expect.any(Date)
      }, { transaction: mockTransaction });

      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe('validateConfig', () => {
    it('应该验证布尔类型配置', () => {
      const validBooleanValues = ['true', 'false', true, false];
      
      validBooleanValues.forEach(value => {
        expect(() => {
          systemConfigService.validateConfig('boolean', value);
        }).not.toThrow();
      });

      expect(() => {
        systemConfigService.validateConfig('boolean', 'invalid');
      }).toThrow('布尔类型配置值必须是 true 或 false');
    });

    it('应该验证整数类型配置', () => {
      const validIntegerValues = ['123', 123, '0', 0, '-456'];
      
      validIntegerValues.forEach(value => {
        expect(() => {
          systemConfigService.validateConfig('integer', value);
        }).not.toThrow();
      });

      expect(() => {
        systemConfigService.validateConfig('integer', '12.34');
      }).toThrow('整数类型配置值必须是有效的整数');
    });

    it('应该验证浮点数类型配置', () => {
      const validFloatValues = ['123.45', 123.45, '0.0', 0, '-456.78'];
      
      validFloatValues.forEach(value => {
        expect(() => {
          systemConfigService.validateConfig('float', value);
        }).not.toThrow();
      });

      expect(() => {
        systemConfigService.validateConfig('float', 'not-a-number');
      }).toThrow('浮点数类型配置值必须是有效的数字');
    });

    it('应该验证JSON类型配置', () => {
      const validJsonValues = ['{"key": "value"}', '[]', 'null', '"string"'];
      
      validJsonValues.forEach(value => {
        expect(() => {
          systemConfigService.validateConfig('json', value);
        }).not.toThrow();
      });

      expect(() => {
        systemConfigService.validateConfig('json', '{invalid json}');
      }).toThrow('JSON类型配置值必须是有效的JSON格式');
    });
  });

  describe('exportConfigs', () => {
    it('应该成功导出配置', async () => {
      const group = 'system';
      const mockConfigs = [
        {
          key: 'system.site_name',
          value: '幼儿园管理系统',
          type: 'string',
          group: 'system',
          description: '网站名称'
        }
      ];

      mockSystemConfig.findAll.mockResolvedValue(mockConfigs);

      const result = await systemConfigService.exportConfigs(group);

      expect(result).toEqual({
        group,
        exportedAt: expect.any(Date),
        configs: mockConfigs
      });

      expect(mockSystemConfig.findAll).toHaveBeenCalledWith({
        where: { group },
        attributes: ['key', 'value', 'type', 'group', 'description', 'isPublic'],
        order: [['key', 'ASC']]
      });
    });
  });
});
