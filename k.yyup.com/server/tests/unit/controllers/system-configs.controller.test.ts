// Mock dependencies
jest.mock('../../../src/init');
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/services/system/system-config.service');

import { Request, Response } from 'express';
import { vi } from 'vitest'
import {
  getSystemConfigs,
  getSystemConfigById,
  createSystemConfig,
  updateSystemConfig,
  deleteSystemConfig,
  getConfigsByGroup,
  updateConfigsByGroup,
  resetConfigsToDefault,
  exportConfigs,
  importConfigs
} from '../../../src/controllers/system-configs.controller';
import { sequelize } from '../../../src/init';
import { ApiResponse } from '../../../src/utils/apiResponse';
import SystemConfigService from '../../../src/services/system/system-config.service';
import { ConfigValueType } from '../../../src/models/system-config.model';

// Mock implementations
const mockSequelize = {
  query: jest.fn(),
  transaction: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockApiResponse = {
  success: jest.fn(),
  error: jest.fn(),
  handleError: jest.fn()
};

const mockSystemConfigService = {
  getList: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getByGroup: jest.fn(),
  updateByGroup: jest.fn(),
  resetToDefault: jest.fn(),
  export: jest.fn(),
  import: jest.fn(),
  validateConfig: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;
(ApiResponse.success as any) = mockApiResponse.success;
(ApiResponse.error as any) = mockApiResponse.error;
(ApiResponse.handleError as any) = mockApiResponse.handleError;
(SystemConfigService as any) = mockSystemConfigService;

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: { id: 1, username: 'admin' }
} as Partial<Request>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};


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

describe('System Configs Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('getSystemConfigs', () => {
    it('应该成功获取系统配置列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        pageSize: '10',
        groupKey: 'system',
        keyword: 'email',
        isSystem: 'true',
        isReadonly: 'false'
      };

      const mockConfigs = {
        data: [
          {
            id: 1,
            configKey: 'system.email.smtp_host',
            configValue: 'smtp.gmail.com',
            valueType: ConfigValueType.STRING,
            groupKey: 'system',
            displayName: 'SMTP主机',
            description: 'SMTP服务器主机地址',
            isSystem: true,
            isReadonly: false,
            defaultValue: 'localhost',
            validationRules: '{"required": true}',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 2,
            configKey: 'system.email.smtp_port',
            configValue: '587',
            valueType: ConfigValueType.INTEGER,
            groupKey: 'system',
            displayName: 'SMTP端口',
            description: 'SMTP服务器端口',
            isSystem: true,
            isReadonly: false,
            defaultValue: '25',
            validationRules: '{"min": 1, "max": 65535}',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };

      mockSystemConfigService.getList.mockResolvedValue(mockConfigs);

      await getSystemConfigs(req as Request, res as Response);

      expect(mockSystemConfigService.getList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        groupKey: 'system',
        keyword: 'email',
        isSystem: true,
        isReadonly: false
      });
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockConfigs);
    });

    it('应该使用默认查询参数', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockEmptyList = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      };

      mockSystemConfigService.getList.mockResolvedValue(mockEmptyList);

      await getSystemConfigs(req as Request, res as Response);

      expect(mockSystemConfigService.getList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        groupKey: undefined,
        keyword: undefined,
        isSystem: undefined,
        isReadonly: undefined
      });
    });

    it('应该处理获取配置列表失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const serviceError = new Error('Database query failed');
      mockSystemConfigService.getList.mockRejectedValue(serviceError);

      await getSystemConfigs(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, serviceError, '获取系统配置列表失败');
    });
  });

  describe('getSystemConfigById', () => {
    it('应该成功获取系统配置详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockConfig = {
        id: 1,
        configKey: 'system.email.smtp_host',
        configValue: 'smtp.gmail.com',
        valueType: ConfigValueType.STRING,
        groupKey: 'system',
        displayName: 'SMTP主机',
        description: 'SMTP服务器主机地址',
        isSystem: true,
        isReadonly: false,
        defaultValue: 'localhost',
        validationRules: '{"required": true}',
        createdAt: new Date(),
        updatedAt: new Date(),
        // 额外信息
        lastModifiedBy: 1,
        changeHistory: [
          {
            id: 1,
            oldValue: 'localhost',
            newValue: 'smtp.gmail.com',
            changedBy: 1,
            changedAt: new Date()
          }
        ]
      };

      mockSystemConfigService.getById.mockResolvedValue(mockConfig);

      await getSystemConfigById(req as Request, res as Response);

      expect(mockSystemConfigService.getById).toHaveBeenCalledWith(1);
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockConfig);
    });

    it('应该处理配置不存在', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockSystemConfigService.getById.mockResolvedValue(null);

      await getSystemConfigById(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '系统配置不存在', 'CONFIG_NOT_FOUND', 404);
    });

    it('应该处理无效的配置ID', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      await getSystemConfigById(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '无效的配置ID', 'INVALID_CONFIG_ID', 400);
    });
  });

  describe('createSystemConfig', () => {
    it('应该成功创建系统配置', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        configKey: 'system.notification.email_enabled',
        configValue: 'true',
        valueType: ConfigValueType.BOOLEAN,
        groupKey: 'system',
        displayName: '邮件通知启用',
        description: '是否启用邮件通知功能',
        isSystem: true,
        isReadonly: false,
        defaultValue: 'false',
        validationRules: '{"type": "boolean"}'
      };

      const mockCreatedConfig = {
        id: 3,
        configKey: 'system.notification.email_enabled',
        configValue: 'true',
        valueType: ConfigValueType.BOOLEAN,
        groupKey: 'system',
        displayName: '邮件通知启用',
        description: '是否启用邮件通知功能',
        isSystem: true,
        isReadonly: false,
        defaultValue: 'false',
        validationRules: '{"type": "boolean"}',
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockSystemConfigService.validateConfig.mockReturnValue({ isValid: true });
      mockSystemConfigService.create.mockResolvedValue(mockCreatedConfig);

      await createSystemConfig(req as Request, res as Response);

      expect(mockSystemConfigService.validateConfig).toHaveBeenCalledWith(req.body);
      expect(mockSystemConfigService.create).toHaveBeenCalledWith({
        ...req.body,
        createdBy: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockCreatedConfig, '系统配置创建成功');
    });

    it('应该验证配置数据', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        configKey: 'invalid.key',
        configValue: 'test'
        // 缺少必填字段
      };

      const validationResult = {
        isValid: false,
        errors: ['配置键名格式不正确', '缺少必填字段']
      };

      mockSystemConfigService.validateConfig.mockReturnValue(validationResult);

      await createSystemConfig(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '配置数据验证失败: 配置键名格式不正确, 缺少必填字段', 'VALIDATION_ERROR', 400);
    });

    it('应该处理重复的配置键名', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        configKey: 'system.email.smtp_host',
        configValue: 'smtp.example.com',
        valueType: ConfigValueType.STRING,
        groupKey: 'system'
      };

      mockSystemConfigService.validateConfig.mockReturnValue({ isValid: true });
      const duplicateError = new Error('配置键名已存在');
      mockSystemConfigService.create.mockRejectedValue(duplicateError);

      await createSystemConfig(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, duplicateError, '创建系统配置失败');
    });
  });

  describe('updateSystemConfig', () => {
    it('应该成功更新系统配置', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        configValue: 'smtp.newhost.com',
        displayName: '更新的SMTP主机',
        description: '更新的SMTP服务器主机地址'
      };

      const mockUpdatedConfig = {
        id: 1,
        configKey: 'system.email.smtp_host',
        configValue: 'smtp.newhost.com',
        valueType: ConfigValueType.STRING,
        groupKey: 'system',
        displayName: '更新的SMTP主机',
        description: '更新的SMTP服务器主机地址',
        isSystem: true,
        isReadonly: false,
        updatedBy: 1,
        updatedAt: new Date()
      };

      mockSystemConfigService.validateConfig.mockReturnValue({ isValid: true });
      mockSystemConfigService.update.mockResolvedValue(mockUpdatedConfig);

      await updateSystemConfig(req as Request, res as Response);

      expect(mockSystemConfigService.update).toHaveBeenCalledWith(1, {
        ...req.body,
        updatedBy: 1
      });
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockUpdatedConfig, '系统配置更新成功');
    });

    it('应该处理更新不存在的配置', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };
      req.body = { configValue: 'new_value' };

      mockSystemConfigService.validateConfig.mockReturnValue({ isValid: true });
      mockSystemConfigService.update.mockResolvedValue(null);

      await updateSystemConfig(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '系统配置不存在', 'CONFIG_NOT_FOUND', 404);
    });

    it('应该阻止更新只读配置', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { configValue: 'new_value' };

      const readonlyError = new Error('只读配置无法修改');
      mockSystemConfigService.validateConfig.mockReturnValue({ isValid: true });
      mockSystemConfigService.update.mockRejectedValue(readonlyError);

      await updateSystemConfig(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, readonlyError, '更新系统配置失败');
    });
  });

  describe('deleteSystemConfig', () => {
    it('应该成功删除系统配置', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      mockSystemConfigService.delete.mockResolvedValue(undefined);

      await deleteSystemConfig(req as Request, res as Response);

      expect(mockSystemConfigService.delete).toHaveBeenCalledWith(1);
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, null, '系统配置删除成功');
    });

    it('应该处理删除不存在的配置', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockSystemConfigService.delete.mockResolvedValue(undefined);

      await deleteSystemConfig(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '系统配置不存在', 'CONFIG_NOT_FOUND', 404);
    });

    it('应该阻止删除系统配置', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const systemConfigError = new Error('系统配置无法删除');
      mockSystemConfigService.delete.mockRejectedValue(systemConfigError);

      await deleteSystemConfig(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, systemConfigError, '删除系统配置失败');
    });
  });

  describe('getConfigsByGroup', () => {
    it('应该成功获取分组配置', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { groupKey: 'system' };

      const mockGroupConfigs = [
        {
          id: 1,
          configKey: 'system.email.smtp_host',
          configValue: 'smtp.gmail.com',
          displayName: 'SMTP主机'
        },
        {
          id: 2,
          configKey: 'system.email.smtp_port',
          configValue: '587',
          displayName: 'SMTP端口'
        }
      ];

      mockSystemConfigService.getByGroup.mockResolvedValue(mockGroupConfigs);

      await getConfigsByGroup(req as Request, res as Response);

      expect(mockSystemConfigService.getByGroup).toHaveBeenCalledWith('system');
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockGroupConfigs);
    });

    it('应该处理空分组', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { groupKey: 'empty_group' };

      mockSystemConfigService.getByGroup.mockResolvedValue([]);

      await getConfigsByGroup(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, []);
    });
  });

  describe('updateConfigsByGroup', () => {
    it('应该成功批量更新分组配置', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { groupKey: 'system' };
      req.body = {
        configs: [
          { configKey: 'system.email.smtp_host', configValue: 'smtp.newhost.com' },
          { configKey: 'system.email.smtp_port', configValue: '465' }
        ]
      };

      const mockUpdatedConfigs = [
        {
          id: 1,
          configKey: 'system.email.smtp_host',
          configValue: 'smtp.newhost.com',
          updatedAt: new Date()
        },
        {
          id: 2,
          configKey: 'system.email.smtp_port',
          configValue: '465',
          updatedAt: new Date()
        }
      ];

      mockSystemConfigService.updateByGroup.mockResolvedValue(mockUpdatedConfigs);

      await updateConfigsByGroup(req as Request, res as Response);

      expect(mockSystemConfigService.updateByGroup).toHaveBeenCalledWith('system', req.body.configs, 1);
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockUpdatedConfigs, '批量更新配置成功');
    });

    it('应该验证批量更新数据', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { groupKey: 'system' };
      req.body = {
        // 缺少configs字段
      };

      await updateConfigsByGroup(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '缺少配置数据', 'MISSING_CONFIG_DATA', 400);
    });

    it('应该处理批量更新失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { groupKey: 'system' };
      req.body = {
        configs: [
          { configKey: 'system.invalid.key', configValue: 'value' }
        ]
      };

      const updateError = new Error('部分配置更新失败');
      mockSystemConfigService.updateByGroup.mockRejectedValue(updateError);

      await updateConfigsByGroup(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, updateError, '批量更新配置失败');
    });
  });

  describe('resetConfigsToDefault', () => {
    it('应该成功重置配置到默认值', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        configKeys: ['system.email.smtp_host', 'system.email.smtp_port']
      };

      const mockResetConfigs = [
        {
          id: 1,
          configKey: 'system.email.smtp_host',
          configValue: 'localhost',
          resetAt: new Date()
        },
        {
          id: 2,
          configKey: 'system.email.smtp_port',
          configValue: '25',
          resetAt: new Date()
        }
      ];

      mockSystemConfigService.resetToDefault.mockResolvedValue(mockResetConfigs);

      await resetConfigsToDefault(req as Request, res as Response);

      expect(mockSystemConfigService.resetToDefault).toHaveBeenCalledWith(req.body.configKeys, 1);
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockResetConfigs, '配置重置成功');
    });

    it('应该处理重置全部配置', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {}; // 不指定configKeys，重置全部

      const mockAllResetConfigs = [];
      mockSystemConfigService.resetToDefault.mockResolvedValue(mockAllResetConfigs);

      await resetConfigsToDefault(req as Request, res as Response);

      expect(mockSystemConfigService.resetToDefault).toHaveBeenCalledWith(undefined, 1);
    });

    it('应该处理重置失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        configKeys: ['invalid.key']
      };

      const resetError = new Error('配置重置失败');
      mockSystemConfigService.resetToDefault.mockRejectedValue(resetError);

      await resetConfigsToDefault(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, resetError, '重置配置失败');
    });
  });
});
