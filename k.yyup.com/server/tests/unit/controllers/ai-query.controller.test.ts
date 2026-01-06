/**
 * AI查询控制器测试
 */

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { AIQueryController } from '../../../src/controllers/ai-query.controller';
import { ApiResponse } from '../../../src/utils/apiResponse';
import TextModelService from '../../../src/services/ai/text-model.service';
import AIModelCacheService from '../../../src/services/ai-model-cache.service';
import AIQueryCacheService from '../../../src/services/ai-query-cache.service';
import { sequelize } from '../../../src/init';

// 模拟依赖
jest.mock('../../../src/services/ai/text-model.service');
jest.mock('../../../src/services/ai-model-cache.service');
jest.mock('../../../src/services/ai-query-cache.service');
jest.mock('../../../src/init');
jest.mock('../../../src/utils/apiResponse');


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

describe('AIQueryController', () => {
  let controller: AIQueryController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    controller = new AIQueryController();
    mockRequest = {
      body: {},
      user: { id: 1, role: 'admin' }
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

  describe('executeQuery', () => {
    it('应该成功执行AI查询 - 命中缓存', async () => {
      const cachedResult = {
        type: 'data_query',
        data: [{ id: 1, name: '测试数据' }],
        metadata: { totalRows: 1, executionTime: 100 }
      };

      mockRequest.body = {
        message: '查询学生信息',
        sessionId: 'test-session'
      };

      (AIQueryCacheService.getCachedResult as jest.Mock).mockResolvedValue(cachedResult);

      await controller.executeQuery(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(AIQueryCacheService.getCachedResult).toHaveBeenCalledWith('查询学生信息', 1);
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        cachedResult,
        '查询成功（来自缓存）'
      );
    });

    it('应该成功执行AI查询 - 数据库查询', async () => {
      const mockAvailableModels = [
        { id: 1, name: 'Doubao-lite-32k', isActive: true }
      ];

      const mockQueryAnalysis = {
        isDataQuery: true,
        queryType: '学生查询',
        confidence: 0.8,
        requiredTables: ['students'],
        explanation: '查询学生信息',
        keywords: ['学生']
      };

      const mockTableStructures = '表结构信息';
      const mockGeneratedSQL = 'SELECT * FROM students';
      const mockQueryResults = [{ id: 1, name: '张三' }];
      const mockVisualization = { type: 'table', config: {} };

      mockRequest.body = {
        message: '查询所有学生'
      };

      // 模拟各个步骤的返回值
      (AIQueryCacheService.getCachedResult as jest.Mock).mockResolvedValue(null);
      (AIModelCacheService.getAvailableModels as jest.Mock).mockResolvedValue(mockAvailableModels);
      (AIModelCacheService.getIntentAnalysisModel as jest.Mock).mockResolvedValue(mockAvailableModels[0]);
      (controller as any).analyzeQueryIntentAndSelectTables = jest.fn().mockResolvedValue(mockQueryAnalysis);
      (controller as any).getRelevantTableStructures = jest.fn().mockResolvedValue(mockTableStructures);
      (AIModelCacheService.getDatabaseQueryModel as jest.Mock).mockResolvedValue(mockAvailableModels[0]);
      (controller as any).generateOptimizedSQL = jest.fn().mockResolvedValue(mockGeneratedSQL);
      (controller as any).executeSQL = jest.fn().mockResolvedValue(mockQueryResults);
      (controller as any).generateIntelligentVisualization = jest.fn().mockResolvedValue(mockVisualization);
      (AIQueryCacheService.saveQueryResult as jest.Mock).mockResolvedValue(undefined);

      await controller.executeQuery(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(AIQueryCacheService.getCachedResult).toHaveBeenCalledWith('查询所有学生', 1);
      expect(AIModelCacheService.getAvailableModels).toHaveBeenCalled();
      expect((controller as any).analyzeQueryIntentAndSelectTables).toHaveBeenCalledWith(
        '查询所有学生',
        expect.any(Array),
        mockAvailableModels[0]
      );
      expect((controller as any).executeSQL).toHaveBeenCalledWith(mockGeneratedSQL);
      expect(AIQueryCacheService.saveQueryResult).toHaveBeenCalled();
    });

    it('应该处理非数据库查询', async () => {
      const mockAvailableModels = [
        { id: 1, name: 'Doubao-pro-128k', isActive: true }
      ];

      const mockQueryAnalysis = {
        isDataQuery: false,
        queryType: '非数据查询',
        confidence: 0.9,
        requiredTables: [],
        explanation: '一般性问题',
        keywords: ['你好']
      };

      mockRequest.body = {
        message: '你好'
      };

      (AIQueryCacheService.getCachedResult as jest.Mock).mockResolvedValue(null);
      (AIModelCacheService.getAvailableModels as jest.Mock).mockResolvedValue(mockAvailableModels);
      (AIModelCacheService.getIntentAnalysisModel as jest.Mock).mockResolvedValue(mockAvailableModels[0]);
      (controller as any).analyzeQueryIntentAndSelectTables = jest.fn().mockResolvedValue(mockQueryAnalysis);
      (TextModelService.generateText as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: '你好！我是AI助手。' } }]
      });
      (AIQueryCacheService.saveQueryResult as jest.Mock).mockResolvedValue(undefined);

      await controller.executeQuery(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(TextModelService.generateText).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          model: expect.stringContaining('128k'),
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('AI助手')
            }),
            expect.objectContaining({
              role: 'user',
              content: '你好'
            })
          ])
        })
      );
    });

    it('应该验证查询参数', async () => {
      mockRequest.body = {
        message: '',
        query: ''
      };

      await controller.executeQuery(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          message: '查询内容不能为空'
        })
      );
    });

    it('应该处理查询内容过长的情况', async () => {
      const longQuery = 'a'.repeat(1001);
      mockRequest.body = {
        message: longQuery
      };

      await controller.executeQuery(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          message: '查询内容过长，请控制在1000字符以内'
        })
      );
    });

    it('应该处理SQL执行错误', async () => {
      const mockAvailableModels = [{ id: 1, name: 'test-model', isActive: true }];
      const mockQueryAnalysis = {
        isDataQuery: true,
        queryType: '学生查询',
        confidence: 0.8,
        requiredTables: ['students']
      };

      mockRequest.body = {
        message: '查询学生'
      };

      (AIQueryCacheService.getCachedResult as jest.Mock).mockResolvedValue(null);
      (AIModelCacheService.getAvailableModels as jest.Mock).mockResolvedValue(mockAvailableModels);
      (AIModelCacheService.getIntentAnalysisModel as jest.Mock).mockResolvedValue(mockAvailableModels[0]);
      (controller as any).analyzeQueryIntentAndSelectTables = jest.fn().mockResolvedValue(mockQueryAnalysis);
      (controller as any).getRelevantTableStructures = jest.fn().mockResolvedValue('表结构');
      (AIModelCacheService.getDatabaseQueryModel as jest.Mock).mockResolvedValue(mockAvailableModels[0]);
      (controller as any).generateOptimizedSQL = jest.fn().mockResolvedValue('SELECT * FROM students');
      (controller as any).executeSQL = jest.fn().mockRejectedValue(new Error('数据库查询执行失败'));

      await controller.executeQuery(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('数据库查询失败')
        })
      );
    });
  });

  describe('getQueryHistory', () => {
    it('应该成功获取查询历史', async () => {
      const mockHistory = {
        list: [
          {
            id: 1,
            query: '查询学生',
            type: 'data_query',
            createdAt: '2024-01-01'
          }
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1
        }
      };

      mockRequest.query = {
        page: '1',
        pageSize: '20'
      };

      (AIQueryCacheService.getUserQueryHistory as jest.Mock).mockResolvedValue(mockHistory);

      await controller.getQueryHistory(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(AIQueryCacheService.getUserQueryHistory).toHaveBeenCalledWith(1, 1, 20, undefined);
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        mockHistory,
        '获取查询历史成功'
      );
    });

    it('应该处理分页参数', async () => {
      mockRequest.query = {
        page: '2',
        pageSize: '10',
        queryType: 'data_query'
      };

      (AIQueryCacheService.getUserQueryHistory as jest.Mock).mockResolvedValue({
        list: [],
        pagination: { page: 2, pageSize: 10, total: 0, totalPages: 0 }
      });

      await controller.getQueryHistory(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(AIQueryCacheService.getUserQueryHistory).toHaveBeenCalledWith(1, 2, 10, 'data_query');
    });
  });

  describe('getQueryDetail', () => {
    it('应该成功获取查询详情', async () => {
      const mockDetail = {
        id: 1,
        query: '查询学生',
        type: 'data_query',
        result: { data: [{ id: 1, name: '张三' }] }
      };

      mockRequest.params = {
        id: '1'
      };

      (AIQueryCacheService.getQueryDetail as jest.Mock).mockResolvedValue(mockDetail);

      await controller.getQueryDetail(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(AIQueryCacheService.getQueryDetail).toHaveBeenCalledWith(1, 1);
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        mockDetail,
        '获取查询详情成功'
      );
    });

    it('应该处理查询不存在的情况', async () => {
      mockRequest.params = {
        id: '999'
      };

      (AIQueryCacheService.getQueryDetail as jest.Mock).mockResolvedValue(null);

      await controller.getQueryDetail(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          message: '查询记录不存在'
        })
      );
    });

    it('应该验证ID参数', async () => {
      mockRequest.params = {};

      await controller.getQueryDetail(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          success: false,
          message: '查询ID不能为空'
        })
      );
    });
  });

  describe('getStatistics', () => {
    it('应该成功获取查询统计', async () => {
      const mockStats = {
        totalQueries: 100,
        dataQueries: 80,
        aiResponses: 20,
        averageResponseTime: 500
      };

      (AIQueryCacheService.getCacheStats as jest.Mock).mockResolvedValue(mockStats);

      await controller.getStatistics(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(AIQueryCacheService.getCacheStats).toHaveBeenCalledWith(1);
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        mockStats,
        '获取查询统计成功'
      );
    });
  });

  describe('cleanupCache', () => {
    it('应该成功清理缓存', async () => {
      const mockResult = { deletedCount: 50 };

      (AIQueryCacheService.cleanupExpiredCache as jest.Mock).mockResolvedValue(mockResult.deletedCount);

      await controller.cleanupCache(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(AIQueryCacheService.cleanupExpiredCache).toHaveBeenCalled();
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        mockResult,
        '成功清理50条过期记录'
      );
    });
  });

  describe('辅助方法', () => {
    it('应该正确获取允许的表', () => {
      const adminTables = (controller as any).getAllowedTables('admin');
      expect(adminTables).toContain('*');

      const teacherTables = (controller as any).getAllowedTables('teacher');
      expect(teacherTables).toContain('students');
      expect(teacherTables).toContain('activities');

      const parentTables = (controller as any).getAllowedTables('parent');
      expect(parentTables).toContain('students');
      expect(parentTables).toContain('activities');
    });

    it('应该正确推断列类型', () => {
      expect((controller as any).inferColumnType(123)).toBe('number');
      expect((controller as any).inferColumnType('2024-01-01')).toBe('date');
      expect((controller as any).inferColumnType(true)).toBe('boolean');
      expect((controller as any).inferColumnType('text')).toBe('string');
    });

    it('应该正确生成列标签', () => {
      expect((controller as any).generateColumnLabel('created_at')).toBe('创建时间');
      expect((controller as any).generateColumnLabel('student_name')).toBe('学生姓名');
      expect((controller as any).generateColumnLabel('unknown_field')).toBe('unknown_field');
    });
  });
});