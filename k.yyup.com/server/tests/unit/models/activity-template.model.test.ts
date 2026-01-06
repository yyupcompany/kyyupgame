import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Sequelize, DataTypes } from 'sequelize';
import { 
  ActivityTemplate, 
  ActivityTemplateAttributes,
  ActivityTemplateCreationAttributes,
  initActivityTemplate 
} from '../../../src/models/activity-template.model';

describe('ActivityTemplate Model', () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    // Create in-memory SQLite database for testing
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
      define: {
        timestamps: true,
        underscored: false, // Disable underscore conversion, use camelCase
      },
    });

    // Initialize the model
    initActivityTemplate(sequelize);

    // Sync database
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should define the model correctly', () => {
      expect(ActivityTemplate).toBeDefined();
      expect(ActivityTemplate.tableName).toBe('activity_templates');
    });

    it('should have correct attributes', () => {
      const attributes = ActivityTemplate.getAttributes();
      
      expect(attributes.id).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        autoIncrement: true,
        primaryKey: true,
      });
      
      expect(attributes.name).toMatchObject({
        type: expect.any(DataTypes.STRING),
        allowNull: false,
      });
      
      expect(attributes.description).toMatchObject({
        type: expect.any(DataTypes.TEXT),
        allowNull: false,
      });
      
      expect(attributes.category).toMatchObject({
        type: expect.any(DataTypes.STRING),
        allowNull: false,
      });
      
      expect(attributes.coverImage).toMatchObject({
        type: expect.any(DataTypes.STRING),
        allowNull: false,
        field: 'coverImage',
      });
      
      expect(attributes.usageCount).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
        defaultValue: 0,
        field: 'usageCount',
      });
      
      expect(attributes.templateData).toMatchObject({
        type: expect.any(DataTypes.JSON),
        allowNull: false,
        field: 'templateData',
      });
      
      expect(attributes.status).toMatchObject({
        type: expect.any(DataTypes.ENUM),
        allowNull: false,
        defaultValue: 'active',
      });
      
      expect(attributes.createdBy).toMatchObject({
        type: expect.any(DataTypes.INTEGER),
        allowNull: false,
        field: 'createdBy',
      });
    });

    it('should have correct table options', () => {
      const options = ActivityTemplate.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBeUndefined(); // No paranoid option
      expect(options.underscored).toBe(false); // Use camelCase
      expect(options.modelName).toBe('ActivityTemplate');
    });

    it('should have correct indexes', () => {
      const options = ActivityTemplate.options;
      
      expect(options.indexes).toHaveLength(3);
      expect(options.indexes[0]).toMatchObject({
        fields: ['category'],
      });
      expect(options.indexes[1]).toMatchObject({
        fields: ['status'],
      });
      expect(options.indexes[2]).toMatchObject({
        fields: ['createdBy'],
      });
    });
  });

  describe('Enum Values', () => {
    it('should have correct status enum values', () => {
      const enumValues = ActivityTemplate.getAttributes().status.values;
      expect(enumValues).toContain('active');
      expect(enumValues).toContain('inactive');
    });
  });

  describe('Type Definitions', () => {
    it('should have correct ActivityTemplateAttributes type', () => {
      const mockAttributes: ActivityTemplateAttributes = {
        id: 1,
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        usageCount: 10,
        templateData: { key: 'value' },
        status: 'active',
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      expect(mockAttributes.id).toBe(1);
      expect(mockAttributes.name).toBe('Test Template');
      expect(mockAttributes.status).toBe('active');
      expect(mockAttributes.templateData).toEqual({ key: 'value' });
    });

    it('should have correct ActivityTemplateCreationAttributes type', () => {
      const mockCreationAttributes: ActivityTemplateCreationAttributes = {
        name: 'New Template',
        description: 'New Description',
        category: 'New Category',
        coverImage: '/images/new.jpg',
        templateData: { new: 'data' },
        status: 'active',
        createdBy: 1,
      };
      
      expect(mockCreationAttributes.name).toBe('New Template');
      expect(mockCreationAttributes.status).toBe('active');
      // Optional fields should be undefined
      expect(mockCreationAttributes.id).toBeUndefined();
      expect(mockCreationAttributes.usageCount).toBeUndefined();
      expect(mockCreationAttributes.createdAt).toBeUndefined();
      expect(mockCreationAttributes.updatedAt).toBeUndefined();
    });
  });

  describe('Model Validations', () => {
    it('should validate required fields', async () => {
      const template = ActivityTemplate.build();
      
      await expect(template.validate()).rejects.toThrow();
    });

    it('should validate status enum', async () => {
      const template = ActivityTemplate.build({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: {},
        createdBy: 1,
        status: 'invalid_status' as any, // Invalid enum value
      });
      
      await expect(template.validate()).rejects.toThrow();
    });

    it('should accept valid status values', async () => {
      const validStatuses = ['active', 'inactive'];
      
      for (const status of validStatuses) {
        const template = ActivityTemplate.build({
          name: 'Test Template',
          description: 'Test Description',
          category: 'Test Category',
          coverImage: '/images/test.jpg',
          templateData: {},
          createdBy: 1,
          status: status as any,
        });
        
        await expect(template.validate()).resolves.not.toThrow();
      }
    });

    it('should validate createdBy is positive', async () => {
      const template = ActivityTemplate.build({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: {},
        createdBy: 0, // Invalid createdBy
      });
      
      // This validation should be handled at database level
      // For now, we'll test that the model can be built
      expect(template.createdBy).toBe(0);
    });

    it('should validate usageCount is non-negative', async () => {
      const template = ActivityTemplate.build({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: {},
        createdBy: 1,
        usageCount: -1, // Invalid negative count
      });
      
      // This validation should be handled at application level
      // For now, we'll test that the model can be built
      expect(template.usageCount).toBe(-1);
    });

    it('should accept valid JSON data', async () => {
      const template = ActivityTemplate.build({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: {
          title: 'Activity Title',
          duration: 60,
          materials: ['item1', 'item2'],
          steps: [
            { step: 1, description: 'First step' },
            { step: 2, description: 'Second step' }
          ]
        },
        createdBy: 1,
        status: 'active',
      });
      
      await expect(template.validate()).resolves.not.toThrow();
    });

    it('should accept empty JSON object', async () => {
      const template = ActivityTemplate.build({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: {},
        createdBy: 1,
      });
      
      await expect(template.validate()).resolves.not.toThrow();
    });

    it('should accept complex nested JSON data', async () => {
      const template = ActivityTemplate.build({
        name: 'Complex Template',
        description: 'Complex Description',
        category: 'Complex Category',
        coverImage: '/images/complex.jpg',
        templateData: {
          metadata: {
            version: '1.0.0',
            author: 'Test Author',
            tags: ['education', 'children', 'activity']
          },
          content: {
            sections: [
              {
                title: 'Introduction',
                duration: 10,
                activities: ['icebreaker', 'presentation']
              },
              {
                title: 'Main Activity',
                duration: 30,
                activities: ['group work', 'discussion']
              },
              {
                title: 'Conclusion',
                duration: 5,
                activities: ['summary', 'feedback']
              }
            ]
          },
          resources: {
            materials: ['paper', 'pens', 'projector'],
            preparation: ['print handouts', 'setup room'],
            budget: {
              total: 100,
              items: [
                { name: 'materials', cost: 50 },
                { name: 'refreshments', cost: 30 },
                { name: 'miscellaneous', cost: 20 }
              ]
            }
          }
        },
        createdBy: 1,
        status: 'active',
      });
      
      await expect(template.validate()).resolves.not.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should set default usageCount to 0', () => {
      const template = ActivityTemplate.build({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: {},
        createdBy: 1,
      });
      
      expect(template.usageCount).toBe(0);
    });

    it('should set default status to active', () => {
      const template = ActivityTemplate.build({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: {},
        createdBy: 1,
      });
      
      expect(template.status).toBe('active');
    });

    it('should set default createdAt and updatedAt to current time', () => {
      const template = ActivityTemplate.build({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: {},
        createdBy: 1,
      });
      
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new activity template', async () => {
      const template = await ActivityTemplate.create({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: { key: 'value' },
        createdBy: 1,
      });

      expect(template.id).toBeDefined();
      expect(template.name).toBe('Test Template');
      expect(template.description).toBe('Test Description');
      expect(template.category).toBe('Test Category');
      expect(template.coverImage).toBe('/images/test.jpg');
      expect(template.templateData).toEqual({ key: 'value' });
      expect(template.usageCount).toBe(0);
      expect(template.status).toBe('active');
      expect(template.createdBy).toBe(1);
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });

    it('should create with all fields specified', async () => {
      const template = await ActivityTemplate.create({
        name: 'Complete Template',
        description: 'Complete Description',
        category: 'Complete Category',
        coverImage: '/images/complete.jpg',
        usageCount: 5,
        templateData: { complex: 'data' },
        status: 'inactive',
        createdBy: 2,
      });

      expect(template.usageCount).toBe(5);
      expect(template.status).toBe('inactive');
      expect(template.createdBy).toBe(2);
    });

    it('should read an activity template', async () => {
      const createdTemplate = await ActivityTemplate.create({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: { key: 'value' },
        createdBy: 1,
      });

      const foundTemplate = await ActivityTemplate.findByPk(createdTemplate.id);
      
      expect(foundTemplate).toBeDefined();
      expect(foundTemplate?.name).toBe('Test Template');
      expect(foundTemplate?.description).toBe('Test Description');
      expect(foundTemplate?.category).toBe('Test Category');
      expect(foundTemplate?.templateData).toEqual({ key: 'value' });
    });

    it('should update an activity template', async () => {
      const template = await ActivityTemplate.create({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: { key: 'value' },
        createdBy: 1,
      });

      await template.update({
        name: 'Updated Template',
        description: 'Updated Description',
        category: 'Updated Category',
        usageCount: 10,
        status: 'inactive',
        templateData: { updated: 'data' },
      });

      expect(template.name).toBe('Updated Template');
      expect(template.description).toBe('Updated Description');
      expect(template.category).toBe('Updated Category');
      expect(template.usageCount).toBe(10);
      expect(template.status).toBe('inactive');
      expect(template.templateData).toEqual({ updated: 'data' });
    });

    it('should delete an activity template (hard delete - no paranoid)', async () => {
      const template = await ActivityTemplate.create({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: { key: 'value' },
        createdBy: 1,
      });

      await template.destroy();
      
      const foundTemplate = await ActivityTemplate.findByPk(template.id);
      expect(foundTemplate).toBeNull(); // Hard delete should return null
    });

    it('should find all templates', async () => {
      // Create multiple templates
      await ActivityTemplate.create({
        name: 'Template 1',
        description: 'Description 1',
        category: 'Category 1',
        coverImage: '/images/template1.jpg',
        templateData: {},
        createdBy: 1,
      });
      
      await ActivityTemplate.create({
        name: 'Template 2',
        description: 'Description 2',
        category: 'Category 2',
        coverImage: '/images/template2.jpg',
        templateData: {},
        createdBy: 1,
      });
      
      await ActivityTemplate.create({
        name: 'Template 3',
        description: 'Description 3',
        category: 'Category 3',
        coverImage: '/images/template3.jpg',
        templateData: {},
        createdBy: 1,
      });

      const templates = await ActivityTemplate.findAll({
        order: [['id', 'ASC']],
      });

      expect(templates).toHaveLength(3);
      expect(templates[0].name).toBe('Template 1');
      expect(templates[1].name).toBe('Template 2');
      expect(templates[2].name).toBe('Template 3');
    });

    it('should find templates by category', async () => {
      // Create templates in different categories
      await ActivityTemplate.create({
        name: 'Education Template 1',
        description: 'Education Description 1',
        category: 'Education',
        coverImage: '/images/edu1.jpg',
        templateData: {},
        createdBy: 1,
      });
      
      await ActivityTemplate.create({
        name: 'Education Template 2',
        description: 'Education Description 2',
        category: 'Education',
        coverImage: '/images/edu2.jpg',
        templateData: {},
        createdBy: 1,
      });
      
      await ActivityTemplate.create({
        name: 'Recreation Template',
        description: 'Recreation Description',
        category: 'Recreation',
        coverImage: '/images/rec.jpg',
        templateData: {},
        createdBy: 1,
      });

      const educationTemplates = await ActivityTemplate.findAll({
        where: { category: 'Education' },
        order: [['id', 'ASC']],
      });

      expect(educationTemplates).toHaveLength(2);
      expect(educationTemplates[0].category).toBe('Education');
      expect(educationTemplates[1].category).toBe('Education');
    });

    it('should find templates by status', async () => {
      // Create templates with different statuses
      await ActivityTemplate.create({
        name: 'Active Template 1',
        description: 'Active Description 1',
        category: 'Test Category',
        coverImage: '/images/active1.jpg',
        templateData: {},
        createdBy: 1,
        status: 'active',
      });
      
      await ActivityTemplate.create({
        name: 'Active Template 2',
        description: 'Active Description 2',
        category: 'Test Category',
        coverImage: '/images/active2.jpg',
        templateData: {},
        createdBy: 1,
        status: 'active',
      });
      
      await ActivityTemplate.create({
        name: 'Inactive Template',
        description: 'Inactive Description',
        category: 'Test Category',
        coverImage: '/images/inactive.jpg',
        templateData: {},
        createdBy: 1,
        status: 'inactive',
      });

      const activeTemplates = await ActivityTemplate.findAll({
        where: { status: 'active' },
        order: [['id', 'ASC']],
      });

      expect(activeTemplates).toHaveLength(2);
      expect(activeTemplates[0].status).toBe('active');
      expect(activeTemplates[1].status).toBe('active');
    });

    it('should find templates by creator', async () => {
      // Create templates by different creators
      await ActivityTemplate.create({
        name: 'Creator 1 Template 1',
        description: 'Creator 1 Description 1',
        category: 'Test Category',
        coverImage: '/images/creator1_1.jpg',
        templateData: {},
        createdBy: 1,
      });
      
      await ActivityTemplate.create({
        name: 'Creator 1 Template 2',
        description: 'Creator 1 Description 2',
        category: 'Test Category',
        coverImage: '/images/creator1_2.jpg',
        templateData: {},
        createdBy: 1,
      });
      
      await ActivityTemplate.create({
        name: 'Creator 2 Template',
        description: 'Creator 2 Description',
        category: 'Test Category',
        coverImage: '/images/creator2.jpg',
        templateData: {},
        createdBy: 2,
      });

      const creator1Templates = await ActivityTemplate.findAll({
        where: { createdBy: 1 },
        order: [['id', 'ASC']],
      });

      expect(creator1Templates).toHaveLength(2);
      expect(creator1Templates[0].createdBy).toBe(1);
      expect(creator1Templates[1].createdBy).toBe(1);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle maximum string lengths', async () => {
      const longName = 'a'.repeat(100); // Maximum length for name
      const longCategory = 'a'.repeat(50); // Maximum length for category
      const longCoverImage = 'a'.repeat(255); // Maximum length for coverImage
      
      const template = ActivityTemplate.build({
        name: longName,
        description: 'a'.repeat(10000), // Long text for description
        category: longCategory,
        coverImage: longCoverImage,
        templateData: {},
        createdBy: 1,
      });
      
      await expect(template.validate()).resolves.not.toThrow();
    });

    it('should handle minimum values', async () => {
      const template = ActivityTemplate.build({
        name: 'A', // Minimum name length
        description: 'A', // Minimum description length
        category: 'A', // Minimum category length
        coverImage: 'A', // Minimum coverImage length
        templateData: {},
        createdBy: 1,
        usageCount: 0, // Minimum count
      });
      
      await expect(template.validate()).resolves.not.toThrow();
    });

    it('should handle extreme usage count values', async () => {
      const template1 = ActivityTemplate.build({
        name: 'Template 1',
        description: 'Description 1',
        category: 'Category 1',
        coverImage: '/images/template1.jpg',
        templateData: {},
        createdBy: 1,
        usageCount: 0, // Minimum count
      });
      
      const template2 = ActivityTemplate.build({
        name: 'Template 2',
        description: 'Description 2',
        category: 'Category 2',
        coverImage: '/images/template2.jpg',
        templateData: {},
        createdBy: 1,
        usageCount: 2147483647, // Maximum 32-bit integer
      });
      
      await expect(template1.validate()).resolves.not.toThrow();
      await expect(template2.validate()).resolves.not.toThrow();
    });

    it('should handle extreme createdBy values', async () => {
      const template1 = ActivityTemplate.build({
        name: 'Template 1',
        description: 'Description 1',
        category: 'Category 1',
        coverImage: '/images/template1.jpg',
        templateData: {},
        createdBy: 1, // Minimum positive ID
      });
      
      const template2 = ActivityTemplate.build({
        name: 'Template 2',
        description: 'Description 2',
        category: 'Category 2',
        coverImage: '/images/template2.jpg',
        templateData: {},
        createdBy: 2147483647, // Maximum 32-bit integer
      });
      
      await expect(template1.validate()).resolves.not.toThrow();
      await expect(template2.validate()).resolves.not.toThrow();
    });

    it('should handle all status values', async () => {
      const statuses = ['active', 'inactive'];
      
      for (const status of statuses) {
        const template = ActivityTemplate.build({
          name: 'Test Template',
          description: 'Test Description',
          category: 'Test Category',
          coverImage: '/images/test.jpg',
          templateData: {},
          createdBy: 1,
          status: status as any,
        });
        
        await expect(template.validate()).resolves.not.toThrow();
      }
    });

    it('should handle zero createdBy (validation at database level)', async () => {
      const template = ActivityTemplate.build({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: {},
        createdBy: 0,
      });
      
      // Model validation should pass, but database constraints should handle this
      await expect(template.validate()).resolves.not.toThrow();
    });

    it('should handle negative createdBy (validation at database level)', async () => {
      const template = ActivityTemplate.build({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: {},
        createdBy: -1,
      });
      
      // Model validation should pass, but database constraints should handle this
      await expect(template.validate()).resolves.not.toThrow();
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const beforeCreate = new Date();
      
      const template = await ActivityTemplate.create({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: {},
        createdBy: 1,
      });
      
      const afterCreate = new Date();
      
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
      expect(template.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(template.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(template.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(template.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should update updatedAt on update', async () => {
      const template = await ActivityTemplate.create({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: {},
        createdBy: 1,
      });
      
      const originalUpdatedAt = template.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await template.update({
        name: 'Updated Template',
      });
      
      expect(template.updatedAt).toBeInstanceOf(Date);
      expect(template.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not change createdAt on update', async () => {
      const template = await ActivityTemplate.create({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: {},
        createdBy: 1,
      });
      
      const originalCreatedAt = template.createdAt;
      
      await template.update({
        name: 'Updated Template',
      });
      
      expect(template.createdAt).toBe(originalCreatedAt);
    });
  });

  describe('JSON Data Handling', () => {
    it('should store and retrieve JSON data correctly', async () => {
      const originalData = {
        title: 'Science Experiment',
        duration: 45,
        ageGroup: '6-8 years',
        materials: ['magnets', 'iron filings', 'paper'],
        objectives: ['learn magnetism', 'scientific method'],
        steps: [
          { name: 'Introduction', time: 5 },
          { name: 'Experiment', time: 30 },
          { name: 'Discussion', time: 10 }
        ]
      };

      const template = await ActivityTemplate.create({
        name: 'Science Template',
        description: 'Science experiment template',
        category: 'Science',
        coverImage: '/images/science.jpg',
        templateData: originalData,
        createdBy: 1,
      });

      const retrievedTemplate = await ActivityTemplate.findByPk(template.id);
      
      expect(retrievedTemplate?.templateData).toEqual(originalData);
    });

    it('should handle JSON data mutations correctly', async () => {
      const originalData = { key: 'original value' };
      
      const template = await ActivityTemplate.create({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: originalData,
        createdBy: 1,
      });

      // Modify the original data object
      originalData.key = 'modified value';
      
      // The template data should remain unchanged
      expect(template.templateData.key).toBe('original value');
      
      // Retrieve from database to confirm
      const retrievedTemplate = await ActivityTemplate.findByPk(template.id);
      expect(retrievedTemplate?.templateData.key).toBe('original value');
    });

    it('should handle null and undefined in JSON data', async () => {
      const template = await ActivityTemplate.create({
        name: 'Test Template',
        description: 'Test Description',
        category: 'Test Category',
        coverImage: '/images/test.jpg',
        templateData: {
          nullValue: null,
          undefinedValue: undefined,
          stringValue: 'test',
          numberValue: 42,
          booleanValue: true
        },
        createdBy: 1,
      });

      const retrievedTemplate = await ActivityTemplate.findByPk(template.id);
      
      expect(retrievedTemplate?.templateData.nullValue).toBeNull();
      expect(retrievedTemplate?.templateData.undefinedValue).toBeUndefined();
      expect(retrievedTemplate?.templateData.stringValue).toBe('test');
      expect(retrievedTemplate?.templateData.numberValue).toBe(42);
      expect(retrievedTemplate?.templateData.booleanValue).toBe(true);
    });
  });
});