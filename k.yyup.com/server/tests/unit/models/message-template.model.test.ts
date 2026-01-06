import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { 
  MessageTemplate, 
  MessageType, 
  TemplateStatus, 
  initMessageTemplate, 
  initMessageTemplateAssociations 
} from '../../../src/models/message-template.model';
import { User } from '../../../src/models/user.model';


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

describe('MessageTemplate Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    // Initialize related models
    User.initModel(sequelize);
    initMessageTemplate(sequelize);
    
    // Initialize associations
    initMessageTemplateAssociations();
    
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await MessageTemplate.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(MessageTemplate.tableName).toBe('message_templates');
    });

    it('should have correct attributes', () => {
      const attributes = Object.keys(MessageTemplate.getAttributes());
      expect(attributes).toContain('id');
      expect(attributes).toContain('templateCode');
      expect(attributes).toContain('name');
      expect(attributes).toContain('messageType');
      expect(attributes).toContain('titleTemplate');
      expect(attributes).toContain('contentTemplate');
      expect(attributes).toContain('variables');
      expect(attributes).toContain('language');
      expect(attributes).toContain('description');
      expect(attributes).toContain('category');
      expect(attributes).toContain('providerTemplateId');
      expect(attributes).toContain('provider');
      expect(attributes).toContain('status');
      expect(attributes).toContain('rejectionReason');
      expect(attributes).toContain('creatorId');
      expect(attributes).toContain('updaterId');
    });
  });

  describe('Field Validation', () => {
    it('should require templateCode', async () => {
      const template = MessageTemplate.build({
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
      } as any);

      await expect(template.save()).rejects.toThrow();
    });

    it('should require name', async () => {
      const template = MessageTemplate.build({
        templateCode: 'TEST001',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
      } as any);

      await expect(template.save()).rejects.toThrow();
    });

    it('should require messageType', async () => {
      const template = MessageTemplate.build({
        templateCode: 'TEST001',
        name: 'Test Template',
        contentTemplate: 'Test content',
      } as any);

      await expect(template.save()).rejects.toThrow();
    });

    it('should require contentTemplate', async () => {
      const template = MessageTemplate.build({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.SMS,
      } as any);

      await expect(template.save()).rejects.toThrow();
    });

    it('should enforce unique templateCode constraint', async () => {
      await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template 1',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content 1',
      });

      const template2 = MessageTemplate.build({
        templateCode: 'TEST001',
        name: 'Test Template 2',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content 2',
      });

      await expect(template2.save()).rejects.toThrow();
    });

    it('should create MessageTemplate with valid data', async () => {
      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Hello {name}, your message is: {message}',
        titleTemplate: 'Test Message',
        variables: { name: 'string', message: 'string' },
        language: 'zh-CN',
        description: 'Test template description',
        category: 'notification',
      });

      expect(template.id).toBeDefined();
      expect(template.templateCode).toBe('TEST001');
      expect(template.name).toBe('Test Template');
      expect(template.messageType).toBe(MessageType.SMS);
      expect(template.contentTemplate).toBe('Hello {name}, your message is: {message}');
      expect(template.titleTemplate).toBe('Test Message');
      expect(template.variables).toEqual({ name: 'string', message: 'string' });
      expect(template.language).toBe('zh-CN');
      expect(template.description).toBe('Test template description');
      expect(template.category).toBe('notification');
      expect(template.status).toBe(TemplateStatus.ACTIVE);
    });

    it('should have default values', async () => {
      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.EMAIL,
        contentTemplate: 'Test content',
      });

      expect(template.language).toBe('zh-CN');
      expect(template.status).toBe(TemplateStatus.ACTIVE);
      expect(template.titleTemplate).toBeNull();
      expect(template.variables).toBeNull();
      expect(template.description).toBeNull();
      expect(template.category).toBeNull();
      expect(template.providerTemplateId).toBeNull();
      expect(template.provider).toBeNull();
      expect(template.rejectionReason).toBeNull();
      expect(template.creatorId).toBeNull();
      expect(template.updaterId).toBeNull();
    });
  });

  describe('Enum Values', () => {
    it('should accept valid MessageType values', async () => {
      const messageTypes = [
        MessageType.SMS,
        MessageType.EMAIL,
        MessageType.WECHAT,
        MessageType.PUSH,
        MessageType.INTERNAL,
      ];

      for (const messageType of messageTypes) {
        const template = await MessageTemplate.create({
          templateCode: `TEST_${messageType}`,
          name: `Test ${messageType} Template`,
          messageType,
          contentTemplate: `Test content for ${messageType}`,
        });

        expect(template.messageType).toBe(messageType);
      }
    });

    it('should accept valid TemplateStatus values', async () => {
      const statuses = [
        TemplateStatus.ACTIVE,
        TemplateStatus.INACTIVE,
        TemplateStatus.PENDING_REVIEW,
        TemplateStatus.REJECTED,
      ];

      for (const status of statuses) {
        const template = await MessageTemplate.create({
          templateCode: `TEST_${status}`,
          name: `Test ${status} Template`,
          messageType: MessageType.SMS,
          contentTemplate: `Test content for ${status}`,
          status,
        });

        expect(template.status).toBe(status);
      }
    });
  });

  describe('JSON Fields', () => {
    it('should handle JSON variables', async () => {
      const variables = {
        name: { type: 'string', required: true, description: 'User name' },
        amount: { type: 'number', required: false, description: 'Amount' },
        date: { type: 'string', required: true, description: 'Date' },
      };

      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.EMAIL,
        contentTemplate: 'Hello {name}, your amount is {amount} on {date}',
        variables,
      });

      expect(template.variables).toEqual(variables);
    });

    it('should handle complex JSON variables', async () => {
      const variables = {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' }
          }
        },
        order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            total: { type: 'number' },
            items: { type: 'array' }
          }
        }
      };

      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.EMAIL,
        contentTemplate: 'Order {order.id} for user {user.name}',
        variables,
      });

      expect(template.variables).toEqual(variables);
    });

    it('should handle null JSON fields', async () => {
      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
        variables: null,
      });

      expect(template.variables).toBeNull();
    });
  });

  describe('String Field Lengths', () => {
    it('should handle templateCode within length limit', async () => {
      const longCode = 'A'.repeat(50); // Max length for templateCode

      const template = await MessageTemplate.create({
        templateCode: longCode,
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
      });

      expect(template.templateCode).toBe(longCode);
    });

    it('should handle name within length limit', async () => {
      const longName = 'A'.repeat(100); // Max length for name

      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: longName,
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
      });

      expect(template.name).toBe(longName);
    });

    it('should handle titleTemplate within length limit', async () => {
      const longTitle = 'A'.repeat(255); // Max length for titleTemplate

      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.EMAIL,
        contentTemplate: 'Test content',
        titleTemplate: longTitle,
      });

      expect(template.titleTemplate).toBe(longTitle);
    });

    it('should handle description within length limit', async () => {
      const longDescription = 'A'.repeat(255); // Max length for description

      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
        description: longDescription,
      });

      expect(template.description).toBe(longDescription);
    });

    it('should handle category within length limit', async () => {
      const longCategory = 'A'.repeat(50); // Max length for category

      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
        category: longCategory,
      });

      expect(template.category).toBe(longCategory);
    });

    it('should handle providerTemplateId within length limit', async () => {
      const longProviderId = 'A'.repeat(64); // Max length for providerTemplateId

      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
        providerTemplateId: longProviderId,
      });

      expect(template.providerTemplateId).toBe(longProviderId);
    });

    it('should handle provider within length limit', async () => {
      const longProvider = 'A'.repeat(50); // Max length for provider

      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
        provider: longProvider,
      });

      expect(template.provider).toBe(longProvider);
    });
  });

  describe('Text Fields', () => {
    it('should handle long contentTemplate', async () => {
      const longContent = 'A'.repeat(10000); // Very long content

      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.EMAIL,
        contentTemplate: longContent,
      });

      expect(template.contentTemplate).toBe(longContent);
    });

    it('should handle long rejectionReason', async () => {
      const longReason = 'A'.repeat(5000); // Very long rejection reason

      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
        status: TemplateStatus.REJECTED,
        rejectionReason: longReason,
      });

      expect(template.rejectionReason).toBe(longReason);
    });
  });

  describe('Associations', () => {
    it('should belong to creator', async () => {
      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
        creatorId: creator.id,
      });

      const templateWithCreator = await MessageTemplate.findByPk(template.id, {
        include: ['creator'],
      });

      expect(templateWithCreator?.creator).toBeDefined();
      expect(templateWithCreator?.creator?.id).toBe(creator.id);
    });

    it('should belong to updater', async () => {
      const updater = await User.create({
        username: 'updater',
        email: 'updater@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
        updaterId: updater.id,
      });

      const templateWithUpdater = await MessageTemplate.findByPk(template.id, {
        include: ['updater'],
      });

      expect(templateWithUpdater?.updater).toBeDefined();
      expect(templateWithUpdater?.updater?.id).toBe(updater.id);
    });
  });

  describe('CRUD Operations', () => {
    it('should create MessageTemplate successfully', async () => {
      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Hello {name}, this is a test message',
      });

      expect(template.id).toBeDefined();
      expect(template.templateCode).toBe('TEST001');
      expect(template.name).toBe('Test Template');
      expect(template.messageType).toBe(MessageType.SMS);
      expect(template.contentTemplate).toBe('Hello {name}, this is a test message');
    });

    it('should read MessageTemplate successfully', async () => {
      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
      });

      const foundTemplate = await MessageTemplate.findByPk(template.id);

      expect(foundTemplate).toBeDefined();
      expect(foundTemplate?.id).toBe(template.id);
      expect(foundTemplate?.templateCode).toBe('TEST001');
      expect(foundTemplate?.name).toBe('Test Template');
    });

    it('should update MessageTemplate successfully', async () => {
      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
        status: TemplateStatus.ACTIVE,
      });

      await template.update({
        name: 'Updated Template',
        contentTemplate: 'Updated content',
        status: TemplateStatus.INACTIVE,
        rejectionReason: 'Deprecated template',
      });

      const updatedTemplate = await MessageTemplate.findByPk(template.id);

      expect(updatedTemplate?.name).toBe('Updated Template');
      expect(updatedTemplate?.contentTemplate).toBe('Updated content');
      expect(updatedTemplate?.status).toBe(TemplateStatus.INACTIVE);
      expect(updatedTemplate?.rejectionReason).toBe('Deprecated template');
    });

    it('should delete MessageTemplate successfully', async () => {
      const template = await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content',
      });

      await template.destroy();

      const deletedTemplate = await MessageTemplate.findByPk(template.id);

      expect(deletedTemplate).toBeNull();
    });
  });

  describe('Query Methods', () => {
    it('should find MessageTemplate by templateCode', async () => {
      await MessageTemplate.create({
        templateCode: 'TEST001',
        name: 'Test Template 1',
        messageType: MessageType.SMS,
        contentTemplate: 'Test content 1',
      });

      await MessageTemplate.create({
        templateCode: 'TEST002',
        name: 'Test Template 2',
        messageType: MessageType.EMAIL,
        contentTemplate: 'Test content 2',
      });

      const template1 = await MessageTemplate.findOne({
        where: { templateCode: 'TEST001' },
      });

      const template2 = await MessageTemplate.findOne({
        where: { templateCode: 'TEST002' },
      });

      expect(template1).toBeDefined();
      expect(template2).toBeDefined();
      expect(template1?.name).toBe('Test Template 1');
      expect(template2?.name).toBe('Test Template 2');
    });

    it('should find MessageTemplate by messageType', async () => {
      await MessageTemplate.create({
        templateCode: 'SMS001',
        name: 'SMS Template',
        messageType: MessageType.SMS,
        contentTemplate: 'SMS content',
      });

      await MessageTemplate.create({
        templateCode: 'EMAIL001',
        name: 'Email Template',
        messageType: MessageType.EMAIL,
        contentTemplate: 'Email content',
      });

      const smsTemplates = await MessageTemplate.findAll({
        where: { messageType: MessageType.SMS },
      });

      const emailTemplates = await MessageTemplate.findAll({
        where: { messageType: MessageType.EMAIL },
      });

      expect(smsTemplates.length).toBe(1);
      expect(emailTemplates.length).toBe(1);
      expect(smsTemplates[0].name).toBe('SMS Template');
      expect(emailTemplates[0].name).toBe('Email Template');
    });

    it('should find MessageTemplate by status', async () => {
      await MessageTemplate.create({
        templateCode: 'ACTIVE001',
        name: 'Active Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Active content',
        status: TemplateStatus.ACTIVE,
      });

      await MessageTemplate.create({
        templateCode: 'INACTIVE001',
        name: 'Inactive Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Inactive content',
        status: TemplateStatus.INACTIVE,
      });

      const activeTemplates = await MessageTemplate.findAll({
        where: { status: TemplateStatus.ACTIVE },
      });

      const inactiveTemplates = await MessageTemplate.findAll({
        where: { status: TemplateStatus.INACTIVE },
      });

      expect(activeTemplates.length).toBe(1);
      expect(inactiveTemplates.length).toBe(1);
      expect(activeTemplates[0].name).toBe('Active Template');
      expect(inactiveTemplates[0].name).toBe('Inactive Template');
    });

    it('should find MessageTemplate by category', async () => {
      await MessageTemplate.create({
        templateCode: 'NOTIF001',
        name: 'Notification Template',
        messageType: MessageType.SMS,
        contentTemplate: 'Notification content',
        category: 'notification',
      });

      await MessageTemplate.create({
        templateCode: 'PROMO001',
        name: 'Promotion Template',
        messageType: MessageType.EMAIL,
        contentTemplate: 'Promotion content',
        category: 'promotion',
      });

      const notificationTemplates = await MessageTemplate.findAll({
        where: { category: 'notification' },
      });

      const promotionTemplates = await MessageTemplate.findAll({
        where: { category: 'promotion' },
      });

      expect(notificationTemplates.length).toBe(1);
      expect(promotionTemplates.length).toBe(1);
      expect(notificationTemplates[0].name).toBe('Notification Template');
      expect(promotionTemplates[0].name).toBe('Promotion Template');
    });

    it('should find MessageTemplate by language', async () => {
      await MessageTemplate.create({
        templateCode: 'ZH001',
        name: 'Chinese Template',
        messageType: MessageType.SMS,
        contentTemplate: '中文内容',
        language: 'zh-CN',
      });

      await MessageTemplate.create({
        templateCode: 'EN001',
        name: 'English Template',
        messageType: MessageType.SMS,
        contentTemplate: 'English content',
        language: 'en-US',
      });

      const chineseTemplates = await MessageTemplate.findAll({
        where: { language: 'zh-CN' },
      });

      const englishTemplates = await MessageTemplate.findAll({
        where: { language: 'en-US' },
      });

      expect(chineseTemplates.length).toBe(1);
      expect(englishTemplates.length).toBe(1);
      expect(chineseTemplates[0].name).toBe('Chinese Template');
      expect(englishTemplates[0].name).toBe('English Template');
    });

    it('should find MessageTemplate with complex conditions', async () => {
      await MessageTemplate.create({
        templateCode: 'ACTIVE_SMS_ZH',
        name: 'Active SMS Chinese',
        messageType: MessageType.SMS,
        contentTemplate: '中文短信内容',
        status: TemplateStatus.ACTIVE,
        language: 'zh-CN',
      });

      await MessageTemplate.create({
        templateCode: 'INACTIVE_SMS_ZH',
        name: 'Inactive SMS Chinese',
        messageType: MessageType.SMS,
        contentTemplate: '中文短信内容',
        status: TemplateStatus.INACTIVE,
        language: 'zh-CN',
      });

      await MessageTemplate.create({
        templateCode: 'ACTIVE_EMAIL_EN',
        name: 'Active Email English',
        messageType: MessageType.EMAIL,
        contentTemplate: 'English email content',
        status: TemplateStatus.ACTIVE,
        language: 'en-US',
      });

      const templates = await MessageTemplate.findAll({
        where: {
          status: TemplateStatus.ACTIVE,
          language: 'zh-CN',
        },
      });

      expect(templates.length).toBe(1);
      expect(templates[0].name).toBe('Active SMS Chinese');
    });
  });
});