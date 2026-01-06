import { ReferralReward } from '../../../src/models/referralreward.model';
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

describe('ReferralReward Model', () => {
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
      expect(ReferralReward).toBeDefined();
    });

    it('should have correct model name', () => {
      expect(ReferralReward.name).toBe('ReferralReward');
    });

    it('should have correct table name', () => {
      expect(ReferralReward.tableName).toBe('referral_rewards');
    });

    it('should have timestamps enabled', () => {
      expect(ReferralReward.options.timestamps).toBe(true);
    });

    it('should have underscored enabled', () => {
      expect(ReferralReward.options.underscored).toBe(true);
    });

    it('should have paranoid enabled', () => {
      expect(ReferralReward.options.paranoid).toBe(true);
    });
  });

  describe('Model Attributes', () => {
    it('should have correct id attribute', () => {
      const idAttribute = ReferralReward.getAttributes().id;
      expect(idAttribute).toBeDefined();
      expect(idAttribute.type.constructor.name).toBe('INTEGER');
      expect(idAttribute.allowNull).toBe(false);
      expect(idAttribute.primaryKey).toBe(true);
      expect(idAttribute.autoIncrement).toBe(true);
    });

    it('should have correct referral_id attribute', () => {
      const referralIdAttribute = ReferralReward.getAttributes().referral_id;
      expect(referralIdAttribute).toBeDefined();
      expect(referralIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(referralIdAttribute.allowNull).toBe(true);
    });

    it('should have correct reward_type attribute', () => {
      const rewardTypeAttribute = ReferralReward.getAttributes().reward_type;
      expect(rewardTypeAttribute).toBeDefined();
      expect(rewardTypeAttribute.type.constructor.name).toBe('STRING');
      expect(rewardTypeAttribute.allowNull).toBe(true);
    });

    it('should have correct reward_amount attribute', () => {
      const rewardAmountAttribute = ReferralReward.getAttributes().reward_amount;
      expect(rewardAmountAttribute).toBeDefined();
      expect(rewardAmountAttribute.type.constructor.name).toBe('STRING');
      expect(rewardAmountAttribute.allowNull).toBe(true);
    });

    it('should have correct reward_points attribute', () => {
      const rewardPointsAttribute = ReferralReward.getAttributes().reward_points;
      expect(rewardPointsAttribute).toBeDefined();
      expect(rewardPointsAttribute.type.constructor.name).toBe('STRING');
      expect(rewardPointsAttribute.allowNull).toBe(true);
    });

    it('should have correct coupon_id attribute', () => {
      const couponIdAttribute = ReferralReward.getAttributes().coupon_id;
      expect(couponIdAttribute).toBeDefined();
      expect(couponIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(couponIdAttribute.allowNull).toBe(true);
    });

    it('should have correct coupon_code attribute', () => {
      const couponCodeAttribute = ReferralReward.getAttributes().coupon_code;
      expect(couponCodeAttribute).toBeDefined();
      expect(couponCodeAttribute.type.constructor.name).toBe('STRING');
      expect(couponCodeAttribute.allowNull).toBe(true);
    });

    it('should have correct status attribute', () => {
      const statusAttribute = ReferralReward.getAttributes().status;
      expect(statusAttribute).toBeDefined();
      expect(statusAttribute.type.constructor.name).toBe('STRING');
      expect(statusAttribute.allowNull).toBe(true);
    });

    it('should have correct issued_at attribute', () => {
      const issuedAtAttribute = ReferralReward.getAttributes().issued_at;
      expect(issuedAtAttribute).toBeDefined();
      expect(issuedAtAttribute.type.constructor.name).toBe('STRING');
      expect(issuedAtAttribute.allowNull).toBe(true);
    });

    it('should have correct used_at attribute', () => {
      const usedAtAttribute = ReferralReward.getAttributes().used_at;
      expect(usedAtAttribute).toBeDefined();
      expect(usedAtAttribute.type.constructor.name).toBe('STRING');
      expect(usedAtAttribute.allowNull).toBe(true);
    });

    it('should have correct expires_at attribute', () => {
      const expiresAtAttribute = ReferralReward.getAttributes().expires_at;
      expect(expiresAtAttribute).toBeDefined();
      expect(expiresAtAttribute.type.constructor.name).toBe('STRING');
      expect(expiresAtAttribute.allowNull).toBe(true);
    });

    it('should have correct created_at attribute', () => {
      const createdAtAttribute = ReferralReward.getAttributes().created_at;
      expect(createdAtAttribute).toBeDefined();
      expect(createdAtAttribute.type.constructor.name).toBe('DATE');
      expect(createdAtAttribute.allowNull).toBe(true);
    });

    it('should have correct description attribute', () => {
      const descriptionAttribute = ReferralReward.getAttributes().description;
      expect(descriptionAttribute).toBeDefined();
      expect(descriptionAttribute.type.constructor.name).toBe('STRING');
      expect(descriptionAttribute.allowNull).toBe(true);
    });
  });

  describe('Model Creation', () => {
    it('should create a new referral reward', async () => {
      const referralRewardData = {
        referral_id: 1,
        reward_type: 'cash',
        reward_amount: '100',
        reward_points: '0',
        coupon_id: null,
        coupon_code: '',
        status: 'issued',
        issued_at: '2025-01-15',
        used_at: '',
        expires_at: '2025-12-31',
        created_at: new Date(),
        description: 'Referral reward for successful invitation',
      };

      const referralReward = await ReferralReward.create(referralRewardData);
      
      expect(referralReward).toBeDefined();
      expect(referralReward.id).toBeDefined();
      expect(referralReward.referral_id).toBe(referralRewardData.referral_id);
      expect(referralReward.reward_type).toBe(referralRewardData.reward_type);
      expect(referralReward.reward_amount).toBe(referralRewardData.reward_amount);
      expect(referralReward.reward_points).toBe(referralRewardData.reward_points);
      expect(referralReward.coupon_id).toBe(referralRewardData.coupon_id);
      expect(referralReward.coupon_code).toBe(referralRewardData.coupon_code);
      expect(referralReward.status).toBe(referralRewardData.status);
      expect(referralReward.issued_at).toBe(referralRewardData.issued_at);
      expect(referralReward.used_at).toBe(referralRewardData.used_at);
      expect(referralReward.expires_at).toBe(referralRewardData.expires_at);
      expect(referralReward.description).toBe(referralRewardData.description);
    });

    it('should create a referral reward with minimal data', async () => {
      const minimalData = {
        reward_type: 'points',
      };

      const referralReward = await ReferralReward.create(minimalData);
      
      expect(referralReward).toBeDefined();
      expect(referralReward.id).toBeDefined();
      expect(referralReward.reward_type).toBe(minimalData.reward_type);
    });
  });

  describe('Model Validation', () => {
    it('should allow null values for optional fields', async () => {
      const referralReward = await ReferralReward.create({
        reward_type: 'cash',
      });

      expect(referralReward.referral_id).toBeNull();
      expect(referralReward.reward_amount).toBeNull();
      expect(referralReward.reward_points).toBeNull();
      expect(referralReward.coupon_id).toBeNull();
      expect(referralReward.coupon_code).toBeNull();
      expect(referralReward.status).toBeNull();
      expect(referralReward.issued_at).toBeNull();
      expect(referralReward.used_at).toBeNull();
      expect(referralReward.expires_at).toBeNull();
      expect(referralReward.created_at).toBeNull();
      expect(referralReward.description).toBeNull();
    });

    it('should handle empty string values', async () => {
      const referralReward = await ReferralReward.create({
        reward_type: 'cash',
        reward_amount: '',
        reward_points: '',
        coupon_code: '',
        status: '',
        issued_at: '',
        used_at: '',
        expires_at: '',
        description: '',
      });

      expect(referralReward.reward_amount).toBe('');
      expect(referralReward.reward_points).toBe('');
      expect(referralReward.coupon_code).toBe('');
      expect(referralReward.status).toBe('');
      expect(referralReward.issued_at).toBe('');
      expect(referralReward.used_at).toBe('');
      expect(referralReward.expires_at).toBe('');
      expect(referralReward.description).toBe('');
    });

    it('should handle different reward types', async () => {
      const rewardTypes = ['cash', 'points', 'coupon', 'discount'];
      
      for (const rewardType of rewardTypes) {
        const referralReward = await ReferralReward.create({
          reward_type: rewardType,
        });
        
        expect(referralReward.reward_type).toBe(rewardType);
      }
    });

    it('should handle different status values', async () => {
      const statuses = ['issued', 'used', 'expired', 'cancelled'];
      
      for (const status of statuses) {
        const referralReward = await ReferralReward.create({
          reward_type: 'cash',
          status: status,
        });
        
        expect(referralReward.status).toBe(status);
      }
    });
  });

  describe('Model Updates', () => {
    it('should update referral reward attributes', async () => {
      const referralReward = await ReferralReward.create({
        reward_type: 'cash',
        status: 'issued',
        reward_amount: '100',
      });

      await referralReward.update({
        status: 'used',
        reward_amount: '150',
        used_at: '2025-01-20',
      });

      const updatedReferralReward = await ReferralReward.findByPk(referralReward.id);
      expect(updatedReferralReward?.status).toBe('used');
      expect(updatedReferralReward?.reward_amount).toBe('150');
      expect(updatedReferralReward?.used_at).toBe('2025-01-20');
    });

    it('should handle partial updates', async () => {
      const referralReward = await ReferralReward.create({
        reward_type: 'cash',
        status: 'issued',
        reward_amount: '100',
        used_at: '',
        expires_at: '',
      });

      await referralReward.update({
        status: 'used',
      });

      const updatedReferralReward = await ReferralReward.findByPk(referralReward.id);
      expect(updatedReferralReward?.status).toBe('used');
      expect(updatedReferralReward?.reward_amount).toBe('100'); // Should remain unchanged
      expect(updatedReferralReward?.used_at).toBe(''); // Should remain unchanged
      expect(updatedReferralReward?.expires_at).toBe(''); // Should remain unchanged
    });
  });

  describe('Model Queries', () => {
    it('should find referral reward by id', async () => {
      const createdReferralReward = await ReferralReward.create({
        reward_type: 'cash',
      });

      const foundReferralReward = await ReferralReward.findByPk(createdReferralReward.id);
      
      expect(foundReferralReward).toBeDefined();
      expect(foundReferralReward?.id).toBe(createdReferralReward.id);
      expect(foundReferralReward?.reward_type).toBe('cash');
    });

    it('should find referral rewards by status', async () => {
      await ReferralReward.bulkCreate([
        { reward_type: 'cash', status: 'issued' },
        { reward_type: 'points', status: 'used' },
        { reward_type: 'cash', status: 'issued' },
      ]);

      const issuedRewards = await ReferralReward.findAll({
        where: { status: 'issued' },
      });
      
      expect(issuedRewards).toHaveLength(2);
      expect(issuedRewards.map(rr => rr.reward_type)).toContain('cash');
      expect(issuedRewards.map(rr => rr.reward_type)).toContain('cash');
    });

    it('should find referral rewards by reward type', async () => {
      await ReferralReward.bulkCreate([
        { reward_type: 'cash', status: 'issued' },
        { reward_type: 'points', status: 'issued' },
        { reward_type: 'cash', status: 'used' },
      ]);

      const cashRewards = await ReferralReward.findAll({
        where: { reward_type: 'cash' },
      });
      
      expect(cashRewards).toHaveLength(2);
      expect(cashRewards.map(rr => rr.status)).toContain('issued');
      expect(cashRewards.map(rr => rr.status)).toContain('used');
    });

    it('should find referral rewards by referral id', async () => {
      await ReferralReward.bulkCreate([
        { reward_type: 'cash', referral_id: 1 },
        { reward_type: 'points', referral_id: 1 },
        { reward_type: 'coupon', referral_id: 2 },
      ]);

      const referral1Rewards = await ReferralReward.findAll({
        where: { referral_id: 1 },
      });
      
      expect(referral1Rewards).toHaveLength(2);
      expect(referral1Rewards.map(rr => rr.reward_type)).toContain('cash');
      expect(referral1Rewards.map(rr => rr.reward_type)).toContain('points');
    });
  });

  describe('Model Deletion', () => {
    it('should soft delete referral reward', async () => {
      const referralReward = await ReferralReward.create({
        reward_type: 'cash',
      });

      await referralReward.destroy();

      const deletedReferralReward = await ReferralReward.findByPk(referralReward.id);
      expect(deletedReferralReward).toBeNull();

      // Check if it exists in paranoid mode
      const paranoidReferralReward = await ReferralReward.findByPk(referralReward.id, {
        paranoid: false,
      });
      expect(paranoidReferralReward).toBeDefined();
    });

    it('should restore soft deleted referral reward', async () => {
      const referralReward = await ReferralReward.create({
        reward_type: 'cash',
      });

      await referralReward.destroy();
      await referralReward.restore();

      const restoredReferralReward = await ReferralReward.findByPk(referralReward.id);
      expect(restoredReferralReward).toBeDefined();
      expect(restoredReferralReward?.reward_type).toBe('cash');
    });
  });

  describe('Model Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const referralReward = await ReferralReward.create({
        reward_type: 'cash',
      });

      expect(referralReward.createdAt).toBeDefined();
      expect(referralReward.updatedAt).toBeDefined();
      expect(referralReward.createdAt).toBeInstanceOf(Date);
      expect(referralReward.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on update', async () => {
      const referralReward = await ReferralReward.create({
        reward_type: 'cash',
      });

      const originalUpdatedAt = referralReward.updatedAt;
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await referralReward.update({ status: 'used' });
      
      expect(referralReward.updatedAt).toBeInstanceOf(Date);
      expect(referralReward.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Business Logic Tests', () => {
    it('should handle different reward scenarios', async () => {
      // Cash reward
      const cashReward = await ReferralReward.create({
        reward_type: 'cash',
        reward_amount: '200',
        status: 'issued',
      });
      expect(cashReward.reward_amount).toBe('200');

      // Points reward
      const pointsReward = await ReferralReward.create({
        reward_type: 'points',
        reward_points: '1000',
        status: 'issued',
      });
      expect(pointsReward.reward_points).toBe('1000');

      // Coupon reward
      const couponReward = await ReferralReward.create({
        reward_type: 'coupon',
        coupon_id: 1,
        coupon_code: 'SAVE10',
        status: 'issued',
      });
      expect(couponReward.coupon_id).toBe(1);
      expect(couponReward.coupon_code).toBe('SAVE10');
    });

    it('should handle reward lifecycle', async () => {
      const referralReward = await ReferralReward.create({
        reward_type: 'cash',
        status: 'issued',
        issued_at: '2025-01-15',
        expires_at: '2025-12-31',
      });

      // Mark as used
      await referralReward.update({
        status: 'used',
        used_at: '2025-01-20',
      });

      const updatedReward = await ReferralReward.findByPk(referralReward.id);
      expect(updatedReward?.status).toBe('used');
      expect(updatedReward?.used_at).toBe('2025-01-20');
    });

    it('should handle date fields correctly', async () => {
      const testDate = new Date();
      const referralReward = await ReferralReward.create({
        reward_type: 'cash',
        created_at: testDate,
      });

      expect(referralReward.created_at).toBeInstanceOf(Date);
      expect(referralReward.created_at?.getTime()).toBe(testDate.getTime());
    });

    it('should handle string date fields', async () => {
      const referralReward = await ReferralReward.create({
        reward_type: 'cash',
        issued_at: '2025-01-15',
        used_at: '2025-01-20',
        expires_at: '2025-12-31',
      });

      expect(referralReward.issued_at).toBe('2025-01-15');
      expect(referralReward.used_at).toBe('2025-01-20');
      expect(referralReward.expires_at).toBe('2025-12-31');
    });
  });
});