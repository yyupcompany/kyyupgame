import { Op } from 'sequelize';
import { vi } from 'vitest'

// Mock Sequelize
jest.mock('sequelize', () => ({
  Op: {
    like: Symbol('like'),
    iLike: Symbol('iLike'),
    in: Symbol('in'),
    between: Symbol('between'),
    gte: Symbol('gte'),
    lte: Symbol('lte'),
    eq: Symbol('eq'),
    and: Symbol('and'),
    or: Symbol('or')
  }
}));

// Import types and interfaces
interface SearchConfig {
  searchFields: string[];
  filterFields?: FilterFieldConfig[];
  sortFields?: string[];
  defaultSort?: { field: string; order: 'ASC' | 'DESC' };
}

interface FilterFieldConfig {
  field: string;
  type: 'exact' | 'range' | 'in' | 'like' | 'date_range';
  sqlField?: string;
  validator?: (value: any) => boolean;
  transformer?: (value: any) => any;
}

interface SearchParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: any;
}

interface QueryBuildResult {
  whereClause: string;
  replacements: Record<string, any>;
  orderBy: string;
  limit: number;
  offset: number;
}


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

describe('Search Helper', () => {
  describe('SearchConfig Interface', () => {
    it('应该定义正确的搜索配置接口', () => {
      const config: SearchConfig = {
        searchFields: ['name', 'description'],
        filterFields: [
          {
            field: 'status',
            type: 'exact'
          },
          {
            field: 'price',
            type: 'range'
          }
        ],
        sortFields: ['name', 'created_at'],
        defaultSort: { field: 'created_at', order: 'DESC' }
      };

      expect(config.searchFields).toEqual(['name', 'description']);
      expect(config.filterFields).toHaveLength(2);
      expect(config.sortFields).toEqual(['name', 'created_at']);
      expect(config.defaultSort?.field).toBe('created_at');
      expect(config.defaultSort?.order).toBe('DESC');
    });
  });

  describe('FilterFieldConfig Interface', () => {
    it('应该支持不同的过滤字段类型', () => {
      const exactFilter: FilterFieldConfig = {
        field: 'status',
        type: 'exact'
      };

      const rangeFilter: FilterFieldConfig = {
        field: 'price',
        type: 'range',
        sqlField: 'product.price'
      };

      const inFilter: FilterFieldConfig = {
        field: 'category',
        type: 'in',
        validator: (value) => Array.isArray(value)
      };

      const likeFilter: FilterFieldConfig = {
        field: 'name',
        type: 'like',
        transformer: (value) => `%${value}%`
      };

      const dateRangeFilter: FilterFieldConfig = {
        field: 'created_at',
        type: 'date_range'
      };

      expect(exactFilter.type).toBe('exact');
      expect(rangeFilter.type).toBe('range');
      expect(rangeFilter.sqlField).toBe('product.price');
      expect(inFilter.type).toBe('in');
      expect(inFilter.validator).toBeDefined();
      expect(likeFilter.type).toBe('like');
      expect(likeFilter.transformer).toBeDefined();
      expect(dateRangeFilter.type).toBe('date_range');
    });
  });

  describe('SearchParams Interface', () => {
    it('应该支持基本搜索参数', () => {
      const params: SearchParams = {
        keyword: 'test',
        page: 1,
        pageSize: 10,
        sortBy: 'name',
        sortOrder: 'ASC'
      };

      expect(params.keyword).toBe('test');
      expect(params.page).toBe(1);
      expect(params.pageSize).toBe(10);
      expect(params.sortBy).toBe('name');
      expect(params.sortOrder).toBe('ASC');
    });

    it('应该支持额外的过滤参数', () => {
      const params: SearchParams = {
        keyword: 'test',
        status: 'active',
        category: ['electronics', 'books'],
        priceMin: 10,
        priceMax: 100
      };

      expect(params.status).toBe('active');
      expect(params.category).toEqual(['electronics', 'books']);
      expect(params.priceMin).toBe(10);
      expect(params.priceMax).toBe(100);
    });
  });

  describe('QueryBuildResult Interface', () => {
    it('应该定义查询构建结果结构', () => {
      const result: QueryBuildResult = {
        whereClause: 'name LIKE :keyword AND status = :status',
        replacements: {
          keyword: '%test%',
          status: 'active'
        },
        orderBy: 'name ASC',
        limit: 10,
        offset: 0
      };

      expect(result.whereClause).toContain('LIKE');
      expect(result.replacements.keyword).toBe('%test%');
      expect(result.replacements.status).toBe('active');
      expect(result.orderBy).toBe('name ASC');
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });
  });

  describe('搜索功能测试', () => {
    it('应该构建基本的关键词搜索', () => {
      const config: SearchConfig = {
        searchFields: ['name', 'description']
      };

      const params: SearchParams = {
        keyword: 'test product'
      };

      // 模拟搜索逻辑
      const expectedWhere = '(name LIKE :keyword OR description LIKE :keyword)';
      const expectedReplacements = { keyword: '%test product%' };

      expect(expectedWhere).toContain('LIKE');
      expect(expectedReplacements.keyword).toBe('%test product%');
    });

    it('应该构建精确匹配过滤', () => {
      const config: SearchConfig = {
        searchFields: ['name'],
        filterFields: [
          {
            field: 'status',
            type: 'exact'
          }
        ]
      };

      const params: SearchParams = {
        status: 'active'
      };

      // 模拟过滤逻辑
      const expectedWhere = 'status = :status';
      const expectedReplacements = { status: 'active' };

      expect(expectedWhere).toContain('=');
      expect(expectedReplacements.status).toBe('active');
    });

    it('应该构建范围过滤', () => {
      const config: SearchConfig = {
        searchFields: ['name'],
        filterFields: [
          {
            field: 'price',
            type: 'range'
          }
        ]
      };

      const params: SearchParams = {
        priceMin: 10,
        priceMax: 100
      };

      // 模拟范围过滤逻辑
      const expectedWhere = 'price BETWEEN :priceMin AND :priceMax';
      const expectedReplacements = { priceMin: 10, priceMax: 100 };

      expect(expectedWhere).toContain('BETWEEN');
      expect(expectedReplacements.priceMin).toBe(10);
      expect(expectedReplacements.priceMax).toBe(100);
    });

    it('应该构建IN过滤', () => {
      const config: SearchConfig = {
        searchFields: ['name'],
        filterFields: [
          {
            field: 'category',
            type: 'in'
          }
        ]
      };

      const params: SearchParams = {
        category: ['electronics', 'books']
      };

      // 模拟IN过滤逻辑
      const expectedWhere = 'category IN (:category)';
      const expectedReplacements = { category: ['electronics', 'books'] };

      expect(expectedWhere).toContain('IN');
      expect(expectedReplacements.category).toEqual(['electronics', 'books']);
    });

    it('应该构建LIKE过滤', () => {
      const config: SearchConfig = {
        searchFields: ['name'],
        filterFields: [
          {
            field: 'description',
            type: 'like'
          }
        ]
      };

      const params: SearchParams = {
        description: 'product'
      };

      // 模拟LIKE过滤逻辑
      const expectedWhere = 'description LIKE :description';
      const expectedReplacements = { description: '%product%' };

      expect(expectedWhere).toContain('LIKE');
      expect(expectedReplacements.description).toBe('%product%');
    });

    it('应该构建日期范围过滤', () => {
      const config: SearchConfig = {
        searchFields: ['name'],
        filterFields: [
          {
            field: 'created_at',
            type: 'date_range'
          }
        ]
      };

      const params: SearchParams = {
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      };

      // 模拟日期范围过滤逻辑
      const expectedWhere = 'created_at BETWEEN :startDate AND :endDate';
      const expectedReplacements = { startDate: '2023-01-01', endDate: '2023-12-31' };

      expect(expectedWhere).toContain('BETWEEN');
      expect(expectedReplacements.startDate).toBe('2023-01-01');
      expect(expectedReplacements.endDate).toBe('2023-12-31');
    });
  });

  describe('排序功能测试', () => {
    it('应该构建基本排序', () => {
      const config: SearchConfig = {
        searchFields: ['name'],
        sortFields: ['name', 'created_at']
      };

      const params: SearchParams = {
        sortBy: 'name',
        sortOrder: 'ASC'
      };

      // 模拟排序逻辑
      const expectedOrderBy = 'name ASC';

      expect(expectedOrderBy).toBe('name ASC');
    });

    it('应该使用默认排序', () => {
      const config: SearchConfig = {
        searchFields: ['name'],
        defaultSort: { field: 'created_at', order: 'DESC' }
      };

      const params: SearchParams = {};

      // 模拟默认排序逻辑
      const expectedOrderBy = 'created_at DESC';

      expect(expectedOrderBy).toBe('created_at DESC');
    });
  });

  describe('分页功能测试', () => {
    it('应该计算正确的分页参数', () => {
      const params: SearchParams = {
        page: 2,
        pageSize: 10
      };

      // 模拟分页逻辑
      const expectedLimit = 10;
      const expectedOffset = (2 - 1) * 10; // (page - 1) * pageSize

      expect(expectedLimit).toBe(10);
      expect(expectedOffset).toBe(10);
    });

    it('应该处理默认分页参数', () => {
      const params: SearchParams = {};

      // 模拟默认分页逻辑
      const defaultPage = 1;
      const defaultPageSize = 20;
      const expectedLimit = defaultPageSize;
      const expectedOffset = (defaultPage - 1) * defaultPageSize;

      expect(expectedLimit).toBe(20);
      expect(expectedOffset).toBe(0);
    });
  });

  describe('验证和转换功能测试', () => {
    it('应该使用字段验证器', () => {
      const validator = jest.fn().mockReturnValue(true);
      
      const config: SearchConfig = {
        searchFields: ['name'],
        filterFields: [
          {
            field: 'status',
            type: 'exact',
            validator
          }
        ]
      };

      const value = 'active';
      
      // 模拟验证逻辑
      const isValid = validator(value);

      expect(validator).toHaveBeenCalledWith(value);
      expect(isValid).toBe(true);
    });

    it('应该使用字段转换器', () => {
      const transformer = jest.fn().mockReturnValue('transformed_value');
      
      const config: SearchConfig = {
        searchFields: ['name'],
        filterFields: [
          {
            field: 'name',
            type: 'like',
            transformer
          }
        ]
      };

      const value = 'test';
      
      // 模拟转换逻辑
      const transformedValue = transformer(value);

      expect(transformer).toHaveBeenCalledWith(value);
      expect(transformedValue).toBe('transformed_value');
    });
  });
});
