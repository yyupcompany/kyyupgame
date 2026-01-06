// Mock dependencies
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { 
  createCampaign, 
  getCampaigns, 
  getCampaignById, 
  updateCampaign, 
  deleteCampaign,
  launchCampaign,
  pauseCampaign,
  getCampaignStats
} from '../../../src/controllers/marketing-campaign/marketing-campaign.controller';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';

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

const mockNext = jest.fn() as NextFunction;


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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCampaign', () => {
    it('应该成功创建营销活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: '春季招生活动',
        description: '2024年春季招生营销活动',
        type: 'online',
        channel: 'social_media',
        budget: 10000,
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        targetAudience: 'parents_of_preschoolers'
      };
      req.user = { id: 1 };

      await createCampaign(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的创建请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: '春季招生活动'
      };
      req.user = null;

      await createCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );
    });

    it('应该验证活动标题不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        // 缺少title
        description: '2024年春季招生营销活动',
        type: 'online'
      };
      req.user = { id: 1 };

      await createCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该验证活动类型不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: '春季招生活动',
        description: '2024年春季招生营销活动'
        // 缺少type
      };
      req.user = { id: 1 };

      await createCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        title: '春季招生活动',
        type: 'online'
      };
      req.user = { id: 1 };

      // 模拟错误
      const originalCreateCampaign = createCampaign;
      (createCampaign as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (createCampaign as jest.Mock).mockImplementation(originalCreateCampaign);
    });
  });

  describe('getCampaigns', () => {
    it('应该成功获取营销活动列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        limit: '10',
        type: 'online',
        status: 'active'
      };
      req.user = { id: 1 };

      await getCampaigns(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该使用默认分页参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {}; // 缺少分页参数
      req.user = { id: 1 };

      await getCampaigns(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { page: '1', limit: '10' };
      req.user = { id: 1 };

      // 模拟错误
      const originalGetCampaigns = getCampaigns;
      (getCampaigns as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getCampaigns(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (getCampaigns as jest.Mock).mockImplementation(originalGetCampaigns);
    });
  });

  describe('getCampaignById', () => {
    it('应该成功获取营销活动详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      await getCampaignById(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该验证活动ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.user = { id: 1 };

      await getCampaignById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      // 模拟错误
      const originalGetCampaignById = getCampaignById;
      (getCampaignById as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getCampaignById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (getCampaignById as jest.Mock).mockImplementation(originalGetCampaignById);
    });
  });

  describe('updateCampaign', () => {
    it('应该成功更新营销活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        title: '更新后的招生活动',
        budget: 15000,
        status: 'active'
      };
      req.user = { id: 1 };

      await updateCampaign(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的更新请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { title: '更新后的招生活动' };
      req.user = null;

      await updateCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );
    });

    it('应该验证活动ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.body = { title: '更新后的招生活动' };
      req.user = { id: 1 };

      await updateCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { title: '更新后的招生活动' };
      req.user = { id: 1 };

      // 模拟错误
      const originalUpdateCampaign = updateCampaign;
      (updateCampaign as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (updateCampaign as jest.Mock).mockImplementation(originalUpdateCampaign);
    });
  });

  describe('deleteCampaign', () => {
    it('应该成功删除营销活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      await deleteCampaign(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的删除请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = null;

      await deleteCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );
    });

    it('应该验证活动ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.user = { id: 1 };

      await deleteCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      // 模拟错误
      const originalDeleteCampaign = deleteCampaign;
      (deleteCampaign as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await deleteCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (deleteCampaign as jest.Mock).mockImplementation(originalDeleteCampaign);
    });
  });

  describe('launchCampaign', () => {
    it('应该成功启动营销活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      await launchCampaign(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的启动请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = null;

      await launchCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );
    });

    it('应该验证活动ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.user = { id: 1 };

      await launchCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.user = { id: 1 };

      // 模拟错误
      const originalLaunchCampaign = launchCampaign;
      (launchCampaign as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await launchCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (launchCampaign as jest.Mock).mockImplementation(originalLaunchCampaign);
    });
  });

  describe('pauseCampaign', () => {
    it('应该成功暂停营销活动', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        reason: '预算调整'
      };
      req.user = { id: 1 };

      await pauseCampaign(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的暂停请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { reason: '预算调整' };
      req.user = null;

      await pauseCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );
    });

    it('应该验证活动ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.body = { reason: '预算调整' };
      req.user = { id: 1 };

      await pauseCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该验证暂停原因不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        // 缺少reason
      };
      req.user = { id: 1 };

      await pauseCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { reason: '预算调整' };
      req.user = { id: 1 };

      // 模拟错误
      const originalPauseCampaign = pauseCampaign;
      (pauseCampaign as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await pauseCampaign(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (pauseCampaign as jest.Mock).mockImplementation(originalPauseCampaign);
    });
  });

  describe('getCampaignStats', () => {
    it('应该成功获取营销活动统计', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.query = {
        timeRange: 'week'
      };
      req.user = { id: 1 };

      await getCampaignStats(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该验证活动ID不能为空', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = {}; // 缺少id
      req.query = { timeRange: 'week' };
      req.user = { id: 1 };

      await getCampaignStats(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'BAD_REQUEST'
        })
      );
    });

    it('应该使用默认时间范围', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.query = {}; // 缺少时间范围
      req.user = { id: 1 };

      await getCampaignStats(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.query = { timeRange: 'week' };
      req.user = { id: 1 };

      // 模拟错误
      const originalGetCampaignStats = getCampaignStats;
      (getCampaignStats as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getCampaignStats(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));

      // 恢复原始函数
      (getCampaignStats as jest.Mock).mockImplementation(originalGetCampaignStats);
    });
  });
});