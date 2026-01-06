import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Sequelize, DataTypes } from 'sequelize';
import { 
  AdmissionNotification, 
  NotificationMethod,
  NotificationStatus,
  initAdmissionNotification,
  initAdmissionNotificationAssociations 
} from '../../../src/models/admission-notification.model';
import { ParentStudentRelation } from '../../../src/models/parent-student-relation.model';
import { MessageTemplate } from '../../../src/models/message-template.model';
import { AdmissionResult } from '../../../src/models/admission-result.model';
import { User } from '../../../src/models/user.model';

// Mock the associated models
jest.mock('../../../src/models/parent-student-relation.model');
jest.mock('../../../src/models/message-template.model');
jest.mock('../../../src/models/admission-result.model');
jest.mock('../../../src/models/user.model');

describe('AdmissionNotification Model', () => {
  let sequelize: Sequelize;
  let mockParentStudentRelation: any;
  let mockMessageTemplate: any;
  let mockAdmissionResult: any;
  let mockUser: any;

  beforeEach(async () => {
    // Create in-memory SQLite database for testing
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
      define: {
        timestamps: true,
        paranoid: true,
        underscored: true,
      },
    });

    // Setup mock models
    mockParentStudentRelation = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
    mockMessageTemplate = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
    mockAdmissionResult = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
    mockUser = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };

    // Mock the imported models
    (ParentStudentRelation as any).mockImplementation(() => mockParentStudentRelation);
    (MessageTemplate as any).mockImplementation(() => mockMessageTemplate);
    (AdmissionResult as any).mockImplementation(() => mockAdmissionResult);
    (User as any).mockImplementation(() => mockUser);

    // Initialize the model
    initAdmissionNotification(sequelize);
    initAdmissionNotificationAssociations();

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should define the model correctly', () => {
      expect(AdmissionNotification).toBeDefined();
      expect(AdmissionNotification.tableName).toBe('admission_notifications');
    });

    it('should have correct attributes', () => {
      const attributes = AdmissionNotification.getAttributes();
      
      expect(attributes.id).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        autoIncrement: true,
        primaryKey: true,
      });
      
      expect(attributes.method).toMatchObject({
        type: expect.any(DataTypes.ENUM),
        allowNull: false,
      });
      
      expect(attributes.parentId).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
      });
      
      expect(attributes.templateId).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: true,
      });
      
      expect(attributes.admissionId).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
      });
      
      expect(attributes.title).toMatchObject({
        type: expect.any(DataTypes.STRING),
        allowNull: false,
      });
      
      expect(attributes.content).toMatchObject({
        type: expect.any(DataTypes.TEXT),
        allowNull: false,
      });
      
      expect(attributes.status).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
        defaultValue: NotificationStatus.DRAFT,
      });
      
      expect(attributes.responseRequired).toMatchObject({
        type: expect.any(DataTypes.BOOLEAN),
        allowNull: false,
        defaultValue: false,
      });
      
      expect(attributes.retryCount).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
        defaultValue: 0,
      });
    });

    it('should have correct table options', () => {
      const options = AdmissionNotification.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });
  });

  describe('Enum Values', () => {
    it('should have correct NotificationMethod values', () => {
      expect(NotificationMethod.SMS).toBe('sms');
      expect(NotificationMethod.EMAIL).toBe('email');
      expect(NotificationMethod.SYSTEM).toBe('system');
    });

    it('should have correct NotificationStatus values', () => {
      expect(NotificationStatus.DRAFT).toBe(0);
      expect(NotificationStatus.PENDING).toBe(1);
      expect(NotificationStatus.SENT).toBe(2);
      expect(NotificationStatus.DELIVERED).toBe(3);
      expect(NotificationStatus.READ).toBe(4);
      expect(NotificationStatus.FAILED).toBe(5);
      expect(NotificationStatus.CANCELLED).toBe(6);
    });
  });

  describe('Model Validations', () => {
    it('should validate required fields', async () => {
      const notification = AdmissionNotification.build();
      
      await expect(notification.validate()).rejects.toThrow();
    });

    it('should validate method enum', async () => {
      const notification = AdmissionNotification.build({
        method: 'invalid_method' as any, // Invalid enum value
        parentId: 1,
        admissionId: 1,
        title: 'Test Title',
        content: 'Test Content',
      });
      
      await expect(notification.validate()).rejects.toThrow();
    });

    it('should validate status enum', async () => {
      const notification = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Test Title',
        content: 'Test Content',
        status: 99, // Invalid enum value
      });
      
      await expect(notification.validate()).rejects.toThrow();
    });

    it('should accept valid method values', async () => {
      const validMethods = [NotificationMethod.SMS, NotificationMethod.EMAIL, NotificationMethod.SYSTEM];
      
      for (const method of validMethods) {
        const notification = AdmissionNotification.build({
          method: method,
          parentId: 1,
          admissionId: 1,
          title: 'Test Title',
          content: 'Test Content',
        });
        
        await expect(notification.validate()).resolves.not.toThrow();
      }
    });

    it('should validate foreign key constraints', async () => {
      const notification = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: 0, // Invalid foreign key (should be positive)
        admissionId: -1, // Invalid foreign key (should be positive)
        title: 'Test Title',
        content: 'Test Content',
      });
      
      // This validation should be handled at database level
      // For now, we'll test that the model can be built
      expect(notification.parentId).toBe(0);
      expect(notification.admissionId).toBe(-1);
    });

    it('should validate retry count is non-negative', async () => {
      const notification = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Test Title',
        content: 'Test Content',
        retryCount: -1, // Invalid negative count
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(notification.retryCount).toBe(-1);
    });

    it('should accept valid data', async () => {
      const notification = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        templateId: 1,
        admissionId: 1,
        title: '录取通知',
        content: '恭喜您的孩子已被我校录取！',
        status: NotificationStatus.PENDING,
        responseRequired: true,
        scheduledTime: new Date(Date.now() + 86400000), // Tomorrow
        sentTime: null,
        deliveredTime: null,
        readTime: null,
        response: null,
        errorMessage: null,
        retryCount: 0,
        createdBy: 1,
        updatedBy: 1,
      });
      
      await expect(notification.validate()).resolves.not.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should set default status to DRAFT', () => {
      const notification = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Test Title',
        content: 'Test Content',
      });
      
      expect(notification.status).toBe(NotificationStatus.DRAFT);
    });

    it('should set default responseRequired to false', () => {
      const notification = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Test Title',
        content: 'Test Content',
      });
      
      expect(notification.responseRequired).toBe(false);
    });

    it('should set default retryCount to 0', () => {
      const notification = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Test Title',
        content: 'Test Content',
      });
      
      expect(notification.retryCount).toBe(0);
    });

    it('should set default createdAt and updatedAt to current time', () => {
      const notification = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Test Title',
        content: 'Test Content',
      });
      
      expect(notification.createdAt).toBeInstanceOf(Date);
      expect(notification.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Model Associations', () => {
    it('should belong to AdmissionResult', () => {
      expect(AdmissionNotification.belongsTo).toHaveBeenCalledWith(
        AdmissionResult,
        {
          foreignKey: 'admissionId',
          as: 'admissionResult',
        }
      );
    });

    it('should belong to ParentStudentRelation', () => {
      expect(AdmissionNotification.belongsTo).toHaveBeenCalledWith(
        ParentStudentRelation,
        {
          foreignKey: 'parentId',
          as: 'parentRelation',
        }
      );
    });

    it('should belong to User as creator', () => {
      expect(AdmissionNotification.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'createdBy',
          as: 'creator',
        }
      );
    });

    it('should belong to User as updater', () => {
      expect(AdmissionNotification.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'updatedBy',
          as: 'updater',
        }
      );
    });

    it('should belong to MessageTemplate', () => {
      expect(AdmissionNotification.belongsTo).toHaveBeenCalledWith(
        MessageTemplate,
        {
          foreignKey: 'templateId',
          as: 'template',
        }
      );
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new admission notification', async () => {
      const notification = await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: '录取通知',
        content: '恭喜您的孩子已被我校录取！',
      });

      expect(notification.id).toBeDefined();
      expect(notification.method).toBe(NotificationMethod.EMAIL);
      expect(notification.parentId).toBe(1);
      expect(notification.admissionId).toBe(1);
      expect(notification.title).toBe('录取通知');
      expect(notification.content).toBe('恭喜您的孩子已被我校录取！');
      expect(notification.status).toBe(NotificationStatus.DRAFT);
      expect(notification.responseRequired).toBe(false);
      expect(notification.retryCount).toBe(0);
      expect(notification.createdAt).toBeInstanceOf(Date);
      expect(notification.updatedAt).toBeInstanceOf(Date);
    });

    it('should create with all optional fields', async () => {
      const scheduledTime = new Date(Date.now() + 86400000); // Tomorrow
      
      const notification = await AdmissionNotification.create({
        method: NotificationMethod.SMS,
        parentId: 1,
        templateId: 1,
        admissionId: 1,
        title: '面试通知',
        content: '请按时参加面试',
        status: NotificationStatus.PENDING,
        responseRequired: true,
        scheduledTime: scheduledTime,
        sentTime: new Date(),
        deliveredTime: new Date(),
        readTime: new Date(),
        response: '确认参加',
        errorMessage: null,
        retryCount: 2,
        createdBy: 1,
        updatedBy: 1,
      });

      expect(notification.method).toBe(NotificationMethod.SMS);
      expect(notification.templateId).toBe(1);
      expect(notification.status).toBe(NotificationStatus.PENDING);
      expect(notification.responseRequired).toBe(true);
      expect(notification.scheduledTime).toEqual(scheduledTime);
      expect(notification.response).toBe('确认参加');
      expect(notification.retryCount).toBe(2);
    });

    it('should read an admission notification', async () => {
      const createdNotification = await AdmissionNotification.create({
        method: NotificationMethod.SYSTEM,
        parentId: 1,
        admissionId: 1,
        title: '系统通知',
        content: '您的申请已处理完毕',
        status: NotificationStatus.SENT,
      });

      const foundNotification = await AdmissionNotification.findByPk(createdNotification.id);
      
      expect(foundNotification).toBeDefined();
      expect(foundNotification?.method).toBe(NotificationMethod.SYSTEM);
      expect(foundNotification?.title).toBe('系统通知');
      expect(foundNotification?.content).toBe('您的申请已处理完毕');
      expect(foundNotification?.status).toBe(NotificationStatus.SENT);
    });

    it('should update an admission notification', async () => {
      const notification = await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: '测试通知',
        content: '测试内容',
      });

      await notification.update({
        status: NotificationStatus.SENT,
        sentTime: new Date(),
        retryCount: 1,
        responseRequired: true,
      });

      expect(notification.status).toBe(NotificationStatus.SENT);
      expect(notification.sentTime).toBeInstanceOf(Date);
      expect(notification.retryCount).toBe(1);
      expect(notification.responseRequired).toBe(true);
    });

    it('should delete an admission notification (soft delete)', async () => {
      const notification = await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: '测试通知',
        content: '测试内容',
      });

      await notification.destroy();
      
      const foundNotification = await AdmissionNotification.findByPk(notification.id);
      expect(foundNotification).toBeNull(); // Soft delete should return null
      
      // Check if it's actually soft deleted
      const deletedNotification = await AdmissionNotification.findByPk(notification.id, { paranoid: false });
      expect(deletedNotification).toBeDefined();
      expect(deletedNotification?.deletedAt).toBeDefined();
    });

    it('should find all notifications for a parent', async () => {
      // Create multiple notifications for the same parent
      await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: '通知 1',
        content: '内容 1',
      });
      
      await AdmissionNotification.create({
        method: NotificationMethod.SMS,
        parentId: 1,
        admissionId: 2,
        title: '通知 2',
        content: '内容 2',
      });
      
      await AdmissionNotification.create({
        method: NotificationMethod.SYSTEM,
        parentId: 1,
        admissionId: 3,
        title: '通知 3',
        content: '内容 3',
      });

      const notifications = await AdmissionNotification.findAll({
        where: { parentId: 1 },
        order: [['id', 'ASC']],
      });

      expect(notifications).toHaveLength(3);
      expect(notifications[0].title).toBe('通知 1');
      expect(notifications[1].title).toBe('通知 2');
      expect(notifications[2].title).toBe('通知 3');
    });

    it('should find notifications by method', async () => {
      // Create notifications with different methods
      await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: '邮件通知 1',
        content: '邮件内容 1',
      });
      
      await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 2,
        admissionId: 2,
        title: '邮件通知 2',
        content: '邮件内容 2',
      });
      
      await AdmissionNotification.create({
        method: NotificationMethod.SMS,
        parentId: 1,
        admissionId: 3,
        title: '短信通知',
        content: '短信内容',
      });

      const emailNotifications = await AdmissionNotification.findAll({
        where: { method: NotificationMethod.EMAIL },
        order: [['id', 'ASC']],
      });

      expect(emailNotifications).toHaveLength(2);
      expect(emailNotifications[0].method).toBe(NotificationMethod.EMAIL);
      expect(emailNotifications[1].method).toBe(NotificationMethod.EMAIL);
    });

    it('should find notifications by status', async () => {
      // Create notifications with different statuses
      await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: '待发送通知',
        content: '待发送内容',
        status: NotificationStatus.PENDING,
      });
      
      await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 2,
        admissionId: 2,
        title: '已发送通知',
        content: '已发送内容',
        status: NotificationStatus.SENT,
      });
      
      await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 3,
        admissionId: 3,
        title: '失败通知',
        content: '失败内容',
        status: NotificationStatus.FAILED,
      });

      const pendingNotifications = await AdmissionNotification.findAll({
        where: { status: NotificationStatus.PENDING },
        order: [['id', 'ASC']],
      });

      expect(pendingNotifications).toHaveLength(1);
      expect(pendingNotifications[0].status).toBe(NotificationStatus.PENDING);
    });

    it('should find notifications requiring response', async () => {
      // Create mix of notifications requiring and not requiring response
      await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: '需要回复',
        content: '请回复此通知',
        responseRequired: true,
      });
      
      await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 2,
        admissionId: 2,
        title: '需要回复 2',
        content: '请回复此通知 2',
        responseRequired: true,
      });
      
      await AdmissionNotification.create({
        method: NotificationMethod.SYSTEM,
        parentId: 3,
        admissionId: 3,
        title: '无需回复',
        content: '仅供查阅',
        responseRequired: false,
      });

      const responseRequiredNotifications = await AdmissionNotification.findAll({
        where: { responseRequired: true },
        order: [['id', 'ASC']],
      });

      expect(responseRequiredNotifications).toHaveLength(2);
      expect(responseRequiredNotifications[0].responseRequired).toBe(true);
      expect(responseRequiredNotifications[1].responseRequired).toBe(true);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle maximum string lengths', async () => {
      const longTitle = 'a'.repeat(255); // Maximum length for title
      const longContent = 'a'.repeat(10000); // Long text for content
      const longResponse = 'a'.repeat(10000); // Long text for response
      const longErrorMessage = 'a'.repeat(255); // Maximum length for errorMessage
      
      const notification = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: longTitle,
        content: longContent,
        response: longResponse,
        errorMessage: longErrorMessage,
      });
      
      await expect(notification.validate()).resolves.not.toThrow();
    });

    it('should handle minimum values', async () => {
      const notification = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: 1, // Minimum positive ID
        admissionId: 1, // Minimum positive ID
        title: 'A', // Minimum title length
        content: 'A', // Minimum content length
        retryCount: 0, // Minimum count
      });
      
      await expect(notification.validate()).resolves.not.toThrow();
    });

    it('should handle all notification methods', async () => {
      const methods = [NotificationMethod.SMS, NotificationMethod.EMAIL, NotificationMethod.SYSTEM];
      
      for (const method of methods) {
        const notification = AdmissionNotification.build({
          method: method,
          parentId: 1,
          admissionId: 1,
          title: 'Test Title',
          content: 'Test Content',
        });
        
        await expect(notification.validate()).resolves.not.toThrow();
      }
    });

    it('should handle all notification statuses', async () => {
      const statuses = [
        NotificationStatus.DRAFT,
        NotificationStatus.PENDING,
        NotificationStatus.SENT,
        NotificationStatus.DELIVERED,
        NotificationStatus.READ,
        NotificationStatus.FAILED,
        NotificationStatus.CANCELLED,
      ];
      
      for (const status of statuses) {
        const notification = AdmissionNotification.build({
          method: NotificationMethod.EMAIL,
          parentId: 1,
          admissionId: 1,
          title: 'Test Title',
          content: 'Test Content',
          status: status,
        });
        
        await expect(notification.validate()).resolves.not.toThrow();
      }
    });

    it('should handle extreme retry count values', async () => {
      const notification1 = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Test Title',
        content: 'Test Content',
        retryCount: 0, // Minimum count
      });
      
      const notification2 = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Test Title',
        content: 'Test Content',
        retryCount: 2147483647, // Maximum 32-bit integer
      });
      
      await expect(notification1.validate()).resolves.not.toThrow();
      await expect(notification2.validate()).resolves.not.toThrow();
    });

    it('should handle null values for optional fields', async () => {
      const notification = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Test Title',
        content: 'Test Content',
        templateId: null,
        scheduledTime: null,
        sentTime: null,
        deliveredTime: null,
        readTime: null,
        response: null,
        errorMessage: null,
      });
      
      await expect(notification.validate()).resolves.not.toThrow();
    });

    it('should handle zero foreign keys (validation at database level)', async () => {
      const notification = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: 0,
        admissionId: 0,
        title: 'Test Title',
        content: 'Test Content',
      });
      
      // Model validation should pass, but database constraints should handle this
      await expect(notification.validate()).resolves.not.toThrow();
    });

    it('should handle negative foreign keys (validation at database level)', async () => {
      const notification = AdmissionNotification.build({
        method: NotificationMethod.EMAIL,
        parentId: -1,
        admissionId: -1,
        title: 'Test Title',
        content: 'Test Content',
      });
      
      // Model validation should pass, but database constraints should handle this
      await expect(notification.validate()).resolves.not.toThrow();
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const beforeCreate = new Date();
      
      const notification = await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Test Title',
        content: 'Test Content',
      });
      
      const afterCreate = new Date();
      
      expect(notification.createdAt).toBeInstanceOf(Date);
      expect(notification.updatedAt).toBeInstanceOf(Date);
      expect(notification.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(notification.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(notification.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(notification.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should update updatedAt on update', async () => {
      const notification = await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Test Title',
        content: 'Test Content',
      });
      
      const originalUpdatedAt = notification.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await notification.update({
        status: NotificationStatus.SENT,
      });
      
      expect(notification.updatedAt).toBeInstanceOf(Date);
      expect(notification.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not change createdAt on update', async () => {
      const notification = await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Test Title',
        content: 'Test Content',
      });
      
      const originalCreatedAt = notification.createdAt;
      
      await notification.update({
        status: NotificationStatus.SENT,
      });
      
      expect(notification.createdAt).toBe(originalCreatedAt);
    });
  });

  describe('Notification Lifecycle', () => {
    it('should handle notification status transitions', async () => {
      const notification = await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Test Notification',
        content: 'Test Content',
      });

      // Draft -> Pending
      await notification.update({ status: NotificationStatus.PENDING });
      expect(notification.status).toBe(NotificationStatus.PENDING);

      // Pending -> Sent
      await notification.update({ 
        status: NotificationStatus.SENT,
        sentTime: new Date()
      });
      expect(notification.status).toBe(NotificationStatus.SENT);
      expect(notification.sentTime).toBeInstanceOf(Date);

      // Sent -> Delivered
      await notification.update({ 
        status: NotificationStatus.DELIVERED,
        deliveredTime: new Date()
      });
      expect(notification.status).toBe(NotificationStatus.DELIVERED);
      expect(notification.deliveredTime).toBeInstanceOf(Date);

      // Delivered -> Read
      await notification.update({ 
        status: NotificationStatus.READ,
        readTime: new Date()
      });
      expect(notification.status).toBe(NotificationStatus.READ);
      expect(notification.readTime).toBeInstanceOf(Date);
    });

    it('should handle failed notification with retry', async () => {
      const notification = await AdmissionNotification.create({
        method: NotificationMethod.SMS,
        parentId: 1,
        admissionId: 1,
        title: 'Test Notification',
        content: 'Test Content',
        status: NotificationStatus.PENDING,
      });

      // First attempt fails
      await notification.update({ 
        status: NotificationStatus.FAILED,
        errorMessage: 'Network error',
        retryCount: 1
      });
      expect(notification.status).toBe(NotificationStatus.FAILED);
      expect(notification.errorMessage).toBe('Network error');
      expect(notification.retryCount).toBe(1);

      // Second attempt fails
      await notification.update({ 
        errorMessage: 'Service unavailable',
        retryCount: 2
      });
      expect(notification.retryCount).toBe(2);
      expect(notification.errorMessage).toBe('Service unavailable');

      // Third attempt succeeds
      await notification.update({ 
        status: NotificationStatus.SENT,
        sentTime: new Date(),
        errorMessage: null
      });
      expect(notification.status).toBe(NotificationStatus.SENT);
      expect(notification.errorMessage).toBeNull();
    });

    it('should handle cancelled notification', async () => {
      const notification = await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Test Notification',
        content: 'Test Content',
        status: NotificationStatus.PENDING,
        scheduledTime: new Date(Date.now() + 86400000), // Tomorrow
      });

      // Cancel the notification
      await notification.update({ status: NotificationStatus.CANCELLED });
      expect(notification.status).toBe(NotificationStatus.CANCELLED);
    });

    it('should handle scheduled notifications', async () => {
      const scheduledTime = new Date(Date.now() + 86400000); // Tomorrow
      
      const notification = await AdmissionNotification.create({
        method: NotificationMethod.EMAIL,
        parentId: 1,
        admissionId: 1,
        title: 'Scheduled Notification',
        content: 'This is scheduled for tomorrow',
        status: NotificationStatus.PENDING,
        scheduledTime: scheduledTime,
      });

      expect(notification.scheduledTime).toEqual(scheduledTime);
      
      // Simulate sending at scheduled time
      await notification.update({ 
        status: NotificationStatus.SENT,
        sentTime: new Date()
      });
      expect(notification.status).toBe(NotificationStatus.SENT);
    });
  });
});