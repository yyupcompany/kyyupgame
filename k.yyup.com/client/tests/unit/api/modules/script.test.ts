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
import ScriptAPI, {
  ScriptType,
  ScriptStatus,
  type Script,
  type ScriptCategory,
  type ScriptQuery,
  type CategoryQuery,
  type CreateScriptData,
  type UpdateScriptData
} from '@/api/modules/script';
import request from '@/utils/request';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';

// Mock the request module
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

const mockRequest = request as any;

describe('Script API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Script Management', () => {
    describe('getScripts', () => {
      it('should call request.get with correct endpoint and params', async () => {
        const mockParams: ScriptQuery = {
          page: 1,
          limit: 10,
          type: ScriptType.ENROLLMENT,
          status: ScriptStatus.ACTIVE,
          keyword: 'test'
        };
        const mockResponse = {
          data: {
            success: true,
            data: {
              scripts: [],
              pagination: {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
              }
            }
          }
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await ScriptAPI.getScripts(mockParams);

        expect(mockRequest.get).toHaveBeenCalledWith('/scripts', { params: mockParams });
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('getScriptById', () => {
      it('should call request.get with correct endpoint and id', async () => {
        const mockId = 1;
        const mockResponse = {
          data: {
            success: true,
            data: {
              id: mockId,
              title: 'Test Script',
              type: ScriptType.ENROLLMENT,
              status: ScriptStatus.ACTIVE
            }
          }
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await ScriptAPI.getScriptById(mockId);

        expect(mockRequest.get).toHaveBeenCalledWith(`/scripts/${mockId}`);
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('createScript', () => {
      it('should call request.post with correct endpoint and data', async () => {
        const mockData: CreateScriptData = {
          title: 'New Script',
          content: 'Script content',
          categoryId: 1,
          type: ScriptType.ENROLLMENT,
          tags: ['tag1', 'tag2'],
          keywords: ['keyword1']
        };
        const mockResponse = {
          data: {
            success: true,
            data: {
              id: 1,
              ...mockData
            }
          }
        };
        
        mockRequest.post.mockResolvedValue(mockResponse);

        const result = await ScriptAPI.createScript(mockData);

        expect(mockRequest.post).toHaveBeenCalledWith('/scripts', mockData);
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('updateScript', () => {
      it('should call request.put with correct endpoint, id and data', async () => {
        const mockId = 1;
        const mockData: UpdateScriptData = {
          title: 'Updated Script',
          content: 'Updated content'
        };
        const mockResponse = {
          data: {
            success: true,
            data: {
              id: mockId,
              ...mockData
            }
          }
        };
        
        mockRequest.put.mockResolvedValue(mockResponse);

        const result = await ScriptAPI.updateScript(mockId, mockData);

        expect(mockRequest.put).toHaveBeenCalledWith(`/scripts/${mockId}`, mockData);
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('deleteScript', () => {
      it('should call request.delete with correct endpoint and id', async () => {
        const mockId = 1;
        const mockResponse = {
          data: {
            success: true,
            data: null
          }
        };
        
        mockRequest.delete.mockResolvedValue(mockResponse);

        const result = await ScriptAPI.deleteScript(mockId);

        expect(mockRequest.delete).toHaveBeenCalledWith(`/scripts/${mockId}`);
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('useScript', () => {
      it('should call request.post with correct endpoint and data', async () => {
        const mockId = 1;
        const mockData = {
          usageContext: 'Test usage',
          effectiveRating: 5,
          feedback: 'Good script'
        };
        const mockResponse = {
          data: {
            success: true,
            data: null
          }
        };
        
        mockRequest.post.mockResolvedValue(mockResponse);

        const result = await ScriptAPI.useScript(mockId, mockData);

        expect(mockRequest.post).toHaveBeenCalledWith(`/scripts/${mockId}/use`, mockData);
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('getScriptStats', () => {
      it('should call request.get with correct endpoint and params', async () => {
        const mockTimeRange = 30;
        const mockResponse = {
          data: {
            success: true,
            data: {
              totalScripts: 10,
              totalUsages: 100,
              scriptsByType: [],
              popularScripts: [],
              usageTrend: []
            }
          }
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await ScriptAPI.getScriptStats(mockTimeRange);

        expect(mockRequest.get).toHaveBeenCalledWith('/scripts/stats', {
          params: { timeRange: mockTimeRange }
        });
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  describe('Script Category Management', () => {
    describe('getCategories', () => {
      it('should call request.get with correct endpoint and params', async () => {
        const mockParams: CategoryQuery = {
          type: ScriptType.ENROLLMENT,
          status: ScriptStatus.ACTIVE,
          includeCount: true
        };
        const mockResponse = {
          data: {
            success: true,
            data: []
          }
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await ScriptAPI.getCategories(mockParams);

        expect(mockRequest.get).toHaveBeenCalledWith('/script-categories', { params: mockParams });
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('createCategory', () => {
      it('should call request.post with correct endpoint and data', async () => {
        const mockData = {
          name: 'New Category',
          description: 'Category description',
          type: ScriptType.ENROLLMENT,
          color: '#FF0000',
          icon: 'icon-test',
          sort: 1
        };
        const mockResponse = {
          data: {
            success: true,
            data: {
              id: 1,
              ...mockData
            }
          }
        };
        
        mockRequest.post.mockResolvedValue(mockResponse);

        const result = await ScriptAPI.createCategory(mockData);

        expect(mockRequest.post).toHaveBeenCalledWith('/script-categories', mockData);
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('updateCategory', () => {
      it('should call request.put with correct endpoint, id and data', async () => {
        const mockId = 1;
        const mockData = {
          name: 'Updated Category',
          description: 'Updated description'
        };
        const mockResponse = {
          data: {
            success: true,
            data: {
              id: mockId,
              ...mockData
            }
          }
        };
        
        mockRequest.put.mockResolvedValue(mockResponse);

        const result = await ScriptAPI.updateCategory(mockId, mockData);

        expect(mockRequest.put).toHaveBeenCalledWith(`/script-categories/${mockId}`, mockData);
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('deleteCategory', () => {
      it('should call request.delete with correct endpoint and id', async () => {
        const mockId = 1;
        const mockResponse = {
          data: {
            success: true,
            data: null
          }
        };
        
        mockRequest.delete.mockResolvedValue(mockResponse);

        const result = await ScriptAPI.deleteCategory(mockId);

        expect(mockRequest.delete).toHaveBeenCalledWith(`/script-categories/${mockId}`);
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('updateCategoriesSort', () => {
      it('should call request.put with correct endpoint and data', async () => {
        const mockCategories = [
          { id: 1, sort: 2 },
          { id: 2, sort: 1 }
        ];
        const mockResponse = {
          data: {
            success: true,
            data: null
          }
        };
        
        mockRequest.put.mockResolvedValue(mockResponse);

        const result = await ScriptAPI.updateCategoriesSort(mockCategories);

        expect(mockRequest.put).toHaveBeenCalledWith('/script-categories/sort', { categories: mockCategories });
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('getCategoryStats', () => {
      it('should call request.get with correct endpoint', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              totalCategories: 5,
              activeCategories: 4
            }
          }
        };
        
        mockRequest.get.mockResolvedValue(mockResponse);

        const result = await ScriptAPI.getCategoryStats();

        expect(mockRequest.get).toHaveBeenCalledWith('/script-categories/stats');
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('initDefaultCategories', () => {
      it('should call request.post with correct endpoint', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: []
          }
        };
        
        mockRequest.post.mockResolvedValue(mockResponse);

        const result = await ScriptAPI.initDefaultCategories();

        expect(mockRequest.post).toHaveBeenCalledWith('/script-categories/init-default');
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockRequest.get.mockRejectedValue(mockError);

      await expect(ScriptAPI.getScripts()).rejects.toThrow('Network error');
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Invalid script data',
          data: null
        }
      };
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await ScriptAPI.createScript({} as CreateScriptData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Convenience Exports', () => {
    it('should export all static methods', () => {
      expect(typeof ScriptAPI.getScripts).toBe('function');
      expect(typeof ScriptAPI.getScriptById).toBe('function');
      expect(typeof ScriptAPI.createScript).toBe('function');
      expect(typeof ScriptAPI.updateScript).toBe('function');
      expect(typeof ScriptAPI.deleteScript).toBe('function');
      expect(typeof ScriptAPI.useScript).toBe('function');
      expect(typeof ScriptAPI.getScriptStats).toBe('function');
      expect(typeof ScriptAPI.getCategories).toBe('function');
      expect(typeof ScriptAPI.getCategoryById).toBe('function');
      expect(typeof ScriptAPI.createCategory).toBe('function');
      expect(typeof ScriptAPI.updateCategory).toBe('function');
      expect(typeof ScriptAPI.deleteCategory).toBe('function');
      expect(typeof ScriptAPI.updateCategoriesSort).toBe('function');
      expect(typeof ScriptAPI.getCategoryStats).toBe('function');
      expect(typeof ScriptAPI.initDefaultCategories).toBe('function');
    });
  });
});