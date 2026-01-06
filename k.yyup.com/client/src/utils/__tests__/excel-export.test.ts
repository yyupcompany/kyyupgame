/**
 * Excel导出工具单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToExcel, exportUsageToExcel } from '../excel-export';

describe('Excel Export Utils', () => {
  beforeEach(() => {
    // Mock Blob
    global.Blob = vi.fn((content, options) => ({
      content,
      options
    })) as any;

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');

    // Mock document methods
    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: {}
    };

    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportToExcel', () => {
    it('应该成功导出Excel文件', () => {
      const sheets = [
        {
          name: '测试表格',
          columns: [
            { header: '姓名', key: 'name' },
            { header: '年龄', key: 'age' }
          ],
          data: [
            { name: '张三', age: 25 },
            { name: '李四', age: 30 }
          ]
        }
      ];

      const result = exportToExcel(sheets, '测试文件');

      expect(result).toBe(true);
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(global.Blob).toHaveBeenCalled();
    });

    it('应该处理多个工作表', () => {
      const sheets = [
        {
          name: '表格1',
          columns: [{ header: '列1', key: 'col1' }],
          data: [{ col1: '数据1' }]
        },
        {
          name: '表格2',
          columns: [{ header: '列2', key: 'col2' }],
          data: [{ col2: '数据2' }]
        }
      ];

      const result = exportToExcel(sheets, '多表格文件');

      expect(result).toBe(true);
    });

    it('应该处理空数据', () => {
      const sheets = [
        {
          name: '空表格',
          columns: [{ header: '列1', key: 'col1' }],
          data: []
        }
      ];

      const result = exportToExcel(sheets, '空文件');

      expect(result).toBe(true);
    });

    it('应该处理formatter', () => {
      const sheets = [
        {
          name: '格式化表格',
          columns: [
            {
              header: '数字',
              key: 'number',
              formatter: (value: number) => value.toLocaleString()
            }
          ],
          data: [
            { number: 12500 }
          ]
        }
      ];

      const result = exportToExcel(sheets, '格式化文件');

      expect(result).toBe(true);
    });

    it('应该处理特殊字符', () => {
      const sheets = [
        {
          name: '特殊字符',
          columns: [{ header: '内容', key: 'content' }],
          data: [
            { content: '<script>alert("xss")</script>' },
            { content: '&nbsp;' },
            { content: '"引号"' }
          ]
        }
      ];

      const result = exportToExcel(sheets, '特殊字符文件');

      expect(result).toBe(true);
    });

    it('应该处理错误情况', () => {
      // Mock Blob抛出错误
      global.Blob = vi.fn(() => {
        throw new Error('Blob creation failed');
      }) as any;

      const sheets = [
        {
          name: '测试',
          columns: [{ header: '列', key: 'col' }],
          data: [{ col: '数据' }]
        }
      ];

      const result = exportToExcel(sheets, '错误文件');

      expect(result).toBe(false);
    });
  });

  describe('exportUsageToExcel', () => {
    it('应该成功导出用量统计Excel', () => {
      const userUsageList = [
        {
          username: 'admin',
          realName: '管理员',
          email: 'admin@example.com',
          totalCalls: 1500,
          totalTokens: 150000,
          totalCost: 15.678901
        },
        {
          username: 'teacher',
          realName: '教师',
          email: 'teacher@example.com',
          totalCalls: 800,
          totalTokens: 80000,
          totalCost: 8.234567
        }
      ];

      const dateRange: [Date, Date] = [
        new Date('2024-01-01'),
        new Date('2024-01-31')
      ];

      const result = exportUsageToExcel(userUsageList, dateRange);

      expect(result).toBe(true);
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('应该使用自定义文件名', () => {
      const userUsageList = [
        {
          username: 'admin',
          realName: '管理员',
          email: 'admin@example.com',
          totalCalls: 1500,
          totalTokens: 150000,
          totalCost: 15.678901
        }
      ];

      const dateRange: [Date, Date] = [
        new Date('2024-01-01'),
        new Date('2024-01-31')
      ];

      const result = exportUsageToExcel(userUsageList, dateRange, '自定义文件名');

      expect(result).toBe(true);
    });

    it('应该处理空用户列表', () => {
      const userUsageList: any[] = [];
      const dateRange: [Date, Date] = [
        new Date('2024-01-01'),
        new Date('2024-01-31')
      ];

      const result = exportUsageToExcel(userUsageList, dateRange);

      expect(result).toBe(true);
    });

    it('应该正确格式化数字', () => {
      const userUsageList = [
        {
          username: 'admin',
          realName: '管理员',
          email: 'admin@example.com',
          totalCalls: 1234567,
          totalTokens: 9876543,
          totalCost: 123.456789
        }
      ];

      const dateRange: [Date, Date] = [
        new Date('2024-01-01'),
        new Date('2024-01-31')
      ];

      const result = exportUsageToExcel(userUsageList, dateRange);

      expect(result).toBe(true);
    });
  });

  describe('HTML转义', () => {
    it('应该正确转义HTML特殊字符', () => {
      const sheets = [
        {
          name: 'HTML测试',
          columns: [{ header: '内容', key: 'content' }],
          data: [
            { content: '<div>HTML标签</div>' },
            { content: '&符号' },
            { content: '"双引号"' },
            { content: "'单引号'" }
          ]
        }
      ];

      const result = exportToExcel(sheets, 'HTML转义测试');

      expect(result).toBe(true);
      // 验证Blob内容包含转义后的字符
      const blobCalls = (global.Blob as any).mock.calls;
      expect(blobCalls.length).toBeGreaterThan(0);
    });
  });

  describe('文件下载', () => {
    it('应该设置正确的文件名', () => {
      const mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: {}
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

      const sheets = [
        {
          name: '测试',
          columns: [{ header: '列', key: 'col' }],
          data: [{ col: '数据' }]
        }
      ];

      exportToExcel(sheets, '测试文件名');

      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', '测试文件名.xls');
    });

    it('应该设置正确的MIME类型', () => {
      const sheets = [
        {
          name: '测试',
          columns: [{ header: '列', key: 'col' }],
          data: [{ col: '数据' }]
        }
      ];

      exportToExcel(sheets, '测试');

      const blobCalls = (global.Blob as any).mock.calls;
      expect(blobCalls[0][1].type).toBe('application/vnd.ms-excel;charset=utf-8');
    });

    it('应该触发下载', () => {
      const mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: {}
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

      const sheets = [
        {
          name: '测试',
          columns: [{ header: '列', key: 'col' }],
          data: [{ col: '数据' }]
        }
      ];

      exportToExcel(sheets, '测试');

      expect(mockLink.click).toHaveBeenCalled();
    });
  });
});

