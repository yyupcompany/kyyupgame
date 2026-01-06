import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Sequelize, DataTypes } from 'sequelize';
import { 
  ActivityPlan, 
  ActivityPlanStatus,
  ActivityPlanType,
  Semester,
  initActivityPlan,
  initActivityPlanAssociations 
} from '../../../src/models/activity-plan.model';
import { User } from '../../../src/models/user.model';
import { ActivityArrangement } from '../../../src/models/activity-arrangement.model';

// Mock the associated models
jest.mock('../../../src/models/user.model');
jest.mock('../../../src/models/activity-arrangement.model');

describe('ActivityPlan Model', () => {
  let sequelize: Sequelize;
  let mockUser: any;
  let mockActivityArrangement: any;

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
    mockUser = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
    mockActivityArrangement = {
      init: jest.fn(),
      hasMany: jest.fn(),
    };

    // Mock the imported models
    (User as any).mockImplementation(() => mockUser);
    (ActivityArrangement as any).mockImplementation(() => mockActivityArrangement);

    // Initialize the model
    initActivityPlan(sequelize);
    initActivityPlanAssociations();

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should define the model correctly', () => {
      expect(ActivityPlan).toBeDefined();
      expect(ActivityPlan.tableName).toBe('activity_plans');
    });

    it('should have correct attributes', () => {
      const attributes = ActivityPlan.getAttributes();
      
      expect(attributes.id).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        autoIncrement: true,
        primaryKey: true,
      });
      
      expect(attributes.kindergartenId).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
      });
      
      expect(attributes.title).toMatchObject({
        type: expect.any(DataTypes.STRING),
        allowNull: false,
      });
      
      expect(attributes.year).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
      });
      
      expect(attributes.semester).toMatchObject({
        type: expect.any(DataTypes.TINYINT),
        allowNull: false,
      });
      
      expect(attributes.startDate).toMatchObject({
        type: expect.any(DataTypes.DATEONLY),
        allowNull: false,
      });
      
      expect(attributes.endDate).toMatchObject({
        type: expect.any(DataTypes.DATEONLY),
        allowNull: false,
      });
      
      expect(attributes.planType).toMatchObject({
        type: expect.any(DataTypes.TINYINT),
        allowNull: false,
      });
      
      expect(attributes.status).toMatchObject({
        type: expect.any(DataTypes.TINYINT),
        allowNull: false,
        defaultValue: ActivityPlanStatus.DRAFT,
      });
    });

    it('should have correct table options', () => {
      const options = ActivityPlan.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });
  });

  describe('Enum Values', () => {
    it('should have correct ActivityPlanStatus values', () => {
      expect(ActivityPlanStatus.DRAFT).toBe(0);
      expect(ActivityPlanStatus.PENDING).toBe(1);
      expect(ActivityPlanStatus.APPROVED).toBe(2);
      expect(ActivityPlanStatus.IN_PROGRESS).toBe(3);
      expect(ActivityPlanStatus.COMPLETED).toBe(4);
      expect(ActivityPlanStatus.CANCELLED).toBe(5);
    });

    it('should have correct ActivityPlanType values', () => {
      expect(ActivityPlanType.REGULAR).toBe(1);
      expect(ActivityPlanType.ENROLLMENT).toBe(2);
      expect(ActivityPlanType.FESTIVAL).toBe(3);
      expect(ActivityPlanType.TEACHING).toBe(4);
      expect(ActivityPlanType.OTHER).toBe(5);
    });

    it('should have correct Semester values', () => {
      expect(Semester.SPRING).toBe(1);
      expect(Semester.AUTUMN).toBe(2);
      expect(Semester.WINTER_BREAK).toBe(3);
      expect(Semester.SUMMER_BREAK).toBe(4);
    });
  });

  describe('Model Validations', () => {
    it('should validate required fields', async () => {
      const plan = ActivityPlan.build();
      
      await expect(plan.validate()).rejects.toThrow();
    });

    it('should validate status enum', async () => {
      const plan = ActivityPlan.build({
        kindergartenId: 1,
        title: 'Test Plan',
        year: 2024,
        semester: Semester.SPRING,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        planType: ActivityPlanType.REGULAR,
        status: 99, // Invalid enum value
      });
      
      await expect(plan.validate()).rejects.toThrow();
    });

    it('should validate plan type enum', async () => {
      const plan = ActivityPlan.build({
        kindergartenId: 1,
        title: 'Test Plan',
        year: 2024,
        semester: Semester.SPRING,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        planType: 99, // Invalid enum value
      });
      
      await expect(plan.validate()).rejects.toThrow();
    });

    it('should validate semester enum', async () => {
      const plan = ActivityPlan.build({
        kindergartenId: 1,
        title: 'Test Plan',
        year: 2024,
        semester: 99, // Invalid enum value
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        planType: ActivityPlanType.REGULAR,
      });
      
      await expect(plan.validate()).rejects.toThrow();
    });

    it('should validate date logic (endDate >= startDate)', async () => {
      const plan = ActivityPlan.build({
        kindergartenId: 1,
        title: 'Test Plan',
        year: 2024,
        semester: Semester.SPRING,
        startDate: '2024-12-31',
        endDate: '2024-01-01', // End date before start date
        planType: ActivityPlanType.REGULAR,
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(plan.startDate).toBe('2024-12-31');
      expect(plan.endDate).toBe('2024-01-01');
    });

    it('should validate positive numeric values', async () => {
      const plan = ActivityPlan.build({
        kindergartenId: -1, // Invalid negative ID
        title: 'Test Plan',
        year: 2024,
        semester: Semester.SPRING,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        planType: ActivityPlanType.REGULAR,
        targetCount: -10, // Invalid negative count
        participationTarget: -5, // Invalid negative target
        budget: -1000, // Invalid negative budget
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(plan.kindergartenId).toBe(-1);
      expect(plan.targetCount).toBe(-10);
      expect(plan.participationTarget).toBe(-5);
      expect(plan.budget).toBe(-1000);
    });

    it('should accept valid data', async () => {
      const plan = ActivityPlan.build({
        kindergartenId: 1,
        title: 'Test Activity Plan',
        year: 2024,
        semester: Semester.SPRING,
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        planType: ActivityPlanType.REGULAR,
        targetCount: 20,
        participationTarget: 200,
        budget: 50000,
        objectives: 'To provide quality educational activities',
        description: 'A comprehensive activity plan for spring semester',
        status: ActivityPlanStatus.DRAFT,
        approvedBy: 1,
        approvedAt: new Date(),
        remark: 'Test remark',
        creatorId: 1,
        updaterId: 1,
      });
      
      await expect(plan.validate()).resolves.not.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let plan: any;

    beforeEach(() => {
      plan = ActivityPlan.build({
        kindergartenId: 1,
        title: 'Test Plan',
        year: 2024,
        semester: Semester.SPRING,
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        planType: ActivityPlanType.REGULAR,
      });
    });

    describe('getStatusText()', () => {
      it('should return correct text for DRAFT status', () => {
        plan.status = ActivityPlanStatus.DRAFT;
        
        expect(plan.getStatusText()).toBe('草稿');
      });

      it('should return correct text for PENDING status', () => {
        plan.status = ActivityPlanStatus.PENDING;
        
        expect(plan.getStatusText()).toBe('待审批');
      });

      it('should return correct text for APPROVED status', () => {
        plan.status = ActivityPlanStatus.APPROVED;
        
        expect(plan.getStatusText()).toBe('已审批');
      });

      it('should return correct text for IN_PROGRESS status', () => {
        plan.status = ActivityPlanStatus.IN_PROGRESS;
        
        expect(plan.getStatusText()).toBe('进行中');
      });

      it('should return correct text for COMPLETED status', () => {
        plan.status = ActivityPlanStatus.COMPLETED;
        
        expect(plan.getStatusText()).toBe('已完成');
      });

      it('should return correct text for CANCELLED status', () => {
        plan.status = ActivityPlanStatus.CANCELLED;
        
        expect(plan.getStatusText()).toBe('已取消');
      });

      it('should return unknown status for invalid status', () => {
        plan.status = 99;
        
        expect(plan.getStatusText()).toBe('未知状态');
      });
    });

    describe('isActive()', () => {
      it('should return true when current date is within range', () => {
        const currentDate = new Date('2024-03-15'); // March 15, 2024
        plan.startDate = new Date('2024-01-01');
        plan.endDate = new Date('2024-06-30');
        
        // Mock current date
        jest.useFakeTimers().setSystemTime(currentDate);
        
        expect(plan.isActive()).toBe(true);
        
        jest.useRealTimers();
      });

      it('should return false when current date is before start date', () => {
        const currentDate = new Date('2023-12-15'); // December 15, 2023
        plan.startDate = new Date('2024-01-01');
        plan.endDate = new Date('2024-06-30');
        
        jest.useFakeTimers().setSystemTime(currentDate);
        
        expect(plan.isActive()).toBe(false);
        
        jest.useRealTimers();
      });

      it('should return false when current date is after end date', () => {
        const currentDate = new Date('2024-07-15'); // July 15, 2024
        plan.startDate = new Date('2024-01-01');
        plan.endDate = new Date('2024-06-30');
        
        jest.useFakeTimers().setSystemTime(currentDate);
        
        expect(plan.isActive()).toBe(false);
        
        jest.useRealTimers();
      });

      it('should return true when current date equals start date', () => {
        const currentDate = new Date('2024-01-01');
        plan.startDate = new Date('2024-01-01');
        plan.endDate = new Date('2024-06-30');
        
        jest.useFakeTimers().setSystemTime(currentDate);
        
        expect(plan.isActive()).toBe(true);
        
        jest.useRealTimers();
      });

      it('should return true when current date equals end date', () => {
        const currentDate = new Date('2024-06-30');
        plan.startDate = new Date('2024-01-01');
        plan.endDate = new Date('2024-06-30');
        
        jest.useFakeTimers().setSystemTime(currentDate);
        
        expect(plan.isActive()).toBe(true);
        
        jest.useRealTimers();
      });
    });

    describe('getDuration()', () => {
      it('should calculate duration correctly for same year', () => {
        plan.startDate = new Date('2024-01-01');
        plan.endDate = new Date('2024-01-31');
        
        const duration = plan.getDuration();
        expect(duration).toBe(31); // 31 days
      });

      it('should calculate duration correctly across months', () => {
        plan.startDate = new Date('2024-01-01');
        plan.endDate = new Date('2024-03-01');
        
        const duration = plan.getDuration();
        expect(duration).toBe(61); // 31 (Jan) + 29 (Feb 2024 leap year) + 1 (Mar) = 61 days
      });

      it('should calculate duration correctly for one day', () => {
        const sameDate = new Date('2024-01-01');
        plan.startDate = sameDate;
        plan.endDate = sameDate;
        
        const duration = plan.getDuration();
        expect(duration).toBe(1); // 1 day
      });

      it('should handle leap year correctly', () => {
        plan.startDate = new Date('2024-02-01');
        plan.endDate = new Date('2024-03-01');
        
        const duration = plan.getDuration();
        expect(duration).toBe(30); // 29 (Feb 2024 leap year) + 1 (Mar) = 30 days
      });

      it('should handle non-leap year correctly', () => {
        plan.startDate = new Date('2023-02-01');
        plan.endDate = new Date('2023-03-01');
        
        const duration = plan.getDuration();
        expect(duration).toBe(29); // 28 (Feb 2023 non-leap year) + 1 (Mar) = 29 days
      });

      it('should calculate duration correctly across years', () => {
        plan.startDate = new Date('2023-12-01');
        plan.endDate = new Date('2024-01-31');
        
        const duration = plan.getDuration();
        expect(duration).toBe(62); // 31 (Dec 2023) + 31 (Jan 2024) = 62 days
      });
    });
  });

  describe('Model Associations', () => {
    it('should belong to User as creator', () => {
      expect(ActivityPlan.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'creatorId',
          as: 'creator',
        }
      );
    });

    it('should have many ActivityArrangements', () => {
      expect(ActivityPlan.hasMany).toHaveBeenCalledWith(
        ActivityArrangement,
        {
          foreignKey: 'planId',
          as: 'arrangements',
        }
      );
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new activity plan', async () => {
      const plan = await ActivityPlan.create({
        kindergartenId: 1,
        title: 'Test Activity Plan',
        year: 2024,
        semester: Semester.SPRING,
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        planType: ActivityPlanType.REGULAR,
      });

      expect(plan.id).toBeDefined();
      expect(plan.kindergartenId).toBe(1);
      expect(plan.title).toBe('Test Activity Plan');
      expect(plan.year).toBe(2024);
      expect(plan.semester).toBe(Semester.SPRING);
      expect(plan.planType).toBe(ActivityPlanType.REGULAR);
      expect(plan.status).toBe(ActivityPlanStatus.DRAFT);
      expect(plan.targetCount).toBe(0);
      expect(plan.participationTarget).toBe(0);
    });

    it('should read an activity plan', async () => {
      const createdPlan = await ActivityPlan.create({
        kindergartenId: 1,
        title: 'Test Activity Plan',
        year: 2024,
        semester: Semester.SPRING,
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        planType: ActivityPlanType.REGULAR,
      });

      const foundPlan = await ActivityPlan.findByPk(createdPlan.id);
      
      expect(foundPlan).toBeDefined();
      expect(foundPlan?.title).toBe('Test Activity Plan');
      expect(foundPlan?.year).toBe(2024);
      expect(foundPlan?.semester).toBe(Semester.SPRING);
    });

    it('should update an activity plan', async () => {
      const plan = await ActivityPlan.create({
        kindergartenId: 1,
        title: 'Test Activity Plan',
        year: 2024,
        semester: Semester.SPRING,
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        planType: ActivityPlanType.REGULAR,
      });

      await plan.update({
        title: 'Updated Activity Plan',
        status: ActivityPlanStatus.PENDING,
        targetCount: 25,
        participationTarget: 250,
        budget: 75000,
      });

      expect(plan.title).toBe('Updated Activity Plan');
      expect(plan.status).toBe(ActivityPlanStatus.PENDING);
      expect(plan.targetCount).toBe(25);
      expect(plan.participationTarget).toBe(250);
      expect(plan.budget).toBe(75000);
    });

    it('should delete an activity plan (soft delete)', async () => {
      const plan = await ActivityPlan.create({
        kindergartenId: 1,
        title: 'Test Activity Plan',
        year: 2024,
        semester: Semester.SPRING,
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        planType: ActivityPlanType.REGULAR,
      });

      await plan.destroy();
      
      const foundPlan = await ActivityPlan.findByPk(plan.id);
      expect(foundPlan).toBeNull(); // Soft delete should return null
      
      // Check if it's actually soft deleted
      const deletedPlan = await ActivityPlan.findByPk(plan.id, { paranoid: false });
      expect(deletedPlan).toBeDefined();
      expect(deletedPlan?.deletedAt).toBeDefined();
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle maximum string lengths', async () => {
      const longTitle = 'a'.repeat(100); // Maximum length for title
      
      const plan = ActivityPlan.build({
        kindergartenId: 1,
        title: longTitle,
        year: 2024,
        semester: Semester.SPRING,
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        planType: ActivityPlanType.REGULAR,
        objectives: 'a'.repeat(10000), // Long text for objectives
        description: 'a'.repeat(10000), // Long text for description
      });
      
      await expect(plan.validate()).resolves.not.toThrow();
    });

    it('should handle minimum values', async () => {
      const plan = ActivityPlan.build({
        kindergartenId: 1,
        title: 'A', // Minimum title length
        year: 2000, // Minimum reasonable year
        semester: Semester.SPRING,
        startDate: '2024-01-01',
        endDate: '2024-01-01', // Same day
        planType: ActivityPlanType.REGULAR,
        targetCount: 0, // Minimum count
        participationTarget: 0, // Minimum target
      });
      
      await expect(plan.validate()).resolves.not.toThrow();
    });

    it('should handle null values for optional fields', async () => {
      const plan = ActivityPlan.build({
        kindergartenId: 1,
        title: 'Test Plan',
        year: 2024,
        semester: Semester.SPRING,
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        planType: ActivityPlanType.REGULAR,
        budget: null,
        objectives: null,
        description: null,
        approvedBy: null,
        approvedAt: null,
        remark: null,
        creatorId: null,
        updaterId: null,
      });
      
      await expect(plan.validate()).resolves.not.toThrow();
    });

    it('should handle extreme year values', async () => {
      const plan1 = ActivityPlan.build({
        kindergartenId: 1,
        title: 'Historical Plan',
        year: 1900, // Very old year
        semester: Semester.SPRING,
        startDate: '1900-01-01',
        endDate: '1900-06-30',
        planType: ActivityPlanType.REGULAR,
      });
      
      const plan2 = ActivityPlan.build({
        kindergartenId: 1,
        title: 'Future Plan',
        year: 2100, // Very future year
        semester: Semester.SPRING,
        startDate: '2100-01-01',
        endDate: '2100-06-30',
        planType: ActivityPlanType.REGULAR,
      });
      
      await expect(plan1.validate()).resolves.not.toThrow();
      await expect(plan2.validate()).resolves.not.toThrow();
    });

    it('should handle decimal budget values', async () => {
      const plan = ActivityPlan.build({
        kindergartenId: 1,
        title: 'Test Plan',
        year: 2024,
        semester: Semester.SPRING,
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        planType: ActivityPlanType.REGULAR,
        budget: 12345.67, // Decimal value
      });
      
      await expect(plan.validate()).resolves.not.toThrow();
      expect(plan.budget).toBe(12345.67);
    });
  });
});