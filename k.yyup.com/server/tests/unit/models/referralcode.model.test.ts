import { ReferralCode } from '../../../src/models/referralcode.model';
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

describe('ReferralCode Model', () => {
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
      expect(ReferralCode).toBeDefined();
    });

    it('should have correct model name', () => {
      expect(ReferralCode.name).toBe('ReferralCode');
    });

    it('should have correct table name', () => {
      expect(ReferralCode.tableName).toBe('referral_codes');
    });

    it('should have timestamps enabled', () => {
      expect(ReferralCode.options.timestamps).toBe(true);
    });

    it('should have underscored enabled', () => {
      expect(ReferralCode.options.underscored).toBe(true);
    });

    it('should have paranoid enabled', () => {
      expect(ReferralCode.options.paranoid).toBe(true);
    });
  });

  describe('Model Attributes', () => {
    it('should have correct id attribute', () => {
      const idAttribute = ReferralCode.getAttributes().id;
      expect(idAttribute).toBeDefined();
      expect(idAttribute.type.constructor.name).toBe('INTEGER');
      expect(idAttribute.allowNull).toBe(false);
      expect(idAttribute.primaryKey).toBe(true);
      expect(idAttribute.autoIncrement).toBe(true);
    });

    it('should have correct user_id attribute', () => {
      const userIdAttribute = ReferralCode.getAttributes().user_id;
      expect(userIdAttribute).toBeDefined();
      expect(userIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(userIdAttribute.allowNull).toBe(true);
    });

    it('should have correct activity_id attribute', () => {
      const activityIdAttribute = ReferralCode.getAttributes().activity_id;
      expect(activityIdAttribute).toBeDefined();
      expect(activityIdAttribute.type.constructor.name).toBe('INTEGER');
      expect(activityIdAttribute.allowNull).toBe(true);
    });

    it('should have correct code attribute', () => {
      const codeAttribute = ReferralCode.getAttributes().code;
      expect(codeAttribute).toBeDefined();
      expect(codeAttribute.type.constructor.name).toBe('STRING');
      expect(codeAttribute.allowNull).toBe(true);
    });

    it('should have correct qr_code_url attribute', () => {
      const qrCodeUrlAttribute = ReferralCode.getAttributes().qr_code_url;
      expect(qrCodeUrlAttribute).toBeDefined();
      expect(qrCodeUrlAttribute.type.constructor.name).toBe('STRING');
      expect(qrCodeUrlAttribute.allowNull).toBe(true);
    });

    it('should have correct poster_url attribute', () => {
      const posterUrlAttribute = ReferralCode.getAttributes().poster_url;
      expect(posterUrlAttribute).toBeDefined();
      expect(posterUrlAttribute.type.constructor.name).toBe('STRING');
      expect(posterUrlAttribute.allowNull).toBe(true);
    });

    it('should have correct usage_count attribute', () => {
      const usageCountAttribute = ReferralCode.getAttributes().usage_count;
      expect(usageCountAttribute).toBeDefined();
      expect(usageCountAttribute.type.constructor.name).toBe('STRING');
      expect(usageCountAttribute.allowNull).toBe(true);
    });

    it('should have correct success_count attribute', () => {
      const successCountAttribute = ReferralCode.getAttributes().success_count;
      expect(successCountAttribute).toBeDefined();
      expect(successCountAttribute.type.constructor.name).toBe('STRING');
      expect(successCountAttribute.allowNull).toBe(true);
    });

    it('should have correct created_at attribute', () => {
      const createdAtAttribute = ReferralCode.getAttributes().created_at;
      expect(createdAtAttribute).toBeDefined();
      expect(createdAtAttribute.type.constructor.name).toBe('DATE');
      expect(createdAtAttribute.allowNull).toBe(true);
    });

    it('should have correct expires_at attribute', () => {
      const expiresAtAttribute = ReferralCode.getAttributes().expires_at;
      expect(expiresAtAttribute).toBeDefined();
      expect(expiresAtAttribute.type.constructor.name).toBe('STRING');
      expect(expiresAtAttribute.allowNull).toBe(true);
    });

    it('should have correct is_active attribute', () => {
      const isActiveAttribute = ReferralCode.getAttributes().is_active;
      expect(isActiveAttribute).toBeDefined();
      expect(isActiveAttribute.type.constructor.name).toBe('STRING');
      expect(isActiveAttribute.allowNull).toBe(true);
    });
  });

  describe('Model Creation', () => {
    it('should create a new referral code', async () => {
      const referralCodeData = {
        user_id: 1,
        activity_id: 1,
        code: 'TEST123',
        qr_code_url: 'https://example.com/qrcode.png',
        poster_url: 'https://example.com/poster.png',
        usage_count: '0',
        success_count: '0',
        created_at: new Date(),
        expires_at: '2025-12-31',
        is_active: '1',
      };

      const referralCode = await ReferralCode.create(referralCodeData);
      
      expect(referralCode).toBeDefined();
      expect(referralCode.id).toBeDefined();
      expect(referralCode.user_id).toBe(referralCodeData.user_id);
      expect(referralCode.activity_id).toBe(referralCodeData.activity_id);
      expect(referralCode.code).toBe(referralCodeData.code);
      expect(referralCode.qr_code_url).toBe(referralCodeData.qr_code_url);
      expect(referralCode.poster_url).toBe(referralCodeData.poster_url);
      expect(referralCode.usage_count).toBe(referralCodeData.usage_count);
      expect(referralCode.success_count).toBe(referralCodeData.success_count);
      expect(referralCode.is_active).toBe(referralCodeData.is_active);
    });

    it('should create a referral code with minimal data', async () => {
      const minimalData = {
        code: 'MINIMAL456',
      };

      const referralCode = await ReferralCode.create(minimalData);
      
      expect(referralCode).toBeDefined();
      expect(referralCode.id).toBeDefined();
      expect(referralCode.code).toBe(minimalData.code);
    });
  });

  describe('Model Validation', () => {
    it('should allow null values for optional fields', async () => {
      const referralCode = await ReferralCode.create({
        code: 'NULLTEST789',
      });

      expect(referralCode.user_id).toBeNull();
      expect(referralCode.activity_id).toBeNull();
      expect(referralCode.qr_code_url).toBeNull();
      expect(referralCode.poster_url).toBeNull();
      expect(referralCode.usage_count).toBeNull();
      expect(referralCode.success_count).toBeNull();
      expect(referralCode.created_at).toBeNull();
      expect(referralCode.expires_at).toBeNull();
      expect(referralCode.is_active).toBeNull();
    });

    it('should handle empty string values', async () => {
      const referralCode = await ReferralCode.create({
        code: '',
        usage_count: '',
        success_count: '',
        expires_at: '',
        is_active: '',
      });

      expect(referralCode.code).toBe('');
      expect(referralCode.usage_count).toBe('');
      expect(referralCode.success_count).toBe('');
      expect(referralCode.expires_at).toBe('');
      expect(referralCode.is_active).toBe('');
    });
  });

  describe('Model Updates', () => {
    it('should update referral code attributes', async () => {
      const referralCode = await ReferralCode.create({
        code: 'UPDATETEST',
        usage_count: '0',
        success_count: '0',
      });

      await referralCode.update({
        usage_count: '5',
        success_count: '3',
        is_active: '1',
      });

      const updatedReferralCode = await ReferralCode.findByPk(referralCode.id);
      expect(updatedReferralCode?.usage_count).toBe('5');
      expect(updatedReferralCode?.success_count).toBe('3');
      expect(updatedReferralCode?.is_active).toBe('1');
    });

    it('should handle partial updates', async () => {
      const referralCode = await ReferralCode.create({
        code: 'PARTIALUPDATE',
        usage_count: '0',
        success_count: '0',
        is_active: '1',
      });

      await referralCode.update({
        usage_count: '10',
      });

      const updatedReferralCode = await ReferralCode.findByPk(referralCode.id);
      expect(updatedReferralCode?.usage_count).toBe('10');
      expect(updatedReferralCode?.success_count).toBe('0'); // Should remain unchanged
      expect(updatedReferralCode?.is_active).toBe('1'); // Should remain unchanged
    });
  });

  describe('Model Queries', () => {
    it('should find referral code by id', async () => {
      const createdReferralCode = await ReferralCode.create({
        code: 'FINDBYID',
      });

      const foundReferralCode = await ReferralCode.findByPk(createdReferralCode.id);
      
      expect(foundReferralCode).toBeDefined();
      expect(foundReferralCode?.id).toBe(createdReferralCode.id);
      expect(foundReferralCode?.code).toBe('FINDBYID');
    });

    it('should find referral code by code', async () => {
      await ReferralCode.create({
        code: 'FINDBYCODE',
      });

      const foundReferralCode = await ReferralCode.findOne({
        where: { code: 'FINDBYCODE' },
      });
      
      expect(foundReferralCode).toBeDefined();
      expect(foundReferralCode?.code).toBe('FINDBYCODE');
    });

    it('should find all referral codes', async () => {
      await ReferralCode.bulkCreate([
        { code: 'FINDALL1' },
        { code: 'FINDALL2' },
        { code: 'FINDALL3' },
      ]);

      const referralCodes = await ReferralCode.findAll({
        where: {
          code: {
            [Op.or]: ['FINDALL1', 'FINDALL2', 'FINDALL3'],
          },
        },
      });
      
      expect(referralCodes).toHaveLength(3);
      expect(referralCodes.map(rc => rc.code)).toContain('FINDALL1');
      expect(referralCodes.map(rc => rc.code)).toContain('FINDALL2');
      expect(referralCodes.map(rc => rc.code)).toContain('FINDALL3');
    });
  });

  describe('Model Deletion', () => {
    it('should soft delete referral code', async () => {
      const referralCode = await ReferralCode.create({
        code: 'SOFTDELETE',
      });

      await referralCode.destroy();

      const deletedReferralCode = await ReferralCode.findByPk(referralCode.id);
      expect(deletedReferralCode).toBeNull();

      // Check if it exists in paranoid mode
      const paranoidReferralCode = await ReferralCode.findByPk(referralCode.id, {
        paranoid: false,
      });
      expect(paranoidReferralCode).toBeDefined();
    });

    it('should restore soft deleted referral code', async () => {
      const referralCode = await ReferralCode.create({
        code: 'RESTORE',
      });

      await referralCode.destroy();
      await referralCode.restore();

      const restoredReferralCode = await ReferralCode.findByPk(referralCode.id);
      expect(restoredReferralCode).toBeDefined();
      expect(restoredReferralCode?.code).toBe('RESTORE');
    });
  });

  describe('Model Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const referralCode = await ReferralCode.create({
        code: 'TIMESTAMPTEST',
      });

      expect(referralCode.createdAt).toBeDefined();
      expect(referralCode.updatedAt).toBeDefined();
      expect(referralCode.createdAt).toBeInstanceOf(Date);
      expect(referralCode.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on update', async () => {
      const referralCode = await ReferralCode.create({
        code: 'TIMESTAMPUPDATE',
      });

      const originalUpdatedAt = referralCode.updatedAt;
      
      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await referralCode.update({ usage_count: '1' });
      
      expect(referralCode.updatedAt).toBeInstanceOf(Date);
      expect(referralCode.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});