/**
 * AI健康检查控制器测试
 */

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { AIHealthController } from '../../../src/controllers/ai-health.controller';
import { ApiResponse } from '../../../src/utils/apiResponse';

// 模拟 ApiResponse
jest.mock('../../../src/utils/apiResponse', () => ({
  success: jest.fn(),
  handleError: jest.fn()
}));


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

describe('AIHealthController', () => {
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

  describe('checkHealth', () => {
    it('应该返回健康状态', async () => {
      const expectedHealthStatus = {
        status: 'online',
        timestamp: expect.any(String),
        services: {
          textModels: 'available',
          imageModels: 'available',
          speechModels: 'limited',
          videoModels: 'unavailable'
        },
        version: '1.0.0',
        uptime: expect.any(Number)
      };

      await AIHealthController.checkHealth(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining(expectedHealthStatus),
        'AI服务健康检查完成'
      );
    });

    it('应该处理错误情况', async () => {
      const mockError = new Error('健康检查失败');
      
      // 模拟 process.uptime 抛出错误
      const originalUptime = process.uptime;
      process.uptime = jest.fn().mockImplementation(() => {
        throw mockError;
      });

      await AIHealthController.checkHealth(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ApiResponse.handleError).toHaveBeenCalledWith(
        mockResponse,
        mockError,
        'AI健康检查失败'
      );

      // 恢复原始方法
      process.uptime = originalUptime;
    });
  });

  describe('getServiceStatus', () => {
    it('应该返回服务状态详情', async () => {
      const expectedServiceStatus = {
        overall: 'healthy',
        components: {
          database: 'healthy',
          cache: 'healthy',
          aiModels: 'healthy',
          permissions: 'healthy'
        },
        metrics: {
          requestsPerMinute: expect.any(Number),
          averageResponseTime: expect.any(Number),
          errorRate: expect.any(Number)
        },
        lastUpdated: expect.any(String)
      };

      await AIHealthController.getServiceStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining(expectedServiceStatus),
        '获取AI服务状态成功'
      );
    });

    it('应该确保指标在合理范围内', async () => {
      await AIHealthController.getServiceStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      // 获取传递给 ApiResponse.success 的第二个参数
      const successCall = (ApiResponse.success as jest.Mock).mock.calls[0];
      const serviceStatus = successCall[1];

      // 验证指标范围
      expect(serviceStatus.metrics.requestsPerMinute).toBeGreaterThanOrEqual(0);
      expect(serviceStatus.metrics.requestsPerMinute).toBeLessThanOrEqual(100);
      
      expect(serviceStatus.metrics.averageResponseTime).toBeGreaterThanOrEqual(100);
      expect(serviceStatus.metrics.averageResponseTime).toBeLessThanOrEqual(600);
      
      expect(serviceStatus.metrics.errorRate).toBeGreaterThanOrEqual(0);
      expect(serviceStatus.metrics.errorRate).toBeLessThan(0.1);
    });
  });

  describe('响应格式', () => {
    it('应该返回正确的响应格式', async () => {
      await AIHealthController.checkHealth(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          status: expect.any(String),
          timestamp: expect.any(String),
          services: expect.any(Object),
          version: expect.any(String),
          uptime: expect.any(Number)
        }),
        expect.any(String)
      );
    });

    it('服务状态应该包含所有必需的组件', async () => {
      await AIHealthController.getServiceStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      const successCall = (ApiResponse.success as jest.Mock).mock.calls[0];
      const serviceStatus = successCall[1];

      expect(serviceStatus.components).toHaveProperty('database');
      expect(serviceStatus.components).toHaveProperty('cache');
      expect(serviceStatus.components).toHaveProperty('aiModels');
      expect(serviceStatus.components).toHaveProperty('permissions');
      
      expect(serviceStatus.metrics).toHaveProperty('requestsPerMinute');
      expect(serviceStatus.metrics).toHaveProperty('averageResponseTime');
      expect(serviceStatus.metrics).toHaveProperty('errorRate');
    });
  });

  describe('时间戳验证', () => {
    it('应该返回有效的ISO时间戳', async () => {
      await AIHealthController.checkHealth(
        mockRequest as Request,
        mockResponse as Response
      );

      const successCall = (ApiResponse.success as jest.Mock).mock.calls[0];
      const healthStatus = successCall[1];

      expect(() => {
        new Date(healthStatus.timestamp);
      }).not.toThrow();
    });

    it('服务状态时间戳应该是最近的', async () => {
      const beforeCall = new Date();
      
      await AIHealthController.getServiceStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      const successCall = (ApiResponse.success as jest.Mock).mock.calls[0];
      const serviceStatus = successCall[1];
      const timestamp = new Date(serviceStatus.lastUpdated);
      const afterCall = new Date();

      expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime() - 1000);
      expect(timestamp.getTime()).toBeLessThanOrEqual(afterCall.getTime() + 1000);
    });
  });
});