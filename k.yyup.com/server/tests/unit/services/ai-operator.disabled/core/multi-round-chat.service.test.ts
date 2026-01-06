/**
 * MultiRoundChatService 单元测试
 * 测试多轮对话服务的核心功能
 */

import { MultiRoundChatService, ChatRound } from '../../../../../src/services/ai-operator/core/multi-round-chat.service';
import { vi } from 'vitest'

// 控制台错误检测变量
let consoleSpy: any

describe('MultiRoundChatService', () => {
  let service: MultiRoundChatService;

  beforeEach(() => {
    service = MultiRoundChatService.getInstance();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('getInstance', () => {
    it('应该返回单例实例', () => {
      const instance1 = MultiRoundChatService.getInstance();
      const instance2 = MultiRoundChatService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('startConversation', () => {
    it('应该创建新对话', () => {
      const conversationId = service.startConversation('user123');

      expect(conversationId).toBeDefined();
      expect(typeof conversationId).toBe('string');
      expect(conversationId.length).toBeGreaterThan(0);
    });

    it('应该为不同用户创建不同对话', () => {
      const conv1 = service.startConversation('user1');
      const conv2 = service.startConversation('user2');

      expect(conv1).not.toBe(conv2);
    });

    it('应该初始化对话状态', () => {
      const conversationId = service.startConversation('user123');
      const conversation = service.getConversation(conversationId);

      expect(conversation).toBeDefined();
      expect(conversation.userId).toBe('user123');
      expect(conversation.rounds).toEqual([]);
      expect(conversation.startTime).toBeDefined();
    });
  });

  describe('addRound', () => {
    it('应该添加新轮次', () => {
      const conversationId = service.startConversation('user123');
      
      service.addRound(conversationId, {
        userMessage: '你好',
        timestamp: Date.now()
      });

      const conversation = service.getConversation(conversationId);
      expect(conversation.rounds.length).toBe(1);
      expect(conversation.rounds[0].userMessage).toBe('你好');
    });

    it('应该自动分配轮次编号', () => {
      const conversationId = service.startConversation('user123');
      
      service.addRound(conversationId, { userMessage: '第一轮', timestamp: Date.now() });
      service.addRound(conversationId, { userMessage: '第二轮', timestamp: Date.now() });
      service.addRound(conversationId, { userMessage: '第三轮', timestamp: Date.now() });

      const conversation = service.getConversation(conversationId);
      expect(conversation.rounds[0].roundNumber).toBe(1);
      expect(conversation.rounds[1].roundNumber).toBe(2);
      expect(conversation.rounds[2].roundNumber).toBe(3);
    });

    it('应该设置初始状态为pending', () => {
      const conversationId = service.startConversation('user123');
      
      service.addRound(conversationId, { userMessage: '测试', timestamp: Date.now() });

      const conversation = service.getConversation(conversationId);
      expect(conversation.rounds[0].status).toBe('pending');
    });

    it('应该处理不存在的对话', () => {
      expect(() => {
        service.addRound('non-existent-id', { userMessage: '测试', timestamp: Date.now() });
      }).toThrow();
    });
  });

  describe('updateRound', () => {
    it('应该更新轮次状态', () => {
      const conversationId = service.startConversation('user123');
      service.addRound(conversationId, { userMessage: '测试', timestamp: Date.now() });

      service.updateRound(conversationId, 1, {
        status: 'processing'
      });

      const conversation = service.getConversation(conversationId);
      expect(conversation.rounds[0].status).toBe('processing');
    });

    it('应该更新AI响应', () => {
      const conversationId = service.startConversation('user123');
      service.addRound(conversationId, { userMessage: '你好', timestamp: Date.now() });

      service.updateRound(conversationId, 1, {
        aiResponse: '你好！有什么可以帮助你的？',
        status: 'complete'
      });

      const conversation = service.getConversation(conversationId);
      expect(conversation.rounds[0].aiResponse).toBe('你好！有什么可以帮助你的？');
      expect(conversation.rounds[0].status).toBe('complete');
    });

    it('应该更新工具调用结果', () => {
      const conversationId = service.startConversation('user123');
      service.addRound(conversationId, { userMessage: '查询学生', timestamp: Date.now() });

      const toolResults = [
        { toolName: 'query_students', success: true, result: { count: 100 } }
      ];

      service.updateRound(conversationId, 1, {
        toolResults,
        status: 'complete'
      });

      const conversation = service.getConversation(conversationId);
      expect(conversation.rounds[0].toolResults).toEqual(toolResults);
    });

    it('应该更新错误信息', () => {
      const conversationId = service.startConversation('user123');
      service.addRound(conversationId, { userMessage: '测试', timestamp: Date.now() });

      const error = new Error('处理失败');
      service.updateRound(conversationId, 1, {
        error,
        status: 'error'
      });

      const conversation = service.getConversation(conversationId);
      expect(conversation.rounds[0].error).toBe(error);
      expect(conversation.rounds[0].status).toBe('error');
    });

    it('应该处理不存在的轮次', () => {
      const conversationId = service.startConversation('user123');

      expect(() => {
        service.updateRound(conversationId, 999, { status: 'complete' });
      }).toThrow();
    });
  });

  describe('getConversation', () => {
    it('应该获取对话信息', () => {
      const conversationId = service.startConversation('user123');
      service.addRound(conversationId, { userMessage: '测试', timestamp: Date.now() });

      const conversation = service.getConversation(conversationId);

      expect(conversation).toBeDefined();
      expect(conversation.conversationId).toBe(conversationId);
      expect(conversation.userId).toBe('user123');
      expect(conversation.rounds.length).toBe(1);
    });

    it('应该处理不存在的对话', () => {
      expect(() => {
        service.getConversation('non-existent-id');
      }).toThrow();
    });
  });

  describe('getRound', () => {
    it('应该获取特定轮次', () => {
      const conversationId = service.startConversation('user123');
      service.addRound(conversationId, { userMessage: '第一轮', timestamp: Date.now() });
      service.addRound(conversationId, { userMessage: '第二轮', timestamp: Date.now() });

      const round = service.getRound(conversationId, 2);

      expect(round).toBeDefined();
      expect(round.roundNumber).toBe(2);
      expect(round.userMessage).toBe('第二轮');
    });

    it('应该处理不存在的轮次', () => {
      const conversationId = service.startConversation('user123');

      expect(() => {
        service.getRound(conversationId, 999);
      }).toThrow();
    });
  });

  describe('getConversationHistory', () => {
    it('应该获取对话历史', () => {
      const conversationId = service.startConversation('user123');
      
      service.addRound(conversationId, { userMessage: '你好', timestamp: Date.now() });
      service.updateRound(conversationId, 1, { aiResponse: '你好！', status: 'complete' });
      
      service.addRound(conversationId, { userMessage: '再见', timestamp: Date.now() });
      service.updateRound(conversationId, 2, { aiResponse: '再见！', status: 'complete' });

      const history = service.getConversationHistory(conversationId);

      expect(history.length).toBe(4); // 2轮 * 2条消息
      expect(history[0]).toEqual({ role: 'user', content: '你好' });
      expect(history[1]).toEqual({ role: 'assistant', content: '你好！' });
      expect(history[2]).toEqual({ role: 'user', content: '再见' });
      expect(history[3]).toEqual({ role: 'assistant', content: '再见！' });
    });

    it('应该限制历史长度', () => {
      const conversationId = service.startConversation('user123');
      
      for (let i = 1; i <= 10; i++) {
        service.addRound(conversationId, { userMessage: `消息${i}`, timestamp: Date.now() });
        service.updateRound(conversationId, i, { aiResponse: `响应${i}`, status: 'complete' });
      }

      const history = service.getConversationHistory(conversationId, 5);

      expect(history.length).toBe(10); // 最近5轮 * 2条消息
    });

    it('应该只包含完成的轮次', () => {
      const conversationId = service.startConversation('user123');
      
      service.addRound(conversationId, { userMessage: '完成的', timestamp: Date.now() });
      service.updateRound(conversationId, 1, { aiResponse: '响应', status: 'complete' });
      
      service.addRound(conversationId, { userMessage: '未完成的', timestamp: Date.now() });
      // 不更新状态，保持pending

      const history = service.getConversationHistory(conversationId);

      expect(history.length).toBe(2); // 只有第一轮的2条消息
    });
  });

  describe('endConversation', () => {
    it('应该结束对话', () => {
      const conversationId = service.startConversation('user123');
      service.addRound(conversationId, { userMessage: '测试', timestamp: Date.now() });

      service.endConversation(conversationId);

      const conversation = service.getConversation(conversationId);
      expect(conversation.endTime).toBeDefined();
      expect(conversation.status).toBe('ended');
    });

    it('应该记录结束原因', () => {
      const conversationId = service.startConversation('user123');

      service.endConversation(conversationId, '用户主动结束');

      const conversation = service.getConversation(conversationId);
      expect(conversation.endReason).toBe('用户主动结束');
    });
  });

  describe('clearConversation', () => {
    it('应该清除对话', () => {
      const conversationId = service.startConversation('user123');
      service.addRound(conversationId, { userMessage: '测试', timestamp: Date.now() });

      service.clearConversation(conversationId);

      expect(() => {
        service.getConversation(conversationId);
      }).toThrow();
    });
  });

  describe('getActiveConversations', () => {
    it('应该获取活跃对话列表', () => {
      const conv1 = service.startConversation('user1');
      const conv2 = service.startConversation('user2');
      service.endConversation(conv1);

      const activeConversations = service.getActiveConversations();

      expect(activeConversations.length).toBe(1);
      expect(activeConversations[0].conversationId).toBe(conv2);
    });
  });

  describe('性能测试', () => {
    it('应该快速创建对话', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        service.startConversation(`user${i}`);
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该高效处理多轮对话', () => {
      const conversationId = service.startConversation('user123');
      
      const startTime = Date.now();
      
      for (let i = 1; i <= 50; i++) {
        service.addRound(conversationId, { userMessage: `消息${i}`, timestamp: Date.now() });
        service.updateRound(conversationId, i, { aiResponse: `响应${i}`, status: 'complete' });
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(200); // 应该在200ms内完成
    });
  });

  describe('边界情况', () => {
    it('应该处理空用户ID', () => {
      expect(() => {
        service.startConversation('');
      }).toThrow();
    });

    it('应该处理空消息', () => {
      const conversationId = service.startConversation('user123');
      
      service.addRound(conversationId, { userMessage: '', timestamp: Date.now() });

      const conversation = service.getConversation(conversationId);
      expect(conversation.rounds[0].userMessage).toBe('');
    });

    it('应该处理超长消息', () => {
      const conversationId = service.startConversation('user123');
      const longMessage = 'A'.repeat(10000);
      
      service.addRound(conversationId, { userMessage: longMessage, timestamp: Date.now() });

      const conversation = service.getConversation(conversationId);
      expect(conversation.rounds[0].userMessage.length).toBe(10000);
    });

    it('应该处理并发更新', async () => {
      const conversationId = service.startConversation('user123');
      service.addRound(conversationId, { userMessage: '测试', timestamp: Date.now() });

      const updates = Array(10).fill(null).map((_, i) => 
        Promise.resolve(service.updateRound(conversationId, 1, {
          aiResponse: `响应${i}`
        }))
      );

      await Promise.all(updates);

      const conversation = service.getConversation(conversationId);
      expect(conversation.rounds[0].aiResponse).toBeDefined();
    });
  });
});

