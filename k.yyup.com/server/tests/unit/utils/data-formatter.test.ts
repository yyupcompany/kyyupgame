import {
  ensureArray,
  safelyGetArrayFromQuery,
  formatPaginationResponse
} from '../../../src/utils/data-formatter';
import { vi } from 'vitest'


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

describe('Data Formatter', () => {
  describe('ensureArray', () => {
    it('应该返回空数组当输入为null', () => {
      expect(ensureArray(null)).toEqual([]);
    });

    it('应该返回空数组当输入为undefined', () => {
      expect(ensureArray(undefined)).toEqual([]);
    });

    it('应该返回原数组当输入已经是数组', () => {
      const input = [1, 2, 3];
      const result = ensureArray(input);
      
      expect(result).toEqual([1, 2, 3]);
      expect(result).toBe(input); // 应该返回同一个引用
    });

    it('应该将单个对象包装成数组', () => {
      const input = { id: 1, name: 'test' };
      const result = ensureArray(input);
      
      expect(result).toEqual([{ id: 1, name: 'test' }]);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('应该将原始值包装成数组', () => {
      expect(ensureArray('test')).toEqual(['test']);
      expect(ensureArray(123)).toEqual([123]);
      expect(ensureArray(true)).toEqual([true]);
      expect(ensureArray(false)).toEqual([false]);
    });

    it('应该处理嵌套对象', () => {
      const input = {
        user: { id: 1, name: 'John' },
        settings: { theme: 'dark' }
      };
      
      const result = ensureArray(input);
      
      expect(result).toEqual([input]);
      expect(result[0]).toBe(input);
    });

    it('应该处理空对象', () => {
      const input = {};
      const result = ensureArray(input);
      
      expect(result).toEqual([{}]);
      expect(result.length).toBe(1);
    });

    it('应该处理空数组', () => {
      const input: any[] = [];
      const result = ensureArray(input);
      
      expect(result).toEqual([]);
      expect(result).toBe(input);
    });

    it('应该保持数组中的null和undefined元素', () => {
      const input = [null, undefined, 'test', 123];
      const result = ensureArray(input);
      
      expect(result).toEqual([null, undefined, 'test', 123]);
      expect(result).toBe(input);
    });

    it('应该处理数字0', () => {
      const result = ensureArray(0);
      
      expect(result).toEqual([0]);
      expect(result.length).toBe(1);
    });

    it('应该处理空字符串', () => {
      const result = ensureArray('');
      
      expect(result).toEqual(['']);
      expect(result.length).toBe(1);
    });
  });

  describe('safelyGetArrayFromQuery', () => {
    it('应该处理Sequelize查询返回的单个对象', () => {
      const queryResult = { id: 1, name: 'John', email: 'john@example.com' };
      const result = safelyGetArrayFromQuery(queryResult);
      
      expect(result).toEqual([queryResult]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('应该处理Sequelize查询返回的数组', () => {
      const queryResult = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ];
      const result = safelyGetArrayFromQuery(queryResult);
      
      expect(result).toEqual(queryResult);
      expect(result).toBe(queryResult);
    });

    it('应该处理空查询结果', () => {
      expect(safelyGetArrayFromQuery(null)).toEqual([]);
      expect(safelyGetArrayFromQuery(undefined)).toEqual([]);
    });

    it('应该处理空数组查询结果', () => {
      const queryResult: any[] = [];
      const result = safelyGetArrayFromQuery(queryResult);
      
      expect(result).toEqual([]);
      expect(result).toBe(queryResult);
    });

    it('应该处理复杂对象查询结果', () => {
      const queryResult = {
        id: 1,
        user: { name: 'John', age: 30 },
        posts: [{ title: 'Post 1' }, { title: 'Post 2' }],
        metadata: { created: '2023-01-01', updated: '2023-01-02' }
      };
      
      const result = safelyGetArrayFromQuery(queryResult);
      
      expect(result).toEqual([queryResult]);
      expect(result[0]).toBe(queryResult);
    });

    it('应该处理原始值查询结果', () => {
      expect(safelyGetArrayFromQuery('string')).toEqual(['string']);
      expect(safelyGetArrayFromQuery(123)).toEqual([123]);
      expect(safelyGetArrayFromQuery(true)).toEqual([true]);
    });

    it('应该保持类型信息', () => {
      interface User {
        id: number;
        name: string;
      }
      
      const queryResult: User = { id: 1, name: 'John' };
      const result = safelyGetArrayFromQuery<User>(queryResult);
      
      expect(result).toEqual([{ id: 1, name: 'John' }]);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('John');
    });
  });

  describe('formatPaginationResponse', () => {
    it('应该格式化基本分页响应', () => {
      const total = 100;
      const page = 2;
      const pageSize = 10;
      const list = [{ id: 1 }, { id: 2 }];
      
      const result = formatPaginationResponse(total, page, pageSize, list);
      
      expect(result).toEqual({
        total: 100,
        page: 2,
        pageSize: 10,
        list: [{ id: 1 }, { id: 2 }]
      });
    });

    it('应该处理空列表', () => {
      const result = formatPaginationResponse(0, 1, 10, []);
      
      expect(result).toEqual({
        total: 0,
        page: 1,
        pageSize: 10,
        list: []
      });
    });

    it('应该处理第一页', () => {
      const list = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = formatPaginationResponse(50, 1, 10, list);
      
      expect(result).toEqual({
        total: 50,
        page: 1,
        pageSize: 10,
        list: list
      });
    });

    it('应该处理最后一页', () => {
      const list = [{ id: 91 }, { id: 92 }]; // 最后一页只有2条记录
      const result = formatPaginationResponse(92, 10, 10, list);
      
      expect(result).toEqual({
        total: 92,
        page: 10,
        pageSize: 10,
        list: list
      });
    });

    it('应该处理单条记录', () => {
      const list = [{ id: 1, name: 'Single Item' }];
      const result = formatPaginationResponse(1, 1, 1, list);
      
      expect(result).toEqual({
        total: 1,
        page: 1,
        pageSize: 1,
        list: list
      });
    });

    it('应该处理大页面大小', () => {
      const list = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));
      const result = formatPaginationResponse(100, 1, 100, list);
      
      expect(result).toEqual({
        total: 100,
        page: 1,
        pageSize: 100,
        list: list
      });
    });

    it('应该保持列表引用', () => {
      const list = [{ id: 1 }, { id: 2 }];
      const result = formatPaginationResponse(10, 1, 5, list);
      
      expect(result.list).toBe(list);
    });

    it('应该处理零值', () => {
      const result = formatPaginationResponse(0, 0, 0, []);
      
      expect(result).toEqual({
        total: 0,
        page: 0,
        pageSize: 0,
        list: []
      });
    });

    it('应该处理负值', () => {
      const result = formatPaginationResponse(-1, -1, -1, []);
      
      expect(result).toEqual({
        total: -1,
        page: -1,
        pageSize: -1,
        list: []
      });
    });

    it('应该处理复杂对象列表', () => {
      const list = [
        {
          id: 1,
          user: { name: 'John', age: 30 },
          posts: [{ title: 'Post 1' }]
        },
        {
          id: 2,
          user: { name: 'Jane', age: 25 },
          posts: [{ title: 'Post 2' }, { title: 'Post 3' }]
        }
      ];
      
      const result = formatPaginationResponse(2, 1, 10, list);
      
      expect(result).toEqual({
        total: 2,
        page: 1,
        pageSize: 10,
        list: list
      });
      expect(result.list[0].user.name).toBe('John');
      expect(result.list[1].posts.length).toBe(2);
    });

    it('应该保持类型信息', () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }
      
      const list: User[] = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' }
      ];
      
      const result = formatPaginationResponse<User>(10, 1, 5, list);
      
      expect(result.list[0].email).toBe('john@example.com');
      expect(result.list[1].name).toBe('Jane');
    });
  });
});
