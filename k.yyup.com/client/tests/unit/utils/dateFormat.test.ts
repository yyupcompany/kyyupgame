import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { formatDate, formatDateTime, formatTime } from '@/utils/dateFormat';
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';

// 控制台错误检测变量
let consoleSpy: any

describe('dateFormat.ts - 完整错误检测', () => {
  beforeEach(() => {
    startConsoleMonitoring()
    vi.clearAllMocks()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    expectNoConsoleErrors()
    stopConsoleMonitoring()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('基本功能测试', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('2023-01-01');
    });

    it('should format date time correctly', () => {
      const date = new Date('2023-01-01T12:30:45Z');
      const formatted = formatDateTime(date);
      // 使用更灵活的匹配，因为本地化格式可能不同
      expect(formatted).toMatch(/2023/);
      expect(formatted).toMatch(/01/);
    });

    it('should format time correctly', () => {
      const date = new Date('2023-01-01T12:30:45Z');
      const formatted = formatTime(date);
      // 检查时间格式
      expect(formatted).toMatch(/\d{2}:\d{2}:\d{2}/);
    });
  })

  describe('边界值测试', () => {
    it('应该处理最小日期值', () => {
      const minDate = new Date('1970-01-01T00:00:00Z');

      expect(() => {
        const dateFormatted = formatDate(minDate);
        const dateTimeFormatted = formatDateTime(minDate);
        const timeFormatted = formatTime(minDate);

        expect(dateFormatted).toBeDefined();
        expect(dateTimeFormatted).toBeDefined();
        expect(timeFormatted).toBeDefined();
        expect(typeof dateFormatted).toBe('string');
        expect(typeof dateTimeFormatted).toBe('string');
        expect(typeof timeFormatted).toBe('string');
      }).not.toThrow()
    })

    it('应该处理最大日期值', () => {
      const maxDate = new Date('9999-12-31T23:59:59Z');

      expect(() => {
        const dateFormatted = formatDate(maxDate);
        const dateTimeFormatted = formatDateTime(maxDate);
        const timeFormatted = formatTime(maxDate);

        expect(dateFormatted).toBeDefined();
        expect(dateTimeFormatted).toBeDefined();
        expect(timeFormatted).toBeDefined();
      }).not.toThrow()
    })

    it('应该处理负时间戳', () => {
      const negativeDate = new Date(-1000000000000);

      expect(() => {
        const dateFormatted = formatDate(negativeDate);
        const dateTimeFormatted = formatDateTime(negativeDate);
        const timeFormatted = formatTime(negativeDate);

        expect(dateFormatted).toBeDefined();
        expect(dateTimeFormatted).toBeDefined();
        expect(timeFormatted).toBeDefined();
      }).not.toThrow()
    })

    it('应该处理极大时间戳', () => {
      const largeTimestamp = Number.MAX_SAFE_INTEGER;
      const largeDate = new Date(largeTimestamp);

      expect(() => {
        const dateFormatted = formatDate(largeDate);
        const dateTimeFormatted = formatDateTime(largeDate);
        const timeFormatted = formatTime(largeDate);

        expect(dateFormatted).toBeDefined();
        expect(dateTimeFormatted).toBeDefined();
        expect(timeFormatted).toBeDefined();
      }).not.toThrow()
    })

    it('应该处理闰年日期', () => {
      const leapYearDate = new Date('2020-02-29T12:00:00Z');

      expect(() => {
        const dateFormatted = formatDate(leapYearDate);
        const dateTimeFormatted = formatDateTime(leapYearDate);
        const timeFormatted = formatTime(leapYearDate);

        expect(dateFormatted).toContain('2020-02-29');
        expect(dateTimeFormatted).toContain('2020');
      }).not.toThrow()
    })

    it('应该处理时区边界', () => {
      const utcDate = new Date('2023-01-01T00:00:00Z');

      expect(() => {
        const dateFormatted = formatDate(utcDate);
        const dateTimeFormatted = formatDateTime(utcDate);
        const timeFormatted = formatTime(utcDate);

        expect(dateFormatted).toBe('2023-01-01');
        expect(dateTimeFormatted).toMatch(/2023/);
      }).not.toThrow()
    })
  })

  describe('错误场景测试', () => {
    it('应该处理null日期', () => {
      expect(() => {
        formatDate(null as any);
      }).toThrow()
    })

    it('应该处理undefined日期', () => {
      expect(() => {
        formatDate(undefined as any);
      }).toThrow()
    })

    it('应该处理无效日期字符串', () => {
      expect(() => {
        const invalidDate = new Date('invalid-date-string');
        formatDate(invalidDate);
      }).not.toThrow()
    })

    it('应该处理NaN日期', () => {
      const nanDate = new Date(NaN);

      expect(() => {
        formatDate(nanDate);
        formatDateTime(nanDate);
        formatTime(nanDate);
      }).not.toThrow()
    })

    it('应该处理Infinity日期', () => {
      const infDate = new Date(Infinity);

      expect(() => {
        formatDate(infDate);
        formatDateTime(infDate);
        formatTime(infDate);
      }).not.toThrow()
    })

    it('应该处理0时间戳', () => {
      const zeroDate = new Date(0);

      expect(() => {
        const dateFormatted = formatDate(zeroDate);
        const dateTimeFormatted = formatDateTime(zeroDate);
        const timeFormatted = formatTime(zeroDate);

        expect(dateFormatted).toBeDefined();
        expect(dateTimeFormatted).toBeDefined();
        expect(timeFormatted).toBeDefined();
      }).not.toThrow()
    })
  })

  describe('特殊日期测试', () => {
    it('应该处理世纪交替日期', () => {
      const centuryDates = [
        new Date('1999-12-31T23:59:59Z'),
        new Date('2000-01-01T00:00:00Z'),
        new Date('2099-12-31T23:59:59Z'),
        new Date('2100-01-01T00:00:00Z')
      ];

      centuryDates.forEach(date => {
        expect(() => {
          const dateFormatted = formatDate(date);
          const dateTimeFormatted = formatDateTime(date);
          const timeFormatted = formatTime(date);

          expect(dateFormatted).toBeDefined();
          expect(dateTimeFormatted).toBeDefined();
          expect(timeFormatted).toBeDefined();
        }).not.toThrow()
      })
    })

    it('应该处理夏令时变化日期', () => {
      const dstDates = [
        new Date('2023-03-12T00:00:00Z'), // US DST start
        new Date('2023-11-05T00:00:00Z'), // US DST end
      ];

      dstDates.forEach(date => {
        expect(() => {
          const dateFormatted = formatDate(date);
          const dateTimeFormatted = formatDateTime(date);
          const timeFormatted = formatTime(date);

          expect(dateFormatted).toBeDefined();
          expect(dateTimeFormatted).toBeDefined();
          expect(timeFormatted).toBeDefined();
        }).not.toThrow()
      })
    })
  })

  describe('性能测试', () => {
    it('应该能处理大量日期格式化而不产生错误', () => {
      const dates = Array(10000).fill(0).map((_, i) =>
        new Date(Date.now() + i * 86400000) // 未来10000天
      );

      expect(() => {
        dates.forEach(date => {
          formatDate(date);
          formatDateTime(date);
          formatTime(date);
        })
      }).not.toThrow()
    })

    it('应该在合理时间内完成格式化', () => {
      const dates = Array(1000).fill(0).map((_, i) =>
        new Date(Date.now() + i * 86400000)
      );

      const startTime = performance.now();

      dates.forEach(date => {
        formatDate(date);
        formatDateTime(date);
        formatTime(date);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    })
  })

  describe('返回值验证', () => {
    it('应该返回字符串类型', () => {
      const testDate = new Date('2023-01-01T12:00:00Z');

      const dateFormatted = formatDate(testDate);
      const dateTimeFormatted = formatDateTime(testDate);
      const timeFormatted = formatTime(testDate);

      expect(typeof dateFormatted).toBe('string');
      expect(typeof dateTimeFormatted).toBe('string');
      expect(typeof timeFormatted).toBe('string');
    })

    it('应该返回非空字符串', () => {
      const testDate = new Date();

      const dateFormatted = formatDate(testDate);
      const dateTimeFormatted = formatDateTime(testDate);
      const timeFormatted = formatTime(testDate);

      expect(dateFormatted.length).toBeGreaterThan(0);
      expect(dateTimeFormatted.length).toBeGreaterThan(0);
      expect(timeFormatted.length).toBeGreaterThan(0);
    })
  })
});