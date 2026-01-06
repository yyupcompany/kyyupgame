/**
 * 基础测试 - 验证测试环境是否正常工作
 */

import { jest } from '@jest/globals';
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

describe('基础测试环境', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Jest 基础功能', () => {
    it('应该能够运行基本测试', () => {
      expect(true).toBe(true);
    });

    it('应该能够使用Jest模拟', () => {
      const mockFn = jest.fn();
      mockFn('test');
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('应该能够处理异步操作', async () => {
      const asyncFn = jest.fn<() => Promise<string>>().mockResolvedValue('success');
      const result = await asyncFn();
      expect(result).toBe('success');
    });
  });

  describe('TypeScript 支持', () => {
    it('应该支持TypeScript类型', () => {
      const testObject: { name: string; age: number } = {
        name: 'test',
        age: 25
      };
      
      expect(testObject.name).toBe('test');
      expect(testObject.age).toBe(25);
    });

    it('应该支持泛型', () => {
      function identity<T>(arg: T): T {
        return arg;
      }
      
      expect(identity<string>('hello')).toBe('hello');
      expect(identity<number>(42)).toBe(42);
    });
  });

  describe('数学运算', () => {
    it('应该正确执行加法', () => {
      expect(1 + 1).toBe(2);
      expect(2 + 3).toBe(5);
    });

    it('应该正确执行减法', () => {
      expect(5 - 3).toBe(2);
      expect(10 - 7).toBe(3);
    });

    it('应该正确执行乘法', () => {
      expect(3 * 4).toBe(12);
      expect(7 * 8).toBe(56);
    });

    it('应该正确执行除法', () => {
      expect(10 / 2).toBe(5);
      expect(15 / 3).toBe(5);
    });
  });

  describe('字符串操作', () => {
    it('应该正确连接字符串', () => {
      expect('hello' + ' ' + 'world').toBe('hello world');
    });

    it('应该正确检查字符串包含', () => {
      expect('hello world'.includes('world')).toBe(true);
      expect('hello world'.includes('foo')).toBe(false);
    });

    it('应该正确转换大小写', () => {
      expect('Hello World'.toLowerCase()).toBe('hello world');
      expect('hello world'.toUpperCase()).toBe('HELLO WORLD');
    });
  });

  describe('数组操作', () => {
    it('应该正确创建和访问数组', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(arr.length).toBe(5);
      expect(arr[0]).toBe(1);
      expect(arr[4]).toBe(5);
    });

    it('应该正确使用数组方法', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(arr.map(x => x * 2)).toEqual([2, 4, 6, 8, 10]);
      expect(arr.filter(x => x > 3)).toEqual([4, 5]);
      expect(arr.reduce((sum, x) => sum + x, 0)).toBe(15);
    });
  });

  describe('对象操作', () => {
    it('应该正确创建和访问对象', () => {
      const obj = { name: 'test', value: 42 };
      expect(obj.name).toBe('test');
      expect(obj.value).toBe(42);
    });

    it('应该正确使用对象方法', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(Object.keys(obj)).toEqual(['a', 'b', 'c']);
      expect(Object.values(obj)).toEqual([1, 2, 3]);
    });
  });

  describe('错误处理', () => {
    it('应该能够捕获错误', () => {
      expect(() => {
        throw new Error('test error');
      }).toThrow('test error');
    });

    it('应该能够处理异步错误', async () => {
      const asyncErrorFn = jest.fn<() => Promise<never>>().mockRejectedValue(new Error('async error'));
      await expect(asyncErrorFn()).rejects.toThrow('async error');
    });
  });

  describe('时间处理', () => {
    it('应该能够创建日期', () => {
      const date = new Date('2023-01-01');
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(0); // 0-based
      expect(date.getDate()).toBe(1);
    });

    it('应该能够比较日期', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-02');
      expect(date2.getTime()).toBeGreaterThan(date1.getTime());
    });
  });

  describe('正则表达式', () => {
    it('应该能够匹配模式', () => {
      const pattern = /hello/i;
      expect(pattern.test('Hello World')).toBe(true);
      expect(pattern.test('Goodbye')).toBe(false);
    });

    it('应该能够提取匹配', () => {
      const pattern = /(\d{4})-(\d{2})-(\d{2})/;
      const match = '2023-01-01'.match(pattern);
      expect(match).not.toBeNull();
      expect(match![1]).toBe('2023');
      expect(match![2]).toBe('01');
      expect(match![3]).toBe('01');
    });
  });

  describe('Promise 处理', () => {
    it('应该能够处理 resolved Promise', async () => {
      const promise = Promise.resolve('success');
      const result = await promise;
      expect(result).toBe('success');
    });

    it('应该能够处理 rejected Promise', async () => {
      const promise = Promise.reject(new Error('failure'));
      await expect(promise).rejects.toThrow('failure');
    });

    it('应该能够处理 Promise.all', async () => {
      const promises = [
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3)
      ];
      const results = await Promise.all(promises);
      expect(results).toEqual([1, 2, 3]);
    });
  });
});
