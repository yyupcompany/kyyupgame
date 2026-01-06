import { DataTypes, Sequelize, Op } from 'sequelize';

/**
 * Sequelize测试工具
 * 提供统一的Mock和测试辅助函数
 */

/**
 * 创建Mock Sequelize实例
 */
export function createMockSequelize(): Sequelize {
  return {
    define: jest.fn(),
    authenticate: jest.fn().mockResolvedValue(undefined),
    sync: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue([]),
    transaction: jest.fn().mockImplementation((callback) => {
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      return callback ? callback(mockTransaction) : mockTransaction;
    }),
    getDialect: jest.fn().mockReturnValue('mysql'),
    getDatabaseVersion: jest.fn().mockResolvedValue('8.0.0'),
    validate: jest.fn().mockResolvedValue(undefined)
  } as unknown as Sequelize;
}

/**
 * 创建Mock模型实例
 */
export function createMockModelInstance(data: any = {}) {
  return {
    ...data,
    save: jest.fn().mockResolvedValue(data),
    update: jest.fn().mockResolvedValue([1]),
    destroy: jest.fn().mockResolvedValue(1),
    reload: jest.fn().mockResolvedValue(data),
    toJSON: jest.fn().mockReturnValue(data),
    get: jest.fn((key?: string) => key ? data[key] : data),
    set: jest.fn(),
    changed: jest.fn().mockReturnValue(false),
    previous: jest.fn(),
    isNewRecord: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * 创建Mock模型类
 */
export function createMockModel(modelName: string) {
  const mockInstances: any[] = [];
  
  const MockModel = {
    name: modelName,
    tableName: modelName.toLowerCase(),
    
    // 静态方法
    init: jest.fn(),
    initModel: jest.fn(),
    findAll: jest.fn().mockResolvedValue(mockInstances),
    findOne: jest.fn().mockResolvedValue(null),
    findByPk: jest.fn().mockResolvedValue(null),
    findAndCountAll: jest.fn().mockResolvedValue({ rows: [], count: 0 }),
    create: jest.fn().mockImplementation((data) => {
      const instance = createMockModelInstance({ id: Date.now(), ...data });
      mockInstances.push(instance);
      return Promise.resolve(instance);
    }),
    bulkCreate: jest.fn().mockImplementation((dataArray) => {
      const instances = dataArray.map((data: any) => 
        createMockModelInstance({ id: Date.now() + Math.random(), ...data })
      );
      mockInstances.push(...instances);
      return Promise.resolve(instances);
    }),
    update: jest.fn().mockResolvedValue([1]),
    destroy: jest.fn().mockResolvedValue(1),
    count: jest.fn().mockResolvedValue(0),
    max: jest.fn().mockResolvedValue(null),
    min: jest.fn().mockResolvedValue(null),
    sum: jest.fn().mockResolvedValue(0),
    
    // 关联方法
    hasMany: jest.fn(),
    hasOne: jest.fn(),
    belongsTo: jest.fn(),
    belongsToMany: jest.fn(),
    
    // 钩子方法
    beforeCreate: jest.fn(),
    afterCreate: jest.fn(),
    beforeUpdate: jest.fn(),
    afterUpdate: jest.fn(),
    beforeDestroy: jest.fn(),
    afterDestroy: jest.fn(),
    
    // 验证方法
    validate: jest.fn(),
    
    // 实例方法
    build: jest.fn().mockImplementation((data) => createMockModelInstance(data)),
    
    // 获取mock实例数组（用于测试）
    _getMockInstances: () => mockInstances,
    _clearMockInstances: () => mockInstances.length = 0
  };
  
  return MockModel;
}

/**
 * 验证模型定义的测试辅助函数
 */
export function expectModelDefinition(
  mockInit: jest.Mock,
  expectedAttributes: Record<string, any>,
  expectedOptions?: any
) {
  expect(mockInit).toHaveBeenCalledWith(
    expect.objectContaining(expectedAttributes),
    expectedOptions ? expect.objectContaining(expectedOptions) : expect.any(Object)
  );
}

/**
 * 验证模型属性的测试辅助函数
 */
export function expectModelAttribute(
  mockInit: jest.Mock,
  attributeName: string,
  expectedConfig: any
) {
  const callArgs = mockInit.mock.calls[0];
  if (callArgs && callArgs[0]) {
    expect(callArgs[0][attributeName]).toEqual(expect.objectContaining(expectedConfig));
  } else {
    throw new Error(`Model init was not called or called with invalid arguments`);
  }
}

/**
 * 创建测试数据的辅助函数
 */
export const testDataFactory = {
  user: (overrides: any = {}) => ({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    realName: '测试用户',
    phone: '13800138000',
    role: 'user',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),
  
  role: (overrides: any = {}) => ({
    id: 1,
    name: 'user',
    displayName: '普通用户',
    description: '普通用户角色',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),
  
  student: (overrides: any = {}) => ({
    id: 1,
    name: '张三',
    gender: 'male',
    birthDate: '2018-01-01',
    enrollmentDate: '2023-09-01',
    status: 'active',
    classId: 1,
    parentId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),
  
  teacher: (overrides: any = {}) => ({
    id: 1,
    name: '李老师',
    gender: 'female',
    phone: '13800138001',
    email: 'teacher@example.com',
    subject: '语文',
    status: 'active',
    hireDate: '2020-09-01',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  })
};

/**
 * 数据库操作的Mock辅助函数
 */
export const dbMockHelpers = {
  /**
   * Mock成功的查询结果
   */
  mockSuccessQuery: (data: any) => {
    return jest.fn().mockResolvedValue(data);
  },
  
  /**
   * Mock失败的查询结果
   */
  mockFailedQuery: (error: Error) => {
    return jest.fn().mockRejectedValue(error);
  },
  
  /**
   * Mock分页查询结果
   */
  mockPaginatedQuery: (rows: any[], count: number) => {
    return jest.fn().mockResolvedValue({ rows, count });
  },
  
  /**
   * Mock事务操作
   */
  mockTransaction: (callback?: (t: any) => Promise<any>) => {
    const mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined)
    };
    
    if (callback) {
      return jest.fn().mockImplementation(() => callback(mockTransaction));
    }
    
    return jest.fn().mockResolvedValue(mockTransaction);
  }
};

/**
 * 导出常用的Sequelize类型和操作符
 */
export { DataTypes, Op };

/**
 * 导出默认配置
 */
export default {
  createMockSequelize,
  createMockModelInstance,
  createMockModel,
  expectModelDefinition,
  expectModelAttribute,
  testDataFactory,
  dbMockHelpers,
  DataTypes,
  Op
};
