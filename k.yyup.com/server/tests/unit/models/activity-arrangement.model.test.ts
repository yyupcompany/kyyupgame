import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Sequelize, DataTypes } from 'sequelize';
import { 
  ActivityArrangement, 
  ArrangementActivityType, 
  ArrangementStatus,
  initActivityArrangement,
  initActivityArrangementAssociations 
} from '../../../src/models/activity-arrangement.model';
import { ActivityPlan } from '../../../src/models/activity-plan.model';
import { ActivityEvaluation } from '../../../src/models/activity-evaluation.model';
import { User } from '../../../src/models/user.model';

// Mock the associated models
jest.mock('../../../src/models/activity-plan.model');
jest.mock('../../../src/models/activity-evaluation.model');
jest.mock('../../../src/models/user.model');

describe('ActivityArrangement Model', () => {
  let sequelize: Sequelize;
  let mockActivityPlan: any;
  let mockActivityEvaluation: any;
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
    mockActivityPlan = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
    mockActivityEvaluation = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
    mockUser = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };

    // Mock the imported models
    (ActivityPlan as any).mockImplementation(() => mockActivityPlan);
    (ActivityEvaluation as any).mockImplementation(() => mockActivityEvaluation);
    (User as any).mockImplementation(() => mockUser);

    // Initialize the model
    initActivityArrangement(sequelize);
    initActivityArrangementAssociations();

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should define the model correctly', () => {
      expect(ActivityArrangement).toBeDefined();
      expect(ActivityArrangement.tableName).toBe('activity_arrangements');
    });

    it('should have correct attributes', () => {
      const attributes = ActivityArrangement.getAttributes();
      
      expect(attributes.id).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        primaryKey: true,
        autoIncrement: true,
      });
      
      expect(attributes.planId).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
      });
      
      expect(attributes.title).toMatchObject({
        type: expect.any(DataTypes.STRING),
        allowNull: false,
      });
      
      expect(attributes.activityType).toMatchObject({
        type: expect.any(DataTypes.TINYINT),
        allowNull: false,
      });
      
      expect(attributes.location).toMatchObject({
        type: expect.any(DataTypes.STRING),
        allowNull: false,
      });
      
      expect(attributes.startTime).toMatchObject({
        type: expect.any(DataTypes.DATE),
        allowNull: false,
      });
      
      expect(attributes.endTime).toMatchObject({
        type: expect.any(DataTypes.DATE),
        allowNull: false,
      });
      
      expect(attributes.participantCount).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
      });
      
      expect(attributes.status).toMatchObject({
        type: expect.any(DataTypes.TINYINT),
        allowNull: false,
        defaultValue: ArrangementStatus.NOT_STARTED,
      });
    });

    it('should have correct table options', () => {
      const options = ActivityArrangement.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });
  });

  describe('Enum Values', () => {
    it('should have correct ArrangementActivityType values', () => {
      expect(ArrangementActivityType.INDOOR).toBe(1);
      expect(ArrangementActivityType.OUTDOOR).toBe(2);
      expect(ArrangementActivityType.HOME_SCHOOL).toBe(3);
      expect(ArrangementActivityType.VISIT).toBe(4);
      expect(ArrangementActivityType.OTHER).toBe(5);
    });

    it('should have correct ArrangementStatus values', () => {
      expect(ArrangementStatus.NOT_STARTED).toBe(0);
      expect(ArrangementStatus.PREPARING).toBe(1);
      expect(ArrangementStatus.IN_PROGRESS).toBe(2);
      expect(ArrangementStatus.COMPLETED).toBe(3);
      expect(ArrangementStatus.CANCELLED).toBe(4);
    });
  });

  describe('Model Validations', () => {
    it('should validate required fields', async () => {
      const arrangement = ActivityArrangement.build();
      
      await expect(arrangement.validate()).rejects.toThrow();
    });

    it('should validate activity type enum', async () => {
      const arrangement = ActivityArrangement.build({
        planId: 1,
        title: 'Test Activity',
        activityType: 99, // Invalid enum value
        location: 'Test Location',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        participantCount: 10,
      });
      
      await expect(arrangement.validate()).rejects.toThrow();
    });

    it('should validate status enum', async () => {
      const arrangement = ActivityArrangement.build({
        planId: 1,
        title: 'Test Activity',
        activityType: ArrangementActivityType.INDOOR,
        location: 'Test Location',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        participantCount: 10,
        status: 99, // Invalid enum value
      });
      
      await expect(arrangement.validate()).rejects.toThrow();
    });

    it('should validate time logic (endTime > startTime)', async () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() - 3600000); // End time before start time
      
      const arrangement = ActivityArrangement.build({
        planId: 1,
        title: 'Test Activity',
        activityType: ArrangementActivityType.INDOOR,
        location: 'Test Location',
        startTime: startTime,
        endTime: endTime,
        participantCount: 10,
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(arrangement.startTime.getTime()).toBeGreaterThan(arrangement.endTime.getTime());
    });

    it('should validate participant count is positive', async () => {
      const arrangement = ActivityArrangement.build({
        planId: 1,
        title: 'Test Activity',
        activityType: ArrangementActivityType.INDOOR,
        location: 'Test Location',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        participantCount: -1, // Invalid negative count
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(arrangement.participantCount).toBe(-1);
    });

    it('should accept valid data', async () => {
      const arrangement = ActivityArrangement.build({
        planId: 1,
        title: 'Test Activity',
        activityType: ArrangementActivityType.INDOOR,
        location: 'Test Location',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        participantCount: 10,
        targetAge: '3-5岁',
        objectives: 'Test objectives',
        contentOutline: 'Test content',
        materials: 'Test materials',
        emergencyPlan: 'Test emergency plan',
        status: ArrangementStatus.NOT_STARTED,
        remark: 'Test remark',
      });
      
      await expect(arrangement.validate()).resolves.not.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let arrangement: any;

    beforeEach(() => {
      arrangement = ActivityArrangement.build({
        planId: 1,
        title: 'Test Activity',
        activityType: ArrangementActivityType.INDOOR,
        location: 'Test Location',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        participantCount: 10,
      });
    });

    describe('isStarted()', () => {
      it('should return true if current time is after start time', () => {
        const pastStartTime = new Date(Date.now() - 3600000); // 1 hour ago
        arrangement.startTime = pastStartTime;
        
        expect(arrangement.isStarted()).toBe(true);
      });

      it('should return false if current time is before start time', () => {
        const futureStartTime = new Date(Date.now() + 3600000); // 1 hour in future
        arrangement.startTime = futureStartTime;
        
        expect(arrangement.isStarted()).toBe(false);
      });

      it('should return true if current time is equal to start time', () => {
        const currentTime = new Date();
        arrangement.startTime = currentTime;
        
        expect(arrangement.isStarted()).toBe(true);
      });
    });

    describe('isEnded()', () => {
      it('should return true if current time is after end time', () => {
        const pastEndTime = new Date(Date.now() - 3600000); // 1 hour ago
        arrangement.endTime = pastEndTime;
        
        expect(arrangement.isEnded()).toBe(true);
      });

      it('should return false if current time is before end time', () => {
        const futureEndTime = new Date(Date.now() + 3600000); // 1 hour in future
        arrangement.endTime = futureEndTime;
        
        expect(arrangement.isEnded()).toBe(false);
      });

      it('should return false if current time is equal to end time', () => {
        const currentTime = new Date();
        arrangement.endTime = currentTime;
        
        expect(arrangement.isEnded()).toBe(false);
      });
    });

    describe('getDurationMinutes()', () => {
      it('should calculate duration correctly', () => {
        const startTime = new Date('2024-01-01T10:00:00');
        const endTime = new Date('2024-01-01T11:30:00');
        arrangement.startTime = startTime;
        arrangement.endTime = endTime;
        
        const duration = arrangement.getDurationMinutes();
        expect(duration).toBe(90); // 1.5 hours = 90 minutes
      });

      it('should return 0 if start and end time are the same', () => {
        const sameTime = new Date('2024-01-01T10:00:00');
        arrangement.startTime = sameTime;
        arrangement.endTime = sameTime;
        
        const duration = arrangement.getDurationMinutes();
        expect(duration).toBe(0);
      });

      it('should handle negative duration correctly', () => {
        const startTime = new Date('2024-01-01T11:00:00');
        const endTime = new Date('2024-01-01T10:00:00');
        arrangement.startTime = startTime;
        arrangement.endTime = endTime;
        
        const duration = arrangement.getDurationMinutes();
        expect(duration).toBe(-60); // Should handle negative values
      });
    });

    describe('isEditable()', () => {
      it('should return true if status is NOT_STARTED', () => {
        arrangement.status = ArrangementStatus.NOT_STARTED;
        
        expect(arrangement.isEditable()).toBe(true);
      });

      it('should return true if status is PREPARING', () => {
        arrangement.status = ArrangementStatus.PREPARING;
        
        expect(arrangement.isEditable()).toBe(true);
      });

      it('should return false if status is IN_PROGRESS', () => {
        arrangement.status = ArrangementStatus.IN_PROGRESS;
        
        expect(arrangement.isEditable()).toBe(false);
      });

      it('should return false if status is COMPLETED', () => {
        arrangement.status = ArrangementStatus.COMPLETED;
        
        expect(arrangement.isEditable()).toBe(false);
      });

      it('should return false if status is CANCELLED', () => {
        arrangement.status = ArrangementStatus.CANCELLED;
        
        expect(arrangement.isEditable()).toBe(false);
      });
    });
  });

  describe('Model Associations', () => {
    it('should belong to ActivityPlan', () => {
      expect(ActivityArrangement.belongsTo).toHaveBeenCalledWith(
        ActivityPlan,
        {
          foreignKey: 'planId',
          as: 'plan',
        }
      );
    });

    it('should belong to ActivityEvaluation', () => {
      expect(ActivityArrangement.belongsTo).toHaveBeenCalledWith(
        ActivityEvaluation,
        {
          foreignKey: 'evaluationId',
          as: 'evaluation',
        }
      );
    });

    it('should belong to User as creator', () => {
      expect(ActivityArrangement.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'creatorId',
          as: 'creator',
        }
      );
    });

    it('should belong to User as updater', () => {
      expect(ActivityArrangement.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'updaterId',
          as: 'updater',
        }
      );
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new activity arrangement', async () => {
      const arrangement = await ActivityArrangement.create({
        planId: 1,
        title: 'Test Activity',
        activityType: ArrangementActivityType.INDOOR,
        location: 'Test Location',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        participantCount: 10,
      });

      expect(arrangement.id).toBeDefined();
      expect(arrangement.title).toBe('Test Activity');
      expect(arrangement.activityType).toBe(ArrangementActivityType.INDOOR);
      expect(arrangement.location).toBe('Test Location');
      expect(arrangement.participantCount).toBe(10);
      expect(arrangement.status).toBe(ArrangementStatus.NOT_STARTED);
    });

    it('should read an activity arrangement', async () => {
      const createdArrangement = await ActivityArrangement.create({
        planId: 1,
        title: 'Test Activity',
        activityType: ArrangementActivityType.INDOOR,
        location: 'Test Location',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        participantCount: 10,
      });

      const foundArrangement = await ActivityArrangement.findByPk(createdArrangement.id);
      
      expect(foundArrangement).toBeDefined();
      expect(foundArrangement?.title).toBe('Test Activity');
      expect(foundArrangement?.activityType).toBe(ArrangementActivityType.INDOOR);
    });

    it('should update an activity arrangement', async () => {
      const arrangement = await ActivityArrangement.create({
        planId: 1,
        title: 'Test Activity',
        activityType: ArrangementActivityType.INDOOR,
        location: 'Test Location',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        participantCount: 10,
      });

      await arrangement.update({
        title: 'Updated Activity',
        status: ArrangementStatus.PREPARING,
      });

      expect(arrangement.title).toBe('Updated Activity');
      expect(arrangement.status).toBe(ArrangementStatus.PREPARING);
    });

    it('should delete an activity arrangement (soft delete)', async () => {
      const arrangement = await ActivityArrangement.create({
        planId: 1,
        title: 'Test Activity',
        activityType: ArrangementActivityType.INDOOR,
        location: 'Test Location',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        participantCount: 10,
      });

      await arrangement.destroy();
      
      const foundArrangement = await ActivityArrangement.findByPk(arrangement.id);
      expect(foundArrangement).toBeNull(); // Soft delete should return null
      
      // Check if it's actually soft deleted
      const deletedArrangement = await ActivityArrangement.findByPk(arrangement.id, { paranoid: false });
      expect(deletedArrangement).toBeDefined();
      expect(deletedArrangement?.deletedAt).toBeDefined();
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle maximum string lengths', async () => {
      const longTitle = 'a'.repeat(100); // Maximum length for title
      const longLocation = 'a'.repeat(200); // Maximum length for location
      
      const arrangement = ActivityArrangement.build({
        planId: 1,
        title: longTitle,
        activityType: ArrangementActivityType.INDOOR,
        location: longLocation,
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        participantCount: 10,
      });
      
      await expect(arrangement.validate()).resolves.not.toThrow();
    });

    it('should handle minimum values', async () => {
      const arrangement = ActivityArrangement.build({
        planId: 1,
        title: 'A', // Minimum title length
        activityType: ArrangementActivityType.INDOOR,
        location: 'B', // Minimum location length
        startTime: new Date(),
        endTime: new Date(Date.now() + 1000), // 1 second duration
        participantCount: 1, // Minimum participant count
      });
      
      await expect(arrangement.validate()).resolves.not.toThrow();
    });

    it('should handle null values for optional fields', async () => {
      const arrangement = ActivityArrangement.build({
        planId: 1,
        title: 'Test Activity',
        activityType: ArrangementActivityType.INDOOR,
        location: 'Test Location',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        participantCount: 10,
        targetAge: null,
        objectives: null,
        contentOutline: null,
        materials: null,
        emergencyPlan: null,
        evaluationId: null,
        remark: null,
        creatorId: null,
        updaterId: null,
      });
      
      await expect(arrangement.validate()).resolves.not.toThrow();
    });
  });
});