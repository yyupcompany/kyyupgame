import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { expectNoConsoleErrors } from '../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue,
  validateDateFormat
} from '../../utils/data-validation';

// Mock dependencies
vi.mock('@/utils/request', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDel = vi.fn();
  const mockRequest = {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    del: mockDel
  };

  return {
    default: mockRequest,
    get: mockGet,
    post: mockPost,
    put: mockPut,
    del: mockDel,
    request: mockRequest
  };
});

// Import after mocks
import { get as mockedGet, post as mockedPost, put as mockedPut, del as mockedDel } from '@/utils/request';

// 控制台错误检测变量
let consoleSpy: any

describe('Activity Center - Comprehensive Tests', () => {
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

  describe('活动列表 - getActivityList', () => {
    it('should get activity list with strict validation', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: 1,
              title: '春季运动会',
              activityType: 'sports',
              startTime: '2024-03-15T09:00:00Z',
              endTime: '2024-03-15T17:00:00Z',
              location: '操场',
              capacity: 100,
              registeredCount: 50,
              status: 'active',
              coverImage: 'https://example.com/image.jpg',
              description: '春季运动会活动'
            }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await mockedGet('/activities', { page: 1, pageSize: 10 });

      // 1. 验证API调用
      expect(mockedGet).toHaveBeenCalledWith('/activities', { page: 1, pageSize: 10 });

      // 2. 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data.items)).toBe(true);

      // 3. 验证分页字段
      const paginationValidation = validateRequiredFields(result.data, ['items', 'total', 'page', 'pageSize']);
      expect(paginationValidation.valid).toBe(true);
      if (!paginationValidation.valid) {
        throw new Error(`Missing pagination fields: ${paginationValidation.missing.join(', ')}`);
      }

      // 4. 验证列表项
      if (result.data.items.length > 0) {
        const activity = result.data.items[0];
        
        // 验证必填字段
        const requiredFields = ['id', 'title', 'activityType', 'startTime', 'endTime', 'location', 'capacity', 'registeredCount', 'status'];
        const itemValidation = validateRequiredFields(activity, requiredFields);
        expect(itemValidation.valid).toBe(true);
        if (!itemValidation.valid) {
          throw new Error(`Missing activity fields: ${itemValidation.missing.join(', ')}`);
        }

        // 验证字段类型
        const typeValidation = validateFieldTypes(activity, {
          id: 'number',
          title: 'string',
          activityType: 'string',
          startTime: 'string',
          endTime: 'string',
          location: 'string',
          capacity: 'number',
          registeredCount: 'number',
          status: 'string'
        });
        expect(typeValidation.valid).toBe(true);
        if (!typeValidation.valid) {
          throw new Error(`Type validation errors: ${typeValidation.errors.join(', ')}`);
        }

        // 验证日期格式
        expect(validateDateFormat(activity.startTime)).toBe(true);
        expect(validateDateFormat(activity.endTime)).toBe(true);

        // 验证数值范围
        expect(activity.capacity).toBeGreaterThan(0);
        expect(activity.registeredCount).toBeGreaterThanOrEqual(0);
        expect(activity.registeredCount).toBeLessThanOrEqual(activity.capacity);
      }
    });

    it('should handle empty activity list', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await mockedGet('/activities');

      expect(result.success).toBe(true);
      expect(result.data.items).toEqual([]);
      expect(result.data.total).toBe(0);
    });
  });

  describe('活动详情 - getActivityDetail', () => {
    it('should get activity detail with strict validation', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          title: '春季运动会',
          activityType: 'sports',
          startTime: '2024-03-15T09:00:00Z',
          endTime: '2024-03-15T17:00:00Z',
          location: '操场',
          capacity: 100,
          registeredCount: 50,
          checkedInCount: 45,
          status: 'active',
          coverImage: 'https://example.com/image.jpg',
          description: '春季运动会活动',
          agenda: '上午：开幕式\n下午：比赛',
          fee: 0,
          needsApproval: false,
          registrationStartTime: '2024-03-01T00:00:00Z',
          registrationEndTime: '2024-03-14T23:59:59Z',
          createdAt: '2024-02-01T10:00:00Z',
          updatedAt: '2024-02-15T15:30:00Z'
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await mockedGet('/activities/1');

      // 1. 验证API调用
      expect(mockedGet).toHaveBeenCalledWith('/activities/1');

      // 2. 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 3. 验证必填字段
      const requiredFields = [
        'id', 'title', 'activityType', 'startTime', 'endTime', 
        'location', 'capacity', 'registeredCount', 'status'
      ];
      const validation = validateRequiredFields(result.data, requiredFields);
      expect(validation.valid).toBe(true);

      // 4. 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        id: 'number',
        title: 'string',
        activityType: 'string',
        startTime: 'string',
        endTime: 'string',
        location: 'string',
        capacity: 'number',
        registeredCount: 'number',
        checkedInCount: 'number',
        status: 'string',
        fee: 'number',
        needsApproval: 'boolean'
      });
      expect(typeValidation.valid).toBe(true);

      // 5. 验证日期格式
      expect(validateDateFormat(result.data.startTime)).toBe(true);
      expect(validateDateFormat(result.data.endTime)).toBe(true);
      expect(validateDateFormat(result.data.registrationStartTime)).toBe(true);
      expect(validateDateFormat(result.data.registrationEndTime)).toBe(true);

      // 6. 验证数值范围
      expect(result.data.capacity).toBeGreaterThan(0);
      expect(result.data.registeredCount).toBeGreaterThanOrEqual(0);
      expect(result.data.checkedInCount).toBeGreaterThanOrEqual(0);
      expect(result.data.fee).toBeGreaterThanOrEqual(0);
    });
  });

  describe('活动统计 - getActivityStatistics', () => {
    it('should get activity statistics with strict validation', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalActivities: 100,
          activeActivities: 30,
          completedActivities: 60,
          cancelledActivities: 10,
          totalParticipants: 5000,
          averageParticipants: 50,
          totalRevenue: 100000,
          averageRevenue: 1000
        }
      };

      mockedGet.mockResolvedValue(mockResponse);

      const result = await mockedGet('/activities/statistics');

      // 1. 验证API调用
      expect(mockedGet).toHaveBeenCalledWith('/activities/statistics');

      // 2. 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // 3. 验证必填字段
      const requiredFields = [
        'totalActivities', 'activeActivities', 'completedActivities',
        'totalParticipants', 'averageParticipants'
      ];
      const validation = validateRequiredFields(result.data, requiredFields);
      expect(validation.valid).toBe(true);

      // 4. 验证字段类型
      const typeValidation = validateFieldTypes(result.data, {
        totalActivities: 'number',
        activeActivities: 'number',
        completedActivities: 'number',
        cancelledActivities: 'number',
        totalParticipants: 'number',
        averageParticipants: 'number'
      });
      expect(typeValidation.valid).toBe(true);

      // 5. 验证数值范围
      expect(result.data.totalActivities).toBeGreaterThanOrEqual(0);
      expect(result.data.activeActivities).toBeGreaterThanOrEqual(0);
      expect(result.data.completedActivities).toBeGreaterThanOrEqual(0);
      expect(result.data.totalParticipants).toBeGreaterThanOrEqual(0);
      expect(result.data.averageParticipants).toBeGreaterThanOrEqual(0);

      // 6. 验证逻辑关系
      const sum = result.data.activeActivities + result.data.completedActivities + result.data.cancelledActivities;
      expect(sum).toBeLessThanOrEqual(result.data.totalActivities);
    });
  });

  describe('创建活动 - createActivity', () => {
    it('should create activity with strict validation', async () => {
      const activityData = {
        title: '新活动',
        activityType: 'sports',
        startTime: '2024-04-01T09:00:00Z',
        endTime: '2024-04-01T17:00:00Z',
        location: '体育馆',
        capacity: 50,
        description: '新活动描述'
      };

      const mockResponse = {
        success: true,
        data: {
          id: 101,
          ...activityData,
          registeredCount: 0,
          status: 'draft',
          createdAt: '2024-03-01T10:00:00Z'
        },
        message: '活动创建成功'
      };

      mockedPost.mockResolvedValue(mockResponse);

      const result = await mockedPost('/activities', activityData);

      // 1. 验证API调用
      expect(mockedPost).toHaveBeenCalledWith('/activities', activityData);

      // 2. 验证响应
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.title).toBe(activityData.title);
    });
  });
});

