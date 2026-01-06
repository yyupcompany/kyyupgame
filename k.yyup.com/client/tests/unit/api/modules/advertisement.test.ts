import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import * as advertisementApi from '@/api/modules/advertisement';
import { get, post, put, del } from '@/utils/request';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue
} from '../../../utils/data-validation';

// Mock the request module
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}));

vi.mock('@/api/endpoints', () => ({
  API_PREFIX: '/api/v1'
}));

const mockedGet = vi.mocked(get);
const mockedPost = vi.mocked(post);
const mockedPut = vi.mocked(put);
const mockedDel = vi.mocked(del);

// 控制台错误检测变量
let consoleSpy: any

describe('Advertisement API', () => {
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

  describe('getAdvertisements', () => {
    it('should get advertisements with params', async () => {
      const mockParams = {
        page: 1,
        pageSize: 10,
        type: 'banner',
        status: 'active'
      };
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: '1',
              title: 'Test Ad',
              type: 'banner',
              status: 'active',
              clickCount: 100,
              impressionCount: 1000
            }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await advertisementApi.advertisementApi.getAdvertisements(mockParams);

      // 验证API调用
      expect(mockedGet).toHaveBeenCalledWith('/api/v1/advertisements', { params: mockParams });

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data.items)).toBe(true);

      // 验证分页字段
      const paginationValidation = validateRequiredFields(result.data, ['items', 'total', 'page', 'pageSize']);
      expect(paginationValidation.valid).toBe(true);

      // 验证列表项
      if (result.data.items.length > 0) {
        const itemValidation = validateRequiredFields(result.data.items[0], ['id', 'title', 'type', 'status']);
        expect(itemValidation.valid).toBe(true);

        const itemTypeValidation = validateFieldTypes(result.data.items[0], {
          id: 'string',
          title: 'string',
          type: 'string',
          status: 'string',
          clickCount: 'number',
          impressionCount: 'number'
        });
        expect(itemTypeValidation.valid).toBe(true);
      }
    });

    it('should get advertisements without params', async () => {
      const mockResponse = { success: true, data: { items: [], total: 0 } };
      mockedGet.mockResolvedValue(mockResponse);

      await advertisementApi.advertisementApi.getAdvertisements();

      expect(mockedGet).toHaveBeenCalledWith('/api/v1/advertisements', { params: undefined });
    });
  });

  describe('getAdvertisement', () => {
    it('should get advertisement by id', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          title: 'Test Ad',
          type: 'banner',
          status: 'active',
          position: 'home_top',
          clickCount: 100,
          impressionCount: 1000
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await advertisementApi.advertisementApi.getAdvertisement('1');

      // 验证API调用
      expect(mockedGet).toHaveBeenCalledWith('/api/v1/advertisements/1');

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 验证必填字段
      const validation = validateRequiredFields(result.data, ['id', 'title', 'type', 'status']);
      expect(validation.valid).toBe(true);

      // 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        id: 'string',
        title: 'string',
        type: 'string',
        status: 'string',
        clickCount: 'number',
        impressionCount: 'number'
      });
      expect(typeValidation.valid).toBe(true);
    });
  });

  describe('createAdvertisement', () => {
    it('should create advertisement', async () => {
      const mockData = {
        title: 'New Advertisement',
        type: 'banner',
        position: 'home_top',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        priority: 1
      };
      const mockResponse = {
        success: true,
        data: { id: '1', ...mockData }
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await advertisementApi.advertisementApi.createAdvertisement(mockData);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/advertisements', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateAdvertisement', () => {
    it('should update advertisement', async () => {
      const mockData = { title: 'Updated Advertisement' };
      const mockResponse = {
        success: true,
        data: { id: '1', ...mockData }
      };

      mockedPut.mockResolvedValue(mockResponse);

      const result = await advertisementApi.advertisementApi.updateAdvertisement('1', mockData);

      expect(mockedPut).toHaveBeenCalledWith('/api/v1/advertisements/1', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteAdvertisement', () => {
    it('should delete advertisement', async () => {
      const mockResponse = { success: true, data: null };

      mockedDel.mockResolvedValue(mockResponse);

      const result = await advertisementApi.advertisementApi.deleteAdvertisement('1');

      expect(mockedDel).toHaveBeenCalledWith('/api/v1/advertisements/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('toggleAdvertisementStatus', () => {
    it('should toggle advertisement status', async () => {
      const mockResponse = {
        success: true,
        data: { id: '1', status: 'paused' }
      };

      mockedPut.mockResolvedValue(mockResponse);

      const result = await advertisementApi.advertisementApi.toggleAdvertisementStatus('1', 'paused');

      expect(mockedPut).toHaveBeenCalledWith('/api/v1/advertisements/1/status', { status: 'paused' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getActiveAdvertisementsByPosition', () => {
    it('should get active advertisements by position', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: '1', title: 'Active Ad', position: 'home_top', status: 'active' }
        ]
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await advertisementApi.advertisementApi.getActiveAdvertisementsByPosition('home_top');

      expect(mockedGet).toHaveBeenCalledWith('/api/v1/advertisements/active', { params: { position: 'home_top' } });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('recordClick', () => {
    it('should record advertisement click', async () => {
      const mockMetadata = { userAgent: 'Chrome', timestamp: '2024-01-01T10:00:00' };
      const mockResponse = { success: true, data: null };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await advertisementApi.advertisementApi.recordClick('1', mockMetadata);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/advertisements/1/click', { metadata: mockMetadata });
      expect(result).toEqual(mockResponse);
    });

    it('should record click without metadata', async () => {
      const mockResponse = { success: true, data: null };
      mockedPost.mockResolvedValue(mockResponse);

      await advertisementApi.advertisementApi.recordClick('1');

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/advertisements/1/click', { metadata: undefined });
    });
  });

  describe('recordImpression', () => {
    it('should record advertisement impression', async () => {
      const mockMetadata = { userAgent: 'Chrome', timestamp: '2024-01-01T10:00:00' };
      const mockResponse = { success: true, data: null };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await advertisementApi.advertisementApi.recordImpression('1', mockMetadata);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/advertisements/1/impression', { metadata: mockMetadata });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAdvertisementStats', () => {
    it('should get advertisement statistics', async () => {
      const mockParams = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        position: 'home_top'
      };
      const mockResponse = {
        success: true,
        data: {
          totalAds: 10,
          activeAds: 5,
          totalClicks: 1000,
          totalImpressions: 10000,
          clickThroughRate: 10.0,
          topPerformingAds: [
            { id: '1', title: 'Top Ad', clicks: 500, impressions: 2000, ctr: 25.0 }
          ],
          performanceByPosition: {
            home_top: { clicks: 600, impressions: 5000, ctr: 12.0 }
          }
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await advertisementApi.advertisementApi.getAdvertisementStats(mockParams);

      expect(mockedGet).toHaveBeenCalledWith('/api/v1/advertisements/stats', { params: mockParams });
      expect(result).toEqual(mockResponse);
    });

    it('should get advertisement statistics without params', async () => {
      const mockResponse = { success: true, data: { totalAds: 0 } };
      mockedGet.mockResolvedValue(mockResponse);

      await advertisementApi.advertisementApi.getAdvertisementStats();

      expect(mockedGet).toHaveBeenCalledWith('/api/v1/advertisements/stats', { params: undefined });
    });
  });

  describe('batchUpdateAdvertisements', () => {
    it('should batch update advertisements', async () => {
      const mockData = {
        ids: ['1', '2', '3'],
        action: 'activate'
      };
      const mockResponse = { success: true, data: null };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await advertisementApi.advertisementApi.batchUpdateAdvertisements(mockData);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/advertisements/batch', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Compatibility Exports', () => {
    it('should export compatibility functions', () => {
      expect(advertisementApi.getAdvertisements).toBe(advertisementApi.advertisementApi.getAdvertisements);
      expect(advertisementApi.getAdvertisement).toBe(advertisementApi.advertisementApi.getAdvertisement);
      expect(advertisementApi.createAdvertisement).toBe(advertisementApi.advertisementApi.createAdvertisement);
      expect(advertisementApi.updateAdvertisement).toBe(advertisementApi.advertisementApi.updateAdvertisement);
      expect(advertisementApi.deleteAdvertisement).toBe(advertisementApi.advertisementApi.deleteAdvertisement);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockedGet.mockRejectedValue(mockError);

      await expect(advertisementApi.advertisementApi.getAdvertisements())
        .rejects.toThrow('Network error');
    });

    it('should handle 404 errors', async () => {
      const mockError = new Error('Advertisement not found');
      mockedGet.mockRejectedValue(mockError);

      await expect(advertisementApi.advertisementApi.getAdvertisement('999'))
        .rejects.toThrow('Advertisement not found');
    });
  });
});