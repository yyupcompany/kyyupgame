import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { LikeCollectConfig } from '../../../src/models/likecollectconfig.model';


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

describe('LikeCollectConfig Model', () => {
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
    await LikeCollectConfig.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(LikeCollectConfig.tableName).toBe('like_collect_config');
    });

    it('should have correct attributes', () => {
      const attributes = Object.keys(LikeCollectConfig.getAttributes());
      expect(attributes).toContain('id');
      expect(attributes).toContain('activity_id');
      expect(attributes).toContain('target_likes');
      expect(attributes).toContain('reward_type');
      expect(attributes).toContain('reward_amount');
      expect(attributes).toContain('status');
      expect(attributes).toContain('created_at');
      expect(attributes).toContain('updated_at');
    });
  });

  describe('Field Validation', () => {
    it('should create LikeCollectConfig with valid data', async () => {
      const config = await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      expect(config.id).toBeDefined();
      expect(config.activity_id).toBe(1);
      expect(config.target_likes).toBe('100');
      expect(config.reward_type).toBe('coupon');
      expect(config.reward_amount).toBe('10');
      expect(config.status).toBe('active');
    });

    it('should create LikeCollectConfig with minimal data', async () => {
      const config = await LikeCollectConfig.create({});

      expect(config.id).toBeDefined();
      expect(config.activity_id).toBeNull();
      expect(config.target_likes).toBeNull();
      expect(config.reward_type).toBeNull();
      expect(config.reward_amount).toBeNull();
      expect(config.status).toBeNull();
    });

    it('should allow null values for optional fields', async () => {
      const config = await LikeCollectConfig.create({
        activity_id: null,
        target_likes: null,
        reward_type: null,
        reward_amount: null,
        status: null,
      });

      expect(config.id).toBeDefined();
      expect(config.activity_id).toBeNull();
      expect(config.target_likes).toBeNull();
      expect(config.reward_type).toBeNull();
      expect(config.reward_amount).toBeNull();
      expect(config.status).toBeNull();
    });
  });

  describe('Data Types', () => {
    it('should handle integer values for activity_id', async () => {
      const config = await LikeCollectConfig.create({
        activity_id: 12345,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      expect(config.activity_id).toBe(12345);
    });

    it('should handle string values for text fields', async () => {
      const config = await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '1000',
        reward_type: 'discount',
        reward_amount: '20.5',
        status: 'inactive',
      });

      expect(config.target_likes).toBe('1000');
      expect(config.reward_type).toBe('discount');
      expect(config.reward_amount).toBe('20.5');
      expect(config.status).toBe('inactive');
    });

    it('should handle long strings in text fields', async () => {
      const longString = 'a'.repeat(1000);
      const config = await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: longString,
        reward_type: longString,
        reward_amount: longString,
        status: 'active',
      });

      expect(config.target_likes).toBe(longString);
      expect(config.reward_type).toBe(longString);
      expect(config.reward_amount).toBe(longString);
    });
  });

  describe('CRUD Operations', () => {
    it('should create LikeCollectConfig successfully', async () => {
      const config = await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      expect(config.id).toBeDefined();
      expect(config.activity_id).toBe(1);
      expect(config.target_likes).toBe('100');
      expect(config.reward_type).toBe('coupon');
      expect(config.reward_amount).toBe('10');
      expect(config.status).toBe('active');
    });

    it('should read LikeCollectConfig successfully', async () => {
      const config = await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      const foundConfig = await LikeCollectConfig.findByPk(config.id);

      expect(foundConfig).toBeDefined();
      expect(foundConfig?.id).toBe(config.id);
      expect(foundConfig?.activity_id).toBe(1);
      expect(foundConfig?.target_likes).toBe('100');
      expect(foundConfig?.reward_type).toBe('coupon');
      expect(foundConfig?.reward_amount).toBe('10');
      expect(foundConfig?.status).toBe('active');
    });

    it('should update LikeCollectConfig successfully', async () => {
      const config = await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      await config.update({
        activity_id: 2,
        target_likes: '200',
        reward_type: 'discount',
        reward_amount: '20',
        status: 'inactive',
      });

      const updatedConfig = await LikeCollectConfig.findByPk(config.id);

      expect(updatedConfig?.activity_id).toBe(2);
      expect(updatedConfig?.target_likes).toBe('200');
      expect(updatedConfig?.reward_type).toBe('discount');
      expect(updatedConfig?.reward_amount).toBe('20');
      expect(updatedConfig?.status).toBe('inactive');
    });

    it('should update partial fields successfully', async () => {
      const config = await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      await config.update({
        target_likes: '150',
        status: 'inactive',
      });

      const updatedConfig = await LikeCollectConfig.findByPk(config.id);

      expect(updatedConfig?.activity_id).toBe(1);
      expect(updatedConfig?.target_likes).toBe('150');
      expect(updatedConfig?.reward_type).toBe('coupon');
      expect(updatedConfig?.reward_amount).toBe('10');
      expect(updatedConfig?.status).toBe('inactive');
    });

    it('should delete LikeCollectConfig successfully', async () => {
      const config = await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      await config.destroy();

      const deletedConfig = await LikeCollectConfig.findByPk(config.id);

      expect(deletedConfig).toBeNull();
    });
  });

  describe('Query Methods', () => {
    it('should find all LikeCollectConfig records', async () => {
      await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      await LikeCollectConfig.create({
        activity_id: 2,
        target_likes: '200',
        reward_type: 'discount',
        reward_amount: '20',
        status: 'inactive',
      });

      const configs = await LikeCollectConfig.findAll();

      expect(configs.length).toBe(2);
    });

    it('should find LikeCollectConfig by activity_id', async () => {
      await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      await LikeCollectConfig.create({
        activity_id: 2,
        target_likes: '200',
        reward_type: 'discount',
        reward_amount: '20',
        status: 'inactive',
      });

      const configs = await LikeCollectConfig.findAll({
        where: { activity_id: 1 },
      });

      expect(configs.length).toBe(1);
      expect(configs[0].activity_id).toBe(1);
    });

    it('should find LikeCollectConfig by status', async () => {
      await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      await LikeCollectConfig.create({
        activity_id: 2,
        target_likes: '200',
        reward_type: 'discount',
        reward_amount: '20',
        status: 'inactive',
      });

      const activeConfigs = await LikeCollectConfig.findAll({
        where: { status: 'active' },
      });

      const inactiveConfigs = await LikeCollectConfig.findAll({
        where: { status: 'inactive' },
      });

      expect(activeConfigs.length).toBe(1);
      expect(inactiveConfigs.length).toBe(1);
      expect(activeConfigs[0].status).toBe('active');
      expect(inactiveConfigs[0].status).toBe('inactive');
    });

    it('should find LikeCollectConfig by reward_type', async () => {
      await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      await LikeCollectConfig.create({
        activity_id: 2,
        target_likes: '200',
        reward_type: 'discount',
        reward_amount: '20',
        status: 'inactive',
      });

      const couponConfigs = await LikeCollectConfig.findAll({
        where: { reward_type: 'coupon' },
      });

      const discountConfigs = await LikeCollectConfig.findAll({
        where: { reward_type: 'discount' },
      });

      expect(couponConfigs.length).toBe(1);
      expect(discountConfigs.length).toBe(1);
      expect(couponConfigs[0].reward_type).toBe('coupon');
      expect(discountConfigs[0].reward_type).toBe('discount');
    });

    it('should find LikeCollectConfig with complex conditions', async () => {
      await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      await LikeCollectConfig.create({
        activity_id: 2,
        target_likes: '200',
        reward_type: 'discount',
        reward_amount: '20',
        status: 'active',
      });

      await LikeCollectConfig.create({
        activity_id: 3,
        target_likes: '300',
        reward_type: 'coupon',
        reward_amount: '30',
        status: 'inactive',
      });

      const configs = await LikeCollectConfig.findAll({
        where: {
          status: 'active',
          reward_type: 'coupon',
        },
      });

      expect(configs.length).toBe(1);
      expect(configs[0].activity_id).toBe(1);
      expect(configs[0].reward_type).toBe('coupon');
      expect(configs[0].status).toBe('active');
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const config = await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      expect(config.createdAt).toBeInstanceOf(Date);
      expect(config.updatedAt).toBeInstanceOf(Date);
      expect(config.created_at).toBeDefined();
      expect(config.updated_at).toBeDefined();
    });

    it('should update updatedAt on update', async () => {
      const config = await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      const originalUpdatedAt = config.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      await config.update({
        target_likes: '150',
      });

      const updatedConfig = await LikeCollectConfig.findByPk(config.id);

      expect(updatedConfig?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete with paranoid option', async () => {
      const config = await LikeCollectConfig.create({
        activity_id: 1,
        target_likes: '100',
        reward_type: 'coupon',
        reward_amount: '10',
        status: 'active',
      });

      await config.destroy();

      const deletedConfig = await LikeCollectConfig.findByPk(config.id);

      expect(deletedConfig).toBeNull();

      const allConfigs = await LikeCollectConfig.findAll({
        paranoid: false,
      });

      expect(allConfigs.length).toBe(1);
      expect(allConfigs[0].id).toBe(config.id);
    });
  });
});