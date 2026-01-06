import { Sequelize, DataTypes } from 'sequelize';
import { vi } from 'vitest'
import { initAIModelBilling, AIModelBilling, BillingType, BillingCycle } from '../../../src/models/ai-model-billing.model';


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

describe('AIModelBilling Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });
    
    // 初始化模型
    initAIModelBilling(sequelize);
    
    // 同步数据库
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await AIModelBilling.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have the correct model name', () => {
      expect(AIModelBilling.tableName).toBe('ai_model_billing');
    });

    it('should have all required attributes', () => {
      const attributes = Object.keys(AIModelBilling.getAttributes());
      const requiredAttributes = [
        'id', 'modelId', 'billingType', 'inputTokenPrice', 'outputTokenPrice',
        'callPrice', 'discountTiers', 'billingCycle', 'balanceAlertThreshold',
        'tenantId', 'isActive', 'createdAt', 'updatedAt'
      ];
      
      requiredAttributes.forEach(attr => {
        expect(attributes).toContain(attr);
      });
    });

    it('should have correct field configurations', () => {
      const model = AIModelBilling.getAttributes();
      
      // 检查主键
      expect(model.id.primaryKey).toBe(true);
      expect(model.id.autoIncrement).toBe(true);
      
      // 检查必需字段
      expect(model.modelId.allowNull).toBe(false);
      expect(model.billingType.allowNull).toBe(false);
      
      // 检查可选字段
      expect(model.balanceAlertThreshold.allowNull).toBe(true);
      expect(model.tenantId.allowNull).toBe(true);
      expect(model.discountTiers.allowNull).toBe(true);
      
      // 检查默认值
      expect(model.inputTokenPrice.defaultValue).toBe(0.0);
      expect(model.outputTokenPrice.defaultValue).toBe(0.0);
      expect(model.callPrice.defaultValue).toBe(0.0);
      expect(model.billingCycle.defaultValue).toBe(BillingCycle.MONTHLY);
      expect(model.isActive.defaultValue).toBe(true);
      expect(model.createdAt.defaultValue).toBeDefined();
      expect(model.updatedAt.defaultValue).toBeDefined();
    });

    it('should have correct field types', () => {
      const model = AIModelBilling.getAttributes();
      
      expect(model.id.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(model.modelId.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(model.billingType.type).toBeInstanceOf(DataTypes.ENUM);
      expect(model.inputTokenPrice.type).toBeInstanceOf(DataTypes.DECIMAL);
      expect(model.outputTokenPrice.type).toBeInstanceOf(DataTypes.DECIMAL);
      expect(model.callPrice.type).toBeInstanceOf(DataTypes.DECIMAL);
      expect(model.discountTiers.type).toBeInstanceOf(DataTypes.JSON);
      expect(model.billingCycle.type).toBeInstanceOf(DataTypes.ENUM);
      expect(model.balanceAlertThreshold.type).toBeInstanceOf(DataTypes.DECIMAL);
      expect(model.tenantId.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(model.isActive.type).toBeInstanceOf(DataTypes.BOOLEAN);
    });

    it('should have correct field mappings', () => {
      const model = AIModelBilling.getAttributes();
      
      expect(model.inputTokenPrice.field).toBe('input_token_price');
      expect(model.outputTokenPrice.field).toBe('output_token_price');
      expect(model.callPrice.field).toBe('call_price');
      expect(model.discountTiers.field).toBe('discount_tiers');
      expect(model.billingCycle.field).toBe('billing_cycle');
      expect(model.balanceAlertThreshold.field).toBe('balance_alert_threshold');
      expect(model.tenantId.field).toBe('tenant_id');
      expect(model.isActive.field).toBe('is_active');
    });

    it('should have correct decimal precision', () => {
      const model = AIModelBilling.getAttributes();
      
      expect(model.inputTokenPrice.type.toString()).toContain('DECIMAL(12, 8)');
      expect(model.outputTokenPrice.type.toString()).toContain('DECIMAL(12, 8)');
      expect(model.callPrice.type.toString()).toContain('DECIMAL(10, 4)');
      expect(model.balanceAlertThreshold.type.toString()).toContain('DECIMAL(10, 2)');
    });
  });

  describe('Model Options', () => {
    it('should have correct table options', () => {
      const options = AIModelBilling.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBeUndefined(); // 没有软删除
      expect(options.underscored).toBe(true);
    });

    it('should have correct timestamp fields', () => {
      const attributes = AIModelBilling.getAttributes();
      
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.deletedAt).toBeUndefined(); // 没有软删除
    });
  });

  describe('Enum Values', () => {
    it('should have correct BillingType enum values', () => {
      expect(BillingType.TOKEN_BASED).toBe('token_based');
      expect(BillingType.CALL_BASED).toBe('call_based');
    });

    it('should have correct BillingCycle enum values', () => {
      expect(BillingCycle.HOURLY).toBe('hourly');
      expect(BillingCycle.DAILY).toBe('daily');
      expect(BillingCycle.MONTHLY).toBe('monthly');
    });

    it('should have all expected enum values', () => {
      const expectedBillingTypes = ['token_based', 'call_based'];
      const actualBillingTypes = Object.values(BillingType);
      expect(actualBillingTypes).toEqual(expect.arrayContaining(expectedBillingTypes));

      const expectedBillingCycles = ['hourly', 'daily', 'monthly'];
      const actualBillingCycles = Object.values(BillingCycle);
      expect(actualBillingCycles).toEqual(expect.arrayContaining(expectedBillingCycles));
    });
  });

  describe('Model Creation', () => {
    it('should create a new billing record with valid data', async () => {
      const billingData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.00001,
        outputTokenPrice: 0.00002,
        callPrice: 0.001,
        discountTiers: {
          tier1: { threshold: 1000000, discount: 0.1 },
          tier2: { threshold: 10000000, discount: 0.2 }
        },
        billingCycle: BillingCycle.MONTHLY,
        balanceAlertThreshold: 100.00,
        tenantId: 1,
        isActive: true,
      };

      const billing = await AIModelBilling.create(billingData);

      expect(billing.id).toBeDefined();
      expect(billing.modelId).toBe(billingData.modelId);
      expect(billing.billingType).toBe(billingData.billingType);
      expect(billing.inputTokenPrice).toBe(billingData.inputTokenPrice);
      expect(billing.outputTokenPrice).toBe(billingData.outputTokenPrice);
      expect(billing.callPrice).toBe(billingData.callPrice);
      expect(billing.discountTiers).toEqual(billingData.discountTiers);
      expect(billing.billingCycle).toBe(billingData.billingCycle);
      expect(billing.balanceAlertThreshold).toBe(billingData.balanceAlertThreshold);
      expect(billing.tenantId).toBe(billingData.tenantId);
      expect(billing.isActive).toBe(billingData.isActive);
      expect(billing.createdAt).toBeDefined();
      expect(billing.updatedAt).toBeDefined();
    });

    it('should create billing record with default values', async () => {
      const billingData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
      };

      const billing = await AIModelBilling.create(billingData);

      expect(billing.id).toBeDefined();
      expect(billing.modelId).toBe(billingData.modelId);
      expect(billing.billingType).toBe(billingData.billingType);
      expect(billing.inputTokenPrice).toBe(0.0);
      expect(billing.outputTokenPrice).toBe(0.0);
      expect(billing.callPrice).toBe(0.0);
      expect(billing.discountTiers).toBeNull();
      expect(billing.billingCycle).toBe(BillingCycle.MONTHLY);
      expect(billing.balanceAlertThreshold).toBeNull();
      expect(billing.tenantId).toBeNull();
      expect(billing.isActive).toBe(true);
      expect(billing.createdAt).toBeDefined();
      expect(billing.updatedAt).toBeDefined();
    });

    it('should create billing record with all billing types', async () => {
      const baseData = {
        modelId: 1,
      };

      for (const billingType of Object.values(BillingType)) {
        const billingData = { ...baseData, billingType };
        const billing = await AIModelBilling.create(billingData);
        
        expect(billing.billingType).toBe(billingType);
      }
    });

    it('should create billing record with all billing cycles', async () => {
      const baseData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
      };

      for (const billingCycle of Object.values(BillingCycle)) {
        const billingData = { ...baseData, billingCycle };
        const billing = await AIModelBilling.create(billingData);
        
        expect(billing.billingCycle).toBe(billingCycle);
      }
    });

    it('should fail to create billing record without required fields', async () => {
      const invalidData = {
        // 缺少 modelId, billingType
        inputTokenPrice: 0.00001,
      };

      await expect(AIModelBilling.create(invalidData as any)).rejects.toThrow();
    });

    it('should fail to create billing record with invalid enum values', async () => {
      const invalidData = {
        modelId: 1,
        billingType: 'invalid_type' as any,
      };

      await expect(AIModelBilling.create(invalidData)).rejects.toThrow();
    });
  });

  describe('Field Validation', () => {
    it('should validate billingType field', async () => {
      const validData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
      };

      // 测试所有有效枚举值
      for (const billingType of Object.values(BillingType)) {
        const data = { ...validData, billingType };
        await expect(AIModelBilling.create(data)).resolves.toBeDefined();
      }

      // 测试无效值
      const invalidData = { ...validData, billingType: 'invalid_type' };
      await expect(AIModelBilling.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate billingCycle field', async () => {
      const validData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
      };

      // 测试所有有效枚举值
      for (const billingCycle of Object.values(BillingCycle)) {
        const data = { ...validData, billingCycle };
        await expect(AIModelBilling.create(data)).resolves.toBeDefined();
      }

      // 测试无效值
      const invalidData = { ...validData, billingCycle: 'invalid_cycle' };
      await expect(AIModelBilling.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate modelId field', async () => {
      const validData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
      };

      // 测试有效值
      await expect(AIModelBilling.create(validData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, modelId: 'invalid_model_id' };
      await expect(AIModelBilling.create(invalidData as any)).rejects.toThrow();

      // 测试负值
      const negativeData = { ...validData, modelId: -1 };
      await expect(AIModelBilling.create(negativeData as any)).rejects.toThrow();
    });

    it('should validate decimal price fields', async () => {
      const validData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.00001,
        outputTokenPrice: 0.00002,
        callPrice: 0.001,
      };

      // 测试有效值
      await expect(AIModelBilling.create(validData)).resolves.toBeDefined();

      // 测试各种有效的小数值
      const validPrices = [0, 0.1, 1.0, 10.5, 0.000001, 999999.999999];
      for (const price of validPrices) {
        const data = { ...validData, inputTokenPrice: price };
        await expect(AIModelBilling.create(data)).resolves.toBeDefined();
      }

      // 测试无效值
      const invalidData = { ...validData, inputTokenPrice: 'invalid_price' };
      await expect(AIModelBilling.create(invalidData as any)).rejects.toThrow();

      // 测试负值
      const negativeData = { ...validData, inputTokenPrice: -0.01 };
      await expect(AIModelBilling.create(negativeData as any)).rejects.toThrow();
    });

    it('should validate isActive field', async () => {
      const validData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        isActive: true,
      };

      // 测试有效值
      await expect(AIModelBilling.create(validData)).resolves.toBeDefined();

      // 测试 false 值
      const falseData = { ...validData, isActive: false };
      await expect(AIModelBilling.create(falseData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, isActive: 'invalid_boolean' };
      await expect(AIModelBilling.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate tenantId field', async () => {
      const validData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
      };

      // 测试 null 值（允许）
      await expect(AIModelBilling.create(validData)).resolves.toBeDefined();

      // 测试有效值
      const validTenantData = { ...validData, tenantId: 1 };
      await expect(AIModelBilling.create(validTenantData)).resolves.toBeDefined();

      // 测试无效值
      const invalidData = { ...validData, tenantId: 'invalid_tenant_id' };
      await expect(AIModelBilling.create(invalidData as any)).rejects.toThrow();

      // 测试负值
      const negativeData = { ...validData, tenantId: -1 };
      await expect(AIModelBilling.create(negativeData as any)).rejects.toThrow();
    });

    it('should validate discountTiers field as JSON', async () => {
      const validData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
      };

      // 测试 null 值（允许）
      const nullData = await AIModelBilling.create(validData);
      expect(nullData.discountTiers).toBeNull();

      // 测试简单对象
      const simpleTiers = { tier1: { threshold: 1000000, discount: 0.1 } };
      const simpleData = await AIModelBilling.create({ ...validData, discountTiers: simpleTiers });
      expect(simpleData.discountTiers).toEqual(simpleTiers);

      // 测试复杂对象
      const complexTiers = {
        tier1: { threshold: 1000000, discount: 0.1, description: 'First tier discount' },
        tier2: { threshold: 10000000, discount: 0.2, description: 'Second tier discount' },
        tier3: { threshold: 100000000, discount: 0.3, description: 'Third tier discount' }
      };
      const complexData = await AIModelBilling.create({ ...validData, discountTiers: complexTiers });
      expect(complexData.discountTiers).toEqual(complexTiers);

      // 测试数组
      const arrayTiers = [
        { threshold: 1000000, discount: 0.1 },
        { threshold: 10000000, discount: 0.2 }
      ];
      const arrayData = await AIModelBilling.create({ ...validData, discountTiers: arrayTiers });
      expect(arrayData.discountTiers).toEqual(arrayTiers);
    });

    it('should validate balanceAlertThreshold field', async () => {
      const validData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
      };

      // 测试 null 值（允许）
      await expect(AIModelBilling.create(validData)).resolves.toBeDefined();

      // 测试有效值
      const validThresholds = [0, 0.01, 1.0, 100.5, 999999.99];
      for (const threshold of validThresholds) {
        const data = { ...validData, balanceAlertThreshold: threshold };
        await expect(AIModelBilling.create(data)).resolves.toBeDefined();
      }

      // 测试无效值
      const invalidData = { ...validData, balanceAlertThreshold: 'invalid_threshold' };
      await expect(AIModelBilling.create(invalidData as any)).rejects.toThrow();

      // 测试负值
      const negativeData = { ...validData, balanceAlertThreshold: -1.0 };
      await expect(AIModelBilling.create(negativeData as any)).rejects.toThrow();
    });
  });

  describe('Model Operations', () => {
    it('should find billing record by id', async () => {
      const billingData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.00001,
      };

      const created = await AIModelBilling.create(billingData);
      const found = await AIModelBilling.findByPk(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.modelId).toBe(billingData.modelId);
      expect(found?.billingType).toBe(billingData.billingType);
    });

    it('should update billing record', async () => {
      const billingData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.00001,
        outputTokenPrice: 0.00002,
        isActive: true,
      };

      const billing = await AIModelBilling.create(billingData);
      
      await billing.update({
        inputTokenPrice: 0.00002,
        outputTokenPrice: 0.00003,
        callPrice: 0.001,
        billingCycle: BillingCycle.DAILY,
        isActive: false,
        discountTiers: { tier1: { threshold: 1000000, discount: 0.1 } },
      });

      const updated = await AIModelBilling.findByPk(billing.id);
      
      expect(updated?.inputTokenPrice).toBe(0.00002);
      expect(updated?.outputTokenPrice).toBe(0.00003);
      expect(updated?.callPrice).toBe(0.001);
      expect(updated?.billingCycle).toBe(BillingCycle.DAILY);
      expect(updated?.isActive).toBe(false);
      expect(updated?.discountTiers).toEqual({ tier1: { threshold: 1000000, discount: 0.1 } });
    });

    it('should delete billing record (hard delete)', async () => {
      const billingData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
      };

      const billing = await AIModelBilling.create(billingData);
      
      await billing.destroy();

      const deleted = await AIModelBilling.findByPk(billing.id);
      expect(deleted).toBeNull();
    });

    it('should list all billing records', async () => {
      const billingData1 = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.00001,
      };

      const billingData2 = {
        modelId: 2,
        billingType: BillingType.CALL_BASED,
        callPrice: 0.001,
      };

      const billingData3 = {
        modelId: 3,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.00002,
        billingCycle: BillingCycle.HOURLY,
      };

      await AIModelBilling.create(billingData1);
      await AIModelBilling.create(billingData2);
      await AIModelBilling.create(billingData3);

      const billingRecords = await AIModelBilling.findAll();
      
      expect(billingRecords).toHaveLength(3);
      expect(billingRecords[0].billingType).toBe(BillingType.TOKEN_BASED);
      expect(billingRecords[1].billingType).toBe(BillingType.CALL_BASED);
      expect(billingRecords[2].billingType).toBe(BillingType.TOKEN_BASED);
    });

    it('should update timestamps automatically', async () => {
      const billing = await AIModelBilling.create({
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
      });

      const originalUpdatedAt = billing.updatedAt;
      
      // 等待一小段时间
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await billing.update({
        inputTokenPrice: 0.00002,
      });

      const updated = await AIModelBilling.findByPk(billing.id);
      
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Query Operations', () => {
    it('should filter billing records by modelId', async () => {
      const billingData1 = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.00001,
      };

      const billingData2 = {
        modelId: 2,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.00002,
      };

      const billingData3 = {
        modelId: 1,
        billingType: BillingType.CALL_BASED,
        callPrice: 0.001,
      };

      await AIModelBilling.create(billingData1);
      await AIModelBilling.create(billingData2);
      await AIModelBilling.create(billingData3);

      const model1Billing = await AIModelBilling.findAll({
        where: { modelId: 1 }
      });
      
      expect(model1Billing).toHaveLength(2);
      expect(model1Billing.every(b => b.modelId === 1)).toBe(true);

      const model2Billing = await AIModelBilling.findAll({
        where: { modelId: 2 }
      });
      
      expect(model2Billing).toHaveLength(1);
      expect(model2Billing[0].modelId).toBe(2);
    });

    it('should filter billing records by billingType', async () => {
      const billingData1 = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.00001,
      };

      const billingData2 = {
        modelId: 2,
        billingType: BillingType.CALL_BASED,
        callPrice: 0.001,
      };

      const billingData3 = {
        modelId: 3,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.00002,
      };

      await AIModelBilling.create(billingData1);
      await AIModelBilling.create(billingData2);
      await AIModelBilling.create(billingData3);

      const tokenBasedBilling = await AIModelBilling.findAll({
        where: { billingType: BillingType.TOKEN_BASED }
      });
      
      expect(tokenBasedBilling).toHaveLength(2);
      expect(tokenBasedBilling.every(b => b.billingType === BillingType.TOKEN_BASED)).toBe(true);

      const callBasedBilling = await AIModelBilling.findAll({
        where: { billingType: BillingType.CALL_BASED }
      });
      
      expect(callBasedBilling).toHaveLength(1);
      expect(callBasedBilling[0].billingType).toBe(BillingType.CALL_BASED);
    });

    it('should filter billing records by billingCycle', async () => {
      const billingData1 = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        billingCycle: BillingCycle.HOURLY,
      };

      const billingData2 = {
        modelId: 2,
        billingType: BillingType.TOKEN_BASED,
        billingCycle: BillingCycle.DAILY,
      };

      const billingData3 = {
        modelId: 3,
        billingType: BillingType.TOKEN_BASED,
        billingCycle: BillingCycle.MONTHLY,
      };

      await AIModelBilling.create(billingData1);
      await AIModelBilling.create(billingData2);
      await AIModelBilling.create(billingData3);

      const hourlyBilling = await AIModelBilling.findAll({
        where: { billingCycle: BillingCycle.HOURLY }
      });
      
      expect(hourlyBilling).toHaveLength(1);
      expect(hourlyBilling[0].billingCycle).toBe(BillingCycle.HOURLY);

      const dailyBilling = await AIModelBilling.findAll({
        where: { billingCycle: BillingCycle.DAILY }
      });
      
      expect(dailyBilling).toHaveLength(1);
      expect(dailyBilling[0].billingCycle).toBe(BillingCycle.DAILY);

      const monthlyBilling = await AIModelBilling.findAll({
        where: { billingCycle: BillingCycle.MONTHLY }
      });
      
      expect(monthlyBilling).toHaveLength(1);
      expect(monthlyBilling[0].billingCycle).toBe(BillingCycle.MONTHLY);
    });

    it('should filter billing records by isActive status', async () => {
      const billingData1 = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        isActive: true,
      };

      const billingData2 = {
        modelId: 2,
        billingType: BillingType.TOKEN_BASED,
        isActive: false,
      };

      const billingData3 = {
        modelId: 3,
        billingType: BillingType.TOKEN_BASED,
        isActive: true,
      };

      await AIModelBilling.create(billingData1);
      await AIModelBilling.create(billingData2);
      await AIModelBilling.create(billingData3);

      const activeBilling = await AIModelBilling.findAll({
        where: { isActive: true }
      });
      
      expect(activeBilling).toHaveLength(2);
      expect(activeBilling.every(b => b.isActive === true)).toBe(true);

      const inactiveBilling = await AIModelBilling.findAll({
        where: { isActive: false }
      });
      
      expect(inactiveBilling).toHaveLength(1);
      expect(inactiveBilling[0].isActive).toBe(false);
    });

    it('should filter billing records by tenantId', async () => {
      const billingData1 = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        tenantId: 1,
      };

      const billingData2 = {
        modelId: 2,
        billingType: BillingType.TOKEN_BASED,
        tenantId: 2,
      };

      const billingData3 = {
        modelId: 3,
        billingType: BillingType.TOKEN_BASED,
        tenantId: 1,
      };

      await AIModelBilling.create(billingData1);
      await AIModelBilling.create(billingData2);
      await AIModelBilling.create(billingData3);

      const tenant1Billing = await AIModelBilling.findAll({
        where: { tenantId: 1 }
      });
      
      expect(tenant1Billing).toHaveLength(2);
      expect(tenant1Billing.every(b => b.tenantId === 1)).toBe(true);

      const tenant2Billing = await AIModelBilling.findAll({
        where: { tenantId: 2 }
      });
      
      expect(tenant2Billing).toHaveLength(1);
      expect(tenant2Billing[0].tenantId).toBe(2);

      const nullTenantBilling = await AIModelBilling.findAll({
        where: { tenantId: null }
      });
      
      expect(nullTenantBilling).toHaveLength(0);
    });

    it('should filter billing records by price ranges', async () => {
      const billingData1 = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.00001,
      };

      const billingData2 = {
        modelId: 2,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.0001,
      };

      const billingData3 = {
        modelId: 3,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.001,
      };

      await AIModelBilling.create(billingData1);
      await AIModelBilling.create(billingData2);
      await AIModelBilling.create(billingData3);

      const lowPriceBilling = await AIModelBilling.findAll({
        where: { 
          inputTokenPrice: { [Sequelize.Op.lte]: 0.00005 }
        }
      });
      
      expect(lowPriceBilling).toHaveLength(1);
      expect(lowPriceBilling[0].inputTokenPrice).toBe(0.00001);

      const highPriceBilling = await AIModelBilling.findAll({
        where: { 
          inputTokenPrice: { [Sequelize.Op.gte]: 0.0005 }
        }
      });
      
      expect(highPriceBilling).toHaveLength(1);
      expect(highPriceBilling[0].inputTokenPrice).toBe(0.001);

      const mediumPriceBilling = await AIModelBilling.findAll({
        where: { 
          inputTokenPrice: { 
            [Sequelize.Op.gt]: 0.00001, 
            [Sequelize.Op.lt]: 0.001 
          }
        }
      });
      
      expect(mediumPriceBilling).toHaveLength(1);
      expect(mediumPriceBilling[0].inputTokenPrice).toBe(0.0001);
    });

    it('should filter billing records by balance alert threshold', async () => {
      const billingData1 = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        balanceAlertThreshold: 50.00,
      };

      const billingData2 = {
        modelId: 2,
        billingType: BillingType.TOKEN_BASED,
        balanceAlertThreshold: 100.00,
      };

      const billingData3 = {
        modelId: 3,
        billingType: BillingType.TOKEN_BASED,
        balanceAlertThreshold: 200.00,
      };

      await AIModelBilling.create(billingData1);
      await AIModelBilling.create(billingData2);
      await AIModelBilling.create(billingData3);

      const lowThresholdBilling = await AIModelBilling.findAll({
        where: { 
          balanceAlertThreshold: { [Sequelize.Op.lte]: 75.00 }
        }
      });
      
      expect(lowThresholdBilling).toHaveLength(1);
      expect(lowThresholdBilling[0].balanceAlertThreshold).toBe(50.00);

      const highThresholdBilling = await AIModelBilling.findAll({
        where: { 
          balanceAlertThreshold: { [Sequelize.Op.gte]: 150.00 }
        }
      });
      
      expect(highThresholdBilling).toHaveLength(1);
      expect(highThresholdBilling[0].balanceAlertThreshold).toBe(200.00);

      const nullThresholdBilling = await AIModelBilling.findAll({
        where: { 
          balanceAlertThreshold: null
        }
      });
      
      expect(nullThresholdBilling).toHaveLength(0);
    });
  });

  describe('Complex Queries', () => {
    it('should filter by multiple conditions', async () => {
      const billingData1 = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        billingCycle: BillingCycle.MONTHLY,
        isActive: true,
      };

      const billingData2 = {
        modelId: 2,
        billingType: BillingType.TOKEN_BASED,
        billingCycle: BillingCycle.DAILY,
        isActive: false,
      };

      const billingData3 = {
        modelId: 3,
        billingType: BillingType.CALL_BASED,
        billingCycle: BillingCycle.MONTHLY,
        isActive: true,
      };

      await AIModelBilling.create(billingData1);
      await AIModelBilling.create(billingData2);
      await AIModelBilling.create(billingData3);

      // 查找活跃的token计费记录
      const activeTokenBilling = await AIModelBilling.findAll({
        where: {
          billingType: BillingType.TOKEN_BASED,
          isActive: true
        }
      });
      
      expect(activeTokenBilling).toHaveLength(1);
      expect(activeTokenBilling[0].billingType).toBe(BillingType.TOKEN_BASED);
      expect(activeTokenBilling[0].isActive).toBe(true);

      // 查找月度计费记录
      const monthlyBilling = await AIModelBilling.findAll({
        where: {
          billingCycle: BillingCycle.MONTHLY
        }
      });
      
      expect(monthlyBilling).toHaveLength(2);
      expect(monthlyBilling.every(b => b.billingCycle === BillingCycle.MONTHLY)).toBe(true);

      // 复杂查询：活跃的月度token计费记录
      const complexQueryBilling = await AIModelBilling.findAll({
        where: {
          billingType: BillingType.TOKEN_BASED,
          billingCycle: BillingCycle.MONTHLY,
          isActive: true
        }
      });
      
      expect(complexQueryBilling).toHaveLength(1);
      expect(complexQueryBilling[0].billingType).toBe(BillingType.TOKEN_BASED);
      expect(complexQueryBilling[0].billingCycle).toBe(BillingCycle.MONTHLY);
      expect(complexQueryBilling[0].isActive).toBe(true);
    });

    it('should order billing records by price', async () => {
      const billingData1 = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.00001,
      };

      const billingData2 = {
        modelId: 2,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.0001,
      };

      const billingData3 = {
        modelId: 3,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.001,
      };

      await AIModelBilling.create(billingData1);
      await AIModelBilling.create(billingData2);
      await AIModelBilling.create(billingData3);

      const ascendingOrder = await AIModelBilling.findAll({
        order: [['inputTokenPrice', 'ASC']]
      });
      
      expect(ascendingOrder).toHaveLength(3);
      expect(ascendingOrder[0].inputTokenPrice).toBe(0.00001);
      expect(ascendingOrder[1].inputTokenPrice).toBe(0.0001);
      expect(ascendingOrder[2].inputTokenPrice).toBe(0.001);

      const descendingOrder = await AIModelBilling.findAll({
        order: [['inputTokenPrice', 'DESC']]
      });
      
      expect(descendingOrder).toHaveLength(3);
      expect(descendingOrder[0].inputTokenPrice).toBe(0.001);
      expect(descendingOrder[1].inputTokenPrice).toBe(0.0001);
      expect(descendingOrder[2].inputTokenPrice).toBe(0.00001);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small decimal values', async () => {
      const smallValues = [0.00000001, 0.0000001, 0.000001];
      
      for (const price of smallValues) {
        const billingData = {
          modelId: 1,
          billingType: BillingType.TOKEN_BASED,
          inputTokenPrice: price,
        };

        const billing = await AIModelBilling.create(billingData);
        expect(billing.inputTokenPrice).toBe(price);
      }
    });

    it('should handle very large decimal values', async () => {
      const largeValues = [999999.999999, 1000000.0, 1234567.89];
      
      for (const price of largeValues) {
        const billingData = {
          modelId: 1,
          billingType: BillingType.TOKEN_BASED,
          balanceAlertThreshold: price,
        };

        const billing = await AIModelBilling.create(billingData);
        expect(billing.balanceAlertThreshold).toBe(price);
      }
    });

    it('should handle complex discount tiers', async () => {
      const complexTiers = {
        tiers: [
          {
            name: 'Bronze',
            threshold: 1000000,
            discount: 0.05,
            description: 'Bronze tier discount',
            conditions: ['minimum_usage', 'verified_account']
          },
          {
            name: 'Silver',
            threshold: 10000000,
            discount: 0.15,
            description: 'Silver tier discount',
            conditions: ['minimum_usage', 'verified_account', 'long_term_customer']
          },
          {
            name: 'Gold',
            threshold: 100000000,
            discount: 0.25,
            description: 'Gold tier discount',
            conditions: ['minimum_usage', 'verified_account', 'long_term_customer', 'premium_support']
          }
        ],
        currency: 'USD',
        validUntil: '2024-12-31T23:59:59Z',
        terms: 'Discount terms and conditions apply'
      };

      const billingData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        discountTiers: complexTiers,
      };

      const billing = await AIModelBilling.create(billingData);
      expect(billing.discountTiers).toEqual(complexTiers);
    });

    it('should handle zero values correctly', async () => {
      const billingData = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0,
        outputTokenPrice: 0,
        callPrice: 0,
        balanceAlertThreshold: 0,
      };

      const billing = await AIModelBilling.create(billingData);
      
      expect(billing.inputTokenPrice).toBe(0);
      expect(billing.outputTokenPrice).toBe(0);
      expect(billing.callPrice).toBe(0);
      expect(billing.balanceAlertThreshold).toBe(0);
    });

    it('should handle concurrent updates', async () => {
      const billing = await AIModelBilling.create({
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        inputTokenPrice: 0.00001,
        isActive: true,
      });

      // 并发更新
      const update1 = billing.update({ inputTokenPrice: 0.00002 });
      const update2 = billing.update({ inputTokenPrice: 0.00003 });
      
      await Promise.all([update1, update2]);
      
      const updated = await AIModelBilling.findByPk(billing.id);
      expect(updated?.inputTokenPrice).toBe(0.00003); // 最后一个更新生效
    });

    it('should handle bulk operations', async () => {
      const billingDataArray = [
        {
          modelId: 1,
          billingType: BillingType.TOKEN_BASED,
          inputTokenPrice: 0.00001,
        },
        {
          modelId: 2,
          billingType: BillingType.CALL_BASED,
          callPrice: 0.001,
        },
        {
          modelId: 3,
          billingType: BillingType.TOKEN_BASED,
          inputTokenPrice: 0.00002,
          billingCycle: BillingCycle.HOURLY,
        },
      ];

      const createdBilling = await AIModelBilling.bulkCreate(billingDataArray);
      
      expect(createdBilling).toHaveLength(3);
      expect(createdBilling[0].modelId).toBe(1);
      expect(createdBilling[1].modelId).toBe(2);
      expect(createdBilling[2].modelId).toBe(3);

      // 批量更新
      await AIModelBilling.update(
        { isActive: false },
        { where: { billingType: BillingType.TOKEN_BASED } }
      );

      const updatedBilling = await AIModelBilling.findAll({
        where: { billingType: BillingType.TOKEN_BASED }
      });
      
      expect(updatedBilling).toHaveLength(2);
      expect(updatedBilling.every(b => b.isActive === false)).toBe(true);
    });

    it('should handle JSON field queries', async () => {
      const billingData1 = {
        modelId: 1,
        billingType: BillingType.TOKEN_BASED,
        discountTiers: { tier1: { threshold: 1000000, discount: 0.1 } },
      };

      const billingData2 = {
        modelId: 2,
        billingType: BillingType.TOKEN_BASED,
        discountTiers: { tier1: { threshold: 5000000, discount: 0.15 } },
      };

      const billingData3 = {
        modelId: 3,
        billingType: BillingType.TOKEN_BASED,
        discountTiers: null,
      };

      await AIModelBilling.create(billingData1);
      await AIModelBilling.create(billingData2);
      await AIModelBilling.create(billingData3);

      // 查询有折扣层级的记录
      const withTiers = await AIModelBilling.findAll({
        where: {
          discountTiers: { [Sequelize.Op.ne]: null }
        }
      });
      
      expect(withTiers).toHaveLength(2);
      expect(withTiers.every(b => b.discountTiers !== null)).toBe(true);

      // 查询没有折扣层级的记录
      const withoutTiers = await AIModelBilling.findAll({
        where: {
          discountTiers: null
        }
      });
      
      expect(withoutTiers).toHaveLength(1);
      expect(withoutTiers[0].discountTiers).toBeNull();
    });
  });
});