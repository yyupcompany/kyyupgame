import { describe, it, expect } from 'vitest';
import { vi } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { formatDate, formatDateTime, formatTime, formatRelativeTime } from '@/utils/date';

// 控制台错误检测变量
let consoleSpy: any

describe('date.ts', () => {
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
  it('should format date correctly', () => {
    const date = new Date('2023-01-01T00:00:00Z');
    const formatted = formatDate(date, 'YYYY-MM-DD');
    expect(formatted).toBe('2023-01-01');
  });

  it('should format date with time', () => {
    const date = new Date('2023-01-01T12:30:45Z');
    const formatted = formatDateTime(date.toISOString());
    expect(formatted).toMatch(/2023-01-01 \d{2}:\d{2}:\d{2}/);
  });

  it('should format time correctly', () => {
    const date = new Date('2023-01-01T12:30:45Z');
    const formatted = formatTime(date.toISOString());
    expect(formatted).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it('should format relative time correctly', () => {
    const now = new Date();
    const formatted = formatRelativeTime(now);
    expect(formatted).toBe('刚刚');
  });
});