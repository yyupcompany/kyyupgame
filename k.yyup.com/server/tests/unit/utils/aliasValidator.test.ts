/**
 * 关联别名验证工具测试
 */

import {
  validateAlias,
  registerAlias,
  resetAliasValidator,
  getRegisteredAliases,
  getConflictingAliases,
  checkAliasModelConflict,
  generateAliasReport,
  getAliasUsageStats
} from '../../../src/utils/aliasValidator';
import { vi } from 'vitest'

// 控制台错误检测变量
let consoleSpy: any

describe('AliasValidator', () => {
  let mockConsoleWarn: jest.SpyInstance;

  beforeEach(() => {
    resetAliasValidator();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (mockConsoleWarn) => {
      mockConsoleWarn.mockRestore();
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('validateAlias', () => {
    it('应该允许空别名', () => {
      const result = validateAlias('', 'User', 'Role');
      expect(result).toBe(true);
    });

    it('应该允许null别名', () => {
      const result = validateAlias(null as any, 'User', 'Role');
      expect(result).toBe(true);
    });

    it('应该允许undefined别名', () => {
      const result = validateAlias(undefined as any, 'User', 'Role');
      expect(result).toBe(true);
    });

    it('应该允许第一次使用的别名', () => {
      const result = validateAlias('userRole', 'User', 'Role');
      expect(result).toBe(true);
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('应该拒绝重复使用的别名', () => {
      // 第一次使用
      validateAlias('userRole', 'User', 'Role');
      
      // 第二次使用相同别名
      const result = validateAlias('userRole', 'Student', 'Class');
      expect(result).toBe(false);
      
      expect(mockConsoleWarn).toHaveBeenCalledWith('警告：别名 "userRole" 已被使用于 User -> Role');
      expect(mockConsoleWarn).toHaveBeenCalledWith('现在尝试在 Student -> Class 中再次使用该别名');
      expect(mockConsoleWarn).toHaveBeenCalledWith('这可能导致Sequelize抛出AssociationError错误');
    });

    it('应该记录别名使用次数', () => {
      validateAlias('userRole', 'User', 'Role');
      validateAlias('userRole', 'Student', 'Class');
      
      const stats = getAliasUsageStats();
      expect(stats['userRole']).toBe(2);
    });

    it('应该记录冲突的别名', () => {
      validateAlias('userRole', 'User', 'Role');
      validateAlias('userRole', 'Student', 'Class');
      
      const conflicts = getConflictingAliases();
      expect(conflicts['userRole']).toEqual([
        'User -> Role',
        'Student -> Class'
      ]);
    });

    it('应该处理多次冲突', () => {
      validateAlias('common', 'Model1', 'Target1');
      validateAlias('common', 'Model2', 'Target2');
      validateAlias('common', 'Model3', 'Target3');
      
      const conflicts = getConflictingAliases();
      expect(conflicts['common']).toEqual([
        'Model1 -> Target1',
        'Model2 -> Target2',
        'Model3 -> Target3'
      ]);
      
      const stats = getAliasUsageStats();
      expect(stats['common']).toBe(3);
    });
  });

  describe('registerAlias', () => {
    it('应该注册字符串模型名称', () => {
      registerAlias('User', 'Role', 'userRole');
      
      const aliases = getRegisteredAliases();
      expect(aliases['userRole']).toEqual(['User -> Role']);
    });

    it('应该注册模型类', () => {
      // Mock模型类
      const MockUserModel = { name: 'User' } as any;
      const MockRoleModel = { name: 'Role' } as any;
      
      registerAlias(MockUserModel, MockRoleModel, 'userRole');
      
      const aliases = getRegisteredAliases();
      expect(aliases['userRole']).toEqual(['User -> Role']);
    });

    it('应该处理混合类型的模型参数', () => {
      const MockUserModel = { name: 'User' } as any;
      
      registerAlias(MockUserModel, 'Role', 'userRole');
      
      const aliases = getRegisteredAliases();
      expect(aliases['userRole']).toEqual(['User -> Role']);
    });
  });

  describe('resetAliasValidator', () => {
    it('应该清除所有记录', () => {
      // 添加一些数据
      validateAlias('alias1', 'Model1', 'Target1');
      validateAlias('alias2', 'Model2', 'Target2');
      validateAlias('alias1', 'Model3', 'Target3'); // 创建冲突
      
      // 验证数据存在
      expect(Object.keys(getRegisteredAliases())).toHaveLength(2);
      expect(Object.keys(getConflictingAliases())).toHaveLength(1);
      expect(Object.keys(getAliasUsageStats())).toHaveLength(2);
      
      // 重置
      resetAliasValidator();
      
      // 验证数据已清除
      expect(Object.keys(getRegisteredAliases())).toHaveLength(0);
      expect(Object.keys(getConflictingAliases())).toHaveLength(0);
      expect(Object.keys(getAliasUsageStats())).toHaveLength(0);
    });
  });

  describe('getRegisteredAliases', () => {
    it('应该返回空对象当没有别名时', () => {
      const aliases = getRegisteredAliases();
      expect(aliases).toEqual({});
    });

    it('应该返回所有已注册的别名', () => {
      validateAlias('alias1', 'Model1', 'Target1');
      validateAlias('alias2', 'Model2', 'Target2');
      
      const aliases = getRegisteredAliases();
      expect(aliases).toEqual({
        'alias1': ['Model1 -> Target1'],
        'alias2': ['Model2 -> Target2']
      });
    });
  });

  describe('getConflictingAliases', () => {
    it('应该返回空对象当没有冲突时', () => {
      validateAlias('alias1', 'Model1', 'Target1');
      
      const conflicts = getConflictingAliases();
      expect(conflicts).toEqual({});
    });

    it('应该返回所有冲突的别名', () => {
      validateAlias('alias1', 'Model1', 'Target1');
      validateAlias('alias1', 'Model2', 'Target2');
      validateAlias('alias2', 'Model3', 'Target3');
      validateAlias('alias2', 'Model4', 'Target4');
      
      const conflicts = getConflictingAliases();
      expect(conflicts).toEqual({
        'alias1': ['Model1 -> Target1', 'Model2 -> Target2'],
        'alias2': ['Model3 -> Target3', 'Model4 -> Target4']
      });
    });
  });

  describe('checkAliasModelConflict', () => {
    it('应该允许不冲突的别名', () => {
      const modelNames = ['User', 'Role', 'Student'];
      const result = checkAliasModelConflict('userRole', modelNames);
      
      expect(result).toBe(true);
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('应该检测与模型名的冲突（大小写敏感）', () => {
      const modelNames = ['User', 'Role', 'Student'];
      const result = checkAliasModelConflict('user', modelNames);
      
      expect(result).toBe(false);
      expect(mockConsoleWarn).toHaveBeenCalledWith('警告：别名 "user" 与模型名 "User" 存在潜在冲突');
    });

    it('应该检测与模型名的冲突（大小写不敏感）', () => {
      const modelNames = ['User', 'Role', 'Student'];
      const result = checkAliasModelConflict('USER', modelNames);
      
      expect(result).toBe(false);
      expect(mockConsoleWarn).toHaveBeenCalledWith('警告：别名 "USER" 与模型名 "User" 存在潜在冲突');
    });

    it('应该处理空模型名数组', () => {
      const result = checkAliasModelConflict('anyAlias', []);
      
      expect(result).toBe(true);
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
  });

  describe('generateAliasReport', () => {
    it('应该生成基础报告结构', () => {
      const report = generateAliasReport();
      
      expect(report).toContain('# 模型别名使用报告');
      expect(report).toContain('## 重复使用的别名');
      expect(report).toContain('## 与模型名冲突的别名');
    });

    it('应该包含冲突别名信息', () => {
      validateAlias('conflictAlias', 'Model1', 'Target1');
      validateAlias('conflictAlias', 'Model2', 'Target2');
      
      const report = generateAliasReport();
      
      expect(report).toContain('### conflictAlias (使用次数: 2)');
      expect(report).toContain('- Model1 -> Target1');
      expect(report).toContain('- Model2 -> Target2');
    });

    it('应该处理没有冲突的情况', () => {
      validateAlias('uniqueAlias', 'Model1', 'Target1');
      
      const report = generateAliasReport();
      
      expect(report).toContain('# 模型别名使用报告');
      expect(report).not.toContain('uniqueAlias');
    });
  });

  describe('getAliasUsageStats', () => {
    it('应该返回空对象当没有别名使用时', () => {
      const stats = getAliasUsageStats();
      expect(stats).toEqual({});
    });

    it('应该返回正确的使用统计', () => {
      validateAlias('alias1', 'Model1', 'Target1');
      validateAlias('alias2', 'Model2', 'Target2');
      validateAlias('alias1', 'Model3', 'Target3'); // 重复使用
      
      const stats = getAliasUsageStats();
      expect(stats).toEqual({
        'alias1': 2,
        'alias2': 1
      });
    });
  });

  describe('边界情况测试', () => {
    it('应该处理特殊字符的别名', () => {
      const result = validateAlias('user-role_123', 'User', 'Role');
      expect(result).toBe(true);
      
      const aliases = getRegisteredAliases();
      expect(aliases['user-role_123']).toEqual(['User -> Role']);
    });

    it('应该处理长别名', () => {
      const longAlias = 'a'.repeat(100);
      const result = validateAlias(longAlias, 'User', 'Role');
      expect(result).toBe(true);
      
      const aliases = getRegisteredAliases();
      expect(aliases[longAlias]).toEqual(['User -> Role']);
    });

    it('应该处理Unicode字符的别名', () => {
      const result = validateAlias('用户角色', 'User', 'Role');
      expect(result).toBe(true);
      
      const aliases = getRegisteredAliases();
      expect(aliases['用户角色']).toEqual(['User -> Role']);
    });
  });
});
