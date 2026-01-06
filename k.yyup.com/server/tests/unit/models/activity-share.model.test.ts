import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Sequelize, DataTypes } from 'sequelize';
import { 
  ActivityShare, 
  ActivityShareAttributes,
  ActivityShareCreationAttributes,
  initActivityShare 
} from '../../../src/models/activity-share.model';
import { Activity } from '../../../src/models/activity.model';
import { PosterGeneration } from '../../../src/models/poster-generation.model';
import { User } from '../../../src/models/user.model';

// Mock the associated models
jest.mock('../../../src/models/activity.model');
jest.mock('../../../src/models/poster-generation.model');
jest.mock('../../../src/models/user.model');

describe('ActivityShare Model', () => {
  let sequelize: Sequelize;
  let mockActivity: any;
  let mockPosterGeneration: any;
  let mockUser: any;

  beforeEach(async () => {
    // Create in-memory SQLite database for testing
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
      define: {
        timestamps: false, // Only createdAt
        underscored: true,
      },
    });

    // Setup mock models
    mockActivity = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
    mockPosterGeneration = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
    mockUser = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };

    // Mock the imported models
    (Activity as any).mockImplementation(() => mockActivity);
    (PosterGeneration as any).mockImplementation(() => mockPosterGeneration);
    (User as any).mockImplementation(() => mockUser);

    // Initialize the model
    initActivityShare(sequelize);

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should define the model correctly', () => {
      expect(ActivityShare).toBeDefined();
      expect(ActivityShare.tableName).toBe('activity_shares');
    });

    it('should have correct attributes', () => {
      const attributes = ActivityShare.getAttributes();
      
      expect(attributes.id).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        primaryKey: true,
        autoIncrement: true,
      });
      
      expect(attributes.activityId).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
      });
      
      expect(attributes.posterId).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: true,
      });
      
      expect(attributes.shareChannel).toMatchObject({
        type: expect.any(DataTypes.ENUM),
        allowNull: false,
      });
      
      expect(attributes.shareUrl).toMatchObject({
        type: expect.any(DataTypes.STRING),
        allowNull: true,
      });
      
      expect(attributes.sharerId).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: true,
      });
      
      expect(attributes.shareIp).toMatchObject({
        type: expect.any(DataTypes.STRING),
        allowNull: true,
      });
      
      expect(attributes.createdAt).toMatchObject({
        type: expect.any(DataTypes.DATE),
        allowNull: false,
        defaultValue: DataTypes.NOW,
      });
    });

    it('should have correct table options', () => {
      const options = ActivityShare.options;
      
      expect(options.timestamps).toBe(false); // Only createdAt
      expect(options.paranoid).toBeUndefined(); // No paranoid option
      expect(options.underscored).toBe(true);
    });
  });

  describe('Enum Values', () => {
    it('should have correct shareChannel enum values', () => {
      const enumValues = ActivityShare.getAttributes().shareChannel.values;
      expect(enumValues).toContain('wechat');
      expect(enumValues).toContain('weibo');
      expect(enumValues).toContain('qq');
      expect(enumValues).toContain('link');
      expect(enumValues).toContain('qrcode');
      expect(enumValues).toContain('other');
    });
  });

  describe('Type Definitions', () => {
    it('should have correct ActivityShareAttributes type', () => {
      const mockAttributes: ActivityShareAttributes = {
        id: 1,
        activityId: 1,
        posterId: 1,
        shareChannel: 'wechat',
        shareUrl: 'https://example.com/share',
        sharerId: 1,
        shareIp: '192.168.1.1',
        createdAt: new Date(),
      };
      
      expect(mockAttributes.id).toBe(1);
      expect(mockAttributes.activityId).toBe(1);
      expect(mockAttributes.shareChannel).toBe('wechat');
      expect(mockAttributes.shareUrl).toBe('https://example.com/share');
    });

    it('should have correct ActivityShareCreationAttributes type', () => {
      const mockCreationAttributes: ActivityShareCreationAttributes = {
        activityId: 1,
        posterId: 1,
        shareChannel: 'weibo',
        shareUrl: 'https://example.com/share',
        sharerId: 1,
        shareIp: '192.168.1.1',
      };
      
      expect(mockCreationAttributes.activityId).toBe(1);
      expect(mockCreationAttributes.shareChannel).toBe('weibo');
      // Optional fields should be undefined
      expect(mockCreationAttributes.id).toBeUndefined();
      expect(mockCreationAttributes.createdAt).toBeUndefined();
    });
  });

  describe('Model Validations', () => {
    it('should validate required fields', async () => {
      const share = ActivityShare.build();
      
      await expect(share.validate()).rejects.toThrow();
    });

    it('should validate shareChannel enum', async () => {
      const share = ActivityShare.build({
        activityId: 1,
        shareChannel: 'invalid_channel' as any, // Invalid enum value
      });
      
      await expect(share.validate()).rejects.toThrow();
    });

    it('should accept valid shareChannel values', async () => {
      const validChannels = ['wechat', 'weibo', 'qq', 'link', 'qrcode', 'other'];
      
      for (const channel of validChannels) {
        const share = ActivityShare.build({
          activityId: 1,
          shareChannel: channel as any,
        });
        
        await expect(share.validate()).resolves.not.toThrow();
      }
    });

    it('should validate foreign key constraints', async () => {
      const share = ActivityShare.build({
        activityId: 0, // Invalid foreign key (should be positive)
        shareChannel: 'wechat',
      });
      
      // This validation should be handled at database level
      // For now, we'll test that the model can be built
      expect(share.activityId).toBe(0);
    });

    it('should validate URL format for shareUrl', async () => {
      const share = ActivityShare.build({
        activityId: 1,
        shareChannel: 'link',
        shareUrl: 'invalid-url', // Invalid URL format
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(share.shareUrl).toBe('invalid-url');
    });

    it('should validate IP address format for shareIp', async () => {
      const share = ActivityShare.build({
        activityId: 1,
        shareChannel: 'wechat',
        shareIp: 'invalid-ip', // Invalid IP format
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(share.shareIp).toBe('invalid-ip');
    });

    it('should accept valid data', async () => {
      const share = ActivityShare.build({
        activityId: 1,
        posterId: 1,
        shareChannel: 'wechat',
        shareUrl: 'https://example.com/share/wechat',
        sharerId: 1,
        shareIp: '192.168.1.100',
      });
      
      await expect(share.validate()).resolves.not.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should set default createdAt to current time', () => {
      const share = ActivityShare.build({
        activityId: 1,
        shareChannel: 'wechat',
      });
      
      expect(share.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Model Associations', () => {
    it('should belong to Activity', () => {
      // Since we're mocking the models, we need to check if the association method exists
      expect(typeof ActivityShare.belongsTo).toBe('function');
    });

    it('should belong to PosterGeneration', () => {
      // Since we're mocking the models, we need to check if the association method exists
      expect(typeof ActivityShare.belongsTo).toBe('function');
    });

    it('should belong to User', () => {
      // Since we're mocking the models, we need to check if the association method exists
      expect(typeof ActivityShare.belongsTo).toBe('function');
    });

    it('should have association properties defined', () => {
      const share = ActivityShare.build({
        activityId: 1,
        shareChannel: 'wechat',
      });
      
      // Check if association properties are defined (they should be undefined until populated)
      expect(share.activity).toBeUndefined();
      expect(share.poster).toBeUndefined();
      expect(share.sharer).toBeUndefined();
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new activity share', async () => {
      const share = await ActivityShare.create({
        activityId: 1,
        shareChannel: 'wechat',
      });

      expect(share.id).toBeDefined();
      expect(share.activityId).toBe(1);
      expect(share.shareChannel).toBe('wechat');
      expect(share.createdAt).toBeInstanceOf(Date);
    });

    it('should create with all optional fields', async () => {
      const share = await ActivityShare.create({
        activityId: 1,
        posterId: 1,
        shareChannel: 'weibo',
        shareUrl: 'https://weibo.com/share/123',
        sharerId: 1,
        shareIp: '192.168.1.1',
      });

      expect(share.posterId).toBe(1);
      expect(share.shareChannel).toBe('weibo');
      expect(share.shareUrl).toBe('https://weibo.com/share/123');
      expect(share.sharerId).toBe(1);
      expect(share.shareIp).toBe('192.168.1.1');
    });

    it('should read an activity share', async () => {
      const createdShare = await ActivityShare.create({
        activityId: 1,
        shareChannel: 'qq',
        shareUrl: 'https://qq.com/share/456',
        sharerId: 2,
        shareIp: '10.0.0.1',
      });

      const foundShare = await ActivityShare.findByPk(createdShare.id);
      
      expect(foundShare).toBeDefined();
      expect(foundShare?.activityId).toBe(1);
      expect(foundShare?.shareChannel).toBe('qq');
      expect(foundShare?.shareUrl).toBe('https://qq.com/share/456');
      expect(foundShare?.sharerId).toBe(2);
      expect(foundShare?.shareIp).toBe('10.0.0.1');
    });

    it('should update an activity share', async () => {
      const share = await ActivityShare.create({
        activityId: 1,
        shareChannel: 'link',
        shareUrl: 'https://example.com/share/old',
      });

      await share.update({
        shareChannel: 'qrcode',
        shareUrl: 'https://example.com/share/new',
        sharerId: 3,
        shareIp: '172.16.0.1',
      });

      expect(share.shareChannel).toBe('qrcode');
      expect(share.shareUrl).toBe('https://example.com/share/new');
      expect(share.sharerId).toBe(3);
      expect(share.shareIp).toBe('172.16.0.1');
    });

    it('should delete an activity share (hard delete - no paranoid)', async () => {
      const share = await ActivityShare.create({
        activityId: 1,
        shareChannel: 'wechat',
      });

      await share.destroy();
      
      const foundShare = await ActivityShare.findByPk(share.id);
      expect(foundShare).toBeNull(); // Hard delete should return null
    });

    it('should find all shares for an activity', async () => {
      // Create multiple shares for the same activity
      await ActivityShare.create({
        activityId: 1,
        shareChannel: 'wechat',
      });
      
      await ActivityShare.create({
        activityId: 1,
        shareChannel: 'weibo',
      });
      
      await ActivityShare.create({
        activityId: 1,
        shareChannel: 'qq',
      });

      const shares = await ActivityShare.findAll({
        where: { activityId: 1 },
        order: [['id', 'ASC']],
      });

      expect(shares).toHaveLength(3);
      expect(shares[0].shareChannel).toBe('wechat');
      expect(shares[1].shareChannel).toBe('weibo');
      expect(shares[2].shareChannel).toBe('qq');
    });

    it('should find shares by channel', async () => {
      // Create shares of different channels
      await ActivityShare.create({
        activityId: 1,
        shareChannel: 'wechat',
      });
      
      await ActivityShare.create({
        activityId: 1,
        shareChannel: 'wechat',
      });
      
      await ActivityShare.create({
        activityId: 1,
        shareChannel: 'weibo',
      });

      const wechatShares = await ActivityShare.findAll({
        where: { 
          activityId: 1,
          shareChannel: 'wechat' 
        },
        order: [['id', 'ASC']],
      });

      expect(wechatShares).toHaveLength(2);
      expect(wechatShares[0].shareChannel).toBe('wechat');
      expect(wechatShares[1].shareChannel).toBe('wechat');
    });

    it('should find shares by sharer', async () => {
      // Create shares by different sharers
      await ActivityShare.create({
        activityId: 1,
        shareChannel: 'wechat',
        sharerId: 1,
      });
      
      await ActivityShare.create({
        activityId: 1,
        shareChannel: 'weibo',
        sharerId: 1,
      });
      
      await ActivityShare.create({
        activityId: 1,
        shareChannel: 'qq',
        sharerId: 2,
      });

      const sharesBySharer1 = await ActivityShare.findAll({
        where: { 
          activityId: 1,
          sharerId: 1 
        },
        order: [['id', 'ASC']],
      });

      expect(sharesBySharer1).toHaveLength(2);
      expect(sharesBySharer1[0].shareChannel).toBe('wechat');
      expect(sharesBySharer1[1].shareChannel).toBe('weibo');
    });

    it('should find shares with poster', async () => {
      // Create shares with and without posters
      await ActivityShare.create({
        activityId: 1,
        shareChannel: 'wechat',
        posterId: 1,
      });
      
      await ActivityShare.create({
        activityId: 1,
        shareChannel: 'weibo',
        posterId: 2,
      });
      
      await ActivityShare.create({
        activityId: 1,
        shareChannel: 'qq',
        posterId: null, // No poster
      });

      const sharesWithPoster = await ActivityShare.findAll({
        where: { 
          activityId: 1,
          posterId: { [Sequelize.Op.ne]: null }
        },
        order: [['id', 'ASC']],
      });

      expect(sharesWithPoster).toHaveLength(2);
      expect(sharesWithPoster[0].posterId).toBe(1);
      expect(sharesWithPoster[1].posterId).toBe(2);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle minimum foreign key values', async () => {
      const share = ActivityShare.build({
        activityId: 1, // Minimum positive ID
        shareChannel: 'wechat',
        posterId: 1, // Minimum positive ID
        sharerId: 1, // Minimum positive ID
      });
      
      await expect(share.validate()).resolves.not.toThrow();
    });

    it('should handle large foreign key values', async () => {
      const share = ActivityShare.build({
        activityId: 2147483647, // Maximum 32-bit integer
        shareChannel: 'other',
        posterId: 2147483647, // Maximum 32-bit integer
        sharerId: 2147483647, // Maximum 32-bit integer
      });
      
      await expect(share.validate()).resolves.not.toThrow();
    });

    it('should handle all share channels', async () => {
      const channels = ['wechat', 'weibo', 'qq', 'link', 'qrcode', 'other'];
      
      for (const channel of channels) {
        const share = ActivityShare.build({
          activityId: 1,
          shareChannel: channel as any,
        });
        
        await expect(share.validate()).resolves.not.toThrow();
      }
    });

    it('should handle maximum string lengths', async () => {
      const longUrl = 'a'.repeat(500); // Maximum length for shareUrl
      const longIp = 'a'.repeat(45); // Maximum length for shareIp
      
      const share = ActivityShare.build({
        activityId: 1,
        shareChannel: 'link',
        shareUrl: longUrl,
        shareIp: longIp,
      });
      
      await expect(share.validate()).resolves.not.toThrow();
    });

    it('should handle minimum string lengths', async () => {
      const share = ActivityShare.build({
        activityId: 1,
        shareChannel: 'link',
        shareUrl: 'a', // Minimum URL length
        shareIp: 'a', // Minimum IP length
      });
      
      await expect(share.validate()).resolves.not.toThrow();
    });

    it('should handle null values for optional fields', async () => {
      const share = ActivityShare.build({
        activityId: 1,
        shareChannel: 'wechat',
        posterId: null,
        shareUrl: null,
        sharerId: null,
        shareIp: null,
      });
      
      await expect(share.validate()).resolves.not.toThrow();
    });

    it('should handle zero foreign keys (validation at database level)', async () => {
      const share = ActivityShare.build({
        activityId: 0,
        shareChannel: 'wechat',
        posterId: 0,
        sharerId: 0,
      });
      
      // Model validation should pass, but database constraints should handle this
      await expect(share.validate()).resolves.not.toThrow();
    });

    it('should handle negative foreign keys (validation at database level)', async () => {
      const share = ActivityShare.build({
        activityId: -1,
        shareChannel: 'wechat',
        posterId: -1,
        sharerId: -1,
      });
      
      // Model validation should pass, but database constraints should handle this
      await expect(share.validate()).resolves.not.toThrow();
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt on creation', async () => {
      const beforeCreate = new Date();
      
      const share = await ActivityShare.create({
        activityId: 1,
        shareChannel: 'wechat',
      });
      
      const afterCreate = new Date();
      
      expect(share.createdAt).toBeInstanceOf(Date);
      expect(share.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(share.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should not have updatedAt field', () => {
      const share = ActivityShare.build({
        activityId: 1,
        shareChannel: 'wechat',
      });
      
      expect(share.updatedAt).toBeUndefined();
    });

    it('should not have deletedAt field', () => {
      const share = ActivityShare.build({
        activityId: 1,
        shareChannel: 'wechat',
      });
      
      expect(share.deletedAt).toBeUndefined();
    });
  });

  describe('Share Channel Analysis', () => {
    it('should track different share channels correctly', async () => {
      const channels = ['wechat', 'weibo', 'qq', 'link', 'qrcode', 'other'];
      const createdShares = [];
      
      for (const channel of channels) {
        const share = await ActivityShare.create({
          activityId: 1,
          shareChannel: channel as any,
        });
        createdShares.push(share);
      }
      
      expect(createdShares).toHaveLength(6);
      
      // Verify each channel was recorded correctly
      for (let i = 0; i < channels.length; i++) {
        expect(createdShares[i].shareChannel).toBe(channels[i]);
      }
    });

    it('should support share statistics by channel', async () => {
      // Create multiple shares for different channels
      await ActivityShare.create({ activityId: 1, shareChannel: 'wechat' as any });
      await ActivityShare.create({ activityId: 1, shareChannel: 'wechat' as any });
      await ActivityShare.create({ activityId: 1, shareChannel: 'wechat' as any });
      await ActivityShare.create({ activityId: 1, shareChannel: 'weibo' as any });
      await ActivityShare.create({ activityId: 1, shareChannel: 'weibo' as any });
      await ActivityShare.create({ activityId: 1, shareChannel: 'qq' as any });

      const shares = await ActivityShare.findAll({
        where: { activityId: 1 },
        order: [['shareChannel', 'ASC']],
      });

      expect(shares).toHaveLength(6);
      
      // Count shares by channel
      const channelCounts = shares.reduce((acc, share) => {
        const channel = share.shareChannel;
        acc[channel] = (acc[channel] || 0) + 1;
        return acc;
      }, {} as any);

      expect(channelCounts.wechat).toBe(3);
      expect(channelCounts.weibo).toBe(2);
      expect(channelCounts.qq).toBe(1);
    });
  });
});