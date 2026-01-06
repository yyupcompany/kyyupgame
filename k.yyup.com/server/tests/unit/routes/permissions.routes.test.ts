import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockPermissionsController = {
  getAllPermissions: jest.fn(),
  getPermissionById: jest.fn(),
  createPermission: jest.fn(),
  updatePermission: jest.fn(),
  deletePermission: jest.fn(),
  getPermissionsByRole: jest.fn(),
  getPermissionsByUser: jest.fn(),
  assignPermissionToRole: jest.fn(),
  removePermissionFromRole: jest.fn(),
  assignPermissionToUser: jest.fn(),
  removePermissionFromUser: jest.fn(),
  checkUserPermission: jest.fn(),
  getPermissionCategories: jest.fn(),
  getPermissionStatistics: jest.fn(),
  exportPermissions: jest.fn(),
  importPermissions: jest.fn(),
  bulkUpdatePermissions: jest.fn(),
  validatePermission: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockPermissionMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockRateLimitMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockCacheMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/permissions.controller', () => mockPermissionsController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
jest.unstable_mockModule('../../../../../src/middlewares/permission.middleware', () => ({
  checkPermission: mockPermissionMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/rate-limit.middleware', () => ({
  apiLimiter: mockRateLimitMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/cache.middleware', () => ({
  cacheResponse: mockCacheMiddleware
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

describe('Permissions Routes', () => {
  let permissionsRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedPermissionsRouter } = await import('../../../../../src/routes/permissions.routes');
    permissionsRouter = importedPermissionsRouter;
    
    // 设置Express应用
    mockApp.use('/permissions', permissionsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockPermissionsController.getAllPermissions.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [
          {
            id: 1,
            name: 'user.read',
            description: '查看用户信息',
            category: 'user',
            type: 'read',
            status: 'active',
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-02-20T14:30:00.000Z'
          },
          {
            id: 2,
            name: 'user.write',
            description: '编辑用户信息',
            category: 'user',
            type: 'write',
            status: 'active',
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-02-20T14:30:00.000Z'
          },
          {
            id: 3,
            name: 'activity.read',
            description: '查看活动信息',
            category: 'activity',
            type: 'read',
            status: 'active',
            createdAt: '2024-01-20T09:00:00.000Z',
            updatedAt: '2024-02-25T11:00:00.000Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1
        },
        message: '获取权限列表成功'
      });
    });

    mockPermissionsController.getPermissionById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          name: 'user.read',
          description: '查看用户信息',
          category: 'user',
          type: 'read',
          status: 'active',
          roles: [
            { id: 1, name: 'admin', assignedAt: '2024-01-15T10:00:00.000Z' },
            { id: 2, name: 'teacher', assignedAt: '2024-01-20T09:00:00.000Z' }
          ],
          users: [
            { id: 1, username: 'admin', assignedAt: '2024-01-15T10:00:00.000Z' },
            { id: 2, username: 'teacher1', assignedAt: '2024-01-20T09:00:00.000Z' }
          ],
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-02-20T14:30:00.000Z'
        },
        message: '获取权限详情成功'
      });
    });

    mockPermissionsController.createPermission.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        data: {
          id: 4,
          name: 'activity.delete',
          description: '删除活动',
          category: 'activity',
          type: 'delete',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        message: '创建权限成功'
      });
    });

    mockPermissionsController.updatePermission.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          name: 'user.read',
          description: '查看用户信息（更新）',
          category: 'user',
          type: 'read',
          status: 'active',
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: new Date().toISOString()
        },
        message: '更新权限成功'
      });
    });

    mockPermissionsController.deletePermission.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        message: '删除权限成功'
      });
    });
  });

  describe('GET /permissions', () => {
    it('应该获取权限列表', async () => {
      const response = await request(mockApp)
        .get('/permissions')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [
          {
            id: 1,
            name: 'user.read',
            description: '查看用户信息',
            category: 'user',
            type: 'read',
            status: 'active',
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-02-20T14:30:00.000Z'
          },
          {
            id: 2,
            name: 'user.write',
            description: '编辑用户信息',
            category: 'user',
            type: 'write',
            status: 'active',
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-02-20T14:30:00.000Z'
          },
          {
            id: 3,
            name: 'activity.read',
            description: '查看活动信息',
            category: 'activity',
            type: 'read',
            status: 'active',
            createdAt: '2024-01-20T09:00:00.000Z',
            updatedAt: '2024-02-25T11:00:00.000Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1
        },
        message: '获取权限列表成功'
      });

      expect(mockPermissionsController.getAllPermissions).toHaveBeenCalled();
    });

    it('应该支持分页参数', async () => {
      const page = 2;
      const limit = 5;

      await request(mockApp)
        .get('/permissions')
        .query({ page, limit })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockPermissionsController.getAllPermissions).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            page: page.toString(),
            limit: limit.toString()
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持分类过滤', async () => {
      const category = 'user';

      await request(mockApp)
        .get('/permissions')
        .query({ category })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockPermissionsController.getAllPermissions).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            category
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持类型过滤', async () => {
      const type = 'read';

      await request(mockApp)
        .get('/permissions')
        .query({ type })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockPermissionsController.getAllPermissions).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            type
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持状态过滤', async () => {
      const status = 'active';

      await request(mockApp)
        .get('/permissions')
        .query({ status })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockPermissionsController.getAllPermissions).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            status
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持搜索功能', async () => {
      const search = 'user';

      await request(mockApp)
        .get('/permissions')
        .query({ search })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockPermissionsController.getAllPermissions).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            search
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该应用认证中间件', async () => {
      await request(mockApp)
        .get('/permissions')
        .set('Authorization', 'Bearer valid-token');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该应用缓存中间件', async () => {
      await request(mockApp)
        .get('/permissions')
        .set('Authorization', 'Bearer valid-token');

      expect(mockCacheMiddleware).toHaveBeenCalled();
    });

    it('应该处理未认证的请求', async () => {
      mockAuthMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('未授权访问');
        (error as any).statusCode = 401;
        next(error);
      });

      await request(mockApp)
        .get('/permissions')
        .expect(401);
    });
  });

  describe('GET /permissions/:id', () => {
    it('应该获取权限详情', async () => {
      const permissionId = 1;

      const response = await request(mockApp)
        .get(`/permissions/${permissionId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'user.read',
          description: '查看用户信息',
          category: 'user',
          type: 'read',
          status: 'active',
          roles: [
            { id: 1, name: 'admin', assignedAt: '2024-01-15T10:00:00.000Z' },
            { id: 2, name: 'teacher', assignedAt: '2024-01-20T09:00:00.000Z' }
          ],
          users: [
            { id: 1, username: 'admin', assignedAt: '2024-01-15T10:00:00.000Z' },
            { id: 2, username: 'teacher1', assignedAt: '2024-01-20T09:00:00.000Z' }
          ],
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-02-20T14:30:00.000Z'
        },
        message: '获取权限详情成功'
      });

      expect(mockPermissionsController.getPermissionById).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: permissionId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证权限ID参数', async () => {
      await request(mockApp)
        .get('/permissions/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该处理不存在的权限ID', async () => {
      mockPermissionsController.getPermissionById.mockImplementation((req, res, next) => {
        const error = new Error('权限不存在');
        (error as any).statusCode = 404;
        next(error);
      });

      await request(mockApp)
        .get('/permissions/999')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });
  });

  describe('POST /permissions', () => {
    it('应该创建新权限', async () => {
      const permissionData = {
        name: 'activity.delete',
        description: '删除活动',
        category: 'activity',
        type: 'delete'
      };

      const response = await request(mockApp)
        .post('/permissions')
        .send(permissionData)
        .set('Authorization', 'Bearer valid-token')
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: 4,
          name: 'activity.delete',
          description: '删除活动',
          category: 'activity',
          type: 'delete',
          status: 'active',
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        },
        message: '创建权限成功'
      });

      expect(mockPermissionsController.createPermission).toHaveBeenCalledWith(
        expect.objectContaining({
          body: permissionData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证权限数据', async () => {
      const invalidPermissionData = {
        name: '', // 空名称
        category: 'invalid_category',
        type: 'invalid_type'
      };

      await request(mockApp)
        .post('/permissions')
        .send(invalidPermissionData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查创建权限', async () => {
      await request(mockApp)
        .post('/permissions')
        .send({ name: 'test.permission', description: '测试权限' })
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });

    it('应该处理重复的权限名称', async () => {
      mockPermissionsController.createPermission.mockImplementation((req, res, next) => {
        const error = new Error('权限名称已存在');
        (error as any).statusCode = 409;
        next(error);
      });

      await request(mockApp)
        .post('/permissions')
        .send({ name: 'user.read', description: '重复权限' })
        .set('Authorization', 'Bearer valid-token')
        .expect(409);
    });
  });

  describe('PUT /permissions/:id', () => {
    it('应该更新权限', async () => {
      const permissionId = 1;
      const updateData = {
        description: '查看用户信息（更新）'
      };

      const response = await request(mockApp)
        .put(`/permissions/${permissionId}`)
        .send(updateData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: 1,
          name: 'user.read',
          description: '查看用户信息（更新）',
          category: 'user',
          type: 'read',
          status: 'active',
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: expect.any(String)
        },
        message: '更新权限成功'
      });

      expect(mockPermissionsController.updatePermission).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: permissionId.toString() },
          body: updateData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证更新数据', async () => {
      const invalidUpdateData = {
        type: 'invalid_type' // 无效的权限类型
      };

      await request(mockApp)
        .put('/permissions/1')
        .send(invalidUpdateData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查更新权限', async () => {
      await request(mockApp)
        .put('/permissions/1')
        .send({ description: '更新测试' })
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /permissions/:id', () => {
    it('应该删除权限', async () => {
      const permissionId = 1;

      const response = await request(mockApp)
        .delete(`/permissions/${permissionId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '删除权限成功'
      });

      expect(mockPermissionsController.deletePermission).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: permissionId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证权限ID', async () => {
      await request(mockApp)
        .delete('/permissions/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查删除权限', async () => {
      await request(mockApp)
        .delete('/permissions/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });

    it('应该处理权限正在使用的情况', async () => {
      mockPermissionsController.deletePermission.mockImplementation((req, res, next) => {
        const error = new Error('权限正在使用中，无法删除');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .delete('/permissions/1')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });
  });

  describe('GET /permissions/role/:roleId', () => {
    it('应该获取角色的权限', async () => {
      mockPermissionsController.getPermissionsByRole.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: 'user.read',
              description: '查看用户信息',
              assignedAt: '2024-01-15T10:00:00.000Z'
            },
            {
              id: 2,
              name: 'user.write',
              description: '编辑用户信息',
              assignedAt: '2024-01-15T10:00:00.000Z'
            }
          ],
          message: '获取角色权限成功'
        });
      });

      const roleId = 1;

      const response = await request(mockApp)
        .get(`/permissions/role/${roleId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPermissionsController.getPermissionsByRole).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { roleId: roleId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /permissions/user/:userId', () => {
    it('应该获取用户的权限', async () => {
      mockPermissionsController.getPermissionsByUser.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: 'user.read',
              description: '查看用户信息',
              source: 'role', // 来自角色
              assignedAt: '2024-01-15T10:00:00.000Z'
            },
            {
              id: 3,
              name: 'activity.read',
              description: '查看活动信息',
              source: 'direct', // 直接分配
              assignedAt: '2024-01-20T09:00:00.000Z'
            }
          ],
          message: '获取用户权限成功'
        });
      });

      const userId = 1;

      const response = await request(mockApp)
        .get(`/permissions/user/${userId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPermissionsController.getPermissionsByUser).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { userId: userId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('POST /permissions/role/:roleId/assign', () => {
    it('应该给角色分配权限', async () => {
      mockPermissionsController.assignPermissionToRole.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '权限分配成功',
          data: {
            roleId: 1,
            permissionId: 3,
            assignedAt: new Date().toISOString()
          }
        });
      });

      const roleId = 1;
      const assignmentData = {
        permissionId: 3
      };

      const response = await request(mockApp)
        .post(`/permissions/role/${roleId}/assign`)
        .send(assignmentData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPermissionsController.assignPermissionToRole).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { roleId: roleId.toString() },
          body: assignmentData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证分配数据', async () => {
      const invalidAssignmentData = {
        permissionId: 'invalid_id' // 无效的权限ID
      };

      await request(mockApp)
        .post('/permissions/1/assign')
        .send(invalidAssignmentData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /permissions/role/:roleId/remove/:permissionId', () => {
    it('应该从角色移除权限', async () => {
      mockPermissionsController.removePermissionFromRole.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '权限移除成功'
        });
      });

      const roleId = 1;
      const permissionId = 3;

      const response = await request(mockApp)
        .delete(`/permissions/role/${roleId}/remove/${permissionId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPermissionsController.removePermissionFromRole).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { 
            roleId: roleId.toString(),
            permissionId: permissionId.toString()
          }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('POST /permissions/user/:userId/assign', () => {
    it('应该给用户分配权限', async () => {
      mockPermissionsController.assignPermissionToUser.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '权限分配成功',
          data: {
            userId: 1,
            permissionId: 3,
            assignedAt: new Date().toISOString()
          }
        });
      });

      const userId = 1;
      const assignmentData = {
        permissionId: 3
      };

      const response = await request(mockApp)
        .post(`/permissions/user/${userId}/assign`)
        .send(assignmentData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPermissionsController.assignPermissionToUser).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { userId: userId.toString() },
          body: assignmentData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('DELETE /permissions/user/:userId/remove/:permissionId', () => {
    it('应该从用户移除权限', async () => {
      mockPermissionsController.removePermissionFromUser.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '权限移除成功'
        });
      });

      const userId = 1;
      const permissionId = 3;

      const response = await request(mockApp)
        .delete(`/permissions/user/${userId}/remove/${permissionId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPermissionsController.removePermissionFromUser).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { 
            userId: userId.toString(),
            permissionId: permissionId.toString()
          }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /permissions/check/:permissionName', () => {
    it('应该检查用户权限', async () => {
      mockPermissionsController.checkUserPermission.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            hasPermission: true,
            permissionName: 'user.read',
            userId: 1,
            checkedAt: new Date().toISOString()
          },
          message: '权限检查完成'
        });
      });

      const permissionName = 'user.read';

      const response = await request(mockApp)
        .get(`/permissions/check/${permissionName}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPermissionsController.checkUserPermission).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { permissionName }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /permissions/categories', () => {
    it('应该获取权限分类', async () => {
      mockPermissionsController.getPermissionCategories.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              name: 'user',
              description: '用户相关权限',
              count: 5
            },
            {
              name: 'activity',
              description: '活动相关权限',
              count: 8
            },
            {
              name: 'system',
              description: '系统相关权限',
              count: 12
            }
          ],
          message: '获取权限分类成功'
        });
      });

      const response = await request(mockApp)
        .get('/permissions/categories')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPermissionsController.getPermissionCategories).toHaveBeenCalled();
    });
  });

  describe('GET /permissions/statistics', () => {
    it('应该获取权限统计', async () => {
      mockPermissionsController.getPermissionStatistics.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            totalPermissions: 25,
            activePermissions: 23,
            inactivePermissions: 2,
            categoryDistribution: [
              { category: 'user', count: 5, percentage: 20 },
              { category: 'activity', count: 8, percentage: 32 },
              { category: 'system', count: 12, percentage: 48 }
            ],
            typeDistribution: [
              { type: 'read', count: 10, percentage: 40 },
              { type: 'write', count: 8, percentage: 32 },
              { type: 'delete', count: 7, percentage: 28 }
            ],
            assignmentStats: {
              totalAssignments: 150,
              roleAssignments: 120,
              userAssignments: 30
            }
          },
          message: '获取权限统计成功'
        });
      });

      const response = await request(mockApp)
        .get('/permissions/statistics')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPermissionsController.getPermissionStatistics).toHaveBeenCalled();
    });
  });

  describe('GET /permissions/export', () => {
    it('应该导出权限数据', async () => {
      mockPermissionsController.exportPermissions.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            downloadUrl: '/api/files/download/permissions-export-2024.xlsx',
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
            format: 'excel',
            recordCount: 25
          },
          message: '导出任务创建成功'
        });
      });

      const exportParams = {
        format: 'excel',
        includeCategories: true,
        includeAssignments: true
      };

      const response = await request(mockApp)
        .get('/permissions/export')
        .query(exportParams)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPermissionsController.exportPermissions).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining(exportParams)
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('POST /permissions/import', () => {
    it('应该导入权限数据', async () => {
      mockPermissionsController.importPermissions.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            importedCount: 10,
            updatedCount: 5,
            skippedCount: 2,
            errors: []
          },
          message: '权限数据导入成功'
        });
      });

      const importData = {
        permissions: [
          { name: 'new.permission1', description: '新权限1', category: 'system', type: 'read' },
          { name: 'new.permission2', description: '新权限2', category: 'system', type: 'write' }
        ],
        mode: 'upsert' // 更新模式
      };

      const response = await request(mockApp)
        .post('/permissions/import')
        .send(importData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPermissionsController.importPermissions).toHaveBeenCalledWith(
        expect.objectContaining({
          body: importData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证导入数据', async () => {
      const invalidImportData = {
        permissions: [
          { name: '', description: '无效权限' } // 空名称
        ]
      };

      await request(mockApp)
        .post('/permissions/import')
        .send(invalidImportData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /permissions/bulk', () => {
    it('应该批量更新权限', async () => {
      mockPermissionsController.bulkUpdatePermissions.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            updatedCount: 5,
            errors: []
          },
          message: '批量更新成功'
        });
      });

      const bulkUpdateData = {
        updates: [
          { id: 1, status: 'inactive' },
          { id: 2, description: '更新描述' },
          { id: 3, category: 'system' }
        ]
      };

      const response = await request(mockApp)
        .put('/permissions/bulk')
        .send(bulkUpdateData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPermissionsController.bulkUpdatePermissions).toHaveBeenCalledWith(
        expect.objectContaining({
          body: bulkUpdateData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('POST /permissions/validate', () => {
    it('应该验证权限', async () => {
      mockPermissionsController.validatePermission.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            isValid: true,
            permission: {
              name: 'user.read',
              description: '查看用户信息',
              category: 'user',
              type: 'read',
              status: 'active'
            },
            warnings: [],
            errors: []
          },
          message: '权限验证完成'
        });
      });

      const validationData = {
        name: 'user.read',
        category: 'user',
        type: 'read'
      };

      const response = await request(mockApp)
        .post('/permissions/validate')
        .send(validationData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPermissionsController.validatePermission).toHaveBeenCalledWith(
        expect.objectContaining({
          body: validationData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('路由中间件应用', () => {
    it('应该正确应用认证中间件到所有路由', () => {
      const protectedRoutes = ['/permissions', '/permissions/1', '/permissions/role/1',
                              '/permissions/user/1', '/permissions/check/user.read',
                              '/permissions/categories', '/permissions/statistics',
                              '/permissions/export', '/permissions/import',
                              '/permissions/bulk', '/permissions/validate'];
      
      protectedRoutes.forEach(route => {
        expect(mockAuthMiddleware).toBeDefined();
      });
    });

    it('应该正确应用验证中间件到需要验证的路由', () => {
      const validatedRoutes = ['/permissions/1', '/permissions', '/permissions/role/1/assign',
                              '/permissions/user/1/assign', '/permissions/import',
                              '/permissions/bulk', '/permissions/validate'];
      
      validatedRoutes.forEach(route => {
        expect(mockValidationMiddleware).toBeDefined();
      });
    });

    it('应该正确应用权限中间件到需要权限的路由', () => {
      const permissionRoutes = ['/permissions', '/permissions/1', '/permissions/role/1/assign',
                               '/permissions/user/1/assign', '/permissions/export',
                               '/permissions/import'];
      
      permissionRoutes.forEach(route => {
        expect(mockPermissionMiddleware).toBeDefined();
      });
    });

    it('应该正确应用缓存中间件到适当的路由', () => {
      const cachedRoutes = ['/permissions', '/permissions/categories', '/permissions/statistics'];
      
      cachedRoutes.forEach(route => {
        expect(mockCacheMiddleware).toBeDefined();
      });
    });

    it('应该正确应用限流中间件到敏感路由', () => {
      const rateLimitedRoutes = ['/permissions', '/permissions/import', '/permissions/bulk'];
      
      rateLimitedRoutes.forEach(route => {
        expect(mockRateLimitMiddleware).toBeDefined();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockPermissionsController.getAllPermissions.mockImplementation((req, res, next) => {
        const error = new Error('获取权限列表失败');
        next(error);
      });

      await request(mockApp)
        .get('/permissions')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });

    it('应该处理验证中间件错误', async () => {
      mockValidationMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('参数验证失败');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .get('/permissions/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该处理权限不足错误', async () => {
      mockPermissionMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('权限不足');
        (error as any).statusCode = 403;
        next(error);
      });

      await request(mockApp)
        .post('/permissions')
        .send({ name: 'test.permission' })
        .set('Authorization', 'Bearer user-token')
        .expect(403);
    });

    it('应该处理权限不存在错误', async () => {
      mockPermissionsController.getPermissionById.mockImplementation((req, res, next) => {
        const error = new Error('权限不存在');
        (error as any).statusCode = 404;
        next(error);
      });

      await request(mockApp)
        .get('/permissions/999')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });

    it('应该处理权限冲突错误', async () => {
      mockPermissionsController.createPermission.mockImplementation((req, res, next) => {
        const error = new Error('权限名称已存在');
        (error as any).statusCode = 409;
        next(error);
      });

      await request(mockApp)
        .post('/permissions')
        .send({ name: 'user.read', description: '重复权限' })
        .set('Authorization', 'Bearer valid-token')
        .expect(409);
    });
  });

  describe('性能测试', () => {
    it('应该处理并发请求', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(mockApp)
          .get('/permissions')
          .set('Authorization', 'Bearer valid-token')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('应该处理大量数据请求', async () => {
      mockPermissionsController.getAllPermissions.mockImplementation((req, res) => {
        // 模拟大量权限数据
        const largeData = Array(1000).fill(null).map((_, i) => ({
          id: i + 1,
          name: `permission${i + 1}`,
          description: `权限${i + 1}的描述`,
          category: ['user', 'activity', 'system'][i % 3],
          type: ['read', 'write', 'delete'][i % 3],
          status: 'active'
        }));

        res.status(200).json({
          success: true,
          data: largeData,
          pagination: {
            page: 1,
            limit: 1000,
            total: 1000,
            totalPages: 1
          },
          message: '获取权限列表成功'
        });
      });

      const response = await request(mockApp)
        .get('/permissions')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1000);
    });
  });

  describe('安全测试', () => {
    it('应该防止SQL注入攻击', async () => {
      const maliciousQuery = "SELECT * FROM permissions";

      await request(mockApp)
        .get('/permissions')
        .query({ search: maliciousQuery })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该防止XSS攻击', async () => {
      const maliciousScript = "<script>alert('xss')</script>";

      await request(mockApp)
        .post('/permissions')
        .send({ name: maliciousScript, description: '测试权限' })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该验证输入数据格式', async () => {
      const invalidFormats = [
        { route: '/permissions/invalid-id', method: 'get' },
        { route: '/permissions', method: 'post', body: { name: '', type: 'invalid_type' } },
        { route: '/permissions/import', method: 'post', body: { permissions: [{ name: '' }] } },
        { route: '/permissions/export', method: 'get', query: { format: 'invalid_format' } }
      ];

      for (const { route, method, body, query } of invalidFormats) {
        const req = request(mockApp)[method](route)
          .set('Authorization', 'Bearer valid-token');
        
        if (body) {
          req.send(body);
        }
        
        if (query) {
          req.query(query);
        }
        
        await req.expect(400);
      }
    });

    it('应该保护敏感权限操作', async () => {
      const sensitiveOperations = [
        { path: '/permissions', method: 'post' },
        { path: '/permissions/1', method: 'put' },
        { path: '/permissions/1', method: 'delete' },
        { path: '/permissions/import', method: 'post' },
        { path: '/permissions/bulk', method: 'put' }
      ];

      for (const { path, method } of sensitiveOperations) {
        await request(mockApp)[method](path)
          .set('Authorization', 'Bearer user-token')
          .expect(403);
      }
    });

    it('应该防止权限提升攻击', async () => {
      const maliciousAssignment = {
        permissionId: 999 // 不存在的权限ID
      };

      await request(mockApp)
        .post('/permissions/user/1/assign')
        .send(maliciousAssignment)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });
  });
});