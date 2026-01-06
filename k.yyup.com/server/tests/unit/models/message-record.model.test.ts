import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { 
  MessageRecord, 
  SenderType, 
  ReceiverType, 
  MessageType, 
  MessageStatus, 
  initMessageRecord, 
  initMessageRecordAssociations 
} from '../../../src/models/message-record.model';
import { User } from '../../../src/models/user.model';
import { MessageTemplate } from '../../../src/models/message-template.model';


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

describe('MessageRecord Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    // Initialize related models
    User.initModel(sequelize);
    MessageTemplate.initModel(sequelize);
    initMessageRecord(sequelize);
    
    // Initialize associations
    initMessageRecordAssociations();
    
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await MessageRecord.destroy({ where: {} });
    await User.destroy({ where: {} });
    await MessageTemplate.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(MessageRecord.tableName).toBe('message_records');
    });

    it('should have correct attributes', () => {
      const attributes = Object.keys(MessageRecord.getAttributes());
      expect(attributes).toContain('id');
      expect(attributes).toContain('senderId');
      expect(attributes).toContain('senderType');
      expect(attributes).toContain('receiverId');
      expect(attributes).toContain('receiverType');
      expect(attributes).toContain('messageType');
      expect(attributes).toContain('templateId');
      expect(attributes).toContain('title');
      expect(attributes).toContain('content');
      expect(attributes).toContain('variables');
      expect(attributes).toContain('attachments');
      expect(attributes).toContain('status');
      expect(attributes).toContain('errorMessage');
      expect(attributes).toContain('provider');
      expect(attributes).toContain('externalId');
      expect(attributes).toContain('sentAt');
      expect(attributes).toContain('deliveredAt');
      expect(attributes).toContain('readAt');
    });
  });

  describe('Field Validation', () => {
    it('should require senderId', async () => {
      const record = MessageRecord.build({
        senderType: SenderType.SYSTEM,
        receiverId: 1,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Test message',
      } as any);

      await expect(record.save()).rejects.toThrow();
    });

    it('should require receiverId', async () => {
      const record = MessageRecord.build({
        senderId: 1,
        senderType: SenderType.SYSTEM,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Test message',
      } as any);

      await expect(record.save()).rejects.toThrow();
    });

    it('should require messageType', async () => {
      const record = MessageRecord.build({
        senderId: 1,
        senderType: SenderType.SYSTEM,
        receiverId: 1,
        receiverType: ReceiverType.USER,
        content: 'Test message',
      } as any);

      await expect(record.save()).rejects.toThrow();
    });

    it('should require content', async () => {
      const record = MessageRecord.build({
        senderId: 1,
        senderType: SenderType.SYSTEM,
        receiverId: 1,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
      } as any);

      await expect(record.save()).rejects.toThrow();
    });

    it('should create MessageRecord with valid data', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const record = await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.USER,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Test message content',
        title: 'Test message title',
      });

      expect(record.id).toBeDefined();
      expect(record.senderId).toBe(sender.id);
      expect(record.senderType).toBe(SenderType.USER);
      expect(record.receiverId).toBe(receiver.id);
      expect(record.receiverType).toBe(ReceiverType.USER);
      expect(record.messageType).toBe(MessageType.SMS);
      expect(record.content).toBe('Test message content');
      expect(record.title).toBe('Test message title');
      expect(record.status).toBe(MessageStatus.PENDING);
    });

    it('should have default values', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const record = await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.EMAIL,
        content: 'Test message content',
      });

      expect(record.senderType).toBe(SenderType.SYSTEM);
      expect(record.receiverType).toBe(ReceiverType.USER);
      expect(record.status).toBe(MessageStatus.PENDING);
      expect(record.title).toBeNull();
      expect(record.variables).toBeNull();
      expect(record.attachments).toBeNull();
      expect(record.errorMessage).toBeNull();
      expect(record.provider).toBeNull();
      expect(record.externalId).toBeNull();
      expect(record.sentAt).toBeNull();
      expect(record.deliveredAt).toBeNull();
      expect(record.readAt).toBeNull();
    });
  });

  describe('Enum Values', () => {
    it('should accept valid SenderType values', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const senderTypes = [
        SenderType.USER,
        SenderType.SYSTEM,
        SenderType.ADMIN,
      ];

      for (const senderType of senderTypes) {
        const record = await MessageRecord.create({
          senderId: sender.id,
          senderType,
          receiverId: receiver.id,
          receiverType: ReceiverType.USER,
          messageType: MessageType.SMS,
          content: `Test message for ${senderType}`,
        });

        expect(record.senderType).toBe(senderType);
      }
    });

    it('should accept valid ReceiverType values', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const receiverTypes = [
        ReceiverType.USER,
        ReceiverType.ADMIN,
        ReceiverType.GROUP,
      ];

      for (const receiverType of receiverTypes) {
        const record = await MessageRecord.create({
          senderId: sender.id,
          senderType: SenderType.SYSTEM,
          receiverId: receiver.id,
          receiverType,
          messageType: MessageType.SMS,
          content: `Test message for ${receiverType}`,
        });

        expect(record.receiverType).toBe(receiverType);
      }
    });

    it('should accept valid MessageType values', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const messageTypes = [
        MessageType.SMS,
        MessageType.EMAIL,
        MessageType.WECHAT,
        MessageType.PUSH,
        MessageType.INTERNAL,
      ];

      for (const messageType of messageTypes) {
        const record = await MessageRecord.create({
          senderId: sender.id,
          senderType: SenderType.SYSTEM,
          receiverId: receiver.id,
          receiverType: ReceiverType.USER,
          messageType,
          content: `Test message for ${messageType}`,
        });

        expect(record.messageType).toBe(messageType);
      }
    });

    it('should accept valid MessageStatus values', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const statuses = [
        MessageStatus.PENDING,
        MessageStatus.SENT,
        MessageStatus.DELIVERED,
        MessageStatus.FAILED,
        MessageStatus.READ,
      ];

      for (const status of statuses) {
        const record = await MessageRecord.create({
          senderId: sender.id,
          senderType: SenderType.SYSTEM,
          receiverId: receiver.id,
          receiverType: ReceiverType.USER,
          messageType: MessageType.SMS,
          content: `Test message for ${status}`,
          status,
        });

        expect(record.status).toBe(status);
      }
    });
  });

  describe('JSON Fields', () => {
    it('should handle JSON variables', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const variables = {
        name: 'John Doe',
        amount: 100,
        date: new Date().toISOString(),
      };

      const record = await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.EMAIL,
        content: 'Test message with variables',
        variables,
      });

      expect(record.variables).toEqual(variables);
    });

    it('should handle JSON attachments', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const attachments = [
        {
          filename: 'document.pdf',
          url: 'https://example.com/document.pdf',
          size: 1024,
        },
        {
          filename: 'image.jpg',
          url: 'https://example.com/image.jpg',
          size: 2048,
        },
      ];

      const record = await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.EMAIL,
        content: 'Test message with attachments',
        attachments,
      });

      expect(record.attachments).toEqual(attachments);
    });

    it('should handle null JSON fields', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const record = await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Test message without JSON fields',
        variables: null,
        attachments: null,
      });

      expect(record.variables).toBeNull();
      expect(record.attachments).toBeNull();
    });
  });

  describe('Associations', () => {
    it('should belong to sender', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const record = await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.USER,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Test message',
      });

      const recordWithSender = await MessageRecord.findByPk(record.id, {
        include: ['sender'],
      });

      expect(recordWithSender?.sender).toBeDefined();
      expect(recordWithSender?.sender?.id).toBe(sender.id);
    });

    it('should belong to receiver', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const record = await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Test message',
      });

      const recordWithReceiver = await MessageRecord.findByPk(record.id, {
        include: ['receiver'],
      });

      expect(recordWithReceiver?.receiver).toBeDefined();
      expect(recordWithReceiver?.receiver?.id).toBe(receiver.id);
    });

    it('should belong to template', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const template = await MessageTemplate.create({
        templateCode: 'TEST_TEMPLATE',
        name: 'Test Template',
        messageType: MessageType.EMAIL,
        contentTemplate: 'Hello {name}, your message is: {message}',
      });

      const record = await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.EMAIL,
        content: 'Test message',
        templateId: template.id,
      });

      const recordWithTemplate = await MessageRecord.findByPk(record.id, {
        include: ['template'],
      });

      expect(recordWithTemplate?.template).toBeDefined();
      expect(recordWithTemplate?.template?.id).toBe(template.id);
    });
  });

  describe('CRUD Operations', () => {
    it('should create MessageRecord successfully', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const record = await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Test message content',
        title: 'Test message title',
      });

      expect(record.id).toBeDefined();
      expect(record.senderId).toBe(sender.id);
      expect(receiver.id).toBe(receiver.id);
      expect(record.content).toBe('Test message content');
      expect(record.title).toBe('Test message title');
    });

    it('should read MessageRecord successfully', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const record = await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Test message content',
      });

      const foundRecord = await MessageRecord.findByPk(record.id);

      expect(foundRecord).toBeDefined();
      expect(foundRecord?.id).toBe(record.id);
      expect(foundRecord?.content).toBe('Test message content');
    });

    it('should update MessageRecord successfully', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const record = await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Test message content',
        status: MessageStatus.PENDING,
      });

      await record.update({
        status: MessageStatus.SENT,
        sentAt: new Date(),
        provider: 'Twilio',
        externalId: 'ext123',
      });

      const updatedRecord = await MessageRecord.findByPk(record.id);

      expect(updatedRecord?.status).toBe(MessageStatus.SENT);
      expect(updatedRecord?.sentAt).toBeInstanceOf(Date);
      expect(updatedRecord?.provider).toBe('Twilio');
      expect(updatedRecord?.externalId).toBe('ext123');
    });

    it('should delete MessageRecord successfully', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      const record = await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Test message content',
      });

      await record.destroy();

      const deletedRecord = await MessageRecord.findByPk(record.id);

      expect(deletedRecord).toBeNull();
    });
  });

  describe('Query Methods', () => {
    it('should find MessageRecord by sender', async () => {
      const sender1 = await User.create({
        username: 'sender1',
        email: 'sender1@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const sender2 = await User.create({
        username: 'sender2',
        email: 'sender2@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      await MessageRecord.create({
        senderId: sender1.id,
        senderType: SenderType.USER,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Message from sender1',
      });

      await MessageRecord.create({
        senderId: sender2.id,
        senderType: SenderType.USER,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Message from sender2',
      });

      const sender1Records = await MessageRecord.findAll({
        where: { senderId: sender1.id },
      });

      const sender2Records = await MessageRecord.findAll({
        where: { senderId: sender2.id },
      });

      expect(sender1Records.length).toBe(1);
      expect(sender2Records.length).toBe(1);
      expect(sender1Records[0].content).toBe('Message from sender1');
      expect(sender2Records[0].content).toBe('Message from sender2');
    });

    it('should find MessageRecord by receiver', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver1 = await User.create({
        username: 'receiver1',
        email: 'receiver1@test.com',
        password: 'password123',
        role: 'user',
      });

      const receiver2 = await User.create({
        username: 'receiver2',
        email: 'receiver2@test.com',
        password: 'password123',
        role: 'user',
      });

      await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver1.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Message to receiver1',
      });

      await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver2.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Message to receiver2',
      });

      const receiver1Records = await MessageRecord.findAll({
        where: { receiverId: receiver1.id },
      });

      const receiver2Records = await MessageRecord.findAll({
        where: { receiverId: receiver2.id },
      });

      expect(receiver1Records.length).toBe(1);
      expect(receiver2Records.length).toBe(1);
      expect(receiver1Records[0].content).toBe('Message to receiver1');
      expect(receiver2Records[0].content).toBe('Message to receiver2');
    });

    it('should find MessageRecord by status', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Pending message',
        status: MessageStatus.PENDING,
      });

      await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'Sent message',
        status: MessageStatus.SENT,
      });

      const pendingRecords = await MessageRecord.findAll({
        where: { status: MessageStatus.PENDING },
      });

      const sentRecords = await MessageRecord.findAll({
        where: { status: MessageStatus.SENT },
      });

      expect(pendingRecords.length).toBe(1);
      expect(sentRecords.length).toBe(1);
      expect(pendingRecords[0].content).toBe('Pending message');
      expect(sentRecords[0].content).toBe('Sent message');
    });

    it('should find MessageRecord by messageType', async () => {
      const sender = await User.create({
        username: 'sender',
        email: 'sender@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const receiver = await User.create({
        username: 'receiver',
        email: 'receiver@test.com',
        password: 'password123',
        role: 'user',
      });

      await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.SMS,
        content: 'SMS message',
      });

      await MessageRecord.create({
        senderId: sender.id,
        senderType: SenderType.SYSTEM,
        receiverId: receiver.id,
        receiverType: ReceiverType.USER,
        messageType: MessageType.EMAIL,
        content: 'Email message',
      });

      const smsRecords = await MessageRecord.findAll({
        where: { messageType: MessageType.SMS },
      });

      const emailRecords = await MessageRecord.findAll({
        where: { messageType: MessageType.EMAIL },
      });

      expect(smsRecords.length).toBe(1);
      expect(emailRecords.length).toBe(1);
      expect(smsRecords[0].content).toBe('SMS message');
      expect(emailRecords[0].content).toBe('Email message');
    });
  });
});