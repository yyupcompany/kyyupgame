/**
 * 模型测试辅助工具
 * 提供统一的模型测试mock和工具函数
 */

import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';

/**
 * 创建测试用的Sequelize实例
 * 使用SQLite内存数据库，避免真实数据库连接
 */
export function createTestSequelize(): Sequelize {
  const sequelize = new Sequelize('sqlite::memory:', {
    logging: false,
    define: {
      timestamps: true,
      underscored: false
    }
  });

  return sequelize;
}

/**
 * 创建Mock Sequelize实例
 * 用于不需要真实数据库的测试
 */
export function createMockSequelize(): Sequelize {
  const mockSequelize = {
    define: jest.fn().mockReturnValue({
      hasMany: jest.fn(),
      belongsTo: jest.fn(),
      belongsToMany: jest.fn(),
      hasOne: jest.fn(),
      sync: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      findByPk: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue([1]),
      destroy: jest.fn().mockResolvedValue(1),
      count: jest.fn().mockResolvedValue(0),
      bulkCreate: jest.fn().mockResolvedValue([])
    }),
    authenticate: jest.fn().mockResolvedValue(undefined),
    sync: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    transaction: jest.fn().mockImplementation(async (callback) => {
      const t = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      return callback(t);
    }),
    query: jest.fn().mockResolvedValue([[], {}]),
    getQueryInterface: jest.fn().mockReturnValue({
      showAllTables: jest.fn().mockResolvedValue([]),
      bulkDelete: jest.fn().mockResolvedValue(undefined)
    })
  } as unknown as Sequelize;

  return mockSequelize;
}

/**
 * 初始化模型用于测试
 * 使用真实的Sequelize实例，但不连接真实数据库
 */
export async function initModelForTest<T extends Model>(
  ModelClass: ModelStatic<T>,
  sequelize?: Sequelize
): Promise<Sequelize> {
  const testSequelize = sequelize || createTestSequelize();
  
  try {
    // 调用模型的initModel方法
    if (typeof (ModelClass as any).initModel === 'function') {
      (ModelClass as any).initModel(testSequelize);
    } else {
      // 如果没有initModel方法，尝试直接初始化
      console.warn(`Model ${ModelClass.name} does not have initModel method`);
    }
    
    // 同步模型到数据库
    await ModelClass.sync({ force: true });
    
    return testSequelize;
  } catch (error) {
    console.error(`Failed to initialize model ${ModelClass.name}:`, error);
    throw error;
  }
}

/**
 * 清理测试数据库
 */
export async function cleanupTestDatabase(sequelize: Sequelize): Promise<void> {
  try {
    // 删除所有表
    await sequelize.drop();
    // 关闭连接
    await sequelize.close();
  } catch (error) {
    console.error('Failed to cleanup test database:', error);
  }
}

/**
 * 创建模型实例的Mock
 */
export function createModelInstanceMock<T extends Model>(
  attributes: Partial<T> = {}
): T {
  const instance = {
    ...attributes,
    save: jest.fn().mockResolvedValue(attributes),
    update: jest.fn().mockResolvedValue(attributes),
    destroy: jest.fn().mockResolvedValue(undefined),
    reload: jest.fn().mockResolvedValue(attributes),
    toJSON: jest.fn().mockReturnValue(attributes),
    get: jest.fn((key?: string) => {
      if (key) {
        return (attributes as any)[key];
      }
      return attributes;
    }),
    set: jest.fn((key: string, value: any) => {
      (attributes as any)[key] = value;
    }),
    setDataValue: jest.fn((key: string, value: any) => {
      (attributes as any)[key] = value;
    }),
    getDataValue: jest.fn((key: string) => {
      return (attributes as any)[key];
    }),
    changed: jest.fn().mockReturnValue(false),
    previous: jest.fn().mockReturnValue(undefined),
    isNewRecord: false,
    createdAt: new Date(),
    updatedAt: new Date()
  } as unknown as T;

  return instance;
}

/**
 * 创建模型类的Mock
 */
export function createModelClassMock<T extends Model>(
  ModelClass: ModelStatic<T>
): ModelStatic<T> {
  const mockModel = {
    ...ModelClass,
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    findByPk: jest.fn().mockResolvedValue(null),
    findOrCreate: jest.fn().mockResolvedValue([null, false]),
    create: jest.fn().mockImplementation((attributes) => 
      Promise.resolve(createModelInstanceMock(attributes))
    ),
    update: jest.fn().mockResolvedValue([1]),
    destroy: jest.fn().mockResolvedValue(1),
    count: jest.fn().mockResolvedValue(0),
    bulkCreate: jest.fn().mockResolvedValue([]),
    sync: jest.fn().mockResolvedValue(undefined),
    drop: jest.fn().mockResolvedValue(undefined),
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    belongsToMany: jest.fn(),
    hasOne: jest.fn()
  } as unknown as ModelStatic<T>;

  return mockModel;
}

/**
 * 验证模型定义
 */
export function validateModelDefinition(
  ModelClass: ModelStatic<any>,
  expectedAttributes: string[]
): boolean {
  const actualAttributes = Object.keys(ModelClass.rawAttributes || {});
  
  for (const attr of expectedAttributes) {
    if (!actualAttributes.includes(attr)) {
      console.error(`Missing attribute: ${attr}`);
      return false;
    }
  }
  
  return true;
}

/**
 * 创建测试数据
 */
export function createTestData<T>(
  count: number,
  factory: (index: number) => T
): T[] {
  return Array.from({ length: count }, (_, i) => factory(i));
}

/**
 * 等待异步操作
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 模型测试套件配置
 */
export interface ModelTestConfig {
  useRealDatabase?: boolean;
  logging?: boolean;
  sync?: boolean;
}

/**
 * 设置模型测试环境
 */
export async function setupModelTest(
  config: ModelTestConfig = {}
): Promise<Sequelize> {
  const {
    useRealDatabase = false,
    logging = false,
    sync = true
  } = config;

  let sequelize: Sequelize;

  if (useRealDatabase) {
    // 使用真实的SQLite内存数据库
    sequelize = new Sequelize('sqlite::memory:', {
      logging: logging ? console.log : false,
      define: {
        timestamps: true,
        underscored: false
      }
    });

    // 测试连接
    await sequelize.authenticate();

    if (sync) {
      // 同步所有模型
      await sequelize.sync({ force: true });
    }
  } else {
    // 使用Mock
    sequelize = createMockSequelize();
  }

  return sequelize;
}

/**
 * 清理模型测试环境
 */
export async function teardownModelTest(sequelize: Sequelize): Promise<void> {
  try {
    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  } catch (error) {
    console.error('Failed to teardown model test:', error);
  }
}

/**
 * 模型测试断言辅助函数
 */
export const modelAssertions = {
  /**
   * 断言模型有指定的属性
   */
  hasAttribute(ModelClass: ModelStatic<any>, attributeName: string): boolean {
    return attributeName in (ModelClass.rawAttributes || {});
  },

  /**
   * 断言模型有指定的关联
   */
  hasAssociation(ModelClass: ModelStatic<any>, associationName: string): boolean {
    return associationName in (ModelClass.associations || {});
  },

  /**
   * 断言属性有指定的类型
   */
  attributeHasType(
    ModelClass: ModelStatic<any>,
    attributeName: string,
    expectedType: any
  ): boolean {
    const attribute = (ModelClass.rawAttributes || {})[attributeName];
    if (!attribute) return false;
    return attribute.type === expectedType || attribute.type.constructor === expectedType.constructor;
  },

  /**
   * 断言属性是必填的
   */
  attributeIsRequired(ModelClass: ModelStatic<any>, attributeName: string): boolean {
    const attribute = (ModelClass.rawAttributes || {})[attributeName];
    if (!attribute) return false;
    return attribute.allowNull === false;
  },

  /**
   * 断言属性是唯一的
   */
  attributeIsUnique(ModelClass: ModelStatic<any>, attributeName: string): boolean {
    const attribute = (ModelClass.rawAttributes || {})[attributeName];
    if (!attribute) return false;
    return attribute.unique === true;
  }
};

export default {
  createTestSequelize,
  createMockSequelize,
  initModelForTest,
  cleanupTestDatabase,
  createModelInstanceMock,
  createModelClassMock,
  validateModelDefinition,
  createTestData,
  waitFor,
  setupModelTest,
  teardownModelTest,
  modelAssertions
};

