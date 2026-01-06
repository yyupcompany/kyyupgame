import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock the request module
vi.mock('@/utils/request', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDel = vi.fn();
  const mockRequestFn = vi.fn();
  const mockRequestObj = {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    del: mockDel
  };
  return {
    default: {
      request: mockRequestFn,
      get: mockGet,
      post: mockPost,
      put: mockPut,
      del: mockDel
    },
    request: mockRequestObj,
    get: mockGet,
    post: mockPost,
    put: mockPut,
    del: mockDel
  };
});

vi.mock('@/utils/dataTransform', () => ({
  transformUserData: vi.fn((data) => data),
  transformListResponse: vi.fn((response) => response),
  transformUserFormData: vi.fn((data) => data)
}));

// Import after mocks
import {
  // System基础API
  getSystemStatus,
  getSystemHealth,
  getSystemInfo,
  getVersionInfo,
  testDatabaseConnection,
  sendTestMail,
  sendTestSms,
  testStorageConfig,
  clearSystemCache,
  
  // 用户管理API
  getUsers,
  getUserDetail,
  getCurrentUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  changeUserPassword,
  updateUserRoles,
  
  // 角色管理API
  getRoles,
  getRoleDetail,
  getMyRoles,
  checkUserRole,
  createRole,
  updateRole,
  deleteRole,
  updateRoleStatus,
  
  // 权限管理API
  getPermissionTree,
  getPermissionDetail,
  getUserPagePermissions,
  checkPageAccess,
  getRolePagePermissions,
  updateRolePagePermissions,
  createPermission,
  updatePermission,
  deletePermission,
  getRolePermissions,
  assignRolePermissions,
  
  // 系统日志API
  getSystemLogs,
  exportSystemLogs,
  deleteSystemLog,
  clearSystemLogs,
  
  // 消息模板API
  getMessageTemplates,
  getMessageTemplateStats,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
  updateMessageTemplateStatus,
  batchDeleteMessageTemplates,
  
  // AI模型管理API
  getAIModels,
  getAIModelStats,
  createAIModel,
  updateAIModel,
  deleteAIModel,
  updateAIModelStatus,
  testAIModel,
  batchTestAIModels,
  batchDeleteAIModels,
  
  // 系统仪表盘API
  getSystemStats,
  getSystemDetailInfo,
  
  // 兼容性API
  getSettings,
  updateSettings,
  getSystemPerformance,
  getSystemOperationLogs
} from '@/api/modules/system';

import requestInstance from '@/utils/request';
const mockRequest = vi.mocked(requestInstance.request);
const mockGet = vi.mocked(requestInstance.get);

describe('System API', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    expectNoConsoleErrors();
  });

  describe('System基础API', () => {
    it('getSystemStatus should call request with correct endpoint', async () => {
      const mockResponse = { success: true, data: { status: 'online' } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await getSystemStatus();

      // 验证API调用
      expect(mockRequest).toHaveBeenCalledWith({
        url: '/system/health',
        method: 'get'
      });

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证必填字段
      const validation = validateRequiredFields(result.data, ['status']);
      expect(validation.valid).toBe(true);

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        status: 'string'
      });
      expect(typeValidation.valid).toBe(true);
    });

    it('getSystemHealth should call request with correct endpoint', async () => {
      const mockResponse = { success: true, data: { status: 'healthy' } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await getSystemHealth();

      expect(mockRequest).toHaveBeenCalledWith({
        url: '/system/health',
        method: 'get'
      });
      expect(result).toEqual(mockResponse);
    });

    it('getSystemInfo should call request with correct endpoint', async () => {
      const mockResponse = { success: true, data: { name: 'Test System' } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await getSystemInfo();

      expect(mockRequest).toHaveBeenCalledWith({
        url: '/system/info',
        method: 'get'
      });
      expect(result).toEqual(mockResponse);
    });

    it('getVersionInfo should call request with correct endpoint', async () => {
      const mockResponse = { success: true, data: { version: '1.0.0' } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await getVersionInfo();

      expect(mockRequest).toHaveBeenCalledWith({
        url: '/system/version',
        method: 'get'
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('用户管理API', () => {
    it('getUsers should call request with correct endpoint and params', async () => {
      const mockParams = { page: 1, pageSize: 10 };
      const mockResponse = { success: true, data: { items: [], total: 0 } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await getUsers(mockParams);

      expect(mockRequest).toHaveBeenCalledWith({
        url: '/users',
        method: 'get',
        params: mockParams
      });
      expect(result).toEqual(mockResponse);
    });

    it('createUser should call request with correct endpoint and data', async () => {
      const mockData = { username: 'testuser', email: 'test@example.com' };
      const mockResponse = { success: true, data: { id: 1, ...mockData } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await createUser(mockData);

      expect(mockRequest).toHaveBeenCalledWith({
        url: '/users',
        method: 'post',
        data: mockData
      });
      expect(result).toEqual(mockResponse);
    });

    it('updateUser should call request with correct endpoint, id and data', async () => {
      const mockId = '123';
      const mockData = { email: 'updated@example.com' };
      const mockResponse = { success: true, data: { id: mockId, ...mockData } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await updateUser(mockId, mockData);

      expect(mockRequest).toHaveBeenCalledWith({
        url: `/users/${mockId}`,
        method: 'put',
        data: mockData
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('角色管理API', () => {
    it('getRoles should call request with correct endpoint and params', async () => {
      const mockParams = { page: 1, pageSize: 10 };
      const mockResponse = { success: true, data: [] };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await getRoles(mockParams);

      expect(mockRequest).toHaveBeenCalledWith({
        url: '/roles',
        method: 'get',
        params: mockParams
      });
      expect(result).toEqual(mockResponse);
    });

    it('createRole should call request with correct endpoint and data', async () => {
      const mockData = { name: 'Test Role', code: 'TEST_ROLE' };
      const mockResponse = { success: true, data: { id: 1, ...mockData } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await createRole(mockData);

      expect(mockRequest).toHaveBeenCalledWith({
        url: '/roles',
        method: 'post',
        data: mockData
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('权限管理API', () => {
    it('getPermissionTree should call request with correct endpoint', async () => {
      const mockResponse = { success: true, data: [] };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await getPermissionTree();

      expect(mockRequest).toHaveBeenCalledWith({
        url: '/permissions',
        method: 'get'
      });
      expect(result).toEqual(mockResponse);
    });

    it('createPermission should call request with correct endpoint and data', async () => {
      const mockData = { code: 'TEST_PERM', name: 'Test Permission' };
      const mockResponse = { success: true, data: { id: 1, ...mockData } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await createPermission(mockData);

      expect(mockRequest).toHaveBeenCalledWith({
        url: '/permissions',
        method: 'post',
        data: mockData
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('系统日志API', () => {
    it('getSystemLogs should call request with correct endpoint and params', async () => {
      const mockParams = { page: 1, pageSize: 10, level: 'error' };
      const mockResponse = { success: true, data: { items: [], total: 0 } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await getSystemLogs(mockParams);

      expect(mockRequest).toHaveBeenCalledWith({
        url: '/system-logs',
        method: 'get',
        params: mockParams
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('消息模板API', () => {
    it('getMessageTemplates should call request with correct endpoint and params', async () => {
      const mockParams = { page: 1, pageSize: 10 };
      const mockResponse = { success: true, data: { items: [], total: 0 } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await getMessageTemplates(mockParams);

      expect(mockRequest).toHaveBeenCalledWith({
        url: '/system/message-templates',
        method: 'get',
        params: mockParams
      });
      expect(result).toEqual(mockResponse);
    });

    it('createMessageTemplate should call request with correct endpoint and data', async () => {
      const mockData = { code: 'TEST_TEMPLATE', name: 'Test Template' };
      const mockResponse = { success: true, data: { id: 1, ...mockData } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await createMessageTemplate(mockData);

      expect(mockRequest).toHaveBeenCalledWith({
        url: '/system/message-templates',
        method: 'post',
        data: mockData
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('AI模型管理API', () => {
    it('getAIModels should call request with correct endpoint and params', async () => {
      const mockParams = { page: 1, pageSize: 10 };
      const mockResponse = { success: true, data: { items: [], total: 0 } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await getAIModels(mockParams);

      expect(mockRequest).toHaveBeenCalledWith({
        url: '/system/ai-models',
        method: 'get',
        params: mockParams
      });
      expect(result).toEqual(mockResponse);
    });

    it('testAIModel should call request with correct endpoint and data', async () => {
      const mockId = '1';
      const mockData = { message: 'Test message' };
      const mockResponse = { success: true, data: { response: 'Test response' } };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await testAIModel(mockId, mockData);

      expect(mockRequest).toHaveBeenCalledWith({
        url: `/system/ai-models/${mockId}/test`,
        method: 'post',
        data: mockData
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('系统仪表盘API', () => {
    it('getSystemStats should call requestInstance.get with correct endpoint', async () => {
      const mockResponse = { success: true, data: { userCount: 100 } };
      mockGet.mockResolvedValue(mockResponse);

      const result = await getSystemStats();

      expect(mockGet).toHaveBeenCalledWith('/system/stats');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockRequest.mockRejectedValue(mockError);

      await expect(getSystemInfo()).rejects.toThrow('Network error');
    });

    it('should handle validation errors', async () => {
      const mockResponse = { success: false, message: 'Invalid data' };
      mockRequest.mockResolvedValue(mockResponse);

      const result = await createUser({} as any);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Parameter Validation', () => {
    it('should handle invalid IDs', async () => {
      const invalidIds = ['', null, undefined];
      
      for (const invalidId of invalidIds) {
        mockRequest.mockResolvedValue({ success: true, data: {} });
        await expect(getUserDetail(invalidId as string)).resolves.not.toThrow();
      }
    });

    it('should handle empty parameters', async () => {
      mockRequest.mockResolvedValue({ success: true, data: [] });
      
      const result = await getRoles();
      expect(result).toEqual({ success: true, data: [] });
    });
  });
});