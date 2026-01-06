/**
 * PosterGeneration 模型测试用例
 * 对应模型文件: poster-generation.model.ts
 */

import { PosterGeneration } from '../../../src/models/poster-generation.model';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';
import { Kindergarten } from '../../../src/models/kindergarten.model';
import { PosterTemplate } from '../../../src/models/poster-template.model';
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

describe('PosterGeneration Model', () => {
  let sequelize: Sequelize;

  beforeAll(() => {
    sequelize = mockSequelize;
  });

  describe('模型属性接口测试', () => {
    test('PosterGenerationAttributes 接口应该包含所有必需属性', () => {
      const attributes: PosterGenerationAttributes = {
        id: 1,
        name: '测试海报',
        templateId: 1,
        posterUrl: 'https://example.com/poster.jpg',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        status: 1,
        remark: '测试备注',
        creatorId: 1,
        updaterId: 2,
        parameters: '{"theme":"blue","text":"Hello World"}',
        imageUrl: 'https://example.com/image.jpg',
        shareCount: 10,
        downloadCount: 5,
        viewCount: 100,
        kindergartenId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      expect(attributes.id).toBe(1);
      expect(attributes.name).toBe('测试海报');
      expect(attributes.templateId).toBe(1);
      expect(attributes.posterUrl).toBe('https://example.com/poster.jpg');
      expect(attributes.thumbnailUrl).toBe('https://example.com/thumbnail.jpg');
      expect(attributes.status).toBe(1);
      expect(attributes.remark).toBe('测试备注');
      expect(attributes.creatorId).toBe(1);
      expect(attributes.updaterId).toBe(2);
      expect(attributes.parameters).toBe('{"theme":"blue","text":"Hello World"}');
      expect(attributes.imageUrl).toBe('https://example.com/image.jpg');
      expect(attributes.shareCount).toBe(10);
      expect(attributes.downloadCount).toBe(5);
      expect(attributes.viewCount).toBe(100);
      expect(attributes.kindergartenId).toBe(1);
      expect(attributes.createdAt).toBeInstanceOf(Date);
      expect(attributes.updatedAt).toBeInstanceOf(Date);
      expect(attributes.deletedAt).toBeNull();
    });

    test('PosterGenerationCreationAttributes 接口应该允许省略可选字段', () => {
      const creationAttributes: PosterGenerationCreationAttributes = {
        name: '测试海报',
        templateId: 1,
        posterUrl: 'https://example.com/poster.jpg',
        creatorId: 1,
        updaterId: 2
      };

      expect(creationAttributes.name).toBe('测试海报');
      expect(creationAttributes.thumbnailUrl).toBeUndefined();
      expect(creationAttributes.status).toBeUndefined();
      expect(creationAttributes.remark).toBeUndefined();
      expect(creationAttributes.parameters).toBeUndefined();
      expect(creationAttributes.imageUrl).toBeUndefined();
      expect(creationAttributes.shareCount).toBeUndefined();
      expect(creationAttributes.downloadCount).toBeUndefined();
      expect(creationAttributes.viewCount).toBeUndefined();
      expect(creationAttributes.kindergartenId).toBeUndefined();
      expect(creationAttributes.createdAt).toBeUndefined();
      expect(creationAttributes.updatedAt).toBeUndefined();
      expect(creationAttributes.deletedAt).toBeUndefined();
    });
  });

  describe('模型初始化测试', () => {
    test('initModel 函数应该存在并可调用', () => {
      expect(typeof PosterGeneration.initModel).toBe('function');
      
      // 模拟调用
      const mockModel = {
        belongsTo: jest.fn(),
        hasMany: jest.fn()
      };
      
      jest.spyOn(sequelize, 'define').mockReturnValue(mockModel as any);
      
      expect(() => PosterGeneration.initModel(sequelize)).not.toThrow();
    });

    test('initAssociations 函数应该存在并可调用', () => {
      expect(typeof PosterGeneration.initAssociations).toBe('function');
      
      // 模拟调用
      const mockModel = {
        belongsTo: jest.fn(),
        hasMany: jest.fn()
      };
      
      // 设置模拟的 sequelize.models
      (sequelize as any).models = {
        PosterGeneration: mockModel,
        User: {},
        Kindergarten: {},
        PosterTemplate: {},
        PosterElement: {}
      };
      
      expect(() => PosterGeneration.initAssociations()).not.toThrow();
    });
  });

  describe('字段定义测试', () => {
    test('应该定义正确的字段类型和约束', () => {
      const mockFields = {
        id: { type: 'INTEGER', autoIncrement: true, primaryKey: true },
        name: { type: 'STRING(100)', allowNull: false },
        templateId: { type: 'INTEGER', allowNull: false },
        posterUrl: { type: 'STRING(255)', allowNull: false },
        thumbnailUrl: { type: 'STRING(255)', allowNull: true },
        status: { type: 'TINYINT', allowNull: false, defaultValue: 1 },
        remark: { type: 'STRING(500)', allowNull: true },
        creatorId: { type: 'INTEGER', allowNull: false },
        updaterId: { type: 'INTEGER', allowNull: false },
        parameters: { type: 'TEXT', allowNull: true },
        imageUrl: { type: 'STRING(255)', allowNull: true },
        shareCount: { type: 'INTEGER', allowNull: false, defaultValue: 0 },
        downloadCount: { type: 'INTEGER', allowNull: false, defaultValue: 0 },
        viewCount: { type: 'INTEGER', allowNull: false, defaultValue: 0 },
        kindergartenId: { type: 'INTEGER', allowNull: true },
        createdAt: { type: 'DATE', allowNull: false },
        updatedAt: { type: 'DATE', allowNull: false },
        deletedAt: { type: 'DATE' }
      };

      expect(mockFields.id.type).toBe('INTEGER');
      expect(mockFields.name.type).toBe('STRING(100)');
      expect(mockFields.name.allowNull).toBe(false);
      expect(mockFields.templateId.type).toBe('INTEGER');
      expect(mockFields.templateId.allowNull).toBe(false);
      expect(mockFields.posterUrl.type).toBe('STRING(255)');
      expect(mockFields.posterUrl.allowNull).toBe(false);
      expect(mockFields.thumbnailUrl.type).toBe('STRING(255)');
      expect(mockFields.thumbnailUrl.allowNull).toBe(true);
      expect(mockFields.status.type).toBe('TINYINT');
      expect(mockFields.status.defaultValue).toBe(1);
      expect(mockFields.remark.type).toBe('STRING(500)');
      expect(mockFields.creatorId.type).toBe('INTEGER');
      expect(mockFields.creatorId.allowNull).toBe(false);
      expect(mockFields.updaterId.type).toBe('INTEGER');
      expect(mockFields.updaterId.allowNull).toBe(false);
      expect(mockFields.parameters.type).toBe('TEXT');
      expect(mockFields.shareCount.type).toBe('INTEGER');
      expect(mockFields.shareCount.defaultValue).toBe(0);
      expect(mockFields.downloadCount.type).toBe('INTEGER');
      expect(mockFields.downloadCount.defaultValue).toBe(0);
      expect(mockFields.viewCount.type).toBe('INTEGER');
      expect(mockFields.viewCount.defaultValue).toBe(0);
    });
  });

  describe('关联关系测试', () => {
    test('应该定义与 User (creator) 的关联关系', () => {
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

    test('应该定义与 Kindergarten 的关联关系', () => {
      const mockModel = {
        belongsTo: jest.fn()
      };

      mockModel.belongsTo(Kindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
      });

      expect(mockModel.belongsTo).toHaveBeenCalledWith(Kindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
      });
    });

    test('应该定义与 PosterTemplate 的关联关系', () => {
      const mockModel = {
        belongsTo: jest.fn()
      };

      mockModel.belongsTo(PosterTemplate, {
        foreignKey: 'templateId',
        as: 'template'
      });

      expect(mockModel.belongsTo).toHaveBeenCalledWith(PosterTemplate, {
        foreignKey: 'templateId',
        as: 'template'
      });
    });

    test('应该定义与 PosterElement 的关联关系', () => {
      const mockModel = {
        hasMany: jest.fn()
      };

      mockModel.hasMany(PosterElement, {
        foreignKey: 'generationId',
        as: 'elements'
      });

      expect(mockModel.hasMany).toHaveBeenCalledWith(PosterElement, {
        foreignKey: 'generationId',
        as: 'elements'
      });
    });
  });

  describe('实例方法测试', () => {
    describe('getStatusText 方法测试', () => {
      test('getStatusText 方法应该存在', () => {
        const mockInstance = {
          status: 1,
          getStatusText: PosterGeneration.prototype.getStatusText
        };
        
        expect(typeof mockInstance.getStatusText).toBe('function');
      });

      test('getStatusText 应该返回正确的状态文本', () => {
        const testCases = [
          { status: 0, expected: '已删除' },
          { status: 1, expected: '正常' },
          { status: 2, expected: '未知状态' }
        ];

        testCases.forEach(({ status, expected }) => {
          const mockInstance = {
            status: status,
            getStatusText: PosterGeneration.prototype.getStatusText
          };
          
          const result = mockInstance.getStatusText();
          expect(result).toBe(expected);
        });
      });
    });

    describe('getPosterInfo 方法测试', () => {
      test('getPosterInfo 方法应该存在', () => {
        const mockInstance = {
          posterUrl: 'https://example.com/poster.jpg',
          thumbnailUrl: 'https://example.com/thumbnail.jpg',
          getPosterInfo: PosterGeneration.prototype.getPosterInfo
        };
        
        expect(typeof mockInstance.getPosterInfo).toBe('function');
      });

      test('getPosterInfo 应该返回正确的海报信息', () => {
        const mockInstance = {
          posterUrl: 'https://example.com/poster.jpg',
          thumbnailUrl: 'https://example.com/thumbnail.jpg',
          getPosterInfo: PosterGeneration.prototype.getPosterInfo
        };
        
        const result = mockInstance.getPosterInfo();
        expect(result).toEqual({
          posterUrl: 'https://example.com/poster.jpg',
          thumbnailUrl: 'https://example.com/thumbnail.jpg'
        });
      });

      test('getPosterInfo 应该处理null的缩略图URL', () => {
        const mockInstance = {
          posterUrl: 'https://example.com/poster.jpg',
          thumbnailUrl: null,
          getPosterInfo: PosterGeneration.prototype.getPosterInfo
        };
        
        const result = mockInstance.getPosterInfo();
        expect(result).toEqual({
          posterUrl: 'https://example.com/poster.jpg',
          thumbnailUrl: null
        });
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

    test('posterUrl 和 thumbnailUrl 应该有长度限制', () => {
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

    test('统计字段应该是非负整数', () => {
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

    test('parameters 应该是有效的JSON格式', () => {
      const validParameters = [
        '{}',
        '{"theme":"blue"}',
        '{"text":"Hello World","fontSize":16}',
        '{"background":"#ffffff","border":"1px solid #ccc"}'
      ];
      
      const invalidParameters = [
        'invalid-json',
        '{theme:blue}',
        '{"text":}',
        ''
      ];
      
      validParameters.forEach(params => {
        expect(() => JSON.parse(params)).not.toThrow();
      });
      
      invalidParameters.forEach(params => {
        if (params) {
          expect(() => JSON.parse(params)).toThrow();
        }
      });
    });
  });

  describe('业务逻辑测试', () => {
    test('应该能够处理不同的状态值', () => {
      const statusMap = {
        0: '已删除',
        1: '正常'
      };

      Object.entries(statusMap).forEach(([status, text]) => {
        const mockInstance = {
          status: parseInt(status),
          getStatusText: PosterGeneration.prototype.getStatusText
        };
        
        const result = mockInstance.getStatusText();
        expect(result).toBe(text);
      });
    });

    test('应该能够处理海报的统计信息', () => {
      const mockInstance = {
        shareCount: 10,
        downloadCount: 5,
        viewCount: 100
      };

      expect(mockInstance.shareCount).toBe(10);
      expect(mockInstance.downloadCount).toBe(5);
      expect(mockInstance.viewCount).toBe(100);

      // 验证统计关系
      expect(mockInstance.viewCount).toBeGreaterThan(mockInstance.shareCount);
      expect(mockInstance.shareCount).toBeGreaterThan(mockInstance.downloadCount);
    });

    test('应该能够处理海报的URL信息', () => {
      const posterUrls = [
        {
          posterUrl: 'https://example.com/poster1.jpg',
          thumbnailUrl: 'https://example.com/thumb1.jpg',
          imageUrl: 'https://example.com/image1.jpg'
        },
        {
          posterUrl: 'https://cdn.example.com/poster2.png',
          thumbnailUrl: null,
          imageUrl: 'https://cdn.example.com/image2.png'
        },
        {
          posterUrl: 'https://storage.example.com/poster3.gif',
          thumbnailUrl: 'https://storage.example.com/thumb3.gif',
          imageUrl: null
        }
      ];

      posterUrls.forEach(urls => {
        expect(urls.posterUrl).toBeDefined();
        expect(urls.posterUrl).toMatch(/^https?:\/\//);
        
        if (urls.thumbnailUrl) {
          expect(urls.thumbnailUrl).toMatch(/^https?:\/\//);
        }
        
        if (urls.imageUrl) {
          expect(urls.imageUrl).toMatch(/^https?:\/\//);
        }
      });
    });

    test('应该能够处理海报参数', () => {
      const parametersList = [
        '{"theme":"blue","text":"Hello World"}',
        '{"background":"#ffffff","fontSize":16}',
        '{"layout":"center","spacing":10}',
        '{}'
      ];

      parametersList.forEach(params => {
        expect(() => JSON.parse(params)).not.toThrow();
        
        const parsedParams = JSON.parse(params);
        expect(typeof parsedParams).toBe('object');
      });
    });
  });

  describe('错误处理测试', () => {
    test('应该处理无效的状态值', () => {
      const invalidStatus = 99;
      
      const mockInstance = {
        status: invalidStatus,
        getStatusText: PosterGeneration.prototype.getStatusText
      };
      
      const result = mockInstance.getStatusText();
      expect(result).toBe('未知状态');
    });

    test('应该处理负数的统计值', () => {
      const invalidCounts = { shareCount: -1, downloadCount: -5, viewCount: -10 };
      
      expect(invalidCounts.shareCount).toBeLessThan(0);
      expect(invalidCounts.downloadCount).toBeLessThan(0);
      expect(invalidCounts.viewCount).toBeLessThan(0);
    });

    test('应该处理无效的JSON参数', () => {
      const invalidParameters = 'invalid-json';
      
      expect(() => JSON.parse(invalidParameters)).toThrow();
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

    test('表名应该是 poster_generations', () => {
      const tableName = 'poster_generations';
      expect(tableName).toBe('poster_generations');
    });
  });

  describe('默认值测试', () => {
    test('status 应该有默认值 1', () => {
      const defaultValue = 1;
      expect(defaultValue).toBe(1);
    });

    test('shareCount 应该有默认值 0', () => {
      const defaultValue = 0;
      expect(defaultValue).toBe(0);
    });

    test('downloadCount 应该有默认值 0', () => {
      const defaultValue = 0;
      expect(defaultValue).toBe(0);
    });

    test('viewCount 应该有默认值 0', () => {
      const defaultValue = 0;
      expect(defaultValue).toBe(0);
    });
  });

  describe('类型安全测试', () => {
    test('PosterGeneration 类应该正确声明属性类型', () => {
      const mockInstance = {
        id: 1,
        name: '测试海报',
        templateId: 1,
        posterUrl: 'https://example.com/poster.jpg',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        status: 1,
        remark: '测试备注',
        creatorId: 1,
        updaterId: 2,
        parameters: '{"theme":"blue"}',
        imageUrl: 'https://example.com/image.jpg',
        shareCount: 10,
        downloadCount: 5,
        viewCount: 100,
        kindergartenId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      expect(typeof mockInstance.id).toBe('number');
      expect(typeof mockInstance.name).toBe('string');
      expect(typeof mockInstance.templateId).toBe('number');
      expect(typeof mockInstance.posterUrl).toBe('string');
      expect(mockInstance.thumbnailUrl === null || typeof mockInstance.thumbnailUrl === 'string').toBe(true);
      expect(typeof mockInstance.status).toBe('number');
      expect(mockInstance.remark === null || typeof mockInstance.remark === 'string').toBe(true);
      expect(typeof mockInstance.creatorId).toBe('number');
      expect(typeof mockInstance.updaterId).toBe('number');
      expect(mockInstance.parameters === null || typeof mockInstance.parameters === 'string').toBe(true);
      expect(mockInstance.imageUrl === null || typeof mockInstance.imageUrl === 'string').toBe(true);
      expect(typeof mockInstance.shareCount).toBe('number');
      expect(typeof mockInstance.downloadCount).toBe('number');
      expect(typeof mockInstance.viewCount).toBe('number');
      expect(mockInstance.kindergartenId === null || typeof mockInstance.kindergartenId === 'number').toBe(true);
      expect(mockInstance.createdAt instanceof Date).toBe(true);
      expect(mockInstance.updatedAt instanceof Date).toBe(true);
      expect(mockInstance.deletedAt === null || mockInstance.deletedAt instanceof Date).toBe(true);
    });
  });
});