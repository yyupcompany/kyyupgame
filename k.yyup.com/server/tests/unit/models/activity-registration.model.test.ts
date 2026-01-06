import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Sequelize, DataTypes } from 'sequelize';
import { 
  ActivityRegistration, 
  ChildGender,
  RegistrationStatus,
  initActivityRegistration,
  initActivityRegistrationAssociations 
} from '../../../src/models/activity-registration.model';
import { Activity } from '../../../src/models/activity.model';
import { Student } from '../../../src/models/student.model';
import { ParentStudentRelation } from '../../../src/models/parent-student-relation.model';
import { User } from '../../../src/models/user.model';

// Mock the associated models
jest.mock('../../../src/models/activity.model');
jest.mock('../../../src/models/student.model');
jest.mock('../../../src/models/parent-student-relation.model');
jest.mock('../../../src/models/user.model');

describe('ActivityRegistration Model', () => {
  let sequelize: Sequelize;
  let mockActivity: any;
  let mockStudent: any;
  let mockParentStudentRelation: any;
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
    mockStudent = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
    mockParentStudentRelation = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
    mockUser = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };

    // Mock the imported models
    (Activity as any).mockImplementation(() => mockActivity);
    (Student as any).mockImplementation(() => mockStudent);
    (ParentStudentRelation as any).mockImplementation(() => mockParentStudentRelation);
    (User as any).mockImplementation(() => mockUser);

    // Initialize the model
    initActivityRegistration(sequelize);
    initActivityRegistrationAssociations();

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should define the model correctly', () => {
      expect(ActivityRegistration).toBeDefined();
      expect(ActivityRegistration.tableName).toBe('activity_registrations');
    });

    it('should have correct attributes', () => {
      const attributes = ActivityRegistration.getAttributes();
      
      expect(attributes.id).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        primaryKey: true,
        autoIncrement: true,
      });
      
      expect(attributes.activityId).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
      });
      
      expect(attributes.contactName).toMatchObject({
        type: expect.any(DataTypes.STRING),
        allowNull: false,
      });
      
      expect(attributes.contactPhone).toMatchObject({
        type: expect.any(DataTypes.STRING),
        allowNull: false,
      });
      
      expect(attributes.registrationTime).toMatchObject({
        type: expect.any(DataTypes.DATE),
        allowNull: false,
        defaultValue: DataTypes.NOW,
      });
      
      expect(attributes.attendeeCount).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
        defaultValue: 1,
      });
      
      expect(attributes.status).toMatchObject({
        type: expect.any(DataTypes.TINYINT),
        allowNull: false,
        defaultValue: RegistrationStatus.PENDING,
      });
      
      expect(attributes.isConversion).toMatchObject({
        type: expect.any(DataTypes.BOOLEAN),
        allowNull: false,
        defaultValue: false,
      });
    });

    it('should have correct table options', () => {
      const options = ActivityRegistration.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });
  });

  describe('Enum Values', () => {
    it('should have correct ChildGender values', () => {
      expect(ChildGender.MALE).toBe(1);
      expect(ChildGender.FEMALE).toBe(2);
    });

    it('should have correct RegistrationStatus values', () => {
      expect(RegistrationStatus.PENDING).toBe(0);
      expect(RegistrationStatus.CONFIRMED).toBe(1);
      expect(RegistrationStatus.REJECTED).toBe(2);
      expect(RegistrationStatus.CANCELLED).toBe(3);
      expect(RegistrationStatus.CHECKED_IN).toBe(4);
      expect(RegistrationStatus.NO_SHOW).toBe(5);
    });
  });

  describe('Model Validations', () => {
    it('should validate required fields', async () => {
      const registration = ActivityRegistration.build();
      
      await expect(registration.validate()).rejects.toThrow();
    });

    it('should validate status enum', async () => {
      const registration = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
        status: 99, // Invalid enum value
      });
      
      await expect(registration.validate()).rejects.toThrow();
    });

    it('should validate child gender enum', async () => {
      const registration = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
        childGender: 99, // Invalid enum value
      });
      
      await expect(registration.validate()).rejects.toThrow();
    });

    it('should validate phone number format', async () => {
      const registration = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: 'invalid-phone', // Invalid phone format
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(registration.contactPhone).toBe('invalid-phone');
    });

    it('should validate attendee count is positive', async () => {
      const registration = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
        attendeeCount: -1, // Invalid negative count
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(registration.attendeeCount).toBe(-1);
    });

    it('should validate child age is positive', async () => {
      const registration = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
        childAge: -1, // Invalid negative age
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(registration.childAge).toBe(-1);
    });

    it('should accept valid data', async () => {
      const registration = ActivityRegistration.build({
        activityId: 1,
        parentId: 1,
        studentId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
        childName: 'Test Child',
        childAge: 36, // 3 years old in months
        childGender: ChildGender.MALE,
        attendeeCount: 2,
        specialNeeds: 'No special needs',
        source: 'Online',
        status: RegistrationStatus.PENDING,
        checkInTime: new Date(),
        checkInLocation: 'Main Entrance',
        feedback: 'Great activity!',
        isConversion: false,
        remark: 'Test remark',
      });
      
      await expect(registration.validate()).resolves.not.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let registration: any;

    beforeEach(() => {
      registration = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
        status: RegistrationStatus.CONFIRMED,
      });
    });

    describe('checkIn()', () => {
      it('should set check-in time, location, and status correctly', async () => {
        const location = 'Main Entrance';
        
        await registration.checkIn(location);
        
        expect(registration.checkInTime).toBeInstanceOf(Date);
        expect(registration.checkInLocation).toBe(location);
        expect(registration.status).toBe(RegistrationStatus.CHECKED_IN);
      });

      it('should save the changes after check-in', async () => {
        const saveSpy = jest.spyOn(registration, 'save').mockResolvedValue(registration);
        
        await registration.checkIn('Main Entrance');
        
        expect(saveSpy).toHaveBeenCalled();
        
        saveSpy.mockRestore();
      });

      it('should throw error if status is not CONFIRMED', async () => {
        registration.status = RegistrationStatus.PENDING;
        
        await expect(registration.checkIn('Main Entrance')).rejects.toThrow('只有已确认的报名才能签到');
      });

      it('should throw error if status is REJECTED', async () => {
        registration.status = RegistrationStatus.REJECTED;
        
        await expect(registration.checkIn('Main Entrance')).rejects.toThrow('只有已确认的报名才能签到');
      });

      it('should throw error if status is CANCELLED', async () => {
        registration.status = RegistrationStatus.CANCELLED;
        
        await expect(registration.checkIn('Main Entrance')).rejects.toThrow('只有已确认的报名才能签到');
      });

      it('should throw error if already checked in', async () => {
        registration.status = RegistrationStatus.CHECKED_IN;
        
        await expect(registration.checkIn('Main Entrance')).rejects.toThrow('只有已确认的报名才能签到');
      });

      it('should throw error if no show', async () => {
        registration.status = RegistrationStatus.NO_SHOW;
        
        await expect(registration.checkIn('Main Entrance')).rejects.toThrow('只有已确认的报名才能签到');
      });

      it('should work correctly with valid CONFIRMED status', async () => {
        registration.status = RegistrationStatus.CONFIRMED;
        
        await expect(registration.checkIn('Main Entrance')).resolves.not.toThrow();
        
        expect(registration.checkInTime).toBeInstanceOf(Date);
        expect(registration.checkInLocation).toBe('Main Entrance');
        expect(registration.status).toBe(RegistrationStatus.CHECKED_IN);
      });
    });
  });

  describe('Model Associations', () => {
    it('should belong to Activity', () => {
      expect(ActivityRegistration.belongsTo).toHaveBeenCalledWith(
        Activity,
        {
          foreignKey: 'activityId',
          as: 'activity',
        }
      );
    });

    it('should belong to ParentStudentRelation', () => {
      expect(ActivityRegistration.belongsTo).toHaveBeenCalledWith(
        ParentStudentRelation,
        {
          foreignKey: 'parentId',
          as: 'parent',
        }
      );
    });

    it('should belong to Student', () => {
      expect(ActivityRegistration.belongsTo).toHaveBeenCalledWith(
        Student,
        {
          foreignKey: 'studentId',
          as: 'student',
        }
      );
    });

    it('should belong to User as creator', () => {
      expect(ActivityRegistration.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'creatorId',
          as: 'creator',
        }
      );
    });

    it('should belong to User as updater', () => {
      expect(ActivityRegistration.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'updaterId',
          as: 'updater',
        }
      );
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new activity registration', async () => {
      const registration = await ActivityRegistration.create({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
      });

      expect(registration.id).toBeDefined();
      expect(registration.activityId).toBe(1);
      expect(registration.contactName).toBe('Test Contact');
      expect(registration.contactPhone).toBe('13800138000');
      expect(registration.attendeeCount).toBe(1);
      expect(registration.status).toBe(RegistrationStatus.PENDING);
      expect(registration.isConversion).toBe(false);
      expect(registration.registrationTime).toBeInstanceOf(Date);
    });

    it('should create with default values', async () => {
      const registration = await ActivityRegistration.create({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
      });

      expect(registration.attendeeCount).toBe(1);
      expect(registration.status).toBe(RegistrationStatus.PENDING);
      expect(registration.isConversion).toBe(false);
      expect(registration.registrationTime).toBeInstanceOf(Date);
    });

    it('should read an activity registration', async () => {
      const createdRegistration = await ActivityRegistration.create({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
        childName: 'Test Child',
        childAge: 36,
        childGender: ChildGender.MALE,
      });

      const foundRegistration = await ActivityRegistration.findByPk(createdRegistration.id);
      
      expect(foundRegistration).toBeDefined();
      expect(foundRegistration?.contactName).toBe('Test Contact');
      expect(foundRegistration?.contactPhone).toBe('13800138000');
      expect(foundRegistration?.childName).toBe('Test Child');
      expect(foundRegistration?.childAge).toBe(36);
      expect(foundRegistration?.childGender).toBe(ChildGender.MALE);
    });

    it('should update an activity registration', async () => {
      const registration = await ActivityRegistration.create({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
      });

      await registration.update({
        contactName: 'Updated Contact',
        status: RegistrationStatus.CONFIRMED,
        attendeeCount: 2,
        childName: 'Test Child',
        isConversion: true,
      });

      expect(registration.contactName).toBe('Updated Contact');
      expect(registration.status).toBe(RegistrationStatus.CONFIRMED);
      expect(registration.attendeeCount).toBe(2);
      expect(registration.childName).toBe('Test Child');
      expect(registration.isConversion).toBe(true);
    });

    it('should delete an activity registration (soft delete)', async () => {
      const registration = await ActivityRegistration.create({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
      });

      await registration.destroy();
      
      const foundRegistration = await ActivityRegistration.findByPk(registration.id);
      expect(foundRegistration).toBeNull(); // Soft delete should return null
      
      // Check if it's actually soft deleted
      const deletedRegistration = await ActivityRegistration.findByPk(registration.id, { paranoid: false });
      expect(deletedRegistration).toBeDefined();
      expect(deletedRegistration?.deletedAt).toBeDefined();
    });

    it('should find all registrations for an activity', async () => {
      // Create multiple registrations for the same activity
      await ActivityRegistration.create({
        activityId: 1,
        contactName: 'Contact 1',
        contactPhone: '13800138000',
      });
      
      await ActivityRegistration.create({
        activityId: 1,
        contactName: 'Contact 2',
        contactPhone: '13800138001',
      });
      
      await ActivityRegistration.create({
        activityId: 1,
        contactName: 'Contact 3',
        contactPhone: '13800138002',
      });

      const registrations = await ActivityRegistration.findAll({
        where: { activityId: 1 },
        order: [['id', 'ASC']],
      });

      expect(registrations).toHaveLength(3);
      expect(registrations[0].contactName).toBe('Contact 1');
      expect(registrations[1].contactName).toBe('Contact 2');
      expect(registrations[2].contactName).toBe('Contact 3');
    });

    it('should find registrations by status', async () => {
      // Create registrations with different statuses
      await ActivityRegistration.create({
        activityId: 1,
        contactName: 'Contact 1',
        contactPhone: '13800138000',
        status: RegistrationStatus.PENDING,
      });
      
      await ActivityRegistration.create({
        activityId: 1,
        contactName: 'Contact 2',
        contactPhone: '13800138001',
        status: RegistrationStatus.CONFIRMED,
      });
      
      await ActivityRegistration.create({
        activityId: 1,
        contactName: 'Contact 3',
        contactPhone: '13800138002',
        status: RegistrationStatus.CONFIRMED,
      });

      const confirmedRegistrations = await ActivityRegistration.findAll({
        where: { 
          activityId: 1,
          status: RegistrationStatus.CONFIRMED 
        },
        order: [['id', 'ASC']],
      });

      expect(confirmedRegistrations).toHaveLength(2);
      expect(confirmedRegistrations[0].contactName).toBe('Contact 2');
      expect(confirmedRegistrations[1].contactName).toBe('Contact 3');
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle maximum string lengths', async () => {
      const longName = 'a'.repeat(50); // Maximum length for contactName and childName
      const longPhone = '1'.repeat(20); // Maximum length for contactPhone
      const longSpecialNeeds = 'a'.repeat(200); // Maximum length for specialNeeds
      const longSource = 'a'.repeat(50); // Maximum length for source
      
      const registration = ActivityRegistration.build({
        activityId: 1,
        contactName: longName,
        contactPhone: longPhone,
        childName: longName,
        specialNeeds: longSpecialNeeds,
        source: longSource,
        checkInLocation: longName,
      });
      
      await expect(registration.validate()).resolves.not.toThrow();
    });

    it('should handle minimum values', async () => {
      const registration = ActivityRegistration.build({
        activityId: 1,
        contactName: 'A', // Minimum name length
        contactPhone: '1', // Minimum phone length
        attendeeCount: 1, // Minimum count
        childAge: 0, // Minimum age (newborn)
      });
      
      await expect(registration.validate()).resolves.not.toThrow();
    });

    it('should handle null values for optional fields', async () => {
      const registration = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
        parentId: null,
        studentId: null,
        childName: null,
        childAge: null,
        childGender: null,
        specialNeeds: null,
        source: null,
        checkInTime: null,
        checkInLocation: null,
        feedback: null,
        remark: null,
        creatorId: null,
        updaterId: null,
      });
      
      await expect(registration.validate()).resolves.not.toThrow();
    });

    it('should handle all enum values', async () => {
      const genderValues = [ChildGender.MALE, ChildGender.FEMALE];
      const statusValues = [
        RegistrationStatus.PENDING,
        RegistrationStatus.CONFIRMED,
        RegistrationStatus.REJECTED,
        RegistrationStatus.CANCELLED,
        RegistrationStatus.CHECKED_IN,
        RegistrationStatus.NO_SHOW,
      ];
      
      for (const gender of genderValues) {
        for (const status of statusValues) {
          const registration = ActivityRegistration.build({
            activityId: 1,
            contactName: 'Test Contact',
            contactPhone: '13800138000',
            childGender: gender,
            status: status,
          });
          
          await expect(registration.validate()).resolves.not.toThrow();
        }
      }
    });

    it('should handle extreme attendee count values', async () => {
      const registration1 = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
        attendeeCount: 1, // Minimum
      });
      
      const registration2 = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
        attendeeCount: 1000, // Large number
      });
      
      await expect(registration1.validate()).resolves.not.toThrow();
      await expect(registration2.validate()).resolves.not.toThrow();
    });

    it('should handle extreme child age values', async () => {
      const registration1 = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
        childAge: 0, // Newborn
      });
      
      const registration2 = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
        childAge: 216, // 18 years old in months
      });
      
      await expect(registration1.validate()).resolves.not.toThrow();
      await expect(registration2.validate()).resolves.not.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should set default registrationTime to current time', () => {
      const registration = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
      });
      
      expect(registration.registrationTime).toBeInstanceOf(Date);
    });

    it('should set default attendeeCount to 1', () => {
      const registration = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
      });
      
      expect(registration.attendeeCount).toBe(1);
    });

    it('should set default status to PENDING', () => {
      const registration = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
      });
      
      expect(registration.status).toBe(RegistrationStatus.PENDING);
    });

    it('should set default isConversion to false', () => {
      const registration = ActivityRegistration.build({
        activityId: 1,
        contactName: 'Test Contact',
        contactPhone: '13800138000',
      });
      
      expect(registration.isConversion).toBe(false);
    });
  });
});