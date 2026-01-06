import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Sequelize
const mockSequelize = {
  transaction: jest.fn(),
  query: jest.fn(),
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
  finished: 'pending'
};

// Mock models
const mockAIConversation = {
  create: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockAIMessage = {
  create: jest.fn(),
  findAll: jest.fn(),
  bulkCreate: jest.fn()
};

const mockUser = {
  findByPk: jest.fn()
};

const mockAIModelConfig = {
  findByPk: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../../src/init', () => ({
  sequelize: mockSequelize
}));

jest.unstable_mockModule('../../../../../../src/services/ai/ai-conversation.service', () => ({
  AIConversationService: jest.fn().mockImplementation(() => ({
    createConversation: jest.fn(),
    getConversationById: jest.fn(),
    getConversations: jest.fn(),
    updateConversation: jest.fn(),
    deleteConversation: jest.fn(),
    addMessage: jest.fn(),
    getMessages: jest.fn(),
    getConversationSummary: jest.fn(),
    archiveConversation: jest.fn()
  }))
}));

jest.unstable_mockModule('../../../../../../src/models/ai-conversation.model', () => ({
  AIConversation: mockAIConversation
}));

jest.unstable_mockModule('../../../../../../src/models/ai-message.model', () => ({
  AIMessage: mockAIMessage
}));

jest.unstable_mockModule('../../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../../src/models/ai-model-config.model', () => ({
  AIModelConfig: mockAIModelConfig
}));

jest.unstable_mockModule('../../../../../../src/utils/apiError', () => ({
  ApiError: jest.fn().mockImplementation((message, statusCode) => {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  })
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

describe('AI Conversation Service', () => {
  let aiConversationService: any;
  let AIConversationService: any;

  beforeAll(async () => {
    const { AIConversationService: ImportedAIConversationService } = await import('../../../../../../src/services/ai/ai-conversation.service');
    AIConversationService = ImportedAIConversationService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    aiConversationService = new AIConversationService();
  });

  describe('createConversation', () => {
    it('应该成功创建AI对话', async () => {
      const conversationData = {
        userId: 1,
        title: '关于幼儿园活动的咨询',
        modelId: 1,
        context: '用户想了解幼儿园的活动安排',
        metadata: { source: 'web', category: 'activity' }
      };

      const mockCreatedConversation = {
        id: 1,
        ...conversationData,
        status: 'active',
        messageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUser.findByPk.mockResolvedValue({ id: 1, realName: '张三' });
      mockAIModelConfig.findByPk.mockResolvedValue({ id: 1, name: 'GPT-4', status: 'active' });
      mockAIConversation.create.mockResolvedValue(mockCreatedConversation);

      const result = await aiConversationService.createConversation(conversationData);

      expect(result).toEqual(mockCreatedConversation);
      expect(mockUser.findByPk).toHaveBeenCalledWith(1, { transaction: mockTransaction });
      expect(mockAIModelConfig.findByPk).toHaveBeenCalledWith(1, { transaction: mockTransaction });
      expect(mockAIConversation.create).toHaveBeenCalledWith(conversationData, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理用户不存在的情况', async () => {
      const conversationData = {
        userId: 999,
        title: '测试对话',
        modelId: 1
      };

      mockUser.findByPk.mockResolvedValue(null);

      await expect(aiConversationService.createConversation(conversationData)).rejects.toThrow('用户不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理AI模型不存在的情况', async () => {
      const conversationData = {
        userId: 1,
        title: '测试对话',
        modelId: 999
      };

      mockUser.findByPk.mockResolvedValue({ id: 1 });
      mockAIModelConfig.findByPk.mockResolvedValue(null);

      await expect(aiConversationService.createConversation(conversationData)).rejects.toThrow('AI模型不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getConversationById', () => {
    it('应该成功获取对话信息', async () => {
      const conversationId = 1;
      const mockConversationData = {
        id: 1,
        title: '关于幼儿园活动的咨询',
        status: 'active',
        messageCount: 5,
        user: {
          id: 1,
          realName: '张三'
        },
        model: {
          id: 1,
          name: 'GPT-4'
        }
      };

      mockAIConversation.findByPk.mockResolvedValue(mockConversationData);

      const result = await aiConversationService.getConversationById(conversationId);

      expect(result).toEqual(mockConversationData);
      expect(mockAIConversation.findByPk).toHaveBeenCalledWith(conversationId, {
        include: expect.arrayContaining([
          expect.objectContaining({
            model: expect.anything(),
            attributes: expect.any(Array)
          })
        ])
      });
    });

    it('应该处理对话不存在的情况', async () => {
      const conversationId = 999;
      mockAIConversation.findByPk.mockResolvedValue(null);

      await expect(aiConversationService.getConversationById(conversationId)).rejects.toThrow('对话不存在');
    });
  });

  describe('getConversations', () => {
    it('应该成功获取对话列表', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10,
        userId: 1,
        status: 'active'
      };

      const mockConversations = [
        {
          id: 1,
          title: '关于幼儿园活动的咨询',
          status: 'active',
          messageCount: 5,
          createdAt: new Date()
        },
        {
          id: 2,
          title: '招生政策咨询',
          status: 'active',
          messageCount: 3,
          createdAt: new Date()
        }
      ];

      mockAIConversation.findAll.mockResolvedValue(mockConversations);
      mockAIConversation.count.mockResolvedValue(2);

      const result = await aiConversationService.getConversations(queryParams);

      expect(result).toEqual({
        conversations: mockConversations,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });

      expect(mockAIConversation.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId: 1,
          status: 'active'
        }),
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        include: expect.any(Array)
      });
    });

    it('应该支持搜索功能', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10,
        search: '活动'
      };

      mockAIConversation.findAll.mockResolvedValue([]);
      mockAIConversation.count.mockResolvedValue(0);

      await aiConversationService.getConversations(queryParams);

      expect(mockAIConversation.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          title: expect.objectContaining({
            [expect.any(Symbol)]: '%活动%'
          })
        }),
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        include: expect.any(Array)
      });
    });
  });

  describe('addMessage', () => {
    it('应该成功添加消息到对话', async () => {
      const conversationId = 1;
      const messageData = {
        role: 'user',
        content: '请问幼儿园有哪些活动？',
        metadata: { timestamp: new Date() }
      };

      const mockConversation = {
        id: 1,
        messageCount: 5,
        update: jest.fn().mockResolvedValue(undefined)
      };

      const mockCreatedMessage = {
        id: 1,
        conversationId,
        ...messageData,
        createdAt: new Date()
      };

      mockAIConversation.findByPk.mockResolvedValue(mockConversation);
      mockAIMessage.create.mockResolvedValue(mockCreatedMessage);

      const result = await aiConversationService.addMessage(conversationId, messageData);

      expect(result).toEqual(mockCreatedMessage);
      expect(mockAIConversation.findByPk).toHaveBeenCalledWith(conversationId, { transaction: mockTransaction });
      expect(mockAIMessage.create).toHaveBeenCalledWith({
        conversationId,
        ...messageData
      }, { transaction: mockTransaction });
      expect(mockConversation.update).toHaveBeenCalledWith({
        messageCount: 6,
        lastMessageAt: expect.any(Date)
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理对话不存在的情况', async () => {
      const conversationId = 999;
      const messageData = {
        role: 'user',
        content: '测试消息'
      };

      mockAIConversation.findByPk.mockResolvedValue(null);

      await expect(aiConversationService.addMessage(conversationId, messageData)).rejects.toThrow('对话不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getMessages', () => {
    it('应该成功获取对话消息', async () => {
      const conversationId = 1;
      const queryParams = {
        page: 1,
        pageSize: 20
      };

      const mockMessages = [
        {
          id: 1,
          role: 'user',
          content: '请问幼儿园有哪些活动？',
          createdAt: new Date()
        },
        {
          id: 2,
          role: 'assistant',
          content: '我们幼儿园有很多丰富的活动...',
          createdAt: new Date()
        }
      ];

      mockAIMessage.findAll.mockResolvedValue(mockMessages);

      const result = await aiConversationService.getMessages(conversationId, queryParams);

      expect(result).toEqual(mockMessages);
      expect(mockAIMessage.findAll).toHaveBeenCalledWith({
        where: { conversationId },
        limit: 20,
        offset: 0,
        order: [['createdAt', 'ASC']]
      });
    });

    it('应该支持消息类型筛选', async () => {
      const conversationId = 1;
      const queryParams = {
        page: 1,
        pageSize: 20,
        role: 'user'
      };

      mockAIMessage.findAll.mockResolvedValue([]);

      await aiConversationService.getMessages(conversationId, queryParams);

      expect(mockAIMessage.findAll).toHaveBeenCalledWith({
        where: {
          conversationId,
          role: 'user'
        },
        limit: 20,
        offset: 0,
        order: [['createdAt', 'ASC']]
      });
    });
  });

  describe('updateConversation', () => {
    it('应该成功更新对话信息', async () => {
      const conversationId = 1;
      const updateData = {
        title: '更新后的对话标题',
        status: 'archived'
      };

      const mockExistingConversation = {
        id: 1,
        title: '原始标题',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockAIConversation.findByPk.mockResolvedValue(mockExistingConversation);

      const result = await aiConversationService.updateConversation(conversationId, updateData);

      expect(result).toBe(true);
      expect(mockAIConversation.findByPk).toHaveBeenCalledWith(conversationId, { transaction: mockTransaction });
      expect(mockExistingConversation.update).toHaveBeenCalledWith(updateData, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理对话不存在的情况', async () => {
      const conversationId = 999;
      const updateData = { title: '不存在的对话' };

      mockAIConversation.findByPk.mockResolvedValue(null);

      await expect(aiConversationService.updateConversation(conversationId, updateData)).rejects.toThrow('对话不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('archiveConversation', () => {
    it('应该成功归档对话', async () => {
      const conversationId = 1;
      const mockConversation = {
        id: 1,
        status: 'active',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockAIConversation.findByPk.mockResolvedValue(mockConversation);

      const result = await aiConversationService.archiveConversation(conversationId);

      expect(result).toBe(true);
      expect(mockConversation.update).toHaveBeenCalledWith({
        status: 'archived',
        archivedAt: expect.any(Date)
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理已归档的对话', async () => {
      const conversationId = 1;
      const mockConversation = {
        id: 1,
        status: 'archived'
      };

      mockAIConversation.findByPk.mockResolvedValue(mockConversation);

      await expect(aiConversationService.archiveConversation(conversationId)).rejects.toThrow('对话已归档');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
