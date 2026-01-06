import { Sequelize, DataTypes } from 'sequelize';
import { vi } from 'vitest'
import { initAIMessage, initAIMessageAssociations, AIMessage, MessageRole, MessageType, MessageStatus } from '../../../src/models/ai-message.model';


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

describe('AIMessage Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });
    
    // 初始化模型
    initAIMessage(sequelize);
    
    // 同步数据库
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await AIMessage.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have the correct model name', () => {
      expect(AIMessage.tableName).toBe('ai_messages');
    });

    it('should have all required attributes', () => {
      const attributes = Object.keys(AIMessage.getAttributes());
      const requiredAttributes = [
        'id', 'conversationId', 'userId', 'role', 'content', 'messageType',
        'mediaUrl', 'metadata', 'tokens', 'status', 'isDeleted', 'createdAt', 'updatedAt'
      ];
      
      requiredAttributes.forEach(attr => {
        expect(attributes).toContain(attr);
      });
    });

    it('should have correct field configurations', () => {
      const model = AIMessage.getAttributes();
      
      // 检查主键
      expect(model.id.primaryKey).toBe(true);
      expect(model.id.autoIncrement).toBe(true);
      
      // 检查必需字段
      expect(model.conversationId.allowNull).toBe(false);
      expect(model.userId.allowNull).toBe(false);
      expect(model.role.allowNull).toBe(false);
      expect(model.content.allowNull).toBe(false);
      
      // 检查可选字段
      expect(model.mediaUrl.allowNull).toBe(true);
      expect(model.metadata.allowNull).toBe(true);
      
      // 检查默认值
      expect(model.messageType.defaultValue).toBe(MessageType.TEXT);
      expect(model.metadata.defaultValue).toEqual({});
      expect(model.tokens.defaultValue).toBe(0);
      expect(model.status.defaultValue).toBe(MessageStatus.DELIVERED);
      expect(model.isDeleted.defaultValue).toBe(false);
      expect(model.createdAt.defaultValue).toBeDefined();
      expect(model.updatedAt.defaultValue).toBeDefined();
    });

    it('should have correct field types', () => {
      const model = AIMessage.getAttributes();
      
      expect(model.id.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(model.conversationId.type).toBeInstanceOf(DataTypes.STRING);
      expect(model.userId.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(model.role.type).toBeInstanceOf(DataTypes.ENUM);
      expect(model.content.type).toBeInstanceOf(DataTypes.TEXT);
      expect(model.messageType.type).toBeInstanceOf(DataTypes.ENUM);
      expect(model.mediaUrl.type).toBeInstanceOf(DataTypes.STRING);
      expect(model.metadata.type).toBeInstanceOf(DataTypes.JSON);
      expect(model.tokens.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(model.status.type).toBeInstanceOf(DataTypes.ENUM);
      expect(model.isDeleted.type).toBeInstanceOf(DataTypes.BOOLEAN);
    });

    it('should have correct field mappings', () => {
      const model = AIMessage.getAttributes();
      
      expect(model.conversationId.field).toBe('conversation_id');
      expect(model.userId.field).toBe('user_id');
      expect(model.messageType.field).toBe('message_type');
      expect(model.mediaUrl.field).toBe('media_url');
      expect(model.isDeleted.field).toBe('is_deleted');
      expect(model.createdAt.field).toBe('createdAt');
      expect(model.updatedAt.field).toBe('updatedAt');
    });
  });

  describe('Model Options', () => {
    it('should have correct table options', () => {
      const options = AIMessage.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBeUndefined(); // 没有软删除
      expect(options.underscored).toBe(false);
    });

    it('should have explicit timestamp field names', () => {
      const options = AIMessage.options;
      
      expect(options.createdAt).toBe('createdAt');
      expect(options.updatedAt).toBe('updatedAt');
    });

    it('should have correct timestamp fields', () => {
      const attributes = AIMessage.getAttributes();
      
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.deletedAt).toBeUndefined(); // 没有软删除
    });
  });

  describe('Enum Values', () => {
    it('should have correct MessageRole enum values', () => {
      expect(MessageRole.USER).toBe('user');
      expect(MessageRole.ASSISTANT).toBe('assistant');
      expect(MessageRole.SYSTEM).toBe('system');
    });

    it('should have correct MessageType enum values', () => {
      expect(MessageType.TEXT).toBe('text');
      expect(MessageType.IMAGE).toBe('image');
      expect(MessageType.AUDIO).toBe('audio');
      expect(MessageType.VIDEO).toBe('video');
      expect(MessageType.FILE).toBe('file');
    });

    it('should have correct MessageStatus enum values', () => {
      expect(MessageStatus.SENDING).toBe('sending');
      expect(MessageStatus.DELIVERED).toBe('delivered');
      expect(MessageStatus.FAILED).toBe('failed');
    });

    it('should have all expected enum values', () => {
      const expectedRoles = ['user', 'assistant', 'system'];
      const actualRoles = Object.values(MessageRole);
      expect(actualRoles).toEqual(expect.arrayContaining(expectedRoles));

      const expectedTypes = ['text', 'image', 'audio', 'video', 'file'];
      const actualTypes = Object.values(MessageType);
      expect(actualTypes).toEqual(expect.arrayContaining(expectedTypes));

      const expectedStatuses = ['sending', 'delivered', 'failed'];
      const actualStatuses = Object.values(MessageStatus);
      expect(actualStatuses).toEqual(expect.arrayContaining(expectedStatuses));
    });
  });

  describe('Model Creation', () => {
    it('should create a new message with valid data', async () => {
      const messageData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: '我想了解更多关于AI的知识',
        messageType: MessageType.TEXT,
        mediaUrl: null,
        metadata: { source: 'web', timestamp: new Date().toISOString() },
        tokens: 15,
        status: MessageStatus.DELIVERED,
        isDeleted: false,
      };

      const message = await AIMessage.create(messageData);

      expect(message.id).toBeDefined();
      expect(message.conversationId).toBe(messageData.conversationId);
      expect(message.userId).toBe(messageData.userId);
      expect(message.role).toBe(messageData.role);
      expect(message.content).toBe(messageData.content);
      expect(message.messageType).toBe(messageData.messageType);
      expect(message.mediaUrl).toBe(messageData.mediaUrl);
      expect(message.metadata).toEqual(messageData.metadata);
      expect(message.tokens).toBe(messageData.tokens);
      expect(message.status).toBe(messageData.status);
      expect(message.isDeleted).toBe(messageData.isDeleted);
      expect(message.createdAt).toBeDefined();
      expect(message.updatedAt).toBeDefined();
    });

    it('should create message with default values', async () => {
      const messageData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.ASSISTANT,
        content: 'AI是人工智能的缩写',
      };

      const message = await AIMessage.create(messageData);

      expect(message.id).toBeDefined();
      expect(message.conversationId).toBe(messageData.conversationId);
      expect(message.userId).toBe(messageData.userId);
      expect(message.role).toBe(messageData.role);
      expect(message.content).toBe(messageData.content);
      expect(message.messageType).toBe(MessageType.TEXT);
      expect(message.mediaUrl).toBeNull();
      expect(message.metadata).toEqual({});
      expect(message.tokens).toBe(0);
      expect(message.status).toBe(MessageStatus.DELIVERED);
      expect(message.isDeleted).toBe(false);
      expect(message.createdAt).toBeDefined();
      expect(message.updatedAt).toBeDefined();
    });

    it('should create message with all message types', async () => {
      const baseData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
      };

      for (const messageType of Object.values(MessageType)) {
        const messageData = { ...baseData, messageType };
        const message = await AIMessage.create(messageData);
        
        expect(message.messageType).toBe(messageType);
      }
    });

    it('should create message with all roles', async () => {
      const baseData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        content: 'Test message',
      };

      for (const role of Object.values(MessageRole)) {
        const messageData = { ...baseData, role };
        const message = await AIMessage.create(messageData);
        
        expect(message.role).toBe(role);
      }
    });

    it('should create message with all statuses', async () => {
      const baseData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
      };

      for (const status of Object.values(MessageStatus)) {
        const messageData = { ...baseData, status };
        const message = await AIMessage.create(messageData);
        
        expect(message.status).toBe(status);
      }
    });

    it('should fail to create message without required fields', async () => {
      const invalidData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        // 缺少 role, content
      };

      await expect(AIMessage.create(invalidData as any)).rejects.toThrow();
    });

    it('should fail to create message with invalid enum values', async () => {
      const invalidData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: 'invalid_role' as any,
        content: 'Test message',
      };

      await expect(AIMessage.create(invalidData)).rejects.toThrow();
    });
  });

  describe('Field Validation', () => {
    it('should validate role field', async () => {
      const validData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
      };

      // 测试所有有效枚举值
      for (const role of Object.values(MessageRole)) {
        const data = { ...validData, role };
        await expect(AIMessage.create(data)).resolves.toBeDefined();
      }

      // 测试无效值
      const invalidData = { ...validData, role: 'invalid_role' };
      await expect(AIMessage.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate messageType field', async () => {
      const validData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
      };

      // 测试所有有效枚举值
      for (const messageType of Object.values(MessageType)) {
        const data = { ...validData, messageType };
        await expect(AIMessage.create(data)).resolves.toBeDefined();
      }

      // 测试无效值
      const invalidData = { ...validData, messageType: 'invalid_type' };
      await expect(AIMessage.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate status field', async () => {
      const validData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
      };

      // 测试所有有效枚举值
      for (const status of Object.values(MessageStatus)) {
        const data = { ...validData, status };
        await expect(AIMessage.create(data)).resolves.toBeDefined();
      }

      // 测试无效值
      const invalidData = { ...validData, status: 'invalid_status' };
      await expect(AIMessage.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate userId field', async () => {
      const validData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
      };

      // 测试有效值
      await expect(AIMessage.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, userId: 'invalid_user_id' };
      await expect(AIMessage.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate conversationId field', async () => {
      const validData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
      };

      // 测试有效值
      await expect(AIMessage.create(validData)).resolves.toBeDefined();

      // 测试空字符串
      const invalidData1 = { ...validData, conversationId: '' };
      await expect(AIMessage.create(invalidData1 as any)).rejects.toThrow();
    });

    it('should validate content field is not empty', async () => {
      const validData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
      };

      // 测试有效内容
      await expect(AIMessage.create(validData)).resolves.toBeDefined();

      // 测试空内容
      const invalidData1 = { ...validData, content: '' };
      await expect(AIMessage.create(invalidData1 as any)).rejects.toThrow();

      // 测试空白内容
      const invalidData2 = { ...validData, content: '   ' };
      await expect(AIMessage.create(invalidData2 as any)).rejects.toThrow();
    });

    it('should validate tokens field', async () => {
      const validData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
        tokens: 15,
      };

      // 测试有效值
      await expect(AIMessage.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, tokens: 'invalid_tokens' };
      await expect(AIMessage.create(invalidData as any)).rejects.toThrow();

      // 测试负值
      const negativeData = { ...validData, tokens: -1 };
      await expect(AIMessage.create(negativeData as any)).rejects.toThrow();
    });

    it('should validate isDeleted field', async () => {
      const validData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
        isDeleted: true,
      };

      // 测试有效值
      await expect(AIMessage.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, isDeleted: 'invalid_boolean' };
      await expect(AIMessage.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate metadata field as JSON', async () => {
      const validData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
      };

      // 测试默认值
      const message1 = await AIMessage.create(validData);
      expect(message1.metadata).toEqual({});

      // 测试简单对象
      const simpleMetadata = { source: 'web', timestamp: new Date().toISOString() };
      const message2 = await AIMessage.create({ ...validData, metadata: simpleMetadata });
      expect(message2.metadata).toEqual(simpleMetadata);

      // 测试复杂对象
      const complexMetadata = {
        user: { id: 1001, name: 'Test User' },
        context: { page: '/chat', action: 'send_message' },
        metadata: { version: '1.0', client: 'web' }
      };
      const message3 = await AIMessage.create({ ...validData, metadata: complexMetadata });
      expect(message3.metadata).toEqual(complexMetadata);

      // 测试数组
      const arrayMetadata = { tags: ['greeting', 'question'], history: [1, 2, 3] };
      const message4 = await AIMessage.create({ ...validData, metadata: arrayMetadata });
      expect(message4.metadata).toEqual(arrayMetadata);
    });

    it('should validate mediaUrl field', async () => {
      const validData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
        messageType: MessageType.IMAGE,
        mediaUrl: 'https://example.com/image.jpg',
      };

      // 测试有效值
      await expect(AIMessage.create(validData)).resolves.toBeDefined();

      // 测试空值（允许）
      const nullData = { ...validData, mediaUrl: null };
      await expect(AIMessage.create(nullData)).resolves.toBeDefined();
    });
  });

  describe('Model Operations', () => {
    it('should find message by id', async () => {
      const messageData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
      };

      const created = await AIMessage.create(messageData);
      const found = await AIMessage.findByPk(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.conversationId).toBe(messageData.conversationId);
      expect(found?.content).toBe(messageData.content);
    });

    it('should update message', async () => {
      const messageData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Original message',
        status: MessageStatus.SENDING,
      };

      const message = await AIMessage.create(messageData);
      
      await message.update({
        content: 'Updated message content',
        status: MessageStatus.DELIVERED,
        tokens: 20,
        metadata: { updated: true, timestamp: new Date().toISOString() },
      });

      const updated = await AIMessage.findByPk(message.id);
      
      expect(updated?.content).toBe('Updated message content');
      expect(updated?.status).toBe(MessageStatus.DELIVERED);
      expect(updated?.tokens).toBe(20);
      expect(updated?.metadata.updated).toBe(true);
    });

    it('should delete message (hard delete)', async () => {
      const messageData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
      };

      const message = await AIMessage.create(messageData);
      
      await message.destroy();

      const deleted = await AIMessage.findByPk(message.id);
      expect(deleted).toBeNull();
    });

    it('should list all messages', async () => {
      const messageData1 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'User message 1',
      };

      const messageData2 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.ASSISTANT,
        content: 'Assistant response',
      };

      const messageData3 = {
        conversationId: 'conv-67890-fghij',
        userId: 1001,
        role: MessageRole.USER,
        content: 'User message 2',
      };

      await AIMessage.create(messageData1);
      await AIMessage.create(messageData2);
      await AIMessage.create(messageData3);

      const messages = await AIMessage.findAll();
      
      expect(messages).toHaveLength(3);
      expect(messages[0].role).toBe(MessageRole.USER);
      expect(messages[1].role).toBe(MessageRole.ASSISTANT);
      expect(messages[2].role).toBe(MessageRole.USER);
    });

    it('should update timestamps automatically', async () => {
      const message = await AIMessage.create({
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Test message',
      });

      const originalUpdatedAt = message.updatedAt;
      
      // 等待一小段时间
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await message.update({
        content: 'Updated message',
      });

      const updated = await AIMessage.findByPk(message.id);
      
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Query Operations', () => {
    it('should filter messages by conversationId', async () => {
      const messageData1 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Message from conversation 1',
      };

      const messageData2 = {
        conversationId: 'conv-67890-fghij',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Message from conversation 2',
      };

      const messageData3 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.ASSISTANT,
        content: 'Response in conversation 1',
      };

      await AIMessage.create(messageData1);
      await AIMessage.create(messageData2);
      await AIMessage.create(messageData3);

      const conversation1Messages = await AIMessage.findAll({
        where: { conversationId: 'conv-12345-abcde' }
      });
      
      expect(conversation1Messages).toHaveLength(2);
      expect(conversation1Messages.every(m => m.conversationId === 'conv-12345-abcde')).toBe(true);

      const conversation2Messages = await AIMessage.findAll({
        where: { conversationId: 'conv-67890-fghij' }
      });
      
      expect(conversation2Messages).toHaveLength(1);
      expect(conversation2Messages[0].conversationId).toBe('conv-67890-fghij');
    });

    it('should filter messages by userId', async () => {
      const messageData1 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'User 1 message',
      };

      const messageData2 = {
        conversationId: 'conv-67890-fghij',
        userId: 1002,
        role: MessageRole.USER,
        content: 'User 2 message',
      };

      const messageData3 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.ASSISTANT,
        content: 'Assistant response to user 1',
      };

      await AIMessage.create(messageData1);
      await AIMessage.create(messageData2);
      await AIMessage.create(messageData3);

      const user1Messages = await AIMessage.findAll({
        where: { userId: 1001 }
      });
      
      expect(user1Messages).toHaveLength(2);
      expect(user1Messages.every(m => m.userId === 1001)).toBe(true);

      const user2Messages = await AIMessage.findAll({
        where: { userId: 1002 }
      });
      
      expect(user2Messages).toHaveLength(1);
      expect(user2Messages[0].userId).toBe(1002);
    });

    it('should filter messages by role', async () => {
      const messageData1 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'User message',
      };

      const messageData2 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.ASSISTANT,
        content: 'Assistant message',
      };

      const messageData3 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.SYSTEM,
        content: 'System message',
      };

      await AIMessage.create(messageData1);
      await AIMessage.create(messageData2);
      await AIMessage.create(messageData3);

      const userMessages = await AIMessage.findAll({
        where: { role: MessageRole.USER }
      });
      
      expect(userMessages).toHaveLength(1);
      expect(userMessages[0].role).toBe(MessageRole.USER);

      const assistantMessages = await AIMessage.findAll({
        where: { role: MessageRole.ASSISTANT }
      });
      
      expect(assistantMessages).toHaveLength(1);
      expect(assistantMessages[0].role).toBe(MessageRole.ASSISTANT);

      const systemMessages = await AIMessage.findAll({
        where: { role: MessageRole.SYSTEM }
      });
      
      expect(systemMessages).toHaveLength(1);
      expect(systemMessages[0].role).toBe(MessageRole.SYSTEM);
    });

    it('should filter messages by messageType', async () => {
      const messageData1 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Text message',
        messageType: MessageType.TEXT,
      };

      const messageData2 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Image message',
        messageType: MessageType.IMAGE,
        mediaUrl: 'https://example.com/image.jpg',
      };

      const messageData3 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Audio message',
        messageType: MessageType.AUDIO,
        mediaUrl: 'https://example.com/audio.mp3',
      };

      await AIMessage.create(messageData1);
      await AIMessage.create(messageData2);
      await AIMessage.create(messageData3);

      const textMessages = await AIMessage.findAll({
        where: { messageType: MessageType.TEXT }
      });
      
      expect(textMessages).toHaveLength(1);
      expect(textMessages[0].messageType).toBe(MessageType.TEXT);

      const imageMessages = await AIMessage.findAll({
        where: { messageType: MessageType.IMAGE }
      });
      
      expect(imageMessages).toHaveLength(1);
      expect(imageMessages[0].messageType).toBe(MessageType.IMAGE);

      const audioMessages = await AIMessage.findAll({
        where: { messageType: MessageType.AUDIO }
      });
      
      expect(audioMessages).toHaveLength(1);
      expect(audioMessages[0].messageType).toBe(MessageType.AUDIO);
    });

    it('should filter messages by status', async () => {
      const messageData1 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Sending message',
        status: MessageStatus.SENDING,
      };

      const messageData2 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Delivered message',
        status: MessageStatus.DELIVERED,
      };

      const messageData3 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Failed message',
        status: MessageStatus.FAILED,
      };

      await AIMessage.create(messageData1);
      await AIMessage.create(messageData2);
      await AIMessage.create(messageData3);

      const sendingMessages = await AIMessage.findAll({
        where: { status: MessageStatus.SENDING }
      });
      
      expect(sendingMessages).toHaveLength(1);
      expect(sendingMessages[0].status).toBe(MessageStatus.SENDING);

      const deliveredMessages = await AIMessage.findAll({
        where: { status: MessageStatus.DELIVERED }
      });
      
      expect(deliveredMessages).toHaveLength(1);
      expect(deliveredMessages[0].status).toBe(MessageStatus.DELIVERED);

      const failedMessages = await AIMessage.findAll({
        where: { status: MessageStatus.FAILED }
      });
      
      expect(failedMessages).toHaveLength(1);
      expect(failedMessages[0].status).toBe(MessageStatus.FAILED);
    });

    it('should filter messages by deletion status', async () => {
      const messageData1 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Active message',
        isDeleted: false,
      };

      const messageData2 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Deleted message',
        isDeleted: true,
      };

      await AIMessage.create(messageData1);
      await AIMessage.create(messageData2);

      const activeMessages = await AIMessage.findAll({
        where: { isDeleted: false }
      });
      
      expect(activeMessages).toHaveLength(1);
      expect(activeMessages[0].isDeleted).toBe(false);
      expect(activeMessages[0].content).toBe('Active message');

      const deletedMessages = await AIMessage.findAll({
        where: { isDeleted: true }
      });
      
      expect(deletedMessages).toHaveLength(1);
      expect(deletedMessages[0].isDeleted).toBe(true);
      expect(deletedMessages[0].content).toBe('Deleted message');
    });

    it('should search messages by content', async () => {
      const messageData1 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: '我想了解更多关于AI的知识',
      };

      const messageData2 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.ASSISTANT,
        content: 'AI是人工智能的缩写，包括机器学习、深度学习等技术',
      };

      const messageData3 = {
        conversationId: 'conv-67890-fghij',
        userId: 1001,
        role: MessageRole.USER,
        content: '请介绍一下机器学习',
      };

      await AIMessage.create(messageData1);
      await AIMessage.create(messageData2);
      await AIMessage.create(messageData3);

      const aiMessages = await AIMessage.findAll({
        where: {
          content: { [Sequelize.Op.like]: '%AI%' }
        }
      });
      
      expect(aiMessages).toHaveLength(2);
      expect(aiMessages.some(m => m.content.includes('AI的知识'))).toBe(true);
      expect(aiMessages.some(m => m.content.includes('AI是人工智能'))).toBe(true);

      const learningMessages = await AIMessage.findAll({
        where: {
          content: { [Sequelize.Op.like]: '%学习%' }
        }
      });
      
      expect(learningMessages).toHaveLength(2);
      expect(learningMessages.some(m => m.content.includes('机器学习'))).toBe(true);
      expect(learningMessages.some(m => m.content.includes('深度学习'))).toBe(true);
    });

    it('should filter messages by token count', async () => {
      const messageData1 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Short message',
        tokens: 3,
      };

      const messageData2 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Medium length message with more content',
        tokens: 8,
      };

      const messageData3 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Very long message with a lot of content that would require many tokens to process',
        tokens: 20,
      };

      await AIMessage.create(messageData1);
      await AIMessage.create(messageData2);
      await AIMessage.create(messageData3);

      const shortMessages = await AIMessage.findAll({
        where: { 
          tokens: { [Sequelize.Op.lte]: 5 }
        }
      });
      
      expect(shortMessages).toHaveLength(1);
      expect(shortMessages[0].tokens).toBe(3);

      const longMessages = await AIMessage.findAll({
        where: { 
          tokens: { [Sequelize.Op.gte]: 10 }
        }
      });
      
      expect(longMessages).toHaveLength(1);
      expect(longMessages[0].tokens).toBe(20);

      const mediumMessages = await AIMessage.findAll({
        where: { 
          tokens: { 
            [Sequelize.Op.gte]: 5, 
            [Sequelize.Op.lte]: 15 
          }
        }
      });
      
      expect(mediumMessages).toHaveLength(1);
      expect(mediumMessages[0].tokens).toBe(8);
    });
  });

  describe('Complex Queries', () => {
    it('should filter by multiple conditions', async () => {
      const messageData1 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'User text message',
        messageType: MessageType.TEXT,
        status: MessageStatus.DELIVERED,
      };

      const messageData2 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.ASSISTANT,
        content: 'Assistant image response',
        messageType: MessageType.IMAGE,
        status: MessageStatus.DELIVERED,
      };

      const messageData3 = {
        conversationId: 'conv-67890-fghij',
        userId: 1002,
        role: MessageRole.USER,
        content: 'Another user message',
        messageType: MessageType.TEXT,
        status: MessageStatus.SENDING,
      };

      await AIMessage.create(messageData1);
      await AIMessage.create(messageData2);
      await AIMessage.create(messageData3);

      // 查找conversation1中已送达的消息
      const conversation1Delivered = await AIMessage.findAll({
        where: {
          conversationId: 'conv-12345-abcde',
          status: MessageStatus.DELIVERED
        }
      });
      
      expect(conversation1Delivered).toHaveLength(2);
      expect(conversation1Delivered.every(m => m.conversationId === 'conv-12345-abcde')).toBe(true);
      expect(conversation1Delivered.every(m => m.status === MessageStatus.DELIVERED)).toBe(true);

      // 查找用户的文本消息
      const userTextMessages = await AIMessage.findAll({
        where: {
          role: MessageRole.USER,
          messageType: MessageType.TEXT
        }
      });
      
      expect(userTextMessages).toHaveLength(2);
      expect(userTextMessages.every(m => m.role === MessageRole.USER)).toBe(true);
      expect(userTextMessages.every(m => m.messageType === MessageType.TEXT)).toBe(true);

      // 复杂查询：用户1的已送达文本消息
      const complexQueryMessages = await AIMessage.findAll({
        where: {
          userId: 1001,
          role: MessageRole.USER,
          messageType: MessageType.TEXT,
          status: MessageStatus.DELIVERED
        }
      });
      
      expect(complexQueryMessages).toHaveLength(1);
      expect(complexQueryMessages[0].content).toBe('User text message');
    });

    it('should order messages by creation time', async () => {
      const baseTime = new Date('2023-06-15T09:45:10Z');
      
      const messageData1 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'First message',
        createdAt: new Date(baseTime.getTime() - 2000), // 2秒前
      };

      const messageData2 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.ASSISTANT,
        content: 'Second message',
        createdAt: new Date(baseTime.getTime() - 1000), // 1秒前
      };

      const messageData3 = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Third message',
        createdAt: baseTime,
      };

      await AIMessage.create(messageData1);
      await AIMessage.create(messageData2);
      await AIMessage.create(messageData3);

      const ascendingOrder = await AIMessage.findAll({
        where: { conversationId: 'conv-12345-abcde' },
        order: [['createdAt', 'ASC']]
      });
      
      expect(ascendingOrder).toHaveLength(3);
      expect(ascendingOrder[0].content).toBe('First message');
      expect(ascendingOrder[1].content).toBe('Second message');
      expect(ascendingOrder[2].content).toBe('Third message');

      const descendingOrder = await AIMessage.findAll({
        where: { conversationId: 'conv-12345-abcde' },
        order: [['createdAt', 'DESC']]
      });
      
      expect(descendingOrder).toHaveLength(3);
      expect(descendingOrder[0].content).toBe('Third message');
      expect(descendingOrder[1].content).toBe('Second message');
      expect(descendingOrder[2].content).toBe('First message');
    });
  });

  describe('Model Associations', () => {
    it('should have no associations defined', () => {
      initAIMessageAssociations();

      // 验证没有定义关联关系
      const associations = AIMessage.associations;
      expect(Object.keys(associations)).toHaveLength(0);
    });

    it('should handle association initialization without errors', () => {
      // 确保关联初始化不会抛出错误
      expect(() => {
        initAIMessageAssociations();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long content', async () => {
      const longContent = 'A'.repeat(10000); // 很长的消息内容
      
      const messageData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: longContent,
      };

      const message = await AIMessage.create(messageData);
      
      expect(message.content).toBe(longContent);
    });

    it('should handle special characters in content', async () => {
      const specialContent = '消息内容包含特殊字符：中文、English、🚀、123、!@#$%^&*()';
      
      const messageData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: specialContent,
      };

      const message = await AIMessage.create(messageData);
      
      expect(message.content).toBe(specialContent);
    });

    it('should handle large metadata objects', async () => {
      const largeMetadata = {
        user: {
          id: 1001,
          name: 'Test User',
          preferences: {
            theme: 'dark',
            language: 'zh-CN',
            notifications: {
              email: true,
              push: true,
              sms: false
            }
          }
        },
        context: {
          page: '/chat',
          action: 'send_message',
          timestamp: new Date().toISOString(),
          metadata: {
            version: '1.0.0',
            client: 'web',
            browser: 'Chrome',
            os: 'Windows'
          }
        }
      };

      const messageData = {
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Message with large metadata',
        metadata: largeMetadata,
      };

      const message = await AIMessage.create(messageData);
      
      expect(message.metadata).toEqual(largeMetadata);
    });

    it('should handle extreme token values', async () => {
      const extremeValues = [0, 1, 1000, 10000];
      
      for (const tokens of extremeValues) {
        const messageData = {
          conversationId: 'conv-12345-abcde',
          userId: 1001,
          role: MessageRole.USER,
          content: `Message with ${tokens} tokens`,
          tokens,
        };

        const message = await AIMessage.create(messageData);
        expect(message.tokens).toBe(tokens);
      }
    });

    it('should handle concurrent updates', async () => {
      const message = await AIMessage.create({
        conversationId: 'conv-12345-abcde',
        userId: 1001,
        role: MessageRole.USER,
        content: 'Concurrent test message',
        status: MessageStatus.SENDING,
      });

      // 并发更新
      const update1 = message.update({ status: MessageStatus.DELIVERED });
      const update2 = message.update({ status: MessageStatus.FAILED });
      
      await Promise.all([update1, update2]);
      
      const updated = await AIMessage.findByPk(message.id);
      expect(updated?.status).toBe(MessageStatus.FAILED); // 最后一个更新生效
    });

    it('should handle bulk operations', async () => {
      const messagesData = [
        {
          conversationId: 'conv-12345-abcde',
          userId: 1001,
          role: MessageRole.USER,
          content: 'Bulk message 1',
        },
        {
          conversationId: 'conv-12345-abcde',
          userId: 1001,
          role: MessageRole.ASSISTANT,
          content: 'Bulk response 1',
        },
        {
          conversationId: 'conv-12345-abcde',
          userId: 1001,
          role: MessageRole.USER,
          content: 'Bulk message 2',
        },
      ];

      const createdMessages = await AIMessage.bulkCreate(messagesData);
      
      expect(createdMessages).toHaveLength(3);
      expect(createdMessages[0].content).toBe('Bulk message 1');
      expect(createdMessages[1].content).toBe('Bulk response 1');
      expect(createdMessages[2].content).toBe('Bulk message 2');

      // 批量更新
      await AIMessage.update(
        { status: MessageStatus.DELIVERED },
        { where: { conversationId: 'conv-12345-abcde' } }
      );

      const updatedMessages = await AIMessage.findAll({
        where: { conversationId: 'conv-12345-abcde' }
      });
      
      expect(updatedMessages).toHaveLength(3);
      expect(updatedMessages.every(m => m.status === MessageStatus.DELIVERED)).toBe(true);
    });
  });
});