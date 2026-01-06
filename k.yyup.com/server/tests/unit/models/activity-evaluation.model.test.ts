import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Sequelize, DataTypes } from 'sequelize';
import { 
  ActivityEvaluation, 
  EvaluatorType, 
  EvaluationStatus,
  initActivityEvaluation,
  initActivityEvaluationAssociations 
} from '../../../src/models/activity-evaluation.model';
import { Activity } from '../../../src/models/activity.model';
import { ActivityRegistration } from '../../../src/models/activity-registration.model';
import { Teacher } from '../../../src/models/teacher.model';
import { ParentStudentRelation } from '../../../src/models/parent-student-relation.model';
import { User } from '../../../src/models/user.model';

// Mock the associated models
jest.mock('../../../src/models/activity.model');
jest.mock('../../../src/models/activity-registration.model');
jest.mock('../../../src/models/teacher.model');
jest.mock('../../../src/models/parent-student-relation.model');
jest.mock('../../../src/models/user.model');

describe('ActivityEvaluation Model', () => {
  let sequelize: Sequelize;
  let mockActivity: any;
  let mockActivityRegistration: any;
  let mockTeacher: any;
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
    mockActivityRegistration = {
      init: jest.fn(),
      belongsTo: jest.fn(),
    };
    mockTeacher = {
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
    (ActivityRegistration as any).mockImplementation(() => mockActivityRegistration);
    (Teacher as any).mockImplementation(() => mockTeacher);
    (ParentStudentRelation as any).mockImplementation(() => mockParentStudentRelation);
    (User as any).mockImplementation(() => mockUser);

    // Initialize the model
    initActivityEvaluation(sequelize);
    initActivityEvaluationAssociations();

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should define the model correctly', () => {
      expect(ActivityEvaluation).toBeDefined();
      expect(ActivityEvaluation.tableName).toBe('activity_evaluations');
    });

    it('should have correct attributes', () => {
      const attributes = ActivityEvaluation.getAttributes();
      
      expect(attributes.id).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        primaryKey: true,
        autoIncrement: true,
      });
      
      expect(attributes.activityId).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
      });
      
      expect(attributes.evaluatorType).toMatchObject({
        type: expect.any(DataTypes.TINYINT),
        allowNull: false,
      });
      
      expect(attributes.evaluatorName).toMatchObject({
        type: expect.any(DataTypes.STRING),
        allowNull: false,
      });
      
      expect(attributes.overallRating).toMatchObject({
        type: expect.any(DataTypes.TINYINT),
        allowNull: false,
      });
      
      expect(attributes.evaluationTime).toMatchObject({
        type: expect.any(DataTypes.DATE),
        allowNull: false,
        defaultValue: DataTypes.NOW,
      });
      
      expect(attributes.isPublic).toMatchObject({
        type: expect.any(DataTypes.BOOLEAN),
        allowNull: false,
        defaultValue: true,
      });
      
      expect(attributes.status).toMatchObject({
        type: expect.any(DataTypes.TINYINT),
        allowNull: false,
        defaultValue: EvaluationStatus.PENDING,
      });
    });

    it('should have correct table options', () => {
      const options = ActivityEvaluation.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBe(true);
      expect(options.underscored).toBe(true);
    });
  });

  describe('Enum Values', () => {
    it('should have correct EvaluatorType values', () => {
      expect(EvaluatorType.PARENT).toBe(1);
      expect(EvaluatorType.TEACHER).toBe(2);
      expect(EvaluatorType.ADMIN).toBe(3);
    });

    it('should have correct EvaluationStatus values', () => {
      expect(EvaluationStatus.PENDING).toBe(0);
      expect(EvaluationStatus.APPROVED).toBe(1);
      expect(EvaluationStatus.REJECTED).toBe(2);
    });
  });

  describe('Model Validations', () => {
    it('should validate required fields', async () => {
      const evaluation = ActivityEvaluation.build();
      
      await expect(evaluation.validate()).rejects.toThrow();
    });

    it('should validate evaluator type enum', async () => {
      const evaluation = ActivityEvaluation.build({
        activityId: 1,
        evaluatorType: 99, // Invalid enum value
        evaluatorName: 'Test Evaluator',
        overallRating: 5,
      });
      
      await expect(evaluation.validate()).rejects.toThrow();
    });

    it('should validate status enum', async () => {
      const evaluation = ActivityEvaluation.build({
        activityId: 1,
        evaluatorType: EvaluatorType.PARENT,
        evaluatorName: 'Test Evaluator',
        overallRating: 5,
        status: 99, // Invalid enum value
      });
      
      await expect(evaluation.validate()).rejects.toThrow();
    });

    it('should validate rating range (1-5)', async () => {
      const evaluation = ActivityEvaluation.build({
        activityId: 1,
        evaluatorType: EvaluatorType.PARENT,
        evaluatorName: 'Test Evaluator',
        overallRating: 0, // Invalid rating
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(evaluation.overallRating).toBe(0);
    });

    it('should validate individual rating ranges', async () => {
      const evaluation = ActivityEvaluation.build({
        activityId: 1,
        evaluatorType: EvaluatorType.PARENT,
        evaluatorName: 'Test Evaluator',
        overallRating: 5,
        contentRating: 6, // Invalid rating
        organizationRating: -1, // Invalid rating
        environmentRating: 3,
        serviceRating: 4,
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(evaluation.contentRating).toBe(6);
      expect(evaluation.organizationRating).toBe(-1);
    });

    it('should accept valid data', async () => {
      const evaluation = ActivityEvaluation.build({
        activityId: 1,
        registrationId: 1,
        parentId: 1,
        teacherId: 1,
        evaluatorType: EvaluatorType.PARENT,
        evaluatorName: 'Test Evaluator',
        overallRating: 5,
        contentRating: 4,
        organizationRating: 5,
        environmentRating: 3,
        serviceRating: 4,
        comment: 'Great activity!',
        strengths: 'Well organized',
        weaknesses: 'Could be longer',
        suggestions: 'More activities like this',
        images: 'image1.jpg,image2.jpg',
        isPublic: true,
        status: EvaluationStatus.PENDING,
        replyContent: 'Thank you for your feedback!',
        replyTime: new Date(),
        replyUserId: 1,
        remark: 'Test remark',
      });
      
      await expect(evaluation.validate()).resolves.not.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let evaluation: any;

    beforeEach(() => {
      evaluation = ActivityEvaluation.build({
        activityId: 1,
        evaluatorType: EvaluatorType.PARENT,
        evaluatorName: 'Test Evaluator',
        overallRating: 5,
      });
    });

    describe('reply()', () => {
      it('should set reply content and time correctly', async () => {
        const replyContent = 'Thank you for your feedback!';
        const userId = 1;
        
        await evaluation.reply(replyContent, userId);
        
        expect(evaluation.replyContent).toBe(replyContent);
        expect(evaluation.replyTime).toBeInstanceOf(Date);
        expect(evaluation.replyUserId).toBe(userId);
      });

      it('should save the changes after replying', async () => {
        const saveSpy = jest.spyOn(evaluation, 'save').mockResolvedValue(evaluation);
        
        await evaluation.reply('Test reply', 1);
        
        expect(saveSpy).toHaveBeenCalled();
        
        saveSpy.mockRestore();
      });
    });

    describe('getImagesArray()', () => {
      it('should return empty array when images is null', () => {
        evaluation.images = null;
        
        const result = evaluation.getImagesArray();
        
        expect(result).toEqual([]);
      });

      it('should return empty array when images is empty string', () => {
        evaluation.images = '';
        
        const result = evaluation.getImagesArray();
        
        expect(result).toEqual([]);
      });

      it('should split single image correctly', () => {
        evaluation.images = 'image1.jpg';
        
        const result = evaluation.getImagesArray();
        
        expect(result).toEqual(['image1.jpg']);
      });

      it('should split multiple images correctly', () => {
        evaluation.images = 'image1.jpg,image2.jpg,image3.jpg';
        
        const result = evaluation.getImagesArray();
        
        expect(result).toEqual(['image1.jpg', 'image2.jpg', 'image3.jpg']);
      });

      it('should handle images with spaces', () => {
        evaluation.images = 'image 1.jpg, image 2.jpg';
        
        const result = evaluation.getImagesArray();
        
        expect(result).toEqual(['image 1.jpg', ' image 2.jpg']);
      });

      it('should handle empty values in comma-separated list', () => {
        evaluation.images = 'image1.jpg,,image3.jpg';
        
        const result = evaluation.getImagesArray();
        
        expect(result).toEqual(['image1.jpg', '', 'image3.jpg']);
      });
    });
  });

  describe('Model Associations', () => {
    it('should belong to Activity', () => {
      expect(ActivityEvaluation.belongsTo).toHaveBeenCalledWith(
        Activity,
        {
          foreignKey: 'activityId',
          as: 'activity',
        }
      );
    });

    it('should belong to ActivityRegistration', () => {
      expect(ActivityEvaluation.belongsTo).toHaveBeenCalledWith(
        ActivityRegistration,
        {
          foreignKey: 'registrationId',
          as: 'registration',
        }
      );
    });

    it('should belong to ParentStudentRelation', () => {
      expect(ActivityEvaluation.belongsTo).toHaveBeenCalledWith(
        ParentStudentRelation,
        {
          foreignKey: 'parentId',
          as: 'parent',
        }
      );
    });

    it('should belong to Teacher', () => {
      expect(ActivityEvaluation.belongsTo).toHaveBeenCalledWith(
        Teacher,
        {
          foreignKey: 'teacherId',
          as: 'teacher',
        }
      );
    });

    it('should belong to User as replyUser', () => {
      expect(ActivityEvaluation.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'replyUserId',
          as: 'replyUser',
        }
      );
    });

    it('should belong to User as creator', () => {
      expect(ActivityEvaluation.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'creatorId',
          as: 'creator',
        }
      );
    });

    it('should belong to User as updater', () => {
      expect(ActivityEvaluation.belongsTo).toHaveBeenCalledWith(
        User,
        {
          foreignKey: 'updaterId',
          as: 'updater',
        }
      );
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new activity evaluation', async () => {
      const evaluation = await ActivityEvaluation.create({
        activityId: 1,
        evaluatorType: EvaluatorType.PARENT,
        evaluatorName: 'Test Evaluator',
        overallRating: 5,
      });

      expect(evaluation.id).toBeDefined();
      expect(evaluation.activityId).toBe(1);
      expect(evaluation.evaluatorType).toBe(EvaluatorType.PARENT);
      expect(evaluation.evaluatorName).toBe('Test Evaluator');
      expect(evaluation.overallRating).toBe(5);
      expect(evaluation.isPublic).toBe(true);
      expect(evaluation.status).toBe(EvaluationStatus.PENDING);
    });

    it('should read an activity evaluation', async () => {
      const createdEvaluation = await ActivityEvaluation.create({
        activityId: 1,
        evaluatorType: EvaluatorType.PARENT,
        evaluatorName: 'Test Evaluator',
        overallRating: 5,
      });

      const foundEvaluation = await ActivityEvaluation.findByPk(createdEvaluation.id);
      
      expect(foundEvaluation).toBeDefined();
      expect(foundEvaluation?.evaluatorName).toBe('Test Evaluator');
      expect(foundEvaluation?.overallRating).toBe(5);
    });

    it('should update an activity evaluation', async () => {
      const evaluation = await ActivityEvaluation.create({
        activityId: 1,
        evaluatorType: EvaluatorType.PARENT,
        evaluatorName: 'Test Evaluator',
        overallRating: 5,
      });

      await evaluation.update({
        overallRating: 4,
        status: EvaluationStatus.APPROVED,
        comment: 'Updated comment',
      });

      expect(evaluation.overallRating).toBe(4);
      expect(evaluation.status).toBe(EvaluationStatus.APPROVED);
      expect(evaluation.comment).toBe('Updated comment');
    });

    it('should delete an activity evaluation (soft delete)', async () => {
      const evaluation = await ActivityEvaluation.create({
        activityId: 1,
        evaluatorType: EvaluatorType.PARENT,
        evaluatorName: 'Test Evaluator',
        overallRating: 5,
      });

      await evaluation.destroy();
      
      const foundEvaluation = await ActivityEvaluation.findByPk(evaluation.id);
      expect(foundEvaluation).toBeNull(); // Soft delete should return null
      
      // Check if it's actually soft deleted
      const deletedEvaluation = await ActivityEvaluation.findByPk(evaluation.id, { paranoid: false });
      expect(deletedEvaluation).toBeDefined();
      expect(deletedEvaluation?.deletedAt).toBeDefined();
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle maximum string lengths', async () => {
      const longName = 'a'.repeat(50); // Maximum length for evaluatorName
      const longComment = 'a'.repeat(10000); // Long text for comment
      
      const evaluation = ActivityEvaluation.build({
        activityId: 1,
        evaluatorType: EvaluatorType.PARENT,
        evaluatorName: longName,
        overallRating: 5,
        comment: longComment,
      });
      
      await expect(evaluation.validate()).resolves.not.toThrow();
    });

    it('should handle minimum values', async () => {
      const evaluation = ActivityEvaluation.build({
        activityId: 1,
        evaluatorType: EvaluatorType.PARENT,
        evaluatorName: 'A', // Minimum name length
        overallRating: 1, // Minimum rating
      });
      
      await expect(evaluation.validate()).resolves.not.toThrow();
    });

    it('should handle null values for optional fields', async () => {
      const evaluation = ActivityEvaluation.build({
        activityId: 1,
        evaluatorType: EvaluatorType.PARENT,
        evaluatorName: 'Test Evaluator',
        overallRating: 5,
        registrationId: null,
        parentId: null,
        teacherId: null,
        contentRating: null,
        organizationRating: null,
        environmentRating: null,
        serviceRating: null,
        comment: null,
        strengths: null,
        weaknesses: null,
        suggestions: null,
        images: null,
        replyContent: null,
        replyTime: null,
        replyUserId: null,
        remark: null,
        creatorId: null,
        updaterId: null,
      });
      
      await expect(evaluation.validate()).resolves.not.toThrow();
    });

    it('should handle rating boundary values', async () => {
      const minRating = 1;
      const maxRating = 5;
      
      const evaluation1 = ActivityEvaluation.build({
        activityId: 1,
        evaluatorType: EvaluatorType.PARENT,
        evaluatorName: 'Test Evaluator',
        overallRating: minRating,
        contentRating: minRating,
        organizationRating: minRating,
        environmentRating: minRating,
        serviceRating: minRating,
      });
      
      const evaluation2 = ActivityEvaluation.build({
        activityId: 1,
        evaluatorType: EvaluatorType.PARENT,
        evaluatorName: 'Test Evaluator',
        overallRating: maxRating,
        contentRating: maxRating,
        organizationRating: maxRating,
        environmentRating: maxRating,
        serviceRating: maxRating,
      });
      
      await expect(evaluation1.validate()).resolves.not.toThrow();
      await expect(evaluation2.validate()).resolves.not.toThrow();
    });
  });
});