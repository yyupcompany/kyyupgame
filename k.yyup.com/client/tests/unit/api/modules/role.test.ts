import { 
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

describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getRoleList,
  getRoleDetail,
  createRole,
  updateRole,
  deleteRole,
  batchDeleteRole,
  searchRole,
  exportRole,
  importRole
} from '@/api/modules/role';
import { get, post, put, del } from '@/utils/request';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';

// Mock the request module
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}));

describe('Role API', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe('getRoleList', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams = { page: 1, pageSize: 10 };
      const mockResponse = { success: true, data: [] };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await getRoleList(mockParams);

      expect(get).toHaveBeenCalledWith('/api/roles', mockParams);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getRoleDetail', () => {
    it('should call get with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = { success: true, data: { id: mockId, name: 'Test Role' } };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await getRoleDetail(mockId);

      expect(get).toHaveBeenCalledWith(`/api/roles/${mockId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createRole', () => {
    it('should call post with correct endpoint and data', async () => {
      const mockData = { name: 'New Role', code: 'NEW_ROLE' };
      const mockResponse = { success: true, data: { id: 1, ...mockData } };
      
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await createRole(mockData);

      expect(post).toHaveBeenCalledWith('/api/roles', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateRole', () => {
    it('should call put with correct endpoint, id and data', async () => {
      const mockId = '123';
      const mockData = { name: 'Updated Role' };
      const mockResponse = { success: true, data: { id: mockId, ...mockData } };
      
      vi.mocked(put).mockResolvedValue(mockResponse);

      const result = await updateRole(mockId, mockData);

      expect(put).toHaveBeenCalledWith(`/api/roles/${mockId}`, mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteRole', () => {
    it('should call del with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = { success: true, message: 'Role deleted' };
      
      vi.mocked(del).mockResolvedValue(mockResponse);

      const result = await deleteRole(mockId);

      expect(del).toHaveBeenCalledWith(`/api/roles/${mockId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('batchDeleteRole', () => {
    it('should call post with correct endpoint and data', async () => {
      const mockIds = [1, 2, 3];
      const mockResponse = { success: true, message: 'Roles deleted' };
      
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await batchDeleteRole(mockIds);

      expect(post).toHaveBeenCalledWith('/api/roles/batch-delete', { ids: mockIds });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchRole', () => {
    it('should call get with correct endpoint and keyword', async () => {
      const mockKeyword = 'test';
      const mockResponse = { success: true, data: [] };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await searchRole(mockKeyword);

      expect(get).toHaveBeenCalledWith('/api/roles/search', { params: { keyword: mockKeyword } });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('exportRole', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams = { format: 'excel' };
      const mockResponse = { success: true, data: { url: '/export/roles.xlsx' } };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await exportRole(mockParams);

      expect(get).toHaveBeenCalledWith('/api/roles/export', mockParams);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('importRole', () => {
    it('should call post with correct endpoint and data', async () => {
      const mockData = { file: 'roles.csv' };
      const mockResponse = { success: true, message: 'Roles imported' };
      
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await importRole(mockData);

      expect(post).toHaveBeenCalledWith('/api/roles/import', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      vi.mocked(get).mockRejectedValue(mockError);

      await expect(getRoleList()).rejects.toThrow('Network error');
    });

    it('should handle validation errors', async () => {
      const mockResponse = { success: false, message: 'Invalid role data' };
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await createRole({} as any);
      expect(result).toEqual(mockResponse);
    });
  });
});