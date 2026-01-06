import { ReferralRelationship } from '../../../src/models/referralrelationship.model';
import { vi } from 'vitest'
import { sequelize } from '../../../src/init';


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

describe('ReferralRelationship Model', () => {
  beforeAll(async () => {
    // 确保数据库连接正常
    await sequelize.authenticate();
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should be defined', () => {
      expect(ReferralRelationship).toBeDefined();
    });

    it('should have correct model name', () => {
      expect(ReferralRelationship.name).toBe('ReferralRelationship');
    });

    it('should have correct table name', () => {
      expect(ReferralRelationship.tableName).toBe('referral_relationships');
    });

    it('should have timestamps enabled', () => {
      expect(ReferralRelationship.options.timestamps).toBe(true);
    });

    it('should have underscored enabled', () => {
      expect(ReferralRelationship.options.underscored).toBe(true);
    });

    it('should have paranoid enabled', () => {
      expect(ReferralRelationship.options.paranoid).toBe(true);
    });
  });

  describe('Model Attributes', () => {
    it('should have correct id attribute', () => {
      const idAttribute = ReferralRelationship.getAttributes().id;
      expect(idAttribute).toBeDefined();
      expect(idAttribute.type.constructor.name).toBe('INTEGER');
      expect(idAttribute.allowNull).toBe(false);
      expect(idAttribute.primaryKey).toBe(true);
      expect(idAttribute.autoIncrement).toBe(true);
    });

    it('should have correct activity_id attribute', () => {
      const activityIdAttribute = ReferralRelationship.getAttributes().activity_id;
      expect(activityIdAttribute).toBeDefined();
      expect(activityIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(activityIdAttribute.allowNull).toBe(true);
    });

    it('should have correct referrer_id attribute', () => {
      const referrerIdAttribute = ReferralRelationship.getAttributes().referrer_id;
      expect(referrerIdAttribute).toBeDefined();
      expect(referrerIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(referrerIdAttribute.allowNull).toBe(true);
    });

    it('should have correct referee_id attribute', () => {
      const refereeIdAttribute = ReferralRelationship.getAttributes().referee_id;
      expect(refereeIdAttribute).toBeDefined();
      expect(refereeIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(refereeIdAttribute.allowNull).toBe(true);
    });

    it('should have correct referral_code attribute', () => {
      const referralCodeAttribute = ReferralRelationship.getAttributes().referral_code;
      expect(referralCodeAttribute).toBeDefined();
      expect(referralCodeAttribute.type.constructor.name).toBe('STRING');
      expect(referralCodeAttribute.allowNull).toBe(true);
    });

    it('should have correct status attribute', () => {
      const statusAttribute = ReferralRelationship.getAttributes().status;
      expect(statusAttribute).toBeDefined();
      expect(statusAttribute.type.constructor.name).toBe('STRING');
      expect(statusAttribute.allowNull).toBe(true);
    });

    it('should have correct reward_amount attribute', () => {
      const rewardAmountAttribute = ReferralRelationship.getAttributes().reward_amount;
      expect(rewardAmountAttribute).toBeDefined();
      expect(rewardAmountAttribute.type.constructor.name).toBe('STRING');
      expect(rewardAmountAttribute.allowNull).toBe(true);
    });

    it('should have correct created_at attribute', () => {
      const createdAtAttribute = ReferralRelationship.getAttributes().created_at;
      expect(createdAtAttribute).toBeDefined();
      expect(createdAtAttribute.type.constructor.name).toBe('DATE');
      expect(createdAtAttribute.allowNull).toBe(true);
    });

    it('should have correct completed_at attribute', () => {
      const completedAtAttribute = ReferralRelationship.getAttributes().completed_at;
      expect(completedAtAttribute).toBeDefined();
      expect(completedAtAttribute.type.constructor.name).toBe('STRING');
      expect(completedAtAttribute.allowNull).toBe(true);
    });

    it('should have correct rewarded_at attribute', () => {
      const rewardedAtAttribute = ReferralRelationship.getAttributes().rewarded_at;
      expect(rewardedAtAttribute).toBeDefined();
      expect(rewardedAtAttribute.type.constructor.name).toBe('STRING');
      expect(rewardedAtAttribute.allowNull).toBe(true);
    });
  });

  describe('Model Creation', () => {
    it('should create a new referral relationship', async () => {
      const referralRelationshipData = {
        activity_id: 1,
        referrer_id: 1,
        referee_id: 2,
        referral_code: 'TEST123',
        status: 'pending',
        reward_amount: '100',
        created_at: new Date(),
        completed_at: '',
        rewarded_at: '',
      };

      const referralRelationship = await ReferralRelationship.create(referralRelationshipData);
      
      expect(referralRelationship).toBeDefined();
      expect(referralRelationship.id).toBeDefined();
      expect(referralRelationship.activity_id).toBe(referralRelationshipData.activity_id);
      expect(referralRelationship.referrer_id).toBe(referralRelationshipData.referrer_id);
      expect(referralRelationship.referee_id).toBe(referralRelationshipData.referee_id);
      expect(referralRelationship.referral_code).toBe(referralRelationshipData.referral_code);
      expect(referralRelationship.status).toBe(referralRelationshipData.status);
      expect(referralRelationship.reward_amount).toBe(referralRelationshipData.reward_amount);
    });

    it('should create a referral relationship with minimal data', async () => {
      const minimalData = {
        referral_code: 'MINIMAL456',
      };

      const referralRelationship = await ReferralRelationship.create(minimalData);
      
      expect(referralRelationship).toBeDefined();
      expect(referralRelationship.id).toBeDefined();
      expect(referralRelationship.referral_code).toBe(minimalData.referral_code);
    });
  });

  describe('Model Validation', () => {
    it('should allow null values for optional fields', async () => {
      const referralRelationship = await ReferralRelationship.create({
        referral_code: 'NULLTEST789',
      });

      expect(referralRelationship.activity_id).toBeNull();
      expect(referralRelationship.referrer_id).toBeNull();
      expect(referralRelationship.referee_id).toBeNull();
      expect(referralRelationship.status).toBeNull();
      expect(referralRelationship.reward_amount).toBeNull();
      expect(referralRelationship.created_at).toBeNull();
      expect(referralRelationship.completed_at).toBeNull();
      expect(referralRelationship.rewarded_at).toBeNull();
    });

    it('should handle empty string values', async () => {
      const referralRelationship = await ReferralRelationship.create({
        referral_code: '',
        status: '',
        reward_amount: '',
        completed_at: '',
        rewarded_at: '',
      });

      expect(referralRelationship.referral_code).toBe('');
      expect(referralRelationship.status).toBe('');
      expect(referralRelationship.reward_amount).toBe('');
      expect(referralRelationship.completed_at).toBe('');
      expect(referralRelationship.rewarded_at).toBe('');
    });

    it('should handle different status values', async () => {
      const statuses = ['pending', 'completed', 'cancelled', 'expired'];
      
      for (const status of statuses) {
        const referralRelationship = await ReferralRelationship.create({
          referral_code: `STATUS_${status}`,
          status: status,
        });
        
        expect(referralRelationship.status).toBe(status);
      }
    });
  });

  describe('Model Updates', () => {
    it('should update referral relationship attributes', async () => {
      const referralRelationship = await ReferralRelationship.create({
        referral_code: 'UPDATETEST',
        status: 'pending',
        reward_amount: '0',
      });

      await referralRelationship.update({
        status: 'completed',
        reward_amount: '100',
        completed_at: '2025-01-15',
      });

      const updatedReferralRelationship = await ReferralRelationship.findByPk(referralRelationship.id);
      expect(updatedReferralRelationship?.status).toBe('completed');
      expect(updatedReferralRelationship?.reward_amount).toBe('100');
      expect(updatedReferralRelationship?.completed_at).toBe('2025-01-15');
    });

    it('should handle partial updates', async () => {
      const referralRelationship = await ReferralRelationship.create({
        referral_code: 'PARTIALUPDATE',
        status: 'pending',
        reward_amount: '0',
        completed_at: '',
        rewarded_at: '',
      });

      await referralRelationship.update({
        status: 'completed',
      });

      const updatedReferralRelationship = await ReferralRelationship.findByPk(referralRelationship.id);
      expect(updatedReferralRelationship?.status).toBe('completed');
      expect(updatedReferralRelationship?.reward_amount).toBe('0'); // Should remain unchanged
      expect(updatedReferralRelationship?.completed_at).toBe(''); // Should remain unchanged
      expect(updatedReferralRelationship?.rewarded_at).toBe(''); // Should remain unchanged
    });
  });

  describe('Model Queries', () => {
    it('should find referral relationship by id', async () => {
      const createdReferralRelationship = await ReferralRelationship.create({
        referral_code: 'FINDBYID',
      });

      const foundReferralRelationship = await ReferralRelationship.findByPk(createdReferralRelationship.id);
      
      expect(foundReferralRelationship).toBeDefined();
      expect(foundReferralRelationship?.id).toBe(createdReferralRelationship.id);
      expect(foundReferralRelationship?.referral_code).toBe('FINDBYID');
    });

    it('should find referral relationship by referral code', async () => {
      await ReferralRelationship.create({
        referral_code: 'FINDBYCODE',
      });

      const foundReferralRelationship = await ReferralRelationship.findOne({
        where: { referral_code: 'FINDBYCODE' },
      });
      
      expect(foundReferralRelationship).toBeDefined();
      expect(foundReferralRelationship?.referral_code).toBe('FINDBYCODE');
    });

    it('should find referral relationships by status', async () => {
      await ReferralRelationship.bulkCreate([
        { referral_code: 'STATUS1', status: 'pending' },
        { referral_code: 'STATUS2', status: 'completed' },
        { referral_code: 'STATUS3', status: 'pending' },
      ]);

      const pendingRelationships = await ReferralRelationship.findAll({
        where: { status: 'pending' },
      });
      
      expect(pendingRelationships).toHaveLength(2);
      expect(pendingRelationships.map(rr => rr.referral_code)).toContain('STATUS1');
      expect(pendingRelationships.map(rr => rr.referral_code)).toContain('STATUS3');
    });

    it('should find referral relationships by referrer', async () => {
      await ReferralRelationship.bulkCreate([
        { referral_code: 'REFERRER1', referrer_id: 1 },
        { referral_code: 'REFERRER2', referrer_id: 1 },
        { referral_code: 'REFERRER3', referrer_id: 2 },
      ]);

      const referrer1Relationships = await ReferralRelationship.findAll({
        where: { referrer_id: 1 },
      });
      
      expect(referrer1Relationships).toHaveLength(2);
      expect(referrer1Relationships.map(rr => rr.referral_code)).toContain('REFERRER1');
      expect(referrer1Relationships.map(rr => rr.referral_code)).toContain('REFERRER2');
    });
  });

  describe('Model Deletion', () => {
    it('should soft delete referral relationship', async () => {
      const referralRelationship = await ReferralRelationship.create({
        referral_code: 'SOFTDELETE',
      });

      await referralRelationship.destroy();

      const deletedReferralRelationship = await ReferralRelationship.findByPk(referralRelationship.id);
      expect(deletedReferralRelationship).toBeNull();

      // Check if it exists in paranoid mode
      const paranoidReferralRelationship = await ReferralRelationship.findByPk(referralRelationship.id, {
        paranoid: false,
      });
      expect(paranoidReferralRelationship).toBeDefined();
    });

    it('should restore soft deleted referral relationship', async () => {
      const referralRelationship = await ReferralRelationship.create({
        referral_code: 'RESTORE',
      });

      await referralRelationship.destroy();
      await referralRelationship.restore();

      const restoredReferralRelationship = await ReferralRelationship.findByPk(referralRelationship.id);
      expect(restoredReferralRelationship).toBeDefined();
      expect(restoredReferralRelationship?.referral_code).toBe('RESTORE');
    });
  });

  describe('Model Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const referralRelationship = await ReferralRelationship.create({
        referral_code: 'TIMESTAMPTEST',
      });

      expect(referralRelationship.createdAt).toBeDefined();
      expect(referralRelationship.updatedAt).toBeDefined();
      expect(referralRelationship.createdAt).toBeInstanceOf(Date);
      expect(referralRelationship.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on update', async () => {
      const referralRelationship = await ReferralRelationship.create({
        referral_code: 'TIMESTAMPUPDATE',
      });

      const originalUpdatedAt = referralRelationship.updatedAt;
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await referralRelationship.update({ status: 'completed' });
      
      expect(referralRelationship.updatedAt).toBeInstanceOf(Date);
      expect(referralRelationship.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Business Logic Tests', () => {
    it('should handle reward amount as string', async () => {
      const referralRelationship = await ReferralRelationship.create({
        referral_code: 'REWARDTEST',
        reward_amount: '150.50',
      });

      expect(referralRelationship.reward_amount).toBe('150.50');
    });

    it('should handle date fields correctly', async () => {
      const testDate = new Date();
      const referralRelationship = await ReferralRelationship.create({
        referral_code: 'DATETEST',
        created_at: testDate,
      });

      expect(referralRelationship.created_at).toBeInstanceOf(Date);
      expect(referralRelationship.created_at?.getTime()).toBe(testDate.getTime());
    });

    it('should handle string date fields', async () => {
      const referralRelationship = await ReferralRelationship.create({
        referral_code: 'STRINGDATETEST',
        completed_at: '2025-01-15',
        rewarded_at: '2025-01-20',
      });

      expect(referralRelationship.completed_at).toBe('2025-01-15');
      expect(referralRelationship.rewarded_at).toBe('2025-01-20');
    });
  });
});