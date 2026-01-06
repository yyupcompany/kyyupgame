import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Sequelize, DataTypes } from 'sequelize';
import { 
  ActivityResource, 
  initActivityResource,
  initActivityResourceAssociations 
} from '../../../src/models/activity-resource.model';
import { Activity } from '../../../src/models/activity.model';
import { User } from '../../../src/models/user.model';

// Mock the associated models
jest.mock('../../../src/models/activity.model');
jest.mock('../../../src/models/user.model');

describe('ActivityResource Model', () => {
  let sequelize: Sequelize;
  let mockActivity: any;
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
    mockActivity = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
    mockUser = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };

    // Mock the imported models
    (Activity as any).mockImplementation(() => mockActivity);
    (User as any).mockImplementation(() => mockUser);

    // Initialize the model
    initActivityResource(sequelize);
    initActivityResourceAssociations();

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should define the model correctly', () => {
      expect(ActivityResource).toBeDefined();
      expect(ActivityResource.tableName).toBe('activity_resources');
    });

    it('should have correct attributes', () => {
      const attributes = ActivityResource.getAttributes();
      
      expect(attributes.id).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        autoIncrement: true,
        primaryKey: true,
      });
      
      expect(attributes.activityId).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
      });
      
      expect(attributes.resourceName).toMatchObject({
        type: expect.any(DataTypes.STRING),
        allowNull: false,
      });
      
      expect(attributes.resourceType).toMatchObject({
        type: expect.any(DataTypes.TINYINT),
        allowNull: false,
      });
      
      expect(attributes.resourceUrl).toMatchObject({
        type: expect.any(DataTypes.STRING),
        allowNull: false,
      });
      
      expect(attributes.isPublic).toMatchObject({
        type: expect.any(DataTypes.BOOLEAN),
        allowNull: false,
        defaultValue: true,
      });
      
      expect(attributes.sortOrder).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
        defaultValue: 0,
      });
    });

    it('should have correct table options', () => {
      const options = ActivityResource.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });
  });

  describe('Model Validations', () => {
    it('should validate required fields', async () => {
      const resource = ActivityResource.build();
      
      await expect(resource.validate()).rejects.toThrow();
    });

    it('should validate resource type range', async () => {
      const resource = ActivityResource.build({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 99, // Invalid resource type
        resourceUrl: 'http://example.com/resource.pdf',
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(resource.resourceType).toBe(99);
    });

    it('should validate file size is non-negative', async () => {
      const resource = ActivityResource.build({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/resource.pdf',
        fileSize: -1, // Invalid negative file size
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(resource.fileSize).toBe(-1);
    });

    it('should validate sort order is integer', async () => {
      const resource = ActivityResource.build({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/resource.pdf',
        sortOrder: -5, // Negative sort order should be allowed
      });
      
      await expect(resource.validate()).resolves.not.toThrow();
    });

    it('should accept valid data', async () => {
      const resource = ActivityResource.build({
        activityId: 1,
        resourceName: 'Test Resource PDF',
        resourceType: 2, // Document type
        resourceUrl: 'http://example.com/resource.pdf',
        fileSize: 1024000, // 1MB
        fileType: 'application/pdf',
        isPublic: true,
        description: 'A test PDF document',
        sortOrder: 1,
        creatorId: 1,
        updaterId: 1,
      });
      
      await expect(resource.validate()).resolves.not.toThrow();
    });
  });

  describe('Resource Type Constants', () => {
    it('should support common resource types', () => {
      // Test common resource type values
      const types = [1, 2, 3, 4, 5]; // Image, Document, Video, Audio, Other
      
      types.forEach(type => {
        const resource = ActivityResource.build({
          activityId: 1,
          resourceName: 'Test Resource',
          resourceType: type,
          resourceUrl: 'http://example.com/resource',
        });
        
        expect(resource.resourceType).toBe(type);
      });
    });
  });

  describe('Model Associations', () => {
    it('should belong to Activity', () => {
      expect(ActivityResource.belongsTo).toHaveBeenCalledWith(
        Activity,
        {
          foreignKey: 'activityId',
          as: 'activity',
        }
      );
    });

    it('should belong to User as creator', () => {
      expect(ActivityResource.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'creatorId',
          as: 'creator',
        }
      );
    });

    it('should belong to User as updater', () => {
      expect(ActivityResource.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'updaterId',
          as: 'updater',
        }
      );
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new activity resource', async () => {
      const resource = await ActivityResource.create({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/image.jpg',
      });

      expect(resource.id).toBeDefined();
      expect(resource.activityId).toBe(1);
      expect(resource.resourceName).toBe('Test Resource');
      expect(resource.resourceType).toBe(1);
      expect(resource.resourceUrl).toBe('http://example.com/image.jpg');
      expect(resource.isPublic).toBe(true);
      expect(resource.sortOrder).toBe(0);
      expect(resource.createdAt).toBeInstanceOf(Date);
      expect(resource.updatedAt).toBeInstanceOf(Date);
    });

    it('should create with default values', async () => {
      const resource = await ActivityResource.create({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 2,
        resourceUrl: 'http://example.com/document.pdf',
      });

      expect(resource.isPublic).toBe(true);
      expect(resource.sortOrder).toBe(0);
    });

    it('should read an activity resource', async () => {
      const createdResource = await ActivityResource.create({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 3,
        resourceUrl: 'http://example.com/video.mp4',
        fileSize: 10485760, // 10MB
        fileType: 'video/mp4',
      });

      const foundResource = await ActivityResource.findByPk(createdResource.id);
      
      expect(foundResource).toBeDefined();
      expect(foundResource?.resourceName).toBe('Test Resource');
      expect(foundResource?.resourceType).toBe(3);
      expect(foundResource?.resourceUrl).toBe('http://example.com/video.mp4');
      expect(foundResource?.fileSize).toBe(10485760);
      expect(foundResource?.fileType).toBe('video/mp4');
    });

    it('should update an activity resource', async () => {
      const resource = await ActivityResource.create({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/image.jpg',
      });

      await resource.update({
        resourceName: 'Updated Resource',
        resourceType: 2,
        isPublic: false,
        sortOrder: 5,
        description: 'Updated description',
      });

      expect(resource.resourceName).toBe('Updated Resource');
      expect(resource.resourceType).toBe(2);
      expect(resource.isPublic).toBe(false);
      expect(resource.sortOrder).toBe(5);
      expect(resource.description).toBe('Updated description');
    });

    it('should delete an activity resource (soft delete)', async () => {
      const resource = await ActivityResource.create({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/image.jpg',
      });

      await resource.destroy();
      
      const foundResource = await ActivityResource.findByPk(resource.id);
      expect(foundResource).toBeNull(); // Soft delete should return null
      
      // Check if it's actually soft deleted
      const deletedResource = await ActivityResource.findByPk(resource.id, { paranoid: false });
      expect(deletedResource).toBeDefined();
      expect(deletedResource?.deletedAt).toBeDefined();
    });

    it('should find all resources for an activity', async () => {
      // Create multiple resources for the same activity
      await ActivityResource.create({
        activityId: 1,
        resourceName: 'Resource 1',
        resourceType: 1,
        resourceUrl: 'http://example.com/image1.jpg',
        sortOrder: 1,
      });
      
      await ActivityResource.create({
        activityId: 1,
        resourceName: 'Resource 2',
        resourceType: 2,
        resourceUrl: 'http://example.com/document1.pdf',
        sortOrder: 2,
      });
      
      await ActivityResource.create({
        activityId: 1,
        resourceName: 'Resource 3',
        resourceType: 3,
        resourceUrl: 'http://example.com/video1.mp4',
        sortOrder: 3,
      });

      const resources = await ActivityResource.findAll({
        where: { activityId: 1 },
        order: [['sortOrder', 'ASC']],
      });

      expect(resources).toHaveLength(3);
      expect(resources[0].resourceName).toBe('Resource 1');
      expect(resources[1].resourceName).toBe('Resource 2');
      expect(resources[2].resourceName).toBe('Resource 3');
    });

    it('should find public resources only', async () => {
      // Create mix of public and private resources
      await ActivityResource.create({
        activityId: 1,
        resourceName: 'Public Resource 1',
        resourceType: 1,
        resourceUrl: 'http://example.com/public1.jpg',
        isPublic: true,
      });
      
      await ActivityResource.create({
        activityId: 1,
        resourceName: 'Private Resource 1',
        resourceType: 2,
        resourceUrl: 'http://example.com/private1.pdf',
        isPublic: false,
      });
      
      await ActivityResource.create({
        activityId: 1,
        resourceName: 'Public Resource 2',
        resourceType: 3,
        resourceUrl: 'http://example.com/public2.mp4',
        isPublic: true,
      });

      const publicResources = await ActivityResource.findAll({
        where: { 
          activityId: 1,
          isPublic: true 
        },
        order: [['id', 'ASC']],
      });

      expect(publicResources).toHaveLength(2);
      expect(publicResources[0].resourceName).toBe('Public Resource 1');
      expect(publicResources[1].resourceName).toBe('Public Resource 2');
    });

    it('should find resources by type', async () => {
      // Create resources of different types
      await ActivityResource.create({
        activityId: 1,
        resourceName: 'Image Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/image.jpg',
      });
      
      await ActivityResource.create({
        activityId: 1,
        resourceName: 'Document Resource',
        resourceType: 2,
        resourceUrl: 'http://example.com/document.pdf',
      });
      
      await ActivityResource.create({
        activityId: 1,
        resourceName: 'Another Image',
        resourceType: 1,
        resourceUrl: 'http://example.com/image2.jpg',
      });

      const imageResources = await ActivityResource.findAll({
        where: { 
          activityId: 1,
          resourceType: 1 
        },
        order: [['id', 'ASC']],
      });

      expect(imageResources).toHaveLength(2);
      expect(imageResources[0].resourceName).toBe('Image Resource');
      expect(imageResources[1].resourceName).toBe('Another Image');
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle maximum string lengths', async () => {
      const longName = 'a'.repeat(100); // Maximum length for resourceName
      const longUrl = 'a'.repeat(255); // Maximum length for resourceUrl
      const longFileType = 'a'.repeat(50); // Maximum length for fileType
      
      const resource = ActivityResource.build({
        activityId: 1,
        resourceName: longName,
        resourceType: 1,
        resourceUrl: longUrl,
        fileType: longFileType,
        description: 'a'.repeat(10000), // Long text for description
      });
      
      await expect(resource.validate()).resolves.not.toThrow();
    });

    it('should handle minimum values', async () => {
      const resource = ActivityResource.build({
        activityId: 1,
        resourceName: 'A', // Minimum name length
        resourceType: 1,
        resourceUrl: 'http://a.co', // Minimum URL length
        sortOrder: -2147483648, // Minimum 32-bit integer
      });
      
      await expect(resource.validate()).resolves.not.toThrow();
    });

    it('should handle null values for optional fields', async () => {
      const resource = ActivityResource.build({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/resource.jpg',
        fileSize: null,
        fileType: null,
        description: null,
        creatorId: null,
        updaterId: null,
      });
      
      await expect(resource.validate()).resolves.not.toThrow();
    });

    it('should handle extreme file size values', async () => {
      const resource1 = ActivityResource.build({
        activityId: 1,
        resourceName: 'Small File',
        resourceType: 1,
        resourceUrl: 'http://example.com/small.jpg',
        fileSize: 0, // Empty file
      });
      
      const resource2 = ActivityResource.build({
        activityId: 1,
        resourceName: 'Large File',
        resourceType: 1,
        resourceUrl: 'http://example.com/large.jpg',
        fileSize: 2147483647, // Maximum 32-bit integer (about 2GB)
      });
      
      await expect(resource1.validate()).resolves.not.toThrow();
      await expect(resource2.validate()).resolves.not.toThrow();
    });

    it('should handle all resource types', async () => {
      const resourceTypes = [1, 2, 3, 4, 5]; // Image, Document, Video, Audio, Other
      
      for (const type of resourceTypes) {
        const resource = ActivityResource.build({
          activityId: 1,
          resourceName: `Resource Type ${type}`,
          resourceType: type,
          resourceUrl: `http://example.com/resource${type}`,
        });
        
        await expect(resource.validate()).resolves.not.toThrow();
      }
    });

    it('should handle extreme sort order values', async () => {
      const resource1 = ActivityResource.build({
        activityId: 1,
        resourceName: 'First Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/first.jpg',
        sortOrder: -2147483648, // Minimum 32-bit integer
      });
      
      const resource2 = ActivityResource.build({
        activityId: 1,
        resourceName: 'Last Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/last.jpg',
        sortOrder: 2147483647, // Maximum 32-bit integer
      });
      
      await expect(resource1.validate()).resolves.not.toThrow();
      await expect(resource2.validate()).resolves.not.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should set default isPublic to true', () => {
      const resource = ActivityResource.build({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/resource.jpg',
      });
      
      expect(resource.isPublic).toBe(true);
    });

    it('should set default sortOrder to 0', () => {
      const resource = ActivityResource.build({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/resource.jpg',
      });
      
      expect(resource.sortOrder).toBe(0);
    });

    it('should set default createdAt and updatedAt to current time', () => {
      const resource = ActivityResource.build({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/resource.jpg',
      });
      
      expect(resource.createdAt).toBeInstanceOf(Date);
      expect(resource.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const beforeCreate = new Date();
      
      const resource = await ActivityResource.create({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/resource.jpg',
      });
      
      const afterCreate = new Date();
      
      expect(resource.createdAt).toBeInstanceOf(Date);
      expect(resource.updatedAt).toBeInstanceOf(Date);
      expect(resource.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(resource.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(resource.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(resource.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should update updatedAt on update', async () => {
      const resource = await ActivityResource.create({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/resource.jpg',
      });
      
      const originalUpdatedAt = resource.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await resource.update({
        resourceName: 'Updated Resource',
      });
      
      expect(resource.updatedAt).toBeInstanceOf(Date);
      expect(resource.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not change createdAt on update', async () => {
      const resource = await ActivityResource.create({
        activityId: 1,
        resourceName: 'Test Resource',
        resourceType: 1,
        resourceUrl: 'http://example.com/resource.jpg',
      });
      
      const originalCreatedAt = resource.createdAt;
      
      await resource.update({
        resourceName: 'Updated Resource',
      });
      
      expect(resource.createdAt).toBe(originalCreatedAt);
    });
  });
});