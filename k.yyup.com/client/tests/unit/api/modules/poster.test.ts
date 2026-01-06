import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock the request module
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}));

// Import after mocks
import posterApi, {
  transformPosterTemplate,
  type PosterTemplate,
  type PosterTemplateData,
  type PosterTemplateQueryParams
} from '@/api/modules/poster';
import { get, post, put, del } from '@/utils/request';

// 控制台错误检测变量
let consoleSpy: any

describe('Poster API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('getTemplates', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams: PosterTemplateQueryParams = {
        page: 1,
        pageSize: 10,
        category: 'education',
        keyword: 'test'
      };
      const mockResponse = {
        success: true,
        data: {
          items: [{
            id: 1,
            name: 'Test Template',
            category: 'education',
            createdAt: '2024-01-01T00:00:00Z'
          }],
          total: 1
        }
      };

      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await posterApi.getTemplates(mockParams);

      // 验证API调用
      expect(get).toHaveBeenCalled();
      const callArgs = vi.mocked(get).mock.calls[0];
      expect(callArgs[0]).toBe('/poster-templates');
      expect(callArgs[1]).toMatchObject({
        page: 1,
        pageSize: 10,
        category: 'education',
        keyword: 'test'
      });

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data.templates)).toBe(true);

      // 验证分页字段
      const validation = validateRequiredFields(result.data, ['templates', 'total']);
      expect(validation.valid).toBe(true);

      // 验证列表项
      if (result.data.templates.length > 0) {
        const itemValidation = validateRequiredFields(result.data.templates[0], ['id', 'name', 'category']);
        expect(itemValidation.valid).toBe(true);

        const itemTypeValidation = validateFieldTypes(result.data.templates[0], {
          id: 'number',
          name: 'string',
          category: 'string'
        });
        expect(itemTypeValidation.valid).toBe(true);
      }
    });

    it('should handle array response format', async () => {
      const mockArrayResponse = [
        {
          id: 1,
          name: 'Test Template',
          category: 'education',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];
      
      vi.mocked(get).mockResolvedValue({
        success: true,
        data: mockArrayResponse
      });

      const result = await posterApi.getTemplates();

      expect(result.data.templates.length).toBe(1);
      expect(result.data.total).toBe(1);
    });
  });

  describe('getTemplate', () => {
    it('should call get with correct endpoint and id', async () => {
      const mockId = 1;
      const mockResponse = {
        success: true,
        data: {
          id: mockId,
          name: 'Test Template',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await posterApi.getTemplate(mockId);

      expect(get).toHaveBeenCalledWith(`/poster-templates/${mockId}`);
      expect(result.data.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('createTemplate', () => {
    it('should call post with correct endpoint and data', async () => {
      const mockData = {
        name: 'New Template',
        category: 'education',
        thumbnail: '/thumb.jpg',
        previewImage: '/preview.jpg',
        width: 800,
        height: 600
      };
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          ...mockData,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      };
      
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await posterApi.createTemplate(mockData as any);

      expect(post).toHaveBeenCalledWith('/poster-templates', mockData);
      expect(result.data.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('updateTemplate', () => {
    it('should call put with correct endpoint, id and data', async () => {
      const mockId = 1;
      const mockData = {
        name: 'Updated Template'
      };
      const mockResponse = {
        success: true,
        data: {
          id: mockId,
          ...mockData,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      };
      
      vi.mocked(put).mockResolvedValue(mockResponse);

      const result = await posterApi.updateTemplate(mockId, mockData as any);

      expect(put).toHaveBeenCalledWith(`/poster-templates/${mockId}`, mockData);
      expect(result.data.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('deleteTemplate', () => {
    it('should call del with correct endpoint and id', async () => {
      const mockId = 1;
      const mockResponse = {
        success: true,
        data: { id: mockId }
      };
      
      vi.mocked(del).mockResolvedValue(mockResponse);

      const result = await posterApi.deleteTemplate(mockId);

      expect(del).toHaveBeenCalledWith(`/poster-templates/${mockId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCategories', () => {
    it('should call get with correct endpoint', async () => {
      const mockResponse = {
        success: true,
        data: ['education', 'marketing', 'events']
      };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await posterApi.getCategories();

      expect(get).toHaveBeenCalledWith('/poster-templates/categories');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('generatePoster', () => {
    it('should call post with correct endpoint and data', async () => {
      const mockData = {
        templateId: 1,
        customData: { title: 'Test Poster', content: 'Test Content' }
      };
      const mockResponse = {
        success: true,
        data: { url: '/generated/poster-123.jpg' }
      };
      
      vi.mocked(post).mockResolvedValue(mockResponse);

      const result = await posterApi.generatePoster(mockData);

      expect(post).toHaveBeenCalledWith('/poster-generation/generate', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUsageStats', () => {
    it('should call get with correct endpoint and params', async () => {
      const mockParams = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };
      const mockResponse = {
        success: true,
        data: {
          usageStats: [
            { date: '2024-01-01', count: 10 },
            { date: '2024-01-02', count: 15 }
          ]
        }
      };
      
      vi.mocked(get).mockResolvedValue(mockResponse);

      const result = await posterApi.getUsageStats(mockParams);

      expect(get).toHaveBeenCalledWith('/poster-templates/statistics', { params: mockParams });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('transformPosterTemplate', () => {
    it('should transform backend data to frontend format', () => {
      const backendData: PosterTemplateData = {
        id: 1,
        name: 'Test Template',
        category: 'education',
        thumbnail: '/thumb.jpg',
        previewImage: '/preview.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        usageCount: 10,
        width: 800,
        height: 600,
        description: 'Test description',
        marketingTools: null,
        groupBuySettings: null,
        pointsSettings: null,
        customSettings: null
      };

      const result = transformPosterTemplate(backendData);

      expect(result).toEqual({
        ...backendData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        marketingTools: []
      });
    });

    it('should handle existing marketing tools array', () => {
      const backendData: PosterTemplateData = {
        id: 1,
        name: 'Test Template',
        category: 'education',
        thumbnail: '/thumb.jpg',
        previewImage: '/preview.jpg',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        usageCount: 10,
        width: 800,
        height: 600,
        description: 'Test description',
        marketingTools: ['tool1', 'tool2'],
        groupBuySettings: null,
        pointsSettings: null,
        customSettings: null
      };

      const result = transformPosterTemplate(backendData);

      expect(result.marketingTools).toEqual(['tool1', 'tool2']);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Network error',
        data: null
      };
      vi.mocked(get).mockResolvedValue(mockErrorResponse);

      const result = await posterApi.getTemplates();
      expect(result.success).toBe(false);
    });

    it('should return default data on API failure', async () => {
      const mockError = new Error('API unavailable');
      vi.mocked(get).mockRejectedValue(mockError);

      const result = await posterApi.getTemplates();

      expect(result.success).toBe(false);
      expect(result.data.templates).toEqual([]);
      expect(result.data.total).toBe(0);
    });
  });
});