/**
 * 录取结果控制器测试
 */

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import * as admissionResultController from '../../../src/controllers/admission-result.controller';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { sequelize } from '../../../src/init';

// 模拟依赖
jest.mock('../../../src/init');
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/utils/apiError');


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

describe('AdmissionResultController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
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

  describe('getResults', () => {
    it('应该成功获取录取结果列表', async () => {
      const mockCount = [{ total: 25 }];
      const mockResults = [
        {
          id: 1,
          application_id: 1,
          student_id: 1,
          kindergarten_id: 1,
          result_type: 1,
          class_id: 1,
          class_name: '小班',
          creator_name: '管理员',
          created_at: '2024-01-01'
        }
      ];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockCount)
        .mockResolvedValueOnce(mockResults);

      mockRequest.query = {
        page: '1',
        pageSize: '10',
        resultType: '1',
        studentId: '1'
      };

      await admissionResultController.getResults(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledTimes(2);
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        {
          items: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              applicationId: 1,
              studentId: 1,
              resultType: 1,
              class: {
                id: 1,
                name: '小班'
              }
            })
          ]),
          total: 25,
          page: 1,
          pageSize: 10,
          totalPages: 3
        },
        '获取录取结果列表成功'
      );
    });

    it('应该使用默认分页参数', async () => {
      const mockCount = [{ total: 5 }];
      const mockResults = [];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockCount)
        .mockResolvedValueOnce(mockResults);

      mockRequest.query = {}; // 空查询参数

      await admissionResultController.getResults(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        {
          items: [],
          total: 5,
          page: 1,
          pageSize: 10,
          totalPages: 1
        },
        '获取录取结果列表成功'
      );
    });

    it('应该处理size参数别名', async () => {
      const mockCount = [{ total: 20 }];
      const mockResults = [];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockCount)
        .mockResolvedValueOnce(mockResults);

      mockRequest.query = {
        page: '1',
        size: '20' // 使用size而不是pageSize
      };

      await admissionResultController.getResults(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        {
          items: [],
          total: 20,
          page: 1,
          pageSize: 20,
          totalPages: 1
        },
        '获取录取结果列表成功'
      );
    });

    it('应该处理数据库错误', async () => {
      const mockError = new Error('查询失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      await admissionResultController.getResults(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getResultById', () => {
    it('应该成功获取录取结果详情', async () => {
      const mockResult = [{
        id: 1,
        application_id: 1,
        student_id: 1,
        kindergarten_id: 1,
        result_type: 1,
        class_id: 1,
        class_name: '小班',
        creator_name: '管理员',
        created_at: '2024-01-01'
      }];

      (sequelize.query as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.params = { id: '1' };

      await admissionResultController.getResultById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT ar.*, c.name as class_name'),
        expect.objectContaining({
          replacements: { id: '1' },
          type: 'SELECT'
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          id: 1,
          applicationId: 1,
          studentId: 1,
          resultType: 1,
          class: {
            id: 1,
            name: '小班'
          }
        }),
        '获取录取结果详情成功'
      );
    });

    it('应该处理录取结果不存在的情况（返回默认数据）', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([]);

      mockRequest.params = { id: '999' };

      await admissionResultController.getResultById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          id: 999,
          applicationId: 1,
          studentId: 1,
          resultType: 'pending',
          comment: '默认录取结果'
        }),
        '获取录取结果详情成功（默认数据）'
      );
    });

    it('应该处理数据库查询错误', async () => {
      const mockError = new Error('查询失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      mockRequest.params = { id: '1' };

      await admissionResultController.getResultById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('createResult', () => {
    it('应该成功创建录取结果', async () => {
      const mockResult = [1]; // 插入ID

      (sequelize.query as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.body = {
        applicationId: 1,
        studentId: 1,
        kindergartenId: 1,
        status: 'accepted',
        classId: 1,
        admitDate: '2024-01-01',
        enrollmentDate: '2024-02-01',
        tuitionFee: 5000,
        paymentStatus: 'paid',
        reason: '符合录取条件'
      };

      await admissionResultController.createResult(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO admission_results'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            applicationId: 1,
            studentId: 1,
            kindergartenId: 1,
            resultType: 1, // accepted -> 1
            classId: 1,
            admitDate: '2024-01-01',
            enrollmentDate: '2024-02-01',
            tuitionFee: 5000,
            paymentStatus: 'paid',
            comment: '符合录取条件',
            creatorId: 1,
            updaterId: 1
          }),
          type: 'INSERT'
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        { id: 1 },
        '创建录取结果成功'
      );
    });

    it('应该使用默认值创建录取结果', async () => {
      const mockResult = [1];

      (sequelize.query as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.body = {}; // 空请求体

      await admissionResultController.createResult(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO admission_results'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            applicationId: 1,
            studentId: 1,
            kindergartenId: 1,
            resultType: 1 // 默认值
          })
        })
      );
    });

    it('应该正确映射状态字段', async () => {
      const mockResult = [1];

      (sequelize.query as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.body = {
        applicationId: 1,
        studentId: 1,
        status: 'rejected' // 应该映射为 2
      };

      await admissionResultController.createResult(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO admission_results'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            resultType: 2 // rejected -> 2
          })
        })
      );
    });

    it('应该处理用户未登录的情况', async () => {
      mockRequest.user = undefined;

      await admissionResultController.createResult(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '未登录或登录已过期',
        error: { code: 'UNAUTHORIZED', message: '未登录或登录已过期' }
      });
    });

    it('应该处理数据库错误', async () => {
      const mockError = new Error('创建失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      mockRequest.body = {
        applicationId: 1,
        studentId: 1
      };

      await admissionResultController.createResult(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updateResult', () => {
    it('应该成功更新录取结果', async () => {
      const existingResult = [{ id: 1 }];

      (sequelize.query as jest.Mock).mockResolvedValue(existingResult);

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        status: 'accepted',
        classId: 2,
        reason: '更新后的原因'
      };

      await admissionResultController.updateResult(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE admission_results'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            id: '1',
            classId: 2,
            resultType: 1, // accepted -> 1
            comment: '更新后的原因',
            updaterId: 1
          })
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        { id: '1' },
        '更新录取结果成功'
      );
    });

    it('应该处理录取结果不存在的情况', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([]);

      mockRequest.params = { id: '999' };
      mockRequest.body = { status: 'accepted' };

      await admissionResultController.updateResult(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        { id: '999' },
        '更新录取结果成功（记录不存在）'
      );
    });

    it('应该处理没有更新字段的情况', async () => {
      const existingResult = [{ id: 1 }];

      (sequelize.query as jest.Mock).mockResolvedValue(existingResult);

      mockRequest.params = { id: '1' };
      mockRequest.body = {}; // 空更新

      await admissionResultController.updateResult(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '没有提供要更新的字段',
        error: { code: 'VALIDATION_ERROR', message: '没有提供要更新的字段' }
      });
    });

    it('应该正确映射状态字段', async () => {
      const existingResult = [{ id: 1 }];

      (sequelize.query as jest.Mock).mockResolvedValue(existingResult);

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        status: 'pending' // 应该映射为 0
      };

      await admissionResultController.updateResult(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE admission_results'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            resultType: 0 // pending -> 0
          })
        })
      );
    });

    it('应该处理用户未登录的情况', async () => {
      mockRequest.user = undefined;

      await admissionResultController.updateResult(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '未登录或登录已过期',
        error: { code: 'UNAUTHORIZED', message: '未登录或登录已过期' }
      });
    });
  });

  describe('deleteResult', () => {
    it('应该成功删除录取结果', async () => {
      const existingResult = [{ id: 1 }];

      (sequelize.query as jest.Mock).mockResolvedValue(existingResult);

      mockRequest.params = { id: '1' };

      await admissionResultController.deleteResult(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE admission_results SET deleted_at = NOW()'),
        expect.objectContaining({
          replacements: { id: '1', updaterId: 1 },
          type: 'UPDATE'
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        null,
        '删除录取结果成功'
      );
    });

    it('应该处理录取结果不存在的情况（幂等操作）', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([]);

      mockRequest.params = { id: '999' };

      await admissionResultController.deleteResult(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        null,
        '录取结果已删除或不存在'
      );
    });

    it('应该处理用户未登录的情况', async () => {
      mockRequest.user = undefined;

      await admissionResultController.deleteResult(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '未登录或登录已过期',
        error: { code: 'UNAUTHORIZED', message: '未登录或登录已过期' }
      });
    });
  });

  describe('getResultsByApplication', () => {
    it('应该成功按申请获取录取结果', async () => {
      const mockResults = [{
        id: 1,
        application_id: 1,
        student_id: 1,
        result_type: 1,
        class_name: '小班',
        creator_name: '管理员'
      }];

      (sequelize.query as jest.Mock).mockResolvedValue(mockResults);

      mockRequest.params = { applicationId: '1' };

      await admissionResultController.getResultsByApplication(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE ar.application_id = :applicationId'),
        expect.objectContaining({
          replacements: { applicationId: '1' },
          type: 'SELECT'
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.arrayContaining([
          expect.objectContaining({
            applicationId: 1,
            resultType: 1,
            class: {
              id: 1,
              name: '小班'
            }
          })
        ]),
        '按申请获取录取结果成功'
      );
    });
  });

  describe('getResultsByClass', () => {
    it('应该成功按班级获取录取结果', async () => {
      const mockResults = [{
        id: 1,
        application_id: 1,
        student_id: 1,
        result_type: 1,
        class_name: '小班',
        creator_name: '管理员'
      }];

      (sequelize.query as jest.Mock).mockResolvedValue(mockResults);

      mockRequest.params = { classId: '1' };

      await admissionResultController.getResultsByClass(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE ar.class_id = :classId'),
        expect.objectContaining({
          replacements: { classId: '1' },
          type: 'SELECT'
        })
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.arrayContaining([
          expect.objectContaining({
            classId: 1,
            resultType: 1,
            class: {
              id: 1,
              name: '小班'
            }
          })
        ]),
        '按班级获取录取结果成功'
      );
    });
  });

  describe('getStatistics', () => {
    it('应该成功获取录取统计数据', async () => {
      const mockStats = [{
        total: 100,
        accepted: 80,
        rejected: 15,
        pending: 5,
        paid: 70,
        unpaid: 30,
        avgTuitionFee: 4500.50
      }];

      (sequelize.query as jest.Mock).mockResolvedValue(mockStats);

      await admissionResultController.getStatistics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as total'),
        { type: 'SELECT' }
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        {
          total: 100,
          accepted: 80,
          rejected: 15,
          pending: 5,
          paid: 70,
          unpaid: 30,
          avgTuitionFee: 4500.50
        },
        '获取录取统计数据成功'
      );
    });

    it('应该处理统计数据为空的情况', async () => {
      const mockStats = [{}];

      (sequelize.query as jest.Mock).mockResolvedValue(mockStats);

      await admissionResultController.getStatistics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        {
          total: 0,
          accepted: 0,
          rejected: 0,
          pending: 0,
          paid: 0,
          unpaid: 0,
          avgTuitionFee: 0
        },
        '获取录取统计数据成功'
      );
    });
  });
});