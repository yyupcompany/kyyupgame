import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import parentApi, {
  transformParentData,
  transformFollowUpRecord,
  ParentStatus,
  type Parent,
  type ParentData,
  type FollowUpRecord
} from '@/api/modules/parent';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock the request module and dependencies
vi.mock('@/utils/request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));
vi.mock('@/utils/dataTransform', () => ({
  transformListResponse: vi.fn((response, transformFn) => {
    // 如果response.data是对象且有items属性，转换items数组
    if (response.data && typeof response.data === 'object' && 'items' in response.data) {
      return {
        ...response,
        data: {
          ...response.data,
          items: response.data.items.map((item: any) => transformFn(item))
        }
      };
    }
    // 否则直接返回response
    return response;
  }),
  transformParentFormData: vi.fn((data) => data),
  transformParentFollowUpData: vi.fn((data) => data),
  transformParentFollowUpFormData: vi.fn((data) => data)
}));

import { request } from '@/utils/request';
const mockRequest = request as any;

// 控制台错误检测变量
let consoleSpy: any

describe('Parent API', () => {
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

  describe('getParentList', () => {
    it('should call request.get with correct endpoint and params', async () => {
      const mockParams = {
        page: 1,
        pageSize: 10,
        keyword: 'test',
        status: 'active'
      };
      const mockResponse = {
        success: true,
        data: {
          items: [{
            id: 1,
            name: 'Test Parent',
            phone: '1234567890',
            email: 'parent@example.com',
            status: ParentStatus.ACTIVE
          }],
          total: 1,
          page: 1,
          pageSize: 10
        }
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await parentApi.getParentList(mockParams);

      // 验证API调用
      expect(mockRequest.get).toHaveBeenCalledWith('/parents', { params: mockParams });

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data.items)).toBe(true);

      // 验证分页字段
      const paginationValidation = validateRequiredFields(result.data, ['items', 'total']);
      expect(paginationValidation.valid).toBe(true);

      // 验证列表项
      if (result.data.items.length > 0) {
        const itemValidation = validateRequiredFields(result.data.items[0], ['id', 'name', 'phone']);
        expect(itemValidation.valid).toBe(true);

        const itemTypeValidation = validateFieldTypes(result.data.items[0], {
          id: 'number',
          name: 'string',
          phone: 'string'
        });
        expect(itemTypeValidation.valid).toBe(true);
      }
    });

    it('should handle empty params', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0
        }
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await parentApi.getParentList();

      expect(mockRequest.get).toHaveBeenCalledWith('/parents', { params: undefined });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getParentById', () => {
    it('should call request.get with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = {
        success: true,
        data: {
          id: mockId,
          name: 'Test Parent',
          phone: '1234567890'
        }
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await parentApi.getParentById(mockId);

      expect(mockRequest.get).toHaveBeenCalledWith(`/parents/${mockId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createParent', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = {
        name: 'New Parent',
        phone: '1234567890',
        email: 'parent@example.com',
        status: ParentStatus.POTENTIAL
      };
      const mockResponse = {
        success: true,
        data: {
          id: 123,
          ...mockData
        }
      };

      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await parentApi.createParent(mockData);

      expect(mockRequest.post).toHaveBeenCalledWith('/parents', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateParent', () => {
    it('should call request.put with correct endpoint, id and data', async () => {
      const mockId = '123';
      const mockData = {
        name: 'Updated Parent',
        email: 'updated@example.com'
      };
      const mockResponse = {
        success: true,
        data: {
          id: mockId,
          ...mockData
        }
      };

      mockRequest.put.mockResolvedValue(mockResponse);

      const result = await parentApi.updateParent(mockId, mockData);

      expect(mockRequest.put).toHaveBeenCalledWith(`/parents/${mockId}`, mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteParent', () => {
    it('should call request.delete with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = {
        success: true,
        data: {
          success: true
        }
      };
      
      mockRequest.delete.mockResolvedValue(mockResponse);

      const result = await parentApi.deleteParent(mockId);

      expect(mockRequest.delete).toHaveBeenCalledWith(`/parents/${mockId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getParentChildren', () => {
    it('should call request.get with correct endpoint and id', async () => {
      const mockId = '123';
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            name: 'Child One',
            age: 5
          }
        ]
      };

      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await parentApi.getParentChildren(mockId);

      expect(mockRequest.get).toHaveBeenCalledWith(`/parents/${mockId}/children`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFollowUpList', () => {
    it('should call request.get with correct endpoint and params', async () => {
      const mockParentId = '123';
      const mockParams = {
        page: 1,
        pageSize: 10
      };
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0
        }
      };
      
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await parentApi.getFollowUpList(mockParentId, mockParams);

      expect(mockRequest.get).toHaveBeenCalledWith(`/parents/${mockParentId}/followups`, { params: mockParams });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createFollowUp', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockParentId = '123';
      const mockData = {
        title: 'Follow Up Call',
        content: 'Discussed enrollment options',
        type: 'phone'
      };
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          ...mockData
        }
      };
      
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await parentApi.createFollowUp(mockParentId, mockData);

      expect(mockRequest.post).toHaveBeenCalledWith(`/parents/${mockParentId}/followups`, mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Data Transformation Functions', () => {
    describe('transformParentData', () => {
      it('should transform backend data to frontend format', () => {
        const backendData: any = {
          id: 1,
          name: 'Backend Parent',
          phone: '1234567890',
          email: 'backend@example.com',
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z'
        };

        const result = transformParentData(backendData);

        // 验证转换后的数据结构
        expect(result.id).toBe(1);
        expect(result.name).toBe('Backend Parent'); // 使用data.name
        expect(result.phone).toBe('1234567890'); // 使用data.phone
        expect(result.email).toBe('backend@example.com'); // 使用data.email
        expect(result.status).toBe('active');
        expect(result.registerDate).toBe('2024-01-01T00:00:00Z');
        expect(result.source).toBe('未知');
        expect(Array.isArray(result.children)).toBe(true);
        expect(Array.isArray(result.followUpRecords)).toBe(true);
        expect(Array.isArray(result.activities)).toBe(true);
      });

      it('should use user data when parent data is missing', () => {
        const backendData: any = {
          id: 1,
          user: {
            realName: 'Real Parent Name',
            username: 'parentuser',
            phone: '9876543210',
            email: 'parent@example.com'
          },
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z'
        };

        const result = transformParentData(backendData);

        // 当parent数据缺失时，应该从user对象获取
        expect(result.name).toBe('Real Parent Name'); // 从user.realName获取
        expect(result.phone).toBe('9876543210'); // 从user.phone获取
        expect(result.email).toBe('parent@example.com'); // 从user.email获取
      });

      it('should handle missing user data', () => {
        const backendData: ParentData = {
          id: 1,
          name: 'Parent',
          phone: '1234567890'
        };

        const result = transformParentData(backendData);

        expect(result.name).toBe('Parent');
        expect(result.phone).toBe('1234567890');
      });
    });

    describe('transformFollowUpRecord', () => {
      it('should transform follow up record data', () => {
        const recordData = {
          id: 1,
          title: 'Test Follow Up',
          content: 'Test content',
          followupDate: '2024-01-01T10:00:00Z',
          followupType: 'phone',
          creatorName: 'Test Creator'
        };

        const result = transformFollowUpRecord(recordData);

        expect(result).toEqual({
          id: 1,
          title: 'Test Follow Up',
          content: 'Test content',
          time: '2024-01-01T10:00:00Z',
          type: 'phone',
          creator: 'Test Creator'
        });
      });

      it('should generate title from content if title is missing', () => {
        const recordData = {
          id: 1,
          content: 'This is a long follow up content that should be truncated to 20 characters',
          followupDate: '2024-01-01T10:00:00Z',
          followupType: 'email'
        };

        const result = transformFollowUpRecord(recordData);

        // 应该从content截取前20个字符作为title
        expect(result.title).toBe('This is a long follo');
      });

      it('should use default title when both title and content are missing', () => {
        const recordData = {
          id: 1,
          followupDate: '2024-01-01T10:00:00Z',
          followupType: 'email'
        };

        const result = transformFollowUpRecord(recordData);

        // 当title和content都没有时，使用默认值'跟进记录'
        expect(result.title).toBe('跟进记录');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockRequest.get.mockRejectedValue(mockError);

      await expect(parentApi.getParentList()).rejects.toThrow('Network error');
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid parent data',
        data: null
      };
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await parentApi.createParent({} as any);
      expect(result).toEqual(mockResponse);
    });

    it('should handle not found errors', async () => {
      const mockResponse = {
        success: false,
        message: 'Parent not found',
        data: null
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      const result = await parentApi.getParentById('nonexistent');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Parameter Validation', () => {
    it('should handle invalid parent IDs', async () => {
      const invalidIds = ['', null, undefined];
      
      for (const invalidId of invalidIds) {
        mockRequest.get.mockResolvedValue({});
        await expect(parentApi.getParentById(invalidId as string)).resolves.not.toThrow();
      }
    });

    it('should handle empty follow up data', async () => {
      const mockParentId = '123';
      const emptyData = {};
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          ...emptyData
        }
      };
      
      mockRequest.post.mockResolvedValue(mockResponse);

      const result = await parentApi.createFollowUp(mockParentId, emptyData);
      expect(result).toEqual(mockResponse);
    });
  });
});