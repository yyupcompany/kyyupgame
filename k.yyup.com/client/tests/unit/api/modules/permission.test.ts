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
  getPermissionList,
  getPermissionDetail,
  createPermission,
  updatePermission,
  deletePermission,
  batchDeletePermission,
  searchPermission,
  exportPermission,
  importPermission
} from '@/api/modules/permission';
import { get, post, put, del } from '@/utils/request';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';

// Mock the request module
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}));

describe('Permission API', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe('getPermissionList', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams = { page: 1, pageSize: 10 };
      const mockResponse = { success: true, data: [] };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await getPermissionList(mockParams);

      expect(get).toHaveBeenCalledWith('/api/permissions', mockParams);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPermissionDetail', () => {
    it('should call get with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = { success: true, data: { id: mockId, name: 'Test Permission' } };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await getPermissionDetail(mockId);

      expect(get).toHaveBeenCalledWith(`/api/permissions/${mockId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createPermission', () => {
    it('should call post with correct endpoint and data', async () => {
      const mockData = { name: 'New Permission', code: 'NEW_PERM' };
      const mockResponse = { success: true, data: { id: 1, ...mockData } };
      
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await createPermission(mockData);

      expect(post).toHaveBeenCalledWith('/api/permissions', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updatePermission', () => {
    it('should call put with correct endpoint, id and data', async () => {
      const mockId = '123';
      const mockData = { name: 'Updated Permission' };
      const mockResponse = { success: true, data: { id: mockId, ...mockData } };
      
      vi.mocked(put).mockResolvedValue(mockResponse);

      const result = await updatePermission(mockId, mockData);

      expect(put).toHaveBeenCalledWith(`/api/permissions/${mockId}`, mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deletePermission', () => {
    it('should call del with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = { success: true, message: 'Permission deleted' };
      
      vi.mocked(del).mockResolvedValue(mockResponse);

      const result = await deletePermission(mockId);

      expect(del).toHaveBeenCalledWith(`/api/permissions/${mockId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('batchDeletePermission', () => {
    it('should call post with correct endpoint and data', async () => {
      const mockIds = [1, 2, 3];
      const mockResponse = { success: true, message: 'Permissions deleted' };
      
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await batchDeletePermission(mockIds);

      expect(post).toHaveBeenCalledWith('/api/permissions/batch-delete', { ids: mockIds });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchPermission', () => {
    it('should call get with correct endpoint and keyword', async () => {
      const mockKeyword = 'test';
      const mockResponse = { success: true, data: [] };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await searchPermission(mockKeyword);

      expect(get).toHaveBeenCalledWith('/api/permissions/search', { params: { keyword: mockKeyword } });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('exportPermission', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams = { format: 'excel' };
      const mockResponse = { success: true, data: { url: '/export/permissions.xlsx' } };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await exportPermission(mockParams);

      expect(get).toHaveBeenCalledWith('/api/permissions/export', mockParams);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('importPermission', () => {
    it('should call post with correct endpoint and data', async () => {
      const mockData = { file: 'permissions.csv' };
      const mockResponse = { success: true, message: 'Permissions imported' };
      
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await importPermission(mockData);

      expect(post).toHaveBeenCalledWith('/api/permissions/import', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      vi.mocked(get).mockRejectedValue(mockError);

      await expect(getPermissionList()).rejects.toThrow('Network error');
    });

    it('should handle validation errors', async () => {
      const mockResponse = { success: false, message: 'Invalid permission data' };
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await createPermission({} as any);
      expect(result).toEqual(mockResponse);
    });
  });
});