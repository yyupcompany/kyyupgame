import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockUserController = {
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  changePassword: jest.fn(),
  uploadAvatar: jest.fn(),
  getUserRoles: jest.fn(),
  assignRoles: jest.fn(),
  removeRoles: jest.fn(),
  getUserPermissions: jest.fn(),
  resetPassword: jest.fn(),
  toggleUserStatus: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockPermissionMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockUploadMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/user.controller', () => mockUserController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
jest.unstable_mockModule('../../../../../src/middlewares/upload.middleware', () => ({
  uploadAvatar: mockUploadMiddleware
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

describe('User Routes', () => {
  let userRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedUserRouter } = await import('../../../../../src/routes/user.routes');
    userRouter = importedUserRouter;
    
    // 设置Express应用
    mockApp.use('/users', userRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockUserController.getUsers.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          users: [
            { id: 1, username: 'user1', realName: '用户1', email: 'user1@example.com' },
            { id: 2, username: 'user2', realName: '用户2', email: 'user2@example.com' }
          ],
          total: 2,
          page: 1,
          pageSize: 10
        }
      });
    });
    
    mockUserController.getUserById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          username: 'user1',
          realName: '用户1',
          email: 'user1@example.com',
          status: 'active'
        }
      });
    });
    
    mockUserController.createUser.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        message: '用户创建成功',
        data: {
          id: 3,
          username: req.body.username,
          realName: req.body.realName,
          email: req.body.email
        }
      });
    });
  });

  describe('GET /users', () => {
    it('应该获取用户列表', async () => {
      const response = await request(mockApp)
        .get('/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          users: expect.any(Array),
          total: 2,
          page: 1,
          pageSize: 10
        }
      });

      expect(mockUserController.getUsers).toHaveBeenCalled();
    });

    it('应该支持分页查询', async () => {
      await request(mockApp)
        .get('/users')
        .query({ page: 2, pageSize: 5 })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockUserController.getUsers).toHaveBeenCalled();
    });

    it('应该支持搜索功能', async () => {
      await request(mockApp)
        .get('/users')
        .query({ search: '用户1' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockUserController.getUsers).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .get('/users');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求用户查看权限', async () => {
      await request(mockApp)
        .get('/users')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /users/:id', () => {
    it('应该获取指定用户信息', async () => {
      const userId = 1;
      const response = await request(mockApp)
        .get(`/users/${userId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          username: 'user1',
          realName: '用户1',
          email: 'user1@example.com'
        })
      });

      expect(mockUserController.getUserById).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .get('/users/1');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求用户查看权限', async () => {
      await request(mockApp)
        .get('/users/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /users', () => {
    it('应该创建新用户', async () => {
      const userData = {
        username: 'newuser',
        realName: '新用户',
        email: 'newuser@example.com',
        password: 'password123',
        phone: '13800138000'
      };

      const response = await request(mockApp)
        .post('/users')
        .set('Authorization', 'Bearer valid-token')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: '用户创建成功',
        data: expect.objectContaining({
          username: 'newuser',
          realName: '新用户',
          email: 'newuser@example.com'
        })
      });

      expect(mockUserController.createUser).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/users')
        .set('Authorization', 'Bearer valid-token')
        .send({
          username: 'test',
          email: 'test@example.com'
        });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .post('/users')
        .send({ username: 'test' });

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求用户创建权限', async () => {
      await request(mockApp)
        .post('/users')
        .set('Authorization', 'Bearer valid-token')
        .send({ username: 'test' });

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /users/:id', () => {
    it('应该更新用户信息', async () => {
      const userId = 1;
      const updateData = {
        realName: '更新的用户名',
        email: 'updated@example.com',
        phone: '13900139000'
      };

      mockUserController.updateUser.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '用户更新成功',
          data: {
            id: userId,
            ...updateData
          }
        });
      });

      const response = await request(mockApp)
        .put(`/users/${userId}`)
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '用户更新成功',
        data: expect.objectContaining(updateData)
      });

      expect(mockUserController.updateUser).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .put('/users/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ realName: '测试' });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该要求用户更新权限', async () => {
      await request(mockApp)
        .put('/users/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ realName: '测试' });

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /users/:id', () => {
    it('应该删除用户', async () => {
      const userId = 1;

      mockUserController.deleteUser.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '用户删除成功'
        });
      });

      const response = await request(mockApp)
        .delete(`/users/${userId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '用户删除成功'
      });

      expect(mockUserController.deleteUser).toHaveBeenCalled();
    });

    it('应该要求用户删除权限', async () => {
      await request(mockApp)
        .delete('/users/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /users/profile', () => {
    it('应该获取当前用户资料', async () => {
      mockUserController.getUserProfile.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            id: 1,
            username: 'currentuser',
            realName: '当前用户',
            email: 'current@example.com',
            avatar: '/avatars/current.jpg'
          }
        });
      });

      const response = await request(mockApp)
        .get('/users/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          username: 'currentuser',
          realName: '当前用户',
          email: 'current@example.com'
        })
      });

      expect(mockUserController.getUserProfile).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .get('/users/profile');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /users/profile', () => {
    it('应该更新当前用户资料', async () => {
      const profileData = {
        realName: '更新的姓名',
        email: 'newemail@example.com',
        phone: '13800138001'
      };

      mockUserController.updateUserProfile.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '资料更新成功',
          data: profileData
        });
      });

      const response = await request(mockApp)
        .put('/users/profile')
        .set('Authorization', 'Bearer valid-token')
        .send(profileData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '资料更新成功',
        data: profileData
      });

      expect(mockUserController.updateUserProfile).toHaveBeenCalled();
    });
  });

  describe('PUT /users/change-password', () => {
    it('应该修改密码', async () => {
      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      mockUserController.changePassword.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '密码修改成功'
        });
      });

      const response = await request(mockApp)
        .put('/users/change-password')
        .set('Authorization', 'Bearer valid-token')
        .send(passwordData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '密码修改成功'
      });

      expect(mockUserController.changePassword).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .put('/users/change-password')
        .set('Authorization', 'Bearer valid-token')
        .send({
          currentPassword: 'old',
          newPassword: 'new',
          confirmPassword: 'new'
        });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /users/:id/avatar', () => {
    it('应该上传用户头像', async () => {
      const userId = 1;

      mockUserController.uploadAvatar.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '头像上传成功',
          data: {
            avatar: '/avatars/user1.jpg'
          }
        });
      });

      const response = await request(mockApp)
        .post(`/users/${userId}/avatar`)
        .set('Authorization', 'Bearer valid-token')
        .attach('avatar', Buffer.from('fake image data'), 'avatar.jpg')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '头像上传成功',
        data: expect.objectContaining({
          avatar: expect.any(String)
        })
      });

      expect(mockUploadMiddleware).toHaveBeenCalled();
      expect(mockUserController.uploadAvatar).toHaveBeenCalled();
    });
  });

  describe('GET /users/:id/roles', () => {
    it('应该获取用户角色', async () => {
      const userId = 1;

      mockUserController.getUserRoles.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            { id: 1, name: '管理员', code: 'admin' },
            { id: 2, name: '教师', code: 'teacher' }
          ]
        });
      });

      const response = await request(mockApp)
        .get(`/users/${userId}/roles`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: '管理员',
            code: 'admin'
          })
        ])
      });

      expect(mockUserController.getUserRoles).toHaveBeenCalled();
    });
  });

  describe('POST /users/:id/roles', () => {
    it('应该分配角色给用户', async () => {
      const userId = 1;
      const roleData = {
        roleIds: [1, 2, 3]
      };

      mockUserController.assignRoles.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '角色分配成功'
        });
      });

      const response = await request(mockApp)
        .post(`/users/${userId}/roles`)
        .set('Authorization', 'Bearer valid-token')
        .send(roleData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '角色分配成功'
      });

      expect(mockUserController.assignRoles).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/users/1/roles')
        .set('Authorization', 'Bearer valid-token')
        .send({ roleIds: [1, 2] });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockUserController.getUsers.mockImplementation((req, res, next) => {
        const error = new Error('数据库连接失败');
        next(error);
      });

      await request(mockApp)
        .get('/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });

    it('应该处理验证中间件错误', async () => {
      mockValidationMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('验证失败');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .post('/users')
        .set('Authorization', 'Bearer valid-token')
        .send({ username: '' })
        .expect(400);
    });

    it('应该处理权限中间件错误', async () => {
      mockPermissionMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('权限不足');
        (error as any).statusCode = 403;
        next(error);
      });

      await request(mockApp)
        .get('/users')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);
    });
  });
});
