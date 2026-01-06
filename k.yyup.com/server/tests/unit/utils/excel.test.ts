/**
 * Excel工具测试
 * 测试Excel文件创建和处理功能
 */

import { createExcelFile } from '../../../src/utils/excel';
import { vi } from 'vitest'
import ExcelJS from 'exceljs';
import * as tmp from 'tmp';
import * as fs from 'fs';

// Mock外部依赖
jest.mock('exceljs');
jest.mock('tmp');
jest.mock('fs');

const mockExcelJS = ExcelJS as jest.Mocked<typeof ExcelJS>;
const mockTmp = tmp as jest.Mocked<typeof tmp>;
const mockFs = fs as jest.Mocked<typeof fs>;


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

describe('Excel Utils', () => {
  let mockWorkbook: any;
  let mockWorksheet: any;
  let mockRow: any;
  let mockCell: any;
  let mockTmpFile: any;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();

    // Mock cell对象
    mockCell = {
      border: undefined
    };

    // Mock row对象
    mockRow = {
      font: undefined,
      alignment: undefined,
      eachCell: jest.fn((options, callback) => {
        if (typeof options === 'function') {
          callback = options;
        }
        callback(mockCell);
      })
    };

    // Mock worksheet对象
    mockWorksheet = {
      columns: undefined,
      addRows: jest.fn(),
      getRow: jest.fn().mockReturnValue(mockRow),
      eachRow: jest.fn((callback) => {
        callback(mockRow);
      })
    };

    // Mock workbook对象
    mockWorkbook = {
      addWorksheet: jest.fn().mockReturnValue(mockWorksheet),
      xlsx: {
        writeFile: jest.fn().mockResolvedValue(undefined)
      }
    };

    // Mock ExcelJS.Workbook构造函数
    mockExcelJS.Workbook = jest.fn().mockImplementation(() => mockWorkbook);

    // Mock tmp文件对象
    mockTmpFile = {
      name: '/tmp/test-file.xlsx',
      removeCallback: jest.fn()
    };

    // Mock tmp.fileSync
    mockTmp.fileSync.mockReturnValue(mockTmpFile);

    // Mock fs.readFileSync
    const mockBuffer = Buffer.from('mock excel data');
    mockFs.readFileSync.mockReturnValue(mockBuffer);
  });

  describe('createExcelFile', () => {
    const testSheetName = '测试工作表';
    const testHeaders = [
      { header: '姓名', key: 'name', width: 15 },
      { header: '年龄', key: 'age', width: 10 },
      { header: '邮箱', key: 'email', width: 25 }
    ];
    const testRows = [
      { name: '张三', age: 25, email: 'zhangsan@example.com' },
      { name: '李四', age: 30, email: 'lisi@example.com' }
    ];

    it('应该成功创建Excel文件', async () => {
      const result = await createExcelFile(testSheetName, testHeaders, testRows);

      // 验证创建了新的工作簿
      expect(mockExcelJS.Workbook).toHaveBeenCalledTimes(1);

      // 验证添加了工作表
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith(testSheetName);

      // 验证设置了列头
      expect(mockWorksheet.columns).toEqual(testHeaders);

      // 验证添加了数据行
      expect(mockWorksheet.addRows).toHaveBeenCalledWith(testRows);

      // 验证设置了表头样式
      expect(mockWorksheet.getRow).toHaveBeenCalledWith(1);
      expect(mockRow.font).toEqual({ bold: true });
      expect(mockRow.alignment).toEqual({ vertical: 'middle', horizontal: 'center' });

      // 验证设置了边框
      expect(mockWorksheet.eachRow).toHaveBeenCalled();
      expect(mockRow.eachCell).toHaveBeenCalled();
      expect(mockCell.border).toEqual({
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      });

      // 验证创建了临时文件
      expect(mockTmp.fileSync).toHaveBeenCalledTimes(1);

      // 验证写入了文件
      expect(mockWorkbook.xlsx.writeFile).toHaveBeenCalledWith(mockTmpFile.name);

      // 验证读取了文件
      expect(mockFs.readFileSync).toHaveBeenCalledWith(mockTmpFile.name);

      // 验证清理了临时文件
      expect(mockTmpFile.removeCallback).toHaveBeenCalledTimes(1);

      // 验证返回了Buffer
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe('mock excel data');
    });

    it('应该处理空数据行', async () => {
      const emptyRows: any[] = [];
      
      const result = await createExcelFile(testSheetName, testHeaders, emptyRows);

      expect(mockWorksheet.addRows).toHaveBeenCalledWith(emptyRows);
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('应该处理空表头', async () => {
      const emptyHeaders: any[] = [];
      
      const result = await createExcelFile(testSheetName, emptyHeaders, testRows);

      expect(mockWorksheet.columns).toEqual(emptyHeaders);
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('应该处理特殊字符的工作表名称', async () => {
      const specialSheetName = '测试@#$%^&*()工作表';
      
      await createExcelFile(specialSheetName, testHeaders, testRows);

      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith(specialSheetName);
    });

    it('应该处理包含特殊字符的数据', async () => {
      const specialRows = [
        { name: '张三@#$', age: 25, email: 'test@example.com' },
        { name: '李四%^&', age: 30, email: 'test2@example.com' }
      ];
      
      const result = await createExcelFile(testSheetName, testHeaders, specialRows);

      expect(mockWorksheet.addRows).toHaveBeenCalledWith(specialRows);
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('应该处理大量数据', async () => {
      const largeRows = Array.from({ length: 1000 }, (_, i) => ({
        name: `用户${i}`,
        age: 20 + (i % 50),
        email: `user${i}@example.com`
      }));
      
      const result = await createExcelFile(testSheetName, testHeaders, largeRows);

      expect(mockWorksheet.addRows).toHaveBeenCalledWith(largeRows);
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('应该处理文件写入错误', async () => {
      const writeError = new Error('文件写入失败');
      mockWorkbook.xlsx.writeFile.mockRejectedValue(writeError);

      await expect(createExcelFile(testSheetName, testHeaders, testRows))
        .rejects.toThrow('文件写入失败');
    });

    it('应该处理文件读取错误', async () => {
      const readError = new Error('文件读取失败');
      mockFs.readFileSync.mockImplementation(() => {
        throw readError;
      });

      await expect(createExcelFile(testSheetName, testHeaders, testRows))
        .rejects.toThrow('文件读取失败');
    });

    it('应该处理临时文件创建错误', async () => {
      const tmpError = new Error('临时文件创建失败');
      mockTmp.fileSync.mockImplementation(() => {
        throw tmpError;
      });

      await expect(createExcelFile(testSheetName, testHeaders, testRows))
        .rejects.toThrow('临时文件创建失败');
    });

    it('应该正确设置单元格边框样式', async () => {
      await createExcelFile(testSheetName, testHeaders, testRows);

      // 验证eachRow被调用
      expect(mockWorksheet.eachRow).toHaveBeenCalled();
      
      // 获取eachRow的回调函数并执行
      const eachRowCallback = mockWorksheet.eachRow.mock.calls[0][0];
      eachRowCallback(mockRow);

      // 验证eachCell被调用
      expect(mockRow.eachCell).toHaveBeenCalledWith({ includeEmpty: true }, expect.any(Function));
      
      // 获取eachCell的回调函数并执行
      const eachCellCallback = mockRow.eachCell.mock.calls[0][1];
      eachCellCallback(mockCell);

      // 验证边框样式被正确设置
      expect(mockCell.border).toEqual({
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      });
    });

    it('应该正确清理临时文件', async () => {
      await createExcelFile(testSheetName, testHeaders, testRows);

      // 验证临时文件被创建
      expect(mockTmp.fileSync).toHaveBeenCalledTimes(1);
      
      // 验证临时文件被清理
      expect(mockTmpFile.removeCallback).toHaveBeenCalledTimes(1);
    });

    it('应该处理包含null/undefined值的数据', async () => {
      const nullRows = [
        { name: null, age: 25, email: 'test@example.com' },
        { name: '李四', age: undefined, email: null },
        { name: '', age: 0, email: '' }
      ];
      
      const result = await createExcelFile(testSheetName, testHeaders, nullRows);

      expect(mockWorksheet.addRows).toHaveBeenCalledWith(nullRows);
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });
});
