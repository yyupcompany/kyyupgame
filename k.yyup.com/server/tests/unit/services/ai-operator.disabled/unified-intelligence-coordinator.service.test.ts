/**
 * UnifiedIntelligenceCoordinator 单元测试
 * 测试统一智能协调器的核心功能
 */

import { UnifiedIntelligenceCoordinator } from '../../../../src/services/ai-operator/unified-intelligence-coordinator.service';
import { vi } from 'vitest'

// Mock所有依赖服务
jest.mock('../../../../src/services/ai-operator/core/intent-recognition.service');
jest.mock('../../../../src/services/ai-operator/core/prompt-builder.service');
jest.mock('../../../../src/services/ai-operator/core/tool-orchestrator.service');
jest.mock('../../../../src/services/ai-operator/core/streaming.service');
jest.mock('../../../../src/services/ai-operator/core/multi-round-chat.service');
jest.mock('../../../../src/services/ai-operator/core/memory-integration.service');
jest.mock('../../../../src/services/ai/model-selector.service');
jest.mock('../../../../src/services/ai/text-model.service');


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

describe('UnifiedIntelligenceCoordinator', () => {
  let coordinator: UnifiedIntelligenceCoordinator;
  let mockIntentService: any;
  let mockPromptService: any;
  let mockToolService: any;
  let mockStreamingService: any;
  let mockChatService: any;
  let mockMemoryService: any;
  let mockModelSelector: any;
  let mockTextModel: any;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();

    // 获取协调器实例
    coordinator = UnifiedIntelligenceCoordinator.getInstance();

    // 设置mock服务的返回值
    const { IntentRecognitionService } = require('../../../../src/services/ai-operator/core/intent-recognition.service');
    mockIntentService = IntentRecognitionService.getInstance();
    mockIntentService.recognizeIntent = jest.fn().mockResolvedValue({
      intent: 'QUERY',
      complexity: 'SIMPLE',
      requiredCapabilities: ['database_query'],
      confidence: 0.9,
      keywords: ['查询'],
      entities: []
    });

    const { PromptBuilderService } = require('../../../../src/services/ai-operator/core/prompt-builder.service');
    mockPromptService = PromptBuilderService.getInstance();
    mockPromptService.buildMessages = jest.fn().mockReturnValue([
      { role: 'system', content: '系统提示' },
      { role: 'user', content: '用户查询' }
    ]);

    const { ToolOrchestratorService } = require('../../../../src/services/ai-operator/core/tool-orchestrator.service');
    mockToolService = ToolOrchestratorService.getInstance();
    mockToolService.selectTools = jest.fn().mockResolvedValue([]);
    mockToolService.executeTools = jest.fn().mockResolvedValue([]);

    const { StreamingService } = require('../../../../src/services/ai-operator/core/streaming.service');
    mockStreamingService = StreamingService.getInstance();
    mockStreamingService.streamResponse = jest.fn().mockResolvedValue(undefined);

    const { MultiRoundChatService } = require('../../../../src/services/ai-operator/core/multi-round-chat.service');
    mockChatService = MultiRoundChatService.getInstance();
    mockChatService.startConversation = jest.fn().mockReturnValue('conv-123');
    mockChatService.addRound = jest.fn();
    mockChatService.updateRound = jest.fn();
    mockChatService.getConversation = jest.fn().mockReturnValue({
      conversationId: 'conv-123',
      rounds: []
    });

    const { MemoryIntegrationService } = require('../../../../src/services/ai-operator/core/memory-integration.service');
    mockMemoryService = MemoryIntegrationService.getInstance();
    mockMemoryService.retrieveRelevantMemories = jest.fn().mockResolvedValue([]);

    const { ModelSelectorService } = require('../../../../src/services/ai/model-selector.service');
    mockModelSelector = ModelSelectorService.getInstance();
    mockModelSelector.selectModel = jest.fn().mockResolvedValue({
      model: { name: 'test-model', provider: 'test' },
      reason: 'test'
    });

    const { TextModelService } = require('../../../../src/services/ai/text-model.service');
    mockTextModel = TextModelService.getInstance();
    mockTextModel.generateText = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'AI响应内容' } }]
    });
  });

  describe('getInstance', () => {
    it('应该返回单例实例', () => {
      const instance1 = UnifiedIntelligenceCoordinator.getInstance();
      const instance2 = UnifiedIntelligenceCoordinator.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('processQuery', () => {
    it('应该成功处理简单查询', async () => {
      const query = '查询学生信息';
      const userId = '123';
      const context = {};

      const result = await coordinator.processQuery(query, userId, context);

      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
      expect(mockIntentService.recognizeIntent).toHaveBeenCalledWith(query, context);
      expect(mockPromptService.buildMessages).toHaveBeenCalled();
      expect(mockTextModel.generateText).toHaveBeenCalled();
    });

    it('应该处理需要工具的查询', async () => {
      mockIntentService.recognizeIntent.mockResolvedValue({
        intent: 'QUERY',
        complexity: 'MODERATE',
        requiredCapabilities: ['database_query', 'data_analysis'],
        confidence: 0.9,
        keywords: ['查询', '分析'],
        entities: []
      });

      mockToolService.selectTools.mockResolvedValue([
        { name: 'query_students', description: '查询学生' }
      ]);

      mockToolService.executeTools.mockResolvedValue([
        { toolName: 'query_students', success: true, result: { count: 100 } }
      ]);

      const query = '查询并分析学生数据';
      const userId = '123';

      const result = await coordinator.processQuery(query, userId, {});

      expect(mockToolService.selectTools).toHaveBeenCalled();
      expect(mockToolService.executeTools).toHaveBeenCalled();
      expect(result.toolResults).toBeDefined();
    });

    it('应该使用记忆上下文', async () => {
      mockMemoryService.retrieveRelevantMemories.mockResolvedValue([
        { content: '用户喜欢查看学生信息', score: 0.9 }
      ]);

      const query = '继续上次的操作';
      const userId = '123';

      await coordinator.processQuery(query, userId, {});

      expect(mockMemoryService.retrieveRelevantMemories).toHaveBeenCalledWith(
        query,
        userId
      );
    });

    it('应该处理多轮对话', async () => {
      const conversationId = 'conv-123';
      mockChatService.getConversation.mockReturnValue({
        conversationId,
        rounds: [
          {
            roundNumber: 1,
            userMessage: '查询学生',
            aiResponse: '找到100个学生',
            status: 'complete'
          }
        ]
      });

      const query = '那他们的成绩呢？';
      const userId = '123';
      const context = { conversationId };

      await coordinator.processQuery(query, userId, context);

      expect(mockChatService.getConversation).toHaveBeenCalledWith(conversationId);
      expect(mockChatService.addRound).toHaveBeenCalled();
    });
  });

  describe('processStreamingQuery', () => {
    it('应该处理流式查询', async () => {
      const query = '查询学生信息';
      const userId = '123';
      const mockRes = {
        write: jest.fn(),
        end: jest.fn(),
        setHeader: jest.fn()
      };

      await coordinator.processStreamingQuery(query, userId, mockRes as any, {});

      expect(mockStreamingService.streamResponse).toHaveBeenCalled();
      expect(mockIntentService.recognizeIntent).toHaveBeenCalled();
    });

    it('应该在流式响应中处理错误', async () => {
      mockTextModel.generateText.mockRejectedValue(new Error('AI服务错误'));

      const query = '查询学生';
      const userId = '123';
      const mockRes = {
        write: jest.fn(),
        end: jest.fn(),
        setHeader: jest.fn()
      };

      await coordinator.processStreamingQuery(query, userId, mockRes as any, {});

      expect(mockStreamingService.streamResponse).toHaveBeenCalled();
      // 应该发送错误消息
    });
  });

  describe('错误处理', () => {
    it('应该处理意图识别失败', async () => {
      mockIntentService.recognizeIntent.mockRejectedValue(new Error('识别失败'));

      const query = '查询学生';
      const userId = '123';

      await expect(coordinator.processQuery(query, userId, {})).rejects.toThrow();
    });

    it('应该处理AI模型调用失败', async () => {
      mockTextModel.generateText.mockRejectedValue(new Error('模型错误'));

      const query = '查询学生';
      const userId = '123';

      await expect(coordinator.processQuery(query, userId, {})).rejects.toThrow();
    });

    it('应该处理工具执行失败', async () => {
      mockToolService.executeTools.mockRejectedValue(new Error('工具执行失败'));
      mockToolService.selectTools.mockResolvedValue([{ name: 'test_tool' }]);

      const query = '执行操作';
      const userId = '123';

      await expect(coordinator.processQuery(query, userId, {})).rejects.toThrow();
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内完成处理', async () => {
      const query = '查询学生信息';
      const userId = '123';

      const startTime = Date.now();
      await coordinator.processQuery(query, userId, {});
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该能处理并发请求', async () => {
      const queries = Array(5).fill(null).map((_, i) => `查询${i}`);
      const userId = '123';

      const promises = queries.map(query => 
        coordinator.processQuery(query, userId, {})
      );
      const results = await Promise.all(promises);

      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.response).toBeDefined();
      });
    });
  });

  describe('边界情况', () => {
    it('应该处理空查询', async () => {
      const query = '';
      const userId = '123';

      await expect(coordinator.processQuery(query, userId, {})).rejects.toThrow();
    });

    it('应该处理无效用户ID', async () => {
      const query = '查询学生';
      const userId = '';

      await expect(coordinator.processQuery(query, userId, {})).rejects.toThrow();
    });

    it('应该处理空上下文', async () => {
      const query = '查询学生';
      const userId = '123';

      const result = await coordinator.processQuery(query, userId, undefined as any);

      expect(result).toBeDefined();
    });
  });
});

