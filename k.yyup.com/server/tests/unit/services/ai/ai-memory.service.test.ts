import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockAIMemory = {
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockUser = {
  findByPk: jest.fn()
};

const mockAIConversation = {
  findByPk: jest.fn()
};

// Mock Sequelize transaction
const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn().mockResolvedValue(mockTransaction),
  Op: {
    like: Symbol('like'),
    gte: Symbol('gte'),
    lte: Symbol('lte'),
    in: Symbol('in'),
    or: Symbol('or'),
    and: Symbol('and')
  }
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/ai-memory.model', () => ({
  AIMemory: mockAIMemory
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/ai-conversation.model', () => ({
  AIConversation: mockAIConversation
}));

jest.unstable_mockModule('../../../../../src/config/database', () => ({
  sequelize: mockSequelize
}));

jest.unstable_mockModule('../../../../../src/utils/apiError', () => ({
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

describe('AI Memory Service', () => {
  let AIMemoryService: any;
  let aiMemoryService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/ai/ai-memory.service');
    AIMemoryService = imported.AIMemoryService;
    aiMemoryService = new AIMemoryService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('createMemory', () => {
    it('应该成功创建AI记忆', async () => {
      const memoryData = {
        userId: 1,
        conversationId: 1,
        type: 'preference',
        key: 'child_age',
        value: '4岁',
        context: {
          source: 'conversation',
          confidence: 0.9,
          extractedAt: new Date()
        },
        importance: 'high',
        tags: ['个人信息', '孩子年龄']
      };

      const mockCreatedMemory = {
        id: 1,
        userId: 1,
        conversationId: 1,
        type: 'preference',
        key: 'child_age',
        value: '4岁',
        context: memoryData.context,
        importance: 'high',
        tags: ['个人信息', '孩子年龄'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUser.findByPk.mockResolvedValue({ id: 1, name: '张家长' });
      mockAIConversation.findByPk.mockResolvedValue({ id: 1, userId: 1 });
      mockAIMemory.create.mockResolvedValue(mockCreatedMemory);

      const result = await aiMemoryService.createMemory(memoryData);

      expect(mockUser.findByPk).toHaveBeenCalledWith(1);
      expect(mockAIConversation.findByPk).toHaveBeenCalledWith(1);
      expect(mockAIMemory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          conversationId: 1,
          type: 'preference',
          key: 'child_age',
          value: '4岁',
          context: memoryData.context,
          importance: 'high',
          tags: ['个人信息', '孩子年龄'],
          isActive: true
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedMemory);
    });

    it('应该在用户不存在时抛出错误', async () => {
      const memoryData = {
        userId: 999,
        type: 'preference',
        key: 'test_key',
        value: 'test_value'
      };

      mockUser.findByPk.mockResolvedValue(null);

      await expect(aiMemoryService.createMemory(memoryData))
        .rejects
        .toThrow('用户不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该在对话不存在时抛出错误', async () => {
      const memoryData = {
        userId: 1,
        conversationId: 999,
        type: 'preference',
        key: 'test_key',
        value: 'test_value'
      };

      mockUser.findByPk.mockResolvedValue({ id: 1 });
      mockAIConversation.findByPk.mockResolvedValue(null);

      await expect(aiMemoryService.createMemory(memoryData))
        .rejects
        .toThrow('对话不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该支持不关联对话的记忆创建', async () => {
      const memoryData = {
        userId: 1,
        type: 'fact',
        key: 'user_location',
        value: '北京市朝阳区',
        importance: 'medium'
      };

      mockUser.findByPk.mockResolvedValue({ id: 1 });
      mockAIMemory.create.mockResolvedValue({ id: 1, ...memoryData });

      const result = await aiMemoryService.createMemory(memoryData);

      expect(mockAIConversation.findByPk).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getMemoryById', () => {
    it('应该成功获取记忆详情', async () => {
      const memoryId = 1;
      const mockMemory = {
        id: 1,
        userId: 1,
        conversationId: 1,
        type: 'preference',
        key: 'child_age',
        value: '4岁',
        context: {
          source: 'conversation',
          confidence: 0.9
        },
        importance: 'high',
        tags: ['个人信息', '孩子年龄'],
        isActive: true,
        user: { id: 1, name: '张家长' },
        conversation: { id: 1, title: '关于学前教育的咨询' }
      };

      mockAIMemory.findByPk.mockResolvedValue(mockMemory);

      const result = await aiMemoryService.getMemoryById(memoryId);

      expect(mockAIMemory.findByPk).toHaveBeenCalledWith(memoryId, {
        include: [
          {
            model: mockUser,
            as: 'user',
            attributes: ['id', 'username', 'realName']
          },
          {
            model: mockAIConversation,
            as: 'conversation',
            attributes: ['id', 'title', 'type']
          }
        ]
      });
      expect(result).toEqual(mockMemory);
    });

    it('应该在记忆不存在时抛出错误', async () => {
      const memoryId = 999;

      mockAIMemory.findByPk.mockResolvedValue(null);

      await expect(aiMemoryService.getMemoryById(memoryId))
        .rejects
        .toThrow('记忆不存在');
    });
  });

  describe('getUserMemories', () => {
    it('应该成功获取用户记忆列表', async () => {
      const userId = 1;
      const options = {
        page: 1,
        pageSize: 10,
        type: 'preference',
        importance: 'high',
        isActive: true
      };

      const mockMemories = [
        {
          id: 1,
          type: 'preference',
          key: 'child_age',
          value: '4岁',
          importance: 'high',
          tags: ['个人信息'],
          createdAt: new Date()
        },
        {
          id: 2,
          type: 'preference',
          key: 'learning_style',
          value: '视觉学习者',
          importance: 'high',
          tags: ['学习偏好'],
          createdAt: new Date()
        }
      ];

      mockAIMemory.findAll.mockResolvedValue(mockMemories);
      mockAIMemory.count.mockResolvedValue(2);

      const result = await aiMemoryService.getUserMemories(userId, options);

      expect(mockAIMemory.findAll).toHaveBeenCalledWith({
        where: {
          userId: 1,
          type: 'preference',
          importance: 'high',
          isActive: true
        },
        order: [['updatedAt', 'DESC']],
        limit: 10,
        offset: 0,
        attributes: [
          'id', 'type', 'key', 'value', 'importance', 'tags',
          'isActive', 'createdAt', 'updatedAt'
        ]
      });

      expect(result).toEqual({
        memories: mockMemories,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
    });

    it('应该支持按标签筛选', async () => {
      const userId = 1;
      const options = {
        tags: ['个人信息', '学习偏好']
      };

      await aiMemoryService.getUserMemories(userId, options);

      expect(mockAIMemory.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tags: { [mockSequelize.Op.in]: ['个人信息', '学习偏好'] }
          })
        })
      );
    });

    it('应该支持按关键字搜索', async () => {
      const userId = 1;
      const options = {
        search: '年龄'
      };

      await aiMemoryService.getUserMemories(userId, options);

      expect(mockAIMemory.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [mockSequelize.Op.or]: [
              { key: { [mockSequelize.Op.like]: '%年龄%' } },
              { value: { [mockSequelize.Op.like]: '%年龄%' } }
            ]
          })
        })
      );
    });
  });

  describe('updateMemory', () => {
    it('应该成功更新记忆', async () => {
      const memoryId = 1;
      const updateData = {
        value: '5岁',
        importance: 'medium',
        tags: ['个人信息', '孩子年龄', '已更新'],
        context: {
          source: 'manual_update',
          updatedAt: new Date(),
          previousValue: '4岁'
        }
      };

      const mockMemory = {
        id: 1,
        userId: 1,
        key: 'child_age',
        value: '4岁',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockAIMemory.findByPk.mockResolvedValue(mockMemory);

      const result = await aiMemoryService.updateMemory(memoryId, updateData);

      expect(mockAIMemory.findByPk).toHaveBeenCalledWith(memoryId);
      expect(mockMemory.update).toHaveBeenCalledWith(
        expect.objectContaining({
          value: '5岁',
          importance: 'medium',
          tags: ['个人信息', '孩子年龄', '已更新'],
          context: updateData.context
        })
      );
      expect(result).toBe(true);
    });

    it('应该在记忆不存在时抛出错误', async () => {
      const memoryId = 999;
      const updateData = { value: '新值' };

      mockAIMemory.findByPk.mockResolvedValue(null);

      await expect(aiMemoryService.updateMemory(memoryId, updateData))
        .rejects
        .toThrow('记忆不存在');
    });
  });

  describe('deleteMemory', () => {
    it('应该成功软删除记忆', async () => {
      const memoryId = 1;

      const mockMemory = {
        id: 1,
        isActive: true,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockAIMemory.findByPk.mockResolvedValue(mockMemory);

      const result = await aiMemoryService.deleteMemory(memoryId);

      expect(mockAIMemory.findByPk).toHaveBeenCalledWith(memoryId);
      expect(mockMemory.update).toHaveBeenCalledWith({ isActive: false });
      expect(result).toBe(true);
    });

    it('应该支持硬删除记忆', async () => {
      const memoryId = 1;
      const hardDelete = true;

      const mockMemory = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockAIMemory.findByPk.mockResolvedValue(mockMemory);

      const result = await aiMemoryService.deleteMemory(memoryId, hardDelete);

      expect(mockMemory.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('应该在记忆不存在时抛出错误', async () => {
      const memoryId = 999;

      mockAIMemory.findByPk.mockResolvedValue(null);

      await expect(aiMemoryService.deleteMemory(memoryId))
        .rejects
        .toThrow('记忆不存在');
    });
  });

  describe('searchMemories', () => {
    it('应该成功搜索记忆', async () => {
      const userId = 1;
      const searchOptions = {
        query: '学习',
        types: ['preference', 'fact'],
        importance: ['high', 'medium'],
        tags: ['学习偏好'],
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
        page: 1,
        pageSize: 10
      };

      const mockSearchResults = [
        {
          id: 1,
          type: 'preference',
          key: 'learning_style',
          value: '视觉学习者',
          importance: 'high',
          tags: ['学习偏好'],
          createdAt: new Date('2024-06-15')
        },
        {
          id: 2,
          type: 'fact',
          key: 'favorite_subject',
          value: '数学',
          importance: 'medium',
          tags: ['学习偏好', '兴趣'],
          createdAt: new Date('2024-08-20')
        }
      ];

      mockAIMemory.findAll.mockResolvedValue(mockSearchResults);
      mockAIMemory.count.mockResolvedValue(2);

      const result = await aiMemoryService.searchMemories(userId, searchOptions);

      expect(mockAIMemory.findAll).toHaveBeenCalledWith({
        where: {
          userId: 1,
          type: { [mockSequelize.Op.in]: ['preference', 'fact'] },
          importance: { [mockSequelize.Op.in]: ['high', 'medium'] },
          tags: { [mockSequelize.Op.in]: ['学习偏好'] },
          createdAt: {
            [mockSequelize.Op.gte]: new Date('2024-01-01'),
            [mockSequelize.Op.lte]: new Date('2024-12-31')
          },
          [mockSequelize.Op.or]: [
            { key: { [mockSequelize.Op.like]: '%学习%' } },
            { value: { [mockSequelize.Op.like]: '%学习%' } }
          ],
          isActive: true
        },
        order: [['updatedAt', 'DESC']],
        limit: 10,
        offset: 0
      });

      expect(result).toEqual({
        memories: mockSearchResults,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
    });
  });

  describe('getMemoryStatistics', () => {
    it('应该成功获取记忆统计信息', async () => {
      const userId = 1;

      const mockTypeStats = [
        { type: 'preference', count: 15 },
        { type: 'fact', count: 8 },
        { type: 'behavior', count: 5 }
      ];

      const mockImportanceStats = [
        { importance: 'high', count: 12 },
        { importance: 'medium', count: 10 },
        { importance: 'low', count: 6 }
      ];

      mockAIMemory.findAll
        .mockResolvedValueOnce(mockTypeStats)
        .mockResolvedValueOnce(mockImportanceStats);

      const result = await aiMemoryService.getMemoryStatistics(userId);

      expect(result).toEqual({
        totalMemories: 28,
        activeMemories: 28,
        byType: {
          preference: 15,
          fact: 8,
          behavior: 5
        },
        byImportance: {
          high: 12,
          medium: 10,
          low: 6
        },
        averageMemoriesPerConversation: expect.any(Number)
      });
    });

    it('应该处理没有记忆的情况', async () => {
      const userId = 999;

      mockAIMemory.findAll.mockResolvedValue([]);

      const result = await aiMemoryService.getMemoryStatistics(userId);

      expect(result).toEqual({
        totalMemories: 0,
        activeMemories: 0,
        byType: {},
        byImportance: {},
        averageMemoriesPerConversation: 0
      });
    });
  });

  describe('getRelatedMemories', () => {
    it('应该成功获取相关记忆', async () => {
      const memoryId = 1;
      const options = {
        limit: 5,
        similarityThreshold: 0.7
      };

      const mockMemory = {
        id: 1,
        userId: 1,
        type: 'preference',
        key: 'child_age',
        value: '4岁',
        tags: ['个人信息', '孩子年龄']
      };

      const mockRelatedMemories = [
        {
          id: 2,
          type: 'preference',
          key: 'child_grade',
          value: '中班',
          tags: ['个人信息', '教育阶段'],
          similarity: 0.8
        },
        {
          id: 3,
          type: 'fact',
          key: 'development_stage',
          value: '学前期',
          tags: ['发展阶段', '孩子年龄'],
          similarity: 0.75
        }
      ];

      mockAIMemory.findByPk.mockResolvedValue(mockMemory);
      mockAIMemory.findAll.mockResolvedValue(mockRelatedMemories);

      const result = await aiMemoryService.getRelatedMemories(memoryId, options);

      expect(mockAIMemory.findByPk).toHaveBeenCalledWith(memoryId);
      expect(mockAIMemory.findAll).toHaveBeenCalledWith({
        where: {
          userId: 1,
          id: { [expect.any(Symbol)]: 1 }, // Op.ne
          isActive: true,
          [mockSequelize.Op.or]: [
            { type: 'preference' },
            { tags: { [mockSequelize.Op.in]: ['个人信息', '孩子年龄'] } }
          ]
        },
        limit: 5,
        order: [['updatedAt', 'DESC']]
      });

      expect(result).toEqual(mockRelatedMemories);
    });

    it('应该在记忆不存在时抛出错误', async () => {
      const memoryId = 999;

      mockAIMemory.findByPk.mockResolvedValue(null);

      await expect(aiMemoryService.getRelatedMemories(memoryId))
        .rejects
        .toThrow('记忆不存在');
    });
  });

  describe('consolidateMemories', () => {
    it('应该成功合并重复记忆', async () => {
      const userId = 1;
      const options = {
        similarityThreshold: 0.9,
        dryRun: false
      };

      const mockDuplicateMemories = [
        {
          id: 1,
          key: 'child_age',
          value: '4岁',
          createdAt: new Date('2024-01-01')
        },
        {
          id: 2,
          key: 'child_age',
          value: '四岁',
          createdAt: new Date('2024-02-01')
        }
      ];

      mockAIMemory.findAll.mockResolvedValue(mockDuplicateMemories);
      mockAIMemory.update.mockResolvedValue([1]); // 更新了1条记录

      const result = await aiMemoryService.consolidateMemories(userId, options);

      expect(result).toEqual({
        consolidatedCount: 1,
        removedCount: 1,
        details: expect.any(Array)
      });

      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该支持试运行模式', async () => {
      const userId = 1;
      const options = {
        dryRun: true
      };

      const mockDuplicateMemories = [
        { id: 1, key: 'child_age', value: '4岁' },
        { id: 2, key: 'child_age', value: '四岁' }
      ];

      mockAIMemory.findAll.mockResolvedValue(mockDuplicateMemories);

      const result = await aiMemoryService.consolidateMemories(userId, options);

      expect(result.dryRun).toBe(true);
      expect(mockAIMemory.update).not.toHaveBeenCalled();
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
