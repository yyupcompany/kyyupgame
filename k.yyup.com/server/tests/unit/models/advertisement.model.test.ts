import { Sequelize, Op } from 'sequelize';
import { vi } from 'vitest'
import { initAdvertisement, initAdvertisementAssociations, Advertisement, AdType, AdStatus } from '../../../src/models/advertisement.model';
import { User } from '../../../src/models/user.model';
import { Kindergarten } from '../../../src/models/kindergarten.model';
import { MarketingCampaign } from '../../../src/models/marketing-campaign.model';
import { ConversionTracking } from '../../../src/models/conversion-tracking.model';

// Mock 模型
jest.mock('../../../src/models/user.model', () => ({
  User: {
    belongsTo: jest.fn(),
  }
}));

jest.mock('../../../src/models/kindergarten.model', () => ({
  Kindergarten: {
    belongsTo: jest.fn(),
  }
}));

jest.mock('../../../src/models/marketing-campaign.model', () => ({
  MarketingCampaign: {
    belongsTo: jest.fn(),
  }
}));

jest.mock('../../../src/models/conversion-tracking.model', () => ({
  ConversionTracking: {
    hasMany: jest.fn(),
  }
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

describe('Advertisement Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });
    
    // 初始化模型
    initAdvertisement(sequelize);
    
    // 同步数据库
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Advertisement.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have the correct model name', () => {
      expect(Advertisement.tableName).toBe('advertisements');
    });

    it('should have all required attributes', () => {
      const attributes = Object.keys(Advertisement.getAttributes());
      const requiredAttributes = [
        'id', 'kindergartenId', 'campaignId', 'title', 'adType', 'platform',
        'position', 'targetAudience', 'content', 'imageUrl', 'videoUrl',
        'landingPage', 'startDate', 'endDate', 'budget', 'spent', 'impressions',
        'clicks', 'ctr', 'conversions', 'conversionRate', 'costPerClick',
        'costPerConversion', 'roi', 'status', 'remark', 'creatorId', 'updaterId',
        'createdAt', 'updatedAt', 'deletedAt'
      ];
      
      requiredAttributes.forEach(attr => {
        expect(attributes).toContain(attr);
      });
    });

    it('should have correct field configurations', () => {
      const model = Advertisement.getAttributes();
      
      // 检查主键
      expect(model.id.primaryKey).toBe(true);
      expect(model.id.autoIncrement).toBe(true);
      
      // 检查必需字段
      expect(model.kindergartenId.allowNull).toBe(false);
      expect(model.title.allowNull).toBe(false);
      expect(model.adType.allowNull).toBe(false);
      expect(model.platform.allowNull).toBe(false);
      expect(model.startDate.allowNull).toBe(false);
      expect(model.endDate.allowNull).toBe(false);
      expect(model.creatorId.allowNull).toBe(false);
      
      // 检查可选字段
      expect(model.campaignId.allowNull).toBe(true);
      expect(model.position.allowNull).toBe(true);
      expect(model.targetAudience.allowNull).toBe(true);
      expect(model.content.allowNull).toBe(true);
      expect(model.imageUrl.allowNull).toBe(true);
      expect(model.videoUrl.allowNull).toBe(true);
      expect(model.landingPage.allowNull).toBe(true);
      expect(model.budget.allowNull).toBe(true);
      expect(model.spent.allowNull).toBe(true);
      expect(model.updaterId.allowNull).toBe(true);
      
      // 检查默认值
      expect(model.impressions.defaultValue).toBe(0);
      expect(model.clicks.defaultValue).toBe(0);
      expect(model.conversions.defaultValue).toBe(0);
      expect(model.status.defaultValue).toBe(AdStatus.DRAFT);
    });
  });

  describe('Model Options', () => {
    it('should have correct table options', () => {
      const options = Advertisement.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });

    it('should have correct timestamps', () => {
      const attributes = Advertisement.getAttributes();
      
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.deletedAt).toBeDefined();
    });
  });

  describe('Enum Values', () => {
    it('should have correct AdType enum values', () => {
      expect(AdType.IMAGE).toBe(1);
      expect(AdType.VIDEO).toBe(2);
      expect(AdType.TEXT).toBe(3);
      expect(AdType.BANNER).toBe(4);
      expect(AdType.POPUP).toBe(5);
      expect(AdType.FEED).toBe(6);
      expect(AdType.SEARCH).toBe(7);
      expect(AdType.OTHER).toBe(8);
    });

    it('should have correct AdStatus enum values', () => {
      expect(AdStatus.DRAFT).toBe(0);
      expect(AdStatus.ACTIVE).toBe(1);
      expect(AdStatus.PAUSED).toBe(2);
      expect(AdStatus.ENDED).toBe(3);
      expect(AdStatus.CANCELLED).toBe(4);
    });
  });

  describe('Model Creation', () => {
    it('should create a new advertisement with valid data', async () => {
      const advertisementData = {
        kindergartenId: 1,
        campaignId: 1,
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        position: 'Feed',
        targetAudience: 'Parents with young children',
        content: 'Best kindergarten in town!',
        imageUrl: 'https://example.com/image.jpg',
        videoUrl: 'https://example.com/video.mp4',
        landingPage: 'https://example.com/landing',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        budget: 1000.00,
        spent: 500.00,
        impressions: 10000,
        clicks: 100,
        ctr: 1.0,
        conversions: 10,
        conversionRate: 10.0,
        costPerClick: 5.0,
        costPerConversion: 50.0,
        roi: 100.0,
        status: AdStatus.ACTIVE,
        remark: 'Test advertisement',
        creatorId: 1,
        updaterId: 1,
      };

      const advertisement = await Advertisement.create(advertisementData);

      expect(advertisement.id).toBeDefined();
      expect(advertisement.kindergartenId).toBe(advertisementData.kindergartenId);
      expect(advertisement.campaignId).toBe(advertisementData.campaignId);
      expect(advertisement.title).toBe(advertisementData.title);
      expect(advertisement.adType).toBe(advertisementData.adType);
      expect(advertisement.platform).toBe(advertisementData.platform);
      expect(advertisement.position).toBe(advertisementData.position);
      expect(advertisement.targetAudience).toBe(advertisementData.targetAudience);
      expect(advertisement.content).toBe(advertisementData.content);
      expect(advertisement.imageUrl).toBe(advertisementData.imageUrl);
      expect(advertisement.videoUrl).toBe(advertisementData.videoUrl);
      expect(advertisement.landingPage).toBe(advertisementData.landingPage);
      expect(advertisement.startDate).toEqual(advertisementData.startDate);
      expect(advertisement.endDate).toEqual(advertisementData.endDate);
      expect(advertisement.budget).toBe(advertisementData.budget);
      expect(advertisement.spent).toBe(advertisementData.spent);
      expect(advertisement.impressions).toBe(advertisementData.impressions);
      expect(advertisement.clicks).toBe(advertisementData.clicks);
      expect(advertisement.ctr).toBe(advertisementData.ctr);
      expect(advertisement.conversions).toBe(advertisementData.conversions);
      expect(advertisement.conversionRate).toBe(advertisementData.conversionRate);
      expect(advertisement.costPerClick).toBe(advertisementData.costPerClick);
      expect(advertisement.costPerConversion).toBe(advertisementData.costPerConversion);
      expect(advertisement.roi).toBe(advertisementData.roi);
      expect(advertisement.status).toBe(advertisementData.status);
      expect(advertisement.remark).toBe(advertisementData.remark);
      expect(advertisement.creatorId).toBe(advertisementData.creatorId);
      expect(advertisement.updaterId).toBe(advertisementData.updaterId);
      expect(advertisement.createdAt).toBeDefined();
      expect(advertisement.updatedAt).toBeDefined();
    });

    it('should create advertisement with default values', async () => {
      const advertisementData = {
        kindergartenId: 1,
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        creatorId: 1,
      };

      const advertisement = await Advertisement.create(advertisementData);

      expect(advertisement.campaignId).toBeNull();
      expect(advertisement.position).toBeNull();
      expect(advertisement.targetAudience).toBeNull();
      expect(advertisement.content).toBeNull();
      expect(advertisement.imageUrl).toBeNull();
      expect(advertisement.videoUrl).toBeNull();
      expect(advertisement.landingPage).toBeNull();
      expect(advertisement.budget).toBeNull();
      expect(advertisement.spent).toBeNull();
      expect(advertisement.impressions).toBe(0);
      expect(advertisement.clicks).toBe(0);
      expect(advertisement.conversions).toBe(0);
      expect(advertisement.status).toBe(AdStatus.DRAFT);
      expect(advertisement.remark).toBeNull();
      expect(advertisement.updaterId).toBeNull();
    });

    it('should fail to create advertisement without required fields', async () => {
      const invalidData = {
        // 缺少必需字段
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        // 缺少 kindergartenId, startDate, endDate, creatorId
      };

      await expect(Advertisement.create(invalidData as any)).rejects.toThrow();
    });
  });

  describe('Field Validation', () => {
    it('should validate adType field', async () => {
      const validData = {
        kindergartenId: 1,
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        creatorId: 1,
      };

      // 测试有效值
      await expect(Advertisement.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, adType: 99 };
      await expect(Advertisement.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate status field', async () => {
      const validData = {
        kindergartenId: 1,
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        creatorId: 1,
      };

      // 测试有效值
      await expect(Advertisement.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, status: 99 };
      await expect(Advertisement.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate date fields', async () => {
      const validData = {
        kindergartenId: 1,
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        creatorId: 1,
      };

      // 测试有效值
      await expect(Advertisement.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, startDate: 'invalid_date' };
      await expect(Advertisement.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate numeric fields', async () => {
      const validData = {
        kindergartenId: 1,
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        budget: 1000.00,
        creatorId: 1,
      };

      // 测试有效值
      await expect(Advertisement.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, budget: 'invalid_budget' };
      await expect(Advertisement.create(invalidData as any)).rejects.toThrow();
    });
  });

  describe('Model Methods', () => {
    it('should calculate metrics correctly', () => {
      const advertisement = Advertisement.build({
        kindergartenId: 1,
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        impressions: 10000,
        clicks: 100,
        conversions: 10,
        spent: 500.00,
        creatorId: 1,
      });

      // 调用计算方法
      advertisement.calculateMetrics();

      // 验证计算结果
      expect(advertisement.ctr).toBe(1.0); // (100 / 10000) * 100
      expect(advertisement.conversionRate).toBe(10.0); // (10 / 100) * 100
      expect(advertisement.costPerClick).toBe(5.0); // 500 / 100
      expect(advertisement.costPerConversion).toBe(50.0); // 500 / 10
    });

    it('should handle zero impressions in metrics calculation', () => {
      const advertisement = Advertisement.build({
        kindergartenId: 1,
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        impressions: 0,
        clicks: 100,
        conversions: 10,
        spent: 500.00,
        creatorId: 1,
      });

      advertisement.calculateMetrics();

      expect(advertisement.ctr).toBe(0);
    });

    it('should handle zero clicks in metrics calculation', () => {
      const advertisement = Advertisement.build({
        kindergartenId: 1,
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        impressions: 10000,
        clicks: 0,
        conversions: 10,
        spent: 500.00,
        creatorId: 1,
      });

      advertisement.calculateMetrics();

      expect(advertisement.conversionRate).toBe(0);
      expect(advertisement.costPerClick).toBeNull();
    });

    it('should handle zero conversions in metrics calculation', () => {
      const advertisement = Advertisement.build({
        kindergartenId: 1,
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        impressions: 10000,
        clicks: 100,
        conversions: 0,
        spent: 500.00,
        creatorId: 1,
      });

      advertisement.calculateMetrics();

      expect(advertisement.costPerConversion).toBeNull();
    });

    it('should handle null spent in metrics calculation', () => {
      const advertisement = Advertisement.build({
        kindergartenId: 1,
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        impressions: 10000,
        clicks: 100,
        conversions: 10,
        creatorId: 1,
      });

      advertisement.calculateMetrics();

      expect(advertisement.costPerClick).toBeNull();
      expect(advertisement.costPerConversion).toBeNull();
    });
  });

  describe('Model Associations', () => {
    beforeEach(() => {
      // 清理 mock 调用记录
      jest.clearAllMocks();
    });

    it('should define associations correctly', () => {
      initAdvertisementAssociations();

      // 验证关联关系是否正确定义
      expect(Advertisement.belongsTo).toHaveBeenCalledWith(Kindergarten, { 
        foreignKey: 'kindergartenId', 
        as: 'kindergarten' 
      });
      expect(Advertisement.belongsTo).toHaveBeenCalledWith(MarketingCampaign, { 
        foreignKey: 'campaignId', 
        as: 'campaign' 
      });
      expect(Advertisement.belongsTo).toHaveBeenCalledWith(User, { 
        foreignKey: 'creatorId', 
        as: 'creator' 
      });
      expect(Advertisement.belongsTo).toHaveBeenCalledWith(User, { 
        foreignKey: 'updaterId', 
        as: 'updater' 
      });
      expect(Advertisement.hasMany).toHaveBeenCalledWith(ConversionTracking, { 
        foreignKey: 'advertisementId', 
        as: 'conversionTrackings' 
      });
    });

    it('should have correct association configurations', () => {
      // 验证关联关系的配置
      const associations = Advertisement.associations;
      
      expect(associations.kindergarten).toBeDefined();
      expect(associations.campaign).toBeDefined();
      expect(associations.creator).toBeDefined();
      expect(associations.updater).toBeDefined();
      expect(associations.conversionTrackings).toBeDefined();
    });
  });

  describe('Model Operations', () => {
    it('should find advertisement by id', async () => {
      const advertisementData = {
        kindergartenId: 1,
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        creatorId: 1,
      };

      const created = await Advertisement.create(advertisementData);
      const found = await Advertisement.findByPk(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe(advertisementData.title);
    });

    it('should update advertisement', async () => {
      const advertisementData = {
        kindergartenId: 1,
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: AdStatus.DRAFT,
        creatorId: 1,
      };

      const advertisement = await Advertisement.create(advertisementData);
      
      await advertisement.update({
        status: AdStatus.ACTIVE,
        spent: 500.00,
        impressions: 10000,
        clicks: 100,
        updaterId: 2
      });

      const updated = await Advertisement.findByPk(advertisement.id);
      
      expect(updated?.status).toBe(AdStatus.ACTIVE);
      expect(updated?.spent).toBe(500.00);
      expect(updated?.impressions).toBe(10000);
      expect(updated?.clicks).toBe(100);
      expect(updated?.updaterId).toBe(2);
    });

    it('should delete advertisement (soft delete)', async () => {
      const advertisementData = {
        kindergartenId: 1,
        title: 'Test Advertisement',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        creatorId: 1,
      };

      const advertisement = await Advertisement.create(advertisementData);
      
      await advertisement.destroy();

      const deleted = await Advertisement.findByPk(advertisement.id);
      expect(deleted).toBeNull();

      // 检查软删除记录
      const paranoidDeleted = await Advertisement.findByPk(advertisement.id, { paranoid: false });
      expect(paranoidDeleted).toBeDefined();
      expect(paranoidDeleted?.deletedAt).toBeDefined();
    });

    it('should list all advertisements', async () => {
      const advertisementData1 = {
        kindergartenId: 1,
        title: 'Advertisement 1',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        creatorId: 1,
      };

      const advertisementData2 = {
        kindergartenId: 1,
        title: 'Advertisement 2',
        adType: AdType.VIDEO,
        platform: 'Google',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        creatorId: 1,
      };

      await Advertisement.create(advertisementData1);
      await Advertisement.create(advertisementData2);

      const advertisements = await Advertisement.findAll();
      
      expect(advertisements).toHaveLength(2);
      expect(advertisements[0].adType).toBe(AdType.IMAGE);
      expect(advertisements[1].adType).toBe(AdType.VIDEO);
    });
  });

  describe('Query Operations', () => {
    it('should filter advertisements by status', async () => {
      const advertisementData1 = {
        kindergartenId: 1,
        title: 'Advertisement 1',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: AdStatus.DRAFT,
        creatorId: 1,
      };

      const advertisementData2 = {
        kindergartenId: 1,
        title: 'Advertisement 2',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: AdStatus.ACTIVE,
        creatorId: 1,
      };

      await Advertisement.create(advertisementData1);
      await Advertisement.create(advertisementData2);

      const draftAds = await Advertisement.findAll({
        where: { status: AdStatus.DRAFT }
      });
      
      expect(draftAds).toHaveLength(1);
      expect(draftAds[0].status).toBe(AdStatus.DRAFT);

      const activeAds = await Advertisement.findAll({
        where: { status: AdStatus.ACTIVE }
      });
      
      expect(activeAds).toHaveLength(1);
      expect(activeAds[0].status).toBe(AdStatus.ACTIVE);
    });

    it('should filter advertisements by platform', async () => {
      const advertisementData1 = {
        kindergartenId: 1,
        title: 'Advertisement 1',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        creatorId: 1,
      };

      const advertisementData2 = {
        kindergartenId: 1,
        title: 'Advertisement 2',
        adType: AdType.IMAGE,
        platform: 'Google',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        creatorId: 1,
      };

      await Advertisement.create(advertisementData1);
      await Advertisement.create(advertisementData2);

      const facebookAds = await Advertisement.findAll({
        where: { platform: 'Facebook' }
      });
      
      expect(facebookAds).toHaveLength(1);
      expect(facebookAds[0].platform).toBe('Facebook');

      const googleAds = await Advertisement.findAll({
        where: { platform: 'Google' }
      });
      
      expect(googleAds).toHaveLength(1);
      expect(googleAds[0].platform).toBe('Google');
    });

    it('should filter advertisements by date range', async () => {
      const advertisementData1 = {
        kindergartenId: 1,
        title: 'Advertisement 1',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-06-30'),
        creatorId: 1,
      };

      const advertisementData2 = {
        kindergartenId: 1,
        title: 'Advertisement 2',
        adType: AdType.IMAGE,
        platform: 'Facebook',
        startDate: new Date('2023-07-01'),
        endDate: new Date('2023-12-31'),
        creatorId: 1,
      };

      await Advertisement.create(advertisementData1);
      await Advertisement.create(advertisementData2);

      const activeInQ1 = await Advertisement.findAll({
        where: {
          startDate: { [Op.lte]: new Date('2023-03-31') },
          endDate: { [Op.gte]: new Date('2023-03-31') }
        }
      });
      
      expect(activeInQ1).toHaveLength(1);
      expect(activeInQ1[0].title).toBe('Advertisement 1');

      const activeInQ3 = await Advertisement.findAll({
        where: {
          startDate: { [Op.lte]: new Date('2023-09-30') },
          endDate: { [Op.gte]: new Date('2023-09-30') }
        }
      });
      
      expect(activeInQ3).toHaveLength(1);
      expect(activeInQ3[0].title).toBe('Advertisement 2');
    });
  });
});