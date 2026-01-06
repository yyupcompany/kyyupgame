import { Sequelize, Op } from 'sequelize';
import { vi } from 'vitest'
import { 
  PageGuide, 
  PageGuideSection, 
  initPageGuide, 
  initPageGuideSection, 
  initPageGuideAssociations 
} from '../../../src/models/page-guide.model';


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

describe('PageGuide Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    // Initialize models
    initPageGuide(sequelize);
    initPageGuideSection(sequelize);
    initPageGuideAssociations();
    
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await PageGuide.destroy({ where: {} });
    await PageGuideSection.destroy({ where: {} });
  });

  describe('PageGuide Model Definition', () => {
    it('should have correct model name', () => {
      expect(PageGuide.tableName).toBe('page_guides');
    });

    it('should have correct attributes', () => {
      const attributes = Object.keys(PageGuide.getAttributes());
      expect(attributes).toContain('id');
      expect(attributes).toContain('pagePath');
      expect(attributes).toContain('pageName');
      expect(attributes).toContain('pageDescription');
      expect(attributes).toContain('category');
      expect(attributes).toContain('importance');
      expect(attributes).toContain('relatedTables');
      expect(attributes).toContain('contextPrompt');
      expect(attributes).toContain('isActive');
    });
  });

  describe('PageGuide Field Validation', () => {
    it('should require pagePath', async () => {
      const guide = PageGuide.build({
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      } as any);

      await expect(guide.save()).rejects.toThrow();
    });

    it('should require pageName', async () => {
      const guide = PageGuide.build({
        pagePath: '/test',
        pageDescription: 'Test description',
        category: 'test',
      } as any);

      await expect(guide.save()).rejects.toThrow();
    });

    it('should require pageDescription', async () => {
      const guide = PageGuide.build({
        pagePath: '/test',
        pageName: 'Test Page',
        category: 'test',
      } as any);

      await expect(guide.save()).rejects.toThrow();
    });

    it('should require category', async () => {
      const guide = PageGuide.build({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
      } as any);

      await expect(guide.save()).rejects.toThrow();
    });

    it('should enforce unique pagePath constraint', async () => {
      await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page 1',
        pageDescription: 'Test description 1',
        category: 'test',
      });

      const guide2 = PageGuide.build({
        pagePath: '/test',
        pageName: 'Test Page 2',
        pageDescription: 'Test description 2',
        category: 'test',
      });

      await expect(guide2.save()).rejects.toThrow();
    });

    it('should create PageGuide with valid data', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'This is a test page description',
        category: 'test',
        importance: 8,
        relatedTables: ['users', 'roles'],
        contextPrompt: 'Test context prompt',
        isActive: true,
      });

      expect(guide.id).toBeDefined();
      expect(guide.pagePath).toBe('/test');
      expect(guide.pageName).toBe('Test Page');
      expect(guide.pageDescription).toBe('This is a test page description');
      expect(guide.category).toBe('test');
      expect(guide.importance).toBe(8);
      expect(guide.relatedTables).toEqual(['users', 'roles']);
      expect(guide.contextPrompt).toBe('Test context prompt');
      expect(guide.isActive).toBe(true);
    });

    it('should have default values', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      expect(guide.importance).toBe(5);
      expect(guide.relatedTables).toEqual([]);
      expect(guide.contextPrompt).toBeNull();
      expect(guide.isActive).toBe(true);
    });
  });

  describe('PageGuide Data Types', () => {
    it('should handle pagePath within length limit', async () => {
      const longPath = '/test/' + 'a'.repeat(245); // Total 255 chars

      const guide = await PageGuide.create({
        pagePath: longPath,
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      expect(guide.pagePath).toBe(longPath);
    });

    it('should handle pageName within length limit', async () => {
      const longName = 'a'.repeat(100); // Max length for pageName

      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: longName,
        pageDescription: 'Test description',
        category: 'test',
      });

      expect(guide.pageName).toBe(longName);
    });

    it('should handle category within length limit', async () => {
      const longCategory = 'a'.repeat(50); // Max length for category

      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: longCategory,
      });

      expect(guide.category).toBe(longCategory);
    });

    it('should handle importance values', async () => {
      const importanceValues = [1, 5, 10]; // Min, default, max

      for (const importance of importanceValues) {
        const guide = await PageGuide.create({
          pagePath: `/test-${importance}`,
          pageName: `Test Page ${importance}`,
          pageDescription: 'Test description',
          category: 'test',
          importance,
        });

        expect(guide.importance).toBe(importance);
      }
    });

    it('should handle JSON relatedTables', async () => {
      const relatedTables = [
        'users',
        'roles',
        'permissions',
        'user_roles',
        'role_permissions'
      ];

      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
        relatedTables,
      });

      expect(guide.relatedTables).toEqual(relatedTables);
    });

    it('should handle empty relatedTables array', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
        relatedTables: [],
      });

      expect(guide.relatedTables).toEqual([]);
    });

    it('should handle long pageDescription', async () => {
      const longDescription = 'a'.repeat(10000); // Very long description

      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: longDescription,
        category: 'test',
      });

      expect(guide.pageDescription).toBe(longDescription);
    });

    it('should handle long contextPrompt', async () => {
      const longPrompt = 'a'.repeat(5000); // Very long prompt

      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
        contextPrompt: longPrompt,
      });

      expect(guide.contextPrompt).toBe(longPrompt);
    });

    it('should handle boolean isActive', async () => {
      const activeGuide = await PageGuide.create({
        pagePath: '/active',
        pageName: 'Active Page',
        pageDescription: 'Active description',
        category: 'test',
        isActive: true,
      });

      const inactiveGuide = await PageGuide.create({
        pagePath: '/inactive',
        pageName: 'Inactive Page',
        pageDescription: 'Inactive description',
        category: 'test',
        isActive: false,
      });

      expect(activeGuide.isActive).toBe(true);
      expect(inactiveGuide.isActive).toBe(false);
    });
  });

  describe('PageGuideSection Model Definition', () => {
    it('should have correct model name', () => {
      expect(PageGuideSection.tableName).toBe('page_guide_sections');
    });

    it('should have correct attributes', () => {
      const attributes = Object.keys(PageGuideSection.getAttributes());
      expect(attributes).toContain('id');
      expect(attributes).toContain('pageGuideId');
      expect(attributes).toContain('sectionName');
      expect(attributes).toContain('sectionDescription');
      expect(attributes).toContain('sectionPath');
      expect(attributes).toContain('features');
      expect(attributes).toContain('sortOrder');
      expect(attributes).toContain('isActive');
    });
  });

  describe('PageGuideSection Field Validation', () => {
    it('should require pageGuideId', async () => {
      const section = PageGuideSection.build({
        sectionName: 'Test Section',
        sectionDescription: 'Test section description',
      } as any);

      await expect(section.save()).rejects.toThrow();
    });

    it('should require sectionName', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      const section = PageGuideSection.build({
        pageGuideId: guide.id,
        sectionDescription: 'Test section description',
      } as any);

      await expect(section.save()).rejects.toThrow();
    });

    it('should require sectionDescription', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      const section = PageGuideSection.build({
        pageGuideId: guide.id,
        sectionName: 'Test Section',
      } as any);

      await expect(section.save()).rejects.toThrow();
    });

    it('should create PageGuideSection with valid data', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      const section = await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Test Section',
        sectionDescription: 'This is a test section description',
        sectionPath: '/test/section',
        features: ['feature1', 'feature2', 'feature3'],
        sortOrder: 1,
        isActive: true,
      });

      expect(section.id).toBeDefined();
      expect(section.pageGuideId).toBe(guide.id);
      expect(section.sectionName).toBe('Test Section');
      expect(section.sectionDescription).toBe('This is a test section description');
      expect(section.sectionPath).toBe('/test/section');
      expect(section.features).toEqual(['feature1', 'feature2', 'feature3']);
      expect(section.sortOrder).toBe(1);
      expect(section.isActive).toBe(true);
    });

    it('should have default values', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      const section = await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Test Section',
        sectionDescription: 'Test section description',
      });

      expect(section.sectionPath).toBeNull();
      expect(section.features).toEqual([]);
      expect(section.sortOrder).toBe(0);
      expect(section.isActive).toBe(true);
    });
  });

  describe('PageGuideSection Data Types', () => {
    it('should handle sectionName within length limit', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      const longName = 'a'.repeat(100); // Max length for sectionName

      const section = await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: longName,
        sectionDescription: 'Test section description',
      });

      expect(section.sectionName).toBe(longName);
    });

    it('should handle sectionPath within length limit', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      const longPath = '/test/section/' + 'a'.repeat(225); // Total 255 chars

      const section = await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Test Section',
        sectionDescription: 'Test section description',
        sectionPath: longPath,
      });

      expect(section.sectionPath).toBe(longPath);
    });

    it('should handle JSON features', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      const features = [
        'User Management',
        'Role Management',
        'Permission Management',
        'Audit Logging',
        'Data Export'
      ];

      const section = await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Test Section',
        sectionDescription: 'Test section description',
        features,
      });

      expect(section.features).toEqual(features);
    });

    it('should handle empty features array', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      const section = await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Test Section',
        sectionDescription: 'Test section description',
        features: [],
      });

      expect(section.features).toEqual([]);
    });

    it('should handle sortOrder values', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      const sortOrders = [0, 1, 10, 100];

      for (const sortOrder of sortOrders) {
        const section = await PageGuideSection.create({
          pageGuideId: guide.id,
          sectionName: `Test Section ${sortOrder}`,
          sectionDescription: 'Test section description',
          sortOrder,
        });

        expect(section.sortOrder).toBe(sortOrder);
      }
    });

    it('should handle long sectionDescription', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      const longDescription = 'a'.repeat(10000); // Very long description

      const section = await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Test Section',
        sectionDescription: longDescription,
      });

      expect(section.sectionDescription).toBe(longDescription);
    });
  });

  describe('Associations', () => {
    it('should create sections for a page guide', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      const section1 = await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Section 1',
        sectionDescription: 'Description 1',
        sortOrder: 1,
      });

      const section2 = await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Section 2',
        sectionDescription: 'Description 2',
        sortOrder: 2,
      });

      const guideWithSections = await PageGuide.findByPk(guide.id, {
        include: ['sections'],
      });

      expect(guideWithSections?.sections).toBeDefined();
      expect(guideWithSections?.sections?.length).toBe(2);
      expect(guideWithSections?.sections?.[0].sectionName).toBe('Section 1');
      expect(guideWithSections?.sections?.[1].sectionName).toBe('Section 2');
    });

    it('should associate section with page guide', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      const section = await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Test Section',
        sectionDescription: 'Test section description',
      });

      const sectionWithGuide = await PageGuideSection.findByPk(section.id, {
        include: ['pageGuide'],
      });

      expect(sectionWithGuide?.pageGuide).toBeDefined();
      expect(sectionWithGuide?.pageGuide?.id).toBe(guide.id);
      expect(sectionWithGuide?.pageGuide?.pageName).toBe('Test Page');
    });

    it('should handle cascade delete', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Test Section',
        sectionDescription: 'Test section description',
      });

      await guide.destroy();

      const sections = await PageGuideSection.findAll({
        where: { pageGuideId: guide.id },
      });

      expect(sections.length).toBe(0);
    });
  });

  describe('CRUD Operations', () => {
    describe('PageGuide CRUD', () => {
      it('should create PageGuide successfully', async () => {
        const guide = await PageGuide.create({
          pagePath: '/test',
          pageName: 'Test Page',
          pageDescription: 'Test description',
          category: 'test',
        });

        expect(guide.id).toBeDefined();
        expect(guide.pagePath).toBe('/test');
        expect(guide.pageName).toBe('Test Page');
      });

      it('should read PageGuide successfully', async () => {
        const guide = await PageGuide.create({
          pagePath: '/test',
          pageName: 'Test Page',
          pageDescription: 'Test description',
          category: 'test',
        });

        const foundGuide = await PageGuide.findByPk(guide.id);

        expect(foundGuide).toBeDefined();
        expect(foundGuide?.id).toBe(guide.id);
        expect(foundGuide?.pageName).toBe('Test Page');
      });

      it('should update PageGuide successfully', async () => {
        const guide = await PageGuide.create({
          pagePath: '/test',
          pageName: 'Test Page',
          pageDescription: 'Test description',
          category: 'test',
          isActive: true,
        });

        await guide.update({
          pageName: 'Updated Page',
          importance: 9,
          isActive: false,
        });

        const updatedGuide = await PageGuide.findByPk(guide.id);

        expect(updatedGuide?.pageName).toBe('Updated Page');
        expect(updatedGuide?.importance).toBe(9);
        expect(updatedGuide?.isActive).toBe(false);
      });

      it('should delete PageGuide successfully', async () => {
        const guide = await PageGuide.create({
          pagePath: '/test',
          pageName: 'Test Page',
          pageDescription: 'Test description',
          category: 'test',
        });

        await guide.destroy();

        const deletedGuide = await PageGuide.findByPk(guide.id);

        expect(deletedGuide).toBeNull();
      });
    });

    describe('PageGuideSection CRUD', () => {
      it('should create PageGuideSection successfully', async () => {
        const guide = await PageGuide.create({
          pagePath: '/test',
          pageName: 'Test Page',
          pageDescription: 'Test description',
          category: 'test',
        });

        const section = await PageGuideSection.create({
          pageGuideId: guide.id,
          sectionName: 'Test Section',
          sectionDescription: 'Test section description',
        });

        expect(section.id).toBeDefined();
        expect(section.pageGuideId).toBe(guide.id);
        expect(section.sectionName).toBe('Test Section');
      });

      it('should read PageGuideSection successfully', async () => {
        const guide = await PageGuide.create({
          pagePath: '/test',
          pageName: 'Test Page',
          pageDescription: 'Test description',
          category: 'test',
        });

        const section = await PageGuideSection.create({
          pageGuideId: guide.id,
          sectionName: 'Test Section',
          sectionDescription: 'Test section description',
        });

        const foundSection = await PageGuideSection.findByPk(section.id);

        expect(foundSection).toBeDefined();
        expect(foundSection?.id).toBe(section.id);
        expect(foundSection?.sectionName).toBe('Test Section');
      });

      it('should update PageGuideSection successfully', async () => {
        const guide = await PageGuide.create({
          pagePath: '/test',
          pageName: 'Test Page',
          pageDescription: 'Test description',
          category: 'test',
        });

        const section = await PageGuideSection.create({
          pageGuideId: guide.id,
          sectionName: 'Test Section',
          sectionDescription: 'Test section description',
          sortOrder: 1,
          isActive: true,
        });

        await section.update({
          sectionName: 'Updated Section',
          sortOrder: 2,
          isActive: false,
        });

        const updatedSection = await PageGuideSection.findByPk(section.id);

        expect(updatedSection?.sectionName).toBe('Updated Section');
        expect(updatedSection?.sortOrder).toBe(2);
        expect(updatedSection?.isActive).toBe(false);
      });

      it('should delete PageGuideSection successfully', async () => {
        const guide = await PageGuide.create({
          pagePath: '/test',
          pageName: 'Test Page',
          pageDescription: 'Test description',
          category: 'test',
        });

        const section = await PageGuideSection.create({
          pageGuideId: guide.id,
          sectionName: 'Test Section',
          sectionDescription: 'Test section description',
        });

        await section.destroy();

        const deletedSection = await PageGuideSection.findByPk(section.id);

        expect(deletedSection).toBeNull();
      });
    });
  });

  describe('Query Methods', () => {
    it('should find PageGuide by pagePath', async () => {
      await PageGuide.create({
        pagePath: '/test1',
        pageName: 'Test Page 1',
        pageDescription: 'Test description 1',
        category: 'test',
      });

      await PageGuide.create({
        pagePath: '/test2',
        pageName: 'Test Page 2',
        pageDescription: 'Test description 2',
        category: 'test',
      });

      const guide1 = await PageGuide.findOne({
        where: { pagePath: '/test1' },
      });

      const guide2 = await PageGuide.findOne({
        where: { pagePath: '/test2' },
      });

      expect(guide1).toBeDefined();
      expect(guide2).toBeDefined();
      expect(guide1?.pageName).toBe('Test Page 1');
      expect(guide2?.pageName).toBe('Test Page 2');
    });

    it('should find PageGuide by category', async () => {
      await PageGuide.create({
        pagePath: '/center1',
        pageName: 'Center Page 1',
        pageDescription: 'Center description 1',
        category: 'center',
      });

      await PageGuide.create({
        pagePath: '/center2',
        pageName: 'Center Page 2',
        pageDescription: 'Center description 2',
        category: 'center',
      });

      await PageGuide.create({
        pagePath: '/admin1',
        pageName: 'Admin Page 1',
        pageDescription: 'Admin description 1',
        category: 'admin',
      });

      const centerGuides = await PageGuide.findAll({
        where: { category: 'center' },
      });

      const adminGuides = await PageGuide.findAll({
        where: { category: 'admin' },
      });

      expect(centerGuides.length).toBe(2);
      expect(adminGuides.length).toBe(1);
      expect(centerGuides[0].category).toBe('center');
      expect(adminGuides[0].category).toBe('admin');
    });

    it('should find PageGuide by isActive', async () => {
      await PageGuide.create({
        pagePath: '/active1',
        pageName: 'Active Page 1',
        pageDescription: 'Active description 1',
        category: 'test',
        isActive: true,
      });

      await PageGuide.create({
        pagePath: '/active2',
        pageName: 'Active Page 2',
        pageDescription: 'Active description 2',
        category: 'test',
        isActive: true,
      });

      await PageGuide.create({
        pagePath: '/inactive1',
        pageName: 'Inactive Page 1',
        pageDescription: 'Inactive description 1',
        category: 'test',
        isActive: false,
      });

      const activeGuides = await PageGuide.findAll({
        where: { isActive: true },
      });

      const inactiveGuides = await PageGuide.findAll({
        where: { isActive: false },
      });

      expect(activeGuides.length).toBe(2);
      expect(inactiveGuides.length).toBe(1);
      expect(activeGuides[0].isActive).toBe(true);
      expect(inactiveGuides[0].isActive).toBe(false);
    });

    it('should find PageGuide by importance range', async () => {
      await PageGuide.create({
        pagePath: '/low',
        pageName: 'Low Importance',
        pageDescription: 'Low description',
        category: 'test',
        importance: 3,
      });

      await PageGuide.create({
        pagePath: '/medium',
        pageName: 'Medium Importance',
        pageDescription: 'Medium description',
        category: 'test',
        importance: 5,
      });

      await PageGuide.create({
        pagePath: '/high',
        pageName: 'High Importance',
        pageDescription: 'High description',
        category: 'test',
        importance: 8,
      });

      const highImportanceGuides = await PageGuide.findAll({
        where: {
          importance: {
            [Op.gte]: 7,
          },
        },
      });

      const lowImportanceGuides = await PageGuide.findAll({
        where: {
          importance: {
            [Op.lte]: 4,
          },
        },
      });

      expect(highImportanceGuides.length).toBe(1);
      expect(lowImportanceGuides.length).toBe(1);
      expect(highImportanceGuides[0].pageName).toBe('High Importance');
      expect(lowImportanceGuides[0].pageName).toBe('Low Importance');
    });

    it('should find PageGuideSection by pageGuideId', async () => {
      const guide1 = await PageGuide.create({
        pagePath: '/test1',
        pageName: 'Test Page 1',
        pageDescription: 'Test description 1',
        category: 'test',
      });

      const guide2 = await PageGuide.create({
        pagePath: '/test2',
        pageName: 'Test Page 2',
        pageDescription: 'Test description 2',
        category: 'test',
      });

      await PageGuideSection.create({
        pageGuideId: guide1.id,
        sectionName: 'Section 1',
        sectionDescription: 'Description 1',
      });

      await PageGuideSection.create({
        pageGuideId: guide1.id,
        sectionName: 'Section 2',
        sectionDescription: 'Description 2',
      });

      await PageGuideSection.create({
        pageGuideId: guide2.id,
        sectionName: 'Section 3',
        sectionDescription: 'Description 3',
      });

      const guide1Sections = await PageGuideSection.findAll({
        where: { pageGuideId: guide1.id },
      });

      const guide2Sections = await PageGuideSection.findAll({
        where: { pageGuideId: guide2.id },
      });

      expect(guide1Sections.length).toBe(2);
      expect(guide2Sections.length).toBe(1);
      expect(guide1Sections[0].pageGuideId).toBe(guide1.id);
      expect(guide2Sections[0].pageGuideId).toBe(guide2.id);
    });

    it('should find PageGuideSection by sortOrder', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'First Section',
        sectionDescription: 'First description',
        sortOrder: 1,
      });

      await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Second Section',
        sectionDescription: 'Second description',
        sortOrder: 2,
      });

      await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Third Section',
        sectionDescription: 'Third description',
        sortOrder: 3,
      });

      const sections = await PageGuideSection.findAll({
        where: { pageGuideId: guide.id },
        order: [['sortOrder', 'ASC']],
      });

      expect(sections.length).toBe(3);
      expect(sections[0].sectionName).toBe('First Section');
      expect(sections[1].sectionName).toBe('Second Section');
      expect(sections[2].sectionName).toBe('Third Section');
    });
  });

  describe('Business Logic Scenarios', () => {
    it('should organize sections by sortOrder', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      // Create sections in random order
      await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Third Section',
        sectionDescription: 'Third description',
        sortOrder: 3,
      });

      await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'First Section',
        sectionDescription: 'First description',
        sortOrder: 1,
      });

      await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Second Section',
        sectionDescription: 'Second description',
        sortOrder: 2,
      });

      const sections = await PageGuideSection.findAll({
        where: { pageGuideId: guide.id },
        order: [['sortOrder', 'ASC']],
      });

      expect(sections[0].sectionName).toBe('First Section');
      expect(sections[1].sectionName).toBe('Second Section');
      expect(sections[2].sectionName).toBe('Third Section');
    });

    it('should filter active sections only', async () => {
      const guide = await PageGuide.create({
        pagePath: '/test',
        pageName: 'Test Page',
        pageDescription: 'Test description',
        category: 'test',
      });

      await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Active Section 1',
        sectionDescription: 'Active description 1',
        isActive: true,
      });

      await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Inactive Section',
        sectionDescription: 'Inactive description',
        isActive: false,
      });

      await PageGuideSection.create({
        pageGuideId: guide.id,
        sectionName: 'Active Section 2',
        sectionDescription: 'Active description 2',
        isActive: true,
      });

      const activeSections = await PageGuideSection.findAll({
        where: { 
          pageGuideId: guide.id,
          isActive: true,
        },
      });

      const inactiveSections = await PageGuideSection.findAll({
        where: { 
          pageGuideId: guide.id,
          isActive: false,
        },
      });

      expect(activeSections.length).toBe(2);
      expect(inactiveSections.length).toBe(1);
      expect(activeSections[0].isActive).toBe(true);
      expect(inactiveSections[0].isActive).toBe(false);
    });

    it('should handle complex page guide structures', async () => {
      const guide = await PageGuide.create({
        pagePath: '/complex',
        pageName: 'Complex Page',
        pageDescription: 'Complex page description',
        category: 'complex',
        importance: 10,
        relatedTables: ['users', 'roles', 'permissions', 'settings'],
        contextPrompt: 'This is a complex page with multiple sections and features',
      });

      const sections = [
        {
          name: 'User Management',
          description: 'Manage user accounts and permissions',
          path: '/complex/users',
          features: ['Create User', 'Edit User', 'Delete User', 'User Roles'],
          sortOrder: 1,
        },
        {
          name: 'Role Management',
          description: 'Manage system roles and permissions',
          path: '/complex/roles',
          features: ['Create Role', 'Edit Role', 'Delete Role', 'Role Permissions'],
          sortOrder: 2,
        },
        {
          name: 'Settings',
          description: 'System configuration and settings',
          path: '/complex/settings',
          features: ['General Settings', 'Security Settings', 'Notification Settings'],
          sortOrder: 3,
        },
      ];

      for (const sectionData of sections) {
        await PageGuideSection.create({
          pageGuideId: guide.id,
          sectionName: sectionData.name,
          sectionDescription: sectionData.description,
          sectionPath: sectionData.path,
          features: sectionData.features,
          sortOrder: sectionData.sortOrder,
        });
      }

      const completeGuide = await PageGuide.findByPk(guide.id, {
        include: ['sections'],
        order: [[{ model: PageGuideSection }, 'sortOrder', 'ASC']],
      });

      expect(completeGuide?.sections?.length).toBe(3);
      expect(completeGuide?.sections?.[0].sectionName).toBe('User Management');
      expect(completeGuide?.sections?.[1].sectionName).toBe('Role Management');
      expect(completeGuide?.sections?.[2].sectionName).toBe('Settings');
      expect(completeGuide?.relatedTables?.length).toBe(4);
    });
  });
});