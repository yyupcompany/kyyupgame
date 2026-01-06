// Mock dependencies
jest.mock('../../../src/init');
jest.mock('../../../src/validations/marketing-campaign.validator');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/utils/sqlHelper');

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { MarketingCampaignController } from '../../../src/controllers/marketing-campaign.controller';
import { sequelize } from '../../../src/init';
import { validateMarketingCampaign } from '../../../src/validations/marketing-campaign.validator';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { SqlHelper } from '../../../src/utils/sqlHelper';

// Mock implementations
const mockSequelize = {
  query: jest.fn(),
  transaction: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockValidateMarketingCampaign = jest.fn();

const mockApiResponse = {
  success: jest.fn(),
  error: jest.fn(),
  handleError: jest.fn()
};

const mockSqlHelper = {
  recordExists: jest.fn(),
  executeQuery: jest.fn(),
  buildWhereClause: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;
(validateMarketingCampaign as any) = mockValidateMarketingCampaign;
(ApiResponse.success as any) = mockApiResponse.success;
(ApiResponse.error as any) = mockApiResponse.error;
(ApiResponse.handleError as any) = mockApiResponse.handleError;
(SqlHelper as any) = mockSqlHelper;

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: { id: 1, username: 'testuser' }
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

describe('Marketing Campaign Controller', () => {
  let marketingCampaignController: MarketingCampaignController;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    marketingCampaignController = new MarketingCampaignController();
  });

  describe('create', () => {
    it('应该成功创建营销活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        kindergartenId: 1,
        title: '春季招生活动',
        campaignType: 'enrollment',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        targetAudience: 'parents',
        budget: 10000,
        objective: '招收50名新生',
        description: '春季招生优惠活动',
        rules: '报名即享受学费优惠',
        rewards: '前10名报名者享受8折优惠',
        coverImage: '/images/spring-campaign.jpg',
        bannerImage: '/images/spring-banner.jpg',
        status: 0, // DRAFT
        remark: '首次春季招生活动'
      };

      const mockCreatedCampaign = {
        id: 1,
        kindergartenId: 1,
        title: '春季招生活动',
        campaignType: 'enrollment',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        targetAudience: 'parents',
        budget: 10000,
        objective: '招收50名新生',
        description: '春季招生优惠活动',
        rules: '报名即享受学费优惠',
        rewards: '前10名报名者享受8折优惠',
        coverImage: '/images/spring-campaign.jpg',
        bannerImage: '/images/spring-banner.jpg',
        status: 0,
        remark: '首次春季招生活动',
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockValidateMarketingCampaign.mockReturnValue({ error: null });
      mockSequelize.query.mockResolvedValue([mockCreatedCampaign]);

      await marketingCampaignController.create(req as Request, res as Response);

      expect(mockValidateMarketingCampaign).toHaveBeenCalledWith(req.body);
      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO marketing_campaigns'),
        expect.objectContaining({
          type: 'INSERT',
          transaction: mockTransaction
        })
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockCreatedCampaign, '营销活动创建成功');
    });

    it('应该验证必填字段', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: '测试活动'
        // 缺少必填字段
      };

      const validationError = { error: { details: [{ message: '缺少必填字段' }] } };
      mockValidateMarketingCampaign.mockReturnValue(validationError);

      await marketingCampaignController.create(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '缺少必填字段', 'VALIDATION_ERROR', 400);
    });

    it('应该处理重复的活动标题', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        kindergartenId: 1,
        title: '重复的活动标题',
        campaignType: 'enrollment',
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      };

      mockValidateMarketingCampaign.mockReturnValue({ error: null });
      mockSqlHelper.recordExists.mockResolvedValue(undefined);

      await marketingCampaignController.create(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '活动标题已存在', 'DUPLICATE_TITLE', 409);
    });

    it('应该处理数据库错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        kindergartenId: 1,
        title: '测试活动',
        campaignType: 'enrollment',
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      };

      mockValidateMarketingCampaign.mockReturnValue({ error: null });
      const dbError = new Error('Database connection failed');
      mockSequelize.query.mockRejectedValue(dbError);

      await marketingCampaignController.create(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, dbError, '创建营销活动失败');
    });
  });

  describe('getList', () => {
    it('应该成功获取营销活动列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        pageSize: '10',
        kindergartenId: '1',
        status: '1',
        campaignType: 'enrollment',
        keyword: '春季',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      const mockCampaigns = [
        {
          id: 1,
          title: '春季招生活动',
          campaignType: 'enrollment',
          status: 1,
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          budget: 10000,
          targetAudience: 'parents',
          createdAt: new Date()
        },
        {
          id: 2,
          title: '春季体验活动',
          campaignType: 'experience',
          status: 1,
          startDate: '2024-03-15',
          endDate: '2024-03-30',
          budget: 5000,
          targetAudience: 'children',
          createdAt: new Date()
        }
      ];

      const mockCountResult = [{ total: 2 }];

      mockSequelize.query
        .mockResolvedValueOnce(mockCampaigns) // 获取列表
        .mockResolvedValueOnce(mockCountResult); // 获取总数

      await marketingCampaignController.getList(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledTimes(2);
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, {
        items: mockCampaigns,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
    });

    it('应该使用默认查询参数', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockEmptyList = [];
      const mockCountResult = [{ total: 0 }];

      mockSequelize.query
        .mockResolvedValueOnce(mockEmptyList)
        .mockResolvedValueOnce(mockCountResult);

      await marketingCampaignController.getList(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, {
        items: mockEmptyList,
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      });
    });

    it('应该处理获取列表失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const dbError = new Error('Database query failed');
      mockSequelize.query.mockRejectedValue(dbError);

      await marketingCampaignController.getList(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, dbError, '获取营销活动列表失败');
    });
  });

  describe('getById', () => {
    it('应该成功获取营销活动详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockCampaign = {
        id: 1,
        kindergartenId: 1,
        title: '春季招生活动',
        campaignType: 'enrollment',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        targetAudience: 'parents',
        budget: 10000,
        objective: '招收50名新生',
        description: '春季招生优惠活动',
        rules: '报名即享受学费优惠',
        rewards: '前10名报名者享受8折优惠',
        coverImage: '/images/spring-campaign.jpg',
        bannerImage: '/images/spring-banner.jpg',
        status: 1,
        remark: '首次春季招生活动',
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        // 统计信息
        totalParticipants: 25,
        totalConversions: 15,
        conversionRate: 0.6,
        totalSpent: 7500
      };

      mockSequelize.query.mockResolvedValue([mockCampaign]);

      await marketingCampaignController.getById(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM marketing_campaigns WHERE id = ?'),
        expect.objectContaining({
          replacements: [1],
          type: 'SELECT'
        })
      );
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockCampaign);
    });

    it('应该处理活动不存在', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockSequelize.query.mockResolvedValue([]);

      await marketingCampaignController.getById(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '营销活动不存在', 'CAMPAIGN_NOT_FOUND', 404);
    });

    it('应该处理无效的活动ID', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      await marketingCampaignController.getById(req as Request, res as Response);

      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '无效的活动ID', 'INVALID_CAMPAIGN_ID', 400);
    });
  });

  describe('update', () => {
    it('应该成功更新营销活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        title: '更新的春季招生活动',
        budget: 15000,
        description: '更新的活动描述',
        rewards: '更新的奖励规则'
      };

      const mockExistingCampaign = [{ id: 1, title: '春季招生活动', status: 0 }];
      const mockUpdatedCampaign = {
        id: 1,
        title: '更新的春季招生活动',
        budget: 15000,
        description: '更新的活动描述',
        rewards: '更新的奖励规则',
        updatedAt: new Date()
      };

      mockSequelize.query
        .mockResolvedValueOnce(mockExistingCampaign) // 检查活动是否存在
        .mockResolvedValueOnce([1]) // 更新操作
        .mockResolvedValueOnce([mockUpdatedCampaign]); // 获取更新后的数据

      await marketingCampaignController.update(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE marketing_campaigns SET'),
        expect.objectContaining({
          replacements: expect.arrayContaining([1]),
          type: 'UPDATE',
          transaction: mockTransaction
        })
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockUpdatedCampaign, '营销活动更新成功');
    });

    it('应该处理更新不存在的活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };
      req.body = { title: '不存在的活动' };

      mockSequelize.query.mockResolvedValue([]); // 活动不存在

      await marketingCampaignController.update(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '营销活动不存在', 'CAMPAIGN_NOT_FOUND', 404);
    });

    it('应该阻止更新已完成的活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { title: '尝试更新已完成的活动' };

      const mockCompletedCampaign = [{ id: 1, title: '已完成的活动', status: 3 }]; // COMPLETED

      mockSequelize.query.mockResolvedValue(mockCompletedCampaign);

      await marketingCampaignController.update(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '已完成的活动无法修改', 'CAMPAIGN_COMPLETED', 400);
    });
  });

  describe('delete', () => {
    it('应该成功删除营销活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockExistingCampaign = [{ id: 1, title: '测试活动', status: 0 }]; // DRAFT

      mockSequelize.query
        .mockResolvedValueOnce(mockExistingCampaign) // 检查活动是否存在
        .mockResolvedValueOnce([1]); // 删除操作

      await marketingCampaignController.delete(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'DELETE FROM marketing_campaigns WHERE id = ?',
        expect.objectContaining({
          replacements: [1],
          type: 'DELETE',
          transaction: mockTransaction
        })
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, null, '营销活动删除成功');
    });

    it('应该处理删除不存在的活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockSequelize.query.mockResolvedValue([]); // 活动不存在

      await marketingCampaignController.delete(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '营销活动不存在', 'CAMPAIGN_NOT_FOUND', 404);
    });

    it('应该阻止删除进行中的活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockActiveCampaign = [{ id: 1, title: '进行中的活动', status: 1 }]; // ACTIVE

      mockSequelize.query.mockResolvedValue(mockActiveCampaign);

      await marketingCampaignController.delete(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockApiResponse.error).toHaveBeenCalledWith(res, '进行中的活动无法删除', 'CAMPAIGN_ACTIVE', 400);
    });
  });

  describe('getStatistics', () => {
    it('应该成功获取营销活动统计信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        kindergartenId: '1',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        campaignType: 'enrollment'
      };

      const mockStatistics = {
        totalCampaigns: 10,
        activeCampaigns: 3,
        completedCampaigns: 5,
        draftCampaigns: 2,
        totalBudget: 100000,
        totalSpent: 75000,
        totalParticipants: 500,
        totalConversions: 150,
        averageConversionRate: 0.3,
        campaignsByType: {
          enrollment: 6,
          experience: 2,
          promotion: 2
        },
        monthlyPerformance: [
          { month: '2024-01', participants: 50, conversions: 15, spent: 7500 },
          { month: '2024-02', participants: 80, conversions: 25, spent: 12000 },
          { month: '2024-03', participants: 120, conversions: 40, spent: 18000 }
        ]
      };

      mockSequelize.query.mockResolvedValue([mockStatistics]);

      await marketingCampaignController.getStatistics(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.objectContaining({
          replacements: expect.arrayContaining([1, '2024-01-01', '2024-12-31', 'enrollment']),
          type: 'SELECT'
        })
      );
      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockStatistics);
    });

    it('应该处理无查询参数的统计请求', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockEmptyStatistics = {
        totalCampaigns: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        draftCampaigns: 0
      };

      mockSequelize.query.mockResolvedValue([mockEmptyStatistics]);

      await marketingCampaignController.getStatistics(req as Request, res as Response);

      expect(mockApiResponse.success).toHaveBeenCalledWith(res, mockEmptyStatistics);
    });

    it('应该处理统计查询失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const dbError = new Error('Statistics query failed');
      mockSequelize.query.mockRejectedValue(dbError);

      await marketingCampaignController.getStatistics(req as Request, res as Response);

      expect(mockApiResponse.handleError).toHaveBeenCalledWith(res, dbError, '获取营销活动统计失败');
    });
  });
});
