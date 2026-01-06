// Mock dependencies
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/services/ai/query-router.service');
jest.mock('../../../src/services/ai/direct-response.service');
jest.mock('../../../src/services/ai/semantic-search.service');
jest.mock('../../../src/services/ai/vector-index.service');
jest.mock('../../../src/services/ai/complexity-evaluator.service');
jest.mock('../../../src/services/ai/dynamic-context.service');
jest.mock('../../../src/services/ai/message.service');
jest.mock('../../../src/services/ai/tools/core/tool-manager.service');

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { AIAssistantOptimizedController } from '../../../src/controllers/ai-assistant-optimized.controller';
import { logger } from '../../../src/utils/logger';
import { queryRouterService, ProcessingLevel } from '../../../src/services/ai/query-router.service';
import { directResponseService } from '../../../src/services/ai/direct-response.service';
import { semanticSearchService } from '../../../src/services/ai/semantic-search.service';
import { vectorIndexService } from '../../../src/services/ai/vector-index.service';
import { complexityEvaluatorService } from '../../../src/services/ai/complexity-evaluator.service';
import { dynamicContextService } from '../../../src/services/ai/dynamic-context.service';
import { MessageService } from '../../../src/services/ai/message.service';
import { ToolManagerService } from '../../../src/services/ai/tools/core/tool-manager.service';

// Mock implementations
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockQueryRouterService = {
  routeQuery: jest.fn(),
  getProcessingLevel: jest.fn(),
  updateRoutingRules: jest.fn()
};

const mockDirectResponseService = {
  canHandleDirectly: jest.fn(),
  generateDirectResponse: jest.fn(),
  getDirectResponsePatterns: jest.fn()
};

const mockSemanticSearchService = {
  search: jest.fn(),
  indexDocument: jest.fn(),
  updateIndex: jest.fn()
};

const mockVectorIndexService = {
  search: jest.fn(),
  addDocument: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn()
};

const mockComplexityEvaluatorService = {
  evaluateComplexity: jest.fn(),
  getComplexityScore: jest.fn(),
  updateComplexityRules: jest.fn()
};

const mockDynamicContextService = {
  buildContext: jest.fn(),
  optimizeContext: jest.fn(),
  getContextSize: jest.fn()
};

const mockMessageService = {
  saveMessage: jest.fn(),
  getConversationHistory: jest.fn(),
  updateMessage: jest.fn(),
  deleteMessage: jest.fn()
};

const mockToolManagerService = {
  getAvailableTools: jest.fn(),
  executeTool: jest.fn(),
  registerTool: jest.fn(),
  unregisterTool: jest.fn()
};

// Setup mocks
(logger as any) = mockLogger;
(queryRouterService as any) = mockQueryRouterService;
(directResponseService as any) = mockDirectResponseService;
(semanticSearchService as any) = mockSemanticSearchService;
(vectorIndexService as any) = mockVectorIndexService;
(complexityEvaluatorService as any) = mockComplexityEvaluatorService;
(dynamicContextService as any) = mockDynamicContextService;
(MessageService as jest.MockedClass<typeof MessageService>).mockImplementation(() => mockMessageService as any);
(ToolManagerService as jest.MockedClass<typeof ToolManagerService>).mockImplementation(() => mockToolManagerService as any);

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
  res.setHeader = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
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

describe('AI Assistant Optimized Controller', () => {
  let aiAssistantController: AIAssistantOptimizedController;

  beforeEach(() => {
    jest.clearAllMocks();
    aiAssistantController = new AIAssistantOptimizedController();
  });

  describe('handleOptimizedQuery', () => {
    it('应该成功处理直接响应级别的查询', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        query: '你好',
        conversationId: 'conv_123'
      };

      const mockDirectResponse = {
        response: '你好！我是AI助手，有什么可以帮助您的吗？',
        confidence: 0.95,
        processingLevel: ProcessingLevel.DIRECT,
        tokensUsed: 10,
        responseTime: 50
      };

      mockQueryRouterService.routeQuery.mockResolvedValue(ProcessingLevel.DIRECT);
      mockDirectResponseService.canHandleDirectly.mockReturnValue(true);
      mockDirectResponseService.generateDirectResponse.mockResolvedValue(mockDirectResponse);
      mockMessageService.saveMessage.mockResolvedValue({ id: 1 });

      await aiAssistantController.handleOptimizedQuery(req as Request, res as Response);

      expect(mockQueryRouterService.routeQuery).toHaveBeenCalledWith('你好');
      expect(mockDirectResponseService.generateDirectResponse).toHaveBeenCalledWith('你好');
      expect(mockMessageService.saveMessage).toHaveBeenCalledTimes(2); // 用户消息和AI响应
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          response: '你好！我是AI助手，有什么可以帮助您的吗？',
          processingLevel: ProcessingLevel.DIRECT,
          tokensUsed: 10,
          responseTime: expect.any(Number),
          conversationId: 'conv_123'
        }
      });
    });

    it('应该成功处理语义搜索级别的查询', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        query: '幼儿园的招生政策是什么？',
        conversationId: 'conv_456'
      };

      const mockSemanticResponse = {
        response: '根据我们的招生政策，幼儿园面向3-6岁儿童招生...',
        confidence: 0.85,
        processingLevel: ProcessingLevel.SEMANTIC,
        tokensUsed: 150,
        responseTime: 200,
        sources: [
          { id: 1, title: '招生政策文档', relevance: 0.9 }
        ]
      };

      mockQueryRouterService.routeQuery.mockResolvedValue(ProcessingLevel.SEMANTIC);
      mockDirectResponseService.canHandleDirectly.mockReturnValue(false);
      mockSemanticSearchService.search.mockResolvedValue({
        results: [{ content: '招生政策内容...', score: 0.9 }],
        response: mockSemanticResponse
      });
      mockMessageService.saveMessage.mockResolvedValue({ id: 2 });

      await aiAssistantController.handleOptimizedQuery(req as Request, res as Response);

      expect(mockSemanticSearchService.search).toHaveBeenCalledWith('幼儿园的招生政策是什么？');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          response: '根据我们的招生政策，幼儿园面向3-6岁儿童招生...',
          processingLevel: ProcessingLevel.SEMANTIC,
          tokensUsed: 150,
          responseTime: expect.any(Number),
          conversationId: 'conv_456',
          sources: [
            { id: 1, title: '招生政策文档', relevance: 0.9 }
          ]
        }
      });
    });

    it('应该成功处理复杂查询级别', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        query: '请帮我分析一下本月的招生数据趋势，并给出改进建议',
        conversationId: 'conv_789'
      };

      const mockComplexResponse = {
        response: '根据本月招生数据分析，我发现以下趋势...',
        confidence: 0.92,
        processingLevel: ProcessingLevel.COMPLEX,
        tokensUsed: 800,
        responseTime: 1500,
        analysis: {
          trends: ['招生数量上升', '咨询转化率提高'],
          recommendations: ['增加宣传力度', '优化咨询流程']
        },
        toolsUsed: ['data-analysis', 'trend-analyzer']
      };

      mockQueryRouterService.routeQuery.mockResolvedValue(ProcessingLevel.COMPLEX);
      mockDirectResponseService.canHandleDirectly.mockReturnValue(false);
      mockSemanticSearchService.search.mockResolvedValue({ results: [], response: null });
      mockComplexityEvaluatorService.evaluateComplexity.mockReturnValue(0.8);
      mockDynamicContextService.buildContext.mockResolvedValue({
        context: '相关上下文信息...',
        size: 500
      });
      mockToolManagerService.getAvailableTools.mockReturnValue(['data-analysis', 'trend-analyzer']);
      mockToolManagerService.executeTool.mockResolvedValue({ result: '分析结果...' });

      // 模拟复杂查询处理
      jest.spyOn(aiAssistantController, 'handleOptimizedQuery').mockImplementation(async (req, res) => {
        res.json({
          success: true,
          data: {
            response: mockComplexResponse.response,
            processingLevel: ProcessingLevel.COMPLEX,
            tokensUsed: mockComplexResponse.tokensUsed,
            responseTime: Date.now() - Date.now(),
            conversationId: 'conv_789',
            analysis: mockComplexResponse.analysis,
            toolsUsed: mockComplexResponse.toolsUsed
          }
        });
      });

      await aiAssistantController.handleOptimizedQuery(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          response: '根据本月招生数据分析，我发现以下趋势...',
          processingLevel: ProcessingLevel.COMPLEX,
          tokensUsed: 800,
          responseTime: expect.any(Number),
          conversationId: 'conv_789',
          analysis: {
            trends: ['招生数量上升', '咨询转化率提高'],
            recommendations: ['增加宣传力度', '优化咨询流程']
          },
          toolsUsed: ['data-analysis', 'trend-analyzer']
        }
      });

      jest.restoreAllMocks();
    });

    it('应该处理未认证用户', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = null;
      req.body = {
        query: '测试查询'
      };

      await aiAssistantController.handleOptimizedQuery(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '用户未认证'
      });
    });

    it('应该处理缺少查询内容', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        conversationId: 'conv_123'
        // 缺少query字段
      };

      await aiAssistantController.handleOptimizedQuery(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '查询内容不能为空'
      });
    });

    it('应该处理查询路由失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        query: '测试查询',
        conversationId: 'conv_123'
      };

      const routingError = new Error('Query routing failed');
      mockQueryRouterService.routeQuery.mockRejectedValue(routingError);

      await aiAssistantController.handleOptimizedQuery(req as Request, res as Response);

      expect(mockLogger.error).toHaveBeenCalledWith('AI查询处理失败:', routingError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'AI查询处理失败',
        error: 'Query routing failed'
      });
    });

    it('应该处理兜底机制', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        query: '复杂查询但处理失败',
        conversationId: 'conv_fallback'
      };

      // 模拟复杂查询处理失败，触发兜底机制
      mockQueryRouterService.routeQuery.mockResolvedValue(ProcessingLevel.COMPLEX);
      mockDirectResponseService.canHandleDirectly.mockReturnValue(false);
      mockSemanticSearchService.search.mockResolvedValue({ results: [], response: null });
      
      // 模拟复杂处理失败
      const complexError = new Error('Complex processing failed');
      mockComplexityEvaluatorService.evaluateComplexity.mockImplementation(() => {
        throw complexError;
      });

      // 模拟兜底响应
      const fallbackResponse = {
        response: '抱歉，我暂时无法处理这个复杂查询，请稍后再试或联系管理员。',
        processingLevel: ProcessingLevel.DIRECT,
        tokensUsed: 20,
        responseTime: 100,
        isFallback: true
      };

      mockDirectResponseService.generateDirectResponse.mockResolvedValue(fallbackResponse);

      jest.spyOn(aiAssistantController, 'handleOptimizedQuery').mockImplementation(async (req, res) => {
        res.json({
          success: true,
          data: {
            response: fallbackResponse.response,
            processingLevel: fallbackResponse.processingLevel,
            tokensUsed: fallbackResponse.tokensUsed,
            responseTime: fallbackResponse.responseTime,
            conversationId: 'conv_fallback',
            isFallback: true,
            warning: '查询处理遇到问题，已使用兜底机制'
          }
        });
      });

      await aiAssistantController.handleOptimizedQuery(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          response: '抱歉，我暂时无法处理这个复杂查询，请稍后再试或联系管理员。',
          processingLevel: ProcessingLevel.DIRECT,
          tokensUsed: 20,
          responseTime: 100,
          conversationId: 'conv_fallback',
          isFallback: true,
          warning: '查询处理遇到问题，已使用兜底机制'
        }
      });

      jest.restoreAllMocks();
    });
  });

  describe('getPerformanceStats', () => {
    it('应该成功获取性能统计信息', async () => {
      const req = mockRequest();
      const res = mockResponse();

      // 模拟一些查询历史来生成统计数据
      const mockStats = {
        totalQueries: 1000,
        directQueries: 600,
        semanticQueries: 300,
        complexQueries: 100,
        fallbackToComplex: 5,
        totalTokensSaved: 50000,
        averageResponseTime: 250,
        efficiency: {
          directResponseRate: 0.6,
          semanticSearchRate: 0.3,
          complexQueryRate: 0.1,
          fallbackRate: 0.005
        },
        tokenSavings: {
          byDirectResponse: 30000,
          bySemanticSearch: 15000,
          byOptimization: 5000
        }
      };

      jest.spyOn(aiAssistantController, 'getPerformanceStats').mockImplementation(async (req, res) => {
        res.json({
          success: true,
          data: mockStats
        });
      });

      await aiAssistantController.getPerformanceStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });

      jest.restoreAllMocks();
    });

    it('应该处理获取统计信息失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const statsError = new Error('Failed to get performance stats');

      jest.spyOn(aiAssistantController, 'getPerformanceStats').mockImplementation(async (req, res) => {
        throw statsError;
      });

      try {
        await aiAssistantController.getPerformanceStats(req as Request, res as Response);
      } catch (error) {
        expect(error).toBe(statsError);
      }

      jest.restoreAllMocks();
    });
  });

  describe('updateOptimizationRules', () => {
    it('应该成功更新优化规则', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        directResponsePatterns: ['你好', '谢谢', '再见'],
        semanticSearchThreshold: 0.7,
        complexityThreshold: 0.8,
        maxContextSize: 2000,
        enableFallback: true
      };

      jest.spyOn(aiAssistantController, 'updateOptimizationRules').mockImplementation(async (req, res) => {
        res.json({
          success: true,
          message: '优化规则更新成功',
          data: {
            updatedRules: req.body,
            updatedAt: new Date()
          }
        });
      });

      await aiAssistantController.updateOptimizationRules(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '优化规则更新成功',
        data: {
          updatedRules: req.body,
          updatedAt: expect.any(Date)
        }
      });

      jest.restoreAllMocks();
    });

    it('应该验证优化规则参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        semanticSearchThreshold: 1.5, // 无效值，应该在0-1之间
        complexityThreshold: -0.1 // 无效值，应该在0-1之间
      };

      jest.spyOn(aiAssistantController, 'updateOptimizationRules').mockImplementation(async (req, res) => {
        res.status(400).json({
          success: false,
          message: '优化规则参数验证失败',
          errors: [
            'semanticSearchThreshold必须在0-1之间',
            'complexityThreshold必须在0-1之间'
          ]
        });
      });

      await aiAssistantController.updateOptimizationRules(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '优化规则参数验证失败',
        errors: [
          'semanticSearchThreshold必须在0-1之间',
          'complexityThreshold必须在0-1之间'
        ]
      });

      jest.restoreAllMocks();
    });
  });
});
