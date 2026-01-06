// Mock dependencies
jest.mock('../../../src/init');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { 
  checkIn, 
  batchCheckIn, 
  getCheckins, 
  getCheckinStats,
  exportCheckinData,
  checkInByPhone
} from '../../../src/controllers/activity-checkin.controller';
import { sequelize } from '../../../src/init';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { QueryTypes } from 'sequelize';

// Mock implementations
const mockSequelize = {
  query: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: null
} as Partial<Request>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};


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

describe('Activity Checkin Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkIn', () => {
    it('应该成功进行签到', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { location: '会议室A' };
      req.user = { id: 1 };

      const mockResult = [{
        id: 1,
        activity_id: 1,
        contact_name: '张三',
        contact_phone: '13800138000',
        check_in_time: new Date(),
        check_in_location: '会议室A',
        activity_title: '亲子活动'
      }];

      mockSequelize.query
        .mockResolvedValueOnce(null) // UPDATE result
        .mockResolvedValueOnce(mockResult); // SELECT result

      await checkIn(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '签到成功',
        data: mockResult[0]
      });
    });

    it('应该拒绝未登录用户的签到请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { location: '会议室A' };
      req.user = null;

      await checkIn(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '未登录或登录已过期'
      });
    });

    it('应该验证签到地点不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {}; // 缺少location
      req.user = { id: 1 };

      await checkIn(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '签到地点不能为空'
      });
    });

    it('应该处理签到记录不存在的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };
      req.body = { location: '会议室A' };
      req.user = { id: 1 };

      mockSequelize.query
        .mockResolvedValueOnce(null) // UPDATE result
        .mockResolvedValueOnce([]); // SELECT result (empty)

      await checkIn(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '签到记录不存在'
      });
    });

    it('应该处理数据库错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { location: '会议室A' };
      req.user = { id: 1 };

      mockSequelize.query.mockRejectedValue(new Error('Database error'));

      await checkIn(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '签到失败'
      });
    });
  });

  describe('batchCheckIn', () => {
    it('应该成功进行批量签到', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        registrationIds: [1, 2, 3],
        location: '会议室A'
      };
      req.user = { id: 1 };

      const mockResults = [
        { id: 1, contact_name: '张三', check_in_time: new Date() },
        { id: 2, contact_name: '李四', check_in_time: new Date() },
        { id: 3, contact_name: '王五', check_in_time: new Date() }
      ];

      mockSequelize.query
        .mockResolvedValueOnce(null) // UPDATE result
        .mockResolvedValueOnce(mockResults); // SELECT result

      await batchCheckIn(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '批量签到处理完成',
        data: {
          successCount: 3,
          failureCount: 0,
          details: mockResults
        }
      });
    });

    it('应该拒绝未登录用户的批量签到请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        registrationIds: [1, 2, 3],
        location: '会议室A'
      };
      req.user = null;

      await batchCheckIn(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '未登录或登录已过期'
      });
    });

    it('应该验证报名ID列表不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        registrationIds: [], // 空数组
        location: '会议室A'
      };
      req.user = { id: 1 };

      await batchCheckIn(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '报名ID列表不能为空'
      });
    });

    it('应该验证报名ID必须是数组', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        registrationIds: '1,2,3', // 字符串而不是数组
        location: '会议室A'
      };
      req.user = { id: 1 };

      await batchCheckIn(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '报名ID列表不能为空'
      });
    });

    it('应该验证签到地点不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        registrationIds: [1, 2, 3]
        // 缺少location
      };
      req.user = { id: 1 };

      await batchCheckIn(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '签到地点不能为空'
      });
    });

    it('应该处理部分签到成功的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        registrationIds: [1, 2, 3, 4],
        location: '会议室A'
      };
      req.user = { id: 1 };

      const mockResults = [
        { id: 1, contact_name: '张三', check_in_time: new Date() },
        { id: 2, contact_name: '李四', check_in_time: new Date() },
        { id: 3, contact_name: '王五', check_in_time: new Date() }
      ];

      mockSequelize.query
        .mockResolvedValueOnce(null) // UPDATE result
        .mockResolvedValueOnce(mockResults); // SELECT result (只有3个成功)

      await batchCheckIn(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '批量签到处理完成',
        data: {
          successCount: 3,
          failureCount: 1,
          details: mockResults
        }
      });
    });

    it('应该处理数据库错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        registrationIds: [1, 2, 3],
        location: '会议室A'
      };
      req.user = { id: 1 };

      mockSequelize.query.mockRejectedValue(new Error('Database error'));

      await batchCheckIn(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '批量签到失败'
      });
    });
  });

  describe('getCheckins', () => {
    it('应该成功获取活动签到列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        activityId: '1',
        page: '1',
        limit: '10'
      };

      const mockItems = [
        {
          id: 1,
          contact_name: '张三',
          contact_phone: '13800138000',
          child_name: '小明',
          check_in_time: new Date(),
          check_in_location: '会议室A',
          registration_time: new Date(),
          activity_title: '亲子活动'
        },
        {
          id: 2,
          contact_name: '李四',
          contact_phone: '13900139000',
          child_name: '小红',
          check_in_time: new Date(),
          check_in_location: '会议室A',
          registration_time: new Date(),
          activity_title: '亲子活动'
        }
      ];

      const mockTotalResult = [{ total: 2 }];

      mockSequelize.query
        .mockResolvedValueOnce(mockItems) // SELECT items
        .mockResolvedValueOnce(mockTotalResult); // SELECT total

      await getCheckins(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '获取活动签到列表成功',
        data: {
          items: mockItems,
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      });
    });

    it('应该验证活动ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        // 缺少activityId
        page: '1',
        limit: '10'
      };

      await getCheckins(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '活动ID不能为空'
      });
    });

    it('应该处理空列表的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        activityId: '999',
        page: '1',
        limit: '10'
      };

      const mockItems = [];
      const mockTotalResult = [{ total: 0 }];

      mockSequelize.query
        .mockResolvedValueOnce(mockItems) // SELECT items (empty)
        .mockResolvedValueOnce(mockTotalResult); // SELECT total

      await getCheckins(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '获取活动签到列表成功',
        data: {
          items: [],
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      });
    });

    it('应该使用默认的分页参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        activityId: '1'
        // 缺少page和limit
      };

      const mockItems = [];
      const mockTotalResult = [{ total: 0 }];

      mockSequelize.query
        .mockResolvedValueOnce(mockItems)
        .mockResolvedValueOnce(mockTotalResult);

      await getCheckins(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '获取活动签到列表成功',
        data: {
          items: [],
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      });
    });

    it('应该处理数据库错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        activityId: '1',
        page: '1',
        limit: '10'
      };

      mockSequelize.query.mockRejectedValue(new Error('Database error'));

      await getCheckins(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '获取活动签到列表失败'
      });
    });
  });

  describe('getCheckinStats', () => {
    it('应该成功获取活动签到统计数据', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };

      const mockStats = [{
        totalRegistrations: 50,
        checkedInCount: 35,
        notCheckedInCount: 15,
        checkInRate: 0.7
      }];

      mockSequelize.query.mockResolvedValue(mockStats);

      await getCheckinStats(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.objectContaining({
          replacements: { activityId: 1 },
          type: QueryTypes.SELECT
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '获取活动签到统计数据成功',
        data: mockStats[0]
      });
    });

    it('应该验证活动ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少activityId

      await getCheckinStats(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '活动ID不能为空'
      });
    });

    it('应该处理统计数据查询失败的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };

      mockSequelize.query.mockResolvedValue([]); // 空结果

      await getCheckinStats(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '查询统计数据失败'
      });
    });

    it('应该处理数据库错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };

      mockSequelize.query.mockRejectedValue(new Error('Database error'));

      await getCheckinStats(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '获取活动签到统计数据失败'
      });
    });
  });

  describe('exportCheckinData', () => {
    it('应该成功导出签到数据', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };

      const mockData = [
        {
          contact_name: '张三',
          contact_phone: '13800138000',
          child_name: '小明',
          child_age: 5,
          registration_time: new Date(),
          check_in_time: new Date(),
          check_in_location: '会议室A',
          activity_title: '亲子活动'
        },
        {
          contact_name: '李四',
          contact_phone: '13900139000',
          child_name: '小红',
          child_age: 4,
          registration_time: new Date(),
          check_in_time: new Date(),
          check_in_location: '会议室A',
          activity_title: '亲子活动'
        }
      ];

      mockSequelize.query.mockResolvedValue(mockData);

      await exportCheckinData(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.objectContaining({
          replacements: { activityId: 1 },
          type: QueryTypes.SELECT
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '导出签到数据成功',
        data: {
          fileName: 'activity_1_checkin_data.xlsx',
          records: mockData,
          totalCount: 2
        }
      });
    });

    it('应该验证活动ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少activityId

      await exportCheckinData(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '活动ID不能为空'
      });
    });

    it('应该处理空数据的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '999' };

      const mockData = [];

      mockSequelize.query.mockResolvedValue(mockData);

      await exportCheckinData(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '导出签到数据成功',
        data: {
          fileName: 'activity_999_checkin_data.xlsx',
          records: [],
          totalCount: 0
        }
      });
    });

    it('应该处理数据库错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };

      mockSequelize.query.mockRejectedValue(new Error('Database error'));

      await exportCheckinData(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '导出签到数据失败'
      });
    });
  });

  describe('checkInByPhone', () => {
    it('应该成功根据手机号签到', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };
      req.body = {
        phone: '13800138000',
        location: '会议室A'
      };
      req.user = { id: 1 };

      const mockRegistration = [{
        id: 1,
        contact_name: '张三',
        contact_phone: '13800138000',
        check_in_time: null
      }];

      mockSequelize.query
        .mockResolvedValueOnce(mockRegistration) // 查找报名记录
        .mockResolvedValueOnce(null); // 更新签到信息

      await checkInByPhone(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '签到成功',
        data: {
          id: 1,
          contactName: '张三',
          contactPhone: '13800138000',
          checkInTime: expect.any(Date),
          checkInLocation: '会议室A'
        }
      });
    });

    it('应该拒绝未登录用户的签到请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };
      req.body = {
        phone: '13800138000',
        location: '会议室A'
      };
      req.user = null;

      await checkInByPhone(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '未登录或登录已过期'
      });
    });

    it('应该验证活动ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少activityId
      req.body = {
        phone: '13800138000',
        location: '会议室A'
      };
      req.user = { id: 1 };

      await checkInByPhone(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '活动ID不能为空'
      });
    });

    it('应该验证手机号不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };
      req.body = {
        // 缺少phone
        location: '会议室A'
      };
      req.user = { id: 1 };

      await checkInByPhone(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '手机号不能为空'
      });
    });

    it('应该验证签到地点不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };
      req.body = {
        phone: '13800138000'
        // 缺少location
      };
      req.user = { id: 1 };

      await checkInByPhone(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '签到地点不能为空'
      });
    });

    it('应该处理未找到报名记录的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };
      req.body = {
        phone: '13800138000',
        location: '会议室A'
      };
      req.user = { id: 1 };

      mockSequelize.query.mockResolvedValueOnce([]); // 空结果，未找到记录

      await checkInByPhone(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '未找到该手机号的报名记录'
      });
    });

    it('应该处理已签到的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };
      req.body = {
        phone: '13800138000',
        location: '会议室A'
      };
      req.user = { id: 1 };

      const mockRegistration = [{
        id: 1,
        contact_name: '张三',
        contact_phone: '13800138000',
        check_in_time: new Date() // 已签到
      }];

      mockSequelize.query.mockResolvedValueOnce(mockRegistration);

      await checkInByPhone(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '该报名记录已签到'
      });
    });

    it('应该处理数据库错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };
      req.body = {
        phone: '13800138000',
        location: '会议室A'
      };
      req.user = { id: 1 };

      mockSequelize.query.mockRejectedValue(new Error('Database error'));

      await checkInByPhone(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '根据手机号签到失败'
      });
    });
  });
});