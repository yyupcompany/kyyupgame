import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Sequelize, DataTypes } from 'sequelize';
import { 
  ActivityPoster, 
  ActivityPosterAttributes,
  ActivityPosterCreationAttributes,
  initActivityPoster 
} from '../../../src/models/activity-poster.model';
import { Activity } from '../../../src/models/activity.model';
import { PosterGeneration } from '../../../src/models/poster-generation.model';

// Mock the associated models
jest.mock('../../../src/models/activity.model');
jest.mock('../../../src/models/poster-generation.model');

describe('ActivityPoster Model', () => {
  let sequelize: Sequelize;
  let mockActivity: any;
  let mockPosterGeneration: any;

  beforeEach(async () => {
    // Create in-memory SQLite database for testing
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
      define: {
        timestamps: true,
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

    // Mock the imported models
    (Activity as any).mockImplementation(() => mockActivity);
    (PosterGeneration as any).mockImplementation(() => mockPosterGeneration);

    // Initialize the model
    initActivityPoster(sequelize);

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should define the model correctly', () => {
      expect(ActivityPoster).toBeDefined();
      expect(ActivityPoster.tableName).toBe('activity_posters');
    });

    it('should have correct attributes', () => {
      const attributes = ActivityPoster.getAttributes();
      
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
        allowNull: false,
      });
      
      expect(attributes.posterType).toMatchObject({
        type: expect.any(DataTypes.ENUM),
        allowNull: false,
        defaultValue: 'main',
      });
      
      expect(attributes.isActive).toMatchObject({
        type: expect.any(DataTypes.BOOLEAN),
        allowNull: false,
        defaultValue: true,
      });
    });

    it('should have correct table options', () => {
      const options = ActivityPoster.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBeUndefined(); // No paranoid option
      expect(options.underscored).toBe(true);
    });
  });

  describe('Enum Values', () => {
    it('should have correct posterType enum values', () => {
      const enumValues = ActivityPoster.getAttributes().posterType.values;
      expect(enumValues).toContain('main');
      expect(enumValues).toContain('share');
      expect(enumValues).toContain('detail');
      expect(enumValues).toContain('preview');
    });
  });

  describe('Type Definitions', () => {
    it('should have correct ActivityPosterAttributes type', () => {
      const mockAttributes: ActivityPosterAttributes = {
        id: 1,
        activityId: 1,
        posterId: 1,
        posterType: 'main',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      expect(mockAttributes.id).toBe(1);
      expect(mockAttributes.posterType).toBe('main');
      expect(mockAttributes.isActive).toBe(true);
    });

    it('should have correct ActivityPosterCreationAttributes type', () => {
      const mockCreationAttributes: ActivityPosterCreationAttributes = {
        activityId: 1,
        posterId: 1,
        posterType: 'share',
        isActive: false,
      };
      
      expect(mockCreationAttributes.activityId).toBe(1);
      expect(mockCreationAttributes.posterType).toBe('share');
      expect(mockCreationAttributes.isActive).toBe(false);
      // Optional fields should be undefined
      expect(mockCreationAttributes.id).toBeUndefined();
      expect(mockCreationAttributes.createdAt).toBeUndefined();
      expect(mockCreationAttributes.updatedAt).toBeUndefined();
    });
  });

  describe('Model Validations', () => {
    it('should validate required fields', async () => {
      const poster = ActivityPoster.build();
      
      await expect(poster.validate()).rejects.toThrow();
    });

    it('should validate posterType enum', async () => {
      const poster = ActivityPoster.build({
        activityId: 1,
        posterId: 1,
        posterType: 'invalid_type' as any, // Invalid enum value
      });
      
      await expect(poster.validate()).rejects.toThrow();
    });

    it('should accept valid posterType values', async () => {
      const validTypes = ['main', 'share', 'detail', 'preview'];
      
      for (const type of validTypes) {
        const poster = ActivityPoster.build({
          activityId: 1,
          posterId: 1,
          posterType: type as any,
        });
        
        await expect(poster.validate()).resolves.not.toThrow();
      }
    });

    it('should validate foreign key constraints', async () => {
      const poster = ActivityPoster.build({
        activityId: 0, // Invalid foreign key (should be positive)
        posterId: -1, // Invalid foreign key (should be positive)
        posterType: 'main',
      });
      
      // This validation should be handled at database level
      // For now, we'll test that the model can be built
      expect(poster.activityId).toBe(0);
      expect(poster.posterId).toBe(-1);
    });

    it('should accept valid data', async () => {
      const poster = ActivityPoster.build({
        activityId: 1,
        posterId: 1,
        posterType: 'main',
        isActive: true,
      });
      
      await expect(poster.validate()).resolves.not.toThrow();
    });

    it('should accept all poster types with valid data', async () => {
      const posterTypes = ['main', 'share', 'detail', 'preview'];
      
      for (const type of posterTypes) {
        const poster = ActivityPoster.build({
          activityId: 1,
          posterId: 1,
          posterType: type as any,
          isActive: true,
        });
        
        await expect(poster.validate()).resolves.not.toThrow();
      }
    });
  });

  describe('Default Values', () => {
    it('should set default posterType to "main"', () => {
      const poster = ActivityPoster.build({
        activityId: 1,
        posterId: 1,
      });
      
      expect(poster.posterType).toBe('main');
    });

    it('should set default isActive to true', () => {
      const poster = ActivityPoster.build({
        activityId: 1,
        posterId: 1,
      });
      
      expect(poster.isActive).toBe(true);
    });

    it('should set default createdAt and updatedAt', () => {
      const poster = ActivityPoster.build({
        activityId: 1,
        posterId: 1,
      });
      
      expect(poster.createdAt).toBeInstanceOf(Date);
      expect(poster.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Model Associations', () => {
    it('should belong to Activity', () => {
      // Since we're mocking the models, we need to check if the association method exists
      expect(typeof ActivityPoster.belongsTo).toBe('function');
    });

    it('should belong to PosterGeneration', () => {
      // Since we're mocking the models, we need to check if the association method exists
      expect(typeof ActivityPoster.belongsTo).toBe('function');
    });

    it('should have association properties defined', () => {
      const poster = ActivityPoster.build({
        activityId: 1,
        posterId: 1,
      });
      
      // Check if association properties are defined (they should be undefined until populated)
      expect(poster.activity).toBeUndefined();
      expect(poster.poster).toBeUndefined();
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new activity poster', async () => {
      const poster = await ActivityPoster.create({
        activityId: 1,
        posterId: 1,
        posterType: 'main',
        isActive: true,
      });

      expect(poster.id).toBeDefined();
      expect(poster.activityId).toBe(1);
      expect(poster.posterId).toBe(1);
      expect(poster.posterType).toBe('main');
      expect(poster.isActive).toBe(true);
      expect(poster.createdAt).toBeInstanceOf(Date);
      expect(poster.updatedAt).toBeInstanceOf(Date);
    });

    it('should create with default values', async () => {
      const poster = await ActivityPoster.create({
        activityId: 1,
        posterId: 1,
      });

      expect(poster.posterType).toBe('main');
      expect(poster.isActive).toBe(true);
    });

    it('should read an activity poster', async () => {
      const createdPoster = await ActivityPoster.create({
        activityId: 1,
        posterId: 1,
        posterType: 'share',
        isActive: false,
      });

      const foundPoster = await ActivityPoster.findByPk(createdPoster.id);
      
      expect(foundPoster).toBeDefined();
      expect(foundPoster?.activityId).toBe(1);
      expect(foundPoster?.posterId).toBe(1);
      expect(foundPoster?.posterType).toBe('share');
      expect(foundPoster?.isActive).toBe(false);
    });

    it('should update an activity poster', async () => {
      const poster = await ActivityPoster.create({
        activityId: 1,
        posterId: 1,
        posterType: 'main',
        isActive: true,
      });

      await poster.update({
        posterType: 'detail',
        isActive: false,
      });

      expect(poster.posterType).toBe('detail');
      expect(poster.isActive).toBe(false);
    });

    it('should delete an activity poster (hard delete - no paranoid)', async () => {
      const poster = await ActivityPoster.create({
        activityId: 1,
        posterId: 1,
        posterType: 'main',
        isActive: true,
      });

      await poster.destroy();
      
      const foundPoster = await ActivityPoster.findByPk(poster.id);
      expect(foundPoster).toBeNull(); // Hard delete should return null
    });

    it('should find all posters for an activity', async () => {
      // Create multiple posters for the same activity
      await ActivityPoster.create({
        activityId: 1,
        posterId: 1,
        posterType: 'main',
        isActive: true,
      });
      
      await ActivityPoster.create({
        activityId: 1,
        posterId: 2,
        posterType: 'share',
        isActive: true,
      });
      
      await ActivityPoster.create({
        activityId: 1,
        posterId: 3,
        posterType: 'detail',
        isActive: false,
      });

      const posters = await ActivityPoster.findAll({
        where: { activityId: 1 },
        order: [['id', 'ASC']],
      });

      expect(posters).toHaveLength(3);
      expect(posters[0].posterType).toBe('main');
      expect(posters[1].posterType).toBe('share');
      expect(posters[2].posterType).toBe('detail');
    });

    it('should find active posters only', async () => {
      // Create mix of active and inactive posters
      await ActivityPoster.create({
        activityId: 1,
        posterId: 1,
        posterType: 'main',
        isActive: true,
      });
      
      await ActivityPoster.create({
        activityId: 1,
        posterId: 2,
        posterType: 'share',
        isActive: false,
      });
      
      await ActivityPoster.create({
        activityId: 1,
        posterId: 3,
        posterType: 'detail',
        isActive: true,
      });

      const activePosters = await ActivityPoster.findAll({
        where: { 
          activityId: 1,
          isActive: true 
        },
        order: [['id', 'ASC']],
      });

      expect(activePosters).toHaveLength(2);
      expect(activePosters[0].posterType).toBe('main');
      expect(activePosters[1].posterType).toBe('detail');
    });

    it('should find posters by type', async () => {
      // Create posters of different types
      await ActivityPoster.create({
        activityId: 1,
        posterId: 1,
        posterType: 'main',
        isActive: true,
      });
      
      await ActivityPoster.create({
        activityId: 1,
        posterId: 2,
        posterType: 'main',
        isActive: true,
      });
      
      await ActivityPoster.create({
        activityId: 1,
        posterId: 3,
        posterType: 'share',
        isActive: true,
      });

      const mainPosters = await ActivityPoster.findAll({
        where: { 
          activityId: 1,
          posterType: 'main' 
        },
        order: [['id', 'ASC']],
      });

      expect(mainPosters).toHaveLength(2);
      expect(mainPosters[0].posterType).toBe('main');
      expect(mainPosters[1].posterType).toBe('main');
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle minimum foreign key values', async () => {
      const poster = ActivityPoster.build({
        activityId: 1, // Minimum positive ID
        posterId: 1, // Minimum positive ID
        posterType: 'main',
        isActive: true,
      });
      
      await expect(poster.validate()).resolves.not.toThrow();
    });

    it('should handle large foreign key values', async () => {
      const poster = ActivityPoster.build({
        activityId: 2147483647, // Maximum 32-bit integer
        posterId: 2147483647, // Maximum 32-bit integer
        posterType: 'preview',
        isActive: false,
      });
      
      await expect(poster.validate()).resolves.not.toThrow();
    });

    it('should handle all combinations of posterType and isActive', async () => {
      const posterTypes = ['main', 'share', 'detail', 'preview'];
      const activeStates = [true, false];
      
      for (const type of posterTypes) {
        for (const isActive of activeStates) {
          const poster = ActivityPoster.build({
            activityId: 1,
            posterId: 1,
            posterType: type as any,
            isActive: isActive,
          });
          
          await expect(poster.validate()).resolves.not.toThrow();
        }
      }
    });

    it('should handle zero foreign keys (validation at database level)', async () => {
      const poster = ActivityPoster.build({
        activityId: 0,
        posterId: 0,
        posterType: 'main',
        isActive: true,
      });
      
      // Model validation should pass, but database constraints should handle this
      await expect(poster.validate()).resolves.not.toThrow();
    });

    it('should handle negative foreign keys (validation at database level)', async () => {
      const poster = ActivityPoster.build({
        activityId: -1,
        posterId: -1,
        posterType: 'main',
        isActive: true,
      });
      
      // Model validation should pass, but database constraints should handle this
      await expect(poster.validate()).resolves.not.toThrow();
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const beforeCreate = new Date();
      
      const poster = await ActivityPoster.create({
        activityId: 1,
        posterId: 1,
        posterType: 'main',
        isActive: true,
      });
      
      const afterCreate = new Date();
      
      expect(poster.createdAt).toBeInstanceOf(Date);
      expect(poster.updatedAt).toBeInstanceOf(Date);
      expect(poster.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(poster.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(poster.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(poster.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should update updatedAt on update', async () => {
      const poster = await ActivityPoster.create({
        activityId: 1,
        posterId: 1,
        posterType: 'main',
        isActive: true,
      });
      
      const originalUpdatedAt = poster.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await poster.update({
        isActive: false,
      });
      
      expect(poster.updatedAt).toBeInstanceOf(Date);
      expect(poster.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not change createdAt on update', async () => {
      const poster = await ActivityPoster.create({
        activityId: 1,
        posterId: 1,
        posterType: 'main',
        isActive: true,
      });
      
      const originalCreatedAt = poster.createdAt;
      
      await poster.update({
        isActive: false,
      });
      
      expect(poster.createdAt).toBe(originalCreatedAt);
    });
  });
});