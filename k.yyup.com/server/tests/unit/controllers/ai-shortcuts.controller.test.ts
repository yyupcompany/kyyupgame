/**
 * AI快捷操作控制器测试
 */

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { AIShortcutsController } from '../../../src/controllers/ai-shortcuts.controller';
import { sequelize } from '../../../src/init';

// 模拟依赖
jest.mock('../../../src/init');
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));


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

describe('AIShortcutsController', () => {
  let controller: AIShortcutsController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    controller = new AIShortcutsController();
    mockRequest = {
      query: {},
      body: {},
      params: {},
      user: { id: 1, role: 'admin' }
    };
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnThis();
    mockResponse = {
      json: jsonSpy,
      status: statusSpy
    };

    // 重置所有模拟
    jest.clearAllMocks();
  });

  describe('getShortcuts', () => {
    it('应该成功获取快捷操作列表', async () => {
      const mockShortcuts = [
        {
          id: 1,
          shortcut_name: '学生查询',
          prompt_name: 'query_students',
          category: 'student',
          role: 'all',
          api_endpoint: '/api/students',
          is_active: 1,
          sort_order: 1,
          created_at: '2024-01-01'
        }
      ];

      const mockCountResult = [{ total: 1 }];

      // 模拟数据库查询
      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockShortcuts);

      mockRequest.query = {
        page: '1',
        pageSize: '10',
        role: 'admin' as any,
        category: 'student',
        is_active: 'true'
      };

      await controller.getShortcuts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledTimes(2);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        code: 200,
        message: '获取AI快捷操作列表成功',
        data: {
          list: mockShortcuts,
          pagination: {
            page: 1,
            pageSize: 10,
            total: 1,
            totalPages: 1
          }
        }
      });
    });

    it('应该处理搜索过滤', async () => {
      const mockCountResult = [{ total: 0 }];
      const mockShortcuts = [];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockShortcuts);

      mockRequest.query = {
        search: '学生',
        page: '1',
        pageSize: '10'
      };

      await controller.getShortcuts(
        mockRequest as Request,
        mockResponse as Response
      );

      // 验证搜索条件
      const countQuery = (sequelize.query as jest.Mock).mock.calls[0][0];
      expect(countQuery).toContain('shortcut_name LIKE ?');
      expect(countQuery).toContain('prompt_name LIKE ?');
      expect(countQuery).toContain('system_prompt LIKE ?');
    });

    it('应该处理分页参数', async () => {
      const mockCountResult = [{ total: 25 }];
      const mockShortcuts = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        shortcut_name: `快捷操作${i + 1}`,
        prompt_name: `shortcut_${i + 1}`,
        category: 'test',
        role: 'all',
        api_endpoint: '/api/test',
        is_active: 1,
        sort_order: i + 1,
        created_at: '2024-01-01'
      }));

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockShortcuts);

      mockRequest.query = {
        page: '2',
        pageSize: '10'
      };

      await controller.getShortcuts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        code: 200,
        message: '获取AI快捷操作列表成功',
        data: {
          list: mockShortcuts,
          pagination: {
            page: 2,
            pageSize: 10,
            total: 25,
            totalPages: 3
          }
        }
      });
    });

    it('应该处理数据库错误', async () => {
      (sequelize.query as jest.Mock).mockRejectedValue(new Error('数据库连接失败'));

      await controller.getShortcuts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        code: 500,
        message: '获取AI快捷操作列表失败',
        error: expect.any(String)
      });
    });
  });

  describe('getShortcutById', () => {
    it('应该成功获取快捷操作详情', async () => {
      const mockShortcut = {
        id: 1,
        shortcut_name: '学生查询',
        prompt_name: 'query_students',
        category: 'student',
        role: 'all',
        system_prompt: '查询学生信息',
        api_endpoint: '/api/students',
        is_active: 1,
        sort_order: 1,
        created_at: '2024-01-01'
      };

      (sequelize.query as jest.Mock).mockResolvedValue([mockShortcut]);

      mockRequest.params = { id: '1' };

      await controller.getShortcutById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM ai_shortcuts WHERE id = ?'),
        { replacements: ['1'], type: 'SELECT' }
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        code: 200,
        message: '获取AI快捷操作详情成功',
        data: mockShortcut
      });
    });

    it('应该处理快捷操作不存在的情况', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([]);

      mockRequest.params = { id: '999' };

      await controller.getShortcutById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        code: 404,
        message: 'AI快捷操作不存在'
      });
    });
  });

  describe('createShortcut', () => {
    it('应该成功创建快捷操作', async () => {
      const mockResult = [1]; // 插入ID

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce([]) // 检查是否已存在
        .mockResolvedValueOnce(mockResult); // 插入结果

      mockRequest.body = {
        shortcut_name: '新建快捷操作',
        prompt_name: 'new_shortcut',
        category: 'test',
        role: 'admin' as any,
        system_prompt: '测试提示词',
        api_endpoint: '/api/test',
        is_active: true,
        sort_order: 10
      };

      await controller.createShortcut(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO ai_shortcuts'),
        expect.objectContaining({
          replacements: expect.arrayContaining([
            '新建快捷操作',
            'new_shortcut',
            'test',
            'admin',
            '测试提示词',
            '/api/test',
            true,
            10
          ])
        })
      );

      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        code: 201,
        message: '创建AI快捷操作成功',
        data: expect.objectContaining({
          id: 1,
          shortcut_name: '新建快捷操作',
          prompt_name: 'new_shortcut'
        })
      });
    });

    it('应该处理提示词名称已存在的情况', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([{ id: 1 }]); // 已存在

      mockRequest.body = {
        shortcut_name: '测试快捷操作',
        prompt_name: 'existing_shortcut',
        category: 'test'
      };

      await controller.createShortcut(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        code: 400,
        message: '提示词名称已存在'
      });
    });
  });

  describe('updateShortcut', () => {
    it('应该成功更新快捷操作', async () => {
      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce([{ id: 1 }]) // 检查是否存在
        .mockResolvedValueOnce([]) // 检查名称冲突
        .mockResolvedValueOnce([{ id: 1, shortcut_name: '更新的快捷操作' }]); // 更新后查询

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        shortcut_name: '更新的快捷操作',
        prompt_name: 'updated_shortcut',
        category: 'updated',
        role: 'admin' as any,
        is_active: true,
        sort_order: 20
      };

      await controller.updateShortcut(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE ai_shortcuts'),
        expect.objectContaining({
          replacements: expect.arrayContaining([
            '更新的快捷操作',
            'updated_shortcut',
            'updated',
            'admin',
            true,
            20,
            '1'
          ])
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        code: 200,
        message: '更新AI快捷操作成功'
      });
    });

    it('应该处理快捷操作不存在的情况', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([]); // 不存在

      mockRequest.params = { id: '999' };
      mockRequest.body = {
        shortcut_name: '更新的快捷操作'
      };

      await controller.updateShortcut(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        code: 404,
        message: 'AI快捷操作不存在'
      });
    });

    it('应该处理没有更新字段的情况', async () => {
      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce([{ id: 1 }]) // 存在
        .mockResolvedValueOnce([]); // 无名称冲突

      mockRequest.params = { id: '1' };
      mockRequest.body = {}; // 空更新

      await controller.updateShortcut(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        code: 400,
        message: '没有提供要更新的字段'
      });
    });
  });

  describe('deleteShortcut', () => {
    it('应该成功删除快捷操作', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([{ id: 1 }]); // 存在

      mockRequest.params = { id: '1' };

      await controller.deleteShortcut(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE ai_shortcuts SET is_active = false'),
        { replacements: ['1'], type: 'UPDATE' }
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        code: 200,
        message: '删除AI快捷操作成功'
      });
    });

    it('应该处理快捷操作不存在的情况', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([]); // 不存在

      mockRequest.params = { id: '999' };

      await controller.deleteShortcut(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        code: 200,
        message: '删除AI快捷操作成功'
      });
    });
  });

  describe('getUserShortcuts', () => {
    it('应该成功获取用户可用的快捷操作', async () => {
      const mockShortcuts = [
        {
          id: 1,
          shortcut_name: '学生查询',
          prompt_name: 'query_students',
          category: 'student',
          api_endpoint: '/api/students',
          sort_order: 1
        }
      ];

      (sequelize.query as jest.Mock).mockResolvedValue(mockShortcuts);

      mockRequest.user = { role: 'teacher' };

      await controller.getUserShortcuts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE is_active = true'),
        expect.objectContaining({
          replacements: ['teacher', 'teacher']
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        code: 200,
        message: '获取用户快捷操作成功',
        data: mockShortcuts
      });
    });

    it('应该为管理员返回所有快捷操作', async () => {
      const mockShortcuts = [
        {
          id: 1,
          shortcut_name: '管理员快捷操作',
          prompt_name: 'admin_shortcut',
          category: 'admin',
          api_endpoint: '/api/admin',
          sort_order: 1
        }
      ];

      (sequelize.query as jest.Mock).mockResolvedValue(mockShortcuts);

      mockRequest.user = { role: 'admin' };

      await controller.getUserShortcuts(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('AND (role = ? OR role = \'all\' OR ? = \'admin\')'),
        expect.objectContaining({
          replacements: ['admin', 'admin']
        })
      );
    });
  });

  describe('getShortcutConfig', () => {
    it('应该成功获取快捷操作配置', async () => {
      const mockShortcut = {
        id: 1,
        shortcut_name: '学生查询',
        prompt_name: 'query_students',
        category: 'student',
        role: 'all',
        system_prompt: '查询学生信息',
        api_endpoint: '/api/students'
      };

      (sequelize.query as jest.Mock).mockResolvedValue([mockShortcut]);

      mockRequest.params = { id: '1' };
      mockRequest.user = { role: 'teacher' };

      await controller.getShortcutConfig(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ? AND is_active = true'),
        expect.objectContaining({
          replacements: ['1', 'teacher', 'teacher']
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        code: 200,
        message: '获取快捷操作配置成功',
        data: mockShortcut
      });
    });

    it('应该处理无权限访问的情况', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([]); // 无权限或不存在

      mockRequest.params = { id: '1' };
      mockRequest.user = { role: 'parent' };

      await controller.getShortcutConfig(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        code: 404,
        message: 'AI快捷操作不存在或无权限访问'
      });
    });
  });
});