import { Sequelize, DataTypes } from 'sequelize';
import { vi } from 'vitest'
import { initAIConversation, initAIConversationAssociations, AIConversation } from '../../../src/models/ai-conversation.model';


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

describe('AIConversation Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });
    
    // 初始化模型
    initAIConversation(sequelize);
    
    // 同步数据库
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await AIConversation.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have the correct model name', () => {
      expect(AIConversation.tableName).toBe('ai_conversations');
    });

    it('should have all required attributes', () => {
      const attributes = Object.keys(AIConversation.getAttributes());
      const requiredAttributes = [
        'id', 'userId', 'title', 'summary', 'lastMessageAt', 'messageCount',
        'isArchived', 'lastPagePath', 'pageContext', 'lastPageUpdateAt',
        'usedMemoryIds', 'createdAt', 'updatedAt'
      ];
      
      requiredAttributes.forEach(attr => {
        expect(attributes).toContain(attr);
      });
    });

    it('should have correct field configurations', () => {
      const model = AIConversation.getAttributes();
      
      // 检查主键
      expect(model.id.primaryKey).toBe(true);
      expect(model.id.defaultValue).toBeDefined();
      
      // 检查必需字段
      expect(model.userId.allowNull).toBe(false);
      
      // 检查可选字段
      expect(model.title.allowNull).toBe(true);
      expect(model.summary.allowNull).toBe(true);
      expect(model.lastPagePath.allowNull).toBe(true);
      expect(model.pageContext.allowNull).toBe(true);
      expect(model.lastPageUpdateAt.allowNull).toBe(true);
      expect(model.usedMemoryIds.allowNull).toBe(true);
      
      // 检查默认值
      expect(model.lastMessageAt.defaultValue).toBeDefined();
      expect(model.messageCount.defaultValue).toBe(0);
      expect(model.isArchived.defaultValue).toBe(false);
      expect(model.createdAt.defaultValue).toBeDefined();
      expect(model.updatedAt.defaultValue).toBeDefined();
    });

    it('should have correct field types', () => {
      const model = AIConversation.getAttributes();
      
      expect(model.id.type).toBeInstanceOf(DataTypes.STRING);
      expect(model.userId.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(model.title.type).toBeInstanceOf(DataTypes.STRING);
      expect(model.summary.type).toBeInstanceOf(DataTypes.TEXT);
      expect(model.lastMessageAt.type).toBeInstanceOf(DataTypes.DATE);
      expect(model.messageCount.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(model.isArchived.type).toBeInstanceOf(DataTypes.BOOLEAN);
      expect(model.lastPagePath.type).toBeInstanceOf(DataTypes.STRING);
      expect(model.pageContext.type).toBeInstanceOf(DataTypes.TEXT);
      expect(model.lastPageUpdateAt.type).toBeInstanceOf(DataTypes.DATE);
      expect(model.usedMemoryIds.type).toBeInstanceOf(DataTypes.JSON);
    });
  });

  describe('Model Options', () => {
    it('should have correct table options', () => {
      const options = AIConversation.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBeUndefined(); // 没有软删除
      expect(options.underscored).toBe(true);
    });

    it('should have correct indexes', () => {
      const options = AIConversation.options;
      
      expect(options.indexes).toBeDefined();
      expect(options.indexes).toHaveLength(3);
      
      // 检查索引配置
      const indexNames = options.indexes.map((index: any) => index.name);
      expect(indexNames).toContain('external_user_id_idx');
      expect(indexNames).toContain('last_message_at_idx');
      expect(indexNames).toContain('is_archived_idx');
    });

    it('should have correct timestamp fields', () => {
      const attributes = AIConversation.getAttributes();
      
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.deletedAt).toBeUndefined(); // 没有软删除
    });
  });

  describe('Model Creation', () => {
    it('should create a new conversation with valid data', async () => {
      const conversationData = {
        id: 'conv-12345-abcde',
        userId: 1001,
        title: '教学计划讨论',
        summary: '关于下学期教学计划的讨论',
        lastMessageAt: new Date('2023-06-15T09:45:10Z'),
        messageCount: 15,
        isArchived: false,
        lastPagePath: '/dashboard/teaching-plans',
        pageContext: '当前正在查看教学计划页面',
        lastPageUpdateAt: new Date('2023-06-15T09:45:10Z'),
        usedMemoryIds: [1, 2, 3],
      };

      const conversation = await AIConversation.create(conversationData);

      expect(conversation.id).toBe(conversationData.id);
      expect(conversation.userId).toBe(conversationData.userId);
      expect(conversation.title).toBe(conversationData.title);
      expect(conversation.summary).toBe(conversationData.summary);
      expect(conversation.lastMessageAt).toEqual(conversationData.lastMessageAt);
      expect(conversation.messageCount).toBe(conversationData.messageCount);
      expect(conversation.isArchived).toBe(conversationData.isArchived);
      expect(conversation.lastPagePath).toBe(conversationData.lastPagePath);
      expect(conversation.pageContext).toBe(conversationData.pageContext);
      expect(conversation.lastPageUpdateAt).toEqual(conversationData.lastPageUpdateAt);
      expect(conversation.usedMemoryIds).toEqual(conversationData.usedMemoryIds);
      expect(conversation.createdAt).toBeDefined();
      expect(conversation.updatedAt).toBeDefined();
    });

    it('should create conversation with default values', async () => {
      const conversationData = {
        userId: 1001,
      };

      const conversation = await AIConversation.create(conversationData);

      expect(conversation.id).toBeDefined(); // UUID v4
      expect(conversation.userId).toBe(conversationData.userId);
      expect(conversation.title).toBeNull();
      expect(conversation.summary).toBeNull();
      expect(conversation.lastMessageAt).toBeDefined();
      expect(conversation.messageCount).toBe(0);
      expect(conversation.isArchived).toBe(false);
      expect(conversation.lastPagePath).toBeNull();
      expect(conversation.pageContext).toBeNull();
      expect(conversation.lastPageUpdateAt).toBeNull();
      expect(conversation.usedMemoryIds).toBeNull();
      expect(conversation.createdAt).toBeDefined();
      expect(conversation.updatedAt).toBeDefined();
    });

    it('should create conversation with minimal required data', async () => {
      const conversationData = {
        userId: 1001,
        title: 'Simple Conversation',
      };

      const conversation = await AIConversation.create(conversationData);

      expect(conversation.id).toBeDefined();
      expect(conversation.userId).toBe(conversationData.userId);
      expect(conversation.title).toBe(conversationData.title);
      expect(conversation.messageCount).toBe(0);
      expect(conversation.isArchived).toBe(false);
    });

    it('should fail to create conversation without userId', async () => {
      const invalidData = {
        title: 'Test Conversation',
        // 缺少 userId
      };

      await expect(AIConversation.create(invalidData as any)).rejects.toThrow();
    });

    it('should generate UUID automatically when not provided', async () => {
      const conversationData = {
        userId: 1001,
      };

      const conversation = await AIConversation.create(conversationData);

      expect(conversation.id).toBeDefined();
      expect(conversation.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  describe('Field Validation', () => {
    it('should validate userId field', async () => {
      const validData = {
        userId: 1001,
      };

      // 测试有效值
      await expect(AIConversation.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, userId: 'invalid_user_id' };
      await expect(AIConversation.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate messageCount field', async () => {
      const validData = {
        userId: 1001,
        messageCount: 15,
      };

      // 测试有效值
      await expect(AIConversation.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, messageCount: 'invalid_count' };
      await expect(AIConversation.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate isArchived field', async () => {
      const validData = {
        userId: 1001,
        isArchived: true,
      };

      // 测试有效值
      await expect(AIConversation.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, isArchived: 'invalid_boolean' };
      await expect(AIConversation.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate date fields', async () => {
      const validData = {
        userId: 1001,
        lastMessageAt: new Date('2023-06-15T09:45:10Z'),
      };

      // 测试有效值
      await expect(AIConversation.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, lastMessageAt: 'invalid_date' };
      await expect(AIConversation.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate JSON fields', async () => {
      const validData = {
        userId: 1001,
        usedMemoryIds: [1, 2, 3],
      };

      // 测试有效值
      await expect(AIConversation.create(validData)).resolves.toBeDefined();

      // 测试复杂JSON对象
      const complexData = {
        userId: 1001,
        usedMemoryIds: { memories: [1, 2, 3], lastUsed: new Date().toISOString() },
      };
      await expect(AIConversation.create(complexData)).resolves.toBeDefined();
    });

    it('should validate string length constraints', async () => {
      const validData = {
        userId: 1001,
        title: 'A'.repeat(100), // 最大长度
      };

      // 测试有效值
      await expect(AIConversation.create(validData)).resolves.toBeDefined();

      // 测试超长字符串
      const invalidData = { ...validData, title: 'A'.repeat(101) };
      await expect(AIConversation.create(invalidData as any)).rejects.toThrow();
    });
  });

  describe('Model Operations', () => {
    it('should find conversation by id', async () => {
      const conversationData = {
        userId: 1001,
        title: 'Test Conversation',
      };

      const created = await AIConversation.create(conversationData);
      const found = await AIConversation.findByPk(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.userId).toBe(conversationData.userId);
      expect(found?.title).toBe(conversationData.title);
    });

    it('should update conversation', async () => {
      const conversationData = {
        userId: 1001,
        title: 'Original Title',
        isArchived: false,
      };

      const conversation = await AIConversation.create(conversationData);
      
      await conversation.update({
        title: 'Updated Title',
        summary: 'Updated summary',
        isArchived: true,
        messageCount: 5,
        lastPagePath: '/new/path',
      });

      const updated = await AIConversation.findByPk(conversation.id);
      
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.summary).toBe('Updated summary');
      expect(updated?.isArchived).toBe(true);
      expect(updated?.messageCount).toBe(5);
      expect(updated?.lastPagePath).toBe('/new/path');
    });

    it('should delete conversation (hard delete)', async () => {
      const conversationData = {
        userId: 1001,
        title: 'Test Conversation',
      };

      const conversation = await AIConversation.create(conversationData);
      
      await conversation.destroy();

      const deleted = await AIConversation.findByPk(conversation.id);
      expect(deleted).toBeNull();
    });

    it('should list all conversations', async () => {
      const conversationData1 = {
        userId: 1001,
        title: 'Conversation 1',
      };

      const conversationData2 = {
        userId: 1001,
        title: 'Conversation 2',
      };

      await AIConversation.create(conversationData1);
      await AIConversation.create(conversationData2);

      const conversations = await AIConversation.findAll();
      
      expect(conversations).toHaveLength(2);
      expect(conversations[0].title).toBe('Conversation 1');
      expect(conversations[1].title).toBe('Conversation 2');
    });

    it('should update lastMessageAt automatically', async () => {
      const conversation = await AIConversation.create({
        userId: 1001,
        title: 'Test Conversation',
      });

      const originalLastMessageAt = conversation.lastMessageAt;
      
      // 等待一小段时间
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await conversation.update({
        messageCount: conversation.messageCount + 1,
      });

      const updated = await AIConversation.findByPk(conversation.id);
      
      // lastMessageAt 不会自动更新，除非明确设置
      expect(updated?.lastMessageAt).toEqual(originalLastMessageAt);
    });
  });

  describe('Query Operations', () => {
    it('should filter conversations by userId', async () => {
      const conversationData1 = {
        userId: 1001,
        title: 'User 1 Conversation',
      };

      const conversationData2 = {
        userId: 1002,
        title: 'User 2 Conversation',
      };

      await AIConversation.create(conversationData1);
      await AIConversation.create(conversationData2);

      const user1Conversations = await AIConversation.findAll({
        where: { userId: 1001 }
      });
      
      expect(user1Conversations).toHaveLength(1);
      expect(user1Conversations[0].userId).toBe(1001);
      expect(user1Conversations[0].title).toBe('User 1 Conversation');

      const user2Conversations = await AIConversation.findAll({
        where: { userId: 1002 }
      });
      
      expect(user2Conversations).toHaveLength(1);
      expect(user2Conversations[0].userId).toBe(1002);
      expect(user2Conversations[0].title).toBe('User 2 Conversation');
    });

    it('should filter conversations by archived status', async () => {
      const conversationData1 = {
        userId: 1001,
        title: 'Active Conversation',
        isArchived: false,
      };

      const conversationData2 = {
        userId: 1001,
        title: 'Archived Conversation',
        isArchived: true,
      };

      await AIConversation.create(conversationData1);
      await AIConversation.create(conversationData2);

      const activeConversations = await AIConversation.findAll({
        where: { isArchived: false }
      });
      
      expect(activeConversations).toHaveLength(1);
      expect(activeConversations[0].isArchived).toBe(false);
      expect(activeConversations[0].title).toBe('Active Conversation');

      const archivedConversations = await AIConversation.findAll({
        where: { isArchived: true }
      });
      
      expect(archivedConversations).toHaveLength(1);
      expect(archivedConversations[0].isArchived).toBe(true);
      expect(archivedConversations[0].title).toBe('Archived Conversation');
    });

    it('should filter conversations by lastMessageAt', async () => {
      const baseDate = new Date('2023-06-15T09:45:10Z');
      
      const conversationData1 = {
        userId: 1001,
        title: 'Old Conversation',
        lastMessageAt: new Date(baseDate.getTime() - 86400000), // 1 day ago
      };

      const conversationData2 = {
        userId: 1001,
        title: 'Recent Conversation',
        lastMessageAt: baseDate,
      };

      await AIConversation.create(conversationData1);
      await AIConversation.create(conversationData2);

      const recentConversations = await AIConversation.findAll({
        where: {
          lastMessageAt: { [Sequelize.Op.gte]: new Date(baseDate.getTime() - 43200000) } // 12 hours ago
        },
        order: [['lastMessageAt', 'DESC']]
      });
      
      expect(recentConversations).toHaveLength(1);
      expect(recentConversations[0].title).toBe('Recent Conversation');

      const allConversations = await AIConversation.findAll({
        order: [['lastMessageAt', 'DESC']]
      });
      
      expect(allConversations).toHaveLength(2);
      expect(allConversations[0].title).toBe('Recent Conversation');
      expect(allConversations[1].title).toBe('Old Conversation');
    });

    it('should search conversations by title', async () => {
      const conversationData1 = {
        userId: 1001,
        title: 'Teaching Plan Discussion',
      };

      const conversationData2 = {
        userId: 1001,
        title: 'Student Progress Review',
      };

      const conversationData3 = {
        userId: 1001,
        title: 'Parent Meeting Notes',
      };

      await AIConversation.create(conversationData1);
      await AIConversation.create(conversationData2);
      await AIConversation.create(conversationData3);

      const teachingConversations = await AIConversation.findAll({
        where: {
          title: { [Sequelize.Op.like]: '%Teaching%' }
        }
      });
      
      expect(teachingConversations).toHaveLength(1);
      expect(teachingConversations[0].title).toBe('Teaching Plan Discussion');

      const reviewConversations = await AIConversation.findAll({
        where: {
          title: { [Sequelize.Op.like]: '%Review%' }
        }
      });
      
      expect(reviewConversations).toHaveLength(1);
      expect(reviewConversations[0].title).toBe('Student Progress Review');
    });

    it('should filter conversations by page path', async () => {
      const conversationData1 = {
        userId: 1001,
        title: 'Dashboard Conversation',
        lastPagePath: '/dashboard',
      };

      const conversationData2 = {
        userId: 1001,
        title: 'Settings Conversation',
        lastPagePath: '/settings',
      };

      await AIConversation.create(conversationData1);
      await AIConversation.create(conversationData2);

      const dashboardConversations = await AIConversation.findAll({
        where: { lastPagePath: '/dashboard' }
      });
      
      expect(dashboardConversations).toHaveLength(1);
      expect(dashboardConversations[0].lastPagePath).toBe('/dashboard');
      expect(dashboardConversations[0].title).toBe('Dashboard Conversation');
    });
  });

  describe('Model Associations', () => {
    it('should have no associations defined', () => {
      initAIConversationAssociations();

      // 验证没有定义关联关系
      const associations = AIConversation.associations;
      expect(Object.keys(associations)).toHaveLength(0);
    });

    it('should handle association initialization without errors', () => {
      // 确保关联初始化不会抛出错误
      expect(() => {
        initAIConversationAssociations();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty usedMemoryIds array', async () => {
      const conversationData = {
        userId: 1001,
        usedMemoryIds: [],
      };

      const conversation = await AIConversation.create(conversationData);
      
      expect(conversation.usedMemoryIds).toEqual([]);
    });

    it('should handle null pageContext', async () => {
      const conversationData = {
        userId: 1001,
        pageContext: null,
      };

      const conversation = await AIConversation.create(conversationData);
      
      expect(conversation.pageContext).toBeNull();
    });

    it('should handle very long pageContext', async () => {
      const longContext = 'A'.repeat(10000); // 很长的上下文
      
      const conversationData = {
        userId: 1001,
        pageContext: longContext,
      };

      const conversation = await AIConversation.create(conversationData);
      
      expect(conversation.pageContext).toBe(longContext);
    });

    it('should handle concurrent updates', async () => {
      const conversation = await AIConversation.create({
        userId: 1001,
        title: 'Concurrent Test',
        messageCount: 0,
      });

      // 并发更新
      const update1 = conversation.update({ messageCount: 1 });
      const update2 = conversation.update({ messageCount: 2 });
      
      await Promise.all([update1, update2]);
      
      const updated = await AIConversation.findByPk(conversation.id);
      expect(updated?.messageCount).toBe(2); // 最后一个更新生效
    });
  });
});