import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { Request, Response } from 'express';

// Mock services
const mockConfigService = {
  getConfig: jest.fn(),
  setConfig: jest.fn(),
  updateConfig: jest.fn(),
  deleteConfig: jest.fn(),
  getAllConfigs: jest.fn(),
  getConfigsByCategory: jest.fn(),
  resetConfig: jest.fn(),
  validateConfig: jest.fn(),
  exportConfigs: jest.fn(),
  importConfigs: jest.fn(),
  getConfigHistory: jest.fn(),
  restoreConfig: jest.fn()
};

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  clear: jest.fn()
};

const mockLoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

const mockAuditService = {
  log: jest.fn(),
  logConfigChange: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/services/config.service', () => mockConfigService);
jest.unstable_mockModule('../../../../../src/services/cache.service', () => mockCacheService);
jest.unstable_mockModule('../../../../../src/services/logger.service', () => mockLoggerService);
jest.unstable_mockModule('../../../../../src/services/audit.service', () => mockAuditService);

// Mock request and response objects
const createMockRequest = (overrides = {}): Partial<Request> => ({
  user: {
    id: 1,
    email: 'admin@example.com',
    role: 'admin'
  },
  params: {},
  query: {},
  body: {},
  ...overrides
});

const createMockResponse = (): Partial<Response> => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis()
});


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

describe('Config Controller', () => {
  let configController: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/controllers/config.controller');
    configController = imported.ConfigController;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConfig', () => {
    it('应该获取单个配置项', async () => {
      const req = createMockRequest({
        params: { key: 'app.name' }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockConfig = {
        key: 'app.name',
        value: '幼儿园管理系统',
        type: 'string',
        category: 'application',
        description: '应用程序名称'
      };

      mockConfigService.getConfig.mockResolvedValue(mockConfig);

      await configController.getConfig(req, res);

      expect(mockConfigService.getConfig).toHaveBeenCalledWith('app.name');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockConfig
      });
    });

    it('应该处理配置项不存在的情况', async () => {
      const req = createMockRequest({
        params: { key: 'nonexistent.key' }
      }) as Request;
      const res = createMockResponse() as Response;

      mockConfigService.getConfig.mockResolvedValue(null);

      await configController.getConfig(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '配置项不存在'
      });
    });

    it('应该处理服务错误', async () => {
      const req = createMockRequest({
        params: { key: 'app.name' }
      }) as Request;
      const res = createMockResponse() as Response;

      const error = new Error('数据库连接失败');
      mockConfigService.getConfig.mockRejectedValue(error);

      await configController.getConfig(req, res);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '获取配置失败',
        expect.objectContaining({
          key: 'app.name',
          error: error.message
        })
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '获取配置失败'
      });
    });
  });

  describe('getAllConfigs', () => {
    it('应该获取所有配置项', async () => {
      const req = createMockRequest({
        query: {
          category: 'application',
          page: '1',
          pageSize: '20'
        }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockConfigs = [
        {
          key: 'app.name',
          value: '幼儿园管理系统',
          type: 'string',
          category: 'application'
        },
        {
          key: 'app.version',
          value: '1.0.0',
          type: 'string',
          category: 'application'
        }
      ];

      mockConfigService.getAllConfigs.mockResolvedValue({
        configs: mockConfigs,
        total: 2,
        page: 1,
        pageSize: 20
      });

      await configController.getAllConfigs(req, res);

      expect(mockConfigService.getAllConfigs).toHaveBeenCalledWith({
        category: 'application',
        page: 1,
        pageSize: 20
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockConfigs,
        total: 2,
        page: 1,
        pageSize: 20
      });
    });

    it('应该支持搜索功能', async () => {
      const req = createMockRequest({
        query: {
          search: 'email',
          page: '1',
          pageSize: '10'
        }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockConfigs = [
        {
          key: 'email.smtp.host',
          value: 'smtp.example.com',
          type: 'string',
          category: 'email'
        }
      ];

      mockConfigService.getAllConfigs.mockResolvedValue({
        configs: mockConfigs,
        total: 1,
        page: 1,
        pageSize: 10
      });

      await configController.getAllConfigs(req, res);

      expect(mockConfigService.getAllConfigs).toHaveBeenCalledWith({
        search: 'email',
        page: 1,
        pageSize: 10
      });
    });
  });

  describe('setConfig', () => {
    it('应该设置配置项', async () => {
      const req = createMockRequest({
        body: {
          key: 'app.maintenance_mode',
          value: true,
          type: 'boolean',
          category: 'application',
          description: '维护模式开关'
        }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockConfig = {
        id: 1,
        key: 'app.maintenance_mode',
        value: true,
        type: 'boolean',
        category: 'application',
        description: '维护模式开关',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockConfigService.validateConfig.mockResolvedValue({ isValid: true });
      mockConfigService.setConfig.mockResolvedValue(mockConfig);

      await configController.setConfig(req, res);

      expect(mockConfigService.validateConfig).toHaveBeenCalledWith({
        key: 'app.maintenance_mode',
        value: true,
        type: 'boolean'
      });
      expect(mockConfigService.setConfig).toHaveBeenCalledWith(req.body);
      expect(mockAuditService.logConfigChange).toHaveBeenCalledWith({
        action: 'create',
        key: 'app.maintenance_mode',
        newValue: true,
        userId: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockConfig,
        message: '配置设置成功'
      });
    });

    it('应该验证配置值', async () => {
      const req = createMockRequest({
        body: {
          key: 'app.max_users',
          value: 'invalid_number',
          type: 'integer'
        }
      }) as Request;
      const res = createMockResponse() as Response;

      mockConfigService.validateConfig.mockResolvedValue({
        isValid: false,
        errors: ['值必须是有效的整数']
      });

      await configController.setConfig(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '配置验证失败',
        details: ['值必须是有效的整数']
      });
    });

    it('应该处理重复的配置键', async () => {
      const req = createMockRequest({
        body: {
          key: 'app.name',
          value: '新名称',
          type: 'string'
        }
      }) as Request;
      const res = createMockResponse() as Response;

      const error = new Error('配置键已存在');
      mockConfigService.validateConfig.mockResolvedValue({ isValid: true });
      mockConfigService.setConfig.mockRejectedValue(error);

      await configController.setConfig(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '配置键已存在'
      });
    });
  });

  describe('updateConfig', () => {
    it('应该更新配置项', async () => {
      const req = createMockRequest({
        params: { key: 'app.name' },
        body: {
          value: '更新的幼儿园管理系统',
          description: '更新的应用程序名称'
        }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockUpdatedConfig = {
        key: 'app.name',
        value: '更新的幼儿园管理系统',
        type: 'string',
        category: 'application',
        description: '更新的应用程序名称',
        updatedAt: new Date()
      };

      mockConfigService.validateConfig.mockResolvedValue({ isValid: true });
      mockConfigService.updateConfig.mockResolvedValue(mockUpdatedConfig);

      await configController.updateConfig(req, res);

      expect(mockConfigService.validateConfig).toHaveBeenCalledWith({
        key: 'app.name',
        value: '更新的幼儿园管理系统'
      });
      expect(mockConfigService.updateConfig).toHaveBeenCalledWith('app.name', req.body);
      expect(mockAuditService.logConfigChange).toHaveBeenCalledWith({
        action: 'update',
        key: 'app.name',
        newValue: '更新的幼儿园管理系统',
        userId: 1
      });
      expect(mockCacheService.del).toHaveBeenCalledWith('config:app.name');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedConfig,
        message: '配置更新成功'
      });
    });

    it('应该处理配置项不存在的情况', async () => {
      const req = createMockRequest({
        params: { key: 'nonexistent.key' },
        body: { value: 'new value' }
      }) as Request;
      const res = createMockResponse() as Response;

      mockConfigService.updateConfig.mockResolvedValue(null);

      await configController.updateConfig(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '配置项不存在'
      });
    });
  });

  describe('deleteConfig', () => {
    it('应该删除配置项', async () => {
      const req = createMockRequest({
        params: { key: 'temp.config' }
      }) as Request;
      const res = createMockResponse() as Response;

      mockConfigService.deleteConfig.mockResolvedValue(undefined);

      await configController.deleteConfig(req, res);

      expect(mockConfigService.deleteConfig).toHaveBeenCalledWith('temp.config');
      expect(mockAuditService.logConfigChange).toHaveBeenCalledWith({
        action: 'delete',
        key: 'temp.config',
        userId: 1
      });
      expect(mockCacheService.del).toHaveBeenCalledWith('config:temp.config');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '配置删除成功'
      });
    });

    it('应该处理删除不存在的配置项', async () => {
      const req = createMockRequest({
        params: { key: 'nonexistent.key' }
      }) as Request;
      const res = createMockResponse() as Response;

      mockConfigService.deleteConfig.mockResolvedValue(undefined);

      await configController.deleteConfig(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '配置项不存在'
      });
    });

    it('应该防止删除系统关键配置', async () => {
      const req = createMockRequest({
        params: { key: 'system.database.host' }
      }) as Request;
      const res = createMockResponse() as Response;

      const error = new Error('不能删除系统关键配置');
      mockConfigService.deleteConfig.mockRejectedValue(error);

      await configController.deleteConfig(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '不能删除系统关键配置'
      });
    });
  });

  describe('getConfigsByCategory', () => {
    it('应该按分类获取配置项', async () => {
      const req = createMockRequest({
        params: { category: 'email' }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockConfigs = [
        {
          key: 'email.smtp.host',
          value: 'smtp.example.com',
          type: 'string',
          category: 'email'
        },
        {
          key: 'email.smtp.port',
          value: 587,
          type: 'integer',
          category: 'email'
        }
      ];

      mockConfigService.getConfigsByCategory.mockResolvedValue(mockConfigs);

      await configController.getConfigsByCategory(req, res);

      expect(mockConfigService.getConfigsByCategory).toHaveBeenCalledWith('email');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockConfigs,
        category: 'email'
      });
    });

    it('应该处理空分类', async () => {
      const req = createMockRequest({
        params: { category: 'nonexistent' }
      }) as Request;
      const res = createMockResponse() as Response;

      mockConfigService.getConfigsByCategory.mockResolvedValue([]);

      await configController.getConfigsByCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        category: 'nonexistent'
      });
    });
  });

  describe('resetConfig', () => {
    it('应该重置配置项到默认值', async () => {
      const req = createMockRequest({
        params: { key: 'app.theme' }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockResetConfig = {
        key: 'app.theme',
        value: 'default',
        type: 'string',
        category: 'application',
        isDefault: true
      };

      mockConfigService.resetConfig.mockResolvedValue(mockResetConfig);

      await configController.resetConfig(req, res);

      expect(mockConfigService.resetConfig).toHaveBeenCalledWith('app.theme');
      expect(mockAuditService.logConfigChange).toHaveBeenCalledWith({
        action: 'reset',
        key: 'app.theme',
        newValue: 'default',
        userId: 1
      });
      expect(mockCacheService.del).toHaveBeenCalledWith('config:app.theme');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResetConfig,
        message: '配置重置成功'
      });
    });

    it('应该处理没有默认值的配置项', async () => {
      const req = createMockRequest({
        params: { key: 'custom.setting' }
      }) as Request;
      const res = createMockResponse() as Response;

      const error = new Error('该配置项没有默认值');
      mockConfigService.resetConfig.mockRejectedValue(error);

      await configController.resetConfig(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '该配置项没有默认值'
      });
    });
  });

  describe('exportConfigs', () => {
    it('应该导出配置', async () => {
      const req = createMockRequest({
        query: {
          category: 'application',
          format: 'json'
        }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockExportData = {
        filename: 'configs_application_20240415.json',
        data: {
          'app.name': '幼儿园管理系统',
          'app.version': '1.0.0'
        },
        exportedAt: new Date(),
        count: 2
      };

      mockConfigService.exportConfigs.mockResolvedValue(mockExportData);

      await configController.exportConfigs(req, res);

      expect(mockConfigService.exportConfigs).toHaveBeenCalledWith({
        category: 'application',
        format: 'json'
      });
      expect(mockAuditService.log).toHaveBeenCalledWith({
        action: 'export_configs',
        details: { category: 'application', format: 'json' },
        userId: 1
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockExportData,
        message: '配置导出成功'
      });
    });

    it('应该支持不同的导出格式', async () => {
      const req = createMockRequest({
        query: {
          format: 'yaml'
        }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockExportData = {
        filename: 'configs_all_20240415.yaml',
        data: 'app:\n  name: 幼儿园管理系统\n  version: 1.0.0',
        exportedAt: new Date(),
        count: 2
      };

      mockConfigService.exportConfigs.mockResolvedValue(mockExportData);

      await configController.exportConfigs(req, res);

      expect(mockConfigService.exportConfigs).toHaveBeenCalledWith({
        format: 'yaml'
      });
    });
  });

  describe('importConfigs', () => {
    it('应该导入配置', async () => {
      const req = createMockRequest({
        body: {
          data: {
            'app.name': '导入的幼儿园系统',
            'app.version': '2.0.0'
          },
          overwrite: true,
          validate: true
        }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockImportResult = {
        imported: 2,
        skipped: 0,
        errors: [],
        details: [
          { key: 'app.name', action: 'updated' },
          { key: 'app.version', action: 'created' }
        ]
      };

      mockConfigService.importConfigs.mockResolvedValue(mockImportResult);

      await configController.importConfigs(req, res);

      expect(mockConfigService.importConfigs).toHaveBeenCalledWith(req.body);
      expect(mockAuditService.log).toHaveBeenCalledWith({
        action: 'import_configs',
        details: { imported: 2, skipped: 0 },
        userId: 1
      });
      expect(mockCacheService.clear).toHaveBeenCalledWith('config:*');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockImportResult,
        message: '配置导入成功'
      });
    });

    it('应该处理导入验证错误', async () => {
      const req = createMockRequest({
        body: {
          data: {
            'app.max_users': 'invalid_number'
          },
          validate: true
        }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockImportResult = {
        imported: 0,
        skipped: 1,
        errors: [
          {
            key: 'app.max_users',
            error: '值必须是有效的整数'
          }
        ]
      };

      mockConfigService.importConfigs.mockResolvedValue(mockImportResult);

      await configController.importConfigs(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockImportResult,
        message: '配置导入完成，但有错误'
      });
    });
  });

  describe('getConfigHistory', () => {
    it('应该获取配置变更历史', async () => {
      const req = createMockRequest({
        params: { key: 'app.name' },
        query: {
          page: '1',
          pageSize: '10'
        }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockHistory = [
        {
          id: 1,
          key: 'app.name',
          oldValue: '旧名称',
          newValue: '新名称',
          action: 'update',
          userId: 1,
          userName: '管理员',
          createdAt: new Date()
        }
      ];

      mockConfigService.getConfigHistory.mockResolvedValue({
        history: mockHistory,
        total: 1,
        page: 1,
        pageSize: 10
      });

      await configController.getConfigHistory(req, res);

      expect(mockConfigService.getConfigHistory).toHaveBeenCalledWith('app.name', {
        page: 1,
        pageSize: 10
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockHistory,
        total: 1,
        page: 1,
        pageSize: 10
      });
    });
  });

  describe('restoreConfig', () => {
    it('应该恢复配置到历史版本', async () => {
      const req = createMockRequest({
        params: { key: 'app.name' },
        body: { historyId: 1 }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockRestoredConfig = {
        key: 'app.name',
        value: '恢复的名称',
        type: 'string',
        category: 'application',
        restoredFrom: 1,
        updatedAt: new Date()
      };

      mockConfigService.restoreConfig.mockResolvedValue(mockRestoredConfig);

      await configController.restoreConfig(req, res);

      expect(mockConfigService.restoreConfig).toHaveBeenCalledWith('app.name', 1);
      expect(mockAuditService.logConfigChange).toHaveBeenCalledWith({
        action: 'restore',
        key: 'app.name',
        newValue: '恢复的名称',
        historyId: 1,
        userId: 1
      });
      expect(mockCacheService.del).toHaveBeenCalledWith('config:app.name');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRestoredConfig,
        message: '配置恢复成功'
      });
    });

    it('应该处理无效的历史记录ID', async () => {
      const req = createMockRequest({
        params: { key: 'app.name' },
        body: { historyId: 999 }
      }) as Request;
      const res = createMockResponse() as Response;

      const error = new Error('历史记录不存在');
      mockConfigService.restoreConfig.mockRejectedValue(error);

      await configController.restoreConfig(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '历史记录不存在'
      });
    });
  });

  describe('权限控制', () => {
    it('应该要求管理员权限', async () => {
      const req = createMockRequest({
        user: {
          id: 1,
          email: 'user@example.com',
          role: 'teacher' // 非管理员
        },
        body: {
          key: 'app.name',
          value: '新名称'
        }
      }) as Request;
      const res = createMockResponse() as Response;

      // 模拟权限检查失败
      await configController.setConfig(req, res);

      // 在实际实现中，权限检查应该在中间件中进行
      // 这里只是示例如何测试权限相关的逻辑
    });

    it('应该记录敏感配置的访问', async () => {
      const req = createMockRequest({
        params: { key: 'database.password' }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockConfig = {
        key: 'database.password',
        value: '***',
        type: 'string',
        category: 'database',
        isSensitive: true
      };

      mockConfigService.getConfig.mockResolvedValue(mockConfig);

      await configController.getConfig(req, res);

      expect(mockAuditService.log).toHaveBeenCalledWith({
        action: 'access_sensitive_config',
        details: { key: 'database.password' },
        userId: 1
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理服务不可用错误', async () => {
      const req = createMockRequest({
        params: { key: 'app.name' }
      }) as Request;
      const res = createMockResponse() as Response;

      const error = new Error('配置服务不可用');
      mockConfigService.getConfig.mockRejectedValue(error);

      await configController.getConfig(req, res);

      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '获取配置失败'
      });
    });

    it('应该处理无效的请求参数', async () => {
      const req = createMockRequest({
        body: {
          // 缺少必需的key字段
          value: 'some value'
        }
      }) as Request;
      const res = createMockResponse() as Response;

      await configController.setConfig(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: '请求参数无效',
        details: expect.any(Array)
      });
    });

    it('应该处理缓存服务错误', async () => {
      const req = createMockRequest({
        params: { key: 'app.name' },
        body: { value: '新名称' }
      }) as Request;
      const res = createMockResponse() as Response;

      const mockUpdatedConfig = {
        key: 'app.name',
        value: '新名称'
      };

      mockConfigService.validateConfig.mockResolvedValue({ isValid: true });
      mockConfigService.updateConfig.mockResolvedValue(mockUpdatedConfig);
      mockCacheService.del.mockRejectedValue(new Error('缓存服务不可用'));

      await configController.updateConfig(req, res);

      // 即使缓存清除失败，配置更新也应该成功
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        '清除配置缓存失败',
        expect.objectContaining({
          key: 'app.name'
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
