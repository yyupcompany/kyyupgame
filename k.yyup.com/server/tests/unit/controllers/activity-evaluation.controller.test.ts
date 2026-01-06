// Mock dependencies
jest.mock('../../../src/init');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/services/activity/activity-evaluation.service');

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { 
  createEvaluation, 
  getEvaluationById, 
  updateEvaluation, 
  deleteEvaluation,
  replyEvaluation,
  getEvaluations,
  getEvaluationStatistics,
  generateSatisfactionReport
} from '../../../src/controllers/activity-evaluation.controller';
import { sequelize } from '../../../src/init';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { logger } from '../../../src/utils/logger';
import { ActivityEvaluationService } from '../../../src/services/activity/activity-evaluation.service';
import { QueryTypes } from 'sequelize';

// Mock implementations
const mockSequelize = {
  query: jest.fn()
};

const mockActivityEvaluationService = {
  createEvaluation: jest.fn(),
  getEvaluationById: jest.fn(),
  updateEvaluation: jest.fn(),
  deleteEvaluation: jest.fn(),
  replyEvaluation: jest.fn(),
  getEvaluations: jest.fn(),
  getEvaluationStatistics: jest.fn(),
  generateSatisfactionReport: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;
(ActivityEvaluationService as any) = jest.fn(() => mockActivityEvaluationService);

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

describe('Activity Evaluation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvaluation', () => {
    it('应该成功创建活动评价', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        activityId: 1,
        evaluatorType: 'parent',
        evaluatorName: '张三',
        overallRating: 5,
        contentRating: 5,
        organizationRating: 4,
        environmentRating: 5,
        serviceRating: 4,
        comments: '活动很棒，孩子很喜欢！'
      };
      req.user = { id: 1 };

      await createEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          evaluation: expect.objectContaining({
            activityId: 1,
            evaluatorType: 'parent',
            evaluatorName: '张三',
            overallRating: 5,
            createdBy: 1,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date)
          })
        },
        message: '评价创建成功'
      });
    });

    it('应该拒绝未登录用户的评价请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        activityId: 1,
        evaluatorType: 'parent',
        evaluatorName: '张三',
        overallRating: 5
      };
      req.user = null;

      await createEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'UNAUTHORIZED',
        message: '未授权的访问',
        statusCode: 401
      });
    });

    it('应该验证活动ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        // 缺少activityId
        evaluatorType: 'parent',
        evaluatorName: '张三',
        overallRating: 5
      };
      req.user = { id: 1 };

      await createEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '活动ID不能为空',
        statusCode: 400
      });
    });

    it('应该验证评价者类型不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        activityId: 1,
        // 缺少evaluatorType
        evaluatorName: '张三',
        overallRating: 5
      };
      req.user = { id: 1 };

      await createEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '评价者类型不能为空',
        statusCode: 400
      });
    });

    it('应该验证评价者姓名不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        activityId: 1,
        evaluatorType: 'parent',
        // 缺少evaluatorName
        overallRating: 5
      };
      req.user = { id: 1 };

      await createEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '评价者姓名不能为空',
        statusCode: 400
      });
    });

    it('应该验证总体评分必须在1-5之间', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        activityId: 1,
        evaluatorType: 'parent',
        evaluatorName: '张三',
        overallRating: 6 // 超出范围
      };
      req.user = { id: 1 };

      await createEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '总体评分必须在1-5之间',
        statusCode: 400
      });
    });

    it('应该验证总体评分不能小于1', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        activityId: 1,
        evaluatorType: 'parent',
        evaluatorName: '张三',
        overallRating: 0 // 小于1
      };
      req.user = { id: 1 };

      await createEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '总体评分必须在1-5之间',
        statusCode: 400
      });
    });

    it('应该验证总体评分不能为undefined', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        activityId: 1,
        evaluatorType: 'parent',
        evaluatorName: '张三'
        // 缺少overallRating
      };
      req.user = { id: 1 };

      await createEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '总体评分必须在1-5之间',
        statusCode: 400
      });
    });

    it('应该处理未知错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        activityId: 1,
        evaluatorType: 'parent',
        evaluatorName: '张三',
        overallRating: 5
      };
      req.user = { id: 1 };

      // 模拟未知错误
      const originalCreateEvaluation = createEvaluation;
      (createEvaluation as jest.Mock).mockImplementationOnce(async () => {
        throw 'Unknown error';
      });

      await createEvaluation(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith('创建活动评价失败', { error: 'Unknown error' });
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: '创建评价失败: 未知错误',
        statusCode: 500
      });

      // 恢复原始函数
      (createEvaluation as jest.Mock).mockImplementation(originalCreateEvaluation);
    });
  });

  describe('getEvaluationById', () => {
    it('应该成功获取评价详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      await getEvaluationById(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          evaluation: expect.objectContaining({
            id: 1,
            activityId: 1,
            evaluatorType: 'parent',
            evaluatorName: '张三',
            overallRating: 5,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date)
          })
        },
        message: '获取评价详情成功'
      });
    });

    it('应该验证评价ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id

      await getEvaluationById(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '无效的评价ID',
        statusCode: 400
      });
    });

    it('应该验证评价ID必须是数字', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      await getEvaluationById(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '无效的评价ID',
        statusCode: 400
      });
    });

    it('应该处理未知错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      // 模拟未知错误
      const originalGetEvaluationById = getEvaluationById;
      (getEvaluationById as jest.Mock).mockImplementationOnce(async () => {
        throw 'Unknown error';
      });

      await getEvaluationById(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith('获取评价详情失败', { error: 'Unknown error' });
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: '获取评价详情失败: 未知错误',
        statusCode: 500
      });

      // 恢复原始函数
      (getEvaluationById as jest.Mock).mockImplementation(originalGetEvaluationById);
    });
  });

  describe('updateEvaluation', () => {
    it('应该成功更新评价', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        overallRating: 4,
        comments: '更新后的评价'
      };
      req.user = { id: 1 };

      await updateEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          evaluation: expect.objectContaining({
            id: 1,
            overallRating: 4,
            comments: '更新后的评价',
            updatedBy: 1,
            updatedAt: expect.any(Date)
          })
        },
        message: '评价更新成功'
      });
    });

    it('应该拒绝未登录用户的更新请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        overallRating: 4
      };
      req.user = null;

      await updateEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'UNAUTHORIZED',
        message: '未授权的访问',
        statusCode: 401
      });
    });

    it('应该验证评价ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.body = {
        overallRating: 4
      };
      req.user = { id: 1 };

      await updateEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '无效的评价ID',
        statusCode: 400
      });
    });

    it('应该验证评价ID必须是数字', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };
      req.body = {
        overallRating: 4
      };
      req.user = { id: 1 };

      await updateEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '无效的评价ID',
        statusCode: 400
      });
    });

    it('应该验证更新时的评分范围', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        overallRating: 6 // 超出范围
      };
      req.user = { id: 1 };

      await updateEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '总体评分必须在1-5之间',
        statusCode: 400
      });
    });

    it('应该处理未知错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        overallRating: 4
      };
      req.user = { id: 1 };

      // 模拟未知错误
      const originalUpdateEvaluation = updateEvaluation;
      (updateEvaluation as jest.Mock).mockImplementationOnce(async () => {
        throw 'Unknown error';
      });

      await updateEvaluation(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith('更新评价失败', { error: 'Unknown error' });
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: '更新评价失败: 未知错误',
        statusCode: 500
      });

      // 恢复原始函数
      (updateEvaluation as jest.Mock).mockImplementation(originalUpdateEvaluation);
    });
  });

  describe('deleteEvaluation', () => {
    it('应该成功删除评价', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      await deleteEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {},
        message: '评价删除成功'
      });
    });

    it('应该拒绝未登录用户的删除请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = null;

      await deleteEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'UNAUTHORIZED',
        message: '未授权的访问',
        statusCode: 401
      });
    });

    it('应该验证评价ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.user = { id: 1 };

      await deleteEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '无效的评价ID',
        statusCode: 400
      });
    });

    it('应该验证评价ID必须是数字', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };
      req.user = { id: 1 };

      await deleteEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '无效的评价ID',
        statusCode: 400
      });
    });

    it('应该处理未知错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      // 模拟未知错误
      const originalDeleteEvaluation = deleteEvaluation;
      (deleteEvaluation as jest.Mock).mockImplementationOnce(async () => {
        throw 'Unknown error';
      });

      await deleteEvaluation(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith('删除评价失败', { error: 'Unknown error' });
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: '删除评价失败: 未知错误',
        statusCode: 500
      });

      // 恢复原始函数
      (deleteEvaluation as jest.Mock).mockImplementation(originalDeleteEvaluation);
    });
  });

  describe('replyEvaluation', () => {
    it('应该成功回复评价', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        reply: '感谢您的评价！'
      };
      req.user = { id: 1 };

      await replyEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          evaluation: expect.objectContaining({
            id: 1,
            reply: '感谢您的评价！',
            repliedBy: 1,
            repliedAt: expect.any(Date)
          })
        },
        message: '回复评价成功'
      });
    });

    it('应该拒绝未登录用户的回复请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        reply: '感谢您的评价！'
      };
      req.user = null;

      await replyEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'UNAUTHORIZED',
        message: '未授权的访问',
        statusCode: 401
      });
    });

    it('应该验证评价ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.body = {
        reply: '感谢您的评价！'
      };
      req.user = { id: 1 };

      await replyEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '无效的评价ID',
        statusCode: 400
      });
    });

    it('应该验证评价ID必须是数字', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };
      req.body = {
        reply: '感谢您的评价！'
      };
      req.user = { id: 1 };

      await replyEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '无效的评价ID',
        statusCode: 400
      });
    });

    it('应该验证回复内容不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        reply: '' // 空字符串
      };
      req.user = { id: 1 };

      await replyEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '回复内容不能为空',
        statusCode: 400
      });
    });

    it('应该验证回复内容不能只有空格', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        reply: '   ' // 只有空格
      };
      req.user = { id: 1 };

      await replyEvaluation(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '回复内容不能为空',
        statusCode: 400
      });
    });

    it('应该处理未知错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        reply: '感谢您的评价！'
      };
      req.user = { id: 1 };

      // 模拟未知错误
      const originalReplyEvaluation = replyEvaluation;
      (replyEvaluation as jest.Mock).mockImplementationOnce(async () => {
        throw 'Unknown error';
      });

      await replyEvaluation(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith('回复评价失败', { error: 'Unknown error' });
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: '回复评价失败: 未知错误',
        statusCode: 500
      });

      // 恢复原始函数
      (replyEvaluation as jest.Mock).mockImplementation(originalReplyEvaluation);
    });
  });

  describe('getEvaluations', () => {
    it('应该成功获取评价列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        pageSize: '10'
      };

      await getEvaluations(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              activityId: 1,
              activityTitle: '春季亲子运动会',
              evaluatorType: 'parent',
              evaluatorName: '张三',
              overallRating: 5
            })
          ]),
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1
        }),
        message: '获取评价列表成功'
      });
    });

    it('应该使用默认的分页参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {}; // 缺少分页参数

      await getEvaluations(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          page: 1,
          pageSize: 10
        }),
        message: '获取评价列表成功'
      });
    });

    it('应该处理空列表的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        pageSize: '10'
      };

      // 模拟空列表
      const originalGetEvaluations = getEvaluations;
      (getEvaluations as jest.Mock).mockImplementationOnce(async () => {
        const mockRes = mockResponse();
        mockRes.json({
          success: true,
          data: {
            items: [],
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0
          },
          message: '获取评价列表成功'
        });
        return mockRes as Response;
      });

      await getEvaluations(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          items: [],
          total: 0,
          totalPages: 0
        }),
        message: '获取评价列表成功'
      });

      // 恢复原始函数
      (getEvaluations as jest.Mock).mockImplementation(originalGetEvaluations);
    });

    it('应该处理未知错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        pageSize: '10'
      };

      // 模拟未知错误
      const originalGetEvaluations = getEvaluations;
      (getEvaluations as jest.Mock).mockImplementationOnce(async () => {
        throw 'Unknown error';
      });

      await getEvaluations(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith('获取评价列表失败', { error: 'Unknown error' });
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: '获取评价列表失败: 未知错误',
        statusCode: 500
      });

      // 恢复原始函数
      (getEvaluations as jest.Mock).mockImplementation(originalGetEvaluations);
    });
  });

  describe('getEvaluationStatistics', () => {
    it('应该成功获取评价统计', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };

      await getEvaluationStatistics(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          totalEvaluations: 25,
          averageRating: 4.2,
          ratingDistribution: {
            5: 10,
            4: 8,
            3: 5,
            2: 2,
            1: 0
          },
          satisfactionRate: 0.84
        }),
        message: '获取评价统计成功'
      });
    });

    it('应该验证活动ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少activityId

      await getEvaluationStatistics(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '无效的活动ID',
        statusCode: 400
      });
    });

    it('应该验证活动ID必须是数字', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: 'invalid' };

      await getEvaluationStatistics(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '无效的活动ID',
        statusCode: 400
      });
    });

    it('应该处理未知错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };

      // 模拟未知错误
      const originalGetEvaluationStatistics = getEvaluationStatistics;
      (getEvaluationStatistics as jest.Mock).mockImplementationOnce(async () => {
        throw 'Unknown error';
      });

      await getEvaluationStatistics(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith('获取评价统计失败', { error: 'Unknown error' });
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: '获取评价统计失败: 未知错误',
        statusCode: 500
      });

      // 恢复原始函数
      (getEvaluationStatistics as jest.Mock).mockImplementation(originalGetEvaluationStatistics);
    });
  });

  describe('generateSatisfactionReport', () => {
    it('应该成功生成满意度报告', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };

      await generateSatisfactionReport(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          activityId: 1,
          activityTitle: '春季亲子运动会',
          overallSatisfaction: 4.2,
          participantCount: 25,
          responseRate: 0.83,
          recommendations: expect.arrayContaining([
            '增加活动时间',
            '改善场地设施',
            '提供更多互动环节'
          ])
        }),
        message: '生成满意度报告成功'
      });
    });

    it('应该验证活动ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少activityId

      await generateSatisfactionReport(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '无效的活动ID',
        statusCode: 400
      });
    });

    it('应该验证活动ID必须是数字', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: 'invalid' };

      await generateSatisfactionReport(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'BAD_REQUEST',
        message: '无效的活动ID',
        statusCode: 400
      });
    });

    it('应该处理未知错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { activityId: '1' };

      // 模拟未知错误
      const originalGenerateSatisfactionReport = generateSatisfactionReport;
      (generateSatisfactionReport as jest.Mock).mockImplementationOnce(async () => {
        throw 'Unknown error';
      });

      await generateSatisfactionReport(req as Request, res as Response);

      expect(logger.error).toHaveBeenCalledWith('生成满意度报告失败', { error: 'Unknown error' });
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: '生成满意度报告失败: 未知错误',
        statusCode: 500
      });

      // 恢复原始函数
      (generateSatisfactionReport as jest.Mock).mockImplementation(originalGenerateSatisfactionReport);
    });
  });
});