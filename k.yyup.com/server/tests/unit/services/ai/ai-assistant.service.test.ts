import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockAIConversation = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockAIMessage = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  bulkCreate: jest.fn()
};

const mockAIModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn()
};

const mockUser = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

// Mock external services
const mockOpenAIService = {
  createCompletion: jest.fn(),
  createChatCompletion: jest.fn(),
  createEmbedding: jest.fn(),
  moderateContent: jest.fn()
};

const mockAnthropicService = {
  createMessage: jest.fn(),
  createCompletion: jest.fn()
};

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn()
};

const mockLoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

const mockAnalyticsService = {
  trackEvent: jest.fn(),
  recordUsage: jest.fn(),
  getUsageStats: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn(),
  literal: jest.fn(),
  fn: jest.fn(),
  col: jest.fn(),
  Op: {
    like: Symbol('like'),
    in: Symbol('in'),
    gte: Symbol('gte'),
    lte: Symbol('lte')
  }
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/ai-conversation.model', () => ({
  AIConversation: mockAIConversation
}));

jest.unstable_mockModule('../../../../../src/models/ai-message.model', () => ({
  AIMessage: mockAIMessage
}));

jest.unstable_mockModule('../../../../../src/models/ai-model.model', () => ({
  AIModel: mockAIModel
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/config/database', () => ({
  sequelize: mockSequelize
}));

jest.unstable_mockModule('../../../../../src/services/ai/openai.service', () => mockOpenAIService);
jest.unstable_mockModule('../../../../../src/services/ai/anthropic.service', () => mockAnthropicService);
jest.unstable_mockModule('../../../../../src/services/cache.service', () => mockCacheService);
jest.unstable_mockModule('../../../../../src/services/logger.service', () => mockLoggerService);
jest.unstable_mockModule('../../../../../src/services/analytics.service', () => mockAnalyticsService);


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

describe('AI Assistant Service', () => {
  let aiAssistantService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/ai/ai-assistant.service');
    aiAssistantService = imported.AIAssistantService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('createConversation', () => {
    it('应该成功创建AI对话', async () => {
      const conversationData = {
        title: '数学教学辅助',
        type: 'educational',
        userId: 1,
        context: {
          subject: 'mathematics',
          grade: 'kindergarten',
          topic: 'counting'
        },
        systemPrompt: '你是一个专业的幼儿园数学教学助手'
      };

      const mockConversation = {
        id: 1,
        title: '数学教学辅助',
        type: 'educational',
        userId: 1,
        status: 'active',
        context: conversationData.context,
        systemPrompt: conversationData.systemPrompt,
        messageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockAIConversation.create.mockResolvedValue(mockConversation);
      mockAnalyticsService.trackEvent.mockResolvedValue(undefined);

      const result = await aiAssistantService.createConversation(conversationData);

      expect(mockAIConversation.create).toHaveBeenCalledWith({
        ...conversationData,
        status: 'active',
        messageCount: 0
      });
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('ai_conversation_created', {
        conversationId: 1,
        userId: 1,
        type: 'educational'
      });
      expect(result).toEqual(mockConversation);
    });

    it('应该处理创建失败的情况', async () => {
      const conversationData = {
        title: '测试对话',
        type: 'general',
        userId: 1
      };

      const error = new Error('数据库错误');
      mockAIConversation.create.mockRejectedValue(error);

      await expect(aiAssistantService.createConversation(conversationData))
        .rejects.toThrow('数据库错误');
    });
  });

  describe('sendMessage', () => {
    it('应该成功发送消息并获得AI回复', async () => {
      const messageData = {
        conversationId: 1,
        content: '如何教3岁孩子数数？',
        userId: 1,
        attachments: []
      };

      const mockConversation = {
        id: 1,
        title: '数学教学辅助',
        type: 'educational',
        userId: 1,
        status: 'active',
        context: {
          subject: 'mathematics',
          grade: 'kindergarten'
        },
        systemPrompt: '你是一个专业的幼儿园数学教学助手',
        messageCount: 0,
        increment: jest.fn().mockResolvedValue(undefined)
      };

      const mockUserMessage = {
        id: 1,
        conversationId: 1,
        role: 'user',
        content: '如何教3岁孩子数数？',
        userId: 1,
        createdAt: new Date()
      };

      const mockAIResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '教3岁孩子数数可以通过以下方法：\n1. 使用具体物品进行计数\n2. 通过游戏和歌曲学习\n3. 日常生活中的数数练习'
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 80,
          total_tokens: 130
        }
      };

      const mockAssistantMessage = {
        id: 2,
        conversationId: 1,
        role: 'assistant',
        content: '教3岁孩子数数可以通过以下方法：\n1. 使用具体物品进行计数\n2. 通过游戏和歌曲学习\n3. 日常生活中的数数练习',
        model: 'gpt-4',
        usage: mockAIResponse.usage,
        createdAt: new Date()
      };

      mockAIConversation.findByPk.mockResolvedValue(mockConversation);
      mockAIMessage.create.mockResolvedValueOnce(mockUserMessage);
      mockOpenAIService.createChatCompletion.mockResolvedValue(mockAIResponse);
      mockAIMessage.create.mockResolvedValueOnce(mockAssistantMessage);

      const result = await aiAssistantService.sendMessage(messageData);

      expect(mockAIConversation.findByPk).toHaveBeenCalledWith(1);
      expect(mockAIMessage.create).toHaveBeenCalledTimes(2);
      expect(mockOpenAIService.createChatCompletion).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的幼儿园数学教学助手'
          },
          {
            role: 'user',
            content: '如何教3岁孩子数数？'
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      expect(mockConversation.increment).toHaveBeenCalledWith('messageCount', { by: 2 });
      expect(result).toEqual({
        userMessage: mockUserMessage,
        assistantMessage: mockAssistantMessage
      });
    });

    it('应该处理对话不存在的情况', async () => {
      const messageData = {
        conversationId: 999,
        content: '测试消息',
        userId: 1
      };

      mockAIConversation.findByPk.mockResolvedValue(null);

      await expect(aiAssistantService.sendMessage(messageData))
        .rejects.toThrow('对话不存在');
    });

    it('应该处理AI服务错误', async () => {
      const messageData = {
        conversationId: 1,
        content: '测试消息',
        userId: 1
      };

      const mockConversation = {
        id: 1,
        userId: 1,
        status: 'active',
        systemPrompt: '测试提示'
      };

      mockAIConversation.findByPk.mockResolvedValue(mockConversation);
      mockAIMessage.create.mockResolvedValue({ id: 1 });
      mockOpenAIService.createChatCompletion.mockRejectedValue(new Error('AI服务不可用'));

      await expect(aiAssistantService.sendMessage(messageData))
        .rejects.toThrow('AI服务不可用');
    });

    it('应该支持不同的AI模型', async () => {
      const messageData = {
        conversationId: 1,
        content: '测试消息',
        userId: 1,
        model: 'claude-3'
      };

      const mockConversation = {
        id: 1,
        userId: 1,
        status: 'active',
        systemPrompt: '测试提示'
      };

      const mockClaudeResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: '这是Claude的回复'
          }
        ],
        model: 'claude-3-sonnet-20240229',
        usage: {
          input_tokens: 20,
          output_tokens: 15
        }
      };

      mockAIConversation.findByPk.mockResolvedValue(mockConversation);
      mockAIMessage.create.mockResolvedValue({ id: 1 });
      mockAnthropicService.createMessage.mockResolvedValue(mockClaudeResponse);

      const result = await aiAssistantService.sendMessage(messageData);

      expect(mockAnthropicService.createMessage).toHaveBeenCalledWith({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: '测试消息'
          }
        ],
        system: '测试提示'
      });
      expect(result).toBeDefined();
    });
  });

  describe('getConversations', () => {
    it('应该获取用户的对话列表', async () => {
      const queryOptions = {
        userId: 1,
        page: 1,
        pageSize: 10,
        type: 'educational',
        status: 'active'
      };

      const mockConversations = [
        {
          id: 1,
          title: '数学教学辅助',
          type: 'educational',
          status: 'active',
          messageCount: 5,
          lastMessageAt: new Date(),
          createdAt: new Date()
        },
        {
          id: 2,
          title: '语言教学辅助',
          type: 'educational',
          status: 'active',
          messageCount: 3,
          lastMessageAt: new Date(),
          createdAt: new Date()
        }
      ];

      mockAIConversation.findAll.mockResolvedValue(mockConversations);
      mockAIConversation.count.mockResolvedValue(2);

      const result = await aiAssistantService.getConversations(queryOptions);

      expect(mockAIConversation.findAll).toHaveBeenCalledWith({
        where: {
          userId: 1,
          type: 'educational',
          status: 'active'
        },
        limit: 10,
        offset: 0,
        order: [['lastMessageAt', 'DESC']],
        include: expect.any(Array)
      });
      expect(result).toEqual({
        conversations: mockConversations,
        total: 2,
        page: 1,
        pageSize: 10
      });
    });

    it('应该支持搜索功能', async () => {
      const queryOptions = {
        userId: 1,
        search: '数学',
        page: 1,
        pageSize: 10
      };

      mockAIConversation.findAll.mockResolvedValue([]);
      mockAIConversation.count.mockResolvedValue(0);

      await aiAssistantService.getConversations(queryOptions);

      expect(mockAIConversation.findAll).toHaveBeenCalledWith({
        where: {
          userId: 1,
          title: { [mockSequelize.Op.like]: '%数学%' }
        },
        limit: 10,
        offset: 0,
        order: [['lastMessageAt', 'DESC']],
        include: expect.any(Array)
      });
    });
  });

  describe('getConversationById', () => {
    it('应该获取指定对话详情', async () => {
      const conversationId = 1;
      const userId = 1;

      const mockConversation = {
        id: 1,
        title: '数学教学辅助',
        type: 'educational',
        userId: 1,
        status: 'active',
        context: {
          subject: 'mathematics',
          grade: 'kindergarten'
        },
        messages: [
          {
            id: 1,
            role: 'user',
            content: '如何教孩子数数？',
            createdAt: new Date()
          },
          {
            id: 2,
            role: 'assistant',
            content: '可以通过游戏的方式...',
            createdAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockAIConversation.findByPk.mockResolvedValue(mockConversation);

      const result = await aiAssistantService.getConversationById(conversationId, userId);

      expect(mockAIConversation.findByPk).toHaveBeenCalledWith(conversationId, {
        where: { userId },
        include: expect.any(Array)
      });
      expect(result).toEqual(mockConversation);
    });

    it('应该处理对话不存在的情况', async () => {
      const conversationId = 999;
      const userId = 1;

      mockAIConversation.findByPk.mockResolvedValue(null);

      const result = await aiAssistantService.getConversationById(conversationId, userId);

      expect(result).toBeNull();
    });
  });

  describe('updateConversation', () => {
    it('应该成功更新对话', async () => {
      const conversationId = 1;
      const userId = 1;
      const updateData = {
        title: '数学教学辅助（更新）',
        context: {
          subject: 'mathematics',
          grade: 'kindergarten',
          topic: 'addition'
        }
      };

      const mockConversation = {
        id: 1,
        userId: 1,
        update: jest.fn().mockResolvedValue(undefined)
      };

      const mockUpdatedConversation = {
        id: 1,
        title: '数学教学辅助（更新）',
        context: updateData.context,
        updatedAt: new Date()
      };

      mockAIConversation.findByPk.mockResolvedValue(mockConversation);
      mockConversation.update.mockResolvedValue(mockUpdatedConversation);

      const result = await aiAssistantService.updateConversation(conversationId, userId, updateData);

      expect(mockAIConversation.findByPk).toHaveBeenCalledWith(conversationId, {
        where: { userId }
      });
      expect(mockConversation.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(mockUpdatedConversation);
    });

    it('应该处理更新不存在的对话', async () => {
      const conversationId = 999;
      const userId = 1;
      const updateData = { title: '不存在的对话' };

      mockAIConversation.findByPk.mockResolvedValue(null);

      const result = await aiAssistantService.updateConversation(conversationId, userId, updateData);

      expect(result).toBeNull();
    });
  });

  describe('deleteConversation', () => {
    it('应该成功删除对话', async () => {
      const conversationId = 1;
      const userId = 1;

      const mockConversation = {
        id: 1,
        userId: 1,
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockAIConversation.findByPk.mockResolvedValue(mockConversation);

      const result = await aiAssistantService.deleteConversation(conversationId, userId);

      expect(mockAIConversation.findByPk).toHaveBeenCalledWith(conversationId, {
        where: { userId }
      });
      expect(mockConversation.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('应该处理删除不存在的对话', async () => {
      const conversationId = 999;
      const userId = 1;

      mockAIConversation.findByPk.mockResolvedValue(null);

      const result = await aiAssistantService.deleteConversation(conversationId, userId);

      expect(result).toBe(false);
    });
  });

  describe('generateContent', () => {
    it('应该成功生成内容', async () => {
      const generateData = {
        prompt: '请为幼儿园小班制定一周的教学计划',
        model: 'gpt-4',
        parameters: {
          temperature: 0.7,
          maxTokens: 1000
        },
        context: {
          subject: 'general',
          grade: 'kindergarten'
        },
        userId: 1
      };

      const mockAIResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '以下是为幼儿园小班制定的一周教学计划...'
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 200,
          total_tokens: 250
        }
      };

      mockOpenAIService.createChatCompletion.mockResolvedValue(mockAIResponse);
      mockAnalyticsService.recordUsage.mockResolvedValue(undefined);

      const result = await aiAssistantService.generateContent(generateData);

      expect(mockOpenAIService.createChatCompletion).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: '请为幼儿园小班制定一周的教学计划'
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      expect(mockAnalyticsService.recordUsage).toHaveBeenCalledWith({
        userId: 1,
        action: 'generate_content',
        model: 'gpt-4',
        usage: mockAIResponse.usage
      });
      expect(result).toEqual({
        content: '以下是为幼儿园小班制定的一周教学计划...',
        model: 'gpt-4',
        usage: mockAIResponse.usage,
        generatedAt: expect.any(Date)
      });
    });
  });

  describe('analyzeText', () => {
    it('应该成功分析文本', async () => {
      const analyzeData = {
        text: '今天孩子们在数学课上表现很好',
        analysisType: 'sentiment',
        options: {
          includeKeywords: true,
          includeTopics: true
        },
        userId: 1
      };

      const mockAnalysisResult = {
        sentiment: {
          score: 0.8,
          label: 'positive',
          confidence: 0.95
        },
        keywords: ['孩子们', '数学课', '表现'],
        topics: ['教育', '数学', '学习'],
        summary: '文本表达了对孩子们数学学习表现的积极评价'
      };

      // Mock AI service call for text analysis
      mockOpenAIService.createChatCompletion.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockAnalysisResult)
            }
          }
        ],
        usage: {
          prompt_tokens: 30,
          completion_tokens: 50,
          total_tokens: 80
        }
      });

      const result = await aiAssistantService.analyzeText(analyzeData);

      expect(result).toEqual(expect.objectContaining({
        sentiment: expect.objectContaining({
          score: 0.8,
          label: 'positive'
        }),
        keywords: expect.arrayContaining(['孩子们', '数学课']),
        topics: expect.arrayContaining(['教育', '数学'])
      }));
    });
  });

  describe('getUsageStats', () => {
    it('应该获取用户使用统计', async () => {
      const userId = 1;
      const period = '30d';

      const mockStats = {
        totalConversations: 15,
        totalMessages: 120,
        totalTokensUsed: 15000,
        averageMessagesPerConversation: 8,
        mostUsedModel: 'gpt-4',
        dailyUsage: [
          { date: '2024-04-01', messages: 5, tokens: 600 },
          { date: '2024-04-02', messages: 8, tokens: 950 }
        ],
        topTopics: [
          { topic: 'mathematics', count: 45 },
          { topic: 'language', count: 32 }
        ]
      };

      mockAnalyticsService.getUsageStats.mockResolvedValue(mockStats);

      const result = await aiAssistantService.getUsageStats(userId, period);

      expect(mockAnalyticsService.getUsageStats).toHaveBeenCalledWith(userId, period);
      expect(result).toEqual(mockStats);
    });
  });

  describe('getAvailableModels', () => {
    it('应该获取可用的AI模型列表', async () => {
      const mockModels = [
        {
          id: 1,
          name: 'GPT-4',
          provider: 'openai',
          modelId: 'gpt-4',
          type: 'text',
          status: 'active',
          capabilities: ['chat', 'completion', 'analysis'],
          pricing: {
            inputTokens: 0.03,
            outputTokens: 0.06
          }
        },
        {
          id: 2,
          name: 'Claude-3',
          provider: 'anthropic',
          modelId: 'claude-3-sonnet-20240229',
          type: 'text',
          status: 'active',
          capabilities: ['chat', 'completion', 'analysis'],
          pricing: {
            inputTokens: 0.015,
            outputTokens: 0.075
          }
        }
      ];

      mockAIModel.findAll.mockResolvedValue(mockModels);
      mockCacheService.get.mockResolvedValue(null);
      mockCacheService.set.mockResolvedValue(undefined);

      const result = await aiAssistantService.getAvailableModels();

      expect(mockAIModel.findAll).toHaveBeenCalledWith({
        where: { status: 'active' },
        order: [['name', 'ASC']]
      });
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'ai:available_models',
        mockModels,
        3600
      );
      expect(result).toEqual(mockModels);
    });

    it('应该使用缓存的模型列表', async () => {
      const cachedModels = [
        { id: 1, name: 'GPT-4', status: 'active' }
      ];

      mockCacheService.get.mockResolvedValue(cachedModels);

      const result = await aiAssistantService.getAvailableModels();

      expect(mockCacheService.get).toHaveBeenCalledWith('ai:available_models');
      expect(result).toEqual(cachedModels);
      expect(mockAIModel.findAll).not.toHaveBeenCalled();
    });
  });

  describe('moderateContent', () => {
    it('应该检查内容是否合规', async () => {
      const content = '这是一段正常的教学内容';

      const mockModerationResult = {
        flagged: false,
        categories: {
          hate: false,
          harassment: false,
          violence: false,
          sexual: false,
          'self-harm': false
        },
        category_scores: {
          hate: 0.001,
          harassment: 0.002,
          violence: 0.001,
          sexual: 0.001,
          'self-harm': 0.001
        }
      };

      mockOpenAIService.moderateContent.mockResolvedValue({
        results: [mockModerationResult]
      });

      const result = await aiAssistantService.moderateContent(content);

      expect(mockOpenAIService.moderateContent).toHaveBeenCalledWith({
        input: content
      });
      expect(result).toEqual({
        isAppropriate: true,
        flagged: false,
        categories: mockModerationResult.categories,
        scores: mockModerationResult.category_scores
      });
    });

    it('应该标记不当内容', async () => {
      const content = '包含不当内容的文本';

      const mockModerationResult = {
        flagged: true,
        categories: {
          hate: true,
          harassment: false,
          violence: false,
          sexual: false,
          'self-harm': false
        },
        category_scores: {
          hate: 0.95,
          harassment: 0.1,
          violence: 0.05,
          sexual: 0.02,
          'self-harm': 0.01
        }
      };

      mockOpenAIService.moderateContent.mockResolvedValue({
        results: [mockModerationResult]
      });

      const result = await aiAssistantService.moderateContent(content);

      expect(result).toEqual({
        isAppropriate: false,
        flagged: true,
        categories: mockModerationResult.categories,
        scores: mockModerationResult.category_scores
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理数据库连接错误', async () => {
      const conversationData = {
        title: '测试对话',
        type: 'general',
        userId: 1
      };

      const error = new Error('数据库连接失败');
      mockAIConversation.create.mockRejectedValue(error);

      await expect(aiAssistantService.createConversation(conversationData))
        .rejects.toThrow('数据库连接失败');
    });

    it('应该处理AI服务限流', async () => {
      const messageData = {
        conversationId: 1,
        content: '测试消息',
        userId: 1
      };

      const mockConversation = {
        id: 1,
        userId: 1,
        status: 'active',
        systemPrompt: '测试提示'
      };

      mockAIConversation.findByPk.mockResolvedValue(mockConversation);
      mockAIMessage.create.mockResolvedValue({ id: 1 });
      mockOpenAIService.createChatCompletion.mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      await expect(aiAssistantService.sendMessage(messageData))
        .rejects.toThrow('Rate limit exceeded');
    });

    it('应该处理事务回滚', async () => {
      const messageData = {
        conversationId: 1,
        content: '测试消息',
        userId: 1
      };

      const mockConversation = {
        id: 1,
        userId: 1,
        status: 'active',
        systemPrompt: '测试提示'
      };

      mockAIConversation.findByPk.mockResolvedValue(mockConversation);
      mockAIMessage.create.mockRejectedValue(new Error('创建消息失败'));
      mockTransaction.rollback.mockResolvedValue(undefined);

      await expect(aiAssistantService.sendMessage(messageData))
        .rejects.toThrow('创建消息失败');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
