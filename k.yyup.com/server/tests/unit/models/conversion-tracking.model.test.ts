import { ConversionTracking, ConversionType, ConversionStatus, FollowUpStatus, initConversionTracking, initConversionTrackingAssociations } from '../../../src/models/conversion-tracking.model';
import { vi } from 'vitest'
import { Kindergarten } from '../../../src/models/kindergarten.model';
import { ParentStudentRelation } from '../../../src/models/parent-student-relation.model';
import { MarketingCampaign } from '../../../src/models/marketing-campaign.model';
import { ChannelTracking } from '../../../src/models/channel-tracking.model';
import { Advertisement } from '../../../src/models/advertisement.model';
import { sequelize } from '../../../src/config/database';

// Mock related models
jest.mock('../../../src/models/kindergarten.model', () => ({
  Kindergarten: {
    belongsTo: jest.fn(),
  },
}));

jest.mock('../../../src/models/parent-student-relation.model', () => ({
  ParentStudentRelation: {
    belongsTo: jest.fn(),
  },
}));

jest.mock('../../../src/models/marketing-campaign.model', () => ({
  MarketingCampaign: {
    belongsTo: jest.fn(),
  },
}));

jest.mock('../../../src/models/channel-tracking.model', () => ({
  ChannelTracking: {
    belongsTo: jest.fn(),
  },
}));

jest.mock('../../../src/models/advertisement.model', () => ({
  Advertisement: {
    belongsTo: jest.fn(),
  },
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

describe('ConversionTracking Model', () => {
  beforeAll(async () => {
    // Initialize the ConversionTracking model
    initConversionTracking(sequelize);
    initConversionTrackingAssociations();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(ConversionTracking.tableName).toBe('conversion_trackings');
    });

    it('should have correct attributes', () => {
      const attributes = ConversionTracking.getAttributes();
      
      expect(attributes.id).toBeDefined();
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);
      
      expect(attributes.kindergartenId).toBeDefined();
      expect(attributes.kindergartenId.allowNull).toBe(false);
      
      expect(attributes.parentId).toBeDefined();
      expect(attributes.parentId.allowNull).toBe(true);
      
      expect(attributes.campaignId).toBeDefined();
      expect(attributes.campaignId.allowNull).toBe(true);
      
      expect(attributes.channelId).toBeDefined();
      expect(attributes.channelId.allowNull).toBe(true);
      
      expect(attributes.advertisementId).toBeDefined();
      expect(attributes.advertisementId.allowNull).toBe(true);
      
      expect(attributes.conversionType).toBeDefined();
      expect(attributes.conversionType.allowNull).toBe(false);
      
      expect(attributes.conversionSource).toBeDefined();
      expect(attributes.conversionSource.allowNull).toBe(false);
      
      expect(attributes.conversionEvent).toBeDefined();
      expect(attributes.conversionEvent.allowNull).toBe(false);
      
      expect(attributes.eventValue).toBeDefined();
      expect(attributes.eventValue.allowNull).toBe(true);
      
      expect(attributes.eventTime).toBeDefined();
      expect(attributes.eventTime.allowNull).toBe(false);
      
      expect(attributes.conversionStatus).toBeDefined();
      expect(attributes.conversionStatus.allowNull).toBe(false);
      expect(attributes.conversionStatus.defaultValue).toBe(ConversionStatus.UNPROCESSED);
      
      expect(attributes.followUpStatus).toBeDefined();
      expect(attributes.followUpStatus.allowNull).toBe(false);
      expect(attributes.followUpStatus.defaultValue).toBe(FollowUpStatus.NOT_FOLLOWED_UP);
      
      expect(attributes.isFirstVisit).toBeDefined();
      expect(attributes.isFirstVisit.allowNull).toBe(false);
      expect(attributes.isFirstVisit.defaultValue).toBe(false);
    });
  });

  describe('Model Options', () => {
    it('should have correct table configuration', () => {
      expect(ConversionTracking.options.tableName).toBe('conversion_trackings');
      expect(ConversionTracking.options.timestamps).toBe(true);
      expect(ConversionTracking.options.paranoid).toBe(true);
      expect(ConversionTracking.options.underscored).toBe(true);
    });
  });

  describe('Enum Values', () => {
    it('should have correct ConversionType enum values', () => {
      expect(ConversionType.REGISTER).toBe(1);
      expect(ConversionType.CONSULT).toBe(2);
      expect(ConversionType.APPLY).toBe(3);
      expect(ConversionType.PAY).toBe(4);
      expect(ConversionType.PARTICIPATE).toBe(5);
      expect(ConversionType.SHARE).toBe(6);
      expect(ConversionType.DOWNLOAD).toBe(7);
      expect(ConversionType.BOOK_TOUR).toBe(8);
      expect(ConversionType.OTHER).toBe(9);
    });

    it('should have correct ConversionStatus enum values', () => {
      expect(ConversionStatus.UNPROCESSED).toBe(0);
      expect(ConversionStatus.VALID).toBe(1);
      expect(ConversionStatus.INVALID).toBe(2);
      expect(ConversionStatus.PENDING).toBe(3);
      expect(ConversionStatus.ABANDONED).toBe(4);
    });

    it('should have correct FollowUpStatus enum values', () => {
      expect(FollowUpStatus.NOT_FOLLOWED_UP).toBe(0);
      expect(FollowUpStatus.CONTACTED).toBe(1);
      expect(FollowUpStatus.FOLLOWED_UP).toBe(2);
      expect(FollowUpStatus.NEEDS_FOLLOW_UP).toBe(3);
      expect(FollowUpStatus.CONFIRMED_INTENTION).toBe(4);
      expect(FollowUpStatus.NO_INTENTION).toBe(5);
      expect(FollowUpStatus.CONVERTED).toBe(6);
      expect(FollowUpStatus.GAVE_UP).toBe(7);
    });
  });

  describe('Model Associations', () => {
    it('should belong to kindergarten', () => {
      expect(Kindergarten.belongsTo).toHaveBeenCalledWith(ConversionTracking, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten',
      });
    });

    it('should belong to parent', () => {
      expect(ParentStudentRelation.belongsTo).toHaveBeenCalledWith(ConversionTracking, {
        foreignKey: 'parentId',
        as: 'parent',
      });
    });

    it('should belong to campaign', () => {
      expect(MarketingCampaign.belongsTo).toHaveBeenCalledWith(ConversionTracking, {
        foreignKey: 'campaignId',
        as: 'campaign',
      });
    });

    it('should belong to channel', () => {
      expect(ChannelTracking.belongsTo).toHaveBeenCalledWith(ConversionTracking, {
        foreignKey: 'channelId',
        as: 'channel',
      });
    });

    it('should belong to advertisement', () => {
      expect(Advertisement.belongsTo).toHaveBeenCalledWith(ConversionTracking, {
        foreignKey: 'advertisementId',
        as: 'advertisement',
      });
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', async () => {
      const conversionTracking = ConversionTracking.build({
        kindergartenId: 1,
        conversionType: ConversionType.REGISTER,
        conversionSource: 'website',
        conversionEvent: 'signup',
        eventTime: new Date(),
      });

      const validationErrors = await conversionTracking.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should fail validation without required fields', async () => {
      const conversionTracking = ConversionTracking.build({});

      await expect(conversionTracking.validate()).rejects.toThrow();
    });

    it('should validate conversionType field', async () => {
      const conversionTracking = ConversionTracking.build({
        kindergartenId: 1,
        conversionType: ConversionType.APPLY,
        conversionSource: 'website',
        conversionEvent: 'application',
        eventTime: new Date(),
      });

      const validationErrors = await conversionTracking.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate conversionStatus field', async () => {
      const conversionTracking = ConversionTracking.build({
        kindergartenId: 1,
        conversionType: ConversionType.CONSULT,
        conversionSource: 'phone',
        conversionEvent: 'inquiry',
        eventTime: new Date(),
        conversionStatus: ConversionStatus.VALID,
      });

      const validationErrors = await conversionTracking.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate followUpStatus field', async () => {
      const conversionTracking = ConversionTracking.build({
        kindergartenId: 1,
        conversionType: ConversionType.PAY,
        conversionSource: 'online',
        conversionEvent: 'payment',
        eventTime: new Date(),
        followUpStatus: FollowUpStatus.CONTACTED,
      });

      const validationErrors = await conversionTracking.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate decimal fields', async () => {
      const conversionTracking = ConversionTracking.build({
        kindergartenId: 1,
        conversionType: ConversionType.REGISTER,
        conversionSource: 'website',
        conversionEvent: 'signup',
        eventTime: new Date(),
        eventValue: 100.50,
      });

      const validationErrors = await conversionTracking.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate foreign key fields', async () => {
      const conversionTracking = ConversionTracking.build({
        kindergartenId: 1,
        parentId: 1,
        campaignId: 1,
        channelId: 1,
        advertisementId: 1,
        conversionType: ConversionType.PARTICIPATE,
        conversionSource: 'event',
        conversionEvent: 'participation',
        eventTime: new Date(),
      });

      const validationErrors = await conversionTracking.validate();
      expect(validationErrors).toBeUndefined();
    });
  });

  describe('Field Constraints', () => {
    it('should have foreign key references', () => {
      const attributes = ConversionTracking.getAttributes();
      
      expect(attributes.kindergartenId.references).toEqual({
        model: 'kindergartens',
        key: 'id',
      });
      
      expect(attributes.parentId.references).toEqual({
        model: 'parent_student_relations',
        key: 'id',
      });
      
      expect(attributes.campaignId.references).toEqual({
        model: 'marketing_campaigns',
        key: 'id',
      });
      
      expect(attributes.channelId.references).toEqual({
        model: 'channel_trackings',
        key: 'id',
      });
      
      expect(attributes.advertisementId.references).toEqual({
        model: 'advertisements',
        key: 'id',
      });
    });

    it('should have correct field types', () => {
      const attributes = ConversionTracking.getAttributes();
      
      expect(attributes.id.type.constructor.name).toContain('INTEGER');
      expect(attributes.kindergartenId.type.constructor.name).toContain('INTEGER');
      expect(attributes.parentId.type.constructor.name).toContain('INTEGER');
      expect(attributes.campaignId.type.constructor.name).toContain('INTEGER');
      expect(attributes.channelId.type.constructor.name).toContain('INTEGER');
      expect(attributes.advertisementId.type.constructor.name).toContain('INTEGER');
      expect(attributes.conversionType.type.constructor.name).toContain('TINYINT');
      expect(attributes.conversionSource.type.constructor.name).toContain('STRING');
      expect(attributes.conversionEvent.type.constructor.name).toContain('STRING');
      expect(attributes.eventValue.type.constructor.name).toContain('DECIMAL');
      expect(attributes.eventTime.type.constructor.name).toContain('DATE');
      expect(attributes.conversionStatus.type.constructor.name).toContain('TINYINT');
      expect(attributes.followUpStatus.type.constructor.name).toContain('TINYINT');
      expect(attributes.isFirstVisit.type.constructor.name).toContain('BOOLEAN');
    });
  });

  describe('Model Instance Methods', () => {
    it('should create instance with correct attributes', () => {
      const conversionTrackingData = {
        kindergartenId: 1,
        parentId: 1,
        campaignId: 1,
        channelId: 1,
        advertisementId: 1,
        conversionType: ConversionType.REGISTER,
        conversionSource: 'google_ads',
        conversionEvent: 'form_submission',
        eventValue: 500.00,
        eventTime: new Date('2024-01-01T10:00:00'),
        conversionStatus: ConversionStatus.VALID,
        followUpStatus: FollowUpStatus.CONTACTED,
        isFirstVisit: true,
      };

      const conversionTracking = ConversionTracking.build(conversionTrackingData);

      expect(conversionTracking.kindergartenId).toBe(1);
      expect(conversionTracking.parentId).toBe(1);
      expect(conversionTracking.campaignId).toBe(1);
      expect(conversionTracking.channelId).toBe(1);
      expect(conversionTracking.advertisementId).toBe(1);
      expect(conversionTracking.conversionType).toBe(ConversionType.REGISTER);
      expect(conversionTracking.conversionSource).toBe('google_ads');
      expect(conversionTracking.conversionEvent).toBe('form_submission');
      expect(conversionTracking.eventValue).toBe(500.00);
      expect(conversionTracking.eventTime).toEqual(new Date('2024-01-01T10:00:00'));
      expect(conversionTracking.conversionStatus).toBe(ConversionStatus.VALID);
      expect(conversionTracking.followUpStatus).toBe(FollowUpStatus.CONTACTED);
      expect(conversionTracking.isFirstVisit).toBe(true);
    });

    it('should handle null values for optional fields', () => {
      const conversionTracking = ConversionTracking.build({
        kindergartenId: 1,
        conversionType: ConversionType.CONSULT,
        conversionSource: 'phone',
        conversionEvent: 'call',
        eventTime: new Date(),
      });

      expect(conversionTracking.kindergartenId).toBe(1);
      expect(conversionTracking.conversionType).toBe(ConversionType.CONSULT);
      expect(conversionTracking.conversionSource).toBe('phone');
      expect(conversionTracking.conversionEvent).toBe('call');
      expect(conversionTracking.eventTime).toBeInstanceOf(Date);
      expect(conversionTracking.parentId).toBeNull();
      expect(conversionTracking.campaignId).toBeNull();
      expect(conversionTracking.channelId).toBeNull();
      expect(conversionTracking.advertisementId).toBeNull();
      expect(conversionTracking.eventValue).toBeNull();
      expect(conversionTracking.conversionStatus).toBe(ConversionStatus.UNPROCESSED); // default
      expect(conversionTracking.followUpStatus).toBe(FollowUpStatus.NOT_FOLLOWED_UP); // default
      expect(conversionTracking.isFirstVisit).toBe(false); // default
    });
  });

  describe('Default Values', () => {
    it('should have correct default values', () => {
      const conversionTracking = ConversionTracking.build({
        kindergartenId: 1,
        conversionType: ConversionType.APPLY,
        conversionSource: 'website',
        conversionEvent: 'application',
        eventTime: new Date(),
      });

      expect(conversionTracking.conversionStatus).toBe(ConversionStatus.UNPROCESSED);
      expect(conversionTracking.followUpStatus).toBe(FollowUpStatus.NOT_FOLLOWED_UP);
      expect(conversionTracking.isFirstVisit).toBe(false);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt', () => {
      const conversionTracking = ConversionTracking.build({
        kindergartenId: 1,
        conversionType: ConversionType.PAY,
        conversionSource: 'online',
        conversionEvent: 'payment',
        eventTime: new Date(),
      });

      expect(conversionTracking.createdAt).toBeDefined();
      expect(conversionTracking.updatedAt).toBeDefined();
      expect(conversionTracking.createdAt).toBeInstanceOf(Date);
      expect(conversionTracking.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete with deletedAt', () => {
      const conversionTracking = ConversionTracking.build({
        kindergartenId: 1,
        conversionType: ConversionType.PARTICIPATE,
        conversionSource: 'event',
        conversionEvent: 'participation',
        eventTime: new Date(),
      });

      expect(conversionTracking.options.paranoid).toBe(true);
    });
  });

  describe('Field Comments', () => {
    it('should have proper field comments', () => {
      const attributes = ConversionTracking.getAttributes();
      
      expect(attributes.id.comment).toBe('转化跟踪ID');
      expect(attributes.kindergartenId.comment).toBe('幼儿园ID');
      expect(attributes.parentId.comment).toBe('家长ID');
      expect(attributes.campaignId.comment).toBe('营销活动ID');
      expect(attributes.channelId.comment).toBe('渠道ID');
      expect(attributes.advertisementId.comment).toBe('广告ID');
      expect(attributes.conversionType.comment).toBe('转化类型: 1=注册,2=咨询,3=报名,4=缴费,5=活动参与,6=分享,7=下载资料,8=预约参观,9=其他');
      expect(attributes.conversionSource.comment).toBe('转化来源');
      expect(attributes.conversionEvent.comment).toBe('转化事件');
      expect(attributes.eventValue.comment).toBe('事件价值');
      expect(attributes.eventTime.comment).toBe('事件时间');
      expect(attributes.conversionStatus.comment).toBe('转化状态: 0=未处理,1=有效转化,2=无效转化,3=待确认,4=已放弃');
      expect(attributes.followUpStatus.comment).toBe('跟进状态: 0=未跟进,1=已联系,2=已回访,3=需再次联系,4=已确认意向,5=无意向,6=已转化,7=已放弃');
      expect(attributes.isFirstVisit.comment).toBe('是否首次访问');
    });
  });

  describe('Enum Validation', () => {
    it('should accept all valid ConversionType values', () => {
      const validTypes = [
        ConversionType.REGISTER,
        ConversionType.CONSULT,
        ConversionType.APPLY,
        ConversionType.PAY,
        ConversionType.PARTICIPATE,
        ConversionType.SHARE,
        ConversionType.DOWNLOAD,
        ConversionType.BOOK_TOUR,
        ConversionType.OTHER,
      ];

      validTypes.forEach(type => {
        const conversionTracking = ConversionTracking.build({
          kindergartenId: 1,
          conversionType: type,
          conversionSource: 'test',
          conversionEvent: 'test',
          eventTime: new Date(),
        });

        expect(conversionTracking.conversionType).toBe(type);
      });
    });

    it('should accept all valid ConversionStatus values', () => {
      const validStatuses = [
        ConversionStatus.UNPROCESSED,
        ConversionStatus.VALID,
        ConversionStatus.INVALID,
        ConversionStatus.PENDING,
        ConversionStatus.ABANDONED,
      ];

      validStatuses.forEach(status => {
        const conversionTracking = ConversionTracking.build({
          kindergartenId: 1,
          conversionType: ConversionType.REGISTER,
          conversionSource: 'test',
          conversionEvent: 'test',
          eventTime: new Date(),
          conversionStatus: status,
        });

        expect(conversionTracking.conversionStatus).toBe(status);
      });
    });

    it('should accept all valid FollowUpStatus values', () => {
      const validStatuses = [
        FollowUpStatus.NOT_FOLLOWED_UP,
        FollowUpStatus.CONTACTED,
        FollowUpStatus.FOLLOWED_UP,
        FollowUpStatus.NEEDS_FOLLOW_UP,
        FollowUpStatus.CONFIRMED_INTENTION,
        FollowUpStatus.NO_INTENTION,
        FollowUpStatus.CONVERTED,
        FollowUpStatus.GAVE_UP,
      ];

      validStatuses.forEach(status => {
        const conversionTracking = ConversionTracking.build({
          kindergartenId: 1,
          conversionType: ConversionType.REGISTER,
          conversionSource: 'test',
          conversionEvent: 'test',
          eventTime: new Date(),
          followUpStatus: status,
        });

        expect(conversionTracking.followUpStatus).toBe(status);
      });
    });
  });

  describe('Date Field Validation', () => {
    it('should handle eventTime correctly', () => {
      const eventTime = new Date('2024-01-01T10:00:00');
      
      const conversionTracking = ConversionTracking.build({
        kindergartenId: 1,
        conversionType: ConversionType.REGISTER,
        conversionSource: 'test',
        conversionEvent: 'test',
        eventTime,
      });

      expect(conversionTracking.eventTime).toEqual(eventTime);
      expect(conversionTracking.eventTime).toBeInstanceOf(Date);
    });
  });

  describe('Decimal Field Precision', () => {
    it('should have correct decimal precision for eventValue', () => {
      const attributes = ConversionTracking.getAttributes();
      
      expect(attributes.eventValue.type.precision).toBe(10);
      expect(attributes.eventValue.type.scale).toBe(2);
    });

    it('should handle decimal values correctly', () => {
      const decimalValues = [0, 0.01, 100.50, 999999.99];
      
      decimalValues.forEach(value => {
        const conversionTracking = ConversionTracking.build({
          kindergartenId: 1,
          conversionType: ConversionType.REGISTER,
          conversionSource: 'test',
          conversionEvent: 'test',
          eventTime: new Date(),
          eventValue: value,
        });

        expect(conversionTracking.eventValue).toBe(value);
      });
    });
  });
});