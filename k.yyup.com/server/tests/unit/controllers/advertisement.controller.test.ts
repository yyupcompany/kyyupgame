/**
 * 广告控制器测试
 */

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { AdvertisementController } from '../../../src/controllers/advertisement.controller';
import { sequelize } from '../../../src/init';

// 模拟依赖
jest.mock('../../../src/init');


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

describe('AdvertisementController', () => {
  let controller: AdvertisementController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    controller = new AdvertisementController();
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: { id: 1 }
    };
    mockNext = jest.fn();
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnThis();
    mockResponse = {
      json: jsonSpy,
      status: statusSpy
    };

    // 重置所有模拟
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建广告', async () => {
      const mockResult = [{ insertId: 1 }];

      (sequelize.query as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.body = {
        title: '测试广告',
        adType: 1,
        platform: 'web',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        budget: 10000,
        status: 1
      };

      await controller.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO advertisements'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            kindergartenId: 1,
            title: '测试广告',
            adType: 1,
            platform: 'web',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: 1,
            userId: 1
          }),
          type: 'INSERT'
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '创建广告成功',
        data: expect.objectContaining({
          id: 1,
          title: '测试广告',
          adType: 1,
          platform: 'web',
          status: 1
        })
      });
    });

    it('应该使用默认值创建广告', async () => {
      const mockResult = [{ insertId: 1 }];

      (sequelize.query as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.body = {
        title: '测试广告'
      };

      await controller.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO advertisements'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            kindergartenId: 1,
            title: '测试广告',
            adType: 1, // 默认值
            platform: undefined, // 未提供
            startDate: expect.any(String), // 默认今天
            endDate: expect.any(String), // 默认30天后
            status: 0 // 默认草稿状态
          })
        })
      );
    });

    it('应该处理type字段映射', async () => {
      const mockResult = [{ insertId: 1 }];

      (sequelize.query as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.body = {
        title: 'Banner广告',
        type: 'banner' // 应该映射为 AdvertisementType.BANNER
      };

      await controller.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO advertisements'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            title: 'Banner广告',
            adType: 4 // AdvertisementType.BANNER
          })
        })
      );
    });

    it('应该处理数据库错误', async () => {
      const mockError = new Error('数据库连接失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      mockRequest.body = {
        title: '测试广告'
      };

      await controller.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '创建广告失败',
        error: expect.any(String)
      });
    });
  });

  describe('findAll', () => {
    it('应该成功获取广告列表', async () => {
      const mockAdvertisements = [
        {
          id: 1,
          title: '广告1',
          ad_type: 1,
          platform: 'web',
          status: 1,
          created_at: '2024-01-01',
          kindergarten_name: '测试幼儿园'
        }
      ];

      const mockTotal = [{ total: 25 }];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockAdvertisements)
        .mockResolvedValueOnce(mockTotal);

      mockRequest.query = {
        page: '2',
        limit: '10'
      };

      await controller.findAll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledTimes(2);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '获取广告列表成功',
        data: {
          items: mockAdvertisements,
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3
        }
      });
    });

    it('应该使用默认分页参数', async () => {
      const mockAdvertisements = [];
      const mockTotal = [{ total: 5 }];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockAdvertisements)
        .mockResolvedValueOnce(mockTotal);

      mockRequest.query = {}; // 空查询参数

      await controller.findAll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '获取广告列表成功',
        data: {
          items: [],
          page: 1,
          limit: 10,
          total: 5,
          totalPages: 1
        }
      });
    });

    it('应该处理数据库错误', async () => {
      const mockError = new Error('查询失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      await controller.findAll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '获取广告列表失败'
      });
    });
  });

  describe('findOne', () => {
    it('应该成功获取单个广告详情', async () => {
      const mockAdvertisement = {
        id: 1,
        title: '测试广告',
        ad_type: 1,
        platform: 'web',
        status: 1,
        kindergarten_name: '测试幼儿园'
      };

      (sequelize.query as jest.Mock).mockResolvedValue([mockAdvertisement]);

      mockRequest.params = { id: '1' };

      await controller.findOne(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT a.*, k.name as kindergarten_name'),
        expect.objectContaining({
          replacements: { id: 1 },
          type: 'SELECT'
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '获取广告详情成功',
        data: mockAdvertisement
      });
    });

    it('应该处理广告不存在的情况', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([]);

      mockRequest.params = { id: '999' };

      await controller.findOne(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '广告不存在'
      });
    });
  });

  describe('update', () => {
    it('应该成功更新广告', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue({});

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        title: '更新的广告',
        adType: 2,
        platform: 'mobile',
        status: 1
      };

      await controller.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE advertisements'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            id: 1,
            title: '更新的广告',
            adType: 2,
            platform: 'mobile',
            status: 1,
            userId: 1
          })
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '更新广告成功',
        data: {
          id: 1,
          updateTime: expect.any(Date)
        }
      });
    });

    it('应该处理type字段映射', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue({});

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        type: 'banner' // 应该映射为 AdvertisementType.BANNER
      };

      await controller.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE advertisements'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            adType: 4 // AdvertisementType.BANNER
          })
        })
      );
    });

    it('应该处理status字段映射', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue({});

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        status: 'active' // 应该映射为 AdvertisementStatus.ACTIVE
      };

      await controller.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE advertisements'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            status: 1 // AdvertisementStatus.ACTIVE
          })
        })
      );
    });

    it('应该处理数据库错误', async () => {
      const mockError = new Error('更新失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      mockRequest.params = { id: '1' };
      mockRequest.body = { title: '更新的广告' };

      await controller.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '更新广告失败'
      });
    });
  });

  describe('delete', () => {
    it('应该成功删除广告', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue({});

      mockRequest.params = { id: '1' };

      await controller.delete(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE advertisements SET deleted_at = NOW()'),
        expect.objectContaining({
          replacements: { id: 1 },
          type: 'UPDATE'
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '删除广告成功',
        data: {
          id: 1
        }
      });
    });

    it('应该处理数据库错误', async () => {
      const mockError = new Error('删除失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      mockRequest.params = { id: '1' };

      await controller.delete(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '删除广告失败'
      });
    });
  });

  describe('getStatistics', () => {
    it('应该成功获取广告统计数据', async () => {
      const mockStats = [{
        impressions: 1000,
        clicks: 50,
        conversions: 5,
        spent: 500,
        budget: 1000,
        ctr: 5.0,
        conversion_rate: 10.0,
        cost_per_click: 10.0,
        cost_per_conversion: 100.0
      }];

      (sequelize.query as jest.Mock).mockResolvedValue(mockStats);

      mockRequest.params = { id: '1' };

      await controller.getStatistics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT impressions, clicks, conversions'),
        expect.objectContaining({
          replacements: { id: 1 },
          type: 'SELECT'
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '获取广告统计数据成功',
        data: mockStats[0]
      });
    });

    it('应该处理广告不存在的情况', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([]);

      mockRequest.params = { id: '999' };

      await controller.getStatistics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '广告不存在'
      });
    });
  });

  describe('getAllStatistics', () => {
    it('应该成功获取全部广告统计数据', async () => {
      const mockStats = [{
        total_ads: 10,
        total_impressions: 10000,
        total_clicks: 500,
        total_conversions: 50,
        total_spent: 5000,
        total_budget: 10000,
        avg_ctr: 5.0,
        avg_conversion_rate: 10.0,
        avg_cost_per_click: 10.0,
        avg_cost_per_conversion: 100.0
      }];

      (sequelize.query as jest.Mock).mockResolvedValue(mockStats);

      await controller.getAllStatistics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as total_ads'),
        { type: 'SELECT' }
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '获取全部广告统计数据成功',
        data: mockStats[0]
      });
    });
  });

  describe('findByType', () => {
    it('应该成功按类型获取广告', async () => {
      const mockAdvertisements = [
        {
          id: 1,
          title: 'Banner广告',
          ad_type: 4,
          platform: 'web',
          kindergarten_name: '测试幼儿园'
        }
      ];

      (sequelize.query as jest.Mock).mockResolvedValue(mockAdvertisements);

      mockRequest.params = { type: 'banner' };

      await controller.findByType(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE a.ad_type = :type'),
        expect.objectContaining({
          replacements: { type: 4 }, // AdvertisementType.BANNER
          type: 'SELECT'
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '按类型获取广告成功',
        data: {
          type: 'banner',
          items: mockAdvertisements,
          total: 1
        }
      });
    });

    it('应该处理数字类型', async () => {
      const mockAdvertisements = [];

      (sequelize.query as jest.Mock).mockResolvedValue(mockAdvertisements);

      mockRequest.params = { type: '1' };

      await controller.findByType(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE a.ad_type = :type'),
        expect.objectContaining({
          replacements: { type: 1 },
          type: 'SELECT'
        })
      );
    });
  });

  describe('findByStatus', () => {
    it('应该成功按状态获取广告', async () => {
      const mockAdvertisements = [
        {
          id: 1,
          title: '活跃广告',
          ad_type: 1,
          status: 1,
          kindergarten_name: '测试幼儿园'
        }
      ];

      (sequelize.query as jest.Mock).mockResolvedValue(mockAdvertisements);

      mockRequest.params = { status: 'active' };

      await controller.findByStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE a.status = :status'),
        expect.objectContaining({
          replacements: { status: 1 }, // AdvertisementStatus.ACTIVE
          type: 'SELECT'
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '按状态获取广告成功',
        data: {
          status: 'active',
          items: mockAdvertisements,
          total: 1
        }
      });
    });

    it('应该处理banner状态重定向', async () => {
      // 模拟findByType方法
      const originalFindByType = controller.findByType;
      controller.findByType = jest.fn();

      mockRequest.params = { status: 'banner' };

      await controller.findByStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(controller.findByType).toHaveBeenCalledWith(
        mockRequest,
        mockResponse
      );

      // 恢复原始方法
      controller.findByType = originalFindByType;
    });
  });

  describe('pauseAdvertisement', () => {
    it('应该成功暂停广告', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue({});

      mockRequest.params = { id: '1' };

      await controller.pauseAdvertisement(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE advertisements SET status = :pausedStatus'),
        expect.objectContaining({
          replacements: { 
            id: 1, 
            pausedStatus: 2 // AdvertisementStatus.PAUSED
          },
          type: 'UPDATE'
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '暂停广告成功',
        data: {
          id: 1,
          status: 2
        }
      });
    });
  });

  describe('resumeAdvertisement', () => {
    it('应该成功恢复广告', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue({});

      mockRequest.params = { id: '1' };

      await controller.resumeAdvertisement(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE advertisements SET status = :activeStatus'),
        expect.objectContaining({
          replacements: { 
            id: 1, 
            activeStatus: 1 // AdvertisementStatus.ACTIVE
          },
          type: 'UPDATE'
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '恢复广告成功',
        data: {
          id: 1,
          status: 1
        }
      });
    });
  });
});