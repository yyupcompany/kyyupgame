// Mock dependencies
jest.mock('../../../src/init');

import { Response } from 'express';
import { vi } from 'vitest'
import { QuotasController } from '../../../src/controllers/quotas.controller';
import { RequestWithUser } from '../../../src/types/express';
import { sequelize } from '../../../src/init';
import { QueryTypes } from 'sequelize';

// Mock implementations
const mockSequelize = {
  query: jest.fn(),
  transaction: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: { id: 1, username: 'testuser' }
} as Partial<RequestWithUser>);

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

describe('Quotas Controller', () => {
  let quotasController: QuotasController;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    quotasController = new QuotasController();
  });

  describe('getQuotas', () => {
    it('应该成功获取配额列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        year: '2024',
        classId: '1'
      };

      const mockQuotas = [
        {
          id: 1,
          enrollmentYear: 2024,
          totalQuota: 30,
          usedQuota: 25,
          remainingQuota: 5,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          className: 'A班',
          gradeLevel: '大班',
          capacity: 30,
          acceptedApplications: 25
        },
        {
          id: 2,
          enrollmentYear: 2024,
          totalQuota: 28,
          usedQuota: 20,
          remainingQuota: 8,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          className: 'B班',
          gradeLevel: '中班',
          capacity: 28,
          acceptedApplications: 20
        }
      ];

      mockSequelize.query.mockResolvedValue([mockQuotas]);

      await quotasController.getQuotas(req as RequestWithUser, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        { type: QueryTypes.SELECT }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '获取配额列表成功',
        data: {
          quotas: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              enrollmentYear: 2024,
              totalQuota: 30,
              usedQuota: 25,
              remainingQuota: 5,
              status: 'active'
            })
          ]),
          summary: expect.objectContaining({
            totalQuotas: expect.any(Number),
            totalUsed: expect.any(Number),
            totalRemaining: expect.any(Number)
          })
        }
      });
    });

    it('应该使用当前年份作为默认值', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const currentYear = new Date().getFullYear();
      const mockEmptyQuotas = [];

      mockSequelize.query.mockResolvedValue([mockEmptyQuotas]);

      await quotasController.getQuotas(req as RequestWithUser, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining(`enrollment_year = ${currentYear}`),
        { type: QueryTypes.SELECT }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '获取配额列表成功',
        data: {
          quotas: [],
          summary: expect.objectContaining({
            totalQuotas: 0,
            totalUsed: 0,
            totalRemaining: 0
          })
        }
      });
    });

    it('应该处理数据库查询失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const dbError = new Error('Database connection failed');
      mockSequelize.query.mockRejectedValue(dbError);

      await quotasController.getQuotas(req as RequestWithUser, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '获取配额列表失败',
        error: 'Database connection failed'
      });
    });

    it('应该处理空结果', async () => {
      const req = mockRequest();
      const res = mockResponse();

      mockSequelize.query.mockResolvedValue([null]);

      await quotasController.getQuotas(req as RequestWithUser, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '获取配额列表成功',
        data: {
          quotas: [],
          summary: expect.objectContaining({
            totalQuotas: 0,
            totalUsed: 0,
            totalRemaining: 0
          })
        }
      });
    });

    it('应该正确处理单个结果对象', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const singleQuota = {
        id: 1,
        enrollmentYear: 2024,
        totalQuota: 30,
        usedQuota: 25,
        remainingQuota: 5,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        className: 'A班',
        gradeLevel: '大班',
        capacity: 30,
        acceptedApplications: 25
      };

      // 模拟返回单个对象而不是数组
      mockSequelize.query.mockResolvedValue([singleQuota]);

      await quotasController.getQuotas(req as RequestWithUser, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '获取配额列表成功',
        data: {
          quotas: [expect.objectContaining({
            id: 1,
            enrollmentYear: 2024,
            totalQuota: 30
          })],
          summary: expect.objectContaining({
            totalQuotas: 30,
            totalUsed: 25,
            totalRemaining: 5
          })
        }
      });
    });
  });

  describe('createQuota', () => {
    it('应该成功创建配额', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        classId: 1,
        enrollmentYear: 2024,
        totalQuota: 30,
        status: 'active'
      };

      const mockCreatedQuota = {
        id: 3,
        classId: 1,
        enrollmentYear: 2024,
        totalQuota: 30,
        usedQuota: 0,
        remainingQuota: 30,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockSequelize.query.mockResolvedValue([[mockCreatedQuota]]);

      await quotasController.createQuota(req as RequestWithUser, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO enrollment_quotas'),
        expect.objectContaining({
          type: QueryTypes.INSERT,
          transaction: mockTransaction
        })
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '配额创建成功',
        data: expect.objectContaining({
          id: expect.any(Number),
          totalQuota: 30,
          usedQuota: 0,
          remainingQuota: 30
        })
      });
    });

    it('应该验证必填字段', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        // 缺少必填字段
        enrollmentYear: 2024
      };

      await quotasController.createQuota(req as RequestWithUser, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '缺少必填字段：classId, totalQuota'
      });
    });

    it('应该处理重复配额创建', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        classId: 1,
        enrollmentYear: 2024,
        totalQuota: 30
      };

      const duplicateError = new Error('该班级在指定年份已存在配额');
      mockSequelize.query.mockRejectedValue(duplicateError);

      await quotasController.createQuota(req as RequestWithUser, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '该班级在指定年份已存在配额'
      });
    });

    it('应该处理创建失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        classId: 1,
        enrollmentYear: 2024,
        totalQuota: 30
      };

      const createError = new Error('Database insert failed');
      mockSequelize.query.mockRejectedValue(createError);

      await quotasController.createQuota(req as RequestWithUser, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '配额创建失败',
        error: 'Database insert failed'
      });
    });
  });

  describe('updateQuota', () => {
    it('应该成功更新配额', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        totalQuota: 35,
        status: 'active'
      };

      const mockExistingQuota = [{
        id: 1,
        totalQuota: 30,
        usedQuota: 25,
        status: 'active'
      }];

      const mockUpdatedQuota = {
        id: 1,
        totalQuota: 35,
        usedQuota: 25,
        remainingQuota: 10,
        status: 'active',
        updatedAt: new Date()
      };

      mockSequelize.query
        .mockResolvedValueOnce([mockExistingQuota]) // 检查配额是否存在
        .mockResolvedValueOnce([[1]]) // 更新操作
        .mockResolvedValueOnce([[mockUpdatedQuota]]); // 获取更新后的数据

      await quotasController.updateQuota(req as RequestWithUser, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE enrollment_quotas SET'),
        expect.objectContaining({
          type: QueryTypes.UPDATE,
          transaction: mockTransaction
        })
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '配额更新成功',
        data: expect.objectContaining({
          id: 1,
          totalQuota: 35,
          remainingQuota: 10
        })
      });
    });

    it('应该处理更新不存在的配额', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };
      req.body = { totalQuota: 35 };

      mockSequelize.query.mockResolvedValue([[]]); // 配额不存在

      await quotasController.updateQuota(req as RequestWithUser, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '配额不存在'
      });
    });

    it('应该验证配额更新逻辑', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        totalQuota: 20 // 小于已使用的配额
      };

      const mockExistingQuota = [{
        id: 1,
        totalQuota: 30,
        usedQuota: 25,
        status: 'active'
      }];

      mockSequelize.query.mockResolvedValue([mockExistingQuota]);

      await quotasController.updateQuota(req as RequestWithUser, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '总配额不能小于已使用的配额数量'
      });
    });

    it('应该处理更新失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { totalQuota: 35 };

      const updateError = new Error('Database update failed');
      mockSequelize.query.mockRejectedValue(updateError);

      await quotasController.updateQuota(req as RequestWithUser, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '配额更新失败',
        error: 'Database update failed'
      });
    });
  });

  describe('deleteQuota', () => {
    it('应该成功删除配额', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockExistingQuota = [{
        id: 1,
        usedQuota: 0,
        status: 'draft'
      }];

      mockSequelize.query
        .mockResolvedValueOnce([mockExistingQuota]) // 检查配额是否存在
        .mockResolvedValueOnce([[1]]); // 删除操作

      await quotasController.deleteQuota(req as RequestWithUser, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE enrollment_quotas SET deleted_at'),
        expect.objectContaining({
          type: QueryTypes.UPDATE,
          transaction: mockTransaction
        })
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '配额删除成功'
      });
    });

    it('应该处理删除不存在的配额', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockSequelize.query.mockResolvedValue([[]]); // 配额不存在

      await quotasController.deleteQuota(req as RequestWithUser, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '配额不存在'
      });
    });

    it('应该阻止删除已使用的配额', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockUsedQuota = [{
        id: 1,
        usedQuota: 10,
        status: 'active'
      }];

      mockSequelize.query.mockResolvedValue([mockUsedQuota]);

      await quotasController.deleteQuota(req as RequestWithUser, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '已使用的配额无法删除'
      });
    });

    it('应该处理删除失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const deleteError = new Error('Database delete failed');
      mockSequelize.query.mockRejectedValue(deleteError);

      await quotasController.deleteQuota(req as RequestWithUser, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '配额删除失败',
        error: 'Database delete failed'
      });
    });
  });

  describe('getQuotaStatistics', () => {
    it('应该成功获取配额统计信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        year: '2024'
      };

      const mockStatistics = {
        overview: {
          totalQuotas: 150,
          totalUsed: 120,
          totalRemaining: 30,
          utilizationRate: 0.8
        },
        byGrade: [
          { gradeLevel: '小班', totalQuotas: 60, usedQuotas: 50, remainingQuotas: 10 },
          { gradeLevel: '中班', totalQuotas: 50, usedQuotas: 40, remainingQuotas: 10 },
          { gradeLevel: '大班', totalQuotas: 40, usedQuotas: 30, remainingQuotas: 10 }
        ],
        byClass: [
          { className: 'A班', totalQuota: 30, usedQuota: 25, remainingQuota: 5 },
          { className: 'B班', totalQuota: 28, usedQuota: 20, remainingQuota: 8 }
        ],
        trends: {
          monthlyEnrollment: [
            { month: '2024-01', enrolled: 15 },
            { month: '2024-02', enrolled: 20 },
            { month: '2024-03', enrolled: 25 }
          ]
        }
      };

      mockSequelize.query.mockResolvedValue([mockStatistics]);

      await quotasController.getQuotaStatistics(req as RequestWithUser, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        { type: QueryTypes.SELECT }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '获取配额统计成功',
        data: expect.objectContaining({
          overview: expect.objectContaining({
            totalQuotas: expect.any(Number),
            utilizationRate: expect.any(Number)
          })
        })
      });
    });

    it('应该处理获取统计失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const statsError = new Error('Statistics query failed');
      mockSequelize.query.mockRejectedValue(statsError);

      await quotasController.getQuotaStatistics(req as RequestWithUser, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '获取配额统计失败',
        error: 'Statistics query failed'
      });
    });
  });
});
