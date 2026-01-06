/**
 * 功能工具相关API端点测试
 * 测试文件: /home/zhgue/yyupcc/k.yyup.com/client/src/api/endpoints/function-tools.ts
 */

import { 
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

describe, it, expect, vi, beforeEach } from 'vitest';
import {
  callUnifiedIntelligence,
  callUnifiedIntelligenceStream,
  getUnifiedSystemStatus,
  getUnifiedSystemCapabilities,
  callDirectChat,
  callDirectChatSSE
} from '@/api/endpoints/function-tools';

// 使用统一的Mock配置
import { setupRequestMock } from '../../../mocks/request.mock'
setupRequestMock()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

describe('功能工具相关API端点', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe('统一智能对话接口', () => {
    it('应该正确调用统一智能对话', async () => {
      const mockData = {
        message: '测试消息',
        userId: 'user123',
        conversationId: 'conv456'
      };

      const mockResponse = {
        success: true,
        data: { reply: 'AI回复' }
      };

      const { aiService } = await import('@/utils/request');
      vi.mocked(aiService.post).mockResolvedValue(mockResponse);

      const result = await callUnifiedIntelligence(mockData);

      expect(aiService.post).toHaveBeenCalledWith('/ai/unified/unified-chat', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('应该处理可选参数', async () => {
      const mockData = {
        message: '测试消息'
      };

      const mockResponse = {
        success: true,
        data: { reply: 'AI回复' }
      };

      const { aiService } = await import('@/utils/request');
      vi.mocked(aiService.post).mockResolvedValue(mockResponse);

      await callUnifiedIntelligence(mockData);

      expect(aiService.post).toHaveBeenCalledWith('/ai/unified/unified-chat', mockData);
    });
  });

  describe('统一智能流式对话接口', () => {
    it('应该正确处理流式响应', async () => {
      const mockData = {
        message: '测试消息',
        userId: 'user123'
      };

      const mockProgress = vi.fn();

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('event: start\ndata: {"message": "开始"}\n\n') })
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('event: thinking\ndata: {"content": "思考中"}\n\n') })
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('event: final_answer\ndata: {"content": "最终答案"}\n\n') })
              .mockResolvedValueOnce({ done: true, value: new Uint8Array() })
          })
        }
      });

      // Mock localStorage
      localStorageMock.getItem.mockReturnValue('mock-token');

      const result = await callUnifiedIntelligenceStream(mockData, mockProgress);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai/unified/stream-chat'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }),
          body: JSON.stringify(mockData)
        })
      );

      expect(mockProgress).toHaveBeenCalledWith(expect.objectContaining({
        type: 'start',
        message: '开始'
      }));

      expect(result).toEqual({ data: { message: '处理完成' } });
    });

    it('应该处理网络错误', async () => {
      const mockData = {
        message: '测试消息'
      };

      const mockProgress = vi.fn();

      global.fetch = vi.fn().mockRejectedValue(new Error('网络错误'));

      await expect(callUnifiedIntelligenceStream(mockData, mockProgress)).rejects.toThrow('网络错误');
    });

    it('应该处理HTTP错误', async () => {
      const mockData = {
        message: '测试消息'
      };

      const mockProgress = vi.fn();

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(callUnifiedIntelligenceStream(mockData, mockProgress)).rejects.toThrow('HTTP 500');
    });
  });

  describe('系统状态和能力接口', () => {
    it('应该正确获取系统状态', async () => {
      const mockResponse = {
        success: true,
        data: {
          status: 'healthy',
          uptime: 3600
        }
      };

      const { request } = await import('@/utils/request');
      vi.mocked(request.get).mockResolvedValue(mockResponse);

      const result = await getUnifiedSystemStatus();

      expect(request.get).toHaveBeenCalledWith('/ai/unified/status');
      expect(result).toEqual(mockResponse);
    });

    it('应该正确获取系统能力', async () => {
      const mockResponse = {
        success: true,
        data: {
          capabilities: ['chat', 'analysis', 'automation']
        }
      };

      const { request } = await import('@/utils/request');
      vi.mocked(request.get).mockResolvedValue(mockResponse);

      const result = await getUnifiedSystemCapabilities();

      expect(request.get).toHaveBeenCalledWith('/ai/unified/capabilities');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('直接聊天接口', () => {
    it('应该正确调用直接聊天', async () => {
      const mockData = {
        message: '直接聊天消息',
        userId: 'user123',
        context: { key: 'value' }
      };

      const mockResponse = {
        success: true,
        data: { content: '直接回复' }
      };

      const { aiService } = await import('@/utils/request');
      vi.mocked(aiService.post).mockResolvedValue(mockResponse);

      const result = await callDirectChat(mockData);

      expect(aiService.post).toHaveBeenCalledWith('/ai/unified/direct-chat', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('应该处理最小化参数', async () => {
      const mockData = {
        message: '简单消息'
      };

      const mockResponse = {
        success: true,
        data: { content: '简单回复' }
      };

      const { aiService } = await import('@/utils/request');
      vi.mocked(aiService.post).mockResolvedValue(mockResponse);

      await callDirectChat(mockData);

      expect(aiService.post).toHaveBeenCalledWith('/ai/unified/direct-chat', mockData);
    });
  });

  describe('直接聊天SSE接口', () => {
    it('应该正确处理SSE流式响应', async () => {
      const mockData = {
        message: 'SSE测试消息',
        userId: 'user123'
      };

      const mockOnMessage = vi.fn();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"type": "content", "content": "回复内容"}\n\n') })
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"type": "done"}\n\n') })
              .mockResolvedValueOnce({ done: true, value: new Uint8Array() })
          })
        }
      });

      localStorageMock.getItem.mockReturnValue('mock-token');

      await callDirectChatSSE(mockData, mockOnMessage);

      expect(fetch).toHaveBeenCalledWith(
        '/api/ai/unified/direct-chat-sse',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }),
          body: JSON.stringify(mockData)
        })
      );

      expect(mockOnMessage).toHaveBeenCalledWith(expect.objectContaining({
        type: 'content',
        content: '回复内容'
      }));
    });

    it('应该处理SSE错误情况', async () => {
      const mockData = {
        message: '错误测试'
      };

      const mockOnMessage = vi.fn();

      global.fetch = vi.fn().mockRejectedValue(new Error('SSE连接失败'));

      await expect(callDirectChatSSE(mockData, mockOnMessage)).rejects.toThrow('SSE连接失败');
    });

    it('应该处理无效的SSE数据', async () => {
      const mockData = {
        message: '无效数据测试'
      };

      const mockOnMessage = vi.fn();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('invalid data\n\n') })
              .mockResolvedValueOnce({ done: true, value: new Uint8Array() })
          })
        }
      });

      localStorageMock.getItem.mockReturnValue('mock-token');

      await callDirectChatSSE(mockData, mockOnMessage);

      // 应该处理无效数据而不抛出错误
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('类型定义', () => {
    it('应该定义正确的接口类型', () => {
      // FunctionCall 接口测试
      const functionCall: import('@/api/endpoints/function-tools').FunctionCall = {
        name: 'testFunction',
        arguments: { param1: 'value1', param2: 123 }
      };

      expect(functionCall.name).toBe('testFunction');
      expect(functionCall.arguments).toEqual({ param1: 'value1', param2: 123 });

      // FunctionToolResult 接口测试
      const functionToolResult: import('@/api/endpoints/function-tools').FunctionToolResult = {
        success: true,
        data: { result: 'success' },
        metadata: { timestamp: Date.now() }
      };

      expect(functionToolResult.success).toBe(true);
      expect(functionToolResult.data).toEqual({ result: 'success' });

      // AvailableTool 接口测试
      const availableTool: import('@/api/endpoints/function-tools').AvailableTool = {
        name: 'testTool',
        description: 'Test tool description',
        category: 'test',
        requiredRole: ['admin', 'user']
      };

      expect(availableTool.name).toBe('testTool');
      expect(availableTool.category).toBe('test');
      expect(availableTool.requiredRole).toEqual(['admin', 'user']);

      // SmartChatMessage 接口测试
      const chatMessage: import('@/api/endpoints/function-tools').SmartChatMessage = {
        role: 'user',
        content: 'Hello'
      };

      expect(chatMessage.role).toBe('user');
      expect(chatMessage.content).toBe('Hello');

      // SmartChatRequest 接口测试
      const chatRequest: import('@/api/endpoints/function-tools').SmartChatRequest = {
        messages: [chatMessage],
        conversation_id: 123,
        user_id: 'user456'
      };

      expect(chatRequest.messages).toHaveLength(1);
      expect(chatRequest.conversation_id).toBe(123);
      expect(chatRequest.user_id).toBe('user456');
    });
  });

  describe('错误处理', () => {
    it('应该处理API调用错误', async () => {
      const mockData = {
        message: '测试消息'
      };

      const { request } = await import('@/utils/request');
      vi.mocked(request.get).mockRejectedValue(new Error('API错误'));

      await expect(getUnifiedSystemStatus()).rejects.toThrow('API错误');
    });

    it('应该处理流式响应中的错误事件', async () => {
      const mockData = {
        message: '错误测试'
      };

      const mockProgress = vi.fn();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('event: error\ndata: {"message": "处理错误"}\n\n') })
              .mockResolvedValueOnce({ done: true, value: new Uint8Array() })
          })
        }
      });

      localStorageMock.getItem.mockReturnValue('mock-token');

      await expect(callUnifiedIntelligenceStream(mockData, mockProgress)).rejects.toThrow('处理出错');
    });
  });

  describe('参数验证', () => {
    it('应该验证必需参数', async () => {
      const { aiService } = await import('@/utils/request');
      vi.mocked(aiService.post).mockResolvedValue({ success: true, data: {} });

      // 测试缺少必需参数
      await expect(callUnifiedIntelligence({} as any)).rejects.toThrow();
    });

    it('应该正确处理空字符串参数', async () => {
      const mockData = {
        message: '',
        userId: '',
        conversationId: ''
      };

      const { aiService } = await import('@/utils/request');
      vi.mocked(aiService.post).mockResolvedValue({ success: true, data: {} });

      await callUnifiedIntelligence(mockData);

      expect(aiService.post).toHaveBeenCalledWith('/ai/unified/unified-chat', mockData);
    });
  });
});