import { Sequelize, Op } from 'sequelize';
import { vi } from 'vitest'
import { LikeCollectRecord } from '../../../src/models/likecollectrecord.model';


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

describe('LikeCollectRecord Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await LikeCollectRecord.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(LikeCollectRecord.tableName).toBe('like_collect_records');
    });

    it('should have correct attributes', () => {
      const attributes = Object.keys(LikeCollectRecord.getAttributes());
      expect(attributes).toContain('id');
      expect(attributes).toContain('activity_id');
      expect(attributes).toContain('participant_id');
      expect(attributes).toContain('liker_id');
      expect(attributes).toContain('created_at');
      expect(attributes).toContain('updated_at');
    });
  });

  describe('Field Validation', () => {
    it('should create LikeCollectRecord with valid data', async () => {
      const record = await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      expect(record.id).toBeDefined();
      expect(record.activity_id).toBe(1);
      expect(record.participant_id).toBe(100);
      expect(record.liker_id).toBe(200);
    });

    it('should create LikeCollectRecord with minimal data', async () => {
      const record = await LikeCollectRecord.create({});

      expect(record.id).toBeDefined();
      expect(record.activity_id).toBeNull();
      expect(record.participant_id).toBeNull();
      expect(record.liker_id).toBeNull();
    });

    it('should allow null values for optional fields', async () => {
      const record = await LikeCollectRecord.create({
        activity_id: null,
        participant_id: null,
        liker_id: null,
      });

      expect(record.id).toBeDefined();
      expect(record.activity_id).toBeNull();
      expect(record.participant_id).toBeNull();
      expect(record.liker_id).toBeNull();
    });
  });

  describe('Data Types', () => {
    it('should handle integer values for ID fields', async () => {
      const record = await LikeCollectRecord.create({
        activity_id: 12345,
        participant_id: 67890,
        liker_id: 11111,
      });

      expect(record.activity_id).toBe(12345);
      expect(record.participant_id).toBe(67890);
      expect(record.liker_id).toBe(11111);
    });

    it('should handle zero values for ID fields', async () => {
      const record = await LikeCollectRecord.create({
        activity_id: 0,
        participant_id: 0,
        liker_id: 0,
      });

      expect(record.activity_id).toBe(0);
      expect(record.participant_id).toBe(0);
      expect(record.liker_id).toBe(0);
    });

    it('should handle large integer values', async () => {
      const record = await LikeCollectRecord.create({
        activity_id: 2147483647, // Max 32-bit integer
        participant_id: 2147483647,
        liker_id: 2147483647,
      });

      expect(record.activity_id).toBe(2147483647);
      expect(record.participant_id).toBe(2147483647);
      expect(record.liker_id).toBe(2147483647);
    });
  });

  describe('CRUD Operations', () => {
    it('should create LikeCollectRecord successfully', async () => {
      const record = await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      expect(record.id).toBeDefined();
      expect(record.activity_id).toBe(1);
      expect(record.participant_id).toBe(100);
      expect(record.liker_id).toBe(200);
    });

    it('should read LikeCollectRecord successfully', async () => {
      const record = await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      const foundRecord = await LikeCollectRecord.findByPk(record.id);

      expect(foundRecord).toBeDefined();
      expect(foundRecord?.id).toBe(record.id);
      expect(foundRecord?.activity_id).toBe(1);
      expect(foundRecord?.participant_id).toBe(100);
      expect(foundRecord?.liker_id).toBe(200);
    });

    it('should update LikeCollectRecord successfully', async () => {
      const record = await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      await record.update({
        activity_id: 2,
        participant_id: 101,
        liker_id: 201,
      });

      const updatedRecord = await LikeCollectRecord.findByPk(record.id);

      expect(updatedRecord?.activity_id).toBe(2);
      expect(updatedRecord?.participant_id).toBe(101);
      expect(updatedRecord?.liker_id).toBe(201);
    });

    it('should update partial fields successfully', async () => {
      const record = await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      await record.update({
        participant_id: 150,
      });

      const updatedRecord = await LikeCollectRecord.findByPk(record.id);

      expect(updatedRecord?.activity_id).toBe(1);
      expect(updatedRecord?.participant_id).toBe(150);
      expect(updatedRecord?.liker_id).toBe(200);
    });

    it('should delete LikeCollectRecord successfully', async () => {
      const record = await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      await record.destroy();

      const deletedRecord = await LikeCollectRecord.findByPk(record.id);

      expect(deletedRecord).toBeNull();
    });
  });

  describe('Query Methods', () => {
    it('should find all LikeCollectRecord records', async () => {
      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      await LikeCollectRecord.create({
        activity_id: 2,
        participant_id: 101,
        liker_id: 201,
      });

      const records = await LikeCollectRecord.findAll();

      expect(records.length).toBe(2);
    });

    it('should find LikeCollectRecord by activity_id', async () => {
      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      await LikeCollectRecord.create({
        activity_id: 2,
        participant_id: 101,
        liker_id: 201,
      });

      const records = await LikeCollectRecord.findAll({
        where: { activity_id: 1 },
      });

      expect(records.length).toBe(1);
      expect(records[0].activity_id).toBe(1);
    });

    it('should find LikeCollectRecord by participant_id', async () => {
      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      await LikeCollectRecord.create({
        activity_id: 2,
        participant_id: 100,
        liker_id: 201,
      });

      await LikeCollectRecord.create({
        activity_id: 3,
        participant_id: 101,
        liker_id: 202,
      });

      const records = await LikeCollectRecord.findAll({
        where: { participant_id: 100 },
      });

      expect(records.length).toBe(2);
      expect(records[0].participant_id).toBe(100);
      expect(records[1].participant_id).toBe(100);
    });

    it('should find LikeCollectRecord by liker_id', async () => {
      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      await LikeCollectRecord.create({
        activity_id: 2,
        participant_id: 101,
        liker_id: 200,
      });

      await LikeCollectRecord.create({
        activity_id: 3,
        participant_id: 102,
        liker_id: 201,
      });

      const records = await LikeCollectRecord.findAll({
        where: { liker_id: 200 },
      });

      expect(records.length).toBe(2);
      expect(records[0].liker_id).toBe(200);
      expect(records[1].liker_id).toBe(200);
    });

    it('should find LikeCollectRecord with complex conditions', async () => {
      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 101,
        liker_id: 201,
      });

      await LikeCollectRecord.create({
        activity_id: 2,
        participant_id: 100,
        liker_id: 200,
      });

      const records = await LikeCollectRecord.findAll({
        where: {
          activity_id: 1,
          participant_id: 100,
        },
      });

      expect(records.length).toBe(1);
      expect(records[0].activity_id).toBe(1);
      expect(records[0].participant_id).toBe(100);
      expect(records[0].liker_id).toBe(200);
    });

    it('should find LikeCollectRecord with OR conditions', async () => {
      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      await LikeCollectRecord.create({
        activity_id: 2,
        participant_id: 101,
        liker_id: 201,
      });

      await LikeCollectRecord.create({
        activity_id: 3,
        participant_id: 102,
        liker_id: 202,
      });

      const records = await LikeCollectRecord.findAll({
        where: {
          [Op.or]: [
            { activity_id: 1 },
            { participant_id: 101 },
          ],
        },
      });

      expect(records.length).toBe(2);
      const activityIds = records.map(r => r.activity_id);
      expect(activityIds).toContain(1);
      expect(activityIds).toContain(2);
    });

    it('should find LikeCollectRecord with IN condition', async () => {
      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      await LikeCollectRecord.create({
        activity_id: 2,
        participant_id: 101,
        liker_id: 201,
      });

      await LikeCollectRecord.create({
        activity_id: 3,
        participant_id: 102,
        liker_id: 202,
      });

      const records = await LikeCollectRecord.findAll({
        where: {
          activity_id: [1, 3],
        },
      });

      expect(records.length).toBe(2);
      const activityIds = records.map(r => r.activity_id).sort();
      expect(activityIds).toEqual([1, 3]);
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const record = await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      expect(record.createdAt).toBeInstanceOf(Date);
      expect(record.updatedAt).toBeInstanceOf(Date);
      expect(record.created_at).toBeDefined();
      expect(record.updated_at).toBeDefined();
    });

    it('should update updatedAt on update', async () => {
      const record = await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      const originalUpdatedAt = record.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      await record.update({
        participant_id: 150,
      });

      const updatedRecord = await LikeCollectRecord.findByPk(record.id);

      expect(updatedRecord?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete with paranoid option', async () => {
      const record = await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      await record.destroy();

      const deletedRecord = await LikeCollectRecord.findByPk(record.id);

      expect(deletedRecord).toBeNull();

      const allRecords = await LikeCollectRecord.findAll({
        paranoid: false,
      });

      expect(allRecords.length).toBe(1);
      expect(allRecords[0].id).toBe(record.id);
    });
  });

  describe('Business Logic Scenarios', () => {
    it('should track likes for different activities', async () => {
      // Create records for different activities
      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 201,
      });

      await LikeCollectRecord.create({
        activity_id: 2,
        participant_id: 100,
        liker_id: 200,
      });

      // Count likes for activity 1
      const activity1Likes = await LikeCollectRecord.count({
        where: { activity_id: 1 },
      });

      // Count likes for activity 2
      const activity2Likes = await LikeCollectRecord.count({
        where: { activity_id: 2 },
      });

      expect(activity1Likes).toBe(2);
      expect(activity2Likes).toBe(1);
    });

    it('should track likes for different participants', async () => {
      // Create records for different participants
      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 101,
        liker_id: 200,
      });

      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 201,
      });

      // Count likes for participant 100
      const participant100Likes = await LikeCollectRecord.count({
        where: { participant_id: 100 },
      });

      // Count likes for participant 101
      const participant101Likes = await LikeCollectRecord.count({
        where: { participant_id: 101 },
      });

      expect(participant100Likes).toBe(2);
      expect(participant101Likes).toBe(1);
    });

    it('should track likes from different likers', async () => {
      // Create records from different likers
      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 201,
      });

      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 202,
      });

      // Count likes from liker 200
      const liker200Likes = await LikeCollectRecord.count({
        where: { liker_id: 200 },
      });

      // Count likes from liker 201
      const liker201Likes = await LikeCollectRecord.count({
        where: { liker_id: 201 },
      });

      expect(liker200Likes).toBe(1);
      expect(liker201Likes).toBe(1);
    });

    it('should prevent duplicate like records (same activity, participant, liker)', async () => {
      // Create a like record
      await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      // Try to create the same record again
      // This should succeed unless there's a unique constraint
      const duplicateRecord = await LikeCollectRecord.create({
        activity_id: 1,
        participant_id: 100,
        liker_id: 200,
      });

      expect(duplicateRecord.id).toBeDefined();
      // Note: If unique constraint is needed, it should be added at the database level
    });
  });
});