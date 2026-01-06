import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { Coupon, CouponType, DiscountType, CouponStatus, initCoupon, initCouponAssociations } from '../../../src/models/coupon.model';
import { User } from '../../../src/models/user.model';
import { Kindergarten } from '../../../src/models/kindergarten.model';
import { ParentStudentRelation } from '../../../src/models/parent-student-relation.model';


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

describe('Coupon Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    // 初始化相关模型
    User.initModel(sequelize);
    Kindergarten.initModel(sequelize);
    ParentStudentRelation.initModel(sequelize);
    initCoupon(sequelize);
    
    // 初始化关联
    initCouponAssociations();
    
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Coupon.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Kindergarten.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(Coupon.tableName).toBe('coupons');
    });

    it('should have correct attributes', () => {
      const attributes = Object.keys(Coupon.getAttributes());
      expect(attributes).toContain('id');
      expect(attributes).toContain('kindergartenId');
      expect(attributes).toContain('code');
      expect(attributes).toContain('name');
      expect(attributes).toContain('type');
      expect(attributes).toContain('discountType');
      expect(attributes).toContain('discountValue');
      expect(attributes).toContain('minAmount');
      expect(attributes).toContain('maxDiscount');
      expect(attributes).toContain('startDate');
      expect(attributes).toContain('endDate');
      expect(attributes).toContain('totalQuantity');
      expect(attributes).toContain('usedQuantity');
      expect(attributes).toContain('perUserLimit');
      expect(attributes).toContain('applicableScope');
      expect(attributes).toContain('description');
      expect(attributes).toContain('rules');
      expect(attributes).toContain('status');
      expect(attributes).toContain('creatorId');
      expect(attributes).toContain('updaterId');
    });
  });

  describe('Field Validation', () => {
    it('should require kindergartenId', async () => {
      const coupon = Coupon.build({
        code: 'TEST001',
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      } as any);

      await expect(coupon.save()).rejects.toThrow();
    });

    it('should require code', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const coupon = Coupon.build({
        kindergartenId: kindergarten.id,
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      } as any);

      await expect(coupon.save()).rejects.toThrow();
    });

    it('should require name', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const coupon = Coupon.build({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      } as any);

      await expect(coupon.save()).rejects.toThrow();
    });

    it('should require type', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const coupon = Coupon.build({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      } as any);

      await expect(coupon.save()).rejects.toThrow();
    });

    it('should require discountType', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const coupon = Coupon.build({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      } as any);

      await expect(coupon.save()).rejects.toThrow();
    });

    it('should require discountValue', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const coupon = Coupon.build({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      } as any);

      await expect(coupon.save()).rejects.toThrow();
    });

    it('should require startDate', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const coupon = Coupon.build({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      } as any);

      await expect(coupon.save()).rejects.toThrow();
    });

    it('should require endDate', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const coupon = Coupon.build({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        totalQuantity: 100,
      } as any);

      await expect(coupon.save()).rejects.toThrow();
    });

    it('should require totalQuantity', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const coupon = Coupon.build({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      } as any);

      await expect(coupon.save()).rejects.toThrow();
    });

    it('should enforce unique code constraint', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      await Coupon.create({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券1',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      });

      const coupon2 = Coupon.build({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券2',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 15,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      });

      await expect(coupon2.save()).rejects.toThrow();
    });
  });

  describe('Enum Values', () => {
    it('should accept valid CouponType values', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const couponTypes = [
        CouponType.NEW_STUDENT_REGISTRATION,
        CouponType.EVENT_PARTICIPATION,
        CouponType.REFERRAL_BONUS,
        CouponType.HOLIDAY_SPECIAL,
        CouponType.BIRTHDAY_COUPON,
        CouponType.GENERAL_COUPON,
      ];

      for (const type of couponTypes) {
        const coupon = await Coupon.create({
          kindergartenId: kindergarten.id,
          code: `TEST${type}`,
          name: '测试优惠券',
          type,
          discountType: DiscountType.FIXED_AMOUNT,
          discountValue: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
          totalQuantity: 100,
        });

        expect(coupon.type).toBe(type);
      }
    });

    it('should accept valid DiscountType values', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const discountTypes = [
        DiscountType.FIXED_AMOUNT,
        DiscountType.PERCENTAGE,
      ];

      for (const discountType of discountTypes) {
        const coupon = await Coupon.create({
          kindergartenId: kindergarten.id,
          code: `TEST${discountType}`,
          name: '测试优惠券',
          type: CouponType.GENERAL_COUPON,
          discountType,
          discountValue: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
          totalQuantity: 100,
        });

        expect(coupon.discountType).toBe(discountType);
      }
    });

    it('should accept valid CouponStatus values', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const statuses = [
        CouponStatus.DISABLED,
        CouponStatus.ACTIVE,
        CouponStatus.PAUSED,
        CouponStatus.ENDED,
      ];

      for (const status of statuses) {
        const coupon = await Coupon.create({
          kindergartenId: kindergarten.id,
          code: `TEST${status}`,
          name: '测试优惠券',
          type: CouponType.GENERAL_COUPON,
          discountType: DiscountType.FIXED_AMOUNT,
          discountValue: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
          totalQuantity: 100,
          status,
        });

        expect(coupon.status).toBe(status);
      }
    });

    it('should have default values', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const coupon = await Coupon.create({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      });

      expect(coupon.minAmount).toBe(0.0);
      expect(coupon.usedQuantity).toBe(0);
      expect(coupon.perUserLimit).toBe(1);
      expect(coupon.status).toBe(CouponStatus.DISABLED);
    });
  });

  describe('Associations', () => {
    it('should belong to kindergarten', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const coupon = await Coupon.create({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      });

      const couponWithKindergarten = await Coupon.findByPk(coupon.id, {
        include: ['kindergarten'],
      });

      expect(couponWithKindergarten?.kindergarten).toBeDefined();
      expect(couponWithKindergarten?.kindergarten?.id).toBe(kindergarten.id);
    });

    it('should belong to creator', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const coupon = await Coupon.create({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
        creatorId: creator.id,
      });

      const couponWithCreator = await Coupon.findByPk(coupon.id, {
        include: ['creator'],
      });

      expect(couponWithCreator?.creator).toBeDefined();
      expect(couponWithCreator?.creator?.id).toBe(creator.id);
    });

    it('should belong to updater', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const updater = await User.create({
        username: 'updater',
        email: 'updater@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const coupon = await Coupon.create({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
        updaterId: updater.id,
      });

      const couponWithUpdater = await Coupon.findByPk(coupon.id, {
        include: ['updater'],
      });

      expect(couponWithUpdater?.updater).toBeDefined();
      expect(couponWithUpdater?.updater?.id).toBe(updater.id);
    });
  });

  describe('CRUD Operations', () => {
    it('should create coupon successfully', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const coupon = await Coupon.create({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      });

      expect(coupon.id).toBeDefined();
      expect(coupon.kindergartenId).toBe(kindergarten.id);
      expect(coupon.code).toBe('TEST001');
      expect(coupon.name).toBe('测试优惠券');
      expect(coupon.type).toBe(CouponType.GENERAL_COUPON);
      expect(coupon.discountType).toBe(DiscountType.FIXED_AMOUNT);
      expect(coupon.discountValue).toBe(10);
    });

    it('should read coupon successfully', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const coupon = await Coupon.create({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      });

      const foundCoupon = await Coupon.findByPk(coupon.id);

      expect(foundCoupon).toBeDefined();
      expect(foundCoupon?.id).toBe(coupon.id);
      expect(foundCoupon?.code).toBe('TEST001');
    });

    it('should update coupon successfully', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const coupon = await Coupon.create({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      });

      await coupon.update({
        name: '更新后的优惠券',
        discountValue: 15,
        status: CouponStatus.ACTIVE,
      });

      const updatedCoupon = await Coupon.findByPk(coupon.id);

      expect(updatedCoupon?.name).toBe('更新后的优惠券');
      expect(updatedCoupon?.discountValue).toBe(15);
      expect(updatedCoupon?.status).toBe(CouponStatus.ACTIVE);
    });

    it('should delete coupon successfully', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      const coupon = await Coupon.create({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      });

      await coupon.destroy();

      const deletedCoupon = await Coupon.findByPk(coupon.id);

      expect(deletedCoupon).toBeNull();
    });
  });

  describe('Query Methods', () => {
    it('should find coupons by kindergarten', async () => {
      const kindergarten1 = await Kindergarten.create({
        name: '测试幼儿园1',
        address: '测试地址1',
        phone: '1234567890',
      });

      const kindergarten2 = await Kindergarten.create({
        name: '测试幼儿园2',
        address: '测试地址2',
        phone: '0987654321',
      });

      await Coupon.create({
        kindergartenId: kindergarten1.id,
        code: 'TEST001',
        name: '测试优惠券1',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      });

      await Coupon.create({
        kindergartenId: kindergarten2.id,
        code: 'TEST002',
        name: '测试优惠券2',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 15,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 50,
      });

      const kindergarten1Coupons = await Coupon.findAll({
        where: { kindergartenId: kindergarten1.id },
      });

      const kindergarten2Coupons = await Coupon.findAll({
        where: { kindergartenId: kindergarten2.id },
      });

      expect(kindergarten1Coupons.length).toBe(1);
      expect(kindergarten2Coupons.length).toBe(1);
      expect(kindergarten1Coupons[0].code).toBe('TEST001');
      expect(kindergarten2Coupons[0].code).toBe('TEST002');
    });

    it('should find coupons by status', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      await Coupon.create({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券1',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
        status: CouponStatus.ACTIVE,
      });

      await Coupon.create({
        kindergartenId: kindergarten.id,
        code: 'TEST002',
        name: '测试优惠券2',
        type: CouponType.GENERAL_COUPON,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 15,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 50,
        status: CouponStatus.DISABLED,
      });

      const activeCoupons = await Coupon.findAll({
        where: { status: CouponStatus.ACTIVE },
      });

      const disabledCoupons = await Coupon.findAll({
        where: { status: CouponStatus.DISABLED },
      });

      expect(activeCoupons.length).toBe(1);
      expect(disabledCoupons.length).toBe(1);
      expect(activeCoupons[0].code).toBe('TEST001');
      expect(disabledCoupons[0].code).toBe('TEST002');
    });

    it('should find coupons by type', async () => {
      const kindergarten = await Kindergarten.create({
        name: '测试幼儿园',
        address: '测试地址',
        phone: '1234567890',
      });

      await Coupon.create({
        kindergartenId: kindergarten.id,
        code: 'TEST001',
        name: '测试优惠券1',
        type: CouponType.NEW_STUDENT_REGISTRATION,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 100,
      });

      await Coupon.create({
        kindergartenId: kindergarten.id,
        code: 'TEST002',
        name: '测试优惠券2',
        type: CouponType.EVENT_PARTICIPATION,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 15,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        totalQuantity: 50,
      });

      const newStudentCoupons = await Coupon.findAll({
        where: { type: CouponType.NEW_STUDENT_REGISTRATION },
      });

      const eventCoupons = await Coupon.findAll({
        where: { type: CouponType.EVENT_PARTICIPATION },
      });

      expect(newStudentCoupons.length).toBe(1);
      expect(eventCoupons.length).toBe(1);
      expect(newStudentCoupons[0].code).toBe('TEST001');
      expect(eventCoupons[0].code).toBe('TEST002');
    });
  });
});