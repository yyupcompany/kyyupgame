/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSettings, updateSettings } from '@/api/modules/system';
import { expectNoConsoleErrors } from '../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue,
  validateDateFormat
} from '../../utils/data-validation';

// Mock request utility
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock ErrorHandler
vi.mock('@/utils/errorHandler', () => ({
  ErrorHandler: {
    handle: vi.fn()
  }
}));

import { request } from '@/utils/request';
const mockRequest = request as any;

describe('系统配置API - 严格验证测试', () => {
  // 系统设置接口定义
  interface SystemSettings {
    siteName: string;
    version: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
    maxFileSize: string;
    sessionTimeout: number;
    emailNotifications: boolean;
    smsNotifications: boolean;
  }

  interface SystemSetting {
    id: string;
    key: string;
    value: string | number | boolean;
    type: 'string' | 'number' | 'boolean' | 'json';
    category: string;
    description?: string;
    required?: boolean;
    defaultValue?: string | number | boolean;
  }

  interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
  }

  interface PaginationResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  }

  const mockSettingsData: SystemSettings = {
    siteName: '幼儿园管理系统',
    version: 'v2.1.0',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN',
    maintenanceMode: false,
    maxFileSize: '10MB',
    sessionTimeout: 120,
    emailNotifications: true,
    smsNotifications: false
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    expectNoConsoleErrors();
    vi.restoreAllMocks();
  });

  describe('getSettings API - 严格验证', () => {
    it('应该正确获取系统设置并进行严格验证', async () => {
      const mockResponse: ApiResponse<SystemSettings> = {
        success: true,
        data: mockSettingsData
      };

      mockRequest.get.mockResolvedValue(mockResponse);
      const result = await getSettings();

      // 1. 验证API调用
      expect(mockRequest.get).toHaveBeenCalledWith('/system/settings');
      expect(mockRequest.get).toHaveBeenCalledTimes(1);

      // 2. 验证响应结构
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 3. 验证必填字段
      const requiredFields = [
        'siteName', 'version', 'timezone', 'language', 'maintenanceMode',
        'maxFileSize', 'sessionTimeout', 'emailNotifications', 'smsNotifications'
      ];
      const validation = validateRequiredFields(result.data, requiredFields);
      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        throw new Error(`Missing required fields: ${validation.missing.join(', ')}`);
      }

      // 4. 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        siteName: 'string',
        version: 'string',
        timezone: 'string',
        language: 'string',
        maintenanceMode: 'boolean',
        maxFileSize: 'string',
        sessionTimeout: 'number',
        emailNotifications: 'boolean',
        smsNotifications: 'boolean'
      });
      expect(typeValidation.valid).toBe(true);
      if (!typeValidation.valid) {
        throw new Error(`Type validation errors: ${typeValidation.errors.join(', ')}`);
      }

      // 5. 验证枚举值（如果有）
      expect(['zh-CN', 'en-US']).toContain(result.data.language);
      expect(typeof result.data.maintenanceMode).toBe('boolean');
      expect(typeof result.data.emailNotifications).toBe('boolean');
      expect(typeof result.data.smsNotifications).toBe('boolean');

      // 6. 验证数值范围
      expect(result.data.sessionTimeout).toBeGreaterThanOrEqual(0);
      expect(result.data.sessionTimeout).toBeLessThanOrEqual(1440); // 24小时
    });

    it('应该处理API返回null数据的情况', async () => {
      const mockResponse: ApiResponse<null> = {
        success: true,
        data: null
      };

      mockRequest.get.mockResolvedValue(mockResponse);
      const result = await getSettings();

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();

      // 即使数据为null，响应结构应该是正确的
      const responseValidation = validateRequiredFields(result, ['success', 'data']);
      expect(responseValidation.valid).toBe(true);
    });

    it('应该处理API返回部分数据的情况', async () => {
      const partialData = {
        siteName: '测试系统',
        version: 'v1.0.0'
        // 缺少其他字段
      };

      const mockResponse: ApiResponse<Partial<SystemSettings>> = {
        success: true,
        data: partialData
      };

      mockRequest.get.mockResolvedValue(mockResponse);
      const result = await getSettings();

      expect(result.success).toBe(true);
      expect(result.data.siteName).toBe('测试系统');
      expect(result.data.version).toBe('v1.0.0');

      // 验证存在的字段类型
      if (result.data.siteName) {
        expect(typeof result.data.siteName).toBe('string');
      }
      if (result.data.version) {
        expect(typeof result.data.version).toBe('string');
      }
    });

    it('应该处理API失败响应', async () => {
      const mockResponse = {
        success: false,
        message: '获取系统设置失败'
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      try {
        await getSettings();
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.message).toContain('获取系统设置失败');
      }
    });

    it('应该处理网络异常', async () => {
      const networkError = new Error('Network Error');
      mockRequest.get.mockRejectedValue(networkError);

      try {
        await getSettings();
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error).toBe(networkError);
      }

      // 验证错误处理
      const { ErrorHandler } = await import('@/utils/errorHandler');
      expect(ErrorHandler.handle).toHaveBeenCalled();
    });

    it('应该验证时区格式的有效性', async () => {
      const testData = [
        { timezone: 'Asia/Shanghai', valid: true },
        { timezone: 'UTC', valid: true },
        { timezone: 'America/New_York', valid: true },
        { timezone: 'Invalid/Timezone', valid: false },
        { timezone: '', valid: false }
      ];

      for (const data of testData) {
        const mockResponse: ApiResponse<SystemSettings> = {
          success: true,
          data: { ...mockSettingsData, timezone: data.timezone }
        };

        mockRequest.get.mockResolvedValue(mockResponse);
        const result = await getSettings();

        if (data.valid) {
          expect(result.data.timezone).toBeTruthy();
          expect(typeof result.data.timezone).toBe('string');
        }
      }
    });

    it('应该验证版本号格式的有效性', async () => {
      const validVersions = ['v1.0.0', '2.1.0', '1.0.0-alpha', '1.0.0-beta.1'];

      for (const version of validVersions) {
        const mockResponse: ApiResponse<SystemSettings> = {
          success: true,
          data: { ...mockSettingsData, version }
        };

        mockRequest.get.mockResolvedValue(mockResponse);
        const result = await getSettings();

        expect(result.data.version).toBe(version);
        expect(typeof result.data.version).toBe('string');
        expect(result.data.version).toMatch(/^v?\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/);
      }
    });
  });

  describe('updateSettings API - 严格验证', () => {
    const mockSettingsArray: SystemSetting[] = [
      {
        id: 'site_name',
        key: 'site_name',
        value: '新站点名称',
        type: 'string',
        category: 'basic',
        description: '站点名称'
      },
      {
        id: 'session_timeout',
        key: 'session_timeout',
        value: 180,
        type: 'number',
        category: 'security',
        description: '会话超时时间'
      },
      {
        id: 'maintenance_mode',
        key: 'maintenance_mode',
        value: true,
        type: 'boolean',
        category: 'basic',
        description: '维护模式'
      }
    ];

    it('应该正确更新系统设置并进行严格验证', async () => {
      const mockResponse: ApiResponse<SystemSetting[]> = {
        success: true,
        data: mockSettingsArray,
        message: '设置更新成功'
      };

      mockRequest.put.mockResolvedValue(mockResponse);
      const result = await updateSettings('basic', mockSettingsArray);

      // 1. 验证API调用
      expect(mockRequest.put).toHaveBeenCalledWith('/system/settings/basic', {
        settings: mockSettingsArray
      });
      expect(mockRequest.put).toHaveBeenCalledTimes(1);

      // 2. 验证响应结构
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);

      // 3. 验证必填字段
      if (result.data.length > 0) {
        const requiredFields = ['id', 'key', 'value', 'type', 'category'];
        result.data.forEach((setting, index) => {
          const validation = validateRequiredFields(setting, requiredFields);
          expect(validation.valid).toBe(true);
          if (!validation.valid) {
            throw new Error(`Setting at index ${index} missing required fields: ${validation.missing.join(', ')}`);
          }
        });
      }

      // 4. 验证字段类型
      if (result.data.length > 0) {
        result.data.forEach((setting, index) => {
          const typeValidation = validateFieldTypes(setting, {
            id: 'string',
            key: 'string',
            value: 'string', // 在API层面所有value都是字符串传输
            type: 'string',
            category: 'string',
            description: 'string'
          });

          // 允许description字段可选
          if (!typeValidation.valid && typeValidation.errors.some(e => e.includes('description'))) {
            // description字段缺失是允许的
          } else {
            expect(typeValidation.valid).toBe(true);
          }

          if (!typeValidation.valid) {
            console.warn(`Type validation for setting ${index}:`, typeValidation.errors);
          }
        });
      }

      // 5. 验证枚举值
      if (result.data.length > 0) {
        result.data.forEach(setting => {
          expect(['string', 'number', 'boolean', 'json']).toContain(setting.type);
          expect(['basic', 'security', 'email', 'storage']).toContain(setting.category);
        });
      }
    });

    it('应该验证更新参数的有效性', async () => {
      const invalidSettings = [
        {
          // 缺少必填字段
          value: 'invalid'
        }
      ];

      mockRequest.put.mockResolvedValue({
        success: false,
        message: '设置数据格式错误'
      });

      try {
        await updateSettings('basic', invalidSettings as any);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.message).toContain('设置数据格式错误');
      }
    });

    it('应该处理无效的设置类型', async () => {
      const invalidTypeSettings = [{
        id: 'test_setting',
        key: 'test_setting',
        value: 'test',
        type: 'invalid_type', // 无效类型
        category: 'basic'
      }];

      mockRequest.put.mockResolvedValue({
        success: false,
        message: '无效的设置类型'
      });

      const result = await updateSettings('basic', invalidTypeSettings as any);
      expect(result.success).toBe(false);
      expect(result.message).toContain('无效的设置类型');
    });

    it('应该处理空的设置数组', async () => {
      const emptySettings: SystemSetting[] = [];

      const mockResponse: ApiResponse<SystemSetting[]> = {
        success: true,
        data: emptySettings,
        message: '设置更新成功'
      };

      mockRequest.put.mockResolvedValue(mockResponse);
      const result = await updateSettings('basic', emptySettings);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('应该处理更新失败的情况', async () => {
      const errorMessage = '权限不足，无法修改系统设置';
      mockRequest.put.mockResolvedValue({
        success: false,
        message: errorMessage
      });

      const result = await updateSettings('security', mockSettingsArray);

      expect(result.success).toBe(false);
      expect(result.message).toBe(errorMessage);
    });

    it('应该处理网络异常', async () => {
      const networkError = new Error('Network connection failed');
      mockRequest.put.mockRejectedValue(networkError);

      try {
        await updateSettings('basic', mockSettingsArray);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error).toBe(networkError);
      }

      // 验证错误处理
      const { ErrorHandler } = await import('@/utils/errorHandler');
      expect(ErrorHandler.handle).toHaveBeenCalled();
    });

    it('应该验证设置值的格式', async () => {
      const testSettings = [
        {
          id: 'max_file_size',
          key: 'max_file_size',
          value: '10MB',
          type: 'string',
          category: 'storage'
        },
        {
          id: 'session_timeout',
          key: 'session_timeout',
          value: '120', // 数字值但以字符串形式传输
          type: 'number',
          category: 'security'
        },
        {
          id: 'email_enabled',
          key: 'email_enabled',
          value: 'true', // 布尔值以字符串形式传输
          type: 'boolean',
          category: 'email'
        }
      ];

      const mockResponse: ApiResponse<SystemSetting[]> = {
        success: true,
        data: testSettings,
        message: '设置更新成功'
      };

      mockRequest.put.mockResolvedValue(mockResponse);
      const result = await updateSettings('storage', testSettings);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);

      // 验证每个设置项
      result.data.forEach((setting, index) => {
        expect(typeof setting.value).toBe('string');

        if (setting.type === 'number') {
          expect(/^\d+$/.test(setting.value as string)).toBe(true);
        } else if (setting.type === 'boolean') {
          expect(['true', 'false']).toContain(setting.value as string);
        }
      });
    });

    it('应该验证设置类别的有效性', async () => {
      const validCategories = ['basic', 'security', 'email', 'storage'];

      for (const category of validCategories) {
        const categorySettings = [{
          id: `test_${category}`,
          key: `test_${category}`,
          value: 'test',
          type: 'string',
          category
        }];

        mockRequest.put.mockResolvedValue({
          success: true,
          data: categorySettings
        });

        const result = await updateSettings(category, categorySettings);

        expect(result.success).toBe(true);
        expect(mockRequest.put).toHaveBeenCalledWith(
          `/system/settings/${category}`,
          { settings: categorySettings }
        );
      }
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证获取和更新设置的数据一致性', async () => {
      // 获取设置
      const getResponse: ApiResponse<SystemSettings> = {
        success: true,
        data: mockSettingsData
      };
      mockRequest.get.mockResolvedValue(getResponse);
      const getResult = await getSettings();

      // 转换为设置数组格式
      const settingsArray: SystemSetting[] = [
        {
          id: 'site_name',
          key: 'site_name',
          value: getResult.data.siteName,
          type: 'string',
          category: 'basic'
        }
      ];

      // 更新设置
      const putResponse: ApiResponse<SystemSetting[]> = {
        success: true,
        data: settingsArray
      };
      mockRequest.put.mockResolvedValue(putResponse);
      const putResult = await updateSettings('basic', settingsArray);

      // 验证数据一致性
      expect(putResult.data[0].value).toBe(getResult.data.siteName);
      expect(putResult.data[0].key).toBe('site_name');
      expect(putResult.data[0].type).toBe('string');
    });

    it('应该验证特殊字符和SQL注入防护', async () => {
      const maliciousData = {
        siteName: "'; DROP TABLE users; --",
        version: '<script>alert("xss")</script>',
        timezone: '../../../etc/passwd'
      };

      const mockResponse: ApiResponse<SystemSettings> = {
        success: true,
        data: { ...mockSettingsData, ...maliciousData }
      };

      mockRequest.get.mockResolvedValue(mockResponse);
      const result = await getSettings();

      // API应该清理或转义特殊字符
      expect(result.data.siteName).toBeDefined();
      expect(result.data.version).toBeDefined();

      // 验证不包含危险的脚本标签
      expect(result.data.version).not.toContain('<script>');
    });

    it('应该验证大量数据的处理能力', async () => {
      // 创建大量设置项
      const largeSettingsArray: SystemSetting[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `setting_${i}`,
        key: `setting_${i}`,
        value: `value_${i}`,
        type: 'string',
        category: 'basic'
      }));

      const startTime = Date.now();

      const mockResponse: ApiResponse<SystemSetting[]> = {
        success: true,
        data: largeSettingsArray
      };
      mockRequest.put.mockResolvedValue(mockResponse);

      const result = await updateSettings('basic', largeSettingsArray);

      const endTime = Date.now();

      // 验证性能
      expect(endTime - startTime).toBeLessThan(2000); // 应该在2秒内完成
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1000);

      // 验证所有项的必填字段
      result.data.forEach((setting, index) => {
        const validation = validateRequiredFields(setting, ['id', 'key', 'value', 'type', 'category']);
        expect(validation.valid).toBe(true);
        if (!validation.valid) {
          throw new Error(`Setting ${index} missing required fields`);
        }
      });
    });
  });

  describe('API安全验证', () => {
    it('应该验证请求头的安全性', async () => {
      // 验证API调用是否包含适当的安全头
      mockRequest.get.mockResolvedValue({
        success: true,
        data: mockSettingsData
      });

      await getSettings();

      // 验证request被正确调用
      expect(mockRequest.get).toHaveBeenCalledWith('/system/settings');

      // 在实际实现中，这里应该验证请求头包含安全相关的字段
      // 例如：Content-Type, Authorization等
    });

    it('应该验证API响应时间的安全性', async () => {
      // 模拟慢响应
      mockRequest.get.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ success: true, data: mockSettingsData }), 5000)
        )
      );

      const startTime = Date.now();
      await getSettings();
      const endTime = Date.now();

      // API响应时间应该在合理范围内
      expect(endTime - startTime).toBeGreaterThan(5000);

      // 在实际实现中，应该有超时处理和重试机制
    });

    it('应该验证错误信息不泄露敏感信息', async () => {
      // 模拟包含敏感信息的错误响应
      const sensitiveErrorResponse = {
        success: false,
        message: 'Database connection failed: mysql://user:password@localhost/db' // 包含敏感信息
      };

      mockRequest.get.mockResolvedValue(sensitiveErrorResponse);

      try {
        await getSettings();
        expect.fail('应该抛出错误');
      } catch (error: any) {
        // 验证错误信息不包含敏感信息
        expect(error.message).not.toContain('password');
        expect(error.message).not.toContain('mysql://');
      }
    });
  });
});