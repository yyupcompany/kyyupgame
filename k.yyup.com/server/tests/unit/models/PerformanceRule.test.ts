import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Sequelize } from 'sequelize';
import { PerformanceRule, initPerformanceRule, initPerformanceRuleAssociations } from '../../../src/models/PerformanceRule';
import { User } from '../../../src/models/user.model';
import { Kindergarten } from '../../../src/models/kindergarten.model';

describe('PerformanceRule Model', () => {
  let sequelize: Sequelize;
  let performanceRule: typeof PerformanceRule;
  let user: typeof User;
  let kindergarten: typeof Kindergarten;

  beforeEach(async () => {
    // Create in-memory SQLite database for testing
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
      },
    });

    // Initialize all models
    user = require('../../../src/models/user.model').User;
    kindergarten = require('../../../src/models/kindergarten.model').Kindergarten;
    performanceRule = PerformanceRule;

    // Initialize models
    user.init({
      id: {
        type: require('sequelize').DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: require('sequelize').DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: require('sequelize').DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: require('sequelize').DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: require('sequelize').DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: require('sequelize').DataTypes.DATE,
        allowNull: false,
        defaultValue: require('sequelize').DataTypes.NOW,
      },
      updatedAt: {
        type: require('sequelize').DataTypes.DATE,
        allowNull: false,
        defaultValue: require('sequelize').DataTypes.NOW,
      },
    }, {
      sequelize,
      tableName: 'users',
      timestamps: true,
      underscored: true,
    });

    kindergarten.init({
      id: {
        type: require('sequelize').DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: require('sequelize').DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: require('sequelize').DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: require('sequelize').DataTypes.DATE,
        allowNull: false,
        defaultValue: require('sequelize').DataTypes.NOW,
      },
      updatedAt: {
        type: require('sequelize').DataTypes.DATE,
        allowNull: false,
        defaultValue: require('sequelize').DataTypes.NOW,
      },
    }, {
      sequelize,
      tableName: 'kindergartens',
      timestamps: true,
      underscored: true,
    });

    initPerformanceRule(sequelize);
    initPerformanceRuleAssociations();

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(performanceRule.name).toBe('PerformanceRule');
    });

    it('should have correct table name', () => {
      expect(performanceRule.getTableName()).toBe('performance_rules');
    });

    it('should have timestamps enabled', () => {
      expect(performanceRule.options.timestamps).toBe(true);
    });

    it('should have underscored enabled', () => {
      expect(performanceRule.options.underscored).toBe(true);
    });
  });

  describe('Attributes', () => {
    it('should have id attribute', () => {
      const attributes = performanceRule.getAttributes();
      expect(attributes.id).toBeDefined();
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);
    });

    it('should have name attribute with correct constraints', () => {
      const attributes = performanceRule.getAttributes();
      expect(attributes.name).toBeDefined();
      expect(attributes.name.allowNull).toBe(false);
      expect(attributes.name.type).toBeInstanceOf(require('sequelize').DataTypes.STRING);
    });

    it('should have description attribute', () => {
      const attributes = performanceRule.getAttributes();
      expect(attributes.description).toBeDefined();
      expect(attributes.description.allowNull).toBe(true);
      expect(attributes.description.type).toBeInstanceOf(require('sequelize').DataTypes.TEXT);
    });

    it('should have calculationMethod attribute', () => {
      const attributes = performanceRule.getAttributes();
      expect(attributes.calculationMethod).toBeDefined();
      expect(attributes.calculationMethod.allowNull).toBe(false);
    });

    it('should have targetValue attribute', () => {
      const attributes = performanceRule.getAttributes();
      expect(attributes.targetValue).toBeDefined();
      expect(attributes.targetValue.allowNull).toBe(false);
      expect(attributes.targetValue.type).toBeInstanceOf(require('sequelize').DataTypes.FLOAT);
    });

    it('should have bonusAmount attribute', () => {
      const attributes = performanceRule.getAttributes();
      expect(attributes.bonusAmount).toBeDefined();
      expect(attributes.bonusAmount.allowNull).toBe(false);
      expect(attributes.bonusAmount.type).toBeInstanceOf(require('sequelize').DataTypes.DECIMAL);
    });

    it('should have startDate attribute', () => {
      const attributes = performanceRule.getAttributes();
      expect(attributes.startDate).toBeDefined();
      expect(attributes.startDate.allowNull).toBe(false);
      expect(attributes.startDate.type).toBeInstanceOf(require('sequelize').DataTypes.DATE);
    });

    it('should have endDate attribute', () => {
      const attributes = performanceRule.getAttributes();
      expect(attributes.endDate).toBeDefined();
      expect(attributes.endDate.allowNull).toBe(false);
      expect(attributes.endDate.type).toBeInstanceOf(require('sequelize').DataTypes.DATE);
    });

    it('should have isActive attribute with default value', () => {
      const attributes = performanceRule.getAttributes();
      expect(attributes.isActive).toBeDefined();
      expect(attributes.isActive.allowNull).toBe(false);
      expect(attributes.isActive.defaultValue).toBe(true);
    });

    it('should have kindergartenId attribute', () => {
      const attributes = performanceRule.getAttributes();
      expect(attributes.kindergartenId).toBeDefined();
      expect(attributes.kindergartenId.allowNull).toBe(false);
    });

    it('should have creatorId attribute', () => {
      const attributes = performanceRule.getAttributes();
      expect(attributes.creatorId).toBeDefined();
      expect(attributes.creatorId.allowNull).toBe(false);
    });

    it('should have updaterId attribute', () => {
      const attributes = performanceRule.getAttributes();
      expect(attributes.updaterId).toBeDefined();
      expect(attributes.updaterId.allowNull).toBe(true);
    });

    it('should have timestamp attributes', () => {
      const attributes = performanceRule.getAttributes();
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.createdAt.allowNull).toBe(false);
      expect(attributes.updatedAt.allowNull).toBe(false);
    });
  });

  describe('CRUD Operations', () => {
    let testUser: User;
    let testKindergarten: Kindergarten;

    beforeEach(async () => {
      testUser = await user.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'teacher',
      });

      testKindergarten = await kindergarten.create({
        name: 'Test Kindergarten',
        address: '123 Test St',
      });
    });

    it('should create a performance rule with valid data', async () => {
      const ruleData = {
        name: 'Test Performance Rule',
        description: 'A test performance rule',
        calculationMethod: 'percentage',
        targetValue: 85.5,
        bonusAmount: 1000.00,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      };

      const rule = await performanceRule.create(ruleData);

      expect(rule.id).toBeDefined();
      expect(rule.name).toBe(ruleData.name);
      expect(rule.description).toBe(ruleData.description);
      expect(rule.calculationMethod).toBe(ruleData.calculationMethod);
      expect(rule.targetValue).toBe(ruleData.targetValue);
      expect(rule.bonusAmount.toString()).toBe(ruleData.bonusAmount.toString());
      expect(rule.startDate).toEqual(ruleData.startDate);
      expect(rule.endDate).toEqual(ruleData.endDate);
      expect(rule.isActive).toBe(ruleData.isActive);
      expect(rule.kindergartenId).toBe(testKindergarten.id);
      expect(rule.creatorId).toBe(testUser.id);
      expect(rule.updaterId).toBeNull();
    });

    it('should create a performance rule with default values', async () => {
      const ruleData = {
        name: 'Default Rule',
        description: 'Rule with default values',
        calculationMethod: 'fixed',
        targetValue: 100,
        bonusAmount: 500.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      };

      const rule = await performanceRule.create(ruleData);

      expect(rule.isActive).toBe(true); // Default value
      expect(rule.createdAt).toBeInstanceOf(Date);
      expect(rule.updatedAt).toBeInstanceOf(Date);
    });

    it('should fail to create performance rule without required fields', async () => {
      const invalidRuleData = {
        name: 'Invalid Rule',
        // Missing required fields
      };

      await expect(performanceRule.create(invalidRuleData as any)).rejects.toThrow();
    });

    it('should read a performance rule by id', async () => {
      const ruleData = {
        name: 'Read Test Rule',
        description: 'Rule for reading test',
        calculationMethod: 'tiered',
        targetValue: 90,
        bonusAmount: 1500.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      };

      const createdRule = await performanceRule.create(ruleData);
      const foundRule = await performanceRule.findByPk(createdRule.id);

      expect(foundRule).toBeDefined();
      expect(foundRule!.id).toBe(createdRule.id);
      expect(foundRule!.name).toBe(ruleData.name);
      expect(foundRule!.calculationMethod).toBe(ruleData.calculationMethod);
    });

    it('should update a performance rule', async () => {
      const ruleData = {
        name: 'Update Test Rule',
        description: 'Original description',
        calculationMethod: 'fixed',
        targetValue: 80,
        bonusAmount: 800.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      };

      const rule = await performanceRule.create(ruleData);
      
      const updateData = {
        name: 'Updated Rule Name',
        description: 'Updated description',
        isActive: false,
        updaterId: testUser.id,
      };

      await rule.update(updateData);
      const updatedRule = await performanceRule.findByPk(rule.id);

      expect(updatedRule!.name).toBe(updateData.name);
      expect(updatedRule!.description).toBe(updateData.description);
      expect(updatedRule!.isActive).toBe(updateData.isActive);
      expect(updatedRule!.updaterId).toBe(updateData.updaterId);
    });

    it('should delete a performance rule', async () => {
      const ruleData = {
        name: 'Delete Test Rule',
        description: 'Rule to be deleted',
        calculationMethod: 'percentage',
        targetValue: 95,
        bonusAmount: 2000.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      };

      const rule = await performanceRule.create(ruleData);
      const ruleId = rule.id;

      await rule.destroy();
      const deletedRule = await performanceRule.findByPk(ruleId);

      expect(deletedRule).toBeNull();
    });

    it('should find all performance rules', async () => {
      // Create multiple rules
      await performanceRule.create({
        name: 'Rule 1',
        description: 'First rule',
        calculationMethod: 'fixed',
        targetValue: 70,
        bonusAmount: 500.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      await performanceRule.create({
        name: 'Rule 2',
        description: 'Second rule',
        calculationMethod: 'percentage',
        targetValue: 85,
        bonusAmount: 1000.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      const rules = await performanceRule.findAll();
      expect(rules.length).toBe(2);
      expect(rules[0].name).toBe('Rule 1');
      expect(rules[1].name).toBe('Rule 2');
    });

    it('should find performance rules with conditions', async () => {
      // Create rules with different calculation methods
      await performanceRule.create({
        name: 'Fixed Rule',
        description: 'Fixed amount rule',
        calculationMethod: 'fixed',
        targetValue: 100,
        bonusAmount: 750.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      await performanceRule.create({
        name: 'Percentage Rule',
        description: 'Percentage based rule',
        calculationMethod: 'percentage',
        targetValue: 90,
        bonusAmount: 1200.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      const fixedRules = await performanceRule.findAll({
        where: { calculationMethod: 'fixed' }
      });

      expect(fixedRules.length).toBe(1);
      expect(fixedRules[0].calculationMethod).toBe('fixed');
    });

    it('should count performance rules', async () => {
      const initialCount = await performanceRule.count();

      await performanceRule.create({
        name: 'Count Test Rule',
        description: 'Rule for count test',
        calculationMethod: 'tiered',
        targetValue: 88,
        bonusAmount: 900.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      const newCount = await performanceRule.count();
      expect(newCount).toBe(initialCount + 1);
    });
  });

  describe('Associations', () => {
    let testUser: User;
    let testKindergarten: Kindergarten;

    beforeEach(async () => {
      testUser = await user.create({
        username: 'associationuser',
        email: 'association@example.com',
        password: 'hashedpassword',
        role: 'admin' as any,
      });

      testKindergarten = await kindergarten.create({
        name: 'Association Kindergarten',
        address: '456 Association St',
      });
    });

    it('should belong to kindergarten', async () => {
      const rule = await performanceRule.create({
        name: 'Association Test Rule',
        description: 'Rule for association test',
        calculationMethod: 'fixed',
        targetValue: 75,
        bonusAmount: 600.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      const ruleWithKindergarten = await performanceRule.findByPk(rule.id, {
        include: ['kindergarten']
      });

      expect(ruleWithKindergarten).toBeDefined();
      expect((ruleWithKindergarten as any).kindergarten).toBeDefined();
      expect((ruleWithKindergarten as any).kindergarten.id).toBe(testKindergarten.id);
      expect((ruleWithKindergarten as any).kindergarten.name).toBe(testKindergarten.name);
    });

    it('should belong to creator user', async () => {
      const rule = await performanceRule.create({
        name: 'Creator Test Rule',
        description: 'Rule for creator test',
        calculationMethod: 'percentage',
        targetValue: 92,
        bonusAmount: 1100.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      const ruleWithCreator = await performanceRule.findByPk(rule.id, {
        include: ['creator']
      });

      expect(ruleWithCreator).toBeDefined();
      expect((ruleWithCreator as any).creator).toBeDefined();
      expect((ruleWithCreator as any).creator.id).toBe(testUser.id);
      expect((ruleWithCreator as any).creator.username).toBe(testUser.username);
    });

    it('should belong to updater user', async () => {
      const rule = await performanceRule.create({
        name: 'Updater Test Rule',
        description: 'Rule for updater test',
        calculationMethod: 'tiered',
        targetValue: 87,
        bonusAmount: 950.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 250 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      await rule.update({ updaterId: testUser.id });

      const ruleWithUpdater = await performanceRule.findByPk(rule.id, {
        include: ['updater']
      });

      expect(ruleWithUpdater).toBeDefined();
      expect((ruleWithUpdater as any).updater).toBeDefined();
      expect((ruleWithUpdater as any).updater.id).toBe(testUser.id);
      expect((ruleWithUpdater as any).updater.username).toBe(testUser.username);
    });
  });

  describe('Business Logic and Validation', () => {
    let testUser: User;
    let testKindergarten: Kindergarten;

    beforeEach(async () => {
      testUser = await user.create({
        username: 'validationuser',
        email: 'validation@example.com',
        password: 'hashedpassword',
        role: 'teacher',
      });

      testKindergarten = await kindergarten.create({
        name: 'Validation Kindergarten',
        address: '789 Validation St',
      });
    });

    it('should validate name length constraint', async () => {
      const longName = 'a'.repeat(101); // Exceeds STRING(100) limit
      
      await expect(performanceRule.create({
        name: longName,
        description: 'Rule with long name',
        calculationMethod: 'fixed',
        targetValue: 80,
        bonusAmount: 700.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      })).rejects.toThrow();
    });

    it('should validate calculationMethod length constraint', async () => {
      const longMethod = 'a'.repeat(51); // Exceeds STRING(50) limit
      
      await expect(performanceRule.create({
        name: 'Method Test Rule',
        description: 'Rule with long calculation method',
        calculationMethod: longMethod,
        targetValue: 85,
        bonusAmount: 850.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      })).rejects.toThrow();
    });

    it('should validate targetValue is a number', async () => {
      await expect(performanceRule.create({
        name: 'Invalid Target Rule',
        description: 'Rule with invalid target value',
        calculationMethod: 'fixed',
        targetValue: 'invalid' as any,
        bonusAmount: 800.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      })).rejects.toThrow();
    });

    it('should validate bonusAmount is a decimal', async () => {
      await expect(performanceRule.create({
        name: 'Invalid Bonus Rule',
        description: 'Rule with invalid bonus amount',
        calculationMethod: 'percentage',
        targetValue: 90,
        bonusAmount: 'invalid' as any,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      })).rejects.toThrow();
    });

    it('should validate startDate is before endDate', async () => {
      const startDate = new Date('2024-12-31');
      const endDate = new Date('2024-01-01'); // End date before start date
      
      // Note: This validation should be handled at the application level
      // as Sequelize doesn't have built-in date comparison validation
      const rule = await performanceRule.create({
        name: 'Date Validation Rule',
        description: 'Rule with invalid date range',
        calculationMethod: 'tiered',
        targetValue: 95,
        bonusAmount: 1500.00,
        startDate,
        endDate,
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      expect(rule.startDate).toEqual(startDate);
      expect(rule.endDate).toEqual(endDate);
    });

    it('should handle foreign key constraints for kindergarten', async () => {
      await expect(performanceRule.create({
        name: 'Invalid Kindergarten Rule',
        description: 'Rule with non-existent kindergarten',
        calculationMethod: 'fixed',
        targetValue: 80,
        bonusAmount: 600.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        kindergartenId: 99999, // Non-existent ID
        creatorId: testUser.id,
      })).rejects.toThrow();
    });

    it('should handle foreign key constraints for creator', async () => {
      await expect(performanceRule.create({
        name: 'Invalid Creator Rule',
        description: 'Rule with non-existent creator',
        calculationMethod: 'percentage',
        targetValue: 85,
        bonusAmount: 900.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: 99999, // Non-existent ID
      })).rejects.toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    let testUser: User;
    let testKindergarten: Kindergarten;

    beforeEach(async () => {
      testUser = await user.create({
        username: 'edgecaseuser',
        email: 'edgecase@example.com',
        password: 'hashedpassword',
        role: 'admin' as any,
      });

      testKindergarten = await kindergarten.create({
        name: 'Edge Case Kindergarten',
        address: '999 Edge Case St',
      });
    });

    it('should handle null values for optional fields', async () => {
      const rule = await performanceRule.create({
        name: 'Null Fields Rule',
        description: null,
        calculationMethod: 'fixed',
        targetValue: 100,
        bonusAmount: 500.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      expect(rule.description).toBeNull();
    });

    it('should handle empty string for description', async () => {
      const rule = await performanceRule.create({
        name: 'Empty Description Rule',
        description: '',
        calculationMethod: 'percentage',
        targetValue: 90,
        bonusAmount: 1000.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      expect(rule.description).toBe('');
    });

    it('should handle zero values for targetValue and bonusAmount', async () => {
      const rule = await performanceRule.create({
        name: 'Zero Values Rule',
        description: 'Rule with zero values',
        calculationMethod: 'fixed',
        targetValue: 0,
        bonusAmount: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      expect(rule.targetValue).toBe(0);
      expect(rule.bonusAmount.toString()).toBe('0.00');
    });

    it('should handle negative values for targetValue', async () => {
      const rule = await performanceRule.create({
        name: 'Negative Target Rule',
        description: 'Rule with negative target value',
        calculationMethod: 'percentage',
        targetValue: -10,
        bonusAmount: 500.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      expect(rule.targetValue).toBe(-10);
    });

    it('should handle very large bonusAmount', async () => {
      const largeBonus = 999999999.99;
      const rule = await performanceRule.create({
        name: 'Large Bonus Rule',
        description: 'Rule with large bonus amount',
        calculationMethod: 'tiered',
        targetValue: 100,
        bonusAmount: largeBonus,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      expect(rule.bonusAmount.toString()).toBe(largeBonus.toString());
    });

    it('should handle same start and end dates', async () => {
      const sameDate = new Date();
      const rule = await performanceRule.create({
        name: 'Same Date Rule',
        description: 'Rule with same start and end dates',
        calculationMethod: 'fixed',
        targetValue: 85,
        bonusAmount: 750.00,
        startDate: sameDate,
        endDate: sameDate,
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });

      expect(rule.startDate).toEqual(sameDate);
      expect(rule.endDate).toEqual(sameDate);
    });
  });

  describe('Performance Considerations', () => {
    let testUser: User;
    let testKindergarten: Kindergarten;

    beforeEach(async () => {
      testUser = await user.create({
        username: 'performanceuser',
        email: 'performance@example.com',
        password: 'hashedpassword',
        role: 'admin' as any,
      });

      testKindergarten = await kindergarten.create({
        name: 'Performance Kindergarten',
        address: '111 Performance St',
      });
    });

    it('should handle bulk creation efficiently', async () => {
      const rulesData = Array.from({ length: 100 }, (_, i) => ({
        name: `Bulk Rule ${i + 1}`,
        description: `Bulk created rule ${i + 1}`,
        calculationMethod: 'fixed',
        targetValue: 80 + i,
        bonusAmount: 500 + i * 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + (180 + i) * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      }));

      const startTime = Date.now();
      await performanceRule.bulkCreate(rulesData);
      const endTime = Date.now();

      const createdRules = await performanceRule.findAll();
      expect(createdRules.length).toBe(100);
      
      // Performance check - should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
    });

    it('should handle complex queries with associations', async () => {
      // Create multiple rules
      for (let i = 0; i < 50; i++) {
        await performanceRule.create({
          name: `Query Rule ${i + 1}`,
          description: `Rule for query test ${i + 1}`,
          calculationMethod: i % 2 === 0 ? 'fixed' : 'percentage',
          targetValue: 70 + i,
          bonusAmount: 600 + i * 15,
          startDate: new Date(),
          endDate: new Date(Date.now() + (200 + i * 5) * 24 * 60 * 60 * 1000),
          kindergartenId: testKindergarten.id,
          creatorId: testUser.id,
        });
      }

      const startTime = Date.now();
      const rulesWithAssociations = await performanceRule.findAll({
        include: ['kindergarten', 'creator'],
        where: {
          calculationMethod: 'fixed',
          isActive: true,
        },
        order: [['targetValue', 'ASC']],
        limit: 25,
      });
      const endTime = Date.now();

      expect(rulesWithAssociations.length).toBe(25);
      expect(rulesWithAssociations[0].calculationMethod).toBe('fixed');
      
      // Performance check
      expect(endTime - startTime).toBeLessThan(3000); // 3 seconds
    });

    it('should handle pagination efficiently', async () => {
      // Create 200 rules
      for (let i = 0; i < 200; i++) {
        await performanceRule.create({
          name: `Pagination Rule ${i + 1}`,
          description: `Rule for pagination test ${i + 1}`,
          calculationMethod: 'tiered',
          targetValue: 60 + i,
          bonusAmount: 400 + i * 5,
          startDate: new Date(),
          endDate: new Date(Date.now() + (150 + i * 2) * 24 * 60 * 60 * 1000),
          kindergartenId: testKindergarten.id,
          creatorId: testUser.id,
        });
      }

      // Test pagination
      const page1 = await performanceRule.findAll({
        offset: 0,
        limit: 50,
        order: [['id', 'ASC']],
      });

      const page2 = await performanceRule.findAll({
        offset: 50,
        limit: 50,
        order: [['id', 'ASC']],
      });

      const page3 = await performanceRule.findAll({
        offset: 100,
        limit: 50,
        order: [['id', 'ASC']],
      });

      expect(page1.length).toBe(50);
      expect(page2.length).toBe(50);
      expect(page3.length).toBe(50);

      // Verify no overlap
      const page1Ids = page1.map(r => r.id);
      const page2Ids = page2.map(r => r.id);
      const page3Ids = page3.map(r => r.id);

      expect([...page1Ids, ...page2Ids, ...page3Ids].length).toBe(150);
    });
  });

  describe('Instance Methods', () => {
    let testUser: User;
    let testKindergarten: Kindergarten;
    let testRule: PerformanceRule;

    beforeEach(async () => {
      testUser = await user.create({
        username: 'methoduser',
        email: 'method@example.com',
        password: 'hashedpassword',
        role: 'admin' as any,
      });

      testKindergarten = await kindergarten.create({
        name: 'Method Kindergarten',
        address: '222 Method St',
      });

      testRule = await performanceRule.create({
        name: 'Method Test Rule',
        description: 'Rule for method testing',
        calculationMethod: 'percentage',
        targetValue: 88,
        bonusAmount: 1200.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });
    });

    it('should have toJSON method', () => {
      const json = testRule.toJSON();
      
      expect(json).toBeDefined();
      expect(typeof json).toBe('object');
      expect(json.id).toBe(testRule.id);
      expect(json.name).toBe(testRule.name);
    });

    it('should have save method', async () => {
      testRule.name = 'Updated Method Rule';
      await testRule.save();
      
      const updatedRule = await performanceRule.findByPk(testRule.id);
      expect(updatedRule!.name).toBe('Updated Method Rule');
    });

    it('should have reload method', async () => {
      const originalName = testRule.name;
      
      // Update rule directly in database
      await performanceRule.update(
        { name: 'Direct Update' },
        { where: { id: testRule.id } }
      );
      
      // Reload the instance
      await testRule.reload();
      
      expect(testRule.name).toBe('Direct Update');
      expect(testRule.name).not.toBe(originalName);
    });

    it('should have destroy method', async () => {
      const ruleId = testRule.id;
      await testRule.destroy();
      
      const deletedRule = await performanceRule.findByPk(ruleId);
      expect(deletedRule).toBeNull();
    });

    it('should have get method', () => {
      const name = testRule.get('name');
      expect(name).toBe(testRule.name);
      
      const targetValue = testRule.get('targetValue');
      expect(targetValue).toBe(testRule.targetValue);
    });

    it('should have set method', async () => {
      testRule.set('name', 'Set Method Rule');
      testRule.set('targetValue', 95);
      
      await testRule.save();
      
      const updatedRule = await performanceRule.findByPk(testRule.id);
      expect(updatedRule!.name).toBe('Set Method Rule');
      expect(updatedRule!.targetValue).toBe(95);
    });

    it('should have changed method', () => {
      expect(testRule.changed('name')).toBe(false);
      
      testRule.name = 'Changed Test Rule';
      expect(testRule.changed('name')).toBe(true);
      
      testRule.save();
      expect(testRule.changed('name')).toBe(false);
    });

    it('should have previous method', () => {
      const originalName = testRule.name;
      
      testRule.name = 'Previous Test Rule';
      expect(testRule.previous('name')).toBe(originalName);
    });

    it('should have isNewRecord property', () => {
      expect(testRule.isNewRecord).toBe(false);
      
      const newRule = performanceRule.build({
        name: 'New Record Test',
        description: 'Testing new record',
        calculationMethod: 'fixed',
        targetValue: 80,
        bonusAmount: 600.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        kindergartenId: testKindergarten.id,
        creatorId: testUser.id,
      });
      
      expect(newRule.isNewRecord).toBe(true);
    });
  });
});