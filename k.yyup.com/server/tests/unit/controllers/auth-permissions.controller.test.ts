/**
 * 认证权限控制器测试
 * 测试用户权限验证和菜单获取功能
 */

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { AuthPermissionsController } from '../../../src/controllers/auth-permissions.controller';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { Permission, Role, UserRoleModel as UserRole, RolePermission } from '../../../src/models';
import { roleCenterAccess, centerPermissionIds, roles } from '../../../src/config/role-mapping';

// Mock 依赖
jest.mock('../../../src/models');
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/config/role-mapping');

// Mock RouteCacheService
jest.mock('../../../src/services/route-cache.service', () => ({
  RouteCacheService: {
    isHealthy: jest.fn(),
    getCachedRoutes: jest.fn()
  }
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

describe('AuthPermissionsController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockResponse = {
      json: mockJson,
      status: mockStatus
    };
    mockRequest = {
      user: { id: 1, role: 'admin' }
    };

    // 重置所有 mock
    jest.clearAllMocks();
  });

  describe('getUserPermissions', () => {
    it('应该成功获取用户权限', async () => {
      // Mock 数据
      const mockUserRoles = [
        { roleId: 1, userId: 1 }
      ];
      const mockActiveRoles = [
        { id: 1, name: 'admin', status: 1 }
      ];
      const mockRolePermissions = [
        { 
          roleId: 1, 
          permissionId: 1,
          permission: { 
            id: 1, 
            name: 'dashboard', 
            status: 1 
          }
        }
      ];

      (UserRole.findAll as jest.Mock).mockResolvedValue(mockUserRoles);
      (Role.findAll as jest.Mock).mockResolvedValue(mockActiveRoles);
      (RolePermission.findAll as jest.Mock).mockResolvedValue(mockRolePermissions);
      (ApiResponse.success as jest.Mock).mockImplementation((res, data, message) => {
        res.json?.({ success: true, data, message });
      });

      await AuthPermissionsController.getUserPermissions(mockRequest as Request, mockResponse as Response);

      expect(UserRole.findAll).toHaveBeenCalledWith({
        where: { userId: 1 }
      });
      expect(Role.findAll).toHaveBeenCalledWith({
        where: { id: [1], status: 1 }
      });
      expect(RolePermission.findAll).toHaveBeenCalledWith({
        where: { roleId: [1] },
        include: [
          {
            model: Permission,
            as: 'permission',
            where: { status: 1 }
          }
        ]
      });
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        [{ id: 1, name: 'dashboard', status: 1 }],
        '获取用户权限成功'
      );
    });

    it('应该处理未登录用户', async () => {
      mockRequest.user = undefined;

      await AuthPermissionsController.getUserPermissions(mockRequest as Request, mockResponse as Response);

      expect(ApiResponse.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        '用户未登录'
      );
    });

    it('应该处理用户没有分配角色的情况', async () => {
      (UserRole.findAll as jest.Mock).mockResolvedValue([]);
      (ApiResponse.success as jest.Mock).mockImplementation((res, data, message) => {
        res.json?.({ success: true, data, message });
      });

      await AuthPermissionsController.getUserPermissions(mockRequest as Request, mockResponse as Response);

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        [],
        '用户没有分配角色'
      );
    });

    it('应该处理用户没有激活角色的情况', async () => {
      const mockUserRoles = [{ roleId: 1, userId: 1 }];
      (UserRole.findAll as jest.Mock).mockResolvedValue(mockUserRoles);
      (Role.findAll as jest.Mock).mockResolvedValue([]);
      (ApiResponse.success as jest.Mock).mockImplementation((res, data, message) => {
        res.json?.({ success: true, data, message });
      });

      await AuthPermissionsController.getUserPermissions(mockRequest as Request, mockResponse as Response);

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        [],
        '用户没有激活的角色'
      );
    });

    it('应该处理数据库错误', async () => {
      const error = new Error('Database error');
      (UserRole.findAll as jest.Mock).mockRejectedValue(error);
      (ApiResponse.handleError as jest.Mock).mockImplementation((res, error, message) => {
        res.status(500).json({ success: false, message, error: error.message });
      });

      await AuthPermissionsController.getUserPermissions(mockRequest as Request, mockResponse as Response);

      expect(ApiResponse.handleError).toHaveBeenCalledWith(
        mockResponse,
        error,
        '获取用户权限失败'
      );
    });
  });

  describe('getUserMenu', () => {
    beforeEach(() => {
      // Mock role mapping 配置
      (roleCenterAccess as any).mockReturnValue({
        admin: [
          { center: 'dashboard', permissions: [3001, 30011, 30012] },
          { center: 'personnel', permissions: [3002, 30021, 30022] }
        ]
      });
      (centerPermissionIds as any).mockReturnValue({
        dashboard: [3001, 30011, 30012],
        personnel: [3002, 30021, 30022]
      });
      (roles as any).ADMIN = 'admin';
    });

    it('应该成功从缓存获取用户菜单', async () => {
      const { RouteCacheService } = require('../../../src/services/route-cache.service');
      
      // Mock 缓存服务
      (RouteCacheService.isHealthy as jest.Mock).mockReturnValue(true);
      (RouteCacheService.getCachedRoutes as jest.Mock).mockReturnValue([
        { id: 3001, name: '仪表盘中心', status: 1, type: 'menu', path: '/dashboard', sort: 1 },
        { id: 30011, name: '数据概览', status: 1, type: 'menu', path: '/dashboard', parentId: 3001, sort: 1 }
      ]);

      await AuthPermissionsController.getUserMenu(mockRequest as Request, mockResponse as Response);

      expect(RouteCacheService.isHealthy).toHaveBeenCalled();
      expect(RouteCacheService.getCachedRoutes).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              id: 3001,
              name: '仪表盘中心',
              path: '/dashboard'
            })
          ]),
          message: '获取用户菜单成功',
          meta: expect.objectContaining({
            userId: 1,
            userRole: 'admin',
            fromCache: true
          })
        })
      );
    });

    it('应该从数据库获取用户菜单（缓存不健康）', async () => {
      const { RouteCacheService } = require('../../../src/services/route-cache.service');
      
      // Mock 缓存不健康
      (RouteCacheService.isHealthy as jest.Mock).mockReturnValue(false);

      // Mock 数据库数据
      const mockUserRoles = [
        { roleId: 1, userId: 1, role: { id: 1, code: 'admin', status: 1 } }
      ];
      const mockPermissions = [
        { 
          id: 3001, 
          name: '仪表盘中心', 
          status: 1, 
          type: 'menu', 
          path: '/dashboard', 
          sort: 1,
          parentId: null
        },
        { 
          id: 30011, 
          name: '数据概览', 
          status: 1, 
          type: 'menu', 
          path: '/dashboard', 
          sort: 1,
          parentId: 3001
        }
      ];

      (UserRole.findAll as jest.Mock).mockResolvedValue(mockUserRoles);
      (Permission.findAll as jest.Mock).mockResolvedValue(mockPermissions);

      await AuthPermissionsController.getUserMenu(mockRequest as Request, mockResponse as Response);

      expect(Permission.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 1,
          type: { [expect.any(String)]: ['menu', 'category'] }
        })
      });
    });

    it('应该处理非管理员用户的菜单获取', async () => {
      const { RouteCacheService } = require('../../../src/services/route-cache.service');
      
      mockRequest.user = { id: 2, role: 'teacher' };
      (RouteCacheService.isHealthy as jest.Mock).mockReturnValue(false);

      const mockUserRoles = [{ roleId: 2, userId: 2 }];
      const mockActiveRoles = [{ id: 2, name: 'teacher', status: 1 }];
      const mockRolePermissions = [
        { 
          roleId: 2, 
          permissionId: 3002,
          permission: { 
            id: 3002, 
            name: '人事中心', 
            status: 1, 
            type: 'menu',
            path: '/personnel',
            sort: 2,
            parentId: null
          }
        }
      ];

      (UserRole.findAll as jest.Mock).mockResolvedValue(mockUserRoles);
      (Role.findAll as jest.Mock).mockResolvedValue(mockActiveRoles);
      (RolePermission.findAll as jest.Mock).mockResolvedValue(mockRolePermissions);

      await AuthPermissionsController.getUserMenu(mockRequest as Request, mockResponse as Response);

      expect(RolePermission.findAll).toHaveBeenCalledWith({
        where: { roleId: [2] },
        include: [
          {
            model: Permission,
            as: 'permission',
            where: {
              status: 1,
              type: { [expect.any(String)]: ['menu', 'category'] },
              id: { [expect.any(String)]: expect.any(Array) }
            }
          }
        ]
      });
    });

    it('应该使用 fallback 菜单数据当发生错误时', async () => {
      const { RouteCacheService } = require('../../../src/services/route-cache.service');
      
      (RouteCacheService.isHealthy as jest.Mock).mockReturnValue(false);
      (UserRole.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));
      (ApiResponse.success as jest.Mock).mockImplementation((res, data, message) => {
        res.json?.({ success: true, data, message });
      });

      await AuthPermissionsController.getUserMenu(mockRequest as Request, mockResponse as Response);

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.arrayContaining([
          expect.objectContaining({
            id: 3001,
            name: '仪表盘中心',
            path: '/dashboard'
          })
        ]),
        '获取用户菜单成功（使用默认数据）'
      );
    });

    it('应该正确构建菜单树结构', async () => {
      const { RouteCacheService } = require('../../../src/services/route-cache.service');
      
      (RouteCacheService.isHealthy as jest.Mock).mockReturnValue(true);
      (RouteCacheService.getCachedRoutes as jest.Mock).mockReturnValue([
        { id: 3001, name: '仪表盘中心', status: 1, type: 'menu', path: '/dashboard', sort: 1, parentId: null },
        { id: 30011, name: '数据概览', status: 1, type: 'menu', path: '/dashboard', sort: 1, parentId: 3001 },
        { id: 30012, name: '实时监控', status: 1, type: 'menu', path: '/dashboard/real-time', sort: 2, parentId: 3001 }
      ]);

      await AuthPermissionsController.getUserMenu(mockRequest as Request, mockResponse as Response);

      const responseData = mockJson.mock.calls[0][0];
      const menuTree = responseData.data;

      expect(menuTree).toHaveLength(1);
      expect(menuTree[0]).toMatchObject({
        id: 3001,
        name: '仪表盘中心',
        path: '/dashboard',
        children: expect.arrayContaining([
          expect.objectContaining({ id: 30011, name: '数据概览' }),
          expect.objectContaining({ id: 30012, name: '实时监控' })
        ])
      });
    });
  });

  describe('checkPermission', () => {
    it('应该成功验证用户权限', async () => {
      mockRequest.body = { path: '/dashboard' };

      const mockUserRoles = [{ roleId: 1, userId: 1 }];
      const mockActiveRoles = [{ id: 1, name: 'admin', status: 1 }];
      const mockPermission = { id: 1, status: 1, path: '/dashboard' };
      const mockRolePermission = { roleId: 1, permissionId: 1 };

      (UserRole.findAll as jest.Mock).mockResolvedValue(mockUserRoles);
      (Role.findAll as jest.Mock).mockResolvedValue(mockActiveRoles);
      (Permission.findOne as jest.Mock).mockResolvedValue(mockPermission);
      (RolePermission.findOne as jest.Mock).mockResolvedValue(mockRolePermission);
      (ApiResponse.success as jest.Mock).mockImplementation((res, data, message) => {
        res.json?.({ success: true, data, message });
      });

      await AuthPermissionsController.checkPermission(mockRequest as Request, mockResponse as Response);

      expect(Permission.findOne).toHaveBeenCalledWith({
        where: { status: 1, path: '/dashboard' }
      });
      expect(RolePermission.findOne).toHaveBeenCalledWith({
        where: { roleId: [1], permissionId: 1 }
      });
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        { hasPermission: true, path: '/dashboard', userId: 1 },
        '权限检查完成'
      );
    });

    it('应该处理未登录用户', async () => {
      mockRequest.user = undefined;
      mockRequest.body = { path: '/dashboard' };

      await AuthPermissionsController.checkPermission(mockRequest as Request, mockResponse as Response);

      expect(ApiResponse.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        '用户未登录'
      );
    });

    it('应该处理缺少路径参数', async () => {
      mockRequest.body = {};

      await AuthPermissionsController.checkPermission(mockRequest as Request, mockResponse as Response);

      expect(ApiResponse.badRequest).toHaveBeenCalledWith(
        mockResponse,
        '路径参数不能为空'
      );
    });

    it('应该处理权限路径不存在的情况', async () => {
      mockRequest.body = { path: '/nonexistent' };

      const mockUserRoles = [{ roleId: 1, userId: 1 }];
      const mockActiveRoles = [{ id: 1, name: 'admin', status: 1 }];

      (UserRole.findAll as jest.Mock).mockResolvedValue(mockUserRoles);
      (Role.findAll as jest.Mock).mockResolvedValue(mockActiveRoles);
      (Permission.findOne as jest.Mock).mockResolvedValue(null);
      (ApiResponse.success as jest.Mock).mockImplementation((res, data, message) => {
        res.json?.({ success: true, data, message });
      });

      await AuthPermissionsController.checkPermission(mockRequest as Request, mockResponse as Response);

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        { hasPermission: false },
        '权限路径不存在'
      );
    });

    it('应该处理用户没有权限的情况', async () => {
      mockRequest.body = { path: '/dashboard' };

      const mockUserRoles = [{ roleId: 1, userId: 1 }];
      const mockActiveRoles = [{ id: 1, name: 'admin', status: 1 }];
      const mockPermission = { id: 1, status: 1, path: '/dashboard' };

      (UserRole.findAll as jest.Mock).mockResolvedValue(mockUserRoles);
      (Role.findAll as jest.Mock).mockResolvedValue(mockActiveRoles);
      (Permission.findOne as jest.Mock).mockResolvedValue(mockPermission);
      (RolePermission.findOne as jest.Mock).mockResolvedValue(null);
      (ApiResponse.success as jest.Mock).mockImplementation((res, data, message) => {
        res.json?.({ success: true, data, message });
      });

      await AuthPermissionsController.checkPermission(mockRequest as Request, mockResponse as Response);

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        { hasPermission: false, path: '/dashboard', userId: 1 },
        '权限检查完成'
      );
    });
  });

  describe('getUserRoles', () => {
    it('应该成功获取用户角色', async () => {
      const mockUserRoles = [{ roleId: 1, userId: 1 }];
      const mockRoles = [
        { id: 1, name: 'admin', status: 1, description: '系统管理员' }
      ];

      (UserRole.findAll as jest.Mock).mockResolvedValue(mockUserRoles);
      (Role.findAll as jest.Mock).mockResolvedValue(mockRoles);
      (ApiResponse.success as jest.Mock).mockImplementation((res, data, message) => {
        res.json?.({ success: true, data, message });
      });

      await AuthPermissionsController.getUserRoles(mockRequest as Request, mockResponse as Response);

      expect(UserRole.findAll).toHaveBeenCalledWith({
        where: { userId: 1 }
      });
      expect(Role.findAll).toHaveBeenCalledWith({
        where: { id: [1], status: 1 }
      });
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        mockRoles,
        '获取用户角色成功'
      );
    });

    it('应该处理未登录用户', async () => {
      mockRequest.user = undefined;

      await AuthPermissionsController.getUserRoles(mockRequest as Request, mockResponse as Response);

      expect(ApiResponse.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        '用户未登录'
      );
    });

    it('应该处理用户没有分配角色的情况', async () => {
      (UserRole.findAll as jest.Mock).mockResolvedValue([]);
      (ApiResponse.success as jest.Mock).mockImplementation((res, data, message) => {
        res.json?.({ success: true, data, message });
      });

      await AuthPermissionsController.getUserRoles(mockRequest as Request, mockResponse as Response);

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        [],
        '用户没有分配角色'
      );
    });

    it('应该使用 fallback 角色数据当发生错误时', async () => {
      (UserRole.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));
      (ApiResponse.success as jest.Mock).mockImplementation((res, data, message) => {
        res.json?.({ success: true, data, message });
      });

      await AuthPermissionsController.getUserRoles(mockRequest as Request, mockResponse as Response);

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            name: 'admin',
            displayName: '系统管理员'
          })
        ]),
        '获取用户角色成功（使用默认数据）'
      );
    });
  });

  describe('buildMenuTree (私有方法)', () => {
    it('应该正确构建菜单树结构', () => {
      const permissions = [
        { id: 1, name: '仪表盘中心', path: '/dashboard', component: 'Dashboard', icon: 'dashboard', sort: 1 },
        { id: 2, name: '数据概览', path: '/dashboard', component: 'DashboardOverview', icon: 'chart', sort: 1, parentId: 1 },
        { id: 3, name: '实时监控', path: '/dashboard/real-time', component: 'RealTimeMonitor', icon: 'monitor', sort: 2, parentId: 1 }
      ];

      // 由于是私有方法，我们需要通过反射调用
      const buildMenuTree = (AuthPermissionsController as any).buildMenuTree;
      const menuTree = buildMenuTree(permissions);

      expect(menuTree).toHaveLength(3); // 所有权限都会被包含在结果中
      expect(menuTree[0]).toMatchObject({
        id: 1,
        name: '仪表盘中心',
        path: '/dashboard',
        icon: 'dashboard',
        sort: 1,
        children: []
      });
    });

    it('应该按排序字段对菜单项进行排序', () => {
      const permissions = [
        { id: 1, name: '第二个', path: '/second', component: 'Second', icon: 'second', sort: 2 },
        { id: 2, name: '第一个', path: '/first', component: 'First', icon: 'first', sort: 1 },
        { id: 3, name: '第三个', path: '/third', component: 'Third', icon: 'third', sort: 3 }
      ];

      const buildMenuTree = (AuthPermissionsController as any).buildMenuTree;
      const menuTree = buildMenuTree(permissions);

      expect(menuTree[0].name).toBe('第一个');
      expect(menuTree[1].name).toBe('第二个');
      expect(menuTree[2].name).toBe('第三个');
    });
  });
});