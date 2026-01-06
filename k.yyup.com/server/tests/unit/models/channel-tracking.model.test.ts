import { ChannelTracking, ChannelType, ChannelStatus, initChannelTracking, initChannelTrackingAssociations } from '../../../src/models/channel-tracking.model';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';
import { Kindergarten } from '../../../src/models/kindergarten.model';
import { sequelize } from '../../../src/config/database';

// Mock User and Kindergarten models
jest.mock('../../../src/models/user.model', () => ({
  User: {
    belongsTo: jest.fn(),
  },
}));

jest.mock('../../../src/models/kindergarten.model', () => ({
  Kindergarten: {
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

describe('ChannelTracking Model', () => {
  beforeAll(async () => {
    // Initialize the ChannelTracking model
    initChannelTracking(sequelize);
    initChannelTrackingAssociations();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(ChannelTracking.tableName).toBe('channel_trackings');
    });

    it('should have correct attributes', () => {
      const attributes = ChannelTracking.getAttributes();
      
      expect(attributes.id).toBeDefined();
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);
      
      expect(attributes.kindergartenId).toBeDefined();
      expect(attributes.kindergartenId.allowNull).toBe(false);
      
      expect(attributes.channelName).toBeDefined();
      expect(attributes.channelName.allowNull).toBe(false);
      
      expect(attributes.channelType).toBeDefined();
      expect(attributes.channelType.allowNull).toBe(false);
      
      expect(attributes.utmSource).toBeDefined();
      expect(attributes.utmSource.allowNull).toBe(true);
      
      expect(attributes.utmMedium).toBeDefined();
      expect(attributes.utmMedium.allowNull).toBe(true);
      
      expect(attributes.utmCampaign).toBeDefined();
      expect(attributes.utmCampaign.allowNull).toBe(true);
      
      expect(attributes.utmContent).toBeDefined();
      expect(attributes.utmContent.allowNull).toBe(true);
      
      expect(attributes.utmTerm).toBeDefined();
      expect(attributes.utmTerm.allowNull).toBe(true);
      
      expect(attributes.startDate).toBeDefined();
      expect(attributes.startDate.allowNull).toBe(false);
      
      expect(attributes.endDate).toBeDefined();
      expect(attributes.endDate.allowNull).toBe(true);
      
      expect(attributes.description).toBeDefined();
      expect(attributes.description.allowNull).toBe(true);
      
      expect(attributes.cost).toBeDefined();
      expect(attributes.cost.allowNull).toBe(true);
      
      expect(attributes.visitCount).toBeDefined();
      expect(attributes.visitCount.allowNull).toBe(false);
      expect(attributes.visitCount.defaultValue).toBe(0);
      
      expect(attributes.registrationCount).toBeDefined();
      expect(attributes.registrationCount.allowNull).toBe(false);
      expect(attributes.registrationCount.defaultValue).toBe(0);
      
      expect(attributes.leadCount).toBeDefined();
      expect(attributes.leadCount.allowNull).toBe(false);
      expect(attributes.leadCount.defaultValue).toBe(0);
      
      expect(attributes.conversionCount).toBeDefined();
      expect(attributes.conversionCount.allowNull).toBe(false);
      expect(attributes.conversionCount.defaultValue).toBe(0);
      
      expect(attributes.conversionRate).toBeDefined();
      expect(attributes.conversionRate.allowNull).toBe(true);
      
      expect(attributes.costPerLead).toBeDefined();
      expect(attributes.costPerLead.allowNull).toBe(true);
      
      expect(attributes.costPerConversion).toBeDefined();
      expect(attributes.costPerConversion.allowNull).toBe(true);
      
      expect(attributes.revenue).toBeDefined();
      expect(attributes.revenue.allowNull).toBe(true);
      
      expect(attributes.roi).toBeDefined();
      expect(attributes.roi.allowNull).toBe(true);
      
      expect(attributes.status).toBeDefined();
      expect(attributes.status.allowNull).toBe(false);
      expect(attributes.status.defaultValue).toBe(ChannelStatus.DISABLED);
      
      expect(attributes.remark).toBeDefined();
      expect(attributes.remark.allowNull).toBe(true);
      
      expect(attributes.creatorId).toBeDefined();
      expect(attributes.creatorId.allowNull).toBe(true);
      
      expect(attributes.updaterId).toBeDefined();
      expect(attributes.updaterId.allowNull).toBe(true);
    });
  });

  describe('Model Options', () => {
    it('should have correct table configuration', () => {
      expect(ChannelTracking.options.tableName).toBe('channel_trackings');
      expect(ChannelTracking.options.timestamps).toBe(true);
      expect(ChannelTracking.options.paranoid).toBe(true);
      expect(ChannelTracking.options.underscored).toBe(true);
    });
  });

  describe('Enum Values', () => {
    it('should have correct ChannelType enum values', () => {
      expect(ChannelType.SEARCH_ENGINE).toBe(1);
      expect(ChannelType.SOCIAL_MEDIA).toBe(2);
      expect(ChannelType.EMAIL).toBe(3);
      expect(ChannelType.SMS).toBe(4);
      expect(ChannelType.OFFLINE_EVENT).toBe(5);
      expect(ChannelType.REFERRAL).toBe(6);
      expect(ChannelType.PARTNER).toBe(7);
      expect(ChannelType.DIRECT_ACCESS).toBe(8);
      expect(ChannelType.OTHER).toBe(9);
    });

    it('should have correct ChannelStatus enum values', () => {
      expect(ChannelStatus.DISABLED).toBe(0);
      expect(ChannelStatus.ACTIVE).toBe(1);
      expect(ChannelStatus.PAUSED).toBe(2);
      expect(ChannelStatus.ENDED).toBe(3);
    });
  });

  describe('Model Associations', () => {
    it('should belong to kindergarten', () => {
      expect(Kindergarten.belongsTo).toHaveBeenCalledWith(ChannelTracking, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten',
      });
    });

    it('should belong to creator user', () => {
      expect(User.belongsTo).toHaveBeenCalledWith(ChannelTracking, {
        foreignKey: 'creatorId',
        as: 'creator',
      });
    });

    it('should belong to updater user', () => {
      expect(User.belongsTo).toHaveBeenCalledWith(ChannelTracking, {
        foreignKey: 'updaterId',
        as: 'updater',
      });
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', async () => {
      const channelTracking = ChannelTracking.build({
        kindergartenId: 1,
        channelName: 'Test Channel',
        channelType: ChannelType.SEARCH_ENGINE,
        startDate: new Date(),
      });

      const validationErrors = await channelTracking.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should fail validation without required fields', async () => {
      const channelTracking = ChannelTracking.build({});

      await expect(channelTracking.validate()).rejects.toThrow();
    });

    it('should validate channelType field', async () => {
      const channelTracking = ChannelTracking.build({
        kindergartenId: 1,
        channelName: 'Test Channel',
        channelType: ChannelType.SOCIAL_MEDIA,
        startDate: new Date(),
      });

      const validationErrors = await channelTracking.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate status field', async () => {
      const channelTracking = ChannelTracking.build({
        kindergartenId: 1,
        channelName: 'Test Channel',
        channelType: ChannelType.EMAIL,
        startDate: new Date(),
        status: ChannelStatus.ACTIVE,
      });

      const validationErrors = await channelTracking.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate decimal fields', async () => {
      const channelTracking = ChannelTracking.build({
        kindergartenId: 1,
        channelName: 'Test Channel',
        channelType: ChannelType.SEARCH_ENGINE,
        startDate: new Date(),
        cost: 1000.50,
        conversionRate: 5.25,
        costPerLead: 50.75,
        costPerConversion: 200.00,
        revenue: 5000.00,
        roi: 400.00,
      });

      const validationErrors = await channelTracking.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate counter fields', async () => {
      const channelTracking = ChannelTracking.build({
        kindergartenId: 1,
        channelName: 'Test Channel',
        channelType: ChannelType.REFERRAL,
        startDate: new Date(),
        visitCount: 1000,
        registrationCount: 100,
        leadCount: 50,
        conversionCount: 25,
      });

      const validationErrors = await channelTracking.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate UTM fields', async () => {
      const channelTracking = ChannelTracking.build({
        kindergartenId: 1,
        channelName: 'Test Channel',
        channelType: ChannelType.PARTNER,
        startDate: new Date(),
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'summer_campaign',
        utmContent: 'ad1',
        utmTerm: 'kindergarten',
      });

      const validationErrors = await channelTracking.validate();
      expect(validationErrors).toBeUndefined();
    });
  });

  describe('Field Constraints', () => {
    it('should have foreign key reference to kindergartens table', () => {
      const attributes = ChannelTracking.getAttributes();
      expect(attributes.kindergartenId.references).toEqual({
        model: 'kindergartens',
        key: 'id',
      });
    });

    it('should have correct field types', () => {
      const attributes = ChannelTracking.getAttributes();
      
      expect(attributes.id.type.constructor.name).toContain('INTEGER');
      expect(attributes.kindergartenId.type.constructor.name).toContain('INTEGER');
      expect(attributes.channelName.type.constructor.name).toContain('STRING');
      expect(attributes.channelType.type.constructor.name).toContain('TINYINT');
      expect(attributes.utmSource.type.constructor.name).toContain('STRING');
      expect(attributes.utmMedium.type.constructor.name).toContain('STRING');
      expect(attributes.utmCampaign.type.constructor.name).toContain('STRING');
      expect(attributes.utmContent.type.constructor.name).toContain('STRING');
      expect(attributes.utmTerm.type.constructor.name).toContain('STRING');
      expect(attributes.startDate.type.constructor.name).toContain('DATE');
      expect(attributes.endDate.type.constructor.name).toContain('DATE');
      expect(attributes.description.type.constructor.name).toContain('TEXT');
      expect(attributes.cost.type.constructor.name).toContain('DECIMAL');
      expect(attributes.visitCount.type.constructor.name).toContain('INTEGER');
      expect(attributes.registrationCount.type.constructor.name).toContain('INTEGER');
      expect(attributes.leadCount.type.constructor.name).toContain('INTEGER');
      expect(attributes.conversionCount.type.constructor.name).toContain('INTEGER');
      expect(attributes.conversionRate.type.constructor.name).toContain('DECIMAL');
      expect(attributes.costPerLead.type.constructor.name).toContain('DECIMAL');
      expect(attributes.costPerConversion.type.constructor.name).toContain('DECIMAL');
      expect(attributes.revenue.type.constructor.name).toContain('DECIMAL');
      expect(attributes.roi.type.constructor.name).toContain('DECIMAL');
      expect(attributes.status.type.constructor.name).toContain('TINYINT');
      expect(attributes.remark.type.constructor.name).toContain('TEXT');
      expect(attributes.creatorId.type.constructor.name).toContain('INTEGER');
      expect(attributes.updaterId.type.constructor.name).toContain('INTEGER');
    });
  });

  describe('Model Instance Methods', () => {
    it('should create instance with correct attributes', () => {
      const channelTrackingData = {
        kindergartenId: 1,
        channelName: 'Google Ads',
        channelType: ChannelType.SEARCH_ENGINE,
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'summer2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        description: 'Google Ads campaign for summer enrollment',
        cost: 5000.00,
        visitCount: 10000,
        registrationCount: 500,
        leadCount: 200,
        conversionCount: 100,
        conversionRate: 10.00,
        costPerLead: 25.00,
        costPerConversion: 50.00,
        revenue: 20000.00,
        roi: 300.00,
        status: ChannelStatus.ACTIVE,
        remark: 'Successful campaign',
        creatorId: 1,
        updaterId: 1,
      };

      const channelTracking = ChannelTracking.build(channelTrackingData);

      expect(channelTracking.kindergartenId).toBe(1);
      expect(channelTracking.channelName).toBe('Google Ads');
      expect(channelTracking.channelType).toBe(ChannelType.SEARCH_ENGINE);
      expect(channelTracking.utmSource).toBe('google');
      expect(channelTracking.utmMedium).toBe('cpc');
      expect(channelTracking.utmCampaign).toBe('summer2024');
      expect(channelTracking.startDate).toEqual(new Date('2024-01-01'));
      expect(channelTracking.endDate).toEqual(new Date('2024-12-31'));
      expect(channelTracking.description).toBe('Google Ads campaign for summer enrollment');
      expect(channelTracking.cost).toBe(5000.00);
      expect(channelTracking.visitCount).toBe(10000);
      expect(channelTracking.registrationCount).toBe(500);
      expect(channelTracking.leadCount).toBe(200);
      expect(channelTracking.conversionCount).toBe(100);
      expect(channelTracking.conversionRate).toBe(10.00);
      expect(channelTracking.costPerLead).toBe(25.00);
      expect(channelTracking.costPerConversion).toBe(50.00);
      expect(channelTracking.revenue).toBe(20000.00);
      expect(channelTracking.roi).toBe(300.00);
      expect(channelTracking.status).toBe(ChannelStatus.ACTIVE);
      expect(channelTracking.remark).toBe('Successful campaign');
      expect(channelTracking.creatorId).toBe(1);
      expect(channelTracking.updaterId).toBe(1);
    });

    it('should handle null values for optional fields', () => {
      const channelTracking = ChannelTracking.build({
        kindergartenId: 1,
        channelName: 'Test Channel',
        channelType: ChannelType.OTHER,
        startDate: new Date(),
      });

      expect(channelTracking.kindergartenId).toBe(1);
      expect(channelTracking.channelName).toBe('Test Channel');
      expect(channelTracking.channelType).toBe(ChannelType.OTHER);
      expect(channelTracking.startDate).toBeInstanceOf(Date);
      expect(channelTracking.utmSource).toBeNull();
      expect(channelTracking.utmMedium).toBeNull();
      expect(channelTracking.utmCampaign).toBeNull();
      expect(channelTracking.utmContent).toBeNull();
      expect(channelTracking.utmTerm).toBeNull();
      expect(channelTracking.endDate).toBeNull();
      expect(channelTracking.description).toBeNull();
      expect(channelTracking.cost).toBeNull();
      expect(channelTracking.visitCount).toBe(0); // default value
      expect(channelTracking.registrationCount).toBe(0); // default value
      expect(channelTracking.leadCount).toBe(0); // default value
      expect(channelTracking.conversionCount).toBe(0); // default value
      expect(channelTracking.conversionRate).toBeNull();
      expect(channelTracking.costPerLead).toBeNull();
      expect(channelTracking.costPerConversion).toBeNull();
      expect(channelTracking.revenue).toBeNull();
      expect(channelTracking.roi).toBeNull();
      expect(channelTracking.status).toBe(ChannelStatus.DISABLED); // default value
      expect(channelTracking.remark).toBeNull();
      expect(channelTracking.creatorId).toBeNull();
      expect(channelTracking.updaterId).toBeNull();
    });
  });

  describe('Default Values', () => {
    it('should have correct default values', () => {
      const channelTracking = ChannelTracking.build({
        kindergartenId: 1,
        channelName: 'Test Channel',
        channelType: ChannelType.EMAIL,
        startDate: new Date(),
      });

      expect(channelTracking.visitCount).toBe(0);
      expect(channelTracking.registrationCount).toBe(0);
      expect(channelTracking.leadCount).toBe(0);
      expect(channelTracking.conversionCount).toBe(0);
      expect(channelTracking.status).toBe(ChannelStatus.DISABLED);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt', () => {
      const channelTracking = ChannelTracking.build({
        kindergartenId: 1,
        channelName: 'Test Channel',
        channelType: ChannelType.SMS,
        startDate: new Date(),
      });

      expect(channelTracking.createdAt).toBeDefined();
      expect(channelTracking.updatedAt).toBeDefined();
      expect(channelTracking.createdAt).toBeInstanceOf(Date);
      expect(channelTracking.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete with deletedAt', () => {
      const channelTracking = ChannelTracking.build({
        kindergartenId: 1,
        channelName: 'Test Channel',
        channelType: ChannelType.OFFLINE_EVENT,
        startDate: new Date(),
      });

      expect(channelTracking.deletedAt).toBeDefined();
      expect(channelTracking.deletedAt).toBeNull();
    });
  });

  describe('Field Comments', () => {
    it('should have proper field comments', () => {
      const attributes = ChannelTracking.getAttributes();
      
      expect(attributes.id.comment).toBe('渠道跟踪ID');
      expect(attributes.kindergartenId.comment).toBe('幼儿园ID');
      expect(attributes.channelName.comment).toBe('渠道名称');
      expect(attributes.channelType.comment).toBe('渠道类型 - 1:搜索引擎 2:社交媒体 3:电子邮件 4:短信 5:线下活动 6:推荐 7:合作伙伴 8:直接访问 9:其他');
      expect(attributes.utmSource.comment).toBe('UTM来源');
      expect(attributes.utmMedium.comment).toBe('UTM媒介');
      expect(attributes.utmCampaign.comment).toBe('UTM活动');
      expect(attributes.utmContent.comment).toBe('UTM内容');
      expect(attributes.utmTerm.comment).toBe('UTM关键词');
      expect(attributes.startDate.comment).toBe('开始日期');
      expect(attributes.endDate.comment).toBe('结束日期');
      expect(attributes.description.comment).toBe('渠道描述');
      expect(attributes.cost.comment).toBe('渠道成本');
      expect(attributes.visitCount.comment).toBe('访问次数');
      expect(attributes.registrationCount.comment).toBe('报名次数');
      expect(attributes.leadCount.comment).toBe('线索数量');
      expect(attributes.conversionCount.comment).toBe('转化数量');
      expect(attributes.conversionRate.comment).toBe('转化率(%)');
      expect(attributes.costPerLead.comment).toBe('每个线索成本');
      expect(attributes.costPerConversion.comment).toBe('每次转化成本');
      expect(attributes.revenue.comment).toBe('产生收入');
      expect(attributes.roi.comment).toBe('投资回报率');
      expect(attributes.status.comment).toBe('状态 - 0:未启用 1:活跃中 2:已暂停 3:已结束');
      expect(attributes.remark.comment).toBe('备注');
      expect(attributes.creatorId.comment).toBe('创建人ID');
      expect(attributes.updaterId.comment).toBe('更新人ID');
    });
  });

  describe('Decimal Field Precision', () => {
    it('should have correct decimal precision for cost fields', () => {
      const attributes = ChannelTracking.getAttributes();
      
      expect(attributes.cost.type.precision).toBe(10);
      expect(attributes.cost.type.scale).toBe(2);
      expect(attributes.conversionRate.type.precision).toBe(5);
      expect(attributes.conversionRate.type.scale).toBe(2);
      expect(attributes.costPerLead.type.precision).toBe(10);
      expect(attributes.costPerLead.type.scale).toBe(2);
      expect(attributes.costPerConversion.type.precision).toBe(10);
      expect(attributes.costPerConversion.type.scale).toBe(2);
      expect(attributes.revenue.type.precision).toBe(10);
      expect(attributes.revenue.type.scale).toBe(2);
      expect(attributes.roi.type.precision).toBe(10);
      expect(attributes.roi.type.scale).toBe(2);
    });
  });
});