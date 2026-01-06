import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Joi
const mockJoi = {
  object: jest.fn().mockReturnThis(),
  string: jest.fn().mockReturnThis(),
  number: jest.fn().mockReturnThis(),
  boolean: jest.fn().mockReturnThis(),
  date: jest.fn().mockReturnThis(),
  array: jest.fn().mockReturnThis(),
  valid: jest.fn().mockReturnThis(),
  required: jest.fn().mockReturnThis(),
  optional: jest.fn().mockReturnThis(),
  min: jest.fn().mockReturnThis(),
  max: jest.fn().mockReturnThis(),
  email: jest.fn().mockReturnThis(),
  pattern: jest.fn().mockReturnThis(),
  items: jest.fn().mockReturnThis(),
  messages: jest.fn().mockReturnThis(),
  validate: jest.fn(),
  allow: jest.fn().mockReturnThis(),
  when: jest.fn().mockReturnThis(),
  alternatives: jest.fn().mockReturnThis(),
  custom: jest.fn().mockReturnThis(),
  greater: jest.fn().mockReturnThis(),
  iso: jest.fn().mockReturnThis()
};

// Mock imports
jest.unstable_mockModule('joi', () => mockJoi);


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

describe('Activity Validation', () => {
  let activityValidation: any;

  beforeAll(async () => {
    const imported = await import('../../../src/validations/activity.validation');
    activityValidation = imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的Joi行为
    mockJoi.validate.mockImplementation((data, schema) => {
      // 模拟验证成功
      return { error: null, value: data };
    });
  });

  describe('validateCreateActivity', () => {
    it('应该验证有效的活动创建数据', () => {
      const validData = {
        name: '春游活动',
        description: '到公园进行春游，让孩子们亲近自然',
        type: 'outdoor',
        date: '2024-05-01',
        startTime: '09:00',
        endTime: '16:00',
        location: '中山公园',
        address: '北京市东城区中山公园路1号',
        maxParticipants: 50,
        minAge: 3,
        maxAge: 6,
        cost: 50,
        requirements: ['穿运动鞋', '带水杯', '涂防晒霜'],
        ageGroups: ['3-4', '4-5', '5-6'],
        organizerId: 1,
        kindergartenId: 1
      };

      const result = activityValidation.validateCreateActivity(validData);

      expect(mockJoi.validate).toHaveBeenCalledWith(validData, expect.any(Object));
      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该拒绝缺少必填字段的数据', () => {
      const invalidData = {
        description: '活动描述',
        date: '2024-05-01'
        // 缺少name字段
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"name" is required',
              path: ['name'],
              type: 'any.required'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"name" is required');
    });

    it('应该验证活动名称长度', () => {
      const invalidData = {
        name: 'A', // 太短
        description: '活动描述',
        date: '2024-05-01'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"name" length must be at least 2 characters long',
              path: ['name'],
              type: 'string.min'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"name" length must be at least 2 characters long');
    });

    it('应该验证活动类型枚举值', () => {
      const invalidData = {
        name: '测试活动',
        description: '活动描述',
        type: 'invalid_type', // 无效类型
        date: '2024-05-01'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"type" must be one of [outdoor, indoor, cultural, sports, educational, social]',
              path: ['type'],
              type: 'any.only'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"type" must be one of [outdoor, indoor, cultural, sports, educational, social]');
    });

    it('应该验证日期格式', () => {
      const invalidData = {
        name: '测试活动',
        description: '活动描述',
        date: 'invalid-date'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"date" must be a valid ISO 8601 date',
              path: ['date'],
              type: 'date.format'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"date" must be a valid ISO 8601 date');
    });

    it('应该验证时间格式', () => {
      const invalidData = {
        name: '测试活动',
        description: '活动描述',
        date: '2024-05-01',
        startTime: '25:00', // 无效时间
        endTime: '16:00'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"startTime" must be in HH:MM format',
              path: ['startTime'],
              type: 'string.pattern.base'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"startTime" must be in HH:MM format');
    });

    it('应该验证参与人数范围', () => {
      const invalidData = {
        name: '测试活动',
        description: '活动描述',
        date: '2024-05-01',
        maxParticipants: 0 // 无效人数
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"maxParticipants" must be greater than or equal to 1',
              path: ['maxParticipants'],
              type: 'number.min'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"maxParticipants" must be greater than or equal to 1');
    });

    it('应该验证年龄范围', () => {
      const invalidData = {
        name: '测试活动',
        description: '活动描述',
        date: '2024-05-01',
        minAge: 8,
        maxAge: 5 // maxAge小于minAge
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"maxAge" must be greater than or equal to "minAge"',
              path: ['maxAge'],
              type: 'number.greater'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"maxAge" must be greater than or equal to "minAge"');
    });

    it('应该验证费用范围', () => {
      const invalidData = {
        name: '测试活动',
        description: '活动描述',
        date: '2024-05-01',
        cost: -10 // 负数费用
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"cost" must be greater than or equal to 0',
              path: ['cost'],
              type: 'number.min'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"cost" must be greater than or equal to 0');
    });

    it('应该验证要求数组', () => {
      const invalidData = {
        name: '测试活动',
        description: '活动描述',
        date: '2024-05-01',
        requirements: 'string instead of array' // 应该是数组
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"requirements" must be an array',
              path: ['requirements'],
              type: 'array.base'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"requirements" must be an array');
    });

    it('应该验证年龄组数组', () => {
      const invalidData = {
        name: '测试活动',
        description: '活动描述',
        date: '2024-05-01',
        ageGroups: ['invalid-age-group'] // 无效年龄组
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"ageGroups[0]" must be one of [3-4, 4-5, 5-6, 6-7]',
              path: ['ageGroups', 0],
              type: 'any.only'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"ageGroups[0]" must be one of [3-4, 4-5, 5-6, 6-7]');
    });
  });

  describe('validateUpdateActivity', () => {
    it('应该验证有效的活动更新数据', () => {
      const validData = {
        name: '春游活动（更新）',
        description: '更新后的活动描述',
        maxParticipants: 60,
        cost: 60
      };

      const result = activityValidation.validateUpdateActivity(validData);

      expect(mockJoi.validate).toHaveBeenCalledWith(validData, expect.any(Object));
      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该允许部分字段更新', () => {
      const validData = {
        cost: 80
      };

      const result = activityValidation.validateUpdateActivity(validData);

      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该拒绝更新不可变字段', () => {
      const invalidData = {
        id: 2 // ID不应该被更新
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"id" is not allowed',
              path: ['id'],
              type: 'object.unknown'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateUpdateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"id" is not allowed');
    });
  });

  describe('validateActivityRegistration', () => {
    it('应该验证有效的活动报名数据', () => {
      const validData = {
        studentId: 1,
        parentId: 1,
        notes: '孩子对户外活动很感兴趣',
        emergencyContact: {
          name: '张母',
          phone: '13800138001',
          relationship: 'mother'
        }
      };

      const result = activityValidation.validateActivityRegistration(validData);

      expect(mockJoi.validate).toHaveBeenCalledWith(validData, expect.any(Object));
      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该验证必填字段', () => {
      const invalidData = {
        parentId: 1
        // 缺少studentId
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"studentId" is required',
              path: ['studentId'],
              type: 'any.required'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateActivityRegistration(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"studentId" is required');
    });

    it('应该验证紧急联系人信息', () => {
      const invalidData = {
        studentId: 1,
        parentId: 1,
        emergencyContact: {
          name: '张母'
          // 缺少phone字段
        }
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"emergencyContact.phone" is required',
              path: ['emergencyContact', 'phone'],
              type: 'any.required'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateActivityRegistration(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"emergencyContact.phone" is required');
    });

    it('应该验证紧急联系人电话格式', () => {
      const invalidData = {
        studentId: 1,
        parentId: 1,
        emergencyContact: {
          name: '张母',
          phone: '123', // 无效电话格式
          relationship: 'mother'
        }
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"emergencyContact.phone" must match the required pattern',
              path: ['emergencyContact', 'phone'],
              type: 'string.pattern.base'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateActivityRegistration(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"emergencyContact.phone" must match the required pattern');
    });
  });

  describe('validateUpdateRegistrationStatus', () => {
    it('应该验证有效的报名状态更新数据', () => {
      const validData = {
        status: 'confirmed',
        notes: '已确认参加活动'
      };

      const result = activityValidation.validateUpdateRegistrationStatus(validData);

      expect(mockJoi.validate).toHaveBeenCalledWith(validData, expect.any(Object));
      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该验证状态枚举值', () => {
      const invalidData = {
        status: 'invalid_status'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"status" must be one of [pending, confirmed, cancelled, completed]',
              path: ['status'],
              type: 'any.only'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateUpdateRegistrationStatus(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"status" must be one of [pending, confirmed, cancelled, completed]');
    });

    it('应该在取消状态时要求原因', () => {
      const invalidData = {
        status: 'cancelled'
        // 缺少reason字段
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"reason" is required when status is cancelled',
              path: ['reason'],
              type: 'any.required'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateUpdateRegistrationStatus(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"reason" is required when status is cancelled');
    });
  });

  describe('validateActivityFeedback', () => {
    it('应该验证有效的活动反馈数据', () => {
      const validData = {
        rating: 5,
        comment: '活动组织得很好，孩子们玩得很开心',
        suggestions: '希望下次能增加更多互动游戏',
        wouldRecommend: true
      };

      const result = activityValidation.validateActivityFeedback(validData);

      expect(mockJoi.validate).toHaveBeenCalledWith(validData, expect.any(Object));
      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validData);
    });

    it('应该验证评分范围', () => {
      const invalidData = {
        rating: 6, // 超出范围
        comment: '测试评论'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"rating" must be less than or equal to 5',
              path: ['rating'],
              type: 'number.max'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateActivityFeedback(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"rating" must be less than or equal to 5');
    });

    it('应该验证评论长度', () => {
      const invalidData = {
        rating: 5,
        comment: 'A'.repeat(1001) // 超过最大长度
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"comment" length must be less than or equal to 1000 characters',
              path: ['comment'],
              type: 'string.max'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateActivityFeedback(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"comment" length must be less than or equal to 1000 characters');
    });
  });

  describe('validateActivityQuery', () => {
    it('应该验证有效的查询参数', () => {
      const validQuery = {
        page: 1,
        pageSize: 10,
        status: 'active',
        type: 'outdoor',
        startDate: '2024-05-01',
        endDate: '2024-05-31',
        search: '春游',
        sortBy: 'date',
        sortOrder: 'asc',
        kindergartenId: 1
      };

      const result = activityValidation.validateActivityQuery(validQuery);

      expect(mockJoi.validate).toHaveBeenCalledWith(validQuery, expect.any(Object));
      expect((result as any).error).toBeNull();
      expect((result as any).value).toEqual(validQuery);
    });

    it('应该验证分页参数范围', () => {
      const invalidQuery = {
        page: 0, // 无效页码
        pageSize: 101 // 超出最大限制
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"page" must be greater than or equal to 1',
              path: ['page'],
              type: 'number.min'
            }
          ]
        },
        value: invalidQuery
      });

      const result = activityValidation.validateActivityQuery(invalidQuery);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"page" must be greater than or equal to 1');
    });

    it('应该验证排序字段', () => {
      const invalidQuery = {
        sortBy: 'invalid_field'
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"sortBy" must be one of [name, date, type, status, createdAt, updatedAt]',
              path: ['sortBy'],
              type: 'any.only'
            }
          ]
        },
        value: invalidQuery
      });

      const result = activityValidation.validateActivityQuery(invalidQuery);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"sortBy" must be one of [name, date, type, status, createdAt, updatedAt]');
    });

    it('应该验证日期范围逻辑', () => {
      const invalidQuery = {
        startDate: '2024-05-31',
        endDate: '2024-05-01' // 结束日期早于开始日期
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"endDate" must be greater than or equal to "startDate"',
              path: ['endDate'],
              type: 'date.greater'
            }
          ]
        },
        value: invalidQuery
      });

      const result = activityValidation.validateActivityQuery(invalidQuery);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"endDate" must be greater than or equal to "startDate"');
    });
  });

  describe('validateActivityId', () => {
    it('应该验证有效的活动ID', () => {
      const validId = '123';

      const result = activityValidation.validateActivityId(validId);

      expect(mockJoi.validate).toHaveBeenCalledWith(validId, expect.any(Object));
      expect((result as any).error).toBeNull();
      expect((result as any).value).toBe(validId);
    });

    it('应该拒绝无效的活动ID', () => {
      const invalidId = 'abc';

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: '"value" must be a number',
              path: [],
              type: 'number.base'
            }
          ]
        },
        value: invalidId
      });

      const result = activityValidation.validateActivityId(invalidId);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('"value" must be a number');
    });
  });

  describe('自定义验证规则', () => {
    it('应该验证活动日期不能是过去', () => {
      const invalidData = {
        name: '测试活动',
        description: '活动描述',
        date: '2020-01-01' // 过去的日期
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: 'Activity date cannot be in the past',
              path: ['date'],
              type: 'custom.futureDate'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('Activity date cannot be in the past');
    });

    it('应该验证结束时间晚于开始时间', () => {
      const invalidData = {
        name: '测试活动',
        description: '活动描述',
        date: '2024-05-01',
        startTime: '16:00',
        endTime: '09:00' // 结束时间早于开始时间
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: 'End time must be after start time',
              path: ['endTime'],
              type: 'custom.timeOrder'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('End time must be after start time');
    });

    it('应该验证年龄组与年龄范围的一致性', () => {
      const invalidData = {
        name: '测试活动',
        description: '活动描述',
        date: '2024-05-01',
        minAge: 3,
        maxAge: 4,
        ageGroups: ['5-6'] // 年龄组与年龄范围不匹配
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: 'Age groups must be consistent with age range',
              path: ['ageGroups'],
              type: 'custom.ageGroupConsistency'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('Age groups must be consistent with age range');
    });

    it('应该验证活动容量合理性', () => {
      const invalidData = {
        name: '测试活动',
        description: '活动描述',
        date: '2024-05-01',
        type: 'indoor',
        maxParticipants: 1000 // 室内活动容量过大
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: 'Indoor activity capacity should not exceed 200 participants',
              path: ['maxParticipants'],
              type: 'custom.capacityLimit'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('Indoor activity capacity should not exceed 200 participants');
    });

    it('应该验证活动持续时间合理性', () => {
      const invalidData = {
        name: '测试活动',
        description: '活动描述',
        date: '2024-05-01',
        startTime: '09:00',
        endTime: '23:00' // 持续时间过长
      };

      mockJoi.validate.mockReturnValue({
        error: {
          details: [
            {
              message: 'Activity duration should not exceed 10 hours',
              path: ['endTime'],
              type: 'custom.durationLimit'
            }
          ]
        },
        value: invalidData
      });

      const result = activityValidation.validateCreateActivity(invalidData);

      expect((result as any).error).toBeDefined();
      expect(((result as any).error?.details)[0].message).toBe('Activity duration should not exceed 10 hours');
    });
  });
});
