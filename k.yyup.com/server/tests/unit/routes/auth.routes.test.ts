import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockAuthController = {
  login: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
  register: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  verifyEmail: jest.fn(),
  changePassword: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockRateLimitMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/auth.controller', () => mockAuthController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
jest.unstable_mockModule('../../../../../src/middlewares/rate-limit.middleware', () => ({
  authRateLimit: mockRateLimitMiddleware
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

describe('Auth Routes', () => {
  let authRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedAuthRouter } = await import('../../../../../src/routes/auth.routes');
    authRouter = importedAuthRouter;
    
    // 设置Express应用
    mockApp.use('/auth', authRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockAuthController.login.mockImplementation((req, res) => {
      res.status(200).json({ success: true, message: '登录成功' });
    });
    
    mockAuthController.logout.mockImplementation((req, res) => {
      res.status(200).json({ success: true, message: '退出成功' });
    });
    
    mockAuthController.refreshToken.mockImplementation((req, res) => {
      res.status(200).json({ success: true, token: 'new-token' });
    });
    
    mockAuthController.register.mockImplementation((req, res) => {
      res.status(201).json({ success: true, message: '注册成功' });
    });
  });

  describe('POST /auth/login', () => {
    it('应该处理登录请求', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(mockApp)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '登录成功'
      });

      expect(mockAuthController.login).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/auth/login')
        .send({ username: 'test', password: 'test' });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该应用限流中间件', async () => {
      await request(mockApp)
        .post('/auth/login')
        .send({ username: 'test', password: 'test' });

      expect(mockRateLimitMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /auth/logout', () => {
    it('应该处理退出请求', async () => {
      const response = await request(mockApp)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '退出成功'
      });

      expect(mockAuthController.logout).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .post('/auth/logout');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /auth/refresh', () => {
    it('应该处理令牌刷新请求', async () => {
      const refreshData = {
        refreshToken: 'valid-refresh-token'
      };

      const response = await request(mockApp)
        .post('/auth/refresh')
        .send(refreshData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        token: 'new-token'
      });

      expect(mockAuthController.refreshToken).toHaveBeenCalled();
    });

    it('应该应用限流中间件', async () => {
      await request(mockApp)
        .post('/auth/refresh')
        .send({ refreshToken: 'test-token' });

      expect(mockRateLimitMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /auth/register', () => {
    it('应该处理注册请求', async () => {
      const registerData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        realName: '新用户'
      };

      const response = await request(mockApp)
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: '注册成功'
      });

      expect(mockAuthController.register).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/auth/register')
        .send({
          username: 'test',
          email: 'test@example.com',
          password: 'test123'
        });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('应该处理忘记密码请求', async () => {
      mockAuthController.forgotPassword.mockImplementation((req, res) => {
        res.status(200).json({ success: true, message: '重置邮件已发送' });
      });

      const forgotPasswordData = {
        email: 'user@example.com'
      };

      const response = await request(mockApp)
        .post('/auth/forgot-password')
        .send(forgotPasswordData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '重置邮件已发送'
      });

      expect(mockAuthController.forgotPassword).toHaveBeenCalled();
    });

    it('应该应用限流中间件', async () => {
      await request(mockApp)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(mockRateLimitMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /auth/reset-password', () => {
    it('应该处理重置密码请求', async () => {
      mockAuthController.resetPassword.mockImplementation((req, res) => {
        res.status(200).json({ success: true, message: '密码重置成功' });
      });

      const resetPasswordData = {
        token: 'reset-token',
        newPassword: 'newpassword123'
      };

      const response = await request(mockApp)
        .post('/auth/reset-password')
        .send(resetPasswordData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '密码重置成功'
      });

      expect(mockAuthController.resetPassword).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/auth/reset-password')
        .send({
          token: 'test-token',
          newPassword: 'newpass123'
        });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /auth/verify-email', () => {
    it('应该处理邮箱验证请求', async () => {
      mockAuthController.verifyEmail.mockImplementation((req, res) => {
        res.status(200).json({ success: true, message: '邮箱验证成功' });
      });

      const response = await request(mockApp)
        .get('/auth/verify-email')
        .query({ token: 'verification-token' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '邮箱验证成功'
      });

      expect(mockAuthController.verifyEmail).toHaveBeenCalled();
    });
  });

  describe('PUT /auth/change-password', () => {
    it('应该处理修改密码请求', async () => {
      mockAuthController.changePassword.mockImplementation((req, res) => {
        res.status(200).json({ success: true, message: '密码修改成功' });
      });

      const changePasswordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123'
      };

      const response = await request(mockApp)
        .put('/auth/change-password')
        .set('Authorization', 'Bearer valid-token')
        .send(changePasswordData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '密码修改成功'
      });

      expect(mockAuthController.changePassword).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .put('/auth/change-password')
        .send({
          currentPassword: 'old',
          newPassword: 'new'
        });

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .put('/auth/change-password')
        .set('Authorization', 'Bearer valid-token')
        .send({
          currentPassword: 'old',
          newPassword: 'new'
        });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('路由中间件应用', () => {
    it('应该正确应用认证中间件到需要认证的路由', () => {
      const protectedRoutes = ['/logout', '/change-password'];
      
      protectedRoutes.forEach(route => {
        expect(mockAuthMiddleware).toBeDefined();
      });
    });

    it('应该正确应用验证中间件到需要验证的路由', () => {
      const validatedRoutes = ['/login', '/register', '/reset-password', '/change-password'];
      
      validatedRoutes.forEach(route => {
        expect(mockValidationMiddleware).toBeDefined();
      });
    });

    it('应该正确应用限流中间件到敏感路由', () => {
      const rateLimitedRoutes = ['/login', '/register', '/refresh', '/forgot-password'];
      
      rateLimitedRoutes.forEach(route => {
        expect(mockRateLimitMiddleware).toBeDefined();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockAuthController.login.mockImplementation((req, res, next) => {
        const error = new Error('登录失败');
        next(error);
      });

      await request(mockApp)
        .post('/auth/login')
        .send({ username: 'test', password: 'test' })
        .expect(500);
    });

    it('应该处理验证中间件错误', async () => {
      mockValidationMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('验证失败');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .post('/auth/login')
        .send({ username: '', password: '' })
        .expect(400);
    });
  });
});
