import {
  ScriptCategory,
  Script,
  ScriptUsage,
  ScriptStatus,
  ScriptType,
  initScriptCategory,
  initScript,
  initScriptUsage,
  defineScriptAssociations
} from '../../../src/models/script.model';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';
import { sequelize } from '../../../src/init';
import { Op } from 'sequelize';


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

describe('Script Models', () => {
  beforeAll(async () => {
    // 确保数据库连接正常
    await sequelize.authenticate();
    
    // 初始化模型
    initScriptCategory(sequelize);
    initScript(sequelize);
    initScriptUsage(sequelize);
    
    // 定义关联关系
    defineScriptAssociations();
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sequelize.close();
  });

  describe('ScriptCategory Model', () => {
    describe('Model Definition', () => {
      it('should be defined', () => {
        expect(ScriptCategory).toBeDefined();
      });

      it('should have correct table name', () => {
        expect(ScriptCategory.tableName).toBe('script_categories');
      });

      it('should have timestamps enabled', () => {
        expect(ScriptCategory.options.timestamps).toBe(true);
      });

      it('should have underscored enabled', () => {
        expect(ScriptCategory.options.underscored).toBe(true);
      });
    });

    describe('Model Attributes', () => {
      it('should have correct id attribute', () => {
        const idAttribute = ScriptCategory.getAttributes().id;
        expect(idAttribute).toBeDefined();
        expect(idAttribute.type.constructor.name).toBe('INTEGERUNSIGNED');
        expect(idAttribute.primaryKey).toBe(true);
        expect(idAttribute.autoIncrement).toBe(true);
        expect(idAttribute.comment).toBe('分类ID');
      });

      it('should have correct name attribute', () => {
        const nameAttribute = ScriptCategory.getAttributes().name;
        expect(nameAttribute).toBeDefined();
        expect(nameAttribute.type.constructor.name).toBe('VARCHAR');
        expect(nameAttribute.allowNull).toBe(false);
        expect(nameAttribute.comment).toBe('分类名称');
      });

      it('should have correct description attribute', () => {
        const descriptionAttribute = ScriptCategory.getAttributes().description;
        expect(descriptionAttribute).toBeDefined();
        expect(descriptionAttribute.type.constructor.name).toBe('VARCHAR');
        expect(descriptionAttribute.allowNull).toBe(true);
        expect(descriptionAttribute.comment).toBe('分类描述');
      });

      it('should have correct type attribute', () => {
        const typeAttribute = ScriptCategory.getAttributes().type;
        expect(typeAttribute).toBeDefined();
        expect(typeAttribute.type.constructor.name).toBe('ENUM');
        expect(typeAttribute.allowNull).toBe(false);
        expect(typeAttribute.comment).toBe('话术类型');
      });

      it('should have correct color attribute', () => {
        const colorAttribute = ScriptCategory.getAttributes().color;
        expect(colorAttribute).toBeDefined();
        expect(colorAttribute.type.constructor.name).toBe('VARCHAR');
        expect(colorAttribute.allowNull).toBe(true);
        expect(colorAttribute.comment).toBe('分类颜色');
      });

      it('should have correct icon attribute', () => {
        const iconAttribute = ScriptCategory.getAttributes().icon;
        expect(iconAttribute).toBeDefined();
        expect(iconAttribute.type.constructor.name).toBe('VARCHAR');
        expect(iconAttribute.allowNull).toBe(true);
        expect(iconAttribute.comment).toBe('分类图标');
      });

      it('should have correct sort attribute', () => {
        const sortAttribute = ScriptCategory.getAttributes().sort;
        expect(sortAttribute).toBeDefined();
        expect(sortAttribute.type.constructor.name).toBe('INTEGER');
        expect(sortAttribute.allowNull).toBe(false);
        expect(sortAttribute.defaultValue).toBe(0);
        expect(sortAttribute.comment).toBe('排序');
      });

      it('should have correct status attribute', () => {
        const statusAttribute = ScriptCategory.getAttributes().status;
        expect(statusAttribute).toBeDefined();
        expect(statusAttribute.type.constructor.name).toBe('ENUM');
        expect(statusAttribute.allowNull).toBe(false);
        expect(statusAttribute.defaultValue).toBe(ScriptStatus.ACTIVE);
        expect(statusAttribute.comment).toBe('状态');
      });

      it('should have correct creatorId attribute', () => {
        const creatorIdAttribute = ScriptCategory.getAttributes().creatorId;
        expect(creatorIdAttribute).toBeDefined();
        expect(creatorIdAttribute.type.constructor.name).toBe('INTEGERUNSIGNED');
        expect(creatorIdAttribute.allowNull).toBe(true);
        expect(creatorIdAttribute.comment).toBe('创建者ID');
      });
    });

    describe('Model Creation', () => {
      it('should create a new script category', async () => {
        const categoryData = {
          name: '招生话术',
          description: '用于招生场景的话术分类',
          type: ScriptType.ENROLLMENT,
          color: '#FF5733',
          icon: 'enrollment',
          sort: 1,
          status: ScriptStatus.ACTIVE,
          creatorId: 1,
        };

        const category = await ScriptCategory.create(categoryData);
        
        expect(category).toBeDefined();
        expect(category.id).toBeDefined();
        expect(category.name).toBe(categoryData.name);
        expect(category.description).toBe(categoryData.description);
        expect(category.type).toBe(categoryData.type);
        expect(category.color).toBe(categoryData.color);
        expect(category.icon).toBe(categoryData.icon);
        expect(category.sort).toBe(categoryData.sort);
        expect(category.status).toBe(categoryData.status);
        expect(category.creatorId).toBe(categoryData.creatorId);
      });

      it('should create a category with minimal data', async () => {
        const minimalData = {
          name: '测试分类',
          type: ScriptType.PHONE,
        };

        const category = await ScriptCategory.create(minimalData);
        
        expect(category).toBeDefined();
        expect(category.id).toBeDefined();
        expect(category.name).toBe(minimalData.name);
        expect(category.type).toBe(minimalData.type);
        
        // Check default values
        expect(category.sort).toBe(0);
        expect(category.status).toBe(ScriptStatus.ACTIVE);
      });
    });

    describe('Model Validation', () => {
      it('should allow null values for optional fields', async () => {
        const category = await ScriptCategory.create({
          name: 'Null Test Category',
          type: ScriptType.RECEPTION,
        });

        expect(category.description).toBeNull();
        expect(category.color).toBeNull();
        expect(category.icon).toBeNull();
        expect(category.creatorId).toBeNull();
      });

      it('should handle empty string values', async () => {
        const category = await ScriptCategory.create({
          name: 'Empty String Category',
          type: ScriptType.CONSULTATION,
          description: '',
          color: '',
          icon: '',
        });

        expect(category.description).toBe('');
        expect(category.color).toBe('');
        expect(category.icon).toBe('');
      });

      it('should handle different script types', async () => {
        const scriptTypes = Object.values(ScriptType);
        
        for (const type of scriptTypes) {
          const category = await ScriptCategory.create({
            name: `Type ${type} Category`,
            type: type,
          });
          
          expect(category.type).toBe(type);
        }
      });

      it('should handle different status values', async () => {
        const statuses = Object.values(ScriptStatus);
        
        for (const status of statuses) {
          const category = await ScriptCategory.create({
            name: `Status ${status} Category`,
            type: ScriptType.FOLLOWUP,
            status: status,
          });
          
          expect(category.status).toBe(status);
        }
      });
    });

    describe('Model Queries', () => {
      it('should find category by id', async () => {
        const createdCategory = await ScriptCategory.create({
          name: 'Find By ID Category',
          type: ScriptType.OBJECTION,
        });

        const foundCategory = await ScriptCategory.findByPk(createdCategory.id);
        
        expect(foundCategory).toBeDefined();
        expect(foundCategory?.id).toBe(createdCategory.id);
        expect(foundCategory?.name).toBe('Find By ID Category');
      });

      it('should find categories by type', async () => {
        await ScriptCategory.bulkCreate([
          { name: 'Enrollment 1', type: ScriptType.ENROLLMENT },
          { name: 'Enrollment 2', type: ScriptType.ENROLLMENT },
          { name: 'Phone 1', type: ScriptType.PHONE },
        ]);

        const enrollmentCategories = await ScriptCategory.findAll({
          where: { type: ScriptType.ENROLLMENT },
        });
        
        expect(enrollmentCategories).toHaveLength(2);
        expect(enrollmentCategories.map(c => c.name)).toContain('Enrollment 1');
        expect(enrollmentCategories.map(c => c.name)).toContain('Enrollment 2');
      });

      it('should find categories by status', async () => {
        await ScriptCategory.bulkCreate([
          { name: 'Active Category', type: ScriptType.RECEPTION, status: ScriptStatus.ACTIVE },
          { name: 'Inactive Category', type: ScriptType.RECEPTION, status: ScriptStatus.INACTIVE },
          { name: 'Draft Category', type: ScriptType.RECEPTION, status: ScriptStatus.DRAFT },
        ]);

        const activeCategories = await ScriptCategory.findAll({
          where: { status: ScriptStatus.ACTIVE },
        });
        
        expect(activeCategories).toHaveLength(1);
        expect(activeCategories[0].name).toBe('Active Category');
      });

      it('should find categories ordered by sort', async () => {
        await ScriptCategory.bulkCreate([
          { name: 'Category 1', type: ScriptType.CONSULTATION, sort: 3 },
          { name: 'Category 2', type: ScriptType.CONSULTATION, sort: 1 },
          { name: 'Category 3', type: ScriptType.CONSULTATION, sort: 2 },
        ]);

        const orderedCategories = await ScriptCategory.findAll({
          where: { type: ScriptType.CONSULTATION },
          order: [['sort', 'ASC']],
        });
        
        expect(orderedCategories[0].name).toBe('Category 2');
        expect(orderedCategories[1].name).toBe('Category 3');
        expect(orderedCategories[2].name).toBe('Category 1');
      });
    });
  });

  describe('Script Model', () => {
    describe('Model Definition', () => {
      it('should be defined', () => {
        expect(Script).toBeDefined();
      });

      it('should have correct table name', () => {
        expect(Script.tableName).toBe('scripts');
      });

      it('should have timestamps enabled', () => {
        expect(Script.options.timestamps).toBe(true);
      });

      it('should have underscored enabled', () => {
        expect(Script.options.underscored).toBe(true);
      });
    });

    describe('Model Attributes', () => {
      it('should have correct id attribute', () => {
        const idAttribute = Script.getAttributes().id;
        expect(idAttribute).toBeDefined();
        expect(idAttribute.type.constructor.name).toBe('INTEGERUNSIGNED');
        expect(idAttribute.primaryKey).toBe(true);
        expect(idAttribute.autoIncrement).toBe(true);
        expect(idAttribute.comment).toBe('话术ID');
      });

      it('should have correct title attribute', () => {
        const titleAttribute = Script.getAttributes().title;
        expect(titleAttribute).toBeDefined();
        expect(titleAttribute.type.constructor.name).toBe('VARCHAR');
        expect(titleAttribute.allowNull).toBe(false);
        expect(titleAttribute.comment).toBe('话术标题');
      });

      it('should have correct content attribute', () => {
        const contentAttribute = Script.getAttributes().content;
        expect(contentAttribute).toBeDefined();
        expect(contentAttribute.type.constructor.name).toBe('TEXT');
        expect(contentAttribute.allowNull).toBe(false);
        expect(contentAttribute.comment).toBe('话术内容');
      });

      it('should have correct categoryId attribute', () => {
        const categoryIdAttribute = Script.getAttributes().categoryId;
        expect(categoryIdAttribute).toBeDefined();
        expect(categoryIdAttribute.type.constructor.name).toBe('INTEGERUNSIGNED');
        expect(categoryIdAttribute.allowNull).toBe(false);
        expect(categoryIdAttribute.comment).toBe('分类ID');
      });

      it('should have correct type attribute', () => {
        const typeAttribute = Script.getAttributes().type;
        expect(typeAttribute).toBeDefined();
        expect(typeAttribute.type.constructor.name).toBe('ENUM');
        expect(typeAttribute.allowNull).toBe(false);
        expect(typeAttribute.comment).toBe('话术类型');
      });

      it('should have correct tags attribute', () => {
        const tagsAttribute = Script.getAttributes().tags;
        expect(tagsAttribute).toBeDefined();
        expect(tagsAttribute.type.constructor.name).toBe('JSON');
        expect(tagsAttribute.allowNull).toBe(true);
        expect(tagsAttribute.defaultValue).toEqual('[]');
        expect(tagsAttribute.comment).toBe('标签');
      });

      it('should have correct keywords attribute', () => {
        const keywordsAttribute = Script.getAttributes().keywords;
        expect(keywordsAttribute).toBeDefined();
        expect(keywordsAttribute.type.constructor.name).toBe('JSON');
        expect(keywordsAttribute.allowNull).toBe(true);
        expect(keywordsAttribute.defaultValue).toEqual('[]');
        expect(keywordsAttribute.comment).toBe('关键词');
      });

      it('should have correct description attribute', () => {
        const descriptionAttribute = Script.getAttributes().description;
        expect(descriptionAttribute).toBeDefined();
        expect(descriptionAttribute.type.constructor.name).toBe('VARCHAR');
        expect(descriptionAttribute.allowNull).toBe(true);
        expect(descriptionAttribute.comment).toBe('话术描述');
      });

      it('should have correct usageCount attribute', () => {
        const usageCountAttribute = Script.getAttributes().usageCount;
        expect(usageCountAttribute).toBeDefined();
        expect(usageCountAttribute.type.constructor.name).toBe('INTEGER');
        expect(usageCountAttribute.allowNull).toBe(false);
        expect(usageCountAttribute.defaultValue).toBe(0);
        expect(usageCountAttribute.comment).toBe('使用次数');
      });

      it('should have correct effectiveScore attribute', () => {
        const effectiveScoreAttribute = Script.getAttributes().effectiveScore;
        expect(effectiveScoreAttribute).toBeDefined();
        expect(effectiveScoreAttribute.type.constructor.name).toBe('DECIMAL');
        expect(effectiveScoreAttribute.allowNull).toBe(true);
        expect(effectiveScoreAttribute.comment).toBe('效果评分');
      });

      it('should have correct status attribute', () => {
        const statusAttribute = Script.getAttributes().status;
        expect(statusAttribute).toBeDefined();
        expect(statusAttribute.type.constructor.name).toBe('ENUM');
        expect(statusAttribute.allowNull).toBe(false);
        expect(statusAttribute.defaultValue).toBe(ScriptStatus.ACTIVE);
        expect(statusAttribute.comment).toBe('状态');
      });

      it('should have correct isTemplate attribute', () => {
        const isTemplateAttribute = Script.getAttributes().isTemplate;
        expect(isTemplateAttribute).toBeDefined();
        expect(isTemplateAttribute.type.constructor.name).toBe('BOOLEAN');
        expect(isTemplateAttribute.allowNull).toBe(false);
        expect(isTemplateAttribute.defaultValue).toBe(false);
        expect(isTemplateAttribute.comment).toBe('是否为模板');
      });

      it('should have correct variables attribute', () => {
        const variablesAttribute = Script.getAttributes().variables;
        expect(variablesAttribute).toBeDefined();
        expect(variablesAttribute.type.constructor.name).toBe('JSON');
        expect(variablesAttribute.allowNull).toBe(true);
        expect(variablesAttribute.comment).toBe('变量配置');
      });

      it('should have correct creatorId attribute', () => {
        const creatorIdAttribute = Script.getAttributes().creatorId;
        expect(creatorIdAttribute).toBeDefined();
        expect(creatorIdAttribute.type.constructor.name).toBe('INTEGERUNSIGNED');
        expect(creatorIdAttribute.allowNull).toBe(true);
        expect(creatorIdAttribute.comment).toBe('创建者ID');
      });

      it('should have correct updaterId attribute', () => {
        const updaterIdAttribute = Script.getAttributes().updaterId;
        expect(updaterIdAttribute).toBeDefined();
        expect(updaterIdAttribute.type.constructor.name).toBe('INTEGERUNSIGNED');
        expect(updaterIdAttribute.allowNull).toBe(true);
        expect(updaterIdAttribute.comment).toBe('更新者ID');
      });
    });

    describe('Model Creation', () => {
      it('should create a new script', async () => {
        // First create a category
        const category = await ScriptCategory.create({
          name: '测试分类',
          type: ScriptType.ENROLLMENT,
        });

        const scriptData = {
          title: '招生话术模板',
          content: '您好，欢迎咨询我们的幼儿园招生信息...',
          categoryId: category.id,
          type: ScriptType.ENROLLMENT,
          tags: ['招生', '咨询', '介绍'],
          keywords: ['幼儿园', '课程', '费用'],
          description: '用于初次咨询的招生话术',
          usageCount: 10,
          effectiveScore: 4.5,
          status: ScriptStatus.ACTIVE,
          isTemplate: true,
          variables: { name: 'string', age: 'number' },
          creatorId: 1,
          updaterId: 1,
        };

        const script = await Script.create(scriptData);
        
        expect(script).toBeDefined();
        expect(script.id).toBeDefined();
        expect(script.title).toBe(scriptData.title);
        expect(script.content).toBe(scriptData.content);
        expect(script.categoryId).toBe(scriptData.categoryId);
        expect(script.type).toBe(scriptData.type);
        expect(script.tags).toEqual(scriptData.tags);
        expect(script.keywords).toEqual(scriptData.keywords);
        expect(script.description).toBe(scriptData.description);
        expect(script.usageCount).toBe(scriptData.usageCount);
        expect(script.effectiveScore).toBe(scriptData.effectiveScore);
        expect(script.status).toBe(scriptData.status);
        expect(script.isTemplate).toBe(scriptData.isTemplate);
        expect(script.variables).toEqual(scriptData.variables);
        expect(script.creatorId).toBe(scriptData.creatorId);
        expect(script.updaterId).toBe(scriptData.updaterId);
      });

      it('should create a script with minimal data', async () => {
        const category = await ScriptCategory.create({
          name: '最小分类',
          type: ScriptType.PHONE,
        });

        const minimalData = {
          title: '简单话术',
          content: '这是一个简单的话术内容',
          categoryId: category.id,
          type: ScriptType.PHONE,
        };

        const script = await Script.create(minimalData);
        
        expect(script).toBeDefined();
        expect(script.id).toBeDefined();
        expect(script.title).toBe(minimalData.title);
        expect(script.content).toBe(minimalData.content);
        expect(script.categoryId).toBe(minimalData.categoryId);
        expect(script.type).toBe(minimalData.type);
        
        // Check default values
        expect(script.tags).toEqual([]);
        expect(script.keywords).toEqual([]);
        expect(script.usageCount).toBe(0);
        expect(script.status).toBe(ScriptStatus.ACTIVE);
        expect(script.isTemplate).toBe(false);
      });
    });

    describe('Model Validation', () => {
      it('should allow null values for optional fields', async () => {
        const category = await ScriptCategory.create({
          name: 'Null Test Category',
          type: ScriptType.RECEPTION,
        });

        const script = await Script.create({
          title: 'Null Test Script',
          content: 'Test content',
          categoryId: category.id,
          type: ScriptType.RECEPTION,
        });

        expect(script.description).toBeNull();
        expect(script.effectiveScore).toBeNull();
        expect(script.variables).toBeNull();
        expect(script.creatorId).toBeNull();
        expect(script.updaterId).toBeNull();
      });

      it('should handle JSON fields', async () => {
        const category = await ScriptCategory.create({
          name: 'JSON Test Category',
          type: ScriptType.CONSULTATION,
        });

        const jsonData = {
          tags: ['urgent', 'important', 'sales'],
          keywords: ['conversion', 'closing', 'followup'],
          variables: { customerName: 'string', budget: 'number', timeline: 'date' },
        };

        const script = await Script.create({
          title: 'JSON Test Script',
          content: 'Test content with JSON data',
          categoryId: category.id,
          type: ScriptType.CONSULTATION,
          ...jsonData,
        });

        expect(script.tags).toEqual(jsonData.tags);
        expect(script.keywords).toEqual(jsonData.keywords);
        expect(script.variables).toEqual(jsonData.variables);
      });

      it('should handle different script types', async () => {
        const category = await ScriptCategory.create({
          name: 'Multi Type Category',
          type: ScriptType.ENROLLMENT,
        });

        const scriptTypes = Object.values(ScriptType);
        
        for (const type of scriptTypes) {
          const script = await Script.create({
            title: `Type ${type} Script`,
            content: `Content for ${type} script`,
            categoryId: category.id,
            type: type,
          });
          
          expect(script.type).toBe(type);
        }
      });

      it('should handle different status values', async () => {
        const category = await ScriptCategory.create({
          name: 'Status Test Category',
          type: ScriptType.FOLLOWUP,
        });

        const statuses = Object.values(ScriptStatus);
        
        for (const status of statuses) {
          const script = await Script.create({
            title: `Status ${status} Script`,
            content: `Content for ${status} script`,
            categoryId: category.id,
            type: ScriptType.FOLLOWUP,
            status: status,
          });
          
          expect(script.status).toBe(status);
        }
      });
    });

    describe('Model Queries', () => {
      it('should find script by id', async () => {
        const category = await ScriptCategory.create({
          name: 'Find By ID Category',
          type: ScriptType.OBJECTION,
        });

        const createdScript = await Script.create({
          title: 'Find By ID Script',
          content: 'Test content',
          categoryId: category.id,
          type: ScriptType.OBJECTION,
        });

        const foundScript = await Script.findByPk(createdScript.id);
        
        expect(foundScript).toBeDefined();
        expect(foundScript?.id).toBe(createdScript.id);
        expect(foundScript?.title).toBe('Find By ID Script');
      });

      it('should find scripts by category', async () => {
        const category = await ScriptCategory.create({
          name: 'Test Category',
          type: ScriptType.ENROLLMENT,
        });

        await Script.bulkCreate([
          { title: 'Script 1', content: 'Content 1', categoryId: category.id, type: ScriptType.ENROLLMENT },
          { title: 'Script 2', content: 'Content 2', categoryId: category.id, type: ScriptType.ENROLLMENT },
          { title: 'Script 3', content: 'Content 3', categoryId: category.id, type: ScriptType.ENROLLMENT },
        ]);

        const categoryScripts = await Script.findAll({
          where: { categoryId: category.id },
        });
        
        expect(categoryScripts).toHaveLength(3);
        expect(categoryScripts.map(s => s.title)).toContain('Script 1');
        expect(categoryScripts.map(s => s.title)).toContain('Script 2');
        expect(categoryScripts.map(s => s.title)).toContain('Script 3');
      });

      it('should find scripts by type', async () => {
        const category = await ScriptCategory.create({
          name: 'Multi Type Category',
          type: ScriptType.PHONE,
        });

        await Script.bulkCreate([
          { title: 'Phone Script 1', content: 'Phone content 1', categoryId: category.id, type: ScriptType.PHONE },
          { title: 'Phone Script 2', content: 'Phone content 2', categoryId: category.id, type: ScriptType.PHONE },
          { title: 'Enrollment Script', content: 'Enrollment content', categoryId: category.id, type: ScriptType.ENROLLMENT },
        ]);

        const phoneScripts = await Script.findAll({
          where: { type: ScriptType.PHONE },
        });
        
        expect(phoneScripts).toHaveLength(2);
        expect(phoneScripts.map(s => s.title)).toContain('Phone Script 1');
        expect(phoneScripts.map(s => s.title)).toContain('Phone Script 2');
      });

      it('should find scripts by status', async () => {
        const category = await ScriptCategory.create({
          name: 'Status Category',
          type: ScriptType.RECEPTION,
        });

        await Script.bulkCreate([
          { title: 'Active Script', content: 'Active content', categoryId: category.id, type: ScriptType.RECEPTION, status: ScriptStatus.ACTIVE },
          { title: 'Inactive Script', content: 'Inactive content', categoryId: category.id, type: ScriptType.RECEPTION, status: ScriptStatus.INACTIVE },
          { title: 'Draft Script', content: 'Draft content', categoryId: category.id, type: ScriptType.RECEPTION, status: ScriptStatus.DRAFT },
        ]);

        const activeScripts = await Script.findAll({
          where: { status: ScriptStatus.ACTIVE },
        });
        
        expect(activeScripts).toHaveLength(1);
        expect(activeScripts[0].title).toBe('Active Script');
      });

      it('should find templates', async () => {
        const category = await ScriptCategory.create({
          name: 'Template Category',
          type: ScriptType.CONSULTATION,
        });

        await Script.bulkCreate([
          { title: 'Template Script', content: 'Template content', categoryId: category.id, type: ScriptType.CONSULTATION, isTemplate: true },
          { title: 'Regular Script', content: 'Regular content', categoryId: category.id, type: ScriptType.CONSULTATION, isTemplate: false },
          { title: 'Another Template', content: 'Another template content', categoryId: category.id, type: ScriptType.CONSULTATION, isTemplate: true },
        ]);

        const templateScripts = await Script.findAll({
          where: { isTemplate: true },
        });
        
        expect(templateScripts).toHaveLength(2);
        expect(templateScripts.map(s => s.title)).toContain('Template Script');
        expect(templateScripts.map(s => s.title)).toContain('Another Template');
      });

      it('should find scripts ordered by usage count', async () => {
        const category = await ScriptCategory.create({
          name: 'Usage Category',
          type: ScriptType.FOLLOWUP,
        });

        await Script.bulkCreate([
          { title: 'Popular Script', content: 'Popular content', categoryId: category.id, type: ScriptType.FOLLOWUP, usageCount: 100 },
          { title: 'Medium Script', content: 'Medium content', categoryId: category.id, type: ScriptType.FOLLOWUP, usageCount: 50 },
          { title: 'Rare Script', content: 'Rare content', categoryId: category.id, type: ScriptType.FOLLOWUP, usageCount: 10 },
        ]);

        const orderedScripts = await Script.findAll({
          where: { categoryId: category.id },
          order: [['usageCount', 'DESC']],
        });
        
        expect(orderedScripts[0].title).toBe('Popular Script');
        expect(orderedScripts[1].title).toBe('Medium Script');
        expect(orderedScripts[2].title).toBe('Rare Script');
      });
    });
  });

  describe('ScriptUsage Model', () => {
    describe('Model Definition', () => {
      it('should be defined', () => {
        expect(ScriptUsage).toBeDefined();
      });

      it('should have correct table name', () => {
        expect(ScriptUsage.tableName).toBe('script_usages');
      });

      it('should have timestamps enabled', () => {
        expect(ScriptUsage.options.timestamps).toBe(true);
      });

      it('should have underscored enabled', () => {
        expect(ScriptUsage.options.underscored).toBe(true);
      });
    });

    describe('Model Attributes', () => {
      it('should have correct id attribute', () => {
        const idAttribute = ScriptUsage.getAttributes().id;
        expect(idAttribute).toBeDefined();
        expect(idAttribute.type.constructor.name).toBe('INTEGERUNSIGNED');
        expect(idAttribute.primaryKey).toBe(true);
        expect(idAttribute.autoIncrement).toBe(true);
        expect(idAttribute.comment).toBe('使用记录ID');
      });

      it('should have correct scriptId attribute', () => {
        const scriptIdAttribute = ScriptUsage.getAttributes().scriptId;
        expect(scriptIdAttribute).toBeDefined();
        expect(scriptIdAttribute.type.constructor.name).toBe('INTEGERUNSIGNED');
        expect(scriptIdAttribute.allowNull).toBe(false);
        expect(scriptIdAttribute.comment).toBe('话术ID');
      });

      it('should have correct userId attribute', () => {
        const userIdAttribute = ScriptUsage.getAttributes().userId;
        expect(userIdAttribute).toBeDefined();
        expect(userIdAttribute.type.constructor.name).toBe('INTEGERUNSIGNED');
        expect(userIdAttribute.allowNull).toBe(false);
        expect(userIdAttribute.comment).toBe('用户ID');
      });

      it('should have correct usageContext attribute', () => {
        const usageContextAttribute = ScriptUsage.getAttributes().usageContext;
        expect(usageContextAttribute).toBeDefined();
        expect(usageContextAttribute.type.constructor.name).toBe('VARCHAR');
        expect(usageContextAttribute.allowNull).toBe(true);
        expect(usageContextAttribute.comment).toBe('使用场景');
      });

      it('should have correct effectiveRating attribute', () => {
        const effectiveRatingAttribute = ScriptUsage.getAttributes().effectiveRating;
        expect(effectiveRatingAttribute).toBeDefined();
        expect(effectiveRatingAttribute.type.constructor.name).toBe('INTEGER');
        expect(effectiveRatingAttribute.allowNull).toBe(true);
        expect(effectiveRatingAttribute.validate).toBeDefined();
        expect(effectiveRatingAttribute.comment).toBe('效果评分 1-5');
      });

      it('should have correct feedback attribute', () => {
        const feedbackAttribute = ScriptUsage.getAttributes().feedback;
        expect(feedbackAttribute).toBeDefined();
        expect(feedbackAttribute.type.constructor.name).toBe('TEXT');
        expect(feedbackAttribute.allowNull).toBe(true);
        expect(feedbackAttribute.comment).toBe('使用反馈');
      });

      it('should have correct usageDate attribute', () => {
        const usageDateAttribute = ScriptUsage.getAttributes().usageDate;
        expect(usageDateAttribute).toBeDefined();
        expect(usageDateAttribute.type.constructor.name).toBe('DATE');
        expect(usageDateAttribute.allowNull).toBe(false);
        expect(usageDateAttribute.defaultValue).toBeDefined();
        expect(usageDateAttribute.comment).toBe('使用时间');
      });
    });

    describe('Model Creation', () => {
      it('should create a new script usage', async () => {
        const category = await ScriptCategory.create({
          name: 'Usage Test Category',
          type: ScriptType.ENROLLMENT,
        });

        const script = await Script.create({
          title: 'Usage Test Script',
          content: 'Test content for usage',
          categoryId: category.id,
          type: ScriptType.ENROLLMENT,
        });

        const usageData = {
          scriptId: script.id,
          userId: 1,
          usageContext: '初次咨询',
          effectiveRating: 4,
          feedback: '这个话术效果很好，客户很满意',
          usageDate: new Date(),
        };

        const usage = await ScriptUsage.create(usageData);
        
        expect(usage).toBeDefined();
        expect(usage.id).toBeDefined();
        expect(usage.scriptId).toBe(usageData.scriptId);
        expect(usage.userId).toBe(usageData.userId);
        expect(usage.usageContext).toBe(usageData.usageContext);
        expect(usage.effectiveRating).toBe(usageData.effectiveRating);
        expect(usage.feedback).toBe(usageData.feedback);
        expect(usage.usageDate).toEqual(usageData.usageDate);
      });

      it('should create a script usage with minimal data', async () => {
        const category = await ScriptCategory.create({
          name: 'Minimal Usage Category',
          type: ScriptType.PHONE,
        });

        const script = await Script.create({
          title: 'Minimal Usage Script',
          content: 'Minimal content',
          categoryId: category.id,
          type: ScriptType.PHONE,
        });

        const minimalData = {
          scriptId: script.id,
          userId: 1,
        };

        const usage = await ScriptUsage.create(minimalData);
        
        expect(usage).toBeDefined();
        expect(usage.id).toBeDefined();
        expect(usage.scriptId).toBe(minimalData.scriptId);
        expect(usage.userId).toBe(minimalData.userId);
        
        // Check default values
        expect(usage.usageContext).toBeNull();
        expect(usage.effectiveRating).toBeNull();
        expect(usage.feedback).toBeNull();
        expect(usage.usageDate).toBeInstanceOf(Date);
      });
    });

    describe('Model Validation', () => {
      it('should allow null values for optional fields', async () => {
        const category = await ScriptCategory.create({
          name: 'Null Validation Category',
          type: ScriptType.RECEPTION,
        });

        const script = await Script.create({
          title: 'Null Validation Script',
          content: 'Validation content',
          categoryId: category.id,
          type: ScriptType.RECEPTION,
        });

        const usage = await ScriptUsage.create({
          scriptId: script.id,
          userId: 1,
        });

        expect(usage.usageContext).toBeNull();
        expect(usage.effectiveRating).toBeNull();
        expect(usage.feedback).toBeNull();
      });

      it('should handle valid rating values', async () => {
        const category = await ScriptCategory.create({
          name: 'Rating Validation Category',
          type: ScriptType.CONSULTATION,
        });

        const script = await Script.create({
          title: 'Rating Validation Script',
          content: 'Rating validation content',
          categoryId: category.id,
          type: ScriptType.CONSULTATION,
        });

        const validRatings = [1, 2, 3, 4, 5];
        
        for (const rating of validRatings) {
          const usage = await ScriptUsage.create({
            scriptId: script.id,
            userId: 1,
            effectiveRating: rating,
          });
          
          expect(usage.effectiveRating).toBe(rating);
        }
      });

      it('should handle empty string values', async () => {
        const category = await ScriptCategory.create({
          name: 'Empty String Category',
          type: ScriptType.FOLLOWUP,
        });

        const script = await Script.create({
          title: 'Empty String Script',
          content: 'Empty string validation',
          categoryId: category.id,
          type: ScriptType.FOLLOWUP,
        });

        const usage = await ScriptUsage.create({
          scriptId: script.id,
          userId: 1,
          usageContext: '',
          feedback: '',
        });

        expect(usage.usageContext).toBe('');
        expect(usage.feedback).toBe('');
      });
    });

    describe('Model Queries', () => {
      it('should find usage by id', async () => {
        const category = await ScriptCategory.create({
          name: 'Find By ID Category',
          type: ScriptType.OBJECTION,
        });

        const script = await Script.create({
          title: 'Find By ID Script',
          content: 'Find by ID content',
          categoryId: category.id,
          type: ScriptType.OBJECTION,
        });

        const createdUsage = await ScriptUsage.create({
          scriptId: script.id,
          userId: 1,
        });

        const foundUsage = await ScriptUsage.findByPk(createdUsage.id);
        
        expect(foundUsage).toBeDefined();
        expect(foundUsage?.id).toBe(createdUsage.id);
        expect(foundUsage?.scriptId).toBe(script.id);
        expect(foundUsage?.userId).toBe(1);
      });

      it('should find usages by script', async () => {
        const category = await ScriptCategory.create({
          name: 'Script Usage Category',
          type: ScriptType.ENROLLMENT,
        });

        const script = await Script.create({
          title: 'Popular Script',
          content: 'Popular script content',
          categoryId: category.id,
          type: ScriptType.ENROLLMENT,
        });

        await ScriptUsage.bulkCreate([
          { scriptId: script.id, userId: 1 },
          { scriptId: script.id, userId: 2 },
          { scriptId: script.id, userId: 3 },
        ]);

        const scriptUsages = await ScriptUsage.findAll({
          where: { scriptId: script.id },
        });
        
        expect(scriptUsages).toHaveLength(3);
        expect(scriptUsages.map(u => u.userId)).toContain(1);
        expect(scriptUsages.map(u => u.userId)).toContain(2);
        expect(scriptUsages.map(u => u.userId)).toContain(3);
      });

      it('should find usages by user', async () => {
        const category = await ScriptCategory.create({
          name: 'User Usage Category',
          type: ScriptType.PHONE,
        });

        const script1 = await Script.create({
          title: 'Script 1',
          content: 'Script 1 content',
          categoryId: category.id,
          type: ScriptType.PHONE,
        });

        const script2 = await Script.create({
          title: 'Script 2',
          content: 'Script 2 content',
          categoryId: category.id,
          type: ScriptType.PHONE,
        });

        await ScriptUsage.bulkCreate([
          { scriptId: script1.id, userId: 1 },
          { scriptId: script2.id, userId: 1 },
          { scriptId: script1.id, userId: 2 },
        ]);

        const user1Usages = await ScriptUsage.findAll({
          where: { userId: 1 },
        });
        
        expect(user1Usages).toHaveLength(2);
        expect(user1Usages.map(u => u.scriptId)).toContain(script1.id);
        expect(user1Usages.map(u => u.scriptId)).toContain(script2.id);
      });

      it('should find usages by rating', async () => {
        const category = await ScriptCategory.create({
          name: 'Rating Category',
          type: ScriptType.RECEPTION,
        });

        const script = await Script.create({
          title: 'Rated Script',
          content: 'Rated script content',
          categoryId: category.id,
          type: ScriptType.RECEPTION,
        });

        await ScriptUsage.bulkCreate([
          { scriptId: script.id, userId: 1, effectiveRating: 5 },
          { scriptId: script.id, userId: 2, effectiveRating: 4 },
          { scriptId: script.id, userId: 3, effectiveRating: 5 },
          { scriptId: script.id, userId: 4, effectiveRating: 3 },
        ]);

        const highRatedUsages = await ScriptUsage.findAll({
          where: { effectiveRating: 5 },
        });
        
        expect(highRatedUsages).toHaveLength(2);
        expect(highRatedUsages.map(u => u.userId)).toContain(1);
        expect(highRatedUsages.map(u => u.userId)).toContain(3);
      });

      it('should find usages by date range', async () => {
        const category = await ScriptCategory.create({
          name: 'Date Range Category',
          type: ScriptType.CONSULTATION,
        });

        const script = await Script.create({
          title: 'Date Range Script',
          content: 'Date range content',
          categoryId: category.id,
          type: ScriptType.CONSULTATION,
        });

        const today = new Date();
        const yesterday = new Date(today.getTime() - 86400000);
        const tomorrow = new Date(today.getTime() + 86400000);

        await ScriptUsage.bulkCreate([
          { scriptId: script.id, userId: 1, usageDate: yesterday },
          { scriptId: script.id, userId: 2, usageDate: today },
          { scriptId: script.id, userId: 3, usageDate: tomorrow },
        ]);

        const todayUsages = await ScriptUsage.findAll({
          where: {
            usageDate: {
              [Op.gte]: today,
            },
          },
        });
        
        expect(todayUsages).toHaveLength(2);
        expect(todayUsages.map(u => u.userId)).toContain(2);
        expect(todayUsages.map(u => u.userId)).toContain(3);
      });
    });
  });

  describe('Model Associations', () => {
    it('should define script category to scripts association', () => {
      const associations = ScriptCategory.associations;
      expect(associations.scripts).toBeDefined();
      expect(associations.scripts.associationType).toBe('HasMany');
    });

    it('should define script to category association', () => {
      const associations = Script.associations;
      expect(associations.category).toBeDefined();
      expect(associations.category.associationType).toBe('BelongsTo');
    });

    it('should define script to usages association', () => {
      const associations = Script.associations;
      expect(associations.usages).toBeDefined();
      expect(associations.usages.associationType).toBe('HasMany');
    });

    it('should define usage to script association', () => {
      const associations = ScriptUsage.associations;
      expect(associations.script).toBeDefined();
      expect(associations.script.associationType).toBe('BelongsTo');
    });

    it('should define script to creator association', () => {
      const associations = Script.associations;
      expect(associations.creator).toBeDefined();
      expect(associations.creator.associationType).toBe('BelongsTo');
    });

    it('should define script to updater association', () => {
      const associations = Script.associations;
      expect(associations.updater).toBeDefined();
      expect(associations.updater.associationType).toBe('BelongsTo');
    });

    it('should define usage to user association', () => {
      const associations = ScriptUsage.associations;
      expect(associations.user).toBeDefined();
      expect(associations.user.associationType).toBe('BelongsTo');
    });
  });

  describe('Business Logic Tests', () => {
    it('should handle complete script workflow', async () => {
      // Create category
      const category = await ScriptCategory.create({
        name: '工作流测试分类',
        type: ScriptType.ENROLLMENT,
        status: ScriptStatus.ACTIVE,
      });

      // Create script
      const script = await Script.create({
        title: '工作流测试话术',
        content: '这是一个测试话术内容',
        categoryId: category.id,
        type: ScriptType.ENROLLMENT,
        tags: ['测试', '工作流'],
        status: ScriptStatus.ACTIVE,
      });

      // Create usage records
      const usage1 = await ScriptUsage.create({
        scriptId: script.id,
        userId: 1,
        usageContext: '测试场景1',
        effectiveRating: 4,
        feedback: '效果不错',
      });

      const usage2 = await ScriptUsage.create({
        scriptId: script.id,
        userId: 2,
        usageContext: '测试场景2',
        effectiveRating: 5,
        feedback: '非常好用',
      });

      // Verify associations work
      const categoryWithScripts = await ScriptCategory.findByPk(category.id, {
        include: ['scripts'],
      });

      expect((categoryWithScripts as any)?.scripts).toHaveLength(1);
      expect((categoryWithScripts as any)?.scripts[0].title).toBe('工作流测试话术');

      const scriptWithUsages = await Script.findByPk(script.id, {
        include: ['usages'],
      });

      expect((scriptWithUsages as any)?.usages).toHaveLength(2);
      expect((scriptWithUsages as any)?.usages.map((u: any) => u.userId)).toContain(1);
      expect((scriptWithUsages as any)?.usages.map((u: any) => u.userId)).toContain(2);
    });

    it('should handle script performance tracking', async () => {
      const category = await ScriptCategory.create({
        name: '性能测试分类',
        type: ScriptType.PHONE,
      });

      const script = await Script.create({
        title: '性能测试话术',
        content: '性能测试内容',
        categoryId: category.id,
        type: ScriptType.PHONE,
        usageCount: 0,
        effectiveScore: null,
      });

      // Create multiple usage records with different ratings
      const ratings = [5, 4, 5, 3, 4, 5, 4, 3, 5, 4];
      
      for (let i = 0; i < ratings.length; i++) {
        await ScriptUsage.create({
          scriptId: script.id,
          userId: i + 1,
          effectiveRating: ratings[i],
        });
      }

      // Update script usage count
      await script.update({ usageCount: ratings.length });

      const updatedScript = await Script.findByPk(script.id);
      expect(updatedScript?.usageCount).toBe(ratings.length);

      // Calculate average rating
      const usages = await ScriptUsage.findAll({
        where: { scriptId: script.id },
      });

      const totalRating = usages.reduce((sum, usage) => sum + (usage.effectiveRating || 0), 0);
      const averageRating = totalRating / usages.length;
      
      expect(averageRating).toBe(4.2); // (5+4+5+3+4+5+4+3+5+4)/10 = 42/10 = 4.2
    });

    it('should handle script categorization and filtering', async () => {
      // Create multiple categories
      const categories = await Promise.all([
        ScriptCategory.create({ name: '招生类', type: ScriptType.ENROLLMENT }),
        ScriptCategory.create({ name: '电话类', type: ScriptType.PHONE }),
        ScriptCategory.create({ name: '接待类', type: ScriptType.RECEPTION }),
      ]);

      // Create scripts in different categories
      const scripts = await Promise.all([
        Script.create({ title: '招生话术1', content: '内容1', categoryId: categories[0].id, type: ScriptType.ENROLLMENT, isTemplate: true }),
        Script.create({ title: '招生话术2', content: '内容2', categoryId: categories[0].id, type: ScriptType.ENROLLMENT, isTemplate: false }),
        Script.create({ title: '电话话术1', content: '内容3', categoryId: categories[1].id, type: ScriptType.PHONE, isTemplate: true }),
        Script.create({ title: '接待话术1', content: '内容4', categoryId: categories[2].id, type: ScriptType.RECEPTION, isTemplate: false }),
      ]);

      // Test filtering by category
      const enrollmentScripts = await Script.findAll({
        where: { categoryId: categories[0].id },
      });
      expect(enrollmentScripts).toHaveLength(2);

      // Test filtering by type
      const phoneScripts = await Script.findAll({
        where: { type: ScriptType.PHONE },
      });
      expect(phoneScripts).toHaveLength(1);

      // Test filtering by template status
      const templateScripts = await Script.findAll({
        where: { isTemplate: true },
      });
      expect(templateScripts).toHaveLength(2);
    });

    it('should handle script usage analytics', async () => {
      const category = await ScriptCategory.create({
        name: '分析测试分类',
        type: ScriptType.CONSULTATION,
      });

      const script = await Script.create({
        title: '分析测试话术',
        content: '分析测试内容',
        categoryId: category.id,
        type: ScriptType.CONSULTATION,
      });

      // Create usage records over different dates
      const dates = [
        new Date('2025-01-10'),
        new Date('2025-01-11'),
        new Date('2025-01-12'),
        new Date('2025-01-13'),
        new Date('2025-01-14'),
      ];

      for (let i = 0; i < dates.length; i++) {
        await ScriptUsage.create({
          scriptId: script.id,
          userId: i + 1,
          usageDate: dates[i],
          effectiveRating: i + 1, // Ratings 1-5
        });
      }

      // Test date range queries
      const startDate = new Date('2025-01-12');
      const endDate = new Date('2025-01-14');

      const recentUsages = await ScriptUsage.findAll({
        where: {
          scriptId: script.id,
          usageDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['usageDate', 'ASC']],
      });

      expect(recentUsages).toHaveLength(3);
      expect(recentUsages[0].effectiveRating).toBe(3);
      expect(recentUsages[1].effectiveRating).toBe(4);
      expect(recentUsages[2].effectiveRating).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long script content', async () => {
      const category = await ScriptCategory.create({
        name: '长内容分类',
        type: ScriptType.FOLLOWUP,
      });

      const longContent = 'a'.repeat(50000); // Very long content
      
      const script = await Script.create({
        title: '长内容话术',
        content: longContent,
        categoryId: category.id,
        type: ScriptType.FOLLOWUP,
      });

      expect(script.content).toBe(longContent);
    });

    it('should handle unicode characters in all fields', async () => {
      const category = await ScriptCategory.create({
        name: 'Unicode分类',
        description: 'Unicode描述',
        type: ScriptType.OBJECTION,
      });

      const script = await Script.create({
        title: 'Unicode话术',
        content: 'Unicode内容包含中文、日本語、한글、العربية',
        description: 'Unicode描述',
        categoryId: category.id,
        type: ScriptType.OBJECTION,
        tags: ['标签1', 'タグ2', '태그3'],
        keywords: ['关键词1', 'キーワード2', '키워드3'],
      });

      const usage = await ScriptUsage.create({
        scriptId: script.id,
        userId: 1,
        usageContext: '使用场景',
        feedback: '反馈内容包含特殊字符',
      });

      expect(script.title).toBe('Unicode话术');
      expect(script.content).toContain('中文');
      expect(script.tags).toEqual(['标签1', 'タグ2', '태그3']);
      expect(usage.usageContext).toBe('使用场景');
      expect(usage.feedback).toBe('反馈内容包含特殊字符');
    });

    it('should handle special characters and HTML content', async () => {
      const category = await ScriptCategory.create({
        name: 'Special <Category>',
        type: ScriptType.ENROLLMENT,
      });

      const script = await Script.create({
        title: 'Special <Script>',
        content: '<p>This is HTML content with <strong>formatting</strong></p>',
        description: 'Description with special chars: !@#$%^&*()',
        categoryId: category.id,
        type: ScriptType.ENROLLMENT,
      });

      expect(script.title).toBe('Special <Script>');
      expect(script.content).toBe('<p>This is HTML content with <strong>formatting</strong></p>');
      expect(script.description).toBe('Description with special chars: !@#$%^&*()');
    });
  });
});