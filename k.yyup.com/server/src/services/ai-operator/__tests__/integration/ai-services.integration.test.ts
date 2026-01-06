/**
 * AI服务集成测试
 * 测试所有AI服务的集成和协作
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { memoryIntegrationService } from '../../core/memory-integration.service';
import { streamingService } from '../../core/streaming.service';
import { multiRoundChatService } from '../../core/multi-round-chat.service';
import { toolOrchestratorService } from '../../core/tool-orchestrator.service';
import { intentRecognitionService } from '../../core/intent-recognition.service';
import { promptBuilderService } from '../../core/prompt-builder.service';
import { performanceMonitor } from '../../monitoring/performance-monitor.service';
import { requestTracer } from '../../monitoring/request-tracer.service';

describe('AI Services Integration Tests', () => {
  beforeAll(() => {
    console.log('🧪 开始AI服务集成测试');
  });

  afterAll(() => {
    performanceMonitor.clearAllMetrics();
    requestTracer.clearAllTraces();
    console.log('✅ AI服务集成测试完成');
  });

  beforeEach(() => {
    performanceMonitor.clearAllMetrics();
    requestTracer.clearAllTraces();
  });

  describe('服务初始化测试', () => {
    it('应该成功初始化所有服务', () => {
      expect(memoryIntegrationService).toBeDefined();
      expect(streamingService).toBeDefined();
      expect(multiRoundChatService).toBeDefined();
      expect(toolOrchestratorService).toBeDefined();
      expect(intentRecognitionService).toBeDefined();
      expect(promptBuilderService).toBeDefined();
      expect(performanceMonitor).toBeDefined();
      expect(requestTracer).toBeDefined();
    });
  });

  describe('意图识别服务测试', () => {
    it('应该正确识别查询意图', async () => {
      const result = await intentRecognitionService.recognizeIntent('查询学生信息');
      
      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
      expect(result.complexity).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('应该使用缓存机制', async () => {
      const query = '查询教师列表';
      
      const result1 = await intentRecognitionService.recognizeIntent(query);
      expect(result1.cacheHit).toBeFalsy();
      
      const result2 = await intentRecognitionService.recognizeIntent(query);
      expect(result2.cacheHit).toBeTruthy();
    });
  });

  describe('提示词构建服务测试', () => {
    it('应该构建系统提示词', () => {
      const prompt = promptBuilderService.buildSystemPrompt({
        userRole: 'admin',
        tools: [{ name: 'queryTool', description: '查询工具' }]
      });
      
      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('应该压缩过长提示词', () => {
      const longPrompt = 'a'.repeat(10000);
      const compressed = promptBuilderService.compressPrompt(longPrompt, 8000);
      
      expect(compressed.length).toBeLessThanOrEqual(8000);
    });
  });

  describe('工具编排服务测试', () => {
    it('应该注册工具', () => {
      const tool = {
        name: 'testTool',
        description: '测试工具',
        execute: async () => ({ success: true })
      };
      
      toolOrchestratorService.registerTool(tool);
      const registered = toolOrchestratorService.getTool('testTool');
      
      expect(registered).toBeDefined();
    });

    it('应该执行工具', async () => {
      const tool = {
        name: 'executeTool',
        description: '执行工具',
        execute: async () => ({ data: 'test' })
      };
      
      toolOrchestratorService.registerTool(tool);
      const result = await toolOrchestratorService.executeTool('executeTool', {});
      
      expect(result.success).toBe(true);
    });
  });

  describe('流式服务测试', () => {
    it('应该创建流会话', () => {
      const sessionId = streamingService.createStreamSession();
      
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
    });

    it('应该获取流指标', () => {
      const sessionId = streamingService.createStreamSession();
      const metrics = streamingService.getStreamMetrics(sessionId);
      
      expect(metrics).toBeDefined();
    });
  });

  describe('多轮对话服务测试', () => {
    it('应该创建对话', () => {
      const conversationId = multiRoundChatService.createConversation('user123');
      
      expect(conversationId).toBeDefined();
      expect(typeof conversationId).toBe('string');
    });

    it('应该添加消息', () => {
      const conversationId = multiRoundChatService.createConversation('user123');
      multiRoundChatService.addMessage(conversationId, {
        role: 'user',
        content: '你好'
      });
      
      const conversation = multiRoundChatService.getConversation(conversationId);
      expect(conversation?.messages).toHaveLength(1);
    });
  });

  describe('性能监控服务测试', () => {
    it('应该记录性能指标', () => {
      performanceMonitor.recordMetric({
        serviceName: 'testService',
        operation: 'testOp',
        duration: 100,
        timestamp: Date.now(),
        success: true
      });
      
      const stats = performanceMonitor.getServiceStats('testService');
      expect(stats).toBeDefined();
      expect(stats?.totalRequests).toBe(1);
    });

    it('应该获取系统健康状态', () => {
      performanceMonitor.recordMetric({
        serviceName: 'service1',
        operation: 'op1',
        duration: 100,
        timestamp: Date.now(),
        success: true
      });
      
      const health = performanceMonitor.getSystemHealth();
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
    });
  });

  describe('请求追踪服务测试', () => {
    it('应该开始追踪', () => {
      const traceId = requestTracer.startTrace('user123');
      
      expect(traceId).toBeDefined();
      expect(typeof traceId).toBe('string');
    });

    it('应该添加span', () => {
      const traceId = requestTracer.startTrace('user123');
      const spanId = requestTracer.startSpan(traceId, 'testService', 'testOp');
      
      expect(spanId).toBeDefined();
      
      requestTracer.endSpan(traceId, spanId, 'success');
      const trace = requestTracer.getTrace(traceId);
      
      expect(trace?.spans).toHaveLength(1);
    });
  });

  describe('完整流程集成测试', () => {
    it('应该完成完整的AI对话流程', async () => {
      const traceId = requestTracer.startTrace('user123');
      
      const spanId1 = requestTracer.startSpan(traceId, 'IntentRecognition', 'recognizeIntent');
      const intent = await intentRecognitionService.recognizeIntent('查询学生信息');
      requestTracer.endSpan(traceId, spanId1, 'success');
      
      const spanId2 = requestTracer.startSpan(traceId, 'PromptBuilder', 'buildPrompt');
      const prompt = promptBuilderService.buildSystemPrompt({ userRole: 'teacher' });
      requestTracer.endSpan(traceId, spanId2, 'success');
      
      const spanId3 = requestTracer.startSpan(traceId, 'MultiRoundChat', 'createConversation');
      const conversationId = multiRoundChatService.createConversation('user123');
      requestTracer.endSpan(traceId, spanId3, 'success');
      
      requestTracer.endTrace(traceId, 'success');
      
      expect(intent).toBeDefined();
      expect(prompt).toBeDefined();
      expect(conversationId).toBeDefined();
      
      const trace = requestTracer.getTrace(traceId);
      expect(trace?.spans).toHaveLength(3);
      expect(trace?.status).toBe('success');
    });
  });
});

