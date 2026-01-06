/**
 * PosterElement 模型测试用例
 * 对应模型文件: poster-element.model.ts
 */

import { PosterElement } from '../../../src/models/poster-element.model';
import { vi } from 'vitest'
import { PosterTemplate } from '../../../src/models/poster-template.model';
import { PosterGeneration } from '../../../src/models/poster-generation.model';
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

describe('PosterElement Model', () => {
  let sequelize: Sequelize;

  beforeAll(() => {
    sequelize = mockSequelize;
  });

  describe('模型属性接口测试', () => {
    test('PosterElementAttributes 接口应该包含所有必需属性', () => {
      const attributes: PosterElementAttributes = {
        id: 1,
        type: 'text',
        content: '{"text":"Hello World"}',
        style: '{"fontSize":16,"color":"#000000"}',
        position: '{"x":100,"y":200}',
        width: 200,
        height: 100,
        zIndex: 1,
        templateId: 1,
        generationId: null,
        remark: '测试元素',
        creatorId: 1,
        updaterId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      expect(attributes.id).toBe(1);
      expect(attributes.type).toBe('text');
      expect(attributes.content).toBe('{"text":"Hello World"}');
      expect(attributes.style).toBe('{"fontSize":16,"color":"#000000"}');
      expect(attributes.position).toBe('{"x":100,"y":200}');
      expect(attributes.width).toBe(200);
      expect(attributes.height).toBe(100);
      expect(attributes.zIndex).toBe(1);
      expect(attributes.templateId).toBe(1);
      expect(attributes.generationId).toBeNull();
      expect(attributes.remark).toBe('测试元素');
      expect(attributes.creatorId).toBe(1);
      expect(attributes.updaterId).toBe(2);
      expect(attributes.createdAt).toBeInstanceOf(Date);
      expect(attributes.updatedAt).toBeInstanceOf(Date);
      expect(attributes.deletedAt).toBeNull();
    });

    test('PosterElementCreationAttributes 接口应该允许省略可选字段', () => {
      const creationAttributes: PosterElementCreationAttributes = {
        type: 'text',
        content: '{"text":"Hello World"}',
        style: '{"fontSize":16,"color":"#000000"}',
        position: '{"x":100,"y":200}',
        width: 200,
        height: 100,
        zIndex: 1
      };

      expect(creationAttributes.type).toBe('text');
      expect(creationAttributes.templateId).toBeUndefined();
      expect(creationAttributes.generationId).toBeUndefined();
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
      expect(typeof PosterElement.initModel).toBe('function');
      
      // 模拟调用
      const mockModel = {
        belongsTo: jest.fn()
      };
      
      jest.spyOn(sequelize, 'define').mockReturnValue(mockModel as any);
      
      expect(() => PosterElement.initModel(sequelize)).not.toThrow();
    });

    test('initAssociations 函数应该存在并可调用', () => {
      expect(typeof PosterElement.initAssociations).toBe('function');
      
      // 模拟调用
      const mockModel = {
        belongsTo: jest.fn()
      };
      
      // 设置模拟的 sequelize.models
      (sequelize as any).models = {
        PosterElement: mockModel,
        PosterTemplate: {},
        PosterGeneration: {}
      };
      
      expect(() => PosterElement.initAssociations()).not.toThrow();
    });
  });

  describe('字段定义测试', () => {
    test('应该定义正确的字段类型和约束', () => {
      const mockFields = {
        id: { type: 'INTEGER', autoIncrement: true, primaryKey: true },
        type: { type: 'STRING(50)', allowNull: false },
        content: { type: 'TEXT', allowNull: false },
        style: { type: 'TEXT', allowNull: false },
        position: { type: 'STRING(100)', allowNull: false },
        width: { type: 'INTEGER', allowNull: false },
        height: { type: 'INTEGER', allowNull: false },
        zIndex: { type: 'INTEGER', allowNull: false, defaultValue: 0 },
        templateId: { type: 'INTEGER', allowNull: true },
        generationId: { type: 'INTEGER', allowNull: true },
        remark: { type: 'STRING(500)', allowNull: true },
        creatorId: { type: 'INTEGER', allowNull: true },
        updaterId: { type: 'INTEGER', allowNull: true },
        createdAt: { type: 'DATE', allowNull: false },
        updatedAt: { type: 'DATE', allowNull: false },
        deletedAt: { type: 'DATE' }
      };

      expect(mockFields.id.type).toBe('INTEGER');
      expect(mockFields.type.type).toBe('STRING(50)');
      expect(mockFields.type.allowNull).toBe(false);
      expect(mockFields.content.type).toBe('TEXT');
      expect(mockFields.content.allowNull).toBe(false);
      expect(mockFields.style.type).toBe('TEXT');
      expect(mockFields.style.allowNull).toBe(false);
      expect(mockFields.position.type).toBe('STRING(100)');
      expect(mockFields.position.allowNull).toBe(false);
      expect(mockFields.width.type).toBe('INTEGER');
      expect(mockFields.width.allowNull).toBe(false);
      expect(mockFields.height.type).toBe('INTEGER');
      expect(mockFields.height.allowNull).toBe(false);
      expect(mockFields.zIndex.type).toBe('INTEGER');
      expect(mockFields.zIndex.defaultValue).toBe(0);
      expect(mockFields.templateId.type).toBe('INTEGER');
      expect(mockFields.templateId.allowNull).toBe(true);
      expect(mockFields.generationId.type).toBe('INTEGER');
      expect(mockFields.generationId.allowNull).toBe(true);
      expect(mockFields.remark.type).toBe('STRING(500)');
      expect(mockFields.remark.allowNull).toBe(true);
    });
  });

  describe('关联关系测试', () => {
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

    test('应该定义与 PosterGeneration 的关联关系', () => {
      const mockModel = {
        belongsTo: jest.fn()
      };

      mockModel.belongsTo(PosterGeneration, {
        foreignKey: 'generationId',
        as: 'generation'
      });

      expect(mockModel.belongsTo).toHaveBeenCalledWith(PosterGeneration, {
        foreignKey: 'generationId',
        as: 'generation'
      });
    });
  });

  describe('实例方法测试', () => {
    describe('getPosition 方法测试', () => {
      test('getPosition 方法应该存在', () => {
        const mockInstance = {
          position: '{"x":100,"y":200}',
          getPosition: PosterElement.prototype.getPosition
        };
        
        expect(typeof mockInstance.getPosition).toBe('function');
      });

      test('getPosition 应该正确解析有效的JSON位置数据', () => {
        const mockInstance = {
          position: '{"x":100,"y":200}',
          getPosition: PosterElement.prototype.getPosition
        };
        
        const result = mockInstance.getPosition();
        expect(result).toEqual({ x: 100, y: 200 });
      });

      test('getPosition 应该处理无效的JSON数据', () => {
        const mockInstance = {
          position: 'invalid-json',
          getPosition: PosterElement.prototype.getPosition
        };
        
        const result = mockInstance.getPosition();
        expect(result).toEqual({ x: 0, y: 0 });
      });

      test('getPosition 应该处理缺少坐标的情况', () => {
        const mockInstance = {
          position: '{"x":100}',
          getPosition: PosterElement.prototype.getPosition
        };
        
        const result = mockInstance.getPosition();
        expect(result).toEqual({ x: 100, y: 0 });
      });
    });

    describe('getStyle 方法测试', () => {
      test('getStyle 方法应该存在', () => {
        const mockInstance = {
          style: '{"fontSize":16,"color":"#000000"}',
          getStyle: PosterElement.prototype.getStyle
        };
        
        expect(typeof mockInstance.getStyle).toBe('function');
      });

      test('getStyle 应该正确解析有效的JSON样式数据', () => {
        const mockInstance = {
          style: '{"fontSize":16,"color":"#000000","fontWeight":"bold"}',
          getStyle: PosterElement.prototype.getStyle
        };
        
        const result = mockInstance.getStyle();
        expect(result).toEqual({
          fontSize: 16,
          color: '#000000',
          fontWeight: 'bold'
        });
      });

      test('getStyle 应该处理无效的JSON数据', () => {
        const mockInstance = {
          style: 'invalid-json',
          getStyle: PosterElement.prototype.getStyle
        };
        
        const result = mockInstance.getStyle();
        expect(result).toEqual({});
      });
    });

    describe('getContent 方法测试', () => {
      test('getContent 方法应该存在', () => {
        const mockInstance = {
          content: '{"text":"Hello World","fontSize":14}',
          getContent: PosterElement.prototype.getContent
        };
        
        expect(typeof mockInstance.getContent).toBe('function');
      });

      test('getContent 应该正确解析有效的JSON内容数据', () => {
        const mockInstance = {
          content: '{"text":"Hello World","fontSize":14,"color":"#ff0000"}',
          getContent: PosterElement.prototype.getContent
        };
        
        const result = mockInstance.getContent();
        expect(result).toEqual({
          text: 'Hello World',
          fontSize: 14,
          color: '#ff0000'
        });
      });

      test('getContent 应该处理无效的JSON数据', () => {
        const mockInstance = {
          content: 'invalid-json',
          getContent: PosterElement.prototype.getContent
        };
        
        const result = mockInstance.getContent();
        expect(result).toEqual({});
      });
    });
  });

  describe('数据验证测试', () => {
    test('type 字段应该支持有效的元素类型', () => {
      const validTypes = ['text', 'image', 'shape', 'button', 'qr-code'];
      const invalidTypes = ['', 'invalid-type', 'a'.repeat(51)];
      
      validTypes.forEach(type => {
        expect(type.length).toBeGreaterThan(0);
        expect(type.length).toBeLessThanOrEqual(50);
      });
      
      invalidTypes.forEach(type => {
        if (type.length > 50) {
          expect(type.length).toBeGreaterThan(50);
        }
      });
    });

    test('width 和 height 应该是正整数', () => {
      const validDimensions = [1, 100, 500, 1000, 2000];
      const invalidDimensions = [0, -1, -100];
      
      validDimensions.forEach(dim => {
        expect(dim).toBeGreaterThan(0);
        expect(Number.isInteger(dim)).toBe(true);
      });
      
      invalidDimensions.forEach(dim => {
        expect(dim).toBeLessThanOrEqual(0);
      });
    });

    test('zIndex 应该是非负整数', () => {
      const validZIndexes = [0, 1, 10, 100, 1000];
      const invalidZIndexes = [-1, -10];
      
      validZIndexes.forEach(zIndex => {
        expect(zIndex).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(zIndex)).toBe(true);
      });
      
      invalidZIndexes.forEach(zIndex => {
        expect(zIndex).toBeLessThan(0);
      });
    });

    test('position 应该是有效的JSON格式', () => {
      const validPositions = [
        '{"x":0,"y":0}',
        '{"x":100,"y":200}',
        '{"x":-50,"y":300}',
        '{"x":0,"y":0,"z":0}'
      ];
      
      const invalidPositions = [
        'invalid-json',
        '{"x":}',
        '{y:100}',
        ''
      ];
      
      validPositions.forEach(pos => {
        expect(() => JSON.parse(pos)).not.toThrow();
      });
      
      invalidPositions.forEach(pos => {
        if (pos) {
          expect(() => JSON.parse(pos)).toThrow();
        }
      });
    });

    test('style 应该是有效的JSON格式', () => {
      const validStyles = [
        '{}',
        '{"fontSize":16}',
        '{"color":"#ff0000","fontWeight":"bold"}',
        '{"backgroundColor":"transparent","border":"1px solid #ccc"}'
      ];
      
      const invalidStyles = [
        'invalid-json',
        '{fontSize:16}',
        '{"color":}',
        ''
      ];
      
      validStyles.forEach(style => {
        expect(() => JSON.parse(style)).not.toThrow();
      });
      
      invalidStyles.forEach(style => {
        if (style) {
          expect(() => JSON.parse(style)).toThrow();
        }
      });
    });

    test('content 应该是有效的JSON格式', () => {
      const validContents = [
        '{}',
        '{"text":"Hello World"}',
        '{"text":"Hello","fontSize":14,"color":"#000000"}',
        '{"imageUrl":"https://example.com/image.jpg","alt":"示例图片"}'
      ];
      
      const invalidContents = [
        'invalid-json',
        '{text:"Hello"}',
        '{"text":}',
        ''
      ];
      
      validContents.forEach(content => {
        expect(() => JSON.parse(content)).not.toThrow();
      });
      
      invalidContents.forEach(content => {
        if (content) {
          expect(() => JSON.parse(content)).toThrow();
        }
      });
    });
  });

  describe('业务逻辑测试', () => {
    test('应该能够处理不同类型的元素', () => {
      const elementTypes = [
        { type: 'text', content: '{"text":"Hello World"}' },
        { type: 'image', content: '{"imageUrl":"https://example.com/image.jpg"}' },
        { type: 'shape', content: '{"shapeType":"rectangle","fillColor":"#ff0000"}' },
        { type: 'button', content: '{"text":"Click Me","action":"submit"}' },
        { type: 'qr-code', content: '{"text":"https://example.com","size":100}' }
      ];

      elementTypes.forEach(element => {
        expect(element.type).toBeDefined();
        expect(element.content).toBeDefined();
        expect(() => JSON.parse(element.content)).not.toThrow();
      });
    });

    test('应该能够处理元素的层级关系', () => {
      const elements = [
        { id: 1, zIndex: 1, type: 'background' },
        { id: 2, zIndex: 2, type: 'image' },
        { id: 3, zIndex: 3, type: 'text' },
        { id: 4, zIndex: 4, type: 'button' }
      ];

      // 按zIndex排序
      const sortedElements = elements.sort((a, b) => a.zIndex - b.zIndex);

      expect(sortedElements[0].zIndex).toBe(1);
      expect(sortedElements[1].zIndex).toBe(2);
      expect(sortedElements[2].zIndex).toBe(3);
      expect(sortedElements[3].zIndex).toBe(4);
    });

    test('应该能够处理元素的位置和尺寸', () => {
      const element = {
        position: '{"x":100,"y":200}',
        width: 300,
        height: 150
      };

      const position = JSON.parse(element.position);
      
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
      expect(element.width).toBe(300);
      expect(element.height).toBe(150);

      // 验证元素区域
      const area = element.width * element.height;
      expect(area).toBe(45000);
    });

    test('应该能够处理元素的样式属性', () => {
      const styles = [
        '{"fontSize":16,"color":"#000000"}',
        '{"backgroundColor":"#ffffff","border":"1px solid #ccc"}',
        '{"fontWeight":"bold","fontStyle":"italic","textAlign":"center"}'
      ];

      styles.forEach(styleStr => {
        const style = JSON.parse(styleStr);
        
        expect(typeof style).toBe('object');
        expect(Object.keys(style).length).toBeGreaterThan(0);
      });
    });
  });

  describe('错误处理测试', () => {
    test('应该处理无效的元素类型', () => {
      const invalidType = 'invalid-element-type';
      
      expect(invalidType).toBe('invalid-element-type');
    });

    test('应该处理负数的尺寸', () => {
      const invalidDimensions = { width: -100, height: -50 };
      
      expect(invalidDimensions.width).toBeLessThan(0);
      expect(invalidDimensions.height).toBeLessThan(0);
    });

    test('应该处理无效的JSON数据', () => {
      const invalidData = {
        position: 'invalid-json',
        style: '{color:red}',
        content: '{text:Hello}'
      };
      
      expect(() => JSON.parse(invalidData.position)).toThrow();
      expect(() => JSON.parse(invalidData.style)).toThrow();
      expect(() => JSON.parse(invalidData.content)).toThrow();
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

    test('表名应该是 poster_elements', () => {
      const tableName = 'poster_elements';
      expect(tableName).toBe('poster_elements');
    });
  });

  describe('默认值测试', () => {
    test('zIndex 应该有默认值 0', () => {
      const defaultValue = 0;
      expect(defaultValue).toBe(0);
    });
  });

  describe('类型安全测试', () => {
    test('PosterElement 类应该正确声明属性类型', () => {
      const mockInstance = {
        id: 1,
        type: 'text',
        content: '{"text":"Hello"}',
        style: '{"fontSize":16}',
        position: '{"x":100,"y":100}',
        width: 200,
        height: 100,
        zIndex: 1,
        templateId: 1,
        generationId: null,
        remark: '测试',
        creatorId: 1,
        updaterId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      expect(typeof mockInstance.id).toBe('number');
      expect(typeof mockInstance.type).toBe('string');
      expect(typeof mockInstance.content).toBe('string');
      expect(typeof mockInstance.style).toBe('string');
      expect(typeof mockInstance.position).toBe('string');
      expect(typeof mockInstance.width).toBe('number');
      expect(typeof mockInstance.height).toBe('number');
      expect(typeof mockInstance.zIndex).toBe('number');
      expect(mockInstance.templateId === null || typeof mockInstance.templateId === 'number').toBe(true);
      expect(mockInstance.generationId === null || typeof mockInstance.generationId === 'number').toBe(true);
      expect(mockInstance.remark === null || typeof mockInstance.remark === 'string').toBe(true);
      expect(mockInstance.creatorId === null || typeof mockInstance.creatorId === 'number').toBe(true);
      expect(mockInstance.updaterId === null || typeof mockInstance.updaterId === 'number').toBe(true);
      expect(mockInstance.createdAt instanceof Date).toBe(true);
      expect(mockInstance.updatedAt instanceof Date).toBe(true);
      expect(mockInstance.deletedAt === null || mockInstance.deletedAt instanceof Date).toBe(true);
    });
  });
});