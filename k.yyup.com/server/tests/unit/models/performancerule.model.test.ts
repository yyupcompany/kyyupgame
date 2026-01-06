/**
 * PerformanceRule 模型测试用例
 * 对应模型文件: performancerule.model.ts
 */

import { PerformanceRule } from '../../../src/models/performancerule.model';
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

describe('PerformanceRule Model', () => {
  beforeAll(async () => {
    // 确保数据库连接已建立
    await sequelize.authenticate();
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sequelize.close();
  });

  beforeEach(async () => {
    // 在每个测试前清理表数据
    await PerformanceRule.destroy({ where: {} });
  });

  describe('模型定义测试', () => {
    test('PerformanceRule 模型应该正确定义', () => {
      expect(PerformanceRule).toBeDefined();
      expect(PerformanceRule.tableName).toBe('performance_rules');
    });

    test('应该包含所有必需的属性', () => {
      const attributes = Object.keys(PerformanceRule.rawAttributes);
      const requiredAttributes = [
        'id', 'name', 'description', 'calculation_method', 'target_value',
        'bonus_amount', 'start_date', 'end_date', 'is_active', 'kindergarten_id',
        'creator_id', 'updater_id', 'created_at', 'updated_at'
      ];
      
      requiredAttributes.forEach(attr => {
        expect(attributes).toContain(attr);
      });
    });
  });

  describe('字段类型和约束测试', () => {
    test('id 字段应该正确配置', () => {
      const idField = PerformanceRule.rawAttributes.id;
      expect(idField.type).toEqual(expect.objectContaining({ key: 'INTEGER' }));
      expect(idField.primaryKey).toBe(true);
      expect(idField.autoIncrement).toBe(true);
      expect(idField.allowNull).toBe(false);
    });

    test('name 字段应该正确配置', () => {
      const nameField = PerformanceRule.rawAttributes.name;
      expect(nameField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(nameField.allowNull).toBe(true);
    });

    test('calculation_method 字段应该正确配置', () => {
      const calculationMethodField = PerformanceRule.rawAttributes.calculation_method;
      expect(calculationMethodField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(calculationMethodField.allowNull).toBe(true);
    });

    test('target_value 字段应该正确配置', () => {
      const targetValueField = PerformanceRule.rawAttributes.target_value;
      expect(targetValueField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(targetValueField.allowNull).toBe(true);
    });

    test('bonus_amount 字段应该正确配置', () => {
      const bonusAmountField = PerformanceRule.rawAttributes.bonus_amount;
      expect(bonusAmountField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(bonusAmountField.allowNull).toBe(true);
    });

    test('start_date 字段应该正确配置', () => {
      const startDateField = PerformanceRule.rawAttributes.start_date;
      expect(startDateField.type).toEqual(expect.objectContaining({ key: 'DATE' }));
      expect(startDateField.allowNull).toBe(true);
    });

    test('end_date 字段应该正确配置', () => {
      const endDateField = PerformanceRule.rawAttributes.end_date;
      expect(endDateField.type).toEqual(expect.objectContaining({ key: 'DATE' }));
      expect(endDateField.allowNull).toBe(true);
    });

    test('is_active 字段应该正确配置', () => {
      const isActiveField = PerformanceRule.rawAttributes.is_active;
      expect(isActiveField.type).toEqual(expect.objectContaining({ key: 'STRING' }));
      expect(isActiveField.allowNull).toBe(true);
    });

    test('kindergarten_id 字段应该正确配置', () => {
      const kindergartenIdField = PerformanceRule.rawAttributes.kindergarten_id;
      expect(kindergartenIdField.type).toEqual(expect.objectContaining({ key: 'INTEGER' }));
      expect(kindergartenIdField.allowNull).toBe(true);
    });

    test('creator_id 字段应该正确配置', () => {
      const creatorIdField = PerformanceRule.rawAttributes.creator_id;
      expect(creatorIdField.type).toEqual(expect.objectContaining({ key: 'INTEGER' }));
      expect(creatorIdField.allowNull).toBe(true);
    });

    test('updater_id 字段应该正确配置', () => {
      const updaterIdField = PerformanceRule.rawAttributes.updater_id;
      expect(updaterIdField.type).toEqual(expect.objectContaining({ key: 'INTEGER' }));
      expect(updaterIdField.allowNull).toBe(true);
    });

    test('created_at 字段应该正确配置', () => {
      const createdAtField = PerformanceRule.rawAttributes.created_at;
      expect(createdAtField.type).toEqual(expect.objectContaining({ key: 'DATE' }));
      expect(createdAtField.allowNull).toBe(true);
    });

    test('updated_at 字段应该正确配置', () => {
      const updatedAtField = PerformanceRule.rawAttributes.updated_at;
      expect(updatedAtField.type).toEqual(expect.objectContaining({ key: 'DATE' }));
      expect(updatedAtField.allowNull).toBe(true);
    });
  });

  describe('模型配置测试', () => {
    test('应该启用时间戳', () => {
      expect(PerformanceRule.options.timestamps).toBe(true);
    });

    test('应该启用下划线命名', () => {
      expect(PerformanceRule.options.underscored).toBe(true);
    });

    test('应该启用软删除', () => {
      expect(PerformanceRule.options.paranoid).toBe(true);
    });
  });

  describe('CRUD 操作测试', () => {
    test('应该能够创建 PerformanceRule 记录', async () => {
      const ruleData = {
        name: '测试绩效规则',
        description: '这是一个测试绩效规则',
        calculation_method: 'percentage',
        target_value: '100',
        bonus_amount: '1000',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        is_active: '1',
        kindergarten_id: 1,
        creator_id: 1,
        updater_id: 1
      };

      const rule = await PerformanceRule.create(ruleData);
      
      expect(rule.id).toBeDefined();
      expect(rule.name).toBe(ruleData.name);
      expect(rule.description).toBe(ruleData.description);
      expect(rule.calculation_method).toBe(ruleData.calculation_method);
      expect(rule.target_value).toBe(ruleData.target_value);
      expect(rule.bonus_amount).toBe(ruleData.bonus_amount);
      expect(rule.start_date).toEqual(ruleData.start_date);
      expect(rule.end_date).toEqual(ruleData.end_date);
      expect(rule.is_active).toBe(ruleData.is_active);
      expect(rule.kindergarten_id).toBe(ruleData.kindergarten_id);
      expect(rule.creator_id).toBe(ruleData.creator_id);
      expect(rule.updater_id).toBe(ruleData.updater_id);
    });

    test('应该能够读取 PerformanceRule 记录', async () => {
      const ruleData = {
        name: '测试绩效规则',
        description: '这是一个测试绩效规则',
        calculation_method: 'percentage',
        target_value: '100',
        bonus_amount: '1000',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        is_active: '1',
        kindergarten_id: 1,
        creator_id: 1,
        updater_id: 1
      };

      const createdRule = await PerformanceRule.create(ruleData);
      const foundRule = await PerformanceRule.findByPk(createdRule.id);
      
      expect(foundRule).toBeDefined();
      expect(foundRule!.id).toBe(createdRule.id);
      expect(foundRule!.name).toBe(ruleData.name);
    });

    test('应该能够更新 PerformanceRule 记录', async () => {
      const ruleData = {
        name: '测试绩效规则',
        description: '这是一个测试绩效规则',
        calculation_method: 'percentage',
        target_value: '100',
        bonus_amount: '1000',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        is_active: '1',
        kindergarten_id: 1,
        creator_id: 1,
        updater_id: 1
      };

      const rule = await PerformanceRule.create(ruleData);
      
      const updateData = {
        name: '更新的绩效规则',
        description: '这是更新的绩效规则描述',
        calculation_method: 'fixed'
      };

      await rule.update(updateData);
      const updatedRule = await PerformanceRule.findByPk(rule.id);
      
      expect(updatedRule!.name).toBe(updateData.name);
      expect(updatedRule!.description).toBe(updateData.description);
      expect(updatedRule!.calculation_method).toBe(updateData.calculation_method);
    });

    test('应该能够删除 PerformanceRule 记录（软删除）', async () => {
      const ruleData = {
        name: '测试绩效规则',
        description: '这是一个测试绩效规则',
        calculation_method: 'percentage',
        target_value: '100',
        bonus_amount: '1000',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        is_active: '1',
        kindergarten_id: 1,
        creator_id: 1,
        updater_id: 1
      };

      const rule = await PerformanceRule.create(ruleData);
      const ruleId = rule.id;
      
      await rule.destroy();
      
      const foundRule = await PerformanceRule.findByPk(ruleId);
      expect(foundRule).toBeNull();
      
      // 检查软删除的记录
      const deletedRule = await PerformanceRule.findByPk(ruleId, { paranoid: false });
      expect(deletedRule).toBeDefined();
      expect(deletedRule!.deletedAt).toBeDefined();
    });
  });

  describe('查询操作测试', () => {
    beforeEach(async () => {
      // 创建测试数据
      await PerformanceRule.bulkCreate([
        {
          name: '绩效规则1',
          description: '第一个绩效规则',
          calculation_method: 'percentage',
          target_value: '100',
          bonus_amount: '1000',
          start_date: new Date('2024-01-01'),
          end_date: new Date('2024-12-31'),
          is_active: '1',
          kindergarten_id: 1,
          creator_id: 1,
          updater_id: 1
        },
        {
          name: '绩效规则2',
          description: '第二个绩效规则',
          calculation_method: 'fixed',
          target_value: '200',
          bonus_amount: '2000',
          start_date: new Date('2024-02-01'),
          end_date: new Date('2024-11-30'),
          is_active: '0',
          kindergarten_id: 2,
          creator_id: 2,
          updater_id: 2
        }
      ]);
    });

    test('应该能够查询所有 PerformanceRule 记录', async () => {
      const rules = await PerformanceRule.findAll();
      expect(rules.length).toBe(2);
    });

    test('应该能够按条件查询 PerformanceRule 记录', async () => {
      const activeRules = await PerformanceRule.findAll({
        where: { is_active: '1' }
      });
      expect(activeRules.length).toBe(1);
      expect(activeRules[0].name).toBe('绩效规则1');
    });

    test('应该能够按幼儿园ID查询 PerformanceRule 记录', async () => {
      const kindergartenRules = await PerformanceRule.findAll({
        where: { kindergarten_id: 1 }
      });
      expect(kindergartenRules.length).toBe(1);
      expect(kindergartenRules[0].name).toBe('绩效规则1');
    });

    test('应该能够按计算方法查询 PerformanceRule 记录', async () => {
      const percentageRules = await PerformanceRule.findAll({
        where: { calculation_method: 'percentage' }
      });
      expect(percentageRules.length).toBe(1);
      expect(percentageRules[0].name).toBe('绩效规则1');
    });
  });

  describe('数据验证测试', () => {
    test('应该允许所有字段为空（根据模型定义）', async () => {
      const rule = await PerformanceRule.create({});
      expect(rule.id).toBeDefined();
    });

    test('应该能够处理各种数据类型', async () => {
      const ruleData = {
        name: '测试绩效规则',
        description: '这是一个测试绩效规则',
        calculation_method: 'percentage',
        target_value: '100',
        bonus_amount: '1000.50',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        is_active: '1',
        kindergarten_id: 1,
        creator_id: 1,
        updater_id: 1
      };

      const rule = await PerformanceRule.create(ruleData);
      expect(rule.name).toBe('string');
      expect(rule.description).toBe('string');
      expect(rule.calculation_method).toBe('string');
      expect(rule.target_value).toBe('string');
      expect(rule.bonus_amount).toBe('string');
      expect(rule.start_date).toBeInstanceOf(Date);
      expect(rule.end_date).toBeInstanceOf(Date);
      expect(rule.is_active).toBe('string');
      expect(rule.kindergarten_id).toBe('number');
      expect(rule.creator_id).toBe('number');
      expect(rule.updater_id).toBe('number');
    });
  });

  describe('时间戳测试', () => {
    test('创建记录时应该自动设置时间戳', async () => {
      const rule = await PerformanceRule.create({
        name: '测试绩效规则',
        kindergarten_id: 1,
        creator_id: 1,
        updater_id: 1
      });

      expect(rule.createdAt).toBeDefined();
      expect(rule.updatedAt).toBeDefined();
      expect(rule.createdAt).toBeInstanceOf(Date);
      expect(rule.updatedAt).toBeInstanceOf(Date);
    });

    test('更新记录时应该自动更新 updated_at 时间戳', async () => {
      const rule = await PerformanceRule.create({
        name: '测试绩效规则',
        kindergarten_id: 1,
        creator_id: 1,
        updater_id: 1
      });

      const originalUpdatedAt = rule.updatedAt;
      
      // 等待1秒以确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await rule.update({ name: '更新的绩效规则' });
      
      expect(rule.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });
});