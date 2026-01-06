/**
 * 别名报告生成工具测试
 */

import aliasReportGenerator from '../../../src/utils/aliasReport';
import { vi } from 'vitest'
import aliasValidator from '../../../src/utils/aliasValidator';
import fs from 'fs';
import path from 'path';

// Mock dependencies
jest.mock('../../../src/utils/aliasValidator');
jest.mock('fs');
jest.mock('path');

const mockAliasValidator = aliasValidator as jest.Mocked<typeof aliasValidator>;
const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;


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

describe('AliasReportGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockAliasValidator.getRegisteredAliases.mockReturnValue({});
    mockAliasValidator.getConflictingAliases.mockReturnValue({});
    mockAliasValidator.getAliasUsageStats.mockReturnValue({});
  });

  describe('generateReport', () => {
    it('应该生成基础报告结构', () => {
      const modelNames = ['User', 'Role'];
      const report = aliasReportGenerator.generateReport(modelNames);

      expect(report).toContain('# 模型别名使用报告');
      expect(report).toContain('## 别名冲突情况');
      expect(report).toContain('## 与模型名冲突的别名');
      expect(report).toContain('## 别名使用频率统计');
      expect(report).toContain('## 别名优化建议');
    });

    it('应该处理无冲突情况', () => {
      const modelNames = ['User', 'Role'];
      const report = aliasReportGenerator.generateReport(modelNames);

      expect(report).toContain('目前没有发现别名冲突。');
      expect(report).toContain('目前没有发现与模型名冲突的别名。');
    });

    it('应该处理别名冲突情况', () => {
      mockAliasValidator.getConflictingAliases.mockReturnValue({
        'user': ['Model1.user', 'Model2.user']
      });
      mockAliasValidator.getAliasUsageStats.mockReturnValue({
        'user': 2
      });

      const modelNames = ['User', 'Role'];
      const report = aliasReportGenerator.generateReport(modelNames);

      expect(report).toContain('### 别名: user (使用次数: 2)');
      expect(report).toContain('- Model1.user');
      expect(report).toContain('- Model2.user');
    });

    it('应该处理与模型名冲突的别名', () => {
      mockAliasValidator.getRegisteredAliases.mockReturnValue({
        'user': ['Model1.user'],
        'role': ['Model2.role']
      });

      const modelNames = ['User', 'Role'];
      const report = aliasReportGenerator.generateReport(modelNames);

      expect(report).toContain('### 别名: user');
      expect(report).toContain('Model1.user (冲突模型: User)');
      expect(report).toContain('### 别名: role');
      expect(report).toContain('Model2.role (冲突模型: Role)');
    });

    it('应该生成别名使用频率统计表格', () => {
      mockAliasValidator.getAliasUsageStats.mockReturnValue({
        'user': 5,
        'role': 3,
        'class': 1
      });

      const modelNames = ['User'];
      const report = aliasReportGenerator.generateReport(modelNames);

      expect(report).toContain('| 别名 | 使用次数 |');
      expect(report).toContain('|------|----------|');
      expect(report).toContain('| user | 5 |');
      expect(report).toContain('| role | 3 |');
      expect(report).toContain('| class | 1 |');
    });

    it('应该按使用频率降序排列别名', () => {
      mockAliasValidator.getAliasUsageStats.mockReturnValue({
        'role': 3,
        'user': 5,
        'class': 1
      });

      const modelNames = ['User'];
      const report = aliasReportGenerator.generateReport(modelNames);

      const userIndex = report.indexOf('| user | 5 |');
      const roleIndex = report.indexOf('| role | 3 |');
      const classIndex = report.indexOf('| class | 1 |');

      expect(userIndex).toBeLessThan(roleIndex);
      expect(roleIndex).toBeLessThan(classIndex);
    });

    it('应该生成高频使用别名的优化建议', () => {
      mockAliasValidator.getAliasUsageStats.mockReturnValue({
        'user': 3,
        'role': 2
      });

      const modelNames = ['User'];
      const report = aliasReportGenerator.generateReport(modelNames);

      expect(report).toContain('### 高频使用的别名');
      expect(report).toContain('- `user` (使用次数: 3)');
      expect(report).toContain('- `role` (使用次数: 2)');
      expect(report).toContain('建议替代: `relatedUser 或 userAccount`');
      expect(report).toContain('建议替代: `assignedRole 或 userRole`');
    });

    it('应该生成与模型名冲突别名的优化建议', () => {
      mockAliasValidator.getRegisteredAliases.mockReturnValue({
        'user': ['Model1.user']
      });

      const modelNames = ['User'];
      const report = aliasReportGenerator.generateReport(modelNames);

      expect(report).toContain('### 与模型名冲突的别名');
      expect(report).toContain('- `user` 与模型 `User` 冲突');
      expect(report).toContain('建议替代: `relatedUser 或 userAccount`');
    });
  });

  describe('saveReportToFile', () => {
    it('应该成功保存报告到文件', () => {
      const report = '# Test Report';
      const filePath = '/path/to/report.md';
      const dirname = '/path/to';

      mockPath.dirname.mockReturnValue(dirname);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.writeFileSync.mockImplementation(() => {});

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      aliasReportGenerator.saveReportToFile(report, filePath);

      expect(mockPath.dirname).toHaveBeenCalledWith(filePath);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(filePath, report, 'utf8');
      expect(consoleSpy).toHaveBeenCalledWith(`别名报告已保存到: ${filePath}`);

      consoleSpy.mockRestore();
    });

    it('应该创建不存在的目录', () => {
      const report = '# Test Report';
      const filePath = '/path/to/report.md';
      const dirname = '/path/to';

      mockPath.dirname.mockReturnValue(dirname);
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => '');
      mockFs.writeFileSync.mockImplementation(() => {});

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      aliasReportGenerator.saveReportToFile(report, filePath);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(dirname, { recursive: true });
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(filePath, report, 'utf8');

      consoleSpy.mockRestore();
    });

    it('应该处理文件写入错误', () => {
      const report = '# Test Report';
      const filePath = '/path/to/report.md';
      const error = new Error('Write failed');

      mockPath.dirname.mockReturnValue('/path/to');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.writeFileSync.mockImplementation(() => {
        throw error;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      aliasReportGenerator.saveReportToFile(report, filePath);

      expect(consoleSpy).toHaveBeenCalledWith('保存别名报告失败: Write failed');

      consoleSpy.mockRestore();
    });

    it('应该处理非Error类型的异常', () => {
      const report = '# Test Report';
      const filePath = '/path/to/report.md';

      mockPath.dirname.mockReturnValue('/path/to');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.writeFileSync.mockImplementation(() => {
        throw 'String error';
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      aliasReportGenerator.saveReportToFile(report, filePath);

      expect(consoleSpy).toHaveBeenCalledWith('保存别名报告失败: String error');

      consoleSpy.mockRestore();
    });
  });

  describe('suggestAlternative', () => {
    it('应该为特殊别名提供专门建议', () => {
      // 通过反射访问私有方法进行测试
      const suggestAlternative = (aliasReportGenerator as any).suggestAlternative.bind(aliasReportGenerator);

      expect(suggestAlternative('user')).toBe('relatedUser 或 userAccount');
      expect(suggestAlternative('role')).toBe('assignedRole 或 userRole');
      expect(suggestAlternative('parent')).toBe('studentParent 或 parentInfo');
      expect(suggestAlternative('class')).toBe('assignedClass 或 studentClass');
      expect(suggestAlternative('student')).toBe('enrolledStudent 或 classStudent');
      expect(suggestAlternative('teacher')).toBe('classTeacher 或 courseTeacher');
      expect(suggestAlternative('plan')).toBe('enrollmentPlan 或 activityPlan');
      expect(suggestAlternative('creator')).toBe('createdByUser 或 recordCreator');
      expect(suggestAlternative('updater')).toBe('updatedByUser 或 recordUpdater');
    });

    it('应该为普通别名提供默认建议', () => {
      const suggestAlternative = (aliasReportGenerator as any).suggestAlternative.bind(aliasReportGenerator);

      expect(suggestAlternative('custom')).toBe('customItem');
      expect(suggestAlternative('data')).toBe('dataItem');
    });

    it('应该处理大小写不敏感的特殊别名', () => {
      const suggestAlternative = (aliasReportGenerator as any).suggestAlternative.bind(aliasReportGenerator);

      expect(suggestAlternative('USER')).toBe('relatedUser 或 userAccount');
      expect(suggestAlternative('Role')).toBe('assignedRole 或 userRole');
      expect(suggestAlternative('PARENT')).toBe('studentParent 或 parentInfo');
    });
  });
});
