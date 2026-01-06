import {
  parseId,
  parsePage
} from '../../../src/utils/param-validator';
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

describe('Parameter Validator', () => {
  describe('parseId', () => {
    it('应该解析有效的ID字符串', () => {
      expect(parseId('123')).toBe(123);
      expect(parseId('1')).toBe(1);
      expect(parseId('999999')).toBe(999999);
    });

    it('应该处理undefined输入', () => {
      expect(parseId(undefined)).toBe(0);
      expect(parseId(undefined, 5)).toBe(5);
    });

    it('应该处理空字符串', () => {
      expect(parseId('')).toBe(0);
      expect(parseId('', 10)).toBe(10);
    });

    it('应该处理无效的数字字符串', () => {
      expect(parseId('abc')).toBe(0);
      expect(parseId('12.34')).toBe(12); // parseInt会截断小数
      expect(parseId('12abc')).toBe(12); // parseInt会解析前面的数字部分
      expect(parseId('abc123')).toBe(0); // 以非数字开头会返回NaN
    });

    it('应该处理负数', () => {
      expect(parseId('-123')).toBe(-123);
      expect(parseId('-1')).toBe(-1);
    });

    it('应该处理零', () => {
      expect(parseId('0')).toBe(0);
    });

    it('应该使用自定义默认值', () => {
      expect(parseId(undefined, 100)).toBe(100);
      expect(parseId('', 200)).toBe(200);
      expect(parseId('invalid', 300)).toBe(300);
    });

    it('应该处理前导零', () => {
      expect(parseId('0123')).toBe(123);
      expect(parseId('00001')).toBe(1);
    });

    it('应该处理空白字符', () => {
      expect(parseId(' ')).toBe(0);
      expect(parseId('  123  ')).toBe(123); // parseInt会忽略前导空白
      expect(parseId('\t\n')).toBe(0);
    });

    it('应该处理特殊字符', () => {
      expect(parseId('123!')).toBe(123);
      expect(parseId('123.456')).toBe(123);
      expect(parseId('123e2')).toBe(123); // 科学计数法
    });

    it('应该处理极大数值', () => {
      const largeNumber = '9007199254740991'; // Number.MAX_SAFE_INTEGER
      expect(parseId(largeNumber)).toBe(9007199254740991);
    });

    it('应该处理十六进制字符串', () => {
      expect(parseId('0x10')).toBe(0); // parseInt默认基数10，不会解析十六进制
      expect(parseId('FF')).toBe(0);
    });
  });

  describe('parsePage', () => {
    it('应该解析有效的页码字符串', () => {
      expect(parsePage('1')).toBe(1);
      expect(parsePage('2')).toBe(2);
      expect(parsePage('100')).toBe(100);
    });

    it('应该处理undefined输入', () => {
      expect(parsePage(undefined)).toBe(1);
      expect(parsePage(undefined, 5)).toBe(5);
    });

    it('应该处理空字符串', () => {
      expect(parsePage('')).toBe(1);
      expect(parsePage('', 3)).toBe(3);
    });

    it('应该处理无效的数字字符串', () => {
      expect(parsePage('abc')).toBe(1);
      expect(parsePage('12.34')).toBe(12);
      expect(parsePage('abc123')).toBe(1);
    });

    it('应该处理小于1的页码', () => {
      expect(parsePage('0')).toBe(1);
      expect(parsePage('-1')).toBe(1);
      expect(parsePage('-100')).toBe(1);
    });

    it('应该使用自定义默认值', () => {
      expect(parsePage(undefined, 10)).toBe(10);
      expect(parsePage('', 20)).toBe(20);
      expect(parsePage('invalid', 30)).toBe(30);
      expect(parsePage('0', 40)).toBe(40);
    });

    it('应该处理边界值', () => {
      expect(parsePage('1')).toBe(1);
      expect(parsePage('2')).toBe(2);
    });

    it('应该处理大页码', () => {
      expect(parsePage('1000')).toBe(1000);
      expect(parsePage('999999')).toBe(999999);
    });

    it('应该处理前导零', () => {
      expect(parsePage('01')).toBe(1);
      expect(parsePage('0002')).toBe(2);
      expect(parsePage('0010')).toBe(10);
    });

    it('应该处理空白字符', () => {
      expect(parsePage(' ')).toBe(1);
      expect(parsePage('  5  ')).toBe(5);
      expect(parsePage('\t\n')).toBe(1);
    });

    it('应该处理小数页码', () => {
      expect(parsePage('1.5')).toBe(1);
      expect(parsePage('2.9')).toBe(2);
      expect(parsePage('10.1')).toBe(10);
    });

    it('应该处理科学计数法', () => {
      expect(parsePage('1e2')).toBe(1); // parseInt会停在'e'处
      expect(parsePage('2E1')).toBe(2);
    });
  });

  describe('边界情况和错误处理', () => {
    it('parseId应该处理null输入', () => {
      // TypeScript不允许null，但JavaScript运行时可能遇到
      expect(parseId(null as any)).toBe(0);
      expect(parseId(null as any, 99)).toBe(99);
    });

    it('parsePage应该处理null输入', () => {
      expect(parsePage(null as any)).toBe(1);
      expect(parsePage(null as any, 99)).toBe(99);
    });

    it('应该处理非字符串输入', () => {
      // 虽然类型定义为string，但运行时可能传入其他类型
      expect(parseId(123 as any)).toBe(123);
      expect(parseId(true as any)).toBe(0);
      expect(parseId(false as any)).toBe(0);
      expect(parseId({} as any)).toBe(0);
      expect(parseId([] as any)).toBe(0);
    });

    it('应该处理特殊数值', () => {
      expect(parseId('Infinity')).toBe(0);
      expect(parseId('-Infinity')).toBe(0);
      expect(parseId('NaN')).toBe(0);
    });

    it('应该处理Unicode数字', () => {
      expect(parseId('１２３')).toBe(0); // 全角数字
      expect(parseId('①②③')).toBe(0); // 圆圈数字
    });
  });

  describe('性能和一致性', () => {
    it('应该对相同输入返回相同结果', () => {
      const testCases = ['123', 'abc', '', undefined, '0', '-1'];
      
      testCases.forEach(testCase => {
        const result1 = parseId(testCase);
        const result2 = parseId(testCase);
        expect(result1).toBe(result2);
      });
    });

    it('应该快速处理大量输入', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 10000; i++) {
        parseId(i.toString());
        parsePage(i.toString());
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 应该在合理时间内完成（通常几毫秒）
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('类型安全性', () => {
    it('应该始终返回数字类型', () => {
      const testCases = ['123', 'abc', '', undefined, '0', '-1'];
      
      testCases.forEach(testCase => {
        const idResult = parseId(testCase);
        const pageResult = parsePage(testCase);
        
        expect(typeof idResult).toBe('number');
        expect(typeof pageResult).toBe('number');
        expect(Number.isFinite(idResult)).toBe(true);
        expect(Number.isFinite(pageResult)).toBe(true);
      });
    });

    it('应该返回整数', () => {
      const testCases = ['123.456', '1.9', '2.1'];
      
      testCases.forEach(testCase => {
        const idResult = parseId(testCase);
        const pageResult = parsePage(testCase);
        
        expect(Number.isInteger(idResult)).toBe(true);
        expect(Number.isInteger(pageResult)).toBe(true);
      });
    });
  });

  describe('默认值行为', () => {
    it('parseId默认值应该为0', () => {
      expect(parseId(undefined)).toBe(0);
      expect(parseId('')).toBe(0);
      expect(parseId('invalid')).toBe(0);
    });

    it('parsePage默认值应该为1', () => {
      expect(parsePage(undefined)).toBe(1);
      expect(parsePage('')).toBe(1);
      expect(parsePage('invalid')).toBe(1);
      expect(parsePage('0')).toBe(1);
      expect(parsePage('-1')).toBe(1);
    });

    it('应该正确使用自定义默认值', () => {
      const customDefault = 999;
      
      expect(parseId(undefined, customDefault)).toBe(customDefault);
      expect(parseId('', customDefault)).toBe(customDefault);
      expect(parseId('invalid', customDefault)).toBe(customDefault);
      
      expect(parsePage(undefined, customDefault)).toBe(customDefault);
      expect(parsePage('', customDefault)).toBe(customDefault);
      expect(parsePage('invalid', customDefault)).toBe(customDefault);
      expect(parsePage('0', customDefault)).toBe(customDefault);
    });
  });
});
