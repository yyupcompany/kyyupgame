/**
 * AI统计控制器测试
 */

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { aiStatsController } from '../../../src/controllers/ai-stats.controller';
import { sequelize } from '../../../src/config/database';

// 模拟依赖
jest.mock('../../../src/config/database');


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

describe('AIStatsController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    jsonSpy = jest.fn();
    mockResponse = {
      json: jsonSpy
    };

    // 重置所有模拟
    jest.clearAllMocks();
  });

  describe('getOverviewStats', () => {
    it('应该在Sequelize不可用时返回模拟数据', async () => {
      // 模拟Sequelize不可用
      (sequelize as any) = null;

      await aiStatsController.getOverviewStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            key: 'activeModels',
            title: '活跃AI模型',
            value: 8,
            type: 'primary'
          }),
          expect.objectContaining({
            key: 'dailyQueries',
            title: '今日查询次数',
            value: 0,
            type: 'success'
          }),
          expect.objectContaining({
            key: 'accuracy',
            title: 'AI准确率',
            value: 94.2,
            type: 'warning'
          }),
          expect.objectContaining({
            key: 'automationTasks',
            title: '自动化任务',
            value: 15,
            type: 'info'
          })
        ])
      });
    });

    it('应该成功获取真实统计数据', async () => {
      // 模拟Sequelize可用
      (sequelize as any) = {
        query: jest.fn()
      };

      // 模拟查询结果
      const mockQueryResults = [
        [{ count: 5 }], // 活跃模型数量
        [{ count: 10 }], // 今日查询次数
        [{ avg_accuracy: 95.5 }], // 平均准确率
        [{ count: 8 }], // 自动化任务数量
        [{ count: 3 }], // 上月模型数量
        [{ count: 8 }] // 昨日查询次数
      ];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockQueryResults[0])
        .mockResolvedValueOnce(mockQueryResults[1])
        .mockResolvedValueOnce(mockQueryResults[2])
        .mockResolvedValueOnce(mockQueryResults[3])
        .mockResolvedValueOnce(mockQueryResults[4])
        .mockResolvedValueOnce(mockQueryResults[5]);

      await aiStatsController.getOverviewStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            key: 'activeModels',
            title: '活跃AI模型',
            value: 5
          }),
          expect.objectContaining({
            key: 'dailyQueries',
            title: '今日查询次数',
            value: 10
          }),
          expect.objectContaining({
            key: 'accuracy',
            title: 'AI准确率',
            value: 95.5
          }),
          expect.objectContaining({
            key: 'automationTasks',
            title: '自动化任务',
            value: 8
          })
        ])
      });
    });

    it('应该处理数据库查询错误', async () => {
      (sequelize as any) = {
        query: jest.fn().mockRejectedValue(new Error('数据库连接失败'))
      };

      await aiStatsController.getOverviewStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            key: 'activeModels',
            title: '活跃AI模型',
            value: 8
          }),
          expect.objectContaining({
            key: 'dailyQueries',
            title: '今日查询次数',
            value: 1247
          }),
          expect.objectContaining({
            key: 'accuracy',
            title: 'AI准确率',
            value: 94.2
          }),
          expect.objectContaining({
            key: 'automationTasks',
            title: '自动化任务',
            value: 15
          })
        ]),
        message: '使用模拟数据'
      });
    });

    it('应该正确计算趋势数据', async () => {
      (sequelize as any) = {
        query: jest.fn()
      };

      // 模拟数据用于计算趋势
      const mockQueryResults = [
        [{ count: 10 }], // 当前活跃模型
        [{ count: 20 }], // 今日查询
        [{ avg_accuracy: 90 }], // 平均准确率
        [{ count: 15 }], // 自动化任务
        [{ count: 5 }], // 上月模型
        [{ count: 10 }] // 昨日查询
      ];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockQueryResults[0])
        .mockResolvedValueOnce(mockQueryResults[1])
        .mockResolvedValueOnce(mockQueryResults[2])
        .mockResolvedValueOnce(mockQueryResults[3])
        .mockResolvedValueOnce(mockQueryResults[4])
        .mockResolvedValueOnce(mockQueryResults[5]);

      await aiStatsController.getOverviewStats(
        mockRequest as Request,
        mockResponse as Response
      );

      const response = jsonSpy.mock.calls[0][0];
      const stats = response.data;

      // 验证趋势计算
      const modelsTrend = stats.find((stat: any) => stat.key === 'activeModels').trend;
      const queriesTrend = stats.find((stat: any) => stat.key === 'dailyQueries').trend;

      expect(modelsTrend).toBe(100); // (10-5)/5 * 100 = 100%
      expect(queriesTrend).toBe(100); // (20-10)/10 * 100 = 100%
    });
  });

  describe('getRecentTasks', () => {
    it('应该在Sequelize不可用时返回模拟任务数据', async () => {
      (sequelize as any) = null;

      await aiStatsController.getRecentTasks(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            name: 'AI对话-001',
            description: 'AI智能对话任务',
            status: 'completed',
            type: 'conversation'
          }),
          expect.objectContaining({
            id: 2,
            name: 'AI对话-002',
            description: 'AI智能对话任务',
            status: 'completed',
            type: 'conversation'
          })
        ])
      });
    });

    it('应该成功获取真实任务数据', async () => {
      (sequelize as any) = {
        query: jest.fn().mockResolvedValue([
          {
            id: 1,
            session_id: 'session-001',
            created_at: '2024-01-01'
          }
        ])
      };

      await aiStatsController.getRecentTasks(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            name: 'session-001',
            description: 'AI对话任务',
            status: 'completed',
            type: 'conversation'
          })
        ])
      });
    });

    it('应该处理数据库查询错误', async () => {
      (sequelize as any) = {
        query: jest.fn().mockRejectedValue(new Error('查询失败'))
      };

      await aiStatsController.getRecentTasks(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: [],
        message: '暂无AI任务数据'
      });
    });
  });

  describe('getAIModels', () => {
    it('应该在Sequelize不可用时返回模拟模型数据', async () => {
      (sequelize as any) = null;

      await aiStatsController.getAIModels(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            name: 'GPT-4',
            icon: '🧠',
            status: 'active'
          }),
          expect.objectContaining({
            id: 2,
            name: '豆包AI',
            icon: '🫘',
            status: 'active'
          }),
          expect.objectContaining({
            id: 3,
            name: 'Claude',
            icon: '🤖',
            status: 'active'
          })
        ])
      });
    });

    it('应该成功获取真实模型数据', async () => {
      (sequelize as any) = {
        query: jest.fn().mockResolvedValue([
          {
            id: 1,
            name: 'gpt-4',
            display_name: 'GPT-4',
            provider: 'openai',
            status: 'active',
            created_at: '2024-01-01'
          }
        ])
      };

      await aiStatsController.getAIModels(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            name: 'GPT-4',
            icon: '🧠',
            status: 'active'
          })
        ])
      });
    });

    it('应该正确分配模型图标', () => {
      const controller = (aiStatsController as any);
      
      expect(controller.getModelIcon('GPT-4')).toBe('🧠');
      expect(controller.getModelIcon('豆包AI')).toBe('🫘');
      expect(controller.getModelIcon('Claude')).toBe('🤖');
      expect(controller.getModelIcon('ChatGPT')).toBe('💬');
      expect(controller.getModelIcon('未知模型')).toBe('🤖');
    });
  });

  describe('getAnalysisHistory', () => {
    it('应该在Sequelize不可用时返回空数据', async () => {
      (sequelize as any) = null;

      await aiStatsController.getAnalysisHistory(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: [],
        message: '数据库连接不可用'
      });
    });

    it('应该成功获取分析历史记录', async () => {
      (sequelize as any) = {
        query: jest.fn().mockResolvedValue([
          {
            id: 1,
            session_id: 'analysis-001',
            created_at: '2024-01-01'
          }
        ])
      };

      await aiStatsController.getAnalysisHistory(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: 'analysis-001',
            type: 'analysis',
            summary: 'AI智能分析报告',
            status: 'completed'
          })
        ])
      });
    });

    it('应该处理数据库查询错误并返回模拟数据', async () => {
      (sequelize as any) = {
        query: jest.fn().mockRejectedValue(new Error('查询失败'))
      };

      await aiStatsController.getAnalysisHistory(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: '招生趋势分析报告',
            type: 'enrollment'
          }),
          expect.objectContaining({
            id: 2,
            title: '活动效果评估报告',
            type: 'activity'
          })
        ]),
        message: '使用模拟数据'
      });
    });
  });

  describe('响应格式验证', () => {
    it('应该返回正确的统计响应格式', async () => {
      (sequelize as any) = null;

      await aiStatsController.getOverviewStats(
        mockRequest as Request,
        mockResponse as Response
      );

      const response = jsonSpy.mock.calls[0][0];
      
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('data');
      expect(Array.isArray(response.data)).toBe(true);
      
      response.data.forEach((stat: any) => {
        expect(stat).toHaveProperty('key');
        expect(stat).toHaveProperty('title');
        expect(stat).toHaveProperty('value');
        expect(stat).toHaveProperty('unit');
        expect(stat).toHaveProperty('trend');
        expect(stat).toHaveProperty('trendText');
        expect(stat).toHaveProperty('type');
        expect(stat).toHaveProperty('iconName');
      });
    });

    it('应该返回正确的任务响应格式', async () => {
      (sequelize as any) = null;

      await aiStatsController.getRecentTasks(
        mockRequest as Request,
        mockResponse as Response
      );

      const response = jsonSpy.mock.calls[0][0];
      
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('data');
      expect(Array.isArray(response.data)).toBe(true);
      
      response.data.forEach((task: any) => {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('name');
        expect(task).toHaveProperty('description');
        expect(task).toHaveProperty('status');
        expect(task).toHaveProperty('createdAt');
        expect(task).toHaveProperty('accuracy');
        expect(task).toHaveProperty('processingTime');
        expect(task).toHaveProperty('type');
      });
    });

    it('应该返回正确的模型响应格式', async () => {
      (sequelize as any) = null;

      await aiStatsController.getAIModels(
        mockRequest as Request,
        mockResponse as Response
      );

      const response = jsonSpy.mock.calls[0][0];
      
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('data');
      expect(Array.isArray(response.data)).toBe(true);
      
      response.data.forEach((model: any) => {
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('icon');
        expect(model).toHaveProperty('version');
        expect(model).toHaveProperty('accuracy');
        expect(model).toHaveProperty('responseTime');
        expect(model).toHaveProperty('status');
        expect(model).toHaveProperty('usageCount');
      });
    });
  });
});