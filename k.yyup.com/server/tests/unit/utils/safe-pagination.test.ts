import {
  safePagination,
  buildSafeLimitOffset,
  getSequelizePagination,
  SafePaginationParams,
  SafePaginationResult
} from '../../../src/utils/safe-pagination';
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

describe('Safe Pagination', () => {
  describe('safePagination', () => {
    it('应该处理基本的分页参数', () => {
      const params: SafePaginationParams = {
        page: 2,
        pageSize: 10
      };

      const result = safePagination(params);

      expect(result).toEqual({
        page: 2,
        pageSize: 10,
        offset: 10,
        limit: 10
      });
    });

    it('应该使用默认值', () => {
      const params: SafePaginationParams = {};

      const result = safePagination(params);

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        offset: 0,
        limit: 10
      });
    });

    it('应该处理字符串参数', () => {
      const params: SafePaginationParams = {
        page: '3',
        pageSize: '20'
      };

      const result = safePagination(params);

      expect(result).toEqual({
        page: 3,
        pageSize: 20,
        offset: 40,
        limit: 20
      });
    });

    it('应该处理无效的页码', () => {
      const testCases = [
        { page: 0, expected: 1 },
        { page: -1, expected: 1 },
        { page: 'invalid', expected: 1 },
        { page: null, expected: 1 },
        { page: undefined, expected: 1 }
      ];

      testCases.forEach(({ page, expected }) => {
        const result = safePagination({ page: page as any });
        expect(result.page).toBe(expected);
      });
    });

    it('应该处理无效的页面大小', () => {
      const testCases = [
        { pageSize: 0, expected: 1 },
        { pageSize: -1, expected: 1 },
        { pageSize: 'invalid', expected: 10 },
        { pageSize: null, expected: 10 },
        { pageSize: undefined, expected: 10 }
      ];

      testCases.forEach(({ pageSize, expected }) => {
        const result = safePagination({ pageSize: pageSize as any });
        expect(result.pageSize).toBe(expected);
      });
    });

    it('应该限制最大页面大小', () => {
      const params: SafePaginationParams = {
        pageSize: 200,
        maxPageSize: 50
      };

      const result = safePagination(params);

      expect(result.pageSize).toBe(50);
      expect(result.limit).toBe(50);
    });

    it('应该使用默认最大页面大小', () => {
      const params: SafePaginationParams = {
        pageSize: 200
      };

      const result = safePagination(params);

      expect(result.pageSize).toBe(100); // 默认最大值
      expect(result.limit).toBe(100);
    });

    it('应该正确计算偏移量', () => {
      const testCases = [
        { page: 1, pageSize: 10, expectedOffset: 0 },
        { page: 2, pageSize: 10, expectedOffset: 10 },
        { page: 3, pageSize: 20, expectedOffset: 40 },
        { page: 5, pageSize: 15, expectedOffset: 60 }
      ];

      testCases.forEach(({ page, pageSize, expectedOffset }) => {
        const result = safePagination({ page, pageSize });
        expect(result.offset).toBe(expectedOffset);
      });
    });

    it('应该处理小数页码', () => {
      const params: SafePaginationParams = {
        page: 2.7,
        pageSize: 10.9
      };

      const result = safePagination(params);

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(10);
      expect(result.offset).toBe(10);
    });

    it('应该处理极大的页码', () => {
      const params: SafePaginationParams = {
        page: 999999,
        pageSize: 10
      };

      const result = safePagination(params);

      expect(result.page).toBe(999999);
      expect(result.offset).toBe(9999980);
    });

    it('应该处理边界值', () => {
      const params: SafePaginationParams = {
        page: 1,
        pageSize: 1,
        maxPageSize: 1
      };

      const result = safePagination(params);

      expect(result).toEqual({
        page: 1,
        pageSize: 1,
        offset: 0,
        limit: 1
      });
    });

    it('应该确保limit等于pageSize', () => {
      const testCases = [
        { pageSize: 5 },
        { pageSize: 25 },
        { pageSize: 100 }
      ];

      testCases.forEach(({ pageSize }) => {
        const result = safePagination({ pageSize });
        expect(result.limit).toBe(result.pageSize);
      });
    });
  });

  describe('buildSafeLimitOffset', () => {
    it('应该构建正确的SQL LIMIT OFFSET子句', () => {
      const params: SafePaginationParams = {
        page: 2,
        pageSize: 15
      };

      const sql = buildSafeLimitOffset(params);

      expect(sql).toBe('LIMIT 15 OFFSET 15');
    });

    it('应该处理第一页', () => {
      const params: SafePaginationParams = {
        page: 1,
        pageSize: 10
      };

      const sql = buildSafeLimitOffset(params);

      expect(sql).toBe('LIMIT 10 OFFSET 0');
    });

    it('应该处理默认参数', () => {
      const sql = buildSafeLimitOffset({});

      expect(sql).toBe('LIMIT 10 OFFSET 0');
    });

    it('应该处理无效参数', () => {
      const params: SafePaginationParams = {
        page: 'invalid',
        pageSize: 'invalid'
      };

      const sql = buildSafeLimitOffset(params);

      expect(sql).toBe('LIMIT 10 OFFSET 0');
    });

    it('应该防止SQL注入', () => {
      const params: SafePaginationParams = {
        page: "1; DROP TABLE users; --",
        pageSize: "10; DELETE FROM users; --"
      };

      const sql = buildSafeLimitOffset(params);

      // 应该只包含数字，不包含恶意SQL
      expect(sql).toMatch(/^LIMIT \d+ OFFSET \d+$/);
      expect(sql).not.toContain('DROP');
      expect(sql).not.toContain('DELETE');
      expect(sql).not.toContain(';');
      expect(sql).not.toContain('--');
    });

    it('应该生成有效的SQL语法', () => {
      const testCases = [
        { page: 1, pageSize: 5 },
        { page: 10, pageSize: 20 },
        { page: 100, pageSize: 50 }
      ];

      testCases.forEach(params => {
        const sql = buildSafeLimitOffset(params);
        
        // 验证SQL格式
        expect(sql).toMatch(/^LIMIT \d+ OFFSET \d+$/);
        
        // 验证数字是正整数
        const matches = sql.match(/LIMIT (\d+) OFFSET (\d+)/);
        expect(matches).toBeTruthy();
        
        const limit = parseInt(matches![1]);
        const offset = parseInt(matches![2]);
        
        expect(limit).toBeGreaterThan(0);
        expect(offset).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getSequelizePagination', () => {
    it('应该返回Sequelize分页选项', () => {
      const params: SafePaginationParams = {
        page: 3,
        pageSize: 25
      };

      const options = getSequelizePagination(params);

      expect(options).toEqual({
        limit: 25,
        offset: 50
      });
    });

    it('应该处理默认参数', () => {
      const options = getSequelizePagination({});

      expect(options).toEqual({
        limit: 10,
        offset: 0
      });
    });

    it('应该返回正确的对象结构', () => {
      const options = getSequelizePagination({ page: 1, pageSize: 5 });

      expect(options).toHaveProperty('limit');
      expect(options).toHaveProperty('offset');
      expect(Object.keys(options)).toEqual(['limit', 'offset']);
    });

    it('应该返回数字类型的值', () => {
      const options = getSequelizePagination({ page: '2', pageSize: '15' });

      expect(typeof options.limit).toBe('number');
      expect(typeof options.offset).toBe('number');
      expect(Number.isInteger(options.limit)).toBe(true);
      expect(Number.isInteger(options.offset)).toBe(true);
    });

    it('应该处理边界情况', () => {
      const testCases = [
        { page: 0, pageSize: 0 },
        { page: -1, pageSize: -1 },
        { page: 'invalid', pageSize: 'invalid' }
      ];

      testCases.forEach(params => {
        const options = getSequelizePagination(params);
        
        expect(options.limit).toBeGreaterThan(0);
        expect(options.offset).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('类型安全性', () => {
    it('safePagination应该返回正确的类型', () => {
      const result: SafePaginationResult = safePagination({});

      expect(typeof result.page).toBe('number');
      expect(typeof result.pageSize).toBe('number');
      expect(typeof result.offset).toBe('number');
      expect(typeof result.limit).toBe('number');
    });

    it('所有返回值都应该是有限数字', () => {
      const testCases = [
        {},
        { page: 'invalid', pageSize: 'invalid' },
        { page: Infinity, pageSize: -Infinity },
        { page: NaN, pageSize: NaN }
      ];

      testCases.forEach(params => {
        const result = safePagination(params as any);
        
        expect(Number.isFinite(result.page)).toBe(true);
        expect(Number.isFinite(result.pageSize)).toBe(true);
        expect(Number.isFinite(result.offset)).toBe(true);
        expect(Number.isFinite(result.limit)).toBe(true);
      });
    });

    it('所有返回值都应该是正整数或零', () => {
      const result = safePagination({ page: 5, pageSize: 20 });

      expect(result.page).toBeGreaterThan(0);
      expect(result.pageSize).toBeGreaterThan(0);
      expect(result.offset).toBeGreaterThanOrEqual(0);
      expect(result.limit).toBeGreaterThan(0);
      
      expect(Number.isInteger(result.page)).toBe(true);
      expect(Number.isInteger(result.pageSize)).toBe(true);
      expect(Number.isInteger(result.offset)).toBe(true);
      expect(Number.isInteger(result.limit)).toBe(true);
    });
  });

  describe('一致性测试', () => {
    it('相同输入应该产生相同输出', () => {
      const params = { page: 3, pageSize: 15 };
      
      const result1 = safePagination(params);
      const result2 = safePagination(params);
      
      expect(result1).toEqual(result2);
    });

    it('buildSafeLimitOffset和getSequelizePagination应该使用相同的逻辑', () => {
      const params = { page: 4, pageSize: 12 };
      
      const sql = buildSafeLimitOffset(params);
      const sequelizeOptions = getSequelizePagination(params);
      
      // 从SQL中提取数字
      const matches = sql.match(/LIMIT (\d+) OFFSET (\d+)/);
      const sqlLimit = parseInt(matches![1]);
      const sqlOffset = parseInt(matches![2]);
      
      expect(sqlLimit).toBe(sequelizeOptions.limit);
      expect(sqlOffset).toBe(sequelizeOptions.offset);
    });
  });
});
