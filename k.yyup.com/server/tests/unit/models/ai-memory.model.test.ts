import { Sequelize, DataTypes } from 'sequelize';
import { vi } from 'vitest'
import { initAIMemoryModel, AIMemory, MemoryType } from '../../../src/models/ai-memory.model';


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

describe('AIMemory Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });
    
    // 初始化模型
    initAIMemoryModel(sequelize);
    
    // 同步数据库
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await AIMemory.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have the correct model name', () => {
      expect(AIMemory.tableName).toBe('ai_memories');
    });

    it('should have all required attributes', () => {
      const attributes = Object.keys(AIMemory.getAttributes());
      const requiredAttributes = [
        'id', 'userId', 'externalUserId', 'conversationId', 'content',
        'embedding', 'embeddingModel', 'importance', 'memoryType', 'expiresAt', 'createdAt'
      ];
      
      requiredAttributes.forEach(attr => {
        expect(attributes).toContain(attr);
      });
    });

    it('should have correct field configurations', () => {
      const model = AIMemory.getAttributes();
      
      // 检查主键
      expect(model.id.primaryKey).toBe(true);
      expect(model.id.autoIncrement).toBe(true);
      expect(model.id.type).toBeInstanceOf(DataTypes.BIGINT);
      
      // 检查必需字段
      expect(model.userId.allowNull).toBe(false);
      expect(model.externalUserId.allowNull).toBe(false);
      expect(model.conversationId.allowNull).toBe(false);
      expect(model.content.allowNull).toBe(false);
      expect(model.importance.allowNull).toBe(false);
      expect(model.memoryType.allowNull).toBe(false);
      
      // 检查可选字段
      expect(model.embedding.allowNull).toBe(true);
      expect(model.embeddingModel.allowNull).toBe(true);
      expect(model.expiresAt.allowNull).toBe(true);
      
      // 检查默认值
      expect(model.createdAt.defaultValue).toBeDefined();
    });

    it('should have correct field types', () => {
      const model = AIMemory.getAttributes();
      
      expect(model.id.type).toBeInstanceOf(DataTypes.BIGINT);
      expect(model.userId.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(model.externalUserId.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(model.conversationId.type).toBeInstanceOf(DataTypes.STRING);
      expect(model.content.type).toBeInstanceOf(DataTypes.TEXT);
      expect(model.embedding.type).toBeInstanceOf(DataTypes.BLOB);
      expect(model.embeddingModel.type).toBeInstanceOf(DataTypes.STRING);
      expect(model.importance.type).toBeInstanceOf(DataTypes.FLOAT);
      expect(model.memoryType.type).toBeInstanceOf(DataTypes.ENUM);
      expect(model.expiresAt.type).toBeInstanceOf(DataTypes.DATE);
      expect(model.createdAt.type).toBeInstanceOf(DataTypes.DATE);
    });

    it('should have correct field mappings', () => {
      const model = AIMemory.getAttributes();
      
      expect(model.userId.field).toBe('user_id');
      expect(model.externalUserId.field).toBe('external_user_id');
      expect(model.conversationId.field).toBe('conversation_id');
      expect(model.embedding.field).toBe('embedding');
      expect(model.embeddingModel.field).toBe('embedding_model');
      expect(model.memoryType.field).toBe('memory_type');
      expect(model.expiresAt.field).toBe('expires_at');
      expect(model.createdAt.field).toBe('created_at');
    });
  });

  describe('Model Options', () => {
    it('should have correct table options', () => {
      const options = AIMemory.options;
      
      expect(options.timestamps).toBe(false); // 完全禁用自动时间戳
      expect(options.paranoid).toBeUndefined(); // 没有软删除
      expect(options.underscored).toBe(true);
    });

    it('should have no automatic timestamp management', () => {
      const options = AIMemory.options;
      
      expect(options.createdAt).toBe(false); // 明确禁用 createdAt 自动管理
      expect(options.updatedAt).toBe(false); // 明确禁用 updatedAt 自动管理
    });

    it('should not have updatedAt or deletedAt fields', () => {
      const attributes = AIMemory.getAttributes();
      
      expect(attributes.updatedAt).toBeUndefined();
      expect(attributes.deletedAt).toBeUndefined();
    });
  });

  describe('Enum Values', () => {
    it('should have correct MemoryType enum values', () => {
      expect(MemoryType.IMMEDIATE).toBe('immediate');
      expect(MemoryType.SHORT_TERM).toBe('shortterm');
      expect(MemoryType.LONG_TERM).toBe('longterm');
    });

    it('should have all expected enum values', () => {
      const expectedValues = ['immediate', 'shortterm', 'longterm'];
      const actualValues = Object.values(MemoryType);
      
      expect(actualValues).toEqual(expect.arrayContaining(expectedValues));
      expect(actualValues).toHaveLength(expectedValues.length);
    });
  });

  describe('Model Creation', () => {
    it('should create a new memory with valid data', async () => {
      const memoryData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'This is an important memory about user preferences',
        embedding: Buffer.from('embedding-data'),
        embeddingModel: 'text-embedding-ada-002',
        importance: 0.85,
        memoryType: MemoryType.SHORT_TERM,
        expiresAt: new Date('2023-12-31T23:59:59Z'),
      };

      const memory = await AIMemory.create(memoryData);

      expect(memory.id).toBeDefined();
      expect(memory.userId).toBe(memoryData.userId);
      expect(memory.externalUserId).toBe(memoryData.externalUserId);
      expect(memory.conversationId).toBe(memoryData.conversationId);
      expect(memory.content).toBe(memoryData.content);
      expect(memory.embedding).toEqual(memoryData.embedding);
      expect(memory.embeddingModel).toBe(memoryData.embeddingModel);
      expect(memory.importance).toBe(memoryData.importance);
      expect(memory.memoryType).toBe(memoryData.memoryType);
      expect(memory.expiresAt).toEqual(memoryData.expiresAt);
      expect(memory.createdAt).toBeDefined();
    });

    it('should create memory with minimal required data', async () => {
      const memoryData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Basic memory content',
        importance: 0.5,
        memoryType: MemoryType.IMMEDIATE,
      };

      const memory = await AIMemory.create(memoryData);

      expect(memory.id).toBeDefined();
      expect(memory.userId).toBe(memoryData.userId);
      expect(memory.externalUserId).toBe(memoryData.externalUserId);
      expect(memory.conversationId).toBe(memoryData.conversationId);
      expect(memory.content).toBe(memoryData.content);
      expect(memory.importance).toBe(memoryData.importance);
      expect(memory.memoryType).toBe(memoryData.memoryType);
      expect(memory.embedding).toBeNull();
      expect(memory.embeddingModel).toBeNull();
      expect(memory.expiresAt).toBeNull();
      expect(memory.createdAt).toBeDefined();
    });

    it('should create memory with all memory types', async () => {
      const baseData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Test memory content',
        importance: 0.5,
      };

      for (const memoryType of Object.values(MemoryType)) {
        const memoryData = { ...baseData, memoryType };
        const memory = await AIMemory.create(memoryData);
        
        expect(memory.memoryType).toBe(memoryType);
      }
    });

    it('should fail to create memory without required fields', async () => {
      const invalidData = {
        userId: 1001,
        externalUserId: 2001,
        // 缺少 conversationId, content, importance, memoryType
      };

      await expect(AIMemory.create(invalidData as any)).rejects.toThrow();
    });

    it('should fail to create memory with invalid enum values', async () => {
      const invalidData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Test memory',
        importance: 0.5,
        memoryType: 'invalid_type' as any,
      };

      await expect(AIMemory.create(invalidData)).rejects.toThrow();
    });
  });

  describe('Field Validation', () => {
    it('should validate memoryType field', async () => {
      const validData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Test memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      // 测试所有有效枚举值
      for (const memoryType of Object.values(MemoryType)) {
        const data = { ...validData, memoryType };
        await expect(AIMemory.create(data)).resolves.toBeDefined();
      }

      // 测试无效值
      const invalidData = { ...validData, memoryType: 'invalid_type' };
      await expect(AIMemory.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate importance field', async () => {
      const validData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Test memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      // 测试有效重要性值
      const validImportanceValues = [0.0, 0.5, 1.0, 0.25, 0.75, 0.99];
      for (const importance of validImportanceValues) {
        const data = { ...validData, importance };
        await expect(AIMemory.create(data)).resolves.toBeDefined();
      }

      // 测试无效值
      const invalidData = { ...validData, importance: 'invalid_importance' };
      await expect(AIMemory.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate userId and externalUserId fields', async () => {
      const validData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Test memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      // 测试有效值
      await expect(AIMemory.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData1 = { ...validData, userId: 'invalid_user_id' };
      await expect(AIMemory.create(invalidData1 as any)).rejects.toThrow();

      const invalidData2 = { ...validData, externalUserId: 'invalid_external_user_id' };
      await expect(AIMemory.create(invalidData2 as any)).rejects.toThrow();
    });

    it('should validate conversationId field', async () => {
      const validData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Test memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      // 测试有效值
      await expect(AIMemory.create(validData)).resolves.toBeDefined();

      // 测试空字符串
      const invalidData1 = { ...validData, conversationId: '' };
      await expect(AIMemory.create(invalidData1 as any)).rejects.toThrow();
    });

    it('should validate content field is not empty', async () => {
      const validData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Test memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      // 测试有效内容
      await expect(AIMemory.create(validData)).resolves.toBeDefined();

      // 测试空内容
      const invalidData1 = { ...validData, content: '' };
      await expect(AIMemory.create(invalidData1 as any)).rejects.toThrow();

      // 测试空白内容
      const invalidData2 = { ...validData, content: '   ' };
      await expect(AIMemory.create(invalidData2 as any)).rejects.toThrow();
    });

    it('should validate date fields', async () => {
      const validData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Test memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
        expiresAt: new Date('2023-12-31T23:59:59Z'),
      };

      // 测试有效值
      await expect(AIMemory.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, expiresAt: 'invalid_date' };
      await expect(AIMemory.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate embedding field as Buffer', async () => {
      const validData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Test memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
        embedding: Buffer.from('test-embedding-data'),
      };

      // 测试有效值
      await expect(AIMemory.create(validData)).resolves.toBeDefined();

      // 测试无效值类型
      const invalidData = { ...validData, embedding: 'string-instead-of-buffer' };
      await expect(AIMemory.create(invalidData as any)).rejects.toThrow();
    });
  });

  describe('Model Operations', () => {
    it('should find memory by id', async () => {
      const memoryData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Test memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      const created = await AIMemory.create(memoryData);
      const found = await AIMemory.findByPk(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.userId).toBe(memoryData.userId);
      expect(found?.content).toBe(memoryData.content);
    });

    it('should update memory', async () => {
      const memoryData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Original memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memory = await AIMemory.create(memoryData);
      
      await memory.update({
        content: 'Updated memory content',
        importance: 0.8,
        memoryType: MemoryType.LONG_TERM,
        embedding: Buffer.from('updated-embedding'),
        expiresAt: new Date('2024-12-31T23:59:59Z'),
      });

      const updated = await AIMemory.findByPk(memory.id);
      
      expect(updated?.content).toBe('Updated memory content');
      expect(updated?.importance).toBe(0.8);
      expect(updated?.memoryType).toBe(MemoryType.LONG_TERM);
      expect(updated?.embedding).toEqual(Buffer.from('updated-embedding'));
      expect(updated?.expiresAt).toEqual(new Date('2024-12-31T23:59:59Z'));
    });

    it('should delete memory (hard delete)', async () => {
      const memoryData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Test memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memory = await AIMemory.create(memoryData);
      
      await memory.destroy();

      const deleted = await AIMemory.findByPk(memory.id);
      expect(deleted).toBeNull();
    });

    it('should list all memories', async () => {
      const memoryData1 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Memory 1',
        importance: 0.5,
        memoryType: MemoryType.IMMEDIATE,
      };

      const memoryData2 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-67890-fghij',
        content: 'Memory 2',
        importance: 0.8,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memoryData3 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Memory 3',
        importance: 0.9,
        memoryType: MemoryType.LONG_TERM,
      };

      await AIMemory.create(memoryData1);
      await AIMemory.create(memoryData2);
      await AIMemory.create(memoryData3);

      const memories = await AIMemory.findAll();
      
      expect(memories).toHaveLength(3);
      expect(memories[0].memoryType).toBe(MemoryType.IMMEDIATE);
      expect(memories[1].memoryType).toBe(MemoryType.SHORT_TERM);
      expect(memories[2].memoryType).toBe(MemoryType.LONG_TERM);
    });

    it('should not auto-update timestamps on update', async () => {
      const memory = await AIMemory.create({
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Original memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      });

      const originalCreatedAt = memory.createdAt;
      
      // 等待一小段时间
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await memory.update({
        content: 'Updated memory',
      });

      const updated = await AIMemory.findByPk(memory.id);
      
      // createdAt 应该保持不变，因为没有自动时间戳管理
      expect(updated?.createdAt).toEqual(originalCreatedAt);
    });
  });

  describe('Query Operations', () => {
    it('should filter memories by userId', async () => {
      const memoryData1 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'User 1 memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memoryData2 = {
        userId: 1002,
        externalUserId: 2002,
        conversationId: 'conv-67890-fghij',
        content: 'User 2 memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      await AIMemory.create(memoryData1);
      await AIMemory.create(memoryData2);

      const user1Memories = await AIMemory.findAll({
        where: { userId: 1001 }
      });
      
      expect(user1Memories).toHaveLength(1);
      expect(user1Memories[0].userId).toBe(1001);
      expect(user1Memories[0].content).toBe('User 1 memory');

      const user2Memories = await AIMemory.findAll({
        where: { userId: 1002 }
      });
      
      expect(user2Memories).toHaveLength(1);
      expect(user2Memories[0].userId).toBe(1002);
      expect(user2Memories[0].content).toBe('User 2 memory');
    });

    it('should filter memories by externalUserId', async () => {
      const memoryData1 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'External user 1 memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memoryData2 = {
        userId: 1001,
        externalUserId: 2002,
        conversationId: 'conv-67890-fghij',
        content: 'External user 2 memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      await AIMemory.create(memoryData1);
      await AIMemory.create(memoryData2);

      const externalUser1Memories = await AIMemory.findAll({
        where: { externalUserId: 2001 }
      });
      
      expect(externalUser1Memories).toHaveLength(1);
      expect(externalUser1Memories[0].externalUserId).toBe(2001);
      expect(externalUser1Memories[0].content).toBe('External user 1 memory');

      const externalUser2Memories = await AIMemory.findAll({
        where: { externalUserId: 2002 }
      });
      
      expect(externalUser2Memories).toHaveLength(1);
      expect(externalUser2Memories[0].externalUserId).toBe(2002);
      expect(externalUser2Memories[0].content).toBe('External user 2 memory');
    });

    it('should filter memories by conversationId', async () => {
      const memoryData1 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Conversation 1 memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memoryData2 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-67890-fghij',
        content: 'Conversation 2 memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memoryData3 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Another conversation 1 memory',
        importance: 0.8,
        memoryType: MemoryType.LONG_TERM,
      };

      await AIMemory.create(memoryData1);
      await AIMemory.create(memoryData2);
      await AIMemory.create(memoryData3);

      const conversation1Memories = await AIMemory.findAll({
        where: { conversationId: 'conv-12345-abcde' }
      });
      
      expect(conversation1Memories).toHaveLength(2);
      expect(conversation1Memories.every(m => m.conversationId === 'conv-12345-abcde')).toBe(true);

      const conversation2Memories = await AIMemory.findAll({
        where: { conversationId: 'conv-67890-fghij' }
      });
      
      expect(conversation2Memories).toHaveLength(1);
      expect(conversation2Memories[0].conversationId).toBe('conv-67890-fghij');
    });

    it('should filter memories by memoryType', async () => {
      const memoryData1 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Immediate memory',
        importance: 0.3,
        memoryType: MemoryType.IMMEDIATE,
      };

      const memoryData2 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-67890-fghij',
        content: 'Short term memory',
        importance: 0.6,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memoryData3 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Long term memory',
        importance: 0.9,
        memoryType: MemoryType.LONG_TERM,
      };

      await AIMemory.create(memoryData1);
      await AIMemory.create(memoryData2);
      await AIMemory.create(memoryData3);

      const immediateMemories = await AIMemory.findAll({
        where: { memoryType: MemoryType.IMMEDIATE }
      });
      
      expect(immediateMemories).toHaveLength(1);
      expect(immediateMemories[0].memoryType).toBe(MemoryType.IMMEDIATE);

      const shortTermMemories = await AIMemory.findAll({
        where: { memoryType: MemoryType.SHORT_TERM }
      });
      
      expect(shortTermMemories).toHaveLength(1);
      expect(shortTermMemories[0].memoryType).toBe(MemoryType.SHORT_TERM);

      const longTermMemories = await AIMemory.findAll({
        where: { memoryType: MemoryType.LONG_TERM }
      });
      
      expect(longTermMemories).toHaveLength(1);
      expect(longTermMemories[0].memoryType).toBe(MemoryType.LONG_TERM);
    });

    it('should filter memories by importance range', async () => {
      const memoryData1 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Low importance memory',
        importance: 0.2,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memoryData2 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-67890-fghij',
        content: 'Medium importance memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memoryData3 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'High importance memory',
        importance: 0.8,
        memoryType: MemoryType.LONG_TERM,
      };

      await AIMemory.create(memoryData1);
      await AIMemory.create(memoryData2);
      await AIMemory.create(memoryData3);

      const lowImportanceMemories = await AIMemory.findAll({
        where: { 
          importance: { [Sequelize.Op.lte]: 0.3 }
        }
      });
      
      expect(lowImportanceMemories).toHaveLength(1);
      expect(lowImportanceMemories[0].importance).toBe(0.2);

      const highImportanceMemories = await AIMemory.findAll({
        where: { 
          importance: { [Sequelize.Op.gte]: 0.7 }
        }
      });
      
      expect(highImportanceMemories).toHaveLength(1);
      expect(highImportanceMemories[0].importance).toBe(0.8);

      const mediumImportanceMemories = await AIMemory.findAll({
        where: { 
          importance: { 
            [Sequelize.Op.gte]: 0.3, 
            [Sequelize.Op.lte]: 0.7 
          }
        }
      });
      
      expect(mediumImportanceMemories).toHaveLength(1);
      expect(mediumImportanceMemories[0].importance).toBe(0.5);
    });

    it('should filter memories by expiration date', async () => {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const memoryData1 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Expired memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
        expiresAt: yesterday,
      };

      const memoryData2 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-67890-fghij',
        content: 'Active memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
        expiresAt: tomorrow,
      };

      const memoryData3 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Non-expiring memory',
        importance: 0.5,
        memoryType: MemoryType.LONG_TERM,
        expiresAt: null,
      };

      await AIMemory.create(memoryData1);
      await AIMemory.create(memoryData2);
      await AIMemory.create(memoryData3);

      const expiredMemories = await AIMemory.findAll({
        where: { 
          expiresAt: { [Sequelize.Op.lt]: now }
        }
      });
      
      expect(expiredMemories).toHaveLength(1);
      expect(expiredMemories[0].content).toBe('Expired memory');

      const activeMemories = await AIMemory.findAll({
        where: { 
          expiresAt: { [Sequelize.Op.gte]: now }
        }
      });
      
      expect(activeMemories).toHaveLength(1);
      expect(activeMemories[0].content).toBe('Active memory');

      const nonExpiringMemories = await AIMemory.findAll({
        where: { 
          expiresAt: null
        }
      });
      
      expect(nonExpiringMemories).toHaveLength(1);
      expect(nonExpiringMemories[0].content).toBe('Non-expiring memory');
    });

    it('should search memories by content', async () => {
      const memoryData1 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: '用户喜欢蓝色主题',
        importance: 0.8,
        memoryType: MemoryType.LONG_TERM,
      };

      const memoryData2 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-67890-fghij',
        content: '系统偏好设置',
        importance: 0.6,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memoryData3 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: '用户的工作流程',
        importance: 0.7,
        memoryType: MemoryType.LONG_TERM,
      };

      await AIMemory.create(memoryData1);
      await AIMemory.create(memoryData2);
      await AIMemory.create(memoryData3);

      const userPreferences = await AIMemory.findAll({
        where: {
          content: { [Sequelize.Op.like]: '%用户%' }
        }
      });
      
      expect(userPreferences).toHaveLength(2);
      expect(userPreferences.some(m => m.content.includes('蓝色主题'))).toBe(true);
      expect(userPreferences.some(m => m.content.includes('工作流程'))).toBe(true);

      const systemMemories = await AIMemory.findAll({
        where: {
          content: { [Sequelize.Op.like]: '%系统%' }
        }
      });
      
      expect(systemMemories).toHaveLength(1);
      expect(systemMemories[0].content).toBe('系统偏好设置');
    });
  });

  describe('Complex Queries', () => {
    it('should filter by multiple conditions', async () => {
      const memoryData1 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'User 1 long term memory',
        importance: 0.8,
        memoryType: MemoryType.LONG_TERM,
      };

      const memoryData2 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-67890-fghij',
        content: 'User 1 short term memory',
        importance: 0.4,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memoryData3 = {
        userId: 1002,
        externalUserId: 2002,
        conversationId: 'conv-12345-abcde',
        content: 'User 2 long term memory',
        importance: 0.9,
        memoryType: MemoryType.LONG_TERM,
      };

      await AIMemory.create(memoryData1);
      await AIMemory.create(memoryData2);
      await AIMemory.create(memoryData3);

      // 查找用户1的长期记忆
      const user1LongTermMemories = await AIMemory.findAll({
        where: {
          userId: 1001,
          memoryType: MemoryType.LONG_TERM
        }
      });
      
      expect(user1LongTermMemories).toHaveLength(1);
      expect(user1LongTermMemories[0].content).toBe('User 1 long term memory');

      // 查找重要性大于0.5的记忆
      const highImportanceMemories = await AIMemory.findAll({
        where: {
          importance: { [Sequelize.Op.gt]: 0.5 }
        },
        order: [['importance', 'DESC']]
      });
      
      expect(highImportanceMemories).toHaveLength(2);
      expect(highImportanceMemories[0].importance).toBe(0.9);
      expect(highImportanceMemories[1].importance).toBe(0.8);

      // 复杂查询：用户1的重要性大于0.5的记忆
      const complexQueryMemories = await AIMemory.findAll({
        where: {
          userId: 1001,
          importance: { [Sequelize.Op.gt]: 0.5 }
        }
      });
      
      expect(complexQueryMemories).toHaveLength(1);
      expect(complexQueryMemories[0].content).toBe('User 1 long term memory');
    });

    it('should order memories by importance', async () => {
      const memoryData1 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Low importance',
        importance: 0.2,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memoryData2 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-67890-fghij',
        content: 'High importance',
        importance: 0.9,
        memoryType: MemoryType.LONG_TERM,
      };

      const memoryData3 = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Medium importance',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      await AIMemory.create(memoryData1);
      await AIMemory.create(memoryData2);
      await AIMemory.create(memoryData3);

      const ascendingOrder = await AIMemory.findAll({
        order: [['importance', 'ASC']]
      });
      
      expect(ascendingOrder).toHaveLength(3);
      expect(ascendingOrder[0].importance).toBe(0.2);
      expect(ascendingOrder[1].importance).toBe(0.5);
      expect(ascendingOrder[2].importance).toBe(0.9);

      const descendingOrder = await AIMemory.findAll({
        order: [['importance', 'DESC']]
      });
      
      expect(descendingOrder).toHaveLength(3);
      expect(descendingOrder[0].importance).toBe(0.9);
      expect(descendingOrder[1].importance).toBe(0.5);
      expect(descendingOrder[2].importance).toBe(0.2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long content', async () => {
      const longContent = 'A'.repeat(10000); // 很长的记忆内容
      
      const memoryData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: longContent,
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memory = await AIMemory.create(memoryData);
      
      expect(memory.content).toBe(longContent);
    });

    it('should handle special characters in content', async () => {
      const specialContent = '记忆内容包含特殊字符：中文、English、🚀、123、!@#$%^&*()';
      
      const memoryData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: specialContent,
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      };

      const memory = await AIMemory.create(memoryData);
      
      expect(memory.content).toBe(specialContent);
    });

    it('should handle large embedding data', async () => {
      const largeEmbedding = Buffer.from('x'.repeat(10000)); // 大的嵌入数据
      
      const memoryData = {
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Memory with large embedding',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
        embedding: largeEmbedding,
      };

      const memory = await AIMemory.create(memoryData);
      
      expect(memory.embedding).toEqual(largeEmbedding);
    });

    it('should handle extreme importance values', async () => {
      const extremeValues = [0.0, 1.0, 0.0001, 0.9999];
      
      for (const importance of extremeValues) {
        const memoryData = {
          userId: 1001,
          externalUserId: 2001,
          conversationId: 'conv-12345-abcde',
          content: `Memory with importance ${importance}`,
          importance,
          memoryType: MemoryType.SHORT_TERM,
        };

        const memory = await AIMemory.create(memoryData);
        expect(memory.importance).toBe(importance);
      }
    });

    it('should handle concurrent updates', async () => {
      const memory = await AIMemory.create({
        userId: 1001,
        externalUserId: 2001,
        conversationId: 'conv-12345-abcde',
        content: 'Concurrent test memory',
        importance: 0.5,
        memoryType: MemoryType.SHORT_TERM,
      });

      // 并发更新
      const update1 = memory.update({ importance: 0.7 });
      const update2 = memory.update({ importance: 0.9 });
      
      await Promise.all([update1, update2]);
      
      const updated = await AIMemory.findByPk(memory.id);
      expect(updated?.importance).toBe(0.9); // 最后一个更新生效
    });

    it('should handle bulk operations', async () => {
      const memoriesData = [
        {
          userId: 1001,
          externalUserId: 2001,
          conversationId: 'conv-12345-abcde',
          content: 'Bulk memory 1',
          importance: 0.3,
          memoryType: MemoryType.IMMEDIATE,
        },
        {
          userId: 1001,
          externalUserId: 2001,
          conversationId: 'conv-67890-fghij',
          content: 'Bulk memory 2',
          importance: 0.6,
          memoryType: MemoryType.SHORT_TERM,
        },
        {
          userId: 1001,
          externalUserId: 2001,
          conversationId: 'conv-12345-abcde',
          content: 'Bulk memory 3',
          importance: 0.9,
          memoryType: MemoryType.LONG_TERM,
        },
      ];

      const createdMemories = await AIMemory.bulkCreate(memoriesData);
      
      expect(createdMemories).toHaveLength(3);
      expect(createdMemories[0].content).toBe('Bulk memory 1');
      expect(createdMemories[1].content).toBe('Bulk memory 2');
      expect(createdMemories[2].content).toBe('Bulk memory 3');

      // 批量更新
      await AIMemory.update(
        { importance: 1.0 },
        { where: { userId: 1001 } }
      );

      const updatedMemories = await AIMemory.findAll({
        where: { userId: 1001 }
      });
      
      expect(updatedMemories).toHaveLength(3);
      expect(updatedMemories.every(m => m.importance === 1.0)).toBe(true);
    });
  });
});