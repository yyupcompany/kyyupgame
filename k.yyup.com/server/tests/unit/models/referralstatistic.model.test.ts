import { ReferralStatistic } from '../../../src/models/referralstatistic.model';
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

describe('ReferralStatistic Model', () => {
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
      expect(ReferralStatistic).toBeDefined();
    });

    it('should have correct model name', () => {
      expect(ReferralStatistic.name).toBe('ReferralStatistic');
    });

    it('should have correct table name', () => {
      expect(ReferralStatistic.tableName).toBe('referral_statistics');
    });

    it('should have timestamps enabled', () => {
      expect(ReferralStatistic.options.timestamps).toBe(true);
    });

    it('should have underscored enabled', () => {
      expect(ReferralStatistic.options.underscored).toBe(true);
    });

    it('should have paranoid enabled', () => {
      expect(ReferralStatistic.options.paranoid).toBe(true);
    });
  });

  describe('Model Attributes', () => {
    it('should have correct id attribute', () => {
      const idAttribute = ReferralStatistic.getAttributes().id;
      expect(idAttribute).toBeDefined();
      expect(idAttribute.type.constructor.name).toBe('INTEGER');
      expect(idAttribute.allowNull).toBe(false);
      expect(idAttribute.primaryKey).toBe(true);
      expect(idAttribute.autoIncrement).toBe(true);
    });

    it('should have correct user_id attribute', () => {
      const userIdAttribute = ReferralStatistic.getAttributes().user_id;
      expect(userIdAttribute).toBeDefined();
      expect(userIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(userIdAttribute.allowNull).toBe(true);
    });

    it('should have correct activity_id attribute', () => {
      const activityIdAttribute = ReferralStatistic.getAttributes().activity_id;
      expect(activityIdAttribute).toBeDefined();
      expect(activityIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(activityIdAttribute.allowNull).toBe(true);
    });

    it('should have correct total_referrals attribute', () => {
      const totalReferralsAttribute = ReferralStatistic.getAttributes().total_referrals;
      expect(totalReferralsAttribute).toBeDefined();
      expect(totalReferralsAttribute.type.constructor.name).toBe('STRING');
      expect(totalReferralsAttribute.allowNull).toBe(true);
    });

    it('should have correct successful_referrals attribute', () => {
      const successfulReferralsAttribute = ReferralStatistic.getAttributes().successful_referrals;
      expect(successfulReferralsAttribute).toBeDefined();
      expect(successfulReferralsAttribute.type.constructor.name).toBe('STRING');
      expect(successfulReferralsAttribute.allowNull).toBe(true);
    });

    it('should have correct total_rewards attribute', () => {
      const totalRewardsAttribute = ReferralStatistic.getAttributes().total_rewards;
      expect(totalRewardsAttribute).toBeDefined();
      expect(totalRewardsAttribute.type.constructor.name).toBe('STRING');
      expect(totalRewardsAttribute.allowNull).toBe(true);
    });

    it('should have correct total_points attribute', () => {
      const totalPointsAttribute = ReferralStatistic.getAttributes().total_points;
      expect(totalPointsAttribute).toBeDefined();
      expect(totalPointsAttribute.type.constructor.name).toBe('STRING');
      expect(totalPointsAttribute.allowNull).toBe(true);
    });

    it('should have correct last_referral_at attribute', () => {
      const lastReferralAtAttribute = ReferralStatistic.getAttributes().last_referral_at;
      expect(lastReferralAtAttribute).toBeDefined();
      expect(lastReferralAtAttribute.type.constructor.name).toBe('STRING');
      expect(lastReferralAtAttribute.allowNull).toBe(true);
    });

    it('should have correct created_at attribute', () => {
      const createdAtAttribute = ReferralStatistic.getAttributes().created_at;
      expect(createdAtAttribute).toBeDefined();
      expect(createdAtAttribute.type.constructor.name).toBe('DATE');
      expect(createdAtAttribute.allowNull).toBe(true);
    });

    it('should have correct updated_at attribute', () => {
      const updatedAtAttribute = ReferralStatistic.getAttributes().updated_at;
      expect(updatedAtAttribute).toBeDefined();
      expect(updatedAtAttribute.type.constructor.name).toBe('DATE');
      expect(updatedAtAttribute.allowNull).toBe(true);
    });
  });

  describe('Model Creation', () => {
    it('should create a new referral statistic', async () => {
      const referralStatisticData = {
        user_id: 1,
        activity_id: 1,
        total_referrals: '10',
        successful_referrals: '5',
        total_rewards: '500',
        total_points: '1000',
        last_referral_at: '2025-01-15',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const referralStatistic = await ReferralStatistic.create(referralStatisticData);
      
      expect(referralStatistic).toBeDefined();
      expect(referralStatistic.id).toBeDefined();
      expect(referralStatistic.user_id).toBe(referralStatisticData.user_id);
      expect(referralStatistic.activity_id).toBe(referralStatisticData.activity_id);
      expect(referralStatistic.total_referrals).toBe(referralStatisticData.total_referrals);
      expect(referralStatistic.successful_referrals).toBe(referralStatisticData.successful_referrals);
      expect(referralStatistic.total_rewards).toBe(referralStatisticData.total_rewards);
      expect(referralStatistic.total_points).toBe(referralStatisticData.total_points);
      expect(referralStatistic.last_referral_at).toBe(referralStatisticData.last_referral_at);
    });

    it('should create a referral statistic with minimal data', async () => {
      const minimalData = {
        total_referrals: '0',
      };

      const referralStatistic = await ReferralStatistic.create(minimalData);
      
      expect(referralStatistic).toBeDefined();
      expect(referralStatistic.id).toBeDefined();
      expect(referralStatistic.total_referrals).toBe(minimalData.total_referrals);
    });
  });

  describe('Model Validation', () => {
    it('should allow null values for optional fields', async () => {
      const referralStatistic = await ReferralStatistic.create({
        total_referrals: '0',
      });

      expect(referralStatistic.user_id).toBeNull();
      expect(referralStatistic.activity_id).toBeNull();
      expect(referralStatistic.successful_referrals).toBeNull();
      expect(referralStatistic.total_rewards).toBeNull();
      expect(referralStatistic.total_points).toBeNull();
      expect(referralStatistic.last_referral_at).toBeNull();
      expect(referralStatistic.created_at).toBeNull();
      expect(referralStatistic.updated_at).toBeNull();
    });

    it('should handle empty string values', async () => {
      const referralStatistic = await ReferralStatistic.create({
        total_referrals: '',
        successful_referrals: '',
        total_rewards: '',
        total_points: '',
        last_referral_at: '',
      });

      expect(referralStatistic.total_referrals).toBe('');
      expect(referralStatistic.successful_referrals).toBe('');
      expect(referralStatistic.total_rewards).toBe('');
      expect(referralStatistic.total_points).toBe('');
      expect(referralStatistic.last_referral_at).toBe('');
    });

    it('should handle numeric string values', async () => {
      const referralStatistic = await ReferralStatistic.create({
        total_referrals: '25',
        successful_referrals: '12',
        total_rewards: '1200.50',
        total_points: '2500',
      });

      expect(referralStatistic.total_referrals).toBe('25');
      expect(referralStatistic.successful_referrals).toBe('12');
      expect(referralStatistic.total_rewards).toBe('1200.50');
      expect(referralStatistic.total_points).toBe('2500');
    });
  });

  describe('Model Updates', () => {
    it('should update referral statistic attributes', async () => {
      const referralStatistic = await ReferralStatistic.create({
        total_referrals: '10',
        successful_referrals: '5',
        total_rewards: '500',
      });

      await referralStatistic.update({
        total_referrals: '15',
        successful_referrals: '8',
        total_rewards: '800',
        total_points: '1500',
      });

      const updatedReferralStatistic = await ReferralStatistic.findByPk(referralStatistic.id);
      expect(updatedReferralStatistic?.total_referrals).toBe('15');
      expect(updatedReferralStatistic?.successful_referrals).toBe('8');
      expect(updatedReferralStatistic?.total_rewards).toBe('800');
      expect(updatedReferralStatistic?.total_points).toBe('1500');
    });

    it('should handle partial updates', async () => {
      const referralStatistic = await ReferralStatistic.create({
        total_referrals: '10',
        successful_referrals: '5',
        total_rewards: '500',
        total_points: '1000',
      });

      await referralStatistic.update({
        total_referrals: '12',
      });

      const updatedReferralStatistic = await ReferralStatistic.findByPk(referralStatistic.id);
      expect(updatedReferralStatistic?.total_referrals).toBe('12');
      expect(updatedReferralStatistic?.successful_referrals).toBe('5'); // Should remain unchanged
      expect(updatedReferralStatistic?.total_rewards).toBe('500'); // Should remain unchanged
      expect(updatedReferralStatistic?.total_points).toBe('1000'); // Should remain unchanged
    });
  });

  describe('Model Queries', () => {
    it('should find referral statistic by id', async () => {
      const createdReferralStatistic = await ReferralStatistic.create({
        total_referrals: '5',
      });

      const foundReferralStatistic = await ReferralStatistic.findByPk(createdReferralStatistic.id);
      
      expect(foundReferralStatistic).toBeDefined();
      expect(foundReferralStatistic?.id).toBe(createdReferralStatistic.id);
      expect(foundReferralStatistic?.total_referrals).toBe('5');
    });

    it('should find referral statistics by user id', async () => {
      await ReferralStatistic.bulkCreate([
        { user_id: 1, total_referrals: '10' },
        { user_id: 1, total_referrals: '15' },
        { user_id: 2, total_referrals: '8' },
      ]);

      const user1Stats = await ReferralStatistic.findAll({
        where: { user_id: 1 },
      });
      
      expect(user1Stats).toHaveLength(2);
      expect(user1Stats.map(rs => rs.total_referrals)).toContain('10');
      expect(user1Stats.map(rs => rs.total_referrals)).toContain('15');
    });

    it('should find referral statistics by activity id', async () => {
      await ReferralStatistic.bulkCreate([
        { activity_id: 1, total_referrals: '20' },
        { activity_id: 1, total_referrals: '25' },
        { activity_id: 2, total_referrals: '15' },
      ]);

      const activity1Stats = await ReferralStatistic.findAll({
        where: { activity_id: 1 },
      });
      
      expect(activity1Stats).toHaveLength(2);
      expect(activity1Stats.map(rs => rs.total_referrals)).toContain('20');
      expect(activity1Stats.map(rs => rs.total_referrals)).toContain('25');
    });

    it('should find top performers by total referrals', async () => {
      await ReferralStatistic.bulkCreate([
        { user_id: 1, total_referrals: '50', successful_referrals: '30' },
        { user_id: 2, total_referrals: '30', successful_referrals: '20' },
        { user_id: 3, total_referrals: '40', successful_referrals: '25' },
      ]);

      const topPerformers = await ReferralStatistic.findAll({
        where: {
          total_referrals: {
            [Op.gte]: '35',
          },
        },
        order: [['total_referrals', 'DESC']],
      });
      
      expect(topPerformers).toHaveLength(2);
      expect(topPerformers[0].total_referrals).toBe('50');
      expect(topPerformers[1].total_referrals).toBe('40');
    });
  });

  describe('Model Deletion', () => {
    it('should soft delete referral statistic', async () => {
      const referralStatistic = await ReferralStatistic.create({
        total_referrals: '5',
      });

      await referralStatistic.destroy();

      const deletedReferralStatistic = await ReferralStatistic.findByPk(referralStatistic.id);
      expect(deletedReferralStatistic).toBeNull();

      // Check if it exists in paranoid mode
      const paranoidReferralStatistic = await ReferralStatistic.findByPk(referralStatistic.id, {
        paranoid: false,
      });
      expect(paranoidReferralStatistic).toBeDefined();
    });

    it('should restore soft deleted referral statistic', async () => {
      const referralStatistic = await ReferralStatistic.create({
        total_referrals: '5',
      });

      await referralStatistic.destroy();
      await referralStatistic.restore();

      const restoredReferralStatistic = await ReferralStatistic.findByPk(referralStatistic.id);
      expect(restoredReferralStatistic).toBeDefined();
      expect(restoredReferralStatistic?.total_referrals).toBe('5');
    });
  });

  describe('Model Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const referralStatistic = await ReferralStatistic.create({
        total_referrals: '5',
      });

      expect(referralStatistic.createdAt).toBeDefined();
      expect(referralStatistic.updatedAt).toBeDefined();
      expect(referralStatistic.createdAt).toBeInstanceOf(Date);
      expect(referralStatistic.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on update', async () => {
      const referralStatistic = await ReferralStatistic.create({
        total_referrals: '5',
      });

      const originalUpdatedAt = referralStatistic.updatedAt;
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await referralStatistic.update({ total_referrals: '10' });
      
      expect(referralStatistic.updatedAt).toBeInstanceOf(Date);
      expect(referralStatistic.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Business Logic Tests', () => {
    it('should handle statistics calculation', async () => {
      const referralStatistic = await ReferralStatistic.create({
        total_referrals: '100',
        successful_referrals: '60',
        total_rewards: '3000',
        total_points: '6000',
      });

      // Calculate success rate (as string comparison)
      const successRate = parseInt(referralStatistic.successful_referrals) / parseInt(referralStatistic.total_referrals);
      expect(successRate).toBe(0.6); // 60/100 = 0.6

      // Calculate average reward per successful referral
      const avgReward = parseFloat(referralStatistic.total_rewards) / parseInt(referralStatistic.successful_referrals);
      expect(avgReward).toBe(50); // 3000/60 = 50
    });

    it('should handle zero values', async () => {
      const referralStatistic = await ReferralStatistic.create({
        total_referrals: '0',
        successful_referrals: '0',
        total_rewards: '0',
        total_points: '0',
      });

      expect(referralStatistic.total_referrals).toBe('0');
      expect(referralStatistic.successful_referrals).toBe('0');
      expect(referralStatistic.total_rewards).toBe('0');
      expect(referralStatistic.total_points).toBe('0');
    });

    it('should handle date fields correctly', async () => {
      const testDate = new Date();
      const referralStatistic = await ReferralStatistic.create({
        total_referrals: '5',
        created_at: testDate,
        updated_at: testDate,
      });

      expect(referralStatistic.created_at).toBeInstanceOf(Date);
      expect(referralStatistic.updated_at).toBeInstanceOf(Date);
      expect(referralStatistic.created_at?.getTime()).toBe(testDate.getTime());
      expect(referralStatistic.updated_at?.getTime()).toBe(testDate.getTime());
    });

    it('should handle string date fields', async () => {
      const referralStatistic = await ReferralStatistic.create({
        total_referrals: '5',
        last_referral_at: '2025-01-15',
      });

      expect(referralStatistic.last_referral_at).toBe('2025-01-15');
    });

    it('should handle user and activity combination', async () => {
      const referralStatistic = await ReferralStatistic.create({
        user_id: 1,
        activity_id: 1,
        total_referrals: '25',
        successful_referrals: '15',
      });

      const userActivityStats = await ReferralStatistic.findOne({
        where: {
          user_id: 1,
          activity_id: 1,
        },
      });

      expect(userActivityStats).toBeDefined();
      expect(userActivityStats?.total_referrals).toBe('25');
      expect(userActivityStats?.successful_referrals).toBe('15');
    });
  });
});