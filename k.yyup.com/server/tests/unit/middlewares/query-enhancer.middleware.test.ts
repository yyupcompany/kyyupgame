import { jest } from '@jest/globals';
import { vi } from 'vitest'
import { Request, Response, NextFunction } from 'express';

// Mock Express types
const mockRequest = {
  params: {},
  query: {},
  body: {},
  headers: {},
  user: null,
  method: 'GET',
  url: '/api/users',
  path: '/api/users'
} as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis(),
  locals: {}
} as unknown as Response;

const mockNext = jest.fn() as NextFunction;

// Mock Sequelize operators
const mockOp = {
  and: Symbol.for('and'),
  or: Symbol.for('or'),
  gt: Symbol.for('gt'),
  gte: Symbol.for('gte'),
  lt: Symbol.for('lt'),
  lte: Symbol.for('lte'),
  ne: Symbol.for('ne'),
  eq: Symbol.for('eq'),
  like: Symbol.for('like'),
  iLike: Symbol.for('iLike'),
  in: Symbol.for('in'),
  notIn: Symbol.for('notIn'),
  between: Symbol.for('between'),
  notBetween: Symbol.for('notBetween'),
  is: Symbol.for('is'),
  not: Symbol.for('not')
};

// Mock logger
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock imports
jest.unstable_mockModule('sequelize', () => ({
  Op: mockOp
}));

jest.unstable_mockModule('../../../../../src/utils/logger', () => ({
  default: mockLogger
}));


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

describe('Query Enhancer Middleware', () => {
  let queryEnhancer: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/middlewares/query-enhancer.middleware');
    queryEnhancer = imported.default || imported.queryEnhancer || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock objects
    mockRequest.params = {};
    mockRequest.query = {};
    mockRequest.body = {};
    mockRequest.headers = {};
    mockRequest.user = null;
    mockResponse.locals = {};
  });

  describe('基础功能', () => {
    it('应该是一个函数', () => {
      expect(typeof queryEnhancer).toBe('function');
    });

    it('应该返回中间件函数', () => {
      const middleware = queryEnhancer();
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    it('应该处理空查询参数', async () => {
      const middleware = queryEnhancer();
      
      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions).toBeDefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('分页处理', () => {
    it('应该解析分页参数', async () => {
      const middleware = queryEnhancer();
      
      mockRequest.query = {
        page: '2',
        pageSize: '20'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions).toEqual(
        expect.objectContaining({
          limit: 20,
          offset: 20,
          pagination: {
            page: 2,
            pageSize: 20
          }
        })
      );
    });

    it('应该使用默认分页参数', async () => {
      const middleware = queryEnhancer({
        defaultPageSize: 10,
        maxPageSize: 100
      });
      
      mockRequest.query = {};

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions).toEqual(
        expect.objectContaining({
          limit: 10,
          offset: 0,
          pagination: {
            page: 1,
            pageSize: 10
          }
        })
      );
    });

    it('应该限制最大页面大小', async () => {
      const middleware = queryEnhancer({
        maxPageSize: 50
      });
      
      mockRequest.query = {
        pageSize: '100'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.limit).toBe(50);
      expect(mockResponse.locals.queryOptions.pagination.pageSize).toBe(50);
    });

    it('应该处理无效的分页参数', async () => {
      const middleware = queryEnhancer();
      
      mockRequest.query = {
        page: 'invalid',
        pageSize: '-10'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions).toEqual(
        expect.objectContaining({
          limit: 20, // 默认值
          offset: 0,
          pagination: {
            page: 1,
            pageSize: 20
          }
        })
      );
    });
  });

  describe('排序处理', () => {
    it('应该解析排序参数', async () => {
      const middleware = queryEnhancer();
      
      mockRequest.query = {
        sortBy: 'name',
        sortOrder: 'asc'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.order).toEqual([['name', 'ASC']]);
    });

    it('应该处理多字段排序', async () => {
      const middleware = queryEnhancer();
      
      mockRequest.query = {
        sortBy: 'name,createdAt',
        sortOrder: 'asc,desc'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.order).toEqual([
        ['name', 'ASC'],
        ['createdAt', 'DESC']
      ]);
    });

    it('应该使用默认排序', async () => {
      const middleware = queryEnhancer({
        defaultSort: [['createdAt', 'DESC']]
      });
      
      mockRequest.query = {};

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.order).toEqual([['createdAt', 'DESC']]);
    });

    it('应该验证允许的排序字段', async () => {
      const middleware = queryEnhancer({
        allowedSortFields: ['name', 'email', 'createdAt']
      });
      
      mockRequest.query = {
        sortBy: 'password', // 不允许的字段
        sortOrder: 'asc'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.order).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid sort field'),
        expect.objectContaining({
          field: 'password',
          allowedFields: ['name', 'email', 'createdAt']
        })
      );
    });

    it('应该处理关联表排序', async () => {
      const middleware = queryEnhancer();
      
      mockRequest.query = {
        sortBy: 'profile.firstName',
        sortOrder: 'asc'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.order).toEqual([
        [{ model: 'profile' }, 'firstName', 'ASC']
      ]);
    });
  });

  describe('筛选处理', () => {
    it('应该解析基础筛选条件', async () => {
      const middleware = queryEnhancer({
        filterFields: ['status', 'role', 'active']
      });
      
      mockRequest.query = {
        status: 'active',
        role: 'admin' as any,
        active: 'true'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.where).toEqual({
        status: 'active',
        role: 'admin' as any,
        active: true
      });
    });

    it('应该处理数组筛选', async () => {
      const middleware = queryEnhancer({
        filterFields: ['status', 'role']
      });
      
      mockRequest.query = {
        status: 'active,pending',
        role: 'admin'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.where).toEqual({
        status: { [mockOp.in]: ['active', 'pending'] },
        role: 'admin'
      });
    });

    it('应该处理范围筛选', async () => {
      const middleware = queryEnhancer({
        filterFields: ['age', 'salary', 'createdAt']
      });
      
      mockRequest.query = {
        'age[gte]': '18',
        'age[lt]': '65',
        'salary[between]': '30000,80000',
        'createdAt[gte]': '2024-01-01'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.where).toEqual({
        age: {
          [mockOp.gte]: 18,
          [mockOp.lt]: 65
        },
        salary: {
          [mockOp.between]: [30000, 80000]
        },
        createdAt: {
          [mockOp.gte]: new Date('2024-01-01')
        }
      });
    });

    it('应该处理模糊搜索', async () => {
      const middleware = queryEnhancer({
        searchFields: ['name', 'email', 'description']
      });
      
      mockRequest.query = {
        search: 'john'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.where).toEqual({
        [mockOp.or]: [
          { name: { [mockOp.iLike]: '%john%' } },
          { email: { [mockOp.iLike]: '%john%' } },
          { description: { [mockOp.iLike]: '%john%' } }
        ]
      });
    });

    it('应该处理复杂的搜索条件', async () => {
      const middleware = queryEnhancer({
        searchFields: ['name', 'email'],
        filterFields: ['status', 'role']
      });
      
      mockRequest.query = {
        search: 'admin',
        status: 'active',
        role: 'admin,manager'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.where).toEqual({
        [mockOp.and]: [
          {
            [mockOp.or]: [
              { name: { [mockOp.iLike]: '%admin%' } },
              { email: { [mockOp.iLike]: '%admin%' } }
            ]
          },
          {
            status: 'active',
            role: { [mockOp.in]: ['admin', 'manager'] }
          }
        ]
      });
    });

    it('应该处理NULL值筛选', async () => {
      const middleware = queryEnhancer({
        filterFields: ['deletedAt', 'parentId']
      });
      
      mockRequest.query = {
        'deletedAt[is]': 'null',
        'parentId[not]': 'null'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.where).toEqual({
        deletedAt: { [mockOp.is]: null },
        parentId: { [mockOp.not]: null }
      });
    });
  });

  describe('关联查询处理', () => {
    it('应该解析include参数', async () => {
      const middleware = queryEnhancer({
        allowedIncludes: ['profile', 'roles', 'posts']
      });
      
      mockRequest.query = {
        include: 'profile,roles'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.include).toEqual(['profile', 'roles']);
    });

    it('应该处理嵌套关联', async () => {
      const middleware = queryEnhancer({
        allowedIncludes: ['profile', 'posts.comments', 'roles.permissions']
      });
      
      mockRequest.query = {
        include: 'profile,posts.comments'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.include).toEqual([
        'profile',
        {
          association: 'posts',
          include: ['comments']
        }
      ]);
    });

    it('应该验证允许的关联', async () => {
      const middleware = queryEnhancer({
        allowedIncludes: ['profile', 'roles']
      });
      
      mockRequest.query = {
        include: 'profile,sensitive_data'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.include).toEqual(['profile']);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid include'),
        expect.objectContaining({
          include: 'sensitive_data'
        })
      );
    });
  });

  describe('字段选择处理', () => {
    it('应该解析fields参数', async () => {
      const middleware = queryEnhancer();
      
      mockRequest.query = {
        fields: 'id,name,email,createdAt'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.attributes).toEqual(['id', 'name', 'email', 'createdAt']);
    });

    it('应该处理字段排除', async () => {
      const middleware = queryEnhancer();
      
      mockRequest.query = {
        exclude: 'password,secretKey'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.attributes).toEqual({
        exclude: ['password', 'secretKey']
      });
    });

    it('应该验证允许的字段', async () => {
      const middleware = queryEnhancer({
        allowedFields: ['id', 'name', 'email', 'createdAt']
      });
      
      mockRequest.query = {
        fields: 'id,name,password'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.attributes).toEqual(['id', 'name']);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid field'),
        expect.objectContaining({
          field: 'password'
        })
      );
    });
  });

  describe('聚合查询处理', () => {
    it('应该处理分组查询', async () => {
      const middleware = queryEnhancer({
        allowedGroupFields: ['status', 'role', 'department']
      });
      
      mockRequest.query = {
        groupBy: 'status,role'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.group).toEqual(['status', 'role']);
    });

    it('应该处理聚合函数', async () => {
      const middleware = queryEnhancer({
        allowedAggregates: ['count', 'sum', 'avg', 'max', 'min']
      });
      
      mockRequest.query = {
        aggregate: 'count(*) as total,avg(salary) as avgSalary'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.attributes).toContain([
        expect.any(Object), // Sequelize function
        'total'
      ]);
    });

    it('应该处理HAVING条件', async () => {
      const middleware = queryEnhancer();
      
      mockRequest.query = {
        groupBy: 'department',
        'having[count]': '5'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.having).toBeDefined();
    });
  });

  describe('性能优化', () => {
    it('应该处理查询缓存', async () => {
      const middleware = queryEnhancer({
        enableCache: true,
        cacheTimeout: 300
      });
      
      mockRequest.query = {
        cache: 'true'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.cache).toBe(true);
      expect(mockResponse.locals.queryOptions.cacheTimeout).toBe(300);
    });

    it('应该处理查询优化提示', async () => {
      const middleware = queryEnhancer({
        enableOptimization: true
      });
      
      mockRequest.query = {
        optimize: 'true'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.benchmark).toBe(true);
      expect(mockResponse.locals.queryOptions.logging).toBe(true);
    });

    it('应该限制复杂查询', async () => {
      const middleware = queryEnhancer({
        maxComplexity: 10
      });
      
      // 模拟复杂查询
      mockRequest.query = {
        include: 'profile,roles,posts,comments',
        search: 'complex search term',
        sortBy: 'name,email,createdAt',
        'age[between]': '18,65',
        'salary[gte]': '50000'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Query complexity limit exceeded'),
        expect.objectContaining({
          complexity: expect.any(Number),
          maxComplexity: 10
        })
      );
    });
  });

  describe('安全性检查', () => {
    it('应该防止SQL注入', async () => {
      const middleware = queryEnhancer({
        filterFields: ['name', 'email']
      });
      
      mockRequest.query = {
        name: "'; DROP TABLE users; --",
        email: 'user@example.com'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.where.name).toBe("'; DROP TABLE users; --");
      // Sequelize会自动转义，这里只是确保不会被拒绝
    });

    it('应该限制查询深度', async () => {
      const middleware = queryEnhancer({
        maxIncludeDepth: 2
      });
      
      mockRequest.query = {
        include: 'profile.user.roles.permissions.resources'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Include depth limit exceeded')
      );
    });

    it('应该验证查询权限', async () => {
      const middleware = queryEnhancer({
        permissionCheck: (field: string, user: any) => {
          return user?.role === 'admin' || !field.includes('sensitive');
        }
      });
      
      mockRequest.user = { id: 1, role: 'user' };
      mockRequest.query = {
        fields: 'id,name,sensitiveData'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.attributes).toEqual(['id', 'name']);
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的查询参数', async () => {
      const middleware = queryEnhancer();
      
      mockRequest.query = {
        page: 'invalid',
        pageSize: 'not-a-number',
        sortOrder: 'invalid-order'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid query parameter')
      );
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('应该处理查询构建错误', async () => {
      const middleware = queryEnhancer({
        customProcessor: () => {
          throw new Error('Query processing failed');
        }
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Query enhancement failed'),
        expect.objectContaining({
          error: 'Query processing failed'
        })
      );
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('自定义处理器', () => {
    it('应该支持自定义查询处理器', async () => {
      const customProcessor = jest.fn((queryOptions, req) => {
        queryOptions.customField = 'custom value';
        return queryOptions;
      });

      const middleware = queryEnhancer({
        customProcessor
      });

      await middleware(mockRequest, mockResponse, mockNext);

      expect(customProcessor).toHaveBeenCalledWith(
        expect.any(Object),
        mockRequest
      );
      expect(mockResponse.locals.queryOptions.customField).toBe('custom value');
    });

    it('应该支持条件处理器', async () => {
      const conditionalProcessor = jest.fn((field, value, operator) => {
        if (field === 'special') {
          return { customCondition: value };
        }
        return null;
      });

      const middleware = queryEnhancer({
        conditionalProcessor,
        filterFields: ['special', 'normal']
      });
      
      mockRequest.query = {
        special: 'value',
        normal: 'value'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(conditionalProcessor).toHaveBeenCalledWith('special', 'value', 'eq');
      expect(mockResponse.locals.queryOptions.where).toEqual({
        customCondition: 'value',
        normal: 'value'
      });
    });
  });

  describe('集成测试', () => {
    it('应该处理完整的查询场景', async () => {
      const middleware = queryEnhancer({
        filterFields: ['status', 'role', 'department'],
        searchFields: ['name', 'email'],
        allowedSortFields: ['name', 'email', 'createdAt'],
        allowedIncludes: ['profile', 'roles'],
        defaultPageSize: 20,
        maxPageSize: 100
      });
      
      mockRequest.query = {
        page: '2',
        pageSize: '25',
        search: 'john',
        status: 'active',
        role: 'admin,manager',
        sortBy: 'name,createdAt',
        sortOrder: 'asc,desc',
        include: 'profile,roles',
        fields: 'id,name,email,status'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      const queryOptions = mockResponse.locals.queryOptions;

      expect(queryOptions).toEqual({
        limit: 25,
        offset: 25,
        pagination: { page: 2, pageSize: 25 },
        order: [['name', 'ASC'], ['createdAt', 'DESC']],
        where: {
          [mockOp.and]: [
            {
              [mockOp.or]: [
                { name: { [mockOp.iLike]: '%john%' } },
                { email: { [mockOp.iLike]: '%john%' } }
              ]
            },
            {
              status: 'active',
              role: { [mockOp.in]: ['admin', 'manager'] }
            }
          ]
        },
        include: ['profile', 'roles'],
        attributes: ['id', 'name', 'email', 'status']
      });
    });

    it('应该与权限系统集成', async () => {
      const middleware = queryEnhancer({
        permissionCheck: (field: string, user: any) => {
          const adminFields = ['salary', 'ssn', 'internalNotes'];
          return user?.role === 'admin' || !adminFields.includes(field);
        }
      });
      
      mockRequest.user = { id: 1, role: 'user' };
      mockRequest.query = {
        fields: 'id,name,email,salary,ssn'
      };

      await middleware(mockRequest, mockResponse, mockNext);

      expect(mockResponse.locals.queryOptions.attributes).toEqual(['id', 'name', 'email']);
    });
  });
});
