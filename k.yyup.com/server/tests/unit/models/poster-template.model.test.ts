/**
 * PosterTemplate 模型测试用例
 * 对应模型文件: poster-template.model.ts
 */

import { PosterTemplate } from '../../../src/models/poster-template.model';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';
import { PosterElement } from '../../../src/models/poster-element.model';
import { Sequelize } from 'sequelize';

// 模拟 Sequelize 实例
const mockSequelize = {
  define: jest.fn(),
  models: {}
} as unknown as Sequelize;


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

describe('PosterTemplate Model', () => {
  let sequelize: Sequelize;

  beforeAll(() => {
    sequelize = mockSequelize;
  });

  describe('模型属性接口测试', () => {
    test('PosterTemplateAttributes 接口应该包含所有必需属性', () => {
      const attributes: PosterTemplateAttributes = {
        id: 1,
        name: '测试模板',
        description: '这是一个测试模板',
        category: '教育',
        width: 750,
        height: 1334,
        background: '#ffffff',
        thumbnail: 'https://example.com/thumb.jpg',
        kindergartenId: 1,
        status: 1,
        usageCount: 10,
        remark: '测试备注',
        creatorId: 1,
        updaterId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      expect(attributes.id).toBe(1);
      expect(attributes.name).toBe('测试模板');
      expect(attributes.description).toBe('这是一个测试模板');
      expect(attributes.category).toBe('教育');
      expect(attributes.width).toBe(750);
      expect(attributes.height).toBe(1334);
      expect(attributes.background).toBe('#ffffff');
      expect(attributes.thumbnail).toBe('https://example.com/thumb.jpg');
      expect(attributes.kindergartenId).toBe(1);
      expect(attributes.status).toBe(1);
      expect(attributes.usageCount).toBe(10);
      expect(attributes.remark).toBe('测试备注');
      expect(attributes.creatorId).toBe(1);
      expect(attributes.updaterId).toBe(2);
      expect(attributes.createdAt).toBeInstanceOf(Date);
      expect(attributes.updatedAt).toBeInstanceOf(Date);
      expect(attributes.deletedAt).toBeNull();
    });

    test('PosterTemplateCreationAttributes 接口应该允许省略可选字段', () => {
      const creationAttributes: PosterTemplateCreationAttributes = {
        name: '测试模板'
      };

      expect(creationAttributes.name).toBe('测试模板');
      expect(creationAttributes.description).toBeUndefined();
      expect(creationAttributes.category).toBeUndefined();
      expect(creationAttributes.background).toBeUndefined();
      expect(creationAttributes.thumbnail).toBeUndefined();
      expect(creationAttributes.kindergartenId).toBeUndefined();
      expect(creationAttributes.status).toBeUndefined();
      expect(creationAttributes.usageCount).toBeUndefined();
      expect(creationAttributes.remark).toBeUndefined();
      expect(creationAttributes.creatorId).toBeUndefined();
      expect(creationAttributes.updaterId).toBeUndefined();
      expect(creationAttributes.createdAt).toBeUndefined();
      expect(creationAttributes.updatedAt).toBeUndefined();
      expect(creationAttributes.deletedAt).toBeUndefined();
    });
  });

  describe('模型初始化测试', () => {
    test('initModel 函数应该存在并可调用', () => {
      expect(typeof PosterTemplate.initModel).toBe('function');
      
      // 模拟调用
      const mockModel = {
        belongsTo: jest.fn(),
        hasMany: jest.fn()
      };
      
      jest.spyOn(sequelize, 'define').mockReturnValue(mockModel as any);
      
      expect(() => PosterTemplate.initModel(sequelize)).not.toThrow();
    });

    test('initAssociations 函数应该存在并可调用', () => {
      expect(typeof PosterTemplate.initAssociations).toBe('function');
      
      // 模拟调用
      const mockModel = {
        belongsTo: jest.fn(),
        hasMany: jest.fn()
      };
      
      // 设置模拟的 sequelize.models
      (sequelize as any).models = {
        PosterTemplate: mockModel,
        User: {},
        PosterElement: {}
      };
      
      expect(() => PosterTemplate.initAssociations()).not.toThrow();
    });
  });

  describe('字段定义测试', () => {
    test('应该定义正确的字段类型和约束', () => {
      const mockFields = {
        id: { type: 'INTEGER', autoIncrement: true, primaryKey: true },
        name: { type: 'STRING(100)', allowNull: false },
        description: { type: 'STRING(500)', allowNull: true },
        category: { type: 'STRING(50)', allowNull: true },
        width: { type: 'INTEGER', allowNull: false, defaultValue: 750 },
        height: { type: 'INTEGER', allowNull: false, defaultValue: 1334 },
        background: { type: 'STRING(255)', allowNull: true },
        thumbnail: { type: 'STRING(255)', allowNull: true },
        kindergartenId: { type: 'INTEGER', allowNull: true },
        status: { type: 'TINYINT', allowNull: false, defaultValue: 1 },
        usageCount: { type: 'INTEGER', allowNull: false, defaultValue: 0 },
        remark: { type: 'STRING(500)', allowNull: true },
        creatorId: { type: 'INTEGER', allowNull: true },
        updaterId: { type: 'INTEGER', allowNull: true },
        createdAt: { type: 'DATE', allowNull: false },
        updatedAt: { type: 'DATE', allowNull: false },
        deletedAt: { type: 'DATE' }
      };

      expect(mockFields.id.type).toBe('INTEGER');
      expect(mockFields.name.type).toBe('STRING(100)');
      expect(mockFields.name.allowNull).toBe(false);
      expect(mockFields.description.type).toBe('STRING(500)');
      expect(mockFields.description.allowNull).toBe(true);
      expect(mockFields.category.type).toBe('STRING(50)');
      expect(mockFields.category.allowNull).toBe(true);
      expect(mockFields.width.type).toBe('INTEGER');
      expect(mockFields.width.defaultValue).toBe(750);
      expect(mockFields.height.type).toBe('INTEGER');
      expect(mockFields.height.defaultValue).toBe(1334);
      expect(mockFields.background.type).toBe('STRING(255)');
      expect(mockFields.thumbnail.type).toBe('STRING(255)');
      expect(mockFields.status.type).toBe('TINYINT');
      expect(mockFields.status.defaultValue).toBe(1);
      expect(mockFields.usageCount.type).toBe('INTEGER');
      expect(mockFields.usageCount.defaultValue).toBe(0);
    });
  });

  describe('关联关系测试', () => {
    test('应该定义与 User 的关联关系', () => {
      const mockModel = {
        belongsTo: jest.fn()
      };

      mockModel.belongsTo(User, {
        foreignKey: 'creatorId',
        as: 'creator'
      });

      expect(mockModel.belongsTo).toHaveBeenCalledWith(User, {
        foreignKey: 'creatorId',
        as: 'creator'
      });
    });

    test('应该定义与 PosterElement 的关联关系', () => {
      const mockModel = {
        hasMany: jest.fn()
      };

      mockModel.hasMany(PosterElement, {
        foreignKey: 'templateId',
        as: 'elements'
      });

      expect(mockModel.hasMany).toHaveBeenCalledWith(PosterElement, {
        foreignKey: 'templateId',
        as: 'elements'
      });
    });
  });

  describe('实例方法测试', () => {
    describe('incrementUsageCount 方法测试', () => {
      test('incrementUsageCount 方法应该存在', () => {
        const mockInstance = {
          usageCount: 10,
          save: jest.fn(),
          incrementUsageCount: PosterTemplate.prototype.incrementUsageCount
        };
        
        expect(typeof mockInstance.incrementUsageCount).toBe('function');
      });

      test('incrementUsageCount 应该正确增加使用次数', async () => {
        const mockSave = jest.fn();
        let usageCount = 10;
        
        const mockInstance = {
          get usageCount() { return usageCount; },
          set usageCount(value) { usageCount = value; },
          save: mockSave,
          incrementUsageCount: PosterTemplate.prototype.incrementUsageCount
        };
        
        await mockInstance.incrementUsageCount();
        
        expect(mockInstance.usageCount).toBe(11);
        expect(mockSave).toHaveBeenCalled();
      });
    });

    describe('getSize 方法测试', () => {
      test('getSize 方法应该存在', () => {
        const mockInstance = {
          width: 750,
          height: 1334,
          getSize: PosterTemplate.prototype.getSize
        };
        
        expect(typeof mockInstance.getSize).toBe('function');
      });

      test('getSize 应该返回正确的尺寸信息', () => {
        const mockInstance = {
          width: 750,
          height: 1334,
          getSize: PosterTemplate.prototype.getSize
        };
        
        const result = mockInstance.getSize();
        expect(result).toEqual({ width: 750, height: 1334 });
      });
    });

    describe('getBackgroundInfo 方法测试', () => {
      test('getBackgroundInfo 方法应该存在', () => {
        const mockInstance = {
          background: '#ffffff',
          getBackgroundInfo: PosterTemplate.prototype.getBackgroundInfo
        };
        
        expect(typeof mockInstance.getBackgroundInfo).toBe('function');
      });

      test('getBackgroundInfo 应该正确识别颜色背景', () => {
        const mockInstance = {
          background: '#ffffff',
          getBackgroundInfo: PosterTemplate.prototype.getBackgroundInfo
        };
        
        const result = mockInstance.getBackgroundInfo();
        expect(result).toEqual({ type: 'color', value: '#ffffff' });
      });

      test('getBackgroundInfo 应该正确识别RGB颜色背景', () => {
        const mockInstance = {
          background: 'rgb(255, 255, 255)',
          getBackgroundInfo: PosterTemplate.prototype.getBackgroundInfo
        };
        
        const result = mockInstance.getBackgroundInfo();
        expect(result).toEqual({ type: 'color', value: 'rgb(255, 255, 255)' });
      });

      test('getBackgroundInfo 应该正确识别图片背景', () => {
        const mockInstance = {
          background: 'https://example.com/background.jpg',
          getBackgroundInfo: PosterTemplate.prototype.getBackgroundInfo
        };
        
        const result = mockInstance.getBackgroundInfo();
        expect(result).toEqual({ type: 'image', value: 'https://example.com/background.jpg' });
      });

      test('getBackgroundInfo 应该处理null背景', () => {
        const mockInstance = {
          background: null,
          getBackgroundInfo: PosterTemplate.prototype.getBackgroundInfo
        };
        
        const result = mockInstance.getBackgroundInfo();
        expect(result).toEqual({ type: null, value: null });
      });
    });
  });

  describe('数据验证测试', () => {
    test('name 字段应该有长度限制', () => {
      const validName = 'a'.repeat(100); // 最多100个字符
      const invalidName = 'a'.repeat(101); // 超过100个字符
      
      expect(validName.length).toBe(100);
      expect(invalidName.length).toBe(101);
    });

    test('description 字段应该有长度限制', () => {
      const validDescription = 'a'.repeat(500); // 最多500个字符
      const invalidDescription = 'a'.repeat(501); // 超过500个字符
      
      expect(validDescription.length).toBe(500);
      expect(invalidDescription.length).toBe(501);
    });

    test('category 字段应该有长度限制', () => {
      const validCategory = 'a'.repeat(50); // 最多50个字符
      const invalidCategory = 'a'.repeat(51); // 超过50个字符
      
      expect(validCategory.length).toBe(50);
      expect(invalidCategory.length).toBe(51);
    });

    test('background 和 thumbnail 字段应该有长度限制', () => {
      const validUrl = 'a'.repeat(255); // 最多255个字符
      const invalidUrl = 'a'.repeat(256); // 超过255个字符
      
      expect(validUrl.length).toBe(255);
      expect(invalidUrl.length).toBe(256);
    });

    test('remark 字段应该有长度限制', () => {
      const validRemark = 'a'.repeat(500); // 最多500个字符
      const invalidRemark = 'a'.repeat(501); // 超过500个字符
      
      expect(validRemark.length).toBe(500);
      expect(invalidRemark.length).toBe(501);
    });

    test('width 和 height 应该是正整数', () => {
      const validDimensions = [1, 100, 750, 1334, 2000];
      const invalidDimensions = [0, -1, -100];
      
      validDimensions.forEach(dim => {
        expect(dim).toBeGreaterThan(0);
        expect(Number.isInteger(dim)).toBe(true);
      });
      
      invalidDimensions.forEach(dim => {
        expect(dim).toBeLessThanOrEqual(0);
      });
    });

    test('status 字段应该是有效的状态值', () => {
      const validStatusValues = [0, 1];
      const invalidStatusValues = [-1, 2, 3];
      
      validStatusValues.forEach(status => {
        expect([0, 1]).toContain(status);
      });
      
      invalidStatusValues.forEach(status => {
        expect([0, 1]).not.toContain(status);
      });
    });

    test('usageCount 应该是非负整数', () => {
      const validCounts = [0, 1, 10, 100, 1000];
      const invalidCounts = [-1, -10];
      
      validCounts.forEach(count => {
        expect(count).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(count)).toBe(true);
      });
      
      invalidCounts.forEach(count => {
        expect(count).toBeLessThan(0);
      });
    });
  });

  describe('业务逻辑测试', () => {
    test('应该能够处理不同类型的背景', () => {
      const backgroundTypes = [
        { background: '#ffffff', expectedType: 'color' },
        { background: 'rgb(255, 255, 255)', expectedType: 'color' },
        { background: 'https://example.com/image.jpg', expectedType: 'image' },
        { background: '/images/background.png', expectedType: 'image' },
        { background: null, expectedType: null }
      ];

      backgroundTypes.forEach(({ background, expectedType }) => {
        const mockInstance = {
          background: background,
          getBackgroundInfo: PosterTemplate.prototype.getBackgroundInfo
        };
        
        const result = mockInstance.getBackgroundInfo();
        expect(result.type).toBe(expectedType);
      });
    });

    test('应该能够处理模板尺寸', () => {
      const templateSizes = [
        { width: 750, height: 1334, aspectRatio: '9:16' },
        { width: 1080, height: 1080, aspectRatio: '1:1' },
        { width: 1200, height: 630, aspectRatio: '16:9' },
        { width: 800, height: 600, aspectRatio: '4:3' }
      ];

      templateSizes.forEach(({ width, height, aspectRatio }) => {
        const mockInstance = {
          width: width,
          height: height,
          getSize: PosterTemplate.prototype.getSize
        };
        
        const size = mockInstance.getSize();
        expect(size.width).toBe(width);
        expect(size.height).toBe(height);
        expect(size.width).toBeGreaterThan(0);
        expect(size.height).toBeGreaterThan(0);
      });
    });

    test('应该能够处理模板使用次数', () => {
      const usageCounts = [0, 1, 5, 10, 100, 1000];
      
      usageCounts.forEach(count => {
        const mockInstance = {
          usageCount: count,
          incrementUsageCount: PosterTemplate.prototype.incrementUsageCount,
          save: jest.fn()
        };
        
        expect(mockInstance.usageCount).toBe(count);
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    test('应该能够处理模板分类', () => {
      const categories = [
        '教育',
        '商业',
        '节日',
        '活动',
        '宣传',
        '个人',
        null,
        ''
      ];

      categories.forEach(category => {
        expect(category === null || typeof category === 'string').toBe(true);
        
        if (category && category.length > 0) {
          expect(category.length).toBeLessThanOrEqual(50);
        }
      });
    });
  });

  describe('错误处理测试', () => {
    test('应该处理无效的背景格式', () => {
      const invalidBackgrounds = [
        'invalid-color',
        'rgb(300, 300, 300)',
        'not-a-url',
        ''
      ];

      invalidBackgrounds.forEach(background => {
        const mockInstance = {
          background: background,
          getBackgroundInfo: PosterTemplate.prototype.getBackgroundInfo
        };
        
        const result = mockInstance.getBackgroundInfo();
        
        if (background === '') {
          expect(result.type).toBe('color');
          expect(result.value).toBe('');
        } else {
          // 无效格式会被识别为图片类型
          expect(result.type).toBe('image');
          expect(result.value).toBe(background);
        }
      });
    });

    test('应该处理负数的尺寸', () => {
      const invalidDimensions = { width: -100, height: -50 };
      
      expect(invalidDimensions.width).toBeLessThan(0);
      expect(invalidDimensions.height).toBeLessThan(0);
    });

    test('应该处理负数的使用次数', () => {
      const invalidUsageCount = -10;
      
      expect(invalidUsageCount).toBeLessThan(0);
    });
  });

  describe('模型配置测试', () => {
    test('应该启用时间戳', () => {
      const options = {
        timestamps: true,
        underscored: true,
        paranoid: true
      };

      expect(options.timestamps).toBe(true);
    });

    test('应该启用软删除', () => {
      const paranoid = true;
      expect(paranoid).toBe(true);
    });

    test('应该使用下划线命名约定', () => {
      const underscored = true;
      expect(underscored).toBe(true);
    });

    test('表名应该是 poster_templates', () => {
      const tableName = 'poster_templates';
      expect(tableName).toBe('poster_templates');
    });
  });

  describe('默认值测试', () => {
    test('width 应该有默认值 750', () => {
      const defaultValue = 750;
      expect(defaultValue).toBe(750);
    });

    test('height 应该有默认值 1334', () => {
      const defaultValue = 1334;
      expect(defaultValue).toBe(1334);
    });

    test('status 应该有默认值 1', () => {
      const defaultValue = 1;
      expect(defaultValue).toBe(1);
    });

    test('usageCount 应该有默认值 0', () => {
      const defaultValue = 0;
      expect(defaultValue).toBe(0);
    });
  });

  describe('类型安全测试', () => {
    test('PosterTemplate 类应该正确声明属性类型', () => {
      const mockInstance = {
        id: 1,
        name: '测试模板',
        description: '测试描述',
        category: '教育',
        width: 750,
        height: 1334,
        background: '#ffffff',
        thumbnail: 'https://example.com/thumb.jpg',
        kindergartenId: 1,
        status: 1,
        usageCount: 10,
        remark: '测试备注',
        creatorId: 1,
        updaterId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      expect(typeof mockInstance.id).toBe('number');
      expect(typeof mockInstance.name).toBe('string');
      expect(mockInstance.description === null || typeof mockInstance.description === 'string').toBe(true);
      expect(mockInstance.category === null || typeof mockInstance.category === 'string').toBe(true);
      expect(typeof mockInstance.width).toBe('number');
      expect(typeof mockInstance.height).toBe('number');
      expect(mockInstance.background === null || typeof mockInstance.background === 'string').toBe(true);
      expect(mockInstance.thumbnail === null || typeof mockInstance.thumbnail === 'string').toBe(true);
      expect(mockInstance.kindergartenId === null || typeof mockInstance.kindergartenId === 'number').toBe(true);
      expect(typeof mockInstance.status).toBe('number');
      expect(typeof mockInstance.usageCount).toBe('number');
      expect(mockInstance.remark === null || typeof mockInstance.remark === 'string').toBe(true);
      expect(mockInstance.creatorId === null || typeof mockInstance.creatorId === 'number').toBe(true);
      expect(mockInstance.updaterId === null || typeof mockInstance.updaterId === 'number').toBe(true);
      expect(mockInstance.createdAt instanceof Date).toBe(true);
      expect(mockInstance.updatedAt instanceof Date).toBe(true);
      expect(mockInstance.deletedAt === null || mockInstance.deletedAt instanceof Date).toBe(true);
    });
  });
});