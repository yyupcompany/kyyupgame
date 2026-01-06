import { Sequelize, Op } from 'sequelize';
import { vi } from 'vitest'
import { ParentFollowup } from '../../../src/models/parent-followup.model';
import { ParentStudentRelation } from '../../../src/models/parent-student-relation.model';
import { User } from '../../../src/models/user.model';


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

describe('ParentFollowup Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    // Initialize related models
    User.initModel(sequelize);
    ParentStudentRelation.initModel(sequelize);
    ParentFollowup.initModel(sequelize);
    ParentFollowup.initAssociations();
    
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await ParentFollowup.destroy({ where: {} });
    await ParentStudentRelation.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(ParentFollowup.tableName).toBe('parent_followups');
    });

    it('should have correct attributes', () => {
      const attributes = Object.keys(ParentFollowup.getAttributes());
      expect(attributes).toContain('id');
      expect(attributes).toContain('parentId');
      expect(attributes).toContain('content');
      expect(attributes).toContain('followupDate');
      expect(attributes).toContain('followupType');
      expect(attributes).toContain('result');
      expect(attributes).toContain('nextFollowupDate');
      expect(attributes).toContain('createdBy');
    });
  });

  describe('Field Validation', () => {
    it('should require parentId', async () => {
      const followup = ParentFollowup.build({
        content: 'Test followup content',
        followupDate: new Date(),
        followupType: 'phone',
        createdBy: 1,
      } as any);

      await expect(followup.save()).rejects.toThrow();
    });

    it('should require content', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const followup = ParentFollowup.build({
        parentId: parentRelation.id,
        followupDate: new Date(),
        followupType: 'phone',
        createdBy: 1,
      } as any);

      await expect(followup.save()).rejects.toThrow();
    });

    it('should require followupDate', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const followup = ParentFollowup.build({
        parentId: parentRelation.id,
        content: 'Test followup content',
        followupType: 'phone',
        createdBy: 1,
      } as any);

      await expect(followup.save()).rejects.toThrow();
    });

    it('should require followupType', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const followup = ParentFollowup.build({
        parentId: parentRelation.id,
        content: 'Test followup content',
        followupDate: new Date(),
        createdBy: 1,
      } as any);

      await expect(followup.save()).rejects.toThrow();
    });

    it('should require createdBy', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const followup = ParentFollowup.build({
        parentId: parentRelation.id,
        content: 'Test followup content',
        followupDate: new Date(),
        followupType: 'phone',
      } as any);

      await expect(followup.save()).rejects.toThrow();
    });

    it('should create ParentFollowup with valid data', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const followup = await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Test followup content',
        followupDate: new Date('2023-01-15'),
        followupType: 'phone',
        result: 'Parent agreed to meeting',
        nextFollowupDate: new Date('2023-01-22'),
        createdBy: creator.id,
      });

      expect(followup.id).toBeDefined();
      expect(followup.parentId).toBe(parentRelation.id);
      expect(followup.content).toBe('Test followup content');
      expect(followup.followupDate).toEqual(new Date('2023-01-15'));
      expect(followup.followupType).toBe('phone');
      expect(followup.result).toBe('Parent agreed to meeting');
      expect(followup.nextFollowupDate).toEqual(new Date('2023-01-22'));
      expect(followup.createdBy).toBe(creator.id);
    });

    it('should create ParentFollowup with minimal data', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const followup = await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Test followup content',
        followupDate: new Date(),
        followupType: 'phone',
        createdBy: creator.id,
      });

      expect(followup.id).toBeDefined();
      expect(followup.result).toBeNull();
      expect(followup.nextFollowupDate).toBeNull();
    });
  });

  describe('Data Types', () => {
    it('should handle string content', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const contents = [
        'Short content',
        'This is a longer followup content with more details about the conversation and next steps',
        'a'.repeat(500), // Long content
      ];

      for (const content of contents) {
        const followup = await ParentFollowup.create({
          parentId: parentRelation.id,
          content,
          followupDate: new Date(),
          followupType: 'phone',
          createdBy: creator.id,
        });

        expect(followup.content).toBe(content);
      }
    });

    it('should handle followupType values', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const followupTypes = [
        'phone',
        'visit',
        'meeting',
        'email',
        'other',
      ];

      for (const followupType of followupTypes) {
        const followup = await ParentFollowup.create({
          parentId: parentRelation.id,
          content: `Test ${followupType} followup`,
          followupDate: new Date(),
          followupType,
          createdBy: creator.id,
        });

        expect(followup.followupType).toBe(followupType);
      }
    });

    it('should handle result values', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const results = [
        'Successful meeting',
        'Parent not available',
        'Rescheduled for next week',
        'No response',
        'a'.repeat(500), // Long result
      ];

      for (const result of results) {
        const followup = await ParentFollowup.create({
          parentId: parentRelation.id,
          content: 'Test followup content',
          followupDate: new Date(),
          followupType: 'phone',
          result,
          createdBy: creator.id,
        });

        expect(followup.result).toBe(result);
      }
    });

    it('should handle DATEONLY values for followupDate', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const dates = [
        new Date('2023-01-01'),
        new Date('2023-12-31'),
        new Date(), // Today
      ];

      for (const date of dates) {
        const followup = await ParentFollowup.create({
          parentId: parentRelation.id,
          content: 'Test followup content',
          followupDate: date,
          followupType: 'phone',
          createdBy: creator.id,
        });

        expect(followup.followupDate).toEqual(date);
      }
    });

    it('should handle DATEONLY values for nextFollowupDate', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const dates = [
        new Date('2023-01-01'),
        new Date('2023-12-31'),
        new Date(), // Today
        null, // Optional field
      ];

      for (const date of dates) {
        const followup = await ParentFollowup.create({
          parentId: parentRelation.id,
          content: 'Test followup content',
          followupDate: new Date(),
          followupType: 'phone',
          nextFollowupDate: date,
          createdBy: creator.id,
        });

        expect(followup.nextFollowupDate).toBe(date);
      }
    });
  });

  describe('String Field Lengths', () => {
    it('should handle followupType within length limit', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const longType = 'a'.repeat(50); // Max length for followupType

      const followup = await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Test followup content',
        followupDate: new Date(),
        followupType: longType,
        createdBy: creator.id,
      });

      expect(followup.followupType).toBe(longType);
    });

    it('should handle result within length limit', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const longResult = 'a'.repeat(500); // Max length for result

      const followup = await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Test followup content',
        followupDate: new Date(),
        followupType: 'phone',
        result: longResult,
        createdBy: creator.id,
      });

      expect(followup.result).toBe(longResult);
    });
  });

  describe('Associations', () => {
    it('should belong to parent', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const followup = await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Test followup content',
        followupDate: new Date(),
        followupType: 'phone',
        createdBy: creator.id,
      });

      const followupWithParent = await ParentFollowup.findByPk(followup.id, {
        include: ['parent'],
      });

      expect(followupWithParent?.parent).toBeDefined();
      expect(followupWithParent?.parent?.id).toBe(parentRelation.id);
    });

    it('should belong to creator', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const followup = await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Test followup content',
        followupDate: new Date(),
        followupType: 'phone',
        createdBy: creator.id,
      });

      const followupWithCreator = await ParentFollowup.findByPk(followup.id, {
        include: ['creator'],
      });

      expect(followupWithCreator?.creator).toBeDefined();
      expect(followupWithCreator?.creator?.id).toBe(creator.id);
      expect(followupWithCreator?.creator?.username).toBe('creator');
    });
  });

  describe('Model Methods', () => {
    describe('needsFollowup', () => {
      it('should return false when nextFollowupDate is null', async () => {
        const parentRelation = await ParentStudentRelation.create({
          userId: 1,
          studentId: 1,
          relationship: 'father',
        });

        const creator = await User.create({
          username: 'creator',
          email: 'creator@test.com',
          password: 'password123',
          role: 'teacher',
        });

        const followup = await ParentFollowup.create({
          parentId: parentRelation.id,
          content: 'Test followup content',
          followupDate: new Date(),
          followupType: 'phone',
          createdBy: creator.id,
        });

        expect(followup.needsFollowup()).toBe(false);
      });

      it('should return true when nextFollowupDate is in the future', async () => {
        const parentRelation = await ParentStudentRelation.create({
          userId: 1,
          studentId: 1,
          relationship: 'father',
        });

        const creator = await User.create({
          username: 'creator',
          email: 'creator@test.com',
          password: 'password123',
          role: 'teacher',
        });

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7); // 7 days from now

        const followup = await ParentFollowup.create({
          parentId: parentRelation.id,
          content: 'Test followup content',
          followupDate: new Date(),
          followupType: 'phone',
          nextFollowupDate: futureDate,
          createdBy: creator.id,
        });

        expect(followup.needsFollowup()).toBe(true);
      });

      it('should return false when nextFollowupDate is in the past', async () => {
        const parentRelation = await ParentStudentRelation.create({
          userId: 1,
          studentId: 1,
          relationship: 'father',
        });

        const creator = await User.create({
          username: 'creator',
          email: 'creator@test.com',
          password: 'password123',
          role: 'teacher',
        });

        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 7); // 7 days ago

        const followup = await ParentFollowup.create({
          parentId: parentRelation.id,
          content: 'Test followup content',
          followupDate: new Date(),
          followupType: 'phone',
          nextFollowupDate: pastDate,
          createdBy: creator.id,
        });

        expect(followup.needsFollowup()).toBe(false);
      });

      it('should return false when nextFollowupDate is today', async () => {
        const parentRelation = await ParentStudentRelation.create({
          userId: 1,
          studentId: 1,
          relationship: 'father',
        });

        const creator = await User.create({
          username: 'creator',
          email: 'creator@test.com',
          password: 'password123',
          role: 'teacher',
        });

        const today = new Date();

        const followup = await ParentFollowup.create({
          parentId: parentRelation.id,
          content: 'Test followup content',
          followupDate: new Date(),
          followupType: 'phone',
          nextFollowupDate: today,
          createdBy: creator.id,
        });

        expect(followup.needsFollowup()).toBe(false);
      });
    });

    describe('daysUntilNextFollowup', () => {
      it('should return null when nextFollowupDate is null', async () => {
        const parentRelation = await ParentStudentRelation.create({
          userId: 1,
          studentId: 1,
          relationship: 'father',
        });

        const creator = await User.create({
          username: 'creator',
          email: 'creator@test.com',
          password: 'password123',
          role: 'teacher',
        });

        const followup = await ParentFollowup.create({
          parentId: parentRelation.id,
          content: 'Test followup content',
          followupDate: new Date(),
          followupType: 'phone',
          createdBy: creator.id,
        });

        expect(followup.daysUntilNextFollowup()).toBeNull();
      });

      it('should return positive number when nextFollowupDate is in the future', async () => {
        const parentRelation = await ParentStudentRelation.create({
          userId: 1,
          studentId: 1,
          relationship: 'father',
        });

        const creator = await User.create({
          username: 'creator',
          email: 'creator@test.com',
          password: 'password123',
          role: 'teacher',
        });

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7); // 7 days from now

        const followup = await ParentFollowup.create({
          parentId: parentRelation.id,
          content: 'Test followup content',
          followupDate: new Date(),
          followupType: 'phone',
          nextFollowupDate: futureDate,
          createdBy: creator.id,
        });

        const daysUntil = followup.daysUntilNextFollowup();
        expect(daysUntil).toBeGreaterThan(0);
        expect(daysUntil).toBeLessThanOrEqual(7);
      });

      it('should return null when nextFollowupDate is in the past', async () => {
        const parentRelation = await ParentStudentRelation.create({
          userId: 1,
          studentId: 1,
          relationship: 'father',
        });

        const creator = await User.create({
          username: 'creator',
          email: 'creator@test.com',
          password: 'password123',
          role: 'teacher',
        });

        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 7); // 7 days ago

        const followup = await ParentFollowup.create({
          parentId: parentRelation.id,
          content: 'Test followup content',
          followupDate: new Date(),
          followupType: 'phone',
          nextFollowupDate: pastDate,
          createdBy: creator.id,
        });

        expect(followup.daysUntilNextFollowup()).toBeNull();
      });

      it('should return null when nextFollowupDate is today', async () => {
        const parentRelation = await ParentStudentRelation.create({
          userId: 1,
          studentId: 1,
          relationship: 'father',
        });

        const creator = await User.create({
          username: 'creator',
          email: 'creator@test.com',
          password: 'password123',
          role: 'teacher',
        });

        const today = new Date();

        const followup = await ParentFollowup.create({
          parentId: parentRelation.id,
          content: 'Test followup content',
          followupDate: new Date(),
          followupType: 'phone',
          nextFollowupDate: today,
          createdBy: creator.id,
        });

        expect(followup.daysUntilNextFollowup()).toBeNull();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should create ParentFollowup successfully', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const followup = await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Test followup content',
        followupDate: new Date(),
        followupType: 'phone',
        createdBy: creator.id,
      });

      expect(followup.id).toBeDefined();
      expect(followup.parentId).toBe(parentRelation.id);
      expect(followup.content).toBe('Test followup content');
      expect(followup.followupType).toBe('phone');
      expect(followup.createdBy).toBe(creator.id);
    });

    it('should read ParentFollowup successfully', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const followup = await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Test followup content',
        followupDate: new Date(),
        followupType: 'phone',
        createdBy: creator.id,
      });

      const foundFollowup = await ParentFollowup.findByPk(followup.id);

      expect(foundFollowup).toBeDefined();
      expect(foundFollowup?.id).toBe(followup.id);
      expect(foundFollowup?.content).toBe('Test followup content');
      expect(foundFollowup?.followupType).toBe('phone');
    });

    it('should update ParentFollowup successfully', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const followup = await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Test followup content',
        followupDate: new Date(),
        followupType: 'phone',
        createdBy: creator.id,
      });

      await followup.update({
        content: 'Updated followup content',
        followupType: 'visit',
        result: 'Successful visit',
        nextFollowupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });

      const updatedFollowup = await ParentFollowup.findByPk(followup.id);

      expect(updatedFollowup?.content).toBe('Updated followup content');
      expect(updatedFollowup?.followupType).toBe('visit');
      expect(updatedFollowup?.result).toBe('Successful visit');
      expect(updatedFollowup?.nextFollowupDate).toBeInstanceOf(Date);
    });

    it('should delete ParentFollowup successfully', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const followup = await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Test followup content',
        followupDate: new Date(),
        followupType: 'phone',
        createdBy: creator.id,
      });

      await followup.destroy();

      const deletedFollowup = await ParentFollowup.findByPk(followup.id);

      expect(deletedFollowup).toBeNull();
    });
  });

  describe('Query Methods', () => {
    it('should find ParentFollowup by parentId', async () => {
      const parentRelation1 = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const parentRelation2 = await ParentStudentRelation.create({
        userId: 2,
        studentId: 2,
        relationship: 'mother',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      await ParentFollowup.create({
        parentId: parentRelation1.id,
        content: 'Followup for parent 1',
        followupDate: new Date(),
        followupType: 'phone',
        createdBy: creator.id,
      });

      await ParentFollowup.create({
        parentId: parentRelation2.id,
        content: 'Followup for parent 2',
        followupDate: new Date(),
        followupType: 'phone',
        createdBy: creator.id,
      });

      const parent1Followups = await ParentFollowup.findAll({
        where: { parentId: parentRelation1.id },
      });

      const parent2Followups = await ParentFollowup.findAll({
        where: { parentId: parentRelation2.id },
      });

      expect(parent1Followups.length).toBe(1);
      expect(parent2Followups.length).toBe(1);
      expect(parent1Followups[0].content).toBe('Followup for parent 1');
      expect(parent2Followups[0].content).toBe('Followup for parent 2');
    });

    it('should find ParentFollowup by followupType', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Phone followup',
        followupDate: new Date(),
        followupType: 'phone',
        createdBy: creator.id,
      });

      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Visit followup',
        followupDate: new Date(),
        followupType: 'visit',
        createdBy: creator.id,
      });

      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Meeting followup',
        followupDate: new Date(),
        followupType: 'meeting',
        createdBy: creator.id,
      });

      const phoneFollowups = await ParentFollowup.findAll({
        where: { followupType: 'phone' },
      });

      const visitFollowups = await ParentFollowup.findAll({
        where: { followupType: 'visit' },
      });

      const meetingFollowups = await ParentFollowup.findAll({
        where: { followupType: 'meeting' },
      });

      expect(phoneFollowups.length).toBe(1);
      expect(visitFollowups.length).toBe(1);
      expect(meetingFollowups.length).toBe(1);
      expect(phoneFollowups[0].content).toBe('Phone followup');
      expect(visitFollowups[0].content).toBe('Visit followup');
      expect(meetingFollowups[0].content).toBe('Meeting followup');
    });

    it('should find ParentFollowup by createdBy', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator1 = await User.create({
        username: 'creator1',
        email: 'creator1@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const creator2 = await User.create({
        username: 'creator2',
        email: 'creator2@test.com',
        password: 'password123',
        role: 'teacher',
      });

      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Followup by creator 1',
        followupDate: new Date(),
        followupType: 'phone',
        createdBy: creator1.id,
      });

      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Followup by creator 2',
        followupDate: new Date(),
        followupType: 'phone',
        createdBy: creator2.id,
      });

      const creator1Followups = await ParentFollowup.findAll({
        where: { createdBy: creator1.id },
      });

      const creator2Followups = await ParentFollowup.findAll({
        where: { createdBy: creator2.id },
      });

      expect(creator1Followups.length).toBe(1);
      expect(creator2Followups.length).toBe(1);
      expect(creator1Followups[0].content).toBe('Followup by creator 1');
      expect(creator2Followups[0].content).toBe('Followup by creator 2');
    });

    it('should find ParentFollowup by date range', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Yesterday followup',
        followupDate: yesterday,
        followupType: 'phone',
        createdBy: creator.id,
      });

      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Today followup',
        followupDate: today,
        followupType: 'phone',
        createdBy: creator.id,
      });

      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Tomorrow followup',
        followupDate: tomorrow,
        followupType: 'phone',
        createdBy: creator.id,
      });

      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Next week followup',
        followupDate: nextWeek,
        followupType: 'phone',
        createdBy: creator.id,
      });

      const thisWeekFollowups = await ParentFollowup.findAll({
        where: {
          followupDate: {
            [Op.between]: [yesterday, tomorrow],
          },
        },
      });

      const futureFollowups = await ParentFollowup.findAll({
        where: {
          followupDate: {
            [Op.gt]: today,
          },
        },
      });

      expect(thisWeekFollowups.length).toBe(3); // yesterday, today, tomorrow
      expect(futureFollowups.length).toBe(2); // tomorrow, next week
    });

    it('should find ParentFollowup with nextFollowupDate conditions', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Followup with no next date',
        followupDate: today,
        followupType: 'phone',
        createdBy: creator.id,
      });

      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Followup with tomorrow next date',
        followupDate: today,
        followupType: 'phone',
        nextFollowupDate: tomorrow,
        createdBy: creator.id,
      });

      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Followup with next week next date',
        followupDate: today,
        followupType: 'phone',
        nextFollowupDate: nextWeek,
        createdBy: creator.id,
      });

      const followupsWithNextDate = await ParentFollowup.findAll({
        where: {
          nextFollowupDate: {
            [Op.not]: null,
          },
        },
      });

      const upcomingFollowups = await ParentFollowup.findAll({
        where: {
          nextFollowupDate: {
            [Op.gte]: today,
          },
        },
      });

      expect(followupsWithNextDate.length).toBe(2);
      expect(upcomingFollowups.length).toBe(2);
    });
  });

  describe('Business Logic Scenarios', () => {
    it('should track followup history for a parent', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      // Create a series of followups
      const followup1 = await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Initial contact',
        followupDate: new Date('2023-01-01'),
        followupType: 'phone',
        result: 'Parent interested',
        nextFollowupDate: new Date('2023-01-08'),
        createdBy: creator.id,
      });

      const followup2 = await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Follow up meeting',
        followupDate: new Date('2023-01-08'),
        followupType: 'visit',
        result: 'Meeting scheduled',
        nextFollowupDate: new Date('2023-01-15'),
        createdBy: creator.id,
      });

      const followup3 = await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Final discussion',
        followupDate: new Date('2023-01-15'),
        followupType: 'meeting',
        result: 'Agreement reached',
        createdBy: creator.id,
      });

      const parentFollowups = await ParentFollowup.findAll({
        where: { parentId: parentRelation.id },
        order: [['followupDate', 'ASC']],
      });

      expect(parentFollowups.length).toBe(3);
      expect(parentFollowups[0].content).toBe('Initial contact');
      expect(parentFollowups[1].content).toBe('Follow up meeting');
      expect(parentFollowups[2].content).toBe('Final discussion');
    });

    it('should identify followups that need attention', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Create followups with different next dates
      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Needs attention soon',
        followupDate: today,
        followupType: 'phone',
        nextFollowupDate: tomorrow,
        createdBy: creator.id,
      });

      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'No next followup needed',
        followupDate: today,
        followupType: 'phone',
        createdBy: creator.id,
      });

      await ParentFollowup.create({
        parentId: parentRelation.id,
        content: 'Future followup',
        followupDate: today,
        followupType: 'phone',
        nextFollowupDate: nextWeek,
        createdBy: creator.id,
      });

      const allFollowups = await ParentFollowup.findAll({
        where: { parentId: parentRelation.id },
      });

      const needingFollowup = allFollowups.filter(f => f.needsFollowup());
      const withDaysUntil = allFollowups
        .map(f => ({
          content: f.content,
          daysUntil: f.daysUntilNextFollowup(),
        }))
        .filter(item => item.daysUntil !== null);

      expect(needingFollowup.length).toBe(2); // tomorrow and next week
      expect(withDaysUntil.length).toBe(2);
    });

    it('should handle different followup types appropriately', async () => {
      const parentRelation = await ParentStudentRelation.create({
        userId: 1,
        studentId: 1,
        relationship: 'father',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'teacher',
      });

      const followupTypes = [
        { type: 'phone', expectedContent: 'Phone conversation about student progress' },
        { type: 'visit', expectedContent: 'Home visit to discuss family situation' },
        { type: 'meeting', expectedContent: 'School meeting with parents' },
        { type: 'email', expectedContent: 'Email followup with documentation' },
        { type: 'other', expectedContent: 'Other type of followup' },
      ];

      for (const { type, expectedContent } of followupTypes) {
        await ParentFollowup.create({
          parentId: parentRelation.id,
          content: expectedContent,
          followupDate: new Date(),
          followupType: type,
          createdBy: creator.id,
        });
      }

      const phoneFollowups = await ParentFollowup.findAll({
        where: { followupType: 'phone' },
      });

      const visitFollowups = await ParentFollowup.findAll({
        where: { followupType: 'visit' },
      });

      const meetingFollowups = await ParentFollowup.findAll({
        where: { followupType: 'meeting' },
      });

      expect(phoneFollowups.length).toBe(1);
      expect(visitFollowups.length).toBe(1);
      expect(meetingFollowups.length).toBe(1);
      expect(phoneFollowups[0].content).toContain('Phone conversation');
      expect(visitFollowups[0].content).toContain('Home visit');
      expect(meetingFollowups[0].content).toContain('School meeting');
    });
  });
});